  /* ================= MATHE ================= */
  (function () {
    var NAMES = ['Mia', 'Ben', 'Emma', 'Paul', 'Lea', 'Tim', 'Anna', 'Jonas'];
    function eur(ct) { return Math.floor(ct / 100) + ',' + ('0' + (ct % 100)).slice(-2) + ' €'; }
    function uhr(h, m) { return h + ':' + ('0' + m).slice(-2) + ' Uhr'; }
    var INK = '#241B6B';

    topic('ma', 'm_1x1', 'Einmaleins', '✖️', function (L) {
      var a = pick(L === 1 ? [1, 2, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10]), b = R(1, 10);
      if (L === 3 && Math.random() < 0.4) return NUM('Welche Zahl fehlt?', b, { big: a + ' × ? = ' + a * b, explain: a + ' × ' + b + ' = ' + a * b });
      var f = Math.random() < 0.5;
      return NUM('Rechne aus.', a * b, { big: f ? b + ' × ' + a : a + ' × ' + b, explain: a + ' × ' + b + ' = ' + a * b });
    });
    topic('ma', 'm_div', 'Geteilt', '➗', function (L) {
      var d = pick(L === 1 ? [2, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9]), q = R(1, 10);
      if (L === 3 && Math.random() < 0.5) {
        d = R(3, 9); q = R(2, 9); var r = R(1, d - 1);
        return NUM('Wie groß ist der Rest?', r, { big: (d * q + r) + ' : ' + d + ' = ' + q + ' Rest ?', explain: q + ' × ' + d + ' = ' + q * d + ', es bleiben ' + r + ' übrig.' });
      }
      return NUM('Rechne aus.', q, { big: d * q + ' : ' + d, explain: d * q + ' : ' + d + ' = ' + q + ', denn ' + q + ' × ' + d + ' = ' + d * q });
    });
    topic('ma', 'm_z1x1', 'Einmaleins mit Zehnern', '🔟', function (L) {
      var a = R(2, L === 1 ? 5 : 9), b = R(2, L === 1 ? 5 : 9);
      if (L > 1 && Math.random() < 0.45) return NUM('Rechne aus.', a * 10, { big: a * b * 10 + ' : ' + b, explain: a * b + ' : ' + b + ' = ' + a + ', also ' + a * b * 10 + ' : ' + b + ' = ' + a * 10 });
      return NUM('Rechne aus.', a * b * 10, { big: Math.random() < 0.5 ? a * 10 + ' × ' + b : b + ' × ' + a * 10, explain: a + ' × ' + b + ' = ' + a * b + ', also ' + a * 10 + ' × ' + b + ' = ' + a * b * 10 });
    });
    topic('ma', 'm_plus', 'Plus bis 1000', '➕', function (L) {
      var a, b, t = 0;
      do {
        if (L === 1) { if (Math.random() < 0.5) { a = R(1, 8) * 100 + R(0, 8) * 10; b = R(1, 9 - Math.floor(a % 100 / 10)) * 10; } else { a = R(101, 989); b = R(1, 9 - a % 10) || 1; } }
        else if (L === 2) { a = R(105, 880); b = R(15, 99); }
        else { a = R(120, 780); b = R(110, 880); }
      } while ((a + b > 1000 || (L > 1 && (a % 10) + (b % 10) < 10)) && t++ < 200);
      return NUM('Rechne aus.', a + b, { big: a + ' + ' + b, explain: a + ' + ' + b + ' = ' + (a + b) });
    });
    topic('ma', 'm_minus', 'Minus bis 1000', '➖', function (L) {
      var a, b, t = 0;
      do {
        if (L === 1) { if (Math.random() < 0.5) { a = R(2, 9) * 100 + R(1, 9) * 10; b = R(1, Math.floor(a % 100 / 10)) * 10; } else { a = R(111, 999); b = R(1, a % 10 || 1); } }
        else if (L === 2) { a = R(130, 999); b = R(15, 99); }
        else { a = R(300, 1000); b = R(110, a - 20); }
      } while ((b >= a || (L > 1 && (a % 10) >= (b % 10))) && t++ < 200);
      return NUM('Rechne aus.', a - b, { big: a + ' − ' + b, explain: a + ' − ' + b + ' = ' + (a - b) });
    });
    topic('ma', 'm_stellen', 'Stellenwerte', '🧮', function (L) {
      var h = R(1, 9), z = R(0, 9), e = R(0, 9), n = h * 100 + z * 10 + e;
      if (Math.random() < 0.4) {
        var st = pick([['Hunderterstelle', h], ['Zehnerstelle', z], ['Einerstelle', e]]);
        return NUM('Welche Ziffer steht an der ' + st[0] + '?', st[1], { big: String(n), explain: n + ' = ' + h + ' H, ' + z + ' Z, ' + e + ' E' });
      }
      if (L === 3) { z = R(10, 19); h = R(1, 7); n = h * 100 + z * 10 + e; return NUM('Welche Zahl ist das?', n, { big: h + ' H  ' + z + ' Z  ' + e + ' E', explain: z + ' Zehner sind ' + z * 10 + '. Zusammen: ' + n }); }
      var parts = [h + ' H', z + ' Z', e + ' E'];
      if (L === 2) parts = shuf(parts);
      return NUM('Welche Zahl ist das?', n, { big: parts.join('  '), explain: h + ' Hunderter, ' + z + ' Zehner, ' + e + ' Einer = ' + n });
    });
    function strahl(a, step, n, mark, labels) {
      var s = '<line x1="6" y1="34" x2="194" y2="34" stroke="' + INK + '" stroke-width="2"/>', i;
      for (i = 0; i <= n; i++) {
        var x = 10 + i * 180 / n, v = a + i * step, big = labels.indexOf(v) >= 0;
        s += '<line x1="' + x + '" y1="' + (big ? 24 : 28) + '" x2="' + x + '" y2="' + (big ? 44 : 40) + '" stroke="' + INK + '" stroke-width="' + (big ? 2 : 1.2) + '"/>';
        if (big) s += '<text x="' + x + '" y="58" font-size="10" font-weight="700" text-anchor="middle" fill="' + INK + '" font-family="sans-serif">' + v + '</text>';
        if (v === mark) s += '<path d="M' + x + ' 22 l-6 -12 h12 z" fill="#FF4FA3"/><text x="' + x + '" y="8" font-size="9" font-weight="800" text-anchor="middle" fill="#FF4FA3" font-family="sans-serif">?</text>';
      }
      return svg(s, '0 -4 200 68');
    }
    topic('ma', 'm_nachbar', 'Nachbarn & Zahlenstrahl', '📏', function (L) {
      var n = L === 1 ? R(11, 99) : R(101, 998), t = R(0, 4);
      if (t === 0) return NUM('Wie heißt der Vorgänger?', n - 1, { big: String(n), explain: 'Der Vorgänger ist um 1 kleiner: ' + (n - 1) });
      if (t === 1) return NUM('Wie heißt der Nachfolger?', n + 1, { big: String(n), explain: 'Der Nachfolger ist um 1 größer: ' + (n + 1) });
      if (t === 2) { if (n % 10 === 0) n += 3; var up = Math.random() < 0.5; return NUM('Wie heißt der ' + (up ? 'größere' : 'kleinere') + ' Nachbarzehner?', up ? Math.ceil(n / 10) * 10 : Math.floor(n / 10) * 10, { big: String(n), explain: n + ' liegt zwischen ' + Math.floor(n / 10) * 10 + ' und ' + Math.ceil(n / 10) * 10 }); }
      if (t === 3 && L > 1) { if (n % 100 === 0) n += 37; var u2 = Math.random() < 0.5; return NUM('Wie heißt der ' + (u2 ? 'größere' : 'kleinere') + ' Nachbarhunderter?', u2 ? Math.ceil(n / 100) * 100 : Math.floor(n / 100) * 100, { big: String(n), explain: n + ' liegt zwischen ' + Math.floor(n / 100) * 100 + ' und ' + Math.ceil(n / 100) * 100 }); }
      var a = L === 1 ? 0 : L === 2 ? R(1, 8) * 100 : 0, step = L === 3 ? 50 : 10, cnt = L === 3 ? 20 : 10, m, lab = L === 3 ? [0, 500, 1000] : [a, a + 50, a + 100];
      do { m = a + R(1, cnt - 1) * step; } while (lab.indexOf(m) >= 0);
      return NUM('Auf welche Zahl zeigt der Pfeil?', m, { img: strahl(a, step, cnt, m, lab), wide: true, explain: 'Jeder Strich ist ein ' + step + 'er-Schritt. Der Pfeil zeigt auf ' + m + '.' });
    });
    topic('ma', 'm_vergleich', 'Vergleichen & Ordnen', '⚖️', function (L) {
      var d = shuf([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      if (Math.random() < 0.5) {
        var a = L === 1 ? R(11, 99) : d[0] * 100 + d[1] * 10 + d[2], b = L === 1 ? R(11, 99) : pick([d[0] * 100 + d[2] * 10 + d[1], d[1] * 100 + d[0] * 10 + d[2], a]);
        var r = a < b ? '<' : a > b ? '>' : '=';
        return MC('Welches Zeichen passt?', r, [], { fixed: ['<', '>', '='], big: a + ' ▢ ' + b, explain: a + ' ' + r + ' ' + b + (r === '<' ? ' (kleiner als)' : r === '>' ? ' (größer als)' : ' (gleich)') });
      }
      var nums = uniq([d[0] * 100 + d[1] * 10 + d[2], d[0] * 100 + d[2] * 10 + d[1], d[1] * 100 + d[0] * 10 + d[2], d[2] * 100 + d[1] * 10 + d[0]]);
      if (L === 1) nums = uniq([R(10, 99), R(10, 99), R(10, 99), R(10, 99)]);
      var gr = Math.random() < 0.5, best = gr ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      return MC('Welche Zahl ist die ' + (gr ? 'größte' : 'kleinste') + '?', best, nums, { explain: 'Vergleiche zuerst die Hunderter, dann die Zehner, dann die Einer.' });
    });
    topic('ma', 'm_runden', 'Runden', '🎯', function (L) {
      var n, z;
      if (L === 1) { n = R(11, 98); if (n % 10 === 0) n += 4; z = true; }
      else { n = R(101, 989); z = L === 2 ? Math.random() < 0.6 : Math.random() < 0.4; if (n % 10 === 0) n += 5; }
      var a = z ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100, dig = z ? n % 10 : Math.floor(n % 100 / 10);
      return NUM('Runde auf ' + (z ? 'Zehner' : 'Hunderter') + '.', a, { big: String(n), explain: 'Die Ziffer ' + dig + ' entscheidet: bei 0 bis 4 abrunden, bei 5 bis 9 aufrunden. Ergebnis: ' + a });
    });
    topic('ma', 'm_folgen', 'Zahlenfolgen', '🪜', function (L) {
      var st, a, seq = [], i;
      if (L === 3 && Math.random() < 0.4) { a = R(2, 6); for (i = 0; i < 4; i++) seq.push(a * Math.pow(2, i)); return NUM('Wie geht die Folge weiter?', a * 16, { big: seq.join(', ') + ', ?', explain: 'Immer verdoppeln: ' + seq[3] + ' × 2 = ' + a * 16 }); }
      st = pick(L === 1 ? [2, 5, 10] : L === 2 ? [3, 4, 20, 25, 50, -10, -5] : [6, 7, 15, 30, 125, -20, -25, -50]);
      a = st > 0 ? R(1, 20) * (st >= 20 ? 10 : 1) : R(30, 90) * 10;
      for (i = 0; i < 4; i++) seq.push(a + i * st);
      return NUM('Wie geht die Folge weiter?', a + 4 * st, { big: seq.join(', ') + ', ?', explain: 'Immer ' + (st > 0 ? '+ ' + st : '− ' + (-st)) + ': ' + seq[3] + (st > 0 ? ' + ' + st : ' − ' + (-st)) + ' = ' + (a + 4 * st) });
    });
    topic('ma', 'm_doppelt', 'Verdoppeln & Halbieren', '👯', function (L) {
      var max = [0, 50, 250, 500][L], n = R(6, max);
      if (Math.random() < 0.5) return NUM('Verdopple die Zahl.', n * 2, { big: String(n), explain: n + ' + ' + n + ' = ' + n * 2 });
      return NUM('Halbiere die Zahl.', n, { big: String(n * 2), explain: 'Die Hälfte von ' + n * 2 + ' ist ' + n + ', denn ' + n + ' + ' + n + ' = ' + n * 2 });
    });
    topic('ma', 'm_geld', 'Geld', '💶', function (L) {
      var t = R(0, 3), e = R(1, 9), c = R(1, 19) * 5;
      if (t === 0) return NUM('Wie viel Cent sind das?', e * 100 + c, { big: e + ' € ' + c + ' ct', explain: '1 € = 100 ct. ' + e + ' € = ' + e * 100 + ' ct, dazu ' + c + ' ct.' });
      if (t === 1) return NUM('Wie viele Euro sind das? (Nur die ganzen Euro)', e, { big: (e * 100 + c) + ' ct = ? € ' + c + ' ct', explain: (e * 100 + c) + ' ct = ' + e + ' € ' + c + ' ct' });
      if (t === 2) {
        var pay = pick(L === 1 ? [500, 1000] : [1000, 2000]), price = L === 1 ? R(1, pay / 100 - 1) * 100 + pick([0, 50]) : R(11, pay / 10 - 2) * 10, back = pay - price;
        return MC('Du kaufst etwas für ' + eur(price) + ' und zahlst mit ' + eur(pay) + '. Wie viel bekommst du zurück?', eur(back), [eur(back + 100), eur(Math.abs(back - 100) || 50), eur(back + 10), eur(pay + price - 1000 > 0 ? back + 50 : back + 20)], { explain: eur(pay) + ' − ' + eur(price) + ' = ' + eur(back) });
      }
      var p1 = R(3, 29) * 10, p2 = R(3, 29) * 10, th = pick([['ein Heft', 'ein Stift'], ['eine Breze', 'ein Saft'], ['ein Eis', 'eine Limo']]);
      return MC(th[0].charAt(0).toUpperCase() + th[0].slice(1) + ' kostet ' + eur(p1) + ', ' + th[1] + ' kostet ' + eur(p2) + '. Wie viel kostet beides zusammen?', eur(p1 + p2), [eur(p1 + p2 + 10), eur(p1 + p2 + 100), eur(Math.abs(p1 - p2) || 10), eur(p1 + p2 - 10)], { explain: eur(p1) + ' + ' + eur(p2) + ' = ' + eur(p1 + p2) });
    });
    var EST_L = [['Wie lang ist ein Bleistift ungefähr?', '17 cm', ['17 mm', '17 m', '17 km']], ['Wie hoch ist eine Zimmertür ungefähr?', '2 m', ['2 cm', '20 m', '2 km']], ['Wie lang ist eine Ameise ungefähr?', '5 mm', ['5 cm', '5 m', '50 cm']], ['Wie lang ist ein Fußballfeld ungefähr?', '100 m', ['100 cm', '10 m', '100 km']], ['Wie weit ist es von München nach Nürnberg ungefähr?', '170 km', ['170 m', '17 km', '1700 km']], ['Wie breit ist dein Daumen ungefähr?', '1 cm', ['1 mm', '10 cm', '1 m']], ['Wie groß ist ein Kind in der 3. Klasse ungefähr?', '1 m 35 cm', ['35 cm', '3 m 50 cm', '13 m']]];
    topic('ma', 'm_laenge', 'Längen', '📐', function (L) {
      var t = R(0, 4), n;
      if (t === 0) { var q = pick(EST_L); return MC(q[0], q[1], q[2], { explain: 'Richtig ist ungefähr ' + q[1] + '.' }); }
      if (L === 1 || t === 1) { var u = pick([['m', 'cm', 100, 9], ['cm', 'mm', 10, 30], ['km', 'm', 1000, 9]]); n = R(1, u[3]); return NUM('Wandle um.', n * u[2], { big: n + ' ' + u[0] + ' = ? ' + u[1], explain: '1 ' + u[0] + ' = ' + u[2] + ' ' + u[1] + ', also ' + n + ' ' + u[0] + ' = ' + n * u[2] + ' ' + u[1] }); }
      if (L === 3 && t === 2) { n = R(1, 9); var half = pick([[5, 50], [25, 25], [75, 75]]); return NUM('Wandle um.', n * 100 + half[1], { big: n + ',' + (half[0] === 5 ? '50' : half[0]) + ' m = ? cm', explain: n + ' m = ' + n * 100 + ' cm, dazu ' + half[1] + ' cm.' }); }
      if (t === 3) { n = R(1, 9); var c = R(1, 19) * 5; return NUM('Wandle um.', n * 100 + c, { big: n + ' m ' + c + ' cm = ? cm', explain: n + ' m = ' + n * 100 + ' cm, dazu ' + c + ' cm = ' + (n * 100 + c) + ' cm' }); }
      n = R(1, 9); var m = R(1, 9) * 100; return NUM('Wandle um.', n * 1000 + m, { big: n + ' km ' + m + ' m = ? m', explain: n + ' km = ' + n * 1000 + ' m, dazu ' + m + ' m.' });
    });
    var EST_G = [['Wie schwer ist eine Tafel Schokolade?', '100 g', ['10 g', '1 kg', '10 kg']], ['Wie schwer ist eine Packung Mehl?', '1 kg', ['1 g', '100 g', '10 kg']], ['Wie schwer ist ein Brief ungefähr?', '20 g', ['2 kg', '200 g', '20 kg']], ['Wie schwer ist ein Kind in der 3. Klasse ungefähr?', '30 kg', ['3 kg', '300 g', '300 kg']], ['Wie schwer ist ein kleines Auto ungefähr?', '1 t', ['1 kg', '100 kg', '10 g']], ['Wie schwer ist ein Hühnerei ungefähr?', '60 g', ['6 kg', '600 g', '6 g']], ['Wie schwer ist 1 Liter Wasser?', '1 kg', ['1 g', '100 g', '10 kg']]];
    topic('ma', 'm_gewicht', 'Gewichte', '🏋️', function (L) {
      var t = R(0, 3), n = R(1, 9);
      if (t === 0) { var q = pick(EST_G); return MC(q[0], q[1], q[2], { explain: 'Richtig ist ungefähr ' + q[1] + '.' }); }
      if (t === 1 && L > 1) { var b = pick([['½ kg', 500], ['¼ kg', 250], ['¾ kg', 750], ['1 ½ kg', 1500]]); return NUM('Wie viel Gramm sind das?', b[1], { big: b[0] + ' = ? g', explain: '1 kg = 1000 g, also ' + b[0] + ' = ' + b[1] + ' g' }); }
      if (t === 2 && L > 1) { var g = R(1, 19) * 50; return NUM('Wandle um.', n * 1000 + g, { big: n + ' kg ' + g + ' g = ? g', explain: n + ' kg = ' + n * 1000 + ' g, dazu ' + g + ' g.' }); }
      if (t === 3 && L === 3) return NUM('Wandle um.', n * 1000, { big: n + ' t = ? kg', explain: '1 Tonne = 1000 kg' });
      return NUM('Wandle um.', n * 1000, { big: n + ' kg = ? g', explain: '1 kg = 1000 g, also ' + n + ' kg = ' + n * 1000 + ' g' });
    });
    function clock(h, m) {
      var s = '<circle cx="50" cy="50" r="46" fill="#fff" stroke="' + INK + '" stroke-width="4"/>', i, a;
      for (i = 0; i < 60; i++) { a = i * 6 * Math.PI / 180; var r1 = i % 5 ? 41 : 37; s += '<line x1="' + (50 + r1 * Math.sin(a)) + '" y1="' + (50 - r1 * Math.cos(a)) + '" x2="' + (50 + 44 * Math.sin(a)) + '" y2="' + (50 - 44 * Math.cos(a)) + '" stroke="' + INK + '" stroke-width="' + (i % 5 ? 0.8 : 2) + '"/>'; }
      for (i = 1; i <= 12; i++) { a = i * 30 * Math.PI / 180; s += '<text x="' + (50 + 30 * Math.sin(a)) + '" y="' + (53.5 - 30 * Math.cos(a)) + '" font-size="10" font-weight="800" text-anchor="middle" fill="' + INK + '" font-family="sans-serif">' + i + '</text>'; }
      var ha = ((h % 12) + m / 60) * 30 * Math.PI / 180, ma = m * 6 * Math.PI / 180;
      s += '<line x1="50" y1="50" x2="' + (50 + 21 * Math.sin(ha)) + '" y2="' + (50 - 21 * Math.cos(ha)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
      s += '<line x1="50" y1="50" x2="' + (50 + 35 * Math.sin(ma)) + '" y2="' + (50 - 35 * Math.cos(ma)) + '" stroke="#FF4FA3" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="3.5" fill="' + INK + '"/>';
      return svg(s);
    }
    var CONV_T = [['1 Stunde = ? Minuten', 60], ['2 Stunden = ? Minuten', 120], ['½ Stunde = ? Minuten', 30], ['¼ Stunde = ? Minuten', 15], ['¾ Stunde = ? Minuten', 45], ['1 Minute = ? Sekunden', 60], ['2 Minuten = ? Sekunden', 120], ['1 Tag = ? Stunden', 24], ['1 Woche = ? Tage', 7], ['1 Jahr = ? Monate', 12], ['3 Wochen = ? Tage', 21], ['1 ½ Stunden = ? Minuten', 90], ['2 Tage = ? Stunden', 48]];
    topic('ma', 'm_zeit', 'Uhr & Zeit', '🕒', function (L) {
      var t = R(0, 3), h = R(1, 12), m;
      if (t <= 1) {
        m = L === 1 ? pick([0, 30]) : L === 2 ? pick([0, 15, 30, 45]) : R(0, 11) * 5;
        var w = [uhr(h % 12 + 1, m), uhr(h === 1 ? 12 : h - 1, m), uhr(h, (m + 30) % 60), uhr(Math.floor(m / 5) || 12, (h % 12) * 5)];
        return MC('Wie spät ist es?', uhr(h, m), w, { img: clock(h, m), explain: 'Der kurze Zeiger zeigt die Stunde (' + h + '), der lange die Minuten (' + m + ').' });
      }
      if (t === 2 || L === 1) { var c = pick(L === 1 ? CONV_T.slice(0, 10) : CONV_T); return NUM('Wandle um.', c[1], { big: c[0], explain: c[0].replace('?', c[1]) }); }
      var h1 = R(7, 18), m1 = R(1, 10) * 5, d = L === 2 ? R(2, 11) * 5 : pick([65, 75, 90, 95, 105, 110, 125]), e = h1 * 60 + m1 + d, h2 = Math.floor(e / 60), m2 = e % 60;
      if (L === 2) return NUM('Wie viele Minuten sind es von ' + uhr(h1, m1) + ' bis ' + uhr(h2, m2) + '?', d, { explain: 'Von ' + uhr(h1, m1) + ' bis ' + uhr(h2, m2) + ' sind es ' + d + ' Minuten.' });
      return MC('Der Film beginnt um ' + uhr(h1, m1) + ' und dauert ' + d + ' Minuten. Wann ist er zu Ende?', uhr(h2, m2), [uhr(h2 + 1, m2), uhr(h2, (m2 + 30) % 60), uhr(h2 - 1 || 12, m2), uhr(h2, (m2 + 10) % 60)], { explain: d + ' Minuten = ' + Math.floor(d / 60) + ' h ' + d % 60 + ' min. Ende: ' + uhr(h2, m2) });
    });
    var EST_V = [['Wie viel passt in ein Trinkglas?', '200 ml', ['2 ml', '2 l', '20 l']], ['Wie viel passt in einen Putzeimer?', '10 l', ['10 ml', '100 ml', '1000 l']], ['Wie viel passt in eine Badewanne?', '150 l', ['150 ml', '15 l', '1 l']], ['Wie viel passt auf einen Teelöffel?', '5 ml', ['5 l', '500 ml', '50 l']], ['Wie viel ist in einer großen Milchpackung?', '1 l', ['1 ml', '10 ml', '100 l']]];
    topic('ma', 'm_liter', 'Liter & Milliliter', '🥛', function (L) {
      var t = R(0, 3), n = R(1, 9);
      if (t === 0) { var q = pick(EST_V); return MC(q[0], q[1], q[2], { explain: 'Richtig ist ungefähr ' + q[1] + '.' }); }
      if (t === 1 && L > 1) { var b = pick([['½ l', 500], ['¼ l', 250], ['¾ l', 750], ['1 ½ l', 1500]]); return NUM('Wie viele Milliliter sind das?', b[1], { big: b[0] + ' = ? ml', explain: '1 l = 1000 ml, also ' + b[0] + ' = ' + b[1] + ' ml' }); }
      if (t === 2 && L > 1) { var ml = R(1, 19) * 50; return NUM('Wandle um.', n * 1000 + ml, { big: n + ' l ' + ml + ' ml = ? ml', explain: n + ' l = ' + n * 1000 + ' ml, dazu ' + ml + ' ml.' }); }
      return NUM('Wandle um.', n * 1000, { big: n + ' l = ? ml', explain: '1 Liter = 1000 Milliliter' });
    });
    var F = 'fill="#B8A6FF" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"', F2 = 'fill="#8E78F0" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"', F3 = 'fill="#D9CFFF" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"';
    var SHAPES = {
      'Würfel': '<path d="M20 36 h44 v44 h-44 z" ' + F + '/><path d="M20 36 l16 -16 h44 l-16 16 z" ' + F3 + '/><path d="M64 36 l16 -16 v44 l-16 16 z" ' + F2 + '/>',
      'Quader': '<path d="M8 44 h62 v34 h-62 z" ' + F + '/><path d="M8 44 l20 -16 h62 l-20 16 z" ' + F3 + '/><path d="M70 44 l20 -16 v34 l-20 16 z" ' + F2 + '/>',
      'Kugel': '<circle cx="50" cy="50" r="36" ' + F + '/><ellipse cx="38" cy="36" rx="10" ry="6" fill="#fff" fill-opacity="0.6" transform="rotate(-30 38 36)"/>',
      'Zylinder': '<path d="M24 26 v50 a26 9 0 0 0 52 0 v-50" ' + F + '/><ellipse cx="50" cy="26" rx="26" ry="9" ' + F3 + '/>',
      'Kegel': '<path d="M50 12 L22 78 a28 9 0 0 0 56 0 Z" ' + F + '/><path d="M22 78 a28 9 0 0 1 56 0" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="3 3"/>',
      'Pyramide': '<path d="M50 12 L16 72 L58 88 Z" ' + F + '/><path d="M50 12 L58 88 L86 68 Z" ' + F2 + '/>',
      'Quadrat': '<rect x="22" y="22" width="56" height="56" ' + F + '/>',
      'Rechteck': '<rect x="10" y="30" width="80" height="40" ' + F + '/>',
      'Dreieck': '<path d="M50 16 L88 82 L12 82 Z" ' + F + '/>',
      'Kreis': '<circle cx="50" cy="50" r="36" ' + F + '/>'
    };
    var K3 = ['Würfel', 'Quader', 'Kugel', 'Zylinder', 'Kegel', 'Pyramide'], K2 = ['Quadrat', 'Rechteck', 'Dreieck', 'Kreis'];
    var GEOF = [['Wie viele Ecken hat ein Würfel?', 8, 'Würfel'], ['Wie viele Kanten hat ein Würfel?', 12, 'Würfel'], ['Wie viele Flächen hat ein Würfel?', 6, 'Würfel'], ['Wie viele Ecken hat ein Quader?', 8, 'Quader'], ['Wie viele Flächen hat ein Quader?', 6, 'Quader'], ['Wie viele Kanten hat ein Quader?', 12, 'Quader'], ['Wie viele Ecken hat eine Kugel?', 0, 'Kugel'], ['Wie viele rechte Winkel hat ein Rechteck?', 4, 'Rechteck'], ['Wie viele Spiegelachsen hat ein Quadrat?', 4, 'Quadrat'], ['Wie viele Spiegelachsen hat ein Rechteck (kein Quadrat)?', 2, 'Rechteck'], ['Wie viele Ecken hat ein Dreieck?', 3, 'Dreieck'], ['Wie viele Ecken hat eine Pyramide mit quadratischer Grundfläche?', 5, 'Pyramide'], ['Wie viele Flächen hat ein Zylinder?', 3, 'Zylinder']];
    topic('ma', 'm_geo', 'Körper & Flächen', '🧊', function (L) {
      var t = R(0, 4), a, b, s, i, j;
      if (t === 0) { var pool = Math.random() < 0.6 ? K3 : K2, k = pick(pool); return MC('Wie heißt diese Form?', k, pool.concat(K3), { img: svg(SHAPES[k]), explain: 'Das ist ein' + (k === 'Kugel' || k === 'Pyramide' ? 'e ' : ' ') + k + '.' }); }
      if (t === 1) { var g = pick(GEOF); return NUM(g[0], g[1], { img: svg(SHAPES[g[2]]), explain: g[0].replace('Wie viele', 'Es sind ' + g[1]).replace(' hat ', ' bei ').replace('?', '.') }); }
      if (t === 2 || L === 1) { var sym = shuf('AHMOTUVWXY'.split(''))[0], asym = shuf('FGJLNPQRSZ'.split('')).slice(0, 3); return MC('Welcher Buchstabe ist spiegelsymmetrisch?', sym, asym, { explain: 'Der Buchstabe ' + sym + ' hat eine Spiegelachse: Beide Hälften sind gleich.' }); }
      a = R(2, 9); b = R(2, 6);
      if (t === 3) {
        if (a === b) a++;
        s = '<rect x="20" y="24" width="120" height="' + (b / a * 120 > 70 ? 70 : 52) + '" ' + F + '/><text x="80" y="18" font-size="12" font-weight="800" text-anchor="middle" fill="' + INK + '" font-family="sans-serif">' + a + ' cm</text><text x="148" y="54" font-size="12" font-weight="800" fill="' + INK + '" font-family="sans-serif">' + b + ' cm</text>';
        return NUM('Wie groß ist der Umfang des Rechtecks in cm?', 2 * (a + b), { img: svg(s, '0 0 190 100'), wide: true, explain: 'Umfang: alle Seiten zusammen. ' + a + ' + ' + b + ' + ' + a + ' + ' + b + ' = ' + 2 * (a + b) + ' cm' });
      }
      s = '';
      for (i = 0; i < a; i++) for (j = 0; j < b; j++) s += '<rect x="' + (4 + i * 16) + '" y="' + (4 + j * 16) + '" width="16" height="16" fill="#B8A6FF" stroke="' + INK + '" stroke-width="1.2"/>';
      return NUM('Aus wie vielen Kästchen besteht die Fläche?', a * b, { img: svg(s, '0 0 ' + (a * 16 + 8) + ' ' + (b * 16 + 8)), wide: true, explain: a + ' Kästchen in jeder Reihe, ' + b + ' Reihen: ' + a + ' × ' + b + ' = ' + a * b });
    });
    topic('ma', 'm_sach', 'Sachaufgaben', '🧩', function (L) {
      var n1 = pick(NAMES), n2 = pick(NAMES.filter(function (x) { return x !== n1; })), t = R(0, 6), a, b, c, k;
      if (t === 0) { k = R(3, 6); a = R(3, 9); var rest = L === 3 ? R(1, k - 1) : 0; return NUM((a * k + rest) + ' Kinder fahren ins Schullandheim. In jedes Zimmer passen ' + k + ' Kinder. Wie viele Zimmer werden gebraucht?', a + (rest ? 1 : 0), { explain: (a * k + rest) + ' : ' + k + ' = ' + a + (rest ? ' Rest ' + rest + '. Für die restlichen Kinder braucht man noch ein Zimmer: ' + (a + 1) : '') }); }
      if (t === 1) { a = R(20, L === 1 ? 50 : 400); b = R(5, Math.min(a - 2, 60)); c = R(5, 60); return NUM('Im Zug sitzen ' + a + ' Leute. ' + b + ' steigen aus und ' + c + ' steigen ein. Wie viele Leute sind jetzt im Zug?', a - b + c, { explain: a + ' − ' + b + ' + ' + c + ' = ' + (a - b + c) }); }
      if (t === 2) { a = R(8, 30) * (L === 1 ? 5 : 10); b = R(3, a / 2); return NUM('Ein Buch hat ' + a + ' Seiten. ' + n1 + ' hat schon ' + b + ' Seiten gelesen. Wie viele Seiten fehlen noch?', a - b, { explain: a + ' − ' + b + ' = ' + (a - b) }); }
      if (t === 3) { k = pick([6, 8, 10, 12]); a = R(2, 9); return NUM('In einer Kiste sind ' + k + ' Flaschen. Wie viele Flaschen sind in ' + a + ' Kisten?', k * a, { explain: a + ' × ' + k + ' = ' + k * a }); }
      if (t === 4) { k = R(2, 6); a = R(3, 10); return NUM(n1 + ' spart jede Woche ' + k + ' €. Nach wie vielen Wochen hat ' + n1 + ' ' + k * a + ' € gespart?', a, { explain: k * a + ' : ' + k + ' = ' + a }); }
      if (t === 5) { a = R(6, 30); k = L === 1 ? 2 : R(2, 4); return NUM(n1 + ' hat ' + a + ' Sticker. ' + n2 + ' hat ' + (k === 2 ? 'doppelt' : k + '-mal') + ' so viele. Wie viele Sticker haben beide zusammen?', a + a * k, { explain: n2 + ' hat ' + a + ' × ' + k + ' = ' + a * k + '. Zusammen: ' + a + ' + ' + a * k + ' = ' + (a + a * k) }); }
      a = R(2, 6); b = R(2, 5); c = R(1, 4); return NUM('Eine Kugel Eis kostet ' + a + ' €. ' + n1 + ' kauft ' + b + ' Kugeln und zahlt mit einem ' + (a * b + c > 20 ? '50' : a * b + c > 10 ? '20' : '10') + '-Euro-Schein. Wie viel Euro bekommt ' + n1 + ' zurück?', (a * b + c > 20 ? 50 : a * b + c > 10 ? 20 : 10) - a * b, { explain: b + ' × ' + a + ' € = ' + a * b + ' €. Rückgeld: ' + ((a * b + c > 20 ? 50 : a * b + c > 10 ? 20 : 10) - a * b) + ' €' });
    });
    function bars(labels, vals) {
      var s = '', i, max = 10;
      for (i = 0; i <= max; i += 2) s += '<line x1="22" y1="' + (90 - i * 8) + '" x2="196" y2="' + (90 - i * 8) + '" stroke="#C9C0F5" stroke-width="1"/><text x="17" y="' + (93 - i * 8) + '" font-size="9" font-weight="700" text-anchor="end" fill="' + INK + '" font-family="sans-serif">' + i + '</text>';
      labels.forEach(function (l, j) { var x = 30 + j * 42; s += '<rect x="' + x + '" y="' + (90 - vals[j] * 8) + '" width="28" height="' + vals[j] * 8 + '" rx="3" fill="' + ['#FF4FA3', '#3DA5FF', '#2FC774', '#FF9F1C'][j] + '"/><text x="' + (x + 14) + '" y="104" font-size="9.5" font-weight="800" text-anchor="middle" fill="' + INK + '" font-family="sans-serif">' + l + '</text>'; });
      return svg(s, '0 0 200 110');
    }
    var ZUF = [['In einem Beutel sind 9 rote und 1 blaue Kugel. Du ziehst ohne hinzusehen. Welche Farbe ist wahrscheinlicher?', 'Rot', ['Blau', 'Beide gleich wahrscheinlich'], 'Es gibt viel mehr rote Kugeln, also ist Rot wahrscheinlicher.'], ['In einem Beutel sind nur gelbe Kugeln. Du ziehst eine gelbe Kugel. Das ist …', 'sicher', ['möglich, aber nicht sicher', 'unmöglich'], 'Wenn nur gelbe Kugeln drin sind, ist Gelb sicher.'], ['In einem Beutel sind nur gelbe Kugeln. Du ziehst eine grüne Kugel. Das ist …', 'unmöglich', ['sicher', 'möglich, aber nicht sicher'], 'Es gibt keine grüne Kugel, also ist das unmöglich.'], ['Du würfelst mit einem Spielwürfel eine 6. Das ist …', 'möglich, aber nicht sicher', ['sicher', 'unmöglich'], 'Die 6 kann kommen, muss aber nicht.'], ['Du würfelst mit einem Spielwürfel eine 7. Das ist …', 'unmöglich', ['sicher', 'möglich, aber nicht sicher'], 'Ein Spielwürfel hat nur die Zahlen 1 bis 6.'], ['In einem Beutel sind 3 rote und 3 blaue Kugeln. Welche Farbe ist wahrscheinlicher?', 'Beide gleich wahrscheinlich', ['Rot', 'Blau'], 'Gleich viele Kugeln: beide Farben sind gleich wahrscheinlich.'], ['Du wirfst eine Münze. Wie viele mögliche Ergebnisse gibt es?', '2', ['1', '3', '6'], 'Kopf oder Zahl: 2 Möglichkeiten.'], ['Du würfelst eine Zahl, die kleiner als 7 ist. Das ist …', 'sicher', ['unmöglich', 'möglich, aber nicht sicher'], 'Alle Zahlen auf dem Würfel (1 bis 6) sind kleiner als 7.']];
    topic('ma', 'm_zufall', 'Daten & Zufall', '🎲', function (L) {
      if (Math.random() < 0.45) { var z = pick(ZUF); return MC(z[0], z[1], z[2], { explain: z[3] }); }
      var set = pick([['Apfel', 'Birne', 'Banane', 'Kiwi'], ['Hund', 'Katze', 'Hase', 'Fisch'], ['Fußball', 'Tanzen', 'Reiten', 'Turnen']]), v = [R(1, 10), R(1, 10), R(1, 10), R(1, 10)], i = R(0, 3), j = (i + R(1, 3)) % 4, t = R(0, 3);
      while (uniq(v).length < 4) v = [R(1, 10), R(1, 10), R(1, 10), R(1, 10)];
      var im = bars(set, v);
      if (t === 0) return NUM('Wie viele Kinder haben „' + set[i] + '“ gewählt?', v[i], { img: im, wide: true, explain: 'Der Balken bei ' + set[i] + ' geht bis ' + v[i] + '.' });
      if (t === 1) { var mx = v.indexOf(Math.max.apply(null, v)); return MC('Was wurde am häufigsten gewählt?', set[mx], set, { img: im, wide: true, explain: set[mx] + ' hat den höchsten Balken (' + v[mx] + ').' }); }
      if (t === 2 && L > 1) return NUM('Wie viele Kinder haben insgesamt abgestimmt?', v[0] + v[1] + v[2] + v[3], { img: im, wide: true, explain: v.join(' + ') + ' = ' + (v[0] + v[1] + v[2] + v[3]) });
      return NUM('Wie viele Kinder mehr haben „' + (v[i] > v[j] ? set[i] : set[j]) + '“ gewählt als „' + (v[i] > v[j] ? set[j] : set[i]) + '“?', Math.abs(v[i] - v[j]), { img: im, wide: true, explain: Math.max(v[i], v[j]) + ' − ' + Math.min(v[i], v[j]) + ' = ' + Math.abs(v[i] - v[j]) });
    });
  })();
