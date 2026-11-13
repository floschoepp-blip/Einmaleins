/* Malmeister – Bildanalyse und Schritt-Darstellung
 * Reine Funktionen ohne DOM: laufen im Web Worker, im Hauptthread und in Node (Tests).
 * Ablauf: Foto -> Zuschnitt auf Gitter -> Graustufen -> Canny-Kanten in 2-3 Detailstufen
 *         -> Schatten-Stufen -> Darstellung der einzelnen Anleitungsschritte (RGBA). */
(function (root) {
  'use strict';

  /* Skizzen-Ebenen: dunkle Linien in drei Größen (grob -> fein). sigma = Linienbreite/Detailgröße, frac = Anteil Linien-Pixel */
  var LEVELS = {
    leicht: { grid: 3, layers: [{ sigma: 3.0, frac: 0.028, minLen: 45 }, { sigma: 1.9, frac: 0.040, minLen: 30 }], shade: false },
    mittel: { grid: 4, layers: [{ sigma: 3.0, frac: 0.028, minLen: 45 }, { sigma: 1.9, frac: 0.042, minLen: 28 }, { sigma: 1.15, frac: 0.050, minLen: 18 }], shade: false },
    profi:  { grid: 6, layers: [{ sigma: 3.0, frac: 0.030, minLen: 45 }, { sigma: 1.9, frac: 0.046, minLen: 26 }, { sigma: 1.15, frac: 0.058, minLen: 16 }], shade: true }
  };

  var COL = {
    paper: [255, 253, 247],
    prev:  [120, 128, 150],
    fresh: [255, 92, 56],
    dark:  [38, 40, 58],
    grid:  [70, 130, 255]
  };

  /* ---------- Grundbausteine ---------- */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function percentile(hist, total, p) {
    var target = total * p, acc = 0;
    for (var i = 0; i < hist.length; i++) { acc += hist[i]; if (acc >= target) return i; }
    return hist.length - 1;
  }

  /* Helligkeit, auf 0..255 gespreizt (2%-98%-Perzentil), damit dunkle/flaue Fotos gleich behandelt werden */
  function lumaStretch(rgba, n) {
    var g = new Float32Array(n), hist = new Uint32Array(256), i, v;
    for (i = 0; i < n; i++) {
      v = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
      g[i] = v; hist[v | 0]++;
    }
    var lo = percentile(hist, n, 0.02), hi = percentile(hist, n, 0.98);
    if (hi - lo < 30) { hi = lo + 30; }
    var k = 255 / (hi - lo);
    for (i = 0; i < n; i++) g[i] = clamp((g[i] - lo) * k, 0, 255);
    return g;
  }

  function gaussian(src, w, h, sigma) {
    var r = Math.max(1, Math.ceil(sigma * 3)), kern = new Float32Array(2 * r + 1), s = 0, i, j, x, y;
    for (i = -r; i <= r; i++) { kern[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); s += kern[i + r]; }
    for (i = 0; i < kern.length; i++) kern[i] /= s;
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h), acc, xx, yy, row;
    for (y = 0; y < h; y++) {
      row = y * w;
      for (x = 0; x < w; x++) {
        acc = 0;
        for (j = -r; j <= r; j++) { xx = x + j; xx = xx < 0 ? 0 : xx >= w ? w - 1 : xx; acc += src[row + xx] * kern[j + r]; }
        tmp[row + x] = acc;
      }
    }
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        acc = 0;
        for (j = -r; j <= r; j++) { yy = y + j; yy = yy < 0 ? 0 : yy >= h ? h - 1 : yy; acc += tmp[yy * w + x] * kern[j + r]; }
        out[y * w + x] = acc;
      }
    }
    return out;
  }

  /* Quadratische Verdickung (getrennt in zwei Durchgängen) */
  function dilateSquare(mask, w, h, r) {
    var tmp = new Uint8Array(w * h), out = new Uint8Array(w * h), x, y, j, hit, xx, yy;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      hit = 0;
      for (j = -r; j <= r && !hit; j++) { xx = x + j; if (xx >= 0 && xx < w && mask[y * w + xx]) hit = 1; }
      tmp[y * w + x] = hit;
    }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      hit = 0;
      for (j = -r; j <= r && !hit; j++) { yy = y + j; if (yy >= 0 && yy < h && tmp[yy * w + x]) hit = 1; }
      out[y * w + x] = hit;
    }
    return out;
  }

  /* Kreuzförmige Verdickung um 1 Pixel (für gut sichtbare Linien) */
  function dilatePlus(mask, w, h) {
    var out = new Uint8Array(w * h), x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x;
      if (mask[i] || (x > 0 && mask[i - 1]) || (x < w - 1 && mask[i + 1]) || (y > 0 && mask[i - w]) || (y < h - 1 && mask[i + w])) out[i] = 1;
    }
    return out;
  }

  /* Zusammenhängende Linienstücke unter minLen Pixeln entfernen (Bildrauschen) */
  function removeSmall(mask, w, h, minLen) {
    var n = w * h, seen = new Uint8Array(n), stack = new Int32Array(n), list = new Int32Array(n);
    var i, sp, cnt, j, k, x, y, xx, yy, d;
    for (i = 0; i < n; i++) {
      if (!mask[i] || seen[i]) continue;
      sp = 0; cnt = 0; stack[sp++] = i; seen[i] = 1;
      while (sp) {
        j = stack[--sp]; list[cnt++] = j; x = j % w; y = (j - x) / w;
        for (d = 0; d < 8; d++) {
          xx = x + (d === 0 || d === 3 || d === 5 ? -1 : d === 2 || d === 4 || d === 7 ? 1 : 0);
          yy = y + (d < 3 ? -1 : d > 4 ? 1 : 0);
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          k = yy * w + xx;
          if (mask[k] && !seen[k]) { seen[k] = 1; stack[sp++] = k; }
        }
      }
      if (cnt < minLen) for (j = 0; j < cnt; j++) mask[list[j]] = 0;
    }
    return mask;
  }

  /* Linien auf 1 Pixel Breite ausdünnen (Zhang-Suen) */
  function thin(mask, w, h) {
    var img = new Uint8Array(mask), changed = true, it = 0, step, x, y, i, k, list, p2, p3, p4, p5, p6, p7, p8, p9, B, A;
    while (changed && it++ < 30) {
      changed = false;
      for (step = 0; step < 2; step++) {
        list = [];
        for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
          i = y * w + x; if (!img[i]) continue;
          p2 = img[i - w]; p3 = img[i - w + 1]; p4 = img[i + 1]; p5 = img[i + w + 1]; p6 = img[i + w]; p7 = img[i + w - 1]; p8 = img[i - 1]; p9 = img[i - w - 1];
          B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
          A = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2); if (A !== 1) continue;
          if (step === 0) { if (p2 * p4 * p6 || p4 * p6 * p8) continue; } else { if (p2 * p4 * p8 || p2 * p6 * p8) continue; }
          list.push(i);
        }
        if (list.length) { changed = true; for (k = 0; k < list.length; k++) img[list[k]] = 0; }
      }
    }
    return img;
  }

  /* Drei Helligkeitsstufen (0 dunkel, 1 mittel, 2 hell) fürs Schraffieren */
  function toneMap(g, w, h) {
    var b = gaussian(g, w, h, 3.5), n = w * h, hist = new Uint32Array(256), i;
    for (i = 0; i < n; i++) hist[clamp(b[i] | 0, 0, 255)]++;
    var t1 = percentile(hist, n, 0.22), t2 = percentile(hist, n, 0.48), out = new Uint8Array(n);
    for (i = 0; i < n; i++) out[i] = b[i] < t1 ? 0 : b[i] < t2 ? 1 : 2;
    return out;
  }

  /* ---------- Vorverarbeitung für Gesichter und Motive ---------- */

  /* Weichzeichnen mit großem Radius auf verkleinertem Bild (schnell) */
  function blurBig(src, w, h, sigma) {
    var f = Math.max(1, Math.floor(sigma / 3));
    if (f === 1) return gaussian(src, w, h, sigma);
    var sw = Math.ceil(w / f), sh = Math.ceil(h / f), small = new Float32Array(sw * sh), cnt = new Float32Array(sw * sh), x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = ((y / f) | 0) * sw + ((x / f) | 0); small[i] += src[y * w + x]; cnt[i]++; }
    for (i = 0; i < small.length; i++) small[i] /= cnt[i];
    small = gaussian(small, sw, sh, sigma / f);
    var out = new Float32Array(w * h);
    for (y = 0; y < h; y++) {
      var v = (y + 0.5) / f - 0.5, vi = Math.floor(v), fy = v - vi, r0 = clamp(vi, 0, sh - 1) * sw, r1 = clamp(vi + 1, 0, sh - 1) * sw;
      for (x = 0; x < w; x++) {
        var u = (x + 0.5) / f - 0.5, ui = Math.floor(u), fx = u - ui, x0 = clamp(ui, 0, sw - 1), x1 = clamp(ui + 1, 0, sw - 1);
        out[y * w + x] = (small[r0 + x0] * (1 - fx) + small[r0 + x1] * fx) * (1 - fy) + (small[r1 + x0] * (1 - fx) + small[r1 + x1] * fx) * fy;
      }
    }
    return out;
  }

  /* Kleines Bild (Gleitkomma) auf Zielgröße hochskalieren */
  function resizeF(src, sw, sh, w, h) {
    var out = new Float32Array(w * h), x, y;
    for (y = 0; y < h; y++) {
      var v = (y + 0.5) * sh / h - 0.5, vi = Math.floor(v), fy = v - vi, r0 = clamp(vi, 0, sh - 1) * sw, r1 = clamp(vi + 1, 0, sh - 1) * sw;
      for (x = 0; x < w; x++) {
        var u = (x + 0.5) * sw / w - 0.5, ui = Math.floor(u), fx = u - ui, x0 = clamp(ui, 0, sw - 1), x1 = clamp(ui + 1, 0, sw - 1);
        out[y * w + x] = (src[r0 + x0] * (1 - fx) + src[r0 + x1] * fx) * (1 - fy) + (src[r1 + x0] * (1 - fx) + src[r1 + x1] * fx) * fy;
      }
    }
    return out;
  }

  /* Hautfarbe (YCbCr, ohne stark gesättigte Töne wie Orange) */
  function isSkin(r, g, b) {
    var Y = 0.299 * r + 0.587 * g + 0.114 * b, Cr = 128 + 0.5 * r - 0.4187 * g - 0.0813 * b, Cb = 128 - 0.1687 * r - 0.3313 * g + 0.5 * b;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
    return Y > 45 && Y < 248 && Cr >= 135 && Cr <= 172 && Cb >= 80 && Cb <= 126 && r > g && r > b && sat > 0.12 && sat < 0.55;
  }

  function morph(m, w, h, grow) {
    var out = new Uint8Array(w * h), x, y, dx, dy, hit, xx, yy;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      hit = grow ? 0 : 1;
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
        xx = x + dx; yy = y + dy;
        var v = (xx < 0 || yy < 0 || xx >= w || yy >= h) ? 0 : m[yy * w + xx];
        if (grow) { if (v) hit = 1; } else if (!v) hit = 0;
      }
      out[y * w + x] = hit;
    }
    return out;
  }

  /* Findet das Hauptmotiv: Gesicht über Hautfarbe (größter, mittigster Fleck). Liefert weiche Masken (0..1) für
   * "Motiv" (Kopf, Haare, Oberkörper) und "Gesicht". Ohne Gesicht: ovale Bildmitte. */
  function findSubject(rgb, w, h) {
    var f = Math.max(1, Math.round(Math.max(w, h) / 160)), sw = Math.max(8, Math.floor(w / f)), sh = Math.max(8, Math.floor(h / f)), x, y, i;
    var skin = new Uint8Array(sw * sh);
    for (y = 0; y < sh; y++) for (x = 0; x < sw; x++) {
      i = (Math.min(h - 1, y * f + (f >> 1)) * w + Math.min(w - 1, x * f + (f >> 1))) * 4;
      skin[y * sw + x] = isSkin(rgb[i], rgb[i + 1], rgb[i + 2]) ? 1 : 0;
    }
    skin = morph(morph(skin, sw, sh, false), sw, sh, true);
    var sg = new Float32Array(sw * sh);   // Helligkeit des kleinen Bildes für die Glattheits-Prüfung
    for (y = 0; y < sh; y++) for (x = 0; x < sw; x++) {
      i = (Math.min(h - 1, y * f + (f >> 1)) * w + Math.min(w - 1, x * f + (f >> 1))) * 4;
      sg[y * sw + x] = 0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2];
    }
    var seen = new Uint8Array(sw * sh), stack = new Int32Array(sw * sh), best = null, bestScore = 0, sp, j, k, dx, dy, c;
    for (i = 0; i < sw * sh; i++) {
      if (!skin[i] || seen[i]) continue;
      c = { area: 0, x0: sw, x1: 0, y0: sh, y1: 0, sx: 0, sy: 0, tex: 0 }; sp = 0; stack[sp++] = i; seen[i] = 1;
      while (sp) {
        j = stack[--sp]; x = j % sw; y = (j - x) / sw; c.area++; c.sx += x; c.sy += y;
        if (x < sw - 1) c.tex += Math.abs(sg[j] - sg[j + 1]);
        if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x; if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
        for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
          if (x + dx < 0 || y + dy < 0 || x + dx >= sw || y + dy >= sh) continue;
          k = j + dy * sw + dx; if (skin[k] && !seen[k]) { seen[k] = 1; stack[sp++] = k; }
        }
      }
      var cx = c.sx / c.area / sw - 0.5, cy = c.sy / c.area / sh - 0.5, fill = c.area / ((c.x1 - c.x0 + 1) * (c.y1 - c.y0 + 1));
      var tex = c.tex / c.area, asp = (c.y1 - c.y0 + 1) / (c.x1 - c.x0 + 1);
      var score = c.area * Math.exp(-(cx * cx + cy * cy) / (2 * 0.35 * 0.35)) * (fill > 0.4 ? 1 : 0.5) * (asp > 0.7 && asp < 2.6 ? 1 : 0.5) / (1 + tex * tex / 40);
      if (score > bestScore) { bestScore = score; best = c; }
    }
    var mask = new Float32Array(sw * sh), fmask = new Float32Array(sw * sh), face = null;
    if (best && best.area >= 0.004 * sw * sh) {
      var fw = best.x1 - best.x0 + 1, fh = Math.min(best.y1 - best.y0 + 1, 1.45 * fw), fcx = (best.x0 + best.x1 + 1) / 2, y0 = best.y0;
      face = { cx: fcx / sw, cy: (y0 + fh / 2) / sh, w: fw / sw, h: fh / sh };
      for (y = 0; y < sh; y++) for (x = 0; x < sw; x++) {
        var hx = (x - fcx) / (0.95 * fw), hy = (y - (y0 + 0.4 * fh)) / (0.95 * fh);
        var head = hx * hx + hy * hy < 1 ? 1 : 0;
        var body = (y > y0 + 0.9 * fh && Math.abs(x - fcx) < 1.8 * fw) ? 1 : 0;
        mask[y * sw + x] = Math.max(head, body);
        var ex = (x - fcx) / (0.62 * fw), ey = (y - (y0 + 0.5 * fh)) / (0.68 * fh);
        fmask[y * sw + x] = ex * ex + ey * ey < 1 ? 1 : 0;
      }
      mask = gaussian(mask, sw, sh, Math.max(1.5, 0.2 * fw)); fmask = gaussian(fmask, sw, sh, Math.max(1, 0.1 * fw));
    } else {
      for (y = 0; y < sh; y++) for (x = 0; x < sw; x++) {
        var ox = (x / sw - 0.5) / 0.4, oy = (y / sh - 0.5) / 0.46; mask[y * sw + x] = ox * ox + oy * oy < 1 ? 1 : 0;
      }
      mask = gaussian(mask, sw, sh, Math.max(2, 0.1 * sw));
    }
    return { mask: mask, fmask: fmask, sw: sw, sh: sh, face: face };
  }

  /* Dunkle Linien per Differenz zweier Weichzeichnungen (DoG), dann auf 1 Pixel ausgedünnt.
   * Das ergibt eine Skizze wie mit dem Bleistift: Augen, Brauen, Nase, Mund, Haarkante, Kleidungsfalten. */
  function inkLayer(gn, wgt, w, h, spec) {
    var n = w * h, a = gaussian(gn, w, h, spec.sigma), b = gaussian(gn, w, h, spec.sigma * 1.6), d = new Float32Array(n), i;
    for (i = 0; i < n; i++) d[i] = (b[i] - a[i]) * wgt[i];   // positiv = dunkler als die Umgebung
    var mx = 0; for (i = 0; i < n; i++) if (d[i] > mx) mx = d[i];
    var BINS = 512, hist = new Uint32Array(BINS), bw = (mx || 1) / BINS, bi;
    for (i = 0; i < n; i++) if (d[i] > 0) { bi = (d[i] / bw) | 0; hist[bi >= BINS ? BINS - 1 : bi]++; }
    var target = spec.frac * n, acc = 0, t = 2.5;
    for (bi = BINS - 1; bi >= 0; bi--) { acc += hist[bi]; if (acc >= target) { t = Math.max(2.5, bi * bw); break; } }
    /* Hysterese: schwache Linienteile bleiben, wenn sie an starke anschließen -> durchgehende Linien */
    var ink = new Uint8Array(n), lo = t * 0.45, stack = new Int32Array(n), sp, j, k, dx, dy;
    for (i = 0; i < n; i++) {
      if (d[i] < t || ink[i]) continue;
      sp = 0; stack[sp++] = i; ink[i] = 1;
      while (sp) {
        j = stack[--sp];
        for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
          k = j + dy * w + dx;
          if (k >= 0 && k < n && !ink[k] && d[k] >= lo) { ink[k] = 1; stack[sp++] = k; }
        }
      }
    }
    removeSmall(ink, w, h, spec.minLen);
    var sk = thin(ink, w, h);
    return removeSmall(sk, w, h, Math.max(8, spec.minLen >> 1));
  }

  /* ---------- Hauptfunktion ---------- */

  function gridFor(w, h, N) {
    var s = Math.max(2, Math.round(N * Math.min(w, h) / Math.max(w, h)));
    return w >= h ? { cols: N, rows: s } : { cols: s, rows: N };
  }

  function cropRGBA(rgba, w, h, cw, ch) {
    var ox = Math.floor((w - cw) / 2), oy = Math.floor((h - ch) / 2), out = new Uint8ClampedArray(cw * ch * 4), y;
    for (y = 0; y < ch; y++) out.set(rgba.subarray(((y + oy) * w + ox) * 4, ((y + oy) * w + ox + cw) * 4), y * cw * 4);
    return out;
  }

  /* Zellgröße in cm (halbe cm) für ein A4-Blatt mit 1 cm Rand */
  function cellCm(cols, rows) {
    var longCells = Math.max(cols, rows), shortCells = Math.min(cols, rows);
    var v = Math.min(27.7 / longCells, 19 / shortCells);
    return Math.max(1, Math.floor(v * 2) / 2);
  }

  /* opts: detail (0.5-1.6, Linienmenge), bg (0-1, Hintergrund unterdrücken) */
  function analyze(rgba, w, h, levelName, opts) {
    opts = opts || {};
    var detail = opts.detail == null ? 1 : opts.detail, bg = opts.bg == null ? 0.6 : opts.bg;
    var cfg = LEVELS[levelName] || LEVELS.mittel;
    var gd = gridFor(w, h, cfg.grid), aspect = gd.cols / gd.rows, cw = w, ch = h;
    if (w / h > aspect) { cw = Math.round(h * aspect); } else { ch = Math.round(w / aspect); }
    var rgb = (cw === w && ch === h) ? new Uint8ClampedArray(rgba) : cropRGBA(rgba, w, h, cw, ch);
    var n = cw * ch, g = lumaStretch(rgb, n), i, k, sc = Math.max(cw, ch) / 640;
    /* lokaler Kontrast: Gesichtszüge im Schatten werden sichtbar */
    var loc = blurBig(g, cw, ch, 22 * sc), gn = new Float32Array(n);
    for (i = 0; i < n; i++) gn[i] = clamp(0.5 * g[i] + 0.5 * (128 + (g[i] - loc[i]) * 1.7), 0, 255);
    /* Motiv finden: Hintergrund wird ruhiger gemacht und bekommt weniger Linien, das Gesicht mehr */
    var sub = findSubject(rgb, cw, ch), m = resizeF(sub.mask, sub.sw, sub.sh, cw, ch), fm = resizeF(sub.fmask, sub.sw, sub.sh, cw, ch);
    var soft = blurBig(gn, cw, ch, 5 * sc), wgt = new Float32Array(n), kf;
    for (i = 0; i < n; i++) {
      kf = (1 - m[i]) * bg * 0.75;
      gn[i] = (1 - kf) * gn[i] + kf * soft[i];
      wgt[i] = (1 - bg * 0.75 * (1 - m[i])) * (1 + 0.6 * fm[i]);
    }
    var layers = [], union = new Uint8Array(n), spec, e;
    for (k = 0; k < cfg.layers.length; k++) {
      var wk = new Float32Array(n), pw = 1 + 0.7 * k;
      for (i = 0; i < n; i++) wk[i] = Math.pow(wgt[i], pw);
      spec = { sigma: cfg.layers[k].sigma * sc, frac: cfg.layers[k].frac * detail, minLen: Math.max(6, Math.round(cfg.layers[k].minLen * sc * sc)) };
      e = inkLayer(gn, wk, cw, ch, spec);
      if (k > 0) {
        var near = dilateSquare(union, cw, ch, 2);
        for (i = 0; i < n; i++) if (near[i]) e[i] = 0;
        removeSmall(e, cw, ch, 10);
      }
      for (i = 0; i < n; i++) if (e[i]) union[i] = 1;
      layers.push(e);
    }
    return {
      w: cw, h: ch, cols: gd.cols, rows: gd.rows, level: levelName, cellCm: cellCm(gd.cols, gd.rows),
      rgb: rgb, layers: layers, tones: cfg.shade ? toneMap(gn, cw, ch) : null, face: sub.face
    };
  }

  /* ---------- Darstellung ---------- */

  function smooth(v, a, b) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* Maske (0/1) glatt auf Darstellungsgröße hochskalieren -> Alpha 0..255 (nur der gewählte Ausschnitt) */
  function upMask(mask, w, h, S, x0, y0, W, H) {
    var out = new Uint8Array(W * H), xi = new Int32Array(W), xj = new Int32Array(W), fx = new Float32Array(W), X, Y;
    for (X = 0; X < W; X++) {
      var u = (X + 0.5) / S + x0 - 0.5, ui = Math.floor(u);
      fx[X] = u - ui; xi[X] = clamp(ui, 0, w - 1); xj[X] = clamp(ui + 1, 0, w - 1);
    }
    for (Y = 0; Y < H; Y++) {
      var v = (Y + 0.5) / S + y0 - 0.5, vi = Math.floor(v), fy = v - vi;
      var r0 = clamp(vi, 0, h - 1) * w, r1 = clamp(vi + 1, 0, h - 1) * w;
      for (X = 0; X < W; X++) {
        var a = mask[r0 + xi[X]] * (1 - fx[X]) + mask[r0 + xj[X]] * fx[X];
        var b = mask[r1 + xi[X]] * (1 - fx[X]) + mask[r1 + xj[X]] * fx[X];
        out[Y * W + X] = (smooth(a * (1 - fy) + b * fy, 0.3, 0.7) * 255) | 0;
      }
    }
    return out;
  }

  function paint(out, alpha, col, strength) {
    var n = alpha.length, i, a, o;
    for (i = 0; i < n; i++) {
      a = alpha[i] * strength / 255;
      if (a <= 0) continue;
      o = i * 4;
      out[o]     += (col[0] - out[o])     * a;
      out[o + 1] += (col[1] - out[o + 1]) * a;
      out[o + 2] += (col[2] - out[o + 2]) * a;
    }
  }

  function orMasks(list, n) {
    var m = new Uint8Array(n), k, i;
    for (k = 0; k < list.length; k++) for (i = 0; i < n; i++) if (list[k][i]) m[i] = 1;
    return m;
  }

  /* Schraffur: Mitteltöne einfach, dunkle Stellen kreuzweise. Muster in Bild-Pixeln gerechnet (skalierungsunabhängig). */
  function hatch(out, m, S, x0, y0, W, H, col, strength) {
    var darkA = upMask(m.tones.map(function (t) { return t === 0 ? 1 : 0; }), m.w, m.h, S, x0, y0, W, H);
    var midA  = upMask(m.tones.map(function (t) { return t <= 1 ? 1 : 0; }), m.w, m.h, S, x0, y0, W, H);
    var P = 7, halfW = 0.55, X, Y, u, v, s1, s2, d, a1, a2, reg, line, i, o, al;
    for (Y = 0; Y < H; Y++) for (X = 0; X < W; X++) {
      i = Y * W + X;
      if (!midA[i]) continue;
      u = (X + 0.5) / S + x0; v = (Y + 0.5) / S + y0;
      s1 = (u + v) % P; d = Math.min(s1, P - s1) / 1.4142;
      a1 = clamp((halfW - d) * S + 0.5, 0, 1);
      a2 = 0;
      if (darkA[i]) {
        s2 = (u - v + 7000 * P) % P; d = Math.min(s2, P - s2) / 1.4142;
        a2 = clamp((halfW - d) * S + 0.5, 0, 1) * darkA[i] / 255;
      }
      line = Math.max(a1 * midA[i] / 255, a2);
      if (line <= 0) continue;
      al = line * strength; o = i * 4;
      out[o]     += (col[0] - out[o])     * al;
      out[o + 1] += (col[1] - out[o + 1]) * al;
      out[o + 2] += (col[2] - out[o + 2]) * al;
    }
  }

  function drawGrid(out, m, S, x0, y0, W, H, alpha) {
    var lw = Math.max(2, S * 0.9), c, r, pos, X, Y, from, to, o, d;
    function put(X, Y) { if (X < 0 || Y < 0 || X >= W || Y >= H) return; o = (Y * W + X) * 4;
      out[o] += (COL.grid[0] - out[o]) * alpha; out[o + 1] += (COL.grid[1] - out[o + 1]) * alpha; out[o + 2] += (COL.grid[2] - out[o + 2]) * alpha; }
    for (c = 0; c <= m.cols; c++) {
      pos = Math.round((c * m.w / m.cols - x0) * S);
      for (d = -Math.floor(lw / 2); d < Math.ceil(lw / 2); d++) for (Y = 0; Y < H; Y++) put(pos + d, Y);
    }
    for (r = 0; r <= m.rows; r++) {
      pos = Math.round((r * m.h / m.rows - y0) * S);
      for (d = -Math.floor(lw / 2); d < Math.ceil(lw / 2); d++) for (X = 0; X < W; X++) put(X, pos + d);
    }
  }

  /* spec: { mode: 'photo'|'lines'|'shade'|'final', upto: Anzahl Linienstufen, grid: bool, thin: bool }
   * region (optional): Ausschnitt in Bildpixeln {x0,y0,x1,y1}; S: Vergrößerung */
  function renderStep(m, spec, S, region) {
    var R = region || { x0: 0, y0: 0, x1: m.w, y1: m.h };
    var x0 = R.x0, y0 = R.y0, W = Math.round((R.x1 - x0) * S), H = Math.round((R.y1 - y0) * S);
    var out = new Float32Array(W * H * 4), i, X, Y;
    for (i = 0; i < W * H; i++) { out[i * 4] = COL.paper[0]; out[i * 4 + 1] = COL.paper[1]; out[i * 4 + 2] = COL.paper[2]; out[i * 4 + 3] = 255; }

    function layerMask(list) {
      var o = orMasks(list, m.w * m.h);
      return spec.thin ? o : dilatePlus(o, m.w, m.h);
    }
    function up(mask) { return upMask(mask, m.w, m.h, S, x0, y0, W, H); }

    if (spec.mode === 'photo') {
      var ox, oy, fx, fy, xi, yi, xj, yj, o00, o10, o01, o11, ch, u, v;
      for (Y = 0; Y < H; Y++) {
        v = (Y + 0.5) / S + y0 - 0.5; oy = Math.floor(v); fy = v - oy; yi = clamp(oy, 0, m.h - 1); yj = clamp(oy + 1, 0, m.h - 1);
        for (X = 0; X < W; X++) {
          u = (X + 0.5) / S + x0 - 0.5; ox = Math.floor(u); fx = u - ox; xi = clamp(ox, 0, m.w - 1); xj = clamp(ox + 1, 0, m.w - 1);
          o00 = (yi * m.w + xi) * 4; o10 = (yi * m.w + xj) * 4; o01 = (yj * m.w + xi) * 4; o11 = (yj * m.w + xj) * 4;
          for (ch = 0; ch < 3; ch++)
            out[(Y * W + X) * 4 + ch] = (m.rgb[o00 + ch] * (1 - fx) + m.rgb[o10 + ch] * fx) * (1 - fy) + (m.rgb[o01 + ch] * (1 - fx) + m.rgb[o11 + ch] * fx) * fy;
        }
      }
    } else if (spec.mode === 'lines') {
      var k = clamp(spec.upto || 1, 1, m.layers.length);
      if (k > 1) paint(out, up(layerMask(m.layers.slice(0, k - 1))), COL.prev, 1);
      paint(out, up(layerMask([m.layers[k - 1]])), COL.fresh, 1);
    } else if (spec.mode === 'shade') {
      paint(out, up(layerMask(m.layers)), COL.prev, 1);
      if (m.tones) hatch(out, m, S, x0, y0, W, H, COL.fresh, 0.9);
    } else { /* final */
      paint(out, up(layerMask(m.layers)), COL.dark, 1);
      if (m.tones) hatch(out, m, S, x0, y0, W, H, COL.dark, 0.5);
    }
    if (spec.grid) drawGrid(out, m, S, x0, y0, W, H, spec.mode === 'photo' ? 0.6 : 0.4);

    var res = new Uint8ClampedArray(W * H * 4);
    for (i = 0; i < res.length; i++) res[i] = out[i];
    return { w: W, h: H, data: res };
  }

  root.MS = { LEVELS: LEVELS, analyze: analyze, renderStep: renderStep, gridFor: gridFor, cellCm: cellCm, findSubject: findSubject };
})(typeof self !== 'undefined' ? self : globalThis);
