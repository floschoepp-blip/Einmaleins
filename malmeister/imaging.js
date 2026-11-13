/* Malmeister – Bildanalyse und Schritt-Darstellung
 * Reine Funktionen ohne DOM: laufen im Web Worker, im Hauptthread und in Node (Tests).
 * Ablauf: Foto -> Zuschnitt auf Gitter -> Graustufen -> Canny-Kanten in 2-3 Detailstufen
 *         -> Schatten-Stufen -> Darstellung der einzelnen Anleitungsschritte (RGBA). */
(function (root) {
  'use strict';

  var LEVELS = {
    leicht: { grid: 3, frac: [0.009, 0.017],        sigma: [3.4, 2.0],      minLen: [36, 22],     shade: false },
    mittel: { grid: 4, frac: [0.011, 0.020, 0.032], sigma: [3.4, 2.0, 1.1], minLen: [36, 22, 14], shade: false },
    profi:  { grid: 6, frac: [0.012, 0.022, 0.040], sigma: [3.4, 2.0, 1.1], minLen: [36, 22, 14], shade: true }
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

  /* ---------- Kantenerkennung (Canny) ---------- */

  function canny(g, w, h, sigma, frac, minLen) {
    var n = w * h, b = gaussian(g, w, h, sigma);
    var mag = new Float32Array(n), dir = new Uint8Array(n), maxM = 0;
    var x, y, i, gx, gy, ax, ay, m;
    for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
      i = y * w + x;
      gx = (b[i - w + 1] + 2 * b[i + 1] + b[i + w + 1]) - (b[i - w - 1] + 2 * b[i - 1] + b[i + w - 1]);
      gy = (b[i + w - 1] + 2 * b[i + w] + b[i + w + 1]) - (b[i - w - 1] + 2 * b[i - w] + b[i - w + 1]);
      m = Math.sqrt(gx * gx + gy * gy); mag[i] = m; if (m > maxM) maxM = m;
      ax = gx < 0 ? -gx : gx; ay = gy < 0 ? -gy : gy;
      dir[i] = ay <= ax * 0.4142 ? 0 : ay >= ax * 2.4142 ? 2 : ((gx > 0) === (gy > 0) ? 1 : 3);
    }
    var FLOOR = 15, nms = new Float32Array(n), a, c;
    for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
      i = y * w + x; m = mag[i];
      if (m < FLOOR) continue;
      switch (dir[i]) {
        case 0: a = mag[i - 1];     c = mag[i + 1];     break;
        case 1: a = mag[i - w - 1]; c = mag[i + w + 1]; break;
        case 2: a = mag[i - w];     c = mag[i + w];     break;
        default: a = mag[i - w + 1]; c = mag[i + w - 1];
      }
      if (m >= a && m > c) nms[i] = m;
    }
    /* Obere Schwelle so wählen, dass etwa "frac" aller Pixel als starke Kante übrig bleiben */
    var BINS = 1024, hist = new Uint32Array(BINS), bw = (maxM || 1) / BINS, bi;
    for (i = 0; i < n; i++) if (nms[i] > 0) { bi = (nms[i] / bw) | 0; if (bi >= BINS) bi = BINS - 1; hist[bi]++; }
    var target = frac * n, acc = 0, hi = FLOOR * 1.5;
    for (bi = BINS - 1; bi >= 0; bi--) { acc += hist[bi]; if (acc >= target) { hi = Math.max(hi, bi * bw); break; } }
    var lo = hi * 0.45;
    var out = new Uint8Array(n), stack = new Int32Array(n), sp, j, k, dx, dy;
    for (i = 0; i < n; i++) {
      if (nms[i] < hi || out[i]) continue;
      sp = 0; stack[sp++] = i; out[i] = 1;
      while (sp) {
        j = stack[--sp];
        for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
          k = j + dy * w + dx;
          if (k >= 0 && k < n && !out[k] && nms[k] >= lo) { out[k] = 1; stack[sp++] = k; }
        }
      }
    }
    return removeSmall(out, w, h, minLen);
  }

  /* Drei Helligkeitsstufen (0 dunkel, 1 mittel, 2 hell) fürs Schraffieren */
  function toneMap(g, w, h) {
    var b = gaussian(g, w, h, 3.5), n = w * h, hist = new Uint32Array(256), i;
    for (i = 0; i < n; i++) hist[clamp(b[i] | 0, 0, 255)]++;
    var t1 = percentile(hist, n, 0.22), t2 = percentile(hist, n, 0.48), out = new Uint8Array(n);
    for (i = 0; i < n; i++) out[i] = b[i] < t1 ? 0 : b[i] < t2 ? 1 : 2;
    return out;
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

  function analyze(rgba, w, h, levelName) {
    var cfg = LEVELS[levelName] || LEVELS.mittel;
    var gd = gridFor(w, h, cfg.grid), aspect = gd.cols / gd.rows, cw = w, ch = h;
    if (w / h > aspect) { cw = Math.round(h * aspect); } else { ch = Math.round(w / aspect); }
    var rgb = (cw === w && ch === h) ? new Uint8ClampedArray(rgba) : cropRGBA(rgba, w, h, cw, ch);
    var n = cw * ch, g = lumaStretch(rgb, n), layers = [], union = new Uint8Array(n), k, i;
    for (k = 0; k < cfg.frac.length; k++) {
      var e = canny(g, cw, ch, cfg.sigma[k], cfg.frac[k], cfg.minLen[k]);
      if (k > 0) {
        var near = dilateSquare(union, cw, ch, 3);
        for (i = 0; i < n; i++) if (near[i]) e[i] = 0;
        removeSmall(e, cw, ch, 10);
      }
      for (i = 0; i < n; i++) if (e[i]) union[i] = 1;
      layers.push(e);
    }
    return {
      w: cw, h: ch, cols: gd.cols, rows: gd.rows, level: levelName, cellCm: cellCm(gd.cols, gd.rows),
      rgb: rgb, layers: layers, tones: cfg.shade ? toneMap(g, cw, ch) : null
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

  root.MS = { LEVELS: LEVELS, analyze: analyze, renderStep: renderStep, canny: canny, gridFor: gridFor, cellCm: cellCm };
})(typeof self !== 'undefined' ? self : globalThis);
