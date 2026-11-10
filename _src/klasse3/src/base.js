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

  /* Wort schreiben: answers = erlaubte Schreibweisen, o.ci = Gross/Klein egal */
  function WRITE(text, answers, o) {
    answers = [].concat(answers);
    var q = { text: text, write: { ans: answers, ci: !!(o && o.ci) }, ans: answers[0] };
    if (o) for (var k in o) if (k !== 'ci') q[k] = o[k];
    return q;
  }
  /* In die richtige Reihenfolge tippen: items stehen in der richtigen Reihenfolge */
  function ORDER(text, items, o) {
    items = items.map(String);
    var q = { text: text, order: { items: items, sep: (o && o.sep) != null ? o.sep : ' ', small: !!(o && o.tiny) }, ans: items.join((o && o.sep) != null ? o.sep : ' ') };
    if (o) for (var k in o) if (k !== 'sep' && k !== 'tiny') q[k] = o[k];
    return q;
  }
  /* Paare zuordnen: pairs = [[links, rechts], ...] */
  function MATCH(text, pairs, o) {
    var q = { text: text, match: { pairs: pairs.map(function (x) { return [String(x[0]), String(x[1])]; }) }, ans: pairs.map(function (x) { return x[0] + ' – ' + x[1]; }).join(', ') };
    q.explain = q.ans;
    if (o) for (var k in o) q[k] = o[k];
    return q;
  }

  var TOPICS = [];
  var EXPL = {};
  function topicById(id) { for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i]; return null; }
  /* Bestehendes Thema um neue Aufgabenformen erweitern (nur wenn rich, also nicht im Blitz) */
  function enrich(id, fn, share) {
    var t = topicById(id); if (!t) return;
    if (t.items) { var mk = t.items.map(function (it) { return it; }); mk.forEach(function (it) { var old = it.make; it.make = function (L, rich) { var q = rich && Math.random() < (share || 0.3) ? fn(L, it) : null; return q || old(L, rich); }; }); }
    else { var og = t.gen; t.gen = function (L, rich) { var q = rich && Math.random() < (share || 0.3) ? fn(L) : null; return q || og(L, rich); }; }
  }
  function addItems(id, items) { var t = topicById(id); if (t && t.items) items.forEach(function (it) { t.items.push(it); }); }
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
