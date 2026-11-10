  /* ---------- Helfer ---------- */
  var $ = function (s) { return document.querySelector(s); };
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function svg(inner, vb) { return '<svg viewBox="' + (vb || '0 0 100 100') + '" role="img">' + inner + '</svg>'; }

  /* Multiple Choice: richtige Antwort + falsche, gemischt (ausser o.fixed) */
  function MC(text, right, wrongs, o) {
    right = String(right);
    var w = uniq(wrongs.map(String)).filter(function (x) { return x !== right; });
    if (!(o && o.fixed)) w = shuf(w).slice(0, 3);
    var all = (o && o.fixed) ? o.fixed.map(String) : shuf([right].concat(w));
    var q = { text: text, opts: all.map(function (t) { return { t: t, ok: t === right }; }), ans: right };
    if (o) for (var k in o) if (k !== 'fixed') q[k] = o[k];
    if (o && o.fixed) q.keep = true;
    return q;
  }
  /* Zahl eintippen */
  function NUM(text, ans, o) {
    var q = { text: text, num: ans, ans: String(ans) };
    if (o) for (var k in o) q[k] = o[k];
    return q;
  }

  var TOPICS = [];
  var SUBJ = {
    de:  { n: 'Deutsch',  e: '📖', c: 'var(--de)' },
    ma:  { n: 'Mathe',    e: '🔢', c: 'var(--ma)' },
    hsu: { n: 'HSU',      e: '🌍', c: 'var(--hsu)' },
    en:  { n: 'Englisch', e: '🇬🇧', c: 'var(--en)' }
  };
  var SUBJ_ORDER = ['de', 'ma', 'hsu', 'en'];
  function topic(s, id, n, e, gen) { TOPICS.push({ id: id, s: s, n: n, e: e, gen: gen }); }
  /* Thema aus festen Karten (mit Lernkartei-Faechern) */
  function bank(s, id, n, e, items) { TOPICS.push({ id: id, s: s, n: n, e: e, items: items }); }
  /* Wissensfragen: [Frage, richtig, falsch, falsch, falsch, Erklaerung] */
  function facts(s, id, n, e, list) {
    bank(s, id, n, e, list.map(function (f, i) {
      return { id: id + ':' + i, make: function () { return MC(f[0], f[1], [f[2], f[3], f[4]].filter(Boolean), { explain: f[5] || '', img: f[6] || null }); } };
    }));
  }
  /* Lueckenwoerter: [Luecke, richtig, falsch(e), ganzes Wort, Tipp] */
  function gaps(s, id, n, e, list, tip, fixed) {
    bank(s, id, n, e, list.map(function (g) {
      return { id: id + ':' + g[3], make: function () {
        var wr = [].concat(g[2]);
        return MC('Was fehlt in der Lücke?', g[1], wr, { big: g[0].replace('_', '▢'), fixed: fixed || null, explain: g[3] + (g[4] ? ' – ' + g[4] : '') + '. ' + (tip || '') });
      } };
    }));
  }
