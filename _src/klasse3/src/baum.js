  var BAUM = (function () {
  /* ---------- Bilder: Blaetter, Fruechte, Nadeln, Schaubilder (alles SVG, kein Download) ---------- */
  var ART = (function () {
    var G = '#5DA845', E = '#2E6B22';
    function f1(n) { return (Math.round(n * 10) / 10).toString(); }
    function poly(pts) { return 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join(' L') + ' Z'; }
    function wrap(inner, label) { return '<svg viewBox="0 0 100 100" role="img" aria-label="' + (label || 'Bild') + '">' + inner + '</svg>'; }
    function sideOutline(tip, base, W, env, mod) {
      var r = [], l = [], n = 140, i, t, y, w;
      for (i = 0; i <= n; i++) {
        t = i / n; y = tip + (base - tip) * t; w = W * env(t) * mod(t);
        r.push([50 + w, y]); l.unshift([50 - w, y]);
      }
      return { pts: r.concat(l), w: function (t) { return W * env(t) * mod(t); } };
    }
    function line(x1, y1, x2, y2, c, w, op) {
      return '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"' + (op ? ' stroke-opacity="' + op + '"' : '') + '/>';
    }
    function leafShape(tip, base, W, env, mod, veins, stem) {
      var o = sideOutline(tip, base, W, env, mod), s = '';
      s += line(50, base - 2, 50, base + stem, E, 2.6);
      s += '<path d="' + poly(o.pts) + '" fill="' + G + '" stroke="' + E + '" stroke-width="1.6" stroke-linejoin="round"/>';
      s += line(50, tip + 3, 50, base, E, 1.5, 0.75);
      veins.forEach(function (v) {
        var t = v[0], y = tip + (base - tip) * t, w = o.w(t) * 0.85, dy = v[1];
        s += line(50, y, 50 + w, y - dy, E, 1.1, 0.6) + line(50, y, 50 - w, y - dy, E, 1.1, 0.6);
      });
      return s;
    }

    function leaf(k) {
      var s = '', i;
      if (k === 'eiche') {
        s = leafShape(9, 82, 31, function (t) { return Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.7); },
          function (t) { return 0.42 + 0.58 * Math.pow(Math.abs(Math.cos(Math.PI * 4.5 * t)), 0.55); },
          [[0.222, 4], [0.444, 4], [0.667, 4], [0.889, 3]], 10);
      } else if (k === 'buche') {
        var bv = [];
        for (i = 0; i < 7; i++) bv.push([0.16 + i * 0.11, 7]);
        s = leafShape(10, 80, 24, function (t) { return Math.pow(Math.sin(Math.PI * Math.pow(t, 0.9)), 0.75); },
          function (t) { return 1 + 0.035 * Math.sin(Math.PI * 2 * 7 * t); }, bv, 12);
      } else if (k === 'birke') {
        s = leafShape(10, 64, 27, function (t) { return t < 0.72 ? Math.pow(t / 0.72, 0.95) : 0.06 + 0.94 * Math.cos((t - 0.72) / 0.28 * Math.PI / 2); },
          function (t) { return 1 - 0.09 * ((t * 15) % 1); }, [[0.3, 5], [0.5, 5], [0.7, 5]], 28);
      } else if (k === 'linde') {
        s = line(50, 72, 50, 95, E, 2.6) +
          '<path d="M50 8 C58 20 87 32 87 57 C87 76 70 86 56 79 C53 77 51 75 50 72 C48 75 45 78 40 80 C27 85 13 74 13 57 C13 35 42 20 50 8 Z" fill="' + G + '" stroke="' + E + '" stroke-width="1.6" stroke-linejoin="round"/>' +
          line(50, 72, 50, 14, E, 1.5, 0.75) + line(50, 72, 28, 40, E, 1.1, 0.6) + line(50, 72, 72, 40, E, 1.1, 0.6) +
          line(50, 72, 21, 62, E, 1.1, 0.6) + line(50, 72, 79, 62, E, 1.1, 0.6) + line(50, 52, 66, 30, E, 1, 0.5) + line(50, 52, 34, 30, E, 1, 0.5);
        var tz = '';
        for (i = 0; i < 20; i++) { var a = -2.4 + i * 0.25; tz += '<circle cx="' + f1(50 + 37 * Math.sin(a)) + '" cy="' + f1(52 - 37 * Math.cos(a) * 0.95) + '" r="1.3" fill="' + E + '" fill-opacity="0.35"/>'; }
        s += '';
      } else if (k === 'ahorn') {
        var lobes = [[0, 41], [52, 37], [-52, 37], [104, 25], [-104, 25]], pts = [], th, r, d, j, cx = 50, cy = 58;
        for (i = 0; i <= 360; i++) {
          th = -180 + i; r = 12;
          for (j = 0; j < lobes.length; j++) {
            d = Math.abs(th - lobes[j][0]);
            r += lobes[j][1] * Math.pow(Math.max(0, 1 - d / 25), 1.35);
            r += lobes[j][1] * 0.3 * Math.pow(Math.max(0, 1 - Math.abs(d - 15) / 6), 1.2);
          }
          if (Math.abs(th) > 150) r = Math.min(r, 6 + (180 - Math.abs(th)) * 0.2);
          pts.push([cx + r * Math.sin(th * Math.PI / 180), cy - r * Math.cos(th * Math.PI / 180)]);
        }
        s = line(50, 62, 50, 97, E, 2.6) + '<path d="' + poly(pts) + '" fill="' + G + '" stroke="' + E + '" stroke-width="1.6" stroke-linejoin="round"/>';
        lobes.forEach(function (L) { var rr = 12 + L[1] - 4, a = L[0] * Math.PI / 180; s += line(cx, cy, cx + rr * Math.sin(a), cy - rr * Math.cos(a), E, 1.3, 0.7); });
      } else if (k === 'kastanie') {
        var cxk = 50, cyk = 66, fl = [[0, 46], [36, 42], [-36, 42], [72, 33], [-72, 33], [108, 22], [-108, 22]];
        s = line(50, 66, 50, 97, E, 2.8);
        fl.forEach(function (F) {
          var a = F[0] * Math.PI / 180, L = F[1], R = [], Lf = [], n = 60, q, t, w, sx, sy;
          for (q = 0; q <= n; q++) {
            t = q / n; w = L * 0.23 * Math.pow(Math.sin(Math.PI * Math.pow(t, 1.5)), 0.8) * (1 + 0.04 * Math.sin(t * 40));
            R.push([w, 4 + L * t]); Lf.unshift([-w, 4 + L * t]);
          }
          var all = R.concat(Lf).map(function (p) {
            sx = p[0] * Math.cos(a) + p[1] * Math.sin(a); sy = p[0] * Math.sin(a) - p[1] * Math.cos(a);
            return [cxk + sx, cyk + sy];
          });
          s += '<path d="' + poly(all) + '" fill="' + G + '" stroke="' + E + '" stroke-width="1.4" stroke-linejoin="round"/>';
          s += line(cxk + 4 * Math.sin(a), cyk - 4 * Math.cos(a), cxk + (L + 1) * Math.sin(a), cyk - (L + 1) * Math.cos(a), E, 1.1, 0.7);
        });
      }
      return wrap(s, 'Blatt');
    }

    function fruit(k) {
      var s = '', i;
      if (k === 'eiche') {
        s = line(50, 22, 47, 6, '#6E4A22', 3) +
          '<path d="M31 40 C29 66 38 88 50 92 C62 88 71 66 69 40 Z" fill="#C8903F" stroke="#8A5A20" stroke-width="1.8"/>' +
          '<path d="M38 50 C37 66 41 78 46 84" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M26 44 C25 26 36 20 50 20 C64 20 75 26 74 44 C60 50 40 50 26 44 Z" fill="#7A5A30" stroke="#4E3518" stroke-width="1.8"/>';
        for (i = 0; i < 4; i++) s += '<path d="M' + (29 + i * 0) + ' ' + (28 + i * 5) + ' Q50 ' + (22 + i * 5) + ' ' + 71 + ' ' + (28 + i * 5) + '" fill="none" stroke="#4E3518" stroke-width="1" stroke-opacity="0.55" stroke-dasharray="2.5 2"/>';
        s += '<circle cx="50" cy="94" r="1.6" fill="#6E4A22"/>';
      } else if (k === 'buche') {
        var husk = '';
        [[-62, 'L'], [-24, 'L'], [24, 'R'], [62, 'R']].forEach(function (h) {
          var a = h[0] * Math.PI / 180, bx = 50, by = 86, L = 44, tx = bx + L * Math.sin(a), ty = by - L * Math.cos(a);
          var nx = Math.cos(a) * 8, ny = Math.sin(a) * 8;
          husk += '<path d="M' + f1(bx - nx * 0.7) + ' ' + f1(by - ny * 0.7) + ' Q' + f1((bx + tx) / 2 - nx) + ' ' + f1((by + ty) / 2 - ny) + ' ' + f1(tx) + ' ' + f1(ty) + ' Q' + f1((bx + tx) / 2 + nx) + ' ' + f1((by + ty) / 2 + ny) + ' ' + f1(bx + nx * 0.7) + ' ' + f1(by + ny * 0.7) + ' Z" fill="#A47B45" stroke="#6B4A22" stroke-width="1.5"/>';
          for (var q = 1; q < 6; q++) {
            var px = bx + (tx - bx) * q / 6, py = by + (ty - by) * q / 6;
            husk += line(px - nx * 0.8, py - ny * 0.8, px - nx * 1.4, py - ny * 1.4, '#6B4A22', 1) + line(px + nx * 0.8, py + ny * 0.8, px + nx * 1.4, py + ny * 1.4, '#6B4A22', 1);
          }
        });
        s = husk + line(50, 86, 50, 97, '#6B4A22', 2.6) +
          '<path d="M36 82 L45 34 L54 82 Z" fill="#7A4524" stroke="#4A2812" stroke-width="1.6" stroke-linejoin="round"/>' +
          '<path d="M47 82 L57 36 L66 82 Z" fill="#8C5530" stroke="#4A2812" stroke-width="1.6" stroke-linejoin="round"/>' +
          line(45, 40, 45, 78, '#fff', 1.2, 0.35) + line(57, 42, 57, 78, '#fff', 1.2, 0.35);
      } else if (k === 'kastanie') {
        var sp = '';
        for (i = 0; i < 13; i++) {
          var a2 = Math.PI * 0.05 + i * Math.PI * 0.9 / 12;
          sp += line(50 + 36 * Math.cos(a2), 60 + 30 * Math.sin(a2), 50 + 45 * Math.cos(a2), 60 + 38 * Math.sin(a2), '#5E8C2E', 1.6);
        }
        s = sp + '<path d="M13 58 A37 31 0 0 0 87 58 L80 60 A30 22 0 0 1 20 60 Z" fill="#8CC152" stroke="#5E8C2E" stroke-width="1.6"/>' +
          '<ellipse cx="50" cy="48" rx="27" ry="26" fill="#7B3F1A" stroke="#4A230C" stroke-width="1.8"/>' +
          '<path d="M30 60 Q50 76 70 60 Q66 70 50 73 Q34 70 30 60 Z" fill="#D9C29A"/>' +
          '<ellipse cx="40" cy="36" rx="8" ry="5" fill="#fff" fill-opacity="0.35" transform="rotate(-30 40 36)"/>';
      } else if (k === 'ahorn') {
        s = line(50, 74, 50, 90, '#7A6A30', 2.2) +
          '<path d="M46 72 C30 70 12 52 12 30 C20 32 34 46 50 66 Z" fill="#D7C27A" stroke="#9C8640" stroke-width="1.5"/>' +
          '<path d="M54 72 C70 70 88 52 88 30 C80 32 66 46 50 66 Z" fill="#D7C27A" stroke="#9C8640" stroke-width="1.5"/>' +
          '<path d="M44 66 C34 58 22 46 16 34 M56 66 C66 58 78 46 84 34" fill="none" stroke="#9C8640" stroke-width="1" stroke-opacity="0.7"/>' +
          '<ellipse cx="43" cy="71" rx="8" ry="6.5" fill="#A8924A" stroke="#7A6A30" stroke-width="1.5"/>' +
          '<ellipse cx="57" cy="71" rx="8" ry="6.5" fill="#A8924A" stroke="#7A6A30" stroke-width="1.5"/>';
      } else if (k === 'birke') {
        s = '<path d="M8 14 Q50 4 94 12" fill="none" stroke="#5A3A28" stroke-width="3" stroke-linecap="round"/>';
        [[26, 12, 50, -14], [50, 9, 60, 0], [72, 11, 46, 14]].forEach(function (c) {
          var x = c[0], y = c[1], L = c[2], r = c[3];
          s += '<g transform="rotate(' + r + ' ' + x + ' ' + y + ')">' + line(x, y, x, y + 6, '#5A3A28', 2) + '<rect x="' + (x - 6) + '" y="' + (y + 5) + '" width="12" height="' + L + '" rx="6" fill="#A08A4E" stroke="#6E5A2A" stroke-width="1.4"/>';
          for (var q = 0; q < (L - 8) / 6; q++) s += '<path d="M' + (x - 5) + ' ' + (y + 10 + q * 6) + ' Q' + x + ' ' + (y + 14 + q * 6) + ' ' + (x + 5) + ' ' + (y + 10 + q * 6) + '" fill="none" stroke="#6E5A2A" stroke-width="1" stroke-opacity="0.7"/>';
          s += '</g>';
        });
        s += '<g transform="translate(84 80)"><circle r="13" fill="#fff" stroke="#6E5A2A" stroke-width="1.6"/><path d="M-9 0 Q-4 -6 0 0 Q4 -6 9 0 Q4 4 0 1 Q-4 4 -9 0 Z" fill="#D7C27A" stroke="#9C8640" stroke-width="1"/><circle r="2" fill="#7A6A30"/></g>';
      } else if (k === 'linde') {
        s = '<path d="M24 10 C38 6 60 30 70 62 C62 64 40 40 24 10 Z" fill="#D8E59A" stroke="#9AAE4A" stroke-width="1.5"/>' +
          line(30, 16, 66, 58, '#9AAE4A', 1, 0.8) +
          '<path d="M47 37 L50 68 M50 68 L42 80 M50 68 L52 86 M50 68 L62 78" fill="none" stroke="#7A6A30" stroke-width="1.8" stroke-linecap="round"/>' +
          '<circle cx="42" cy="82" r="5" fill="#B9A36A" stroke="#7A6A30" stroke-width="1.4"/><circle cx="52" cy="88" r="5" fill="#B9A36A" stroke="#7A6A30" stroke-width="1.4"/><circle cx="62" cy="80" r="5" fill="#B9A36A" stroke="#7A6A30" stroke-width="1.4"/>';
      }
      return wrap(s, 'Frucht');
    }

    function scales(cx, top, bot, wmax, shape, col, dark) {
      var s = '', rows = 9, r, c, y, w, n;
      for (r = 0; r < rows; r++) {
        y = top + (bot - top) * (r + 0.5) / rows; w = wmax * shape((r + 0.5) / rows); n = 3;
        for (c = 0; c < n; c++) {
          var x = cx - w + (2 * w) * (c + 0.5 + (r % 2 ? 0.25 : -0.25)) / n;
          if (Math.abs(x - cx) > w - 2) continue;
          s += '<path d="M' + f1(x - 5) + ' ' + f1(y - 2) + ' Q' + f1(x) + ' ' + f1(y + 5) + ' ' + f1(x + 5) + ' ' + f1(y - 2) + '" fill="none" stroke="' + dark + '" stroke-width="1.2" stroke-opacity="0.8"/>';
        }
      }
      return s;
    }
    function cone(k) {
      var s = '', top, bot, shp, pts = [], i, t;
      if (k === 'fichte') {
        s += '<path d="M6 12 Q50 6 94 14" fill="none" stroke="#6E4A22" stroke-width="4" stroke-linecap="round"/>';
        for (i = 0; i < 9; i++) s += line(10 + i * 10, 11, 14 + i * 10, 3, '#2F6E3A', 1.8) + line(10 + i * 10, 13, 13 + i * 10, 20, '#2F6E3A', 1.8);
        top = 16; bot = 96; shp = function (t) { return Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.05)), 0.5) * (1 - 0.25 * t); };
      } else if (k === 'tanne') {
        s += '<path d="M6 90 Q50 96 94 88" fill="none" stroke="#6E4A22" stroke-width="4" stroke-linecap="round"/>';
        for (i = 0; i < 9; i++) s += line(10 + i * 10, 91, 10 + i * 10, 99, '#2E6B3A', 2.6) + line(10 + i * 10, 89, 12 + i * 10, 82, '#2E6B3A', 2.6);
        top = 8; bot = 88; shp = function (t) { return Math.pow(Math.sin(Math.PI * Math.min(1, (1 - t) * 1.0 + 0.04)), 0.45); };
      } else {
        s += line(50, 4, 50, 22, '#6E4A22', 3);
        top = 20; bot = 86; shp = function (t) { return Math.pow(Math.sin(Math.PI * t), 0.75); };
      }
      var W = k === 'kiefer' ? 22 : 15, R = [], L = [];
      for (i = 0; i <= 60; i++) { t = i / 60; var y = top + (bot - top) * t, w = W * shp(t); R.push([50 + w, y]); L.unshift([50 - w, y]); }
      s += '<path d="' + poly(R.concat(L)) + '" fill="' + (k === 'tanne' ? '#8C6A3E' : k === 'kiefer' ? '#8A6A44' : '#A0673A') + '" stroke="#5A3A18" stroke-width="1.6" stroke-linejoin="round"/>';
      if (k === 'kiefer') {
        for (i = 0; i < 6; i++) for (var j = 0; j < 4; j++) {
          var yy = 28 + i * 10, xx = 50 - 12 + j * 8 + (i % 2) * 4, ww = W * shp((yy - top) / (bot - top));
          if (Math.abs(xx - 50) > ww - 4) continue;
          s += '<path d="M' + xx + ' ' + (yy - 4) + ' L' + (xx + 4) + ' ' + yy + ' L' + xx + ' ' + (yy + 4) + ' L' + (xx - 4) + ' ' + yy + ' Z" fill="none" stroke="#5A3A18" stroke-width="1.1"/>';
        }
      } else s += scales(50, top, bot, W, shp, '', '#5A3A18');
      return wrap(s, 'Zapfen');
    }

    function needles(k) {
      var s = '', i, x, y, a, L;
      if (k === 'fichte') {
        for (i = 0; i < 24; i++) {
          x = 10 + i * 3.4; y = 62.5 - i * 0.68;
          s += line(x, y, x + 4, y - 10 + (i % 2) * 2, '#2F6E3A', 1.7) + line(x, y, x + 4, y + 9 - (i % 2) * 2, '#2F6E3A', 1.7) + line(x, y, x + 3, y - 3 + (i % 3) * 3, '#3E7E48', 1.7);
        }
        s = '<path d="M8 63 Q50 52 94 46" fill="none" stroke="#9A5A2C" stroke-width="3.2" stroke-linecap="round"/>' + s;
        s += '<g transform="translate(70 80)"><circle r="17" fill="#fff" stroke="#9A5A2C" stroke-width="2"/>' + line(-12, 4, 10, -4, '#2F6E3A', 3) + '<path d="M10 -4 L14 -5.5" stroke="#2F6E3A" stroke-width="1.5"/><text x="0" y="13" font-size="6.5" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#5A3A18">spitz</text></g>';
      } else if (k === 'tanne') {
        s = line(8, 50, 92, 50, '#7A5A3A', 3.4);
        for (i = 0; i < 20; i++) {
          x = 11 + i * 4.2;
          s += line(x, 49, x + 2.5, 36 + (i % 2) * 3, '#2E6B3A', 3.2) + line(x, 51, x + 2.5, 64 - (i % 2) * 3, '#2E6B3A', 3.2);
        }
        s += '<g transform="translate(70 82)"><circle r="16" fill="#fff" stroke="#7A5A3A" stroke-width="2"/><rect x="-12" y="-4" width="24" height="8" rx="4" fill="#2E6B3A"/>' + line(-9, -1.5, 9, -1.5, '#fff', 1.4) + line(-9, 1.5, 9, 1.5, '#fff', 1.4) + '<text x="0" y="12" font-size="5.5" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#5A3A18">unten</text></g>';
      } else if (k === 'kiefer') {
        s = '<path d="M10 92 Q40 60 84 20" fill="none" stroke="#B0602A" stroke-width="3.4" stroke-linecap="round"/>';
        for (i = 0; i < 6; i++) {
          x = 18 + i * 11; y = 84 - i * 11.4;
          a = (i % 2 ? 1 : -1);
          var b1 = (a > 0 ? 40 : -50) * Math.PI / 180, sp = 7 * Math.PI / 180;
          s += line(x, y, x + 32 * Math.cos(b1 - sp), y - 32 * Math.abs(Math.sin(b1 - sp)) * 0.9 - 6, '#4A7A55', 1.9);
          s += line(x, y, x + 32 * Math.cos(b1 + sp), y - 32 * Math.abs(Math.sin(b1 + sp)) * 0.9 - 6, '#4A7A55', 1.9);
          s += '<circle cx="' + x + '" cy="' + y + '" r="2" fill="#7A4E2A"/>';
        }
      } else if (k === 'laerche') {
        s = '<path d="M6 76 Q50 66 94 72" fill="none" stroke="#8A6A4A" stroke-width="3.2" stroke-linecap="round"/>';
        [[18, 74], [40, 70], [62, 69], [84, 71]].forEach(function (p) {
          for (var q = 0; q < 15; q++) {
            var ang = (-70 + q * 10) * Math.PI / 180, Ln = 13 + (q % 3) * 2;
            s += line(p[0], p[1] - 2, p[0] + Ln * Math.sin(ang), p[1] - 2 - Ln * Math.cos(ang), '#8BC34A', 1.6);
          }
          s += '<circle cx="' + p[0] + '" cy="' + (p[1] - 1) + '" r="2.4" fill="#6B4A2A"/>';
        });
        s += '<ellipse cx="50" cy="38" rx="0" ry="0"/>';
      }
      return wrap(s, 'Nadeln');
    }

    function parts(hl, labels) {
      var s = '<rect x="0" y="0" width="100" height="70" fill="#EAF6FF"/><rect x="0" y="70" width="100" height="30" fill="#C9A27A"/>' + line(0, 70, 100, 70, '#7CB342', 3);
      s += '<path d="M50 72 Q40 80 26 90 M50 72 Q44 86 38 97 M51 72 Q56 86 62 97 M51 72 Q62 80 76 88 M50 74 L50 98" fill="none" stroke="#7A4E2A" stroke-width="3" stroke-linecap="round"/>';
      s += '<path d="M44 72 L46.5 38 L53.5 38 L56 72 Z" fill="#8B5A2B" stroke="#5E3A18" stroke-width="1.2"/>';
      s += line(48, 50, 58, 36, '#7A4E2A', 2.6);
      [[50, 19, 16], [35, 28, 13], [65, 28, 13], [43, 36, 11], [58, 37, 11], [50, 8, 9]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#5DA845"/>'; });
      [[44, 16, 5], [60, 24, 4], [38, 30, 3.5]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#7CC35A"/>'; });
      s += line(47, 52, 12, 42, '#7A4E2A', 3) + line(22, 45, 16, 36, '#7A4E2A', 1.8);
      s += '<circle cx="12" cy="41" r="4" fill="#5DA845"/><circle cx="16" cy="35" r="3" fill="#5DA845"/>';
      var Y = 'fill="none" stroke="#FF8F00" stroke-width="2.6" stroke-dasharray="4 3"';
      var H = {
        krone: '<ellipse cx="50" cy="22" rx="31" ry="22" ' + Y + '/>',
        stamm: '<rect x="41" y="37" width="18" height="36" rx="3" ' + Y + '/>',
        wurzel: '<ellipse cx="51" cy="86" rx="29" ry="13" ' + Y + '/>',
        ast: '<ellipse cx="28" cy="46" rx="21" ry="6" transform="rotate(16 28 46)" ' + Y + '/>'
      };
      var M = { krone: [88, 10], stamm: [74, 56], wurzel: [90, 84], ast: [10, 60] };
      if (hl && H[hl]) {
        s += H[hl] + '<circle cx="' + M[hl][0] + '" cy="' + M[hl][1] + '" r="7" fill="#FFC233" stroke="#B26A00" stroke-width="1.5"/><text x="' + M[hl][0] + '" y="' + (M[hl][1] + 3.6) + '" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#3A2A00">?</text>';
      }
      if (labels) {
        [['Krone', 74, 8], ['Ast', 4, 60], ['Stamm', 64, 56], ['Wurzel', 70, 82]].forEach(function (l) {
          var w = l[0].length * 4.3 + 6;
          s += '<rect x="' + (l[1] - 2) + '" y="' + (l[2] - 6) + '" width="' + w + '" height="9" rx="3" fill="#fff" fill-opacity="0.9" stroke="#2E6B22" stroke-width="0.8"/><text x="' + (l[1] + 1) + '" y="' + (l[2] + 0.8) + '" font-size="6.6" font-family="sans-serif" font-weight="800" fill="#1E3A14">' + l[0] + '</text>';
        });
      }
      return wrap(s, 'Teile eines Baumes');
    }

    var LAYERS = { baum: [2, 38], strauch: [38, 60], kraut: [60, 72], moos: [72, 78], wurzel: [78, 99] };
    var LAYER_NAMES = { baum: 'Baumschicht', strauch: 'Strauchschicht', kraut: 'Krautschicht', moos: 'Moosschicht', wurzel: 'Wurzelschicht' };
    function forest(hl, labels) {
      var s = '<rect width="100" height="78" fill="#EAF6FF"/><rect y="78" width="100" height="22" fill="#B98A5E"/>', i;
      s += '<path d="M14 80 Q12 88 6 94 M14 80 Q18 90 22 96 M58 80 Q54 90 50 97 M58 80 Q64 88 70 94 M86 80 Q88 90 94 95" fill="none" stroke="#6B4423" stroke-width="2" stroke-linecap="round"/>';
      s += '<path d="M30 92 q4 -4 8 0 q4 4 8 0" fill="none" stroke="#E58A9A" stroke-width="2" stroke-linecap="round"/>';
      [[14, 4], [58, 4.5], [86, 3.5]].forEach(function (t) { s += '<rect x="' + (t[0] - t[1] / 2) + '" y="22" width="' + t[1] + '" height="57" fill="#7A4E2A"/>'; });
      [[14, 16, 13], [6, 24, 8], [24, 22, 9], [58, 14, 15], [48, 22, 9], [70, 22, 10], [86, 18, 12], [95, 26, 7]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#3F8A3A"/>'; });
      [[34, 52, 9], [42, 50, 8], [38, 44, 7], [74, 54, 7], [80, 50, 8]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#6FA94A"/>'; });
      for (i = 0; i < 9; i++) {
        var x = 6 + i * 11;
        s += '<path d="M' + x + ' 73 L' + (x - 3) + ' 63 M' + x + ' 73 L' + x + ' 61 M' + x + ' 73 L' + (x + 3) + ' 64" stroke="#7CB342" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
        if (i % 2) s += '<circle cx="' + x + '" cy="61" r="2" fill="' + ['#F5D33F', '#E86A9A', '#FFFFFF', '#9B7FE0'][i % 4] + '"/>';
      }
      s += '<rect y="73" width="100" height="5.5" fill="#5E9A3A"/>';
      for (i = 0; i < 20; i++) s += '<circle cx="' + (2.5 + i * 5) + '" cy="73.5" r="2.6" fill="#6FAE44"/>';
      if (hl && LAYERS[hl]) {
        var L = LAYERS[hl];
        s += '<rect x="1" y="' + L[0] + '" width="98" height="' + (L[1] - L[0]) + '" rx="2.5" fill="#FFC233" fill-opacity="0.32" stroke="#FF8F00" stroke-width="1.8"/>';
        var my = (L[0] + L[1]) / 2;
        s += '<circle cx="92" cy="' + my + '" r="6" fill="#FFC233" stroke="#B26A00" stroke-width="1.4"/><text x="92" y="' + (my + 3.2) + '" font-size="9" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#3A2A00">?</text>';
      }
      if (labels) {
        ['baum', 'strauch', 'kraut', 'moos', 'wurzel'].forEach(function (k) {
          var L = LAYERS[k], my = k === 'moos' ? 75.5 : (L[0] + L[1]) / 2, t = LAYER_NAMES[k], w = t.length * 3.5 + 5;
          s += line(0, L[1], 100, L[1], '#1E3A14', 0.5, 0.5);
          s += '<rect x="' + (99 - w) + '" y="' + (my - 4) + '" width="' + w + '" height="7.5" rx="2.5" fill="#fff" fill-opacity="0.92" stroke="#2E6B22" stroke-width="0.6"/><text x="' + (99 - w + 2.5) + '" y="' + (my + 1.6) + '" font-size="5.4" font-family="sans-serif" font-weight="800" fill="#1E3A14">' + t + '</text>';
        });
      }
      return wrap(s, 'Stockwerke des Waldes');
    }

    function rings(n) {
      var s = '<circle cx="50" cy="50" r="46" fill="#6B4423"/><circle cx="50" cy="50" r="42" fill="#EBCB98"/>', i;
      for (i = n; i >= 1; i--) {
        var r = 42 * i / (n + 0.4);
        s += '<circle cx="' + (50 + (n - i) * 0.25) + '" cy="50" r="' + f1(r) + '" fill="' + (i % 2 ? '#E2B97C' : '#EBCB98') + '" stroke="#8B5A2B" stroke-width="1.8"/>';
      }
      s += '<circle cx="' + (50 + n * 0.25) + '" cy="50" r="2" fill="#8B5A2B"/>';
      return wrap(s, 'Baumscheibe mit Jahresringen');
    }

    return { leaf: leaf, fruit: fruit, cone: cone, needles: needles, parts: parts, forest: forest, rings: rings, LAYER_NAMES: LAYER_NAMES };
  })();

  /* ---------- Baum-Wissen ---------- */
  var T = {
    eiche:    { n: 'Eiche',    zu: 'zur Eiche',    gen: 'der Eiche',    typ: 'laub',  blatt: 'gelappt mit runden Buchten, kurzer Stiel', frucht: 'Eichel, sitzt in einem Hütchen (Becher)', rinde: 'dick und grau mit tiefen Rissen', merke: 'Kann über 1000 Jahre alt werden.' },
    buche:    { n: 'Buche',    zu: 'zur Buche',    gen: 'der Buche',    typ: 'laub',  blatt: 'eiförmig, glatter, leicht welliger Rand, gerade Adern', frucht: 'Bucheckern: dreikantig, in einer stacheligen Hülle', rinde: 'glatt und silbergrau', merke: 'Häufigster Laubbaum in Deutschland.' },
    ahorn:    { n: 'Ahorn',    zu: 'zum Ahorn',    gen: 'des Ahorns',   typ: 'laub',  blatt: 'handförmig mit 5 spitzen Lappen', frucht: 'Flügelfrüchte, fliegen wie ein Propeller („Nasenzwicker“)', rinde: 'grau, bei älteren Bäumen schuppig', merke: 'Ein Ahornblatt ist auf der Flagge von Kanada.' },
    kastanie: { n: 'Kastanie', zu: 'zur Kastanie', gen: 'der Kastanie', typ: 'laub',  blatt: 'gefingert: 5 bis 7 Teilblätter an einem Stiel', frucht: 'glänzend braune Kastanie in einer grünen, stacheligen Hülle', rinde: 'graubraun, später schuppig', merke: 'Die Rosskastanie ist für Menschen nicht zum Essen.' },
    birke:    { n: 'Birke',    zu: 'zur Birke',    gen: 'der Birke',    typ: 'laub',  blatt: 'dreieckig bis rautenförmig, gesägter Rand', frucht: 'Kätzchen: hängende Würstchen mit winzigen Samen, die kleine Flügel haben und mit dem Wind fliegen', rinde: 'weiß mit schwarzen Stellen, löst sich in dünnen Schichten wie Papier ab', merke: 'Dünne Zweige hängen nach unten. Sie wächst schnell und als einer der ersten Bäume auf freien Flächen (Pionierbaum).' },
    linde:    { n: 'Linde',    zu: 'zur Linde',    gen: 'der Linde',    typ: 'laub',  blatt: 'herzförmig, gesägter Rand', frucht: 'kleine Nüsschen an einem hellen Flügelblatt', rinde: 'graubraun mit feinen Längsrissen', merke: 'Aus den Lindenblüten macht man Tee.' },
    fichte:   { n: 'Fichte',   zu: 'zur Fichte',   gen: 'der Fichte',   typ: 'nadel', blatt: 'spitze Nadeln, die stechen, rund um den Zweig', frucht: 'Zapfen hängen nach unten und fallen ganz herunter', rinde: 'rotbraun, schuppig', merke: 'Fichte sticht, Tanne nicht! Häufigster Baum in Deutschland.' },
    tanne:    { n: 'Tanne',    zu: 'zur Tanne',    gen: 'der Tanne',    typ: 'nadel', blatt: 'weiche, stumpfe Nadeln mit zwei weißen Streifen unten, wie gekämmt in zwei Reihen', frucht: 'Zapfen stehen aufrecht und zerfallen am Baum', rinde: 'hellgrau, fast weiß', merke: 'Ganze Tannenzapfen findet man nicht am Boden.' },
    kiefer:   { n: 'Kiefer',   zu: 'zur Kiefer',   gen: 'der Kiefer',   typ: 'nadel', blatt: 'lange Nadeln, immer zu zweit', frucht: 'kleine, eiförmige Zapfen', rinde: 'oben orange-rot, unten dick und grau', merke: 'Wächst auch auf trockenem, sandigem Boden.' },
    laerche:  { n: 'Lärche',   zu: 'zur Lärche',   gen: 'der Lärche',   typ: 'nadel', blatt: 'weiche Nadeln in Büscheln', frucht: 'kleine, runde Zapfen', rinde: 'graubraun, rissig', merke: 'Einziger Nadelbaum, der im Herbst seine Nadeln verliert. Vorher werden sie gelb.' }
  };
  var LAUB = ['eiche', 'buche', 'ahorn', 'kastanie', 'birke', 'linde'];
  var NADEL = ['fichte', 'tanne', 'kiefer', 'laerche'];
  var FRUIT = ['eiche', 'buche', 'ahorn', 'kastanie', 'birke', 'linde'];
  var FRUIT_NAME = { eiche: 'Eichel', buche: 'Buchecker', ahorn: 'Flügelfrucht', kastanie: 'Kastanie' };
  var CATS = [
    { id: 'laub', name: 'Laubbäume' },
    { id: 'frucht', name: 'Früchte' },
    { id: 'nadel', name: 'Nadelbäume' },
    { id: 'wald', name: 'Baum & Wald' }
  ];
  var PARTS = { krone: 'Krone', stamm: 'Stamm', wurzel: 'Wurzel', ast: 'Ast' };
  var PART_TIP = { krone: 'Die Krone besteht aus Ästen, Zweigen und Blättern.', stamm: 'Der Stamm trägt die Krone und leitet das Wasser nach oben.', wurzel: 'Die Wurzeln halten den Baum fest und holen Wasser aus dem Boden.', ast: 'Aus dem Stamm wachsen Äste, aus den Ästen Zweige.' };
  var LAYER_TIP = { baum: 'Ganz oben: die Kronen der großen Bäume.', strauch: 'Sträucher wie Haselnuss und Holunder, auch junge Bäume.', kraut: 'Farne, Gräser und Waldblumen.', moos: 'Moose, Pilze und Flechten direkt am Boden. Moos speichert Wasser wie ein Schwamm.', wurzel: 'Unter der Erde: Wurzeln, Würmer und Käfer.' };

  /* Wissensfragen: erste Antwort ist richtig, wird beim Anzeigen gemischt */
  var FACTS = [
    ['b1', 'laub', 'Was passiert mit der weißen Rinde der Birke?', ['Sie löst sich in dünnen Schichten wie Papier ab', 'Sie wird im Herbst rot', 'Sie bekommt tiefe Risse wie die Eiche', 'Sie wird grün'], 'Die Birkenrinde löst sich in dünnen, papierartigen Streifen ab.'],
    ['b2', 'frucht', 'Wie kommen die Samen der Birke weit weg?', ['Sie haben kleine Flügel und fliegen mit dem Wind', 'Eichhörnchen vergraben sie', 'Sie rollen den Berg hinunter', 'Sie schwimmen im Bach'], 'Birkensamen sind winzig und haben kleine Flügel. Der Wind trägt sie weit.'],
    ['b3', 'laub', 'Wie wachsen die Zweige der Birke?', ['Dünn, sie hängen nach unten', 'Dick, sie stehen steil nach oben', 'Sie hat gar keine Zweige', 'Sie haben Stacheln'], 'Die dünnen Zweige der Birke hängen nach unten (Hängebirke).'],
    ['b4', 'laub', 'Warum nennt man die Birke einen Pionierbaum?', ['Sie wächst als einer der ersten Bäume auf freien Flächen', 'Sie ist der höchste Baum im Wald', 'Sie wächst nur in den Bergen', 'Sie hat Nadeln und Blätter'], 'Die Birke wächst schnell und braucht wenig. Sie erobert freie Flächen als Erste.'],
    ['b5', 'frucht', 'Wie heißen die hängenden „Würstchen“ an der Birke?', ['Kätzchen', 'Zapfen', 'Eicheln', 'Nüsschen'], 'An der Birke hängen Kätzchen. Darin sind die winzigen Flügelsamen.'],
    ['n1', 'nadel', 'Fichte sticht, …', ['Tanne nicht', 'Kiefer nicht', 'Lärche auch', 'Buche auch'], 'Merksatz: Fichte sticht, Tanne nicht. Die Tannennadeln sind stumpf und weich.'],
    ['n2', 'nadel', 'Bei welchem Baum stehen die Zapfen aufrecht auf dem Zweig?', ['Tanne', 'Fichte', 'Kiefer', 'Lärche'], 'Tannenzapfen stehen wie Kerzen nach oben. Fichtenzapfen hängen nach unten.'],
    ['n3', 'nadel', 'Bei welchem Baum hängen die langen Zapfen nach unten?', ['Fichte', 'Tanne', 'Buche', 'Linde'], 'Fichtenzapfen hängen nach unten und fallen als Ganzes auf den Boden.'],
    ['n4', 'nadel', 'Warum findet man am Boden keine ganzen Tannenzapfen?', ['Sie zerfallen schon oben am Baum', 'Die Tanne hat keine Zapfen', 'Sie bleiben für immer am Baum', 'Der Wind trägt sie weg'], 'Der Tannenzapfen zerfällt am Baum. Am Boden liegen fast immer Fichtenzapfen.'],
    ['n5', 'nadel', 'Welcher Nadelbaum verliert im Herbst seine Nadeln?', ['Lärche', 'Fichte', 'Tanne', 'Kiefer'], 'Die Lärche wird im Herbst gelb und wirft ihre Nadeln ab.'],
    ['n6', 'nadel', 'Bei welchem Baum wachsen immer zwei lange Nadeln zusammen?', ['Kiefer', 'Fichte', 'Tanne', 'Lärche'], 'Bei der Kiefer sitzen immer zwei lange Nadeln zusammen.'],
    ['n7', 'nadel', 'Woran erkennst du die Tanne?', ['Zwei weiße Streifen unter den Nadeln', 'Weiße Rinde mit schwarzen Stellen', 'Nadeln stechen sehr', 'Zapfen hängen nach unten'], 'Dreh einen Tannenzweig um: Unter jeder Nadel sind zwei weiße Streifen.'],
    ['n8', 'nadel', 'Die meisten Nadelbäume sind immergrün. Das heißt:', ['Sie behalten ihre Nadeln auch im Winter', 'Ihre Zapfen sind immer grün', 'Sie haben grüne Rinde', 'Sie wachsen nur im Sommer'], 'Immergrün: Die Nadeln bleiben im Winter am Baum (außer bei der Lärche).'],
    ['n9', 'nadel', 'Welcher Baum wächst in Deutschland am häufigsten?', ['Fichte', 'Tanne', 'Linde', 'Birke'], 'Die Fichte ist der häufigste Baum in deutschen Wäldern.'],
    ['l1', 'laub', 'Welcher Baum hat eine weiße Rinde mit schwarzen Stellen?', ['Birke', 'Buche', 'Eiche', 'Fichte'], 'Die Birke erkennt man sofort an der weißen Rinde.'],
    ['l2', 'laub', 'Welcher Baum hat eine glatte, silbergraue Rinde?', ['Buche', 'Eiche', 'Birke', 'Kiefer'], 'Die Rinde der Buche ist glatt und silbergrau. Die Eiche hat tiefe Risse.'],
    ['l3', 'laub', 'Welcher Baum hat herzförmige Blätter?', ['Linde', 'Ahorn', 'Eiche', 'Birke'], 'Das Lindenblatt sieht aus wie ein Herz.'],
    ['l4', 'laub', 'Welcher Baum hat gefingerte Blätter mit 5 bis 7 Teilblättern?', ['Kastanie', 'Ahorn', 'Linde', 'Buche'], 'Das Kastanienblatt sieht aus wie eine Hand mit vielen Fingern.'],
    ['l5', 'laub', 'Welcher Baum hat Blätter mit 5 spitzen Lappen?', ['Ahorn', 'Kastanie', 'Eiche', 'Birke'], 'Das Ahornblatt ist handförmig mit spitzen Lappen.'],
    ['l6', 'laub', 'Laubbäume haben …', ['breite, flache Blätter', 'spitze Nadeln', 'keine Wurzeln', 'nur Zapfen'], 'Laubbäume haben breite Blätter, Nadelbäume haben Nadeln.'],
    ['l7', 'laub', 'Was machen die meisten Laubbäume im Herbst?', ['Sie verlieren ihre Blätter', 'Sie bekommen Nadeln', 'Sie fangen an zu blühen', 'Sie werden immer grüner'], 'Im Herbst färben sich die Blätter bunt und fallen ab.'],
    ['l8', 'laub', 'Warum werfen Laubbäume im Winter ihre Blätter ab?', ['Um Wasser zu sparen, wenn der Boden gefroren ist', 'Weil die Blätter zu schwer werden', 'Damit die Vögel Platz haben', 'Weil der Baum krank ist'], 'Über die Blätter verdunstet Wasser. Im Winter ist der Boden gefroren, der Baum bekommt kaum Wasser.'],
    ['l9', 'laub', 'Welche Teile hat ein Blatt?', ['Blattstiel, Blattfläche und Blattadern', 'Stamm, Krone und Wurzel', 'Zapfen und Nadeln', 'Rinde und Borke'], 'Ein Blatt hat einen Blattstiel, die Blattfläche (Spreite) und Blattadern.'],
    ['l10', 'laub', 'Wofür braucht der Baum seine Blätter?', ['Mit Sonnenlicht stellt er darin Nahrung her', 'Zum Festhalten im Boden', 'Damit er im Winter warm bleibt', 'Damit die Rinde dick wird'], 'In den grünen Blättern macht der Baum mit Sonnenlicht, Wasser und Luft seine Nahrung.'],
    ['l11', 'laub', 'Welcher Laubbaum ist in Deutschland am häufigsten?', ['Buche', 'Eiche', 'Ahorn', 'Linde'], 'Die Buche ist unser häufigster Laubbaum.'],
    ['f1', 'frucht', 'Welche Frucht fliegt wie ein kleiner Propeller?', ['Ahorn-Flügelfrucht', 'Eichel', 'Kastanie', 'Buchecker'], 'Die Flügelfrüchte vom Ahorn drehen sich beim Fallen wie ein Propeller.'],
    ['f2', 'frucht', 'Welche Frucht sitzt in einem kleinen Hütchen (Becher)?', ['Eichel', 'Buchecker', 'Kastanie', 'Zapfen'], 'Die Eichel sitzt in einem Becher, der wie ein Hütchen aussieht.'],
    ['f3', 'frucht', 'Welche Frucht ist dreikantig und steckt in einer stacheligen Hülle?', ['Buchecker', 'Eichel', 'Haselnuss', 'Ahorn-Flügelfrucht'], 'Bucheckern sind dreikantig. Meist liegen zwei in einer Hülle.'],
    ['f4', 'frucht', 'Wer frisst gerne Eicheln und Bucheckern?', ['Eichhörnchen und Wildschweine', 'Fische und Frösche', 'Schmetterlinge', 'Regenwürmer'], 'Eichhörnchen, Wildschweine, Eichelhäher und Mäuse fressen die Waldfrüchte.'],
    ['f5', 'frucht', 'Welche Frucht hängt an einem hellen Flügelblatt?', ['Lindenfrucht', 'Eichel', 'Kastanie', 'Buchecker'], 'Die kleinen Lindennüsschen hängen an einem hellen Flügelblatt.'],
    ['w1', 'wald', 'Welche Aufgabe hat die Wurzel?', ['Sie hält den Baum fest und holt Wasser', 'Sie macht die Früchte', 'Sie schützt vor Regen', 'Sie trägt die Blätter'], 'Die Wurzeln halten den Baum fest und nehmen Wasser und Nährstoffe auf.'],
    ['w2', 'wald', 'Was schützt den Stamm wie eine Haut?', ['Rinde (Borke)', 'Krone', 'Wurzel', 'Blatt'], 'Die Rinde schützt den Baum vor Hitze, Kälte und Tieren.'],
    ['w3', 'wald', 'Was gehört alles zur Baumkrone?', ['Äste, Zweige und Blätter', 'Wurzeln und Erde', 'Nur der Stamm', 'Rinde und Wurzeln'], 'Zur Krone gehören die Äste, Zweige und Blätter.'],
    ['w4', 'wald', 'Wie findest du das Alter eines gefällten Baumes heraus?', ['Jahresringe zählen', 'Blätter zählen', 'Äste messen', 'Zapfen zählen'], 'Jedes Jahr wächst ein neuer Jahresring.'],
    ['w5', 'wald', 'Ein Wald mit Laub- und Nadelbäumen heißt …', ['Mischwald', 'Laubwald', 'Nadelwald', 'Urwald'], 'Gemischte Bäume: Mischwald.'],
    ['w6', 'wald', 'Welches ist das höchste Stockwerk des Waldes?', ['Baumschicht', 'Strauchschicht', 'Krautschicht', 'Moosschicht'], 'Von unten nach oben: Wurzel-, Moos-, Kraut-, Strauch- und Baumschicht.'],
    ['w7', 'wald', 'Wo wachsen Farne, Gräser und Waldblumen?', ['Krautschicht', 'Moosschicht', 'Baumschicht', 'Wurzelschicht'], 'Farne, Gräser und Blumen wachsen in der Krautschicht.'],
    ['w8', 'wald', 'Haselnuss und Holunder wachsen in der …', ['Strauchschicht', 'Baumschicht', 'Moosschicht', 'Wurzelschicht'], 'Sträucher wachsen in der Strauchschicht.'],
    ['w9', 'wald', 'Welches Stockwerk speichert Wasser wie ein Schwamm?', ['Moosschicht', 'Krautschicht', 'Strauchschicht', 'Baumschicht'], 'Moos saugt sich mit Wasser voll wie ein Schwamm.'],
    ['w10', 'wald', 'Was ist der Unterschied zwischen Baum und Strauch?', ['Baum: ein Stamm. Strauch: viele dünne Stämmchen', 'Ein Strauch ist immer größer', 'Ein Baum hat keine Blätter', 'Es gibt keinen Unterschied'], 'Ein Baum hat einen dicken Stamm, ein Strauch viele dünne Triebe von unten.'],
    ['w11', 'wald', 'Welches Stockwerk ist ganz unten in der Erde?', ['Wurzelschicht', 'Moosschicht', 'Krautschicht', 'Strauchschicht'], 'Ganz unten ist die Wurzelschicht, dort leben auch Würmer und Käfer.']
  ];

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function others(list, k, n) { return shuffle(list.filter(function (x) { return x !== k; })).slice(0, n); }
  function treeOpts(k, list, img) {
    return shuffle([k].concat(others(list, k, 3))).map(function (x) { return { t: T[x].n, img: img ? img(x) : null, ok: x === k }; });
  }
  function treeInfo(k, what) { return T[k].n + ': ' + T[k][what] + '.'; }

  var BANK = [];
  LAUB.forEach(function (k) {
    BANK.push({ id: 'blatt:' + k, cat: 'laub', make: function () { return { text: 'Von welchem Baum ist dieses Blatt?', img: ART.leaf(k), opts: treeOpts(k, LAUB), ans: T[k].n, short: 'Blatt → ' + T[k].n, explain: treeInfo(k, 'blatt') }; } });
    BANK.push({ id: 'blattwahl:' + k, cat: 'laub', make: function () { return { text: 'Welches Blatt gehört ' + T[k].zu + '?', opts: treeOpts(k, LAUB, ART.leaf), pics: true, ans: T[k].n, short: 'Blatt ' + T[k].gen, explain: treeInfo(k, 'blatt') }; } });
  });
  FRUIT.forEach(function (k) {
    BANK.push({ id: 'frucht:' + k, cat: 'frucht', make: function () { return { text: 'Von welchem Baum ist diese Frucht?', img: ART.fruit(k), opts: treeOpts(k, FRUIT), ans: T[k].n, short: 'Frucht → ' + T[k].n, explain: treeInfo(k, 'frucht') }; } });
    BANK.push({ id: 'fruchtwahl:' + k, cat: 'frucht', make: function () { return { text: 'Welche Frucht gehört ' + T[k].zu + '?', opts: treeOpts(k, FRUIT, ART.fruit), pics: true, ans: T[k].n, short: 'Frucht ' + T[k].gen, explain: treeInfo(k, 'frucht') }; } });
  });
  NADEL.forEach(function (k) {
    BANK.push({ id: 'nadel:' + k, cat: 'nadel', make: function () { return { text: 'Welcher Nadelbaum ist das?', img: ART.needles(k), opts: treeOpts(k, NADEL), ans: T[k].n, short: 'Nadeln → ' + T[k].n, explain: treeInfo(k, 'blatt') }; } });
  });
  ['fichte', 'tanne', 'kiefer'].forEach(function (k) {
    BANK.push({ id: 'zapfen:' + k, cat: 'nadel', make: function () { return { text: 'Von welchem Baum ist dieser Zapfen?', img: ART.cone(k), opts: treeOpts(k, NADEL), ans: T[k].n, short: 'Zapfen → ' + T[k].n, explain: treeInfo(k, 'frucht') }; } });
  });
  LAUB.concat(NADEL).forEach(function (k) {
    var laub = T[k].typ === 'laub';
    BANK.push({ id: 'typ:' + k, cat: laub ? 'laub' : 'nadel', make: function () {
      return { text: (k === 'ahorn' ? 'Ist der ' : 'Ist die ') + T[k].n + ' ein Laubbaum oder ein Nadelbaum?', opts: [{ t: 'Laubbaum', ok: laub }, { t: 'Nadelbaum', ok: !laub }], ans: laub ? 'Laubbaum' : 'Nadelbaum', short: T[k].n + ': ' + (laub ? 'Laubbaum' : 'Nadelbaum'), explain: T[k].n + ' ist ein ' + (laub ? 'Laubbaum' : 'Nadelbaum') + (k === 'laerche' ? ', auch wenn sie im Herbst ihre Nadeln verliert.' : '.') };
    } });
  });
  Object.keys(PARTS).forEach(function (p) {
    BANK.push({ id: 'teil:' + p, cat: 'wald', make: function () {
      return { text: 'Wie heißt der markierte Teil des Baumes?', img: ART.parts(p), opts: shuffle(Object.keys(PARTS)).map(function (x) { return { t: PARTS[x], ok: x === p }; }), ans: PARTS[p], short: 'Baumteil: ' + PARTS[p], explain: PART_TIP[p] };
    } });
  });
  Object.keys(ART.LAYER_NAMES).forEach(function (l) {
    BANK.push({ id: 'schicht:' + l, cat: 'wald', make: function () {
      var keys = [l].concat(others(Object.keys(ART.LAYER_NAMES), l, 3));
      return { text: 'Wie heißt dieses Stockwerk des Waldes?', img: ART.forest(l), opts: shuffle(keys).map(function (x) { return { t: ART.LAYER_NAMES[x], ok: x === l }; }), ans: ART.LAYER_NAMES[l], short: 'Stockwerk: ' + ART.LAYER_NAMES[l], explain: ART.LAYER_NAMES[l] + ': ' + LAYER_TIP[l] };
    } });
  });
  BANK.push({ id: 'ringe', cat: 'wald', make: function () {
    var n = 4 + Math.floor(Math.random() * 5), set = [n, n - 2, n + 2, n + 4].filter(function (x) { return x > 1; });
    if (set.length < 4) set.push(n + 1);
    return { text: 'Zähle die Jahresringe. Wie alt war der Baum?', img: ART.rings(n), opts: shuffle(set).map(function (x) { return { t: x + ' Jahre', ok: x === n }; }), ans: n + ' Jahre', short: 'Jahresringe zählen', explain: 'Jeder Ring ist ein Jahr. Hier sind es ' + n + ' Ringe, also ' + n + ' Jahre.' };
  } });

  /* Steckbrief-Fragen fuer jeden Baum: Frucht, Blattform, Rinde, Besonderheit */
  var KURZ = {
    eiche:    { fr: 'Eichel', frWer: 'Eicheln', bl: 'Gelappt mit runden Buchten', ri: 'Dick und grau mit tiefen Rissen', bs: 'Kann über 1000 Jahre alt werden' },
    buche:    { fr: 'Buchecker', frWer: 'Bucheckern', bl: 'Eiförmig mit glattem, welligem Rand', ri: 'Glatt und silbergrau', bs: 'Häufigster Laubbaum in Deutschland' },
    ahorn:    { fr: 'Flügelfrucht (Propeller)', frWer: 'Flügelfrüchte, die wie ein Propeller fliegen', bl: 'Handförmig mit 5 spitzen Lappen', ri: null, bs: 'Sein Blatt ist auf der Flagge von Kanada' },
    kastanie: { fr: 'Kastanie in stacheliger Hülle', frWer: 'Kastanien in einer stacheligen grünen Hülle', bl: 'Gefingert mit 5 bis 7 Teilblättern', ri: null, bs: 'Ihre Früchte sind für Menschen nicht zum Essen' },
    birke:    { fr: 'Kätzchen mit Flügelsamen', frWer: 'Kätzchen mit winzigen Flügelsamen', bl: 'Dreieckig wie eine Raute, gesägter Rand', ri: 'Weiß mit schwarzen Stellen, blättert wie Papier ab', bs: 'Weiße Rinde, die sich wie Papier ablöst' },
    linde:    { fr: 'Nüsschen am Flügelblatt', frWer: 'kleine Nüsschen an einem hellen Flügelblatt', bl: 'Herzförmig mit gesägtem Rand', ri: null, bs: 'Aus ihren Blüten macht man Tee' },
    fichte:   { fr: 'Langer, hängender Zapfen', bl: 'Spitz und stechend, rund um den Zweig', ri: 'Rotbraun und schuppig', bs: 'Häufigster Baum in Deutschland' },
    tanne:    { fr: 'Aufrecht stehender Zapfen', bl: 'Weich, mit zwei weißen Streifen unten', ri: 'Hellgrau, fast weiß und glatt', bs: 'Ihre Zapfen zerfallen schon am Baum' },
    kiefer:   { fr: 'Kleiner, eiförmiger Zapfen', bl: 'Lang, immer zwei zusammen', ri: 'Oben orange-rot', bs: 'Wächst auch auf trockenem Sandboden' },
    laerche:  { fr: 'Kleiner, runder Zapfen', bl: 'Weich, in Büscheln, im Herbst gelb', ri: null, bs: 'Verliert im Herbst ihre Nadeln' }
  };
  var ALLT = LAUB.concat(NADEL);
  function kurzOpts(k, field, pool) {
    var right = KURZ[k][field], o = others(pool.filter(function (x) { return KURZ[x][field] && !(field === 'bs' && right.indexOf('Häufigster') === 0 && KURZ[x].bs.indexOf('Häufigster') === 0); }), k, 3);
    return shuffle([k].concat(o)).map(function (x) { return { t: KURZ[x][field], ok: x === k }; });
  }
  function der(k) { return k === 'ahorn' ? 'der Ahorn' : 'die ' + T[k].n; }
  ALLT.forEach(function (k) {
    var laub = T[k].typ === 'laub', cat = laub ? 'laub' : 'nadel', K = KURZ[k];
    BANK.push({ id: 'fn:' + k, cat: 'frucht', make: function () {
      return { text: laub ? 'Wie heißt die Frucht ' + T[k].gen + '?' : 'Wie sehen die Zapfen ' + T[k].gen + ' aus?', opts: kurzOpts(k, 'fr', laub ? LAUB : NADEL), ans: K.fr, short: 'Frucht ' + T[k].gen + ': ' + K.fr, explain: treeInfo(k, 'frucht') };
    } });
    BANK.push({ id: 'bf:' + k, cat: cat, make: function () {
      return { text: laub ? 'Wie ist das Blatt ' + T[k].gen + ' geformt?' : 'Wie sehen die Nadeln ' + T[k].gen + ' aus?', opts: kurzOpts(k, 'bl', laub ? LAUB : NADEL), ans: K.bl, short: (laub ? 'Blatt ' : 'Nadeln ') + T[k].gen + ': ' + K.bl, explain: treeInfo(k, 'blatt') };
    } });
    BANK.push({ id: 'bs:' + k, cat: cat, make: function () {
      return { text: 'Was ist das Besondere an ' + (k === 'ahorn' ? 'dem Ahorn' : 'der ' + T[k].n) + '?', opts: kurzOpts(k, 'bs', ALLT), ans: K.bs, short: T[k].n + ': ' + K.bs, explain: T[k].n + ': ' + T[k].merke };
    } });
    BANK.push({ id: 'wer:' + k, cat: cat, make: function () {
      return { text: 'Welcher Baum ist das? ' + K.bs + '.', opts: treeOpts(k, ALLT.filter(function (x) { return x === k || KURZ[x].bs.indexOf('Häufigster') < 0 || K.bs.indexOf('Häufigster') < 0; })), ans: T[k].n, short: K.bs + ' → ' + T[k].n, explain: T[k].n + ': ' + T[k].merke };
    } });
    if (K.ri) {
      BANK.push({ id: 'ri:' + k, cat: cat, make: function () {
        return { text: 'Wie sieht die Rinde ' + T[k].gen + ' aus?', opts: kurzOpts(k, 'ri', ALLT), ans: K.ri, short: 'Rinde ' + T[k].gen + ': ' + K.ri, explain: treeInfo(k, 'rinde') };
      } });
      BANK.push({ id: 'riw:' + k, cat: cat, make: function () {
        return { text: 'Welcher Baum hat diese Rinde: ' + K.ri.charAt(0).toLowerCase() + K.ri.slice(1) + '?', opts: treeOpts(k, ALLT.filter(function (x) { return KURZ[x].ri; })), ans: T[k].n, short: 'Rinde → ' + T[k].n, explain: treeInfo(k, 'rinde') };
      } });
    }
    if (K.frWer) BANK.push({ id: 'frw:' + k, cat: 'frucht', make: function () {
      return { text: 'Welcher Baum hat ' + K.frWer + '?', opts: treeOpts(k, LAUB), ans: T[k].n, short: K.frWer + ' → ' + T[k].n, explain: treeInfo(k, 'frucht') };
    } });
  });
  FACTS.forEach(function (f) {
    BANK.push({ id: 'w:' + f[0], cat: f[1], make: function () {
      return { text: f[2], opts: shuffle(f[3].map(function (t, i) { return { t: t, ok: i === 0 }; })), ans: f[3][0], short: f[2].replace(/[?:…]+$/, '').replace(/ …$/, '') + ' → ' + f[3][0], explain: f[4] };
    } });
  });
  var BY_ID = {};
  BANK.forEach(function (b) { BY_ID[b.id] = b; });

    return BANK;
  })();
