/* Malmeister – App-Logik (Oberfläche, Kamera/Foto, Anleitung, Speichern, Galerie) */
(function () {
  'use strict';

  var VERSION = '1.1.0';
  var PROC = 640;        // Rechengröße der Bildanalyse (längste Seite)
  var PHOTO_MAX = 1280;  // gespeicherte Vorlage
  var DRAWING_MAX = 1600; // Foto vom gemalten Bild

  var $ = function (id) { return document.getElementById(id); };
  var letter = function (c) { return String.fromCharCode(65 + c); };

  /* ---------- Schritte ---------- */

  var INFO = {
    grid: { emoji: '📐', name: 'Gitter anlegen', spec: { mode: 'photo', grid: true }, legend: false,
      text: function (m) {
        var shape = m.cols > m.rows ? 'Lege das Blatt quer.' : m.rows > m.cols ? 'Lege das Blatt hoch.' : '';
        return 'Nimm ein weißes Blatt (A4), einen Bleistift und ein Lineal. Zeichne ein Gitter mit ' + m.cols + ' Feldern in der Breite und ' + m.rows +
          ' Feldern in der Höhe. Jedes Feld ist ' + String(m.cellCm).replace('.', ',') + ' cm groß. ' + shape;
      },
      tip: 'Zeichne ganz dünn und drücke nicht fest. Die Buchstaben (A, B, C …) stehen oben, die Zahlen (1, 2, 3 …) links. So findest du jedes Feld wieder.' },
    l1: { emoji: '✏️', name: 'Grobe Formen', spec: { mode: 'lines', upto: 1, grid: true }, legend: true,
      text: function () { return 'Zuerst kommen nur die langen, wichtigen Linien: Umriss, Kinn, Haarrand, große Formen. Die orangen Linien sind neu. Schau, in welchem Feld eine Linie beginnt und wo sie endet, und male sie in dein Gitter.'; },
      tip: 'Tippe auf ein Feld im Bild – dann siehst du es riesig (Feld-Lupe).' },
    l2: { emoji: '🖍️', name: 'Wichtige Linien', spec: { mode: 'lines', upto: 2, grid: true }, legend: true,
      text: function () { return 'Jetzt kommen Augen, Nase, Mund und weitere wichtige Linien dazu. Die grauen Linien hast du schon gemalt, die orangen sind neu.'; },
      tip: 'Arbeite Feld für Feld, von links oben nach rechts unten. Dann verwischst du nichts.' },
    l3: { emoji: '🔍', name: 'Kleine Details', spec: { mode: 'lines', upto: 3, grid: true }, legend: true,
      text: function () { return 'Jetzt die kleinen Sachen: Haarsträhnen, Falten, Muster. Das braucht Geduld, aber du schaffst das!'; },
      tip: 'Radieren ist erlaubt. Jeder Maler radiert mal.' },
    shade: { emoji: '🌗', name: 'Schatten schraffieren', spec: { mode: 'shade', grid: true }, legend: false,
      text: function () { return 'Male die dunklen Stellen mit vielen kleinen Strichen aus (schraffieren). Wenig Striche = hell. Kreuz und quer = ganz dunkel.'; },
      tip: 'Alle Striche in dieselbe Richtung, wie Regen. Das sieht schön aus.' },
    done: { emoji: '🎉', name: 'Fertig!', spec: { mode: 'final', grid: false }, legend: false,
      text: function () { return 'Radiere die Gitterlinien vorsichtig weg. Vergleiche mit der Vorlage (Knopf oben rechts). Dann mach ein Foto von deinem Kunstwerk!'; },
      tip: 'Leg dein Blatt bei hellem Licht auf den Tisch und fotografiere von oben, ohne Schatten.' }
  };
  var PLAN = {
    leicht: ['grid', 'l1', 'l2', 'done'],
    mittel: ['grid', 'l1', 'l2', 'l3', 'done'],
    profi:  ['grid', 'l1', 'l2', 'l3', 'shade', 'done']
  };
  var CHEERS = ['🎉 Super gemalt!', '🌟 Wow, das sieht toll aus!', '👏 Richtig gut geworden!', '🏆 Echter Malmeister!'];

  var state = { level: 'mittel', big: null, model: null, plan: [], idx: 0, peek: false, cache: new Map(), pending: 'photo',
                cell: { c: 0, r: 0 }, result: null, urls: [], viewId: null };

  /* ---------- Hilfen ---------- */

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privater Modus */ } }

  var toastTimer = 0;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 4200);
  }
  function openDlg(d) { if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); }
  function closeDlg(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  function stamp() { var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()); }
  function dateText(ts) { return new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function toBlob(canvas, type, q) { return new Promise(function (res) { canvas.toBlob(res, type, q); }); }
  function rev() { state.urls.forEach(function (u) { URL.revokeObjectURL(u); }); state.urls = []; }
  function objUrl(blob) { var u = URL.createObjectURL(blob); state.urls.push(u); return u; }

  async function fileToCanvas(file, maxSide) {
    var url = URL.createObjectURL(file);
    try {
      var img = new Image(); img.decoding = 'async'; img.src = url;
      await img.decode();
      var s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c;
    } finally { URL.revokeObjectURL(url); }
  }

  function putRGBA(ctx, r) { var id = ctx.createImageData(r.w, r.h); id.data.set(r.data); ctx.putImageData(id, 0, 0); }

  /* ---------- Bildanalyse (Worker mit Rückfall) ---------- */

  var worker = null, workerBroken = false;
  function analyze(imgData, level) {
    return new Promise(function (resolve, reject) {
      function inline() {
        setTimeout(function () {
          try { resolve(window.MS.analyze(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height, level)); } catch (e) { reject(e); }
        }, 30);
      }
      if (workerBroken || !window.Worker) return inline();
      try {
        worker = worker || new Worker('worker.js');
        worker.onmessage = function (e) { if (e.data.ok) resolve(e.data.model); else { workerBroken = true; inline(); } };
        worker.onerror = function () { workerBroken = true; inline(); };
        var buf = imgData.data.buffer.slice(0);
        worker.postMessage({ buf: buf, w: imgData.width, h: imgData.height, level: level }, [buf]);
      } catch (e) { workerBroken = true; inline(); }
    });
  }

  /* ---------- Speicher in der App (IndexedDB) ---------- */

  var DB = {
    db: null,
    open: function () {
      return new Promise(function (res, rej) {
        if (!window.indexedDB) return rej(new Error('kein IndexedDB'));
        var rq = indexedDB.open('malmeister', 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore('works', { keyPath: 'id', autoIncrement: true }); };
        rq.onsuccess = function () { res(rq.result); };
        rq.onerror = function () { rej(rq.error); };
      });
    },
    tx: async function (mode, fn) {
      this.db = this.db || await this.open();
      var db = this.db;
      return new Promise(function (res, rej) {
        var t = db.transaction('works', mode), out, r = fn(t.objectStore('works'));
        r.onsuccess = function () { out = r.result; };
        t.oncomplete = function () { res(out); };
        t.onerror = t.onabort = function () { rej(t.error); };
      });
    },
    add: function (o) { return this.tx('readwrite', function (s) { return s.add(o); }); },
    all: function () { return this.tx('readonly', function (s) { return s.getAll(); }); },
    count: function () { return this.tx('readonly', function (s) { return s.count(); }); },
    del: function (id) { return this.tx('readwrite', function (s) { return s.delete(id); }); }
  };

  /* ---------- Speichern im Handy (Teilen-Menü / Download) ---------- */

  async function saveToPhone(blob) {
    var name = 'malmeister-' + stamp() + '.jpg', file;
    try { file = new File([blob], name, { type: 'image/jpeg' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Mein Bild' }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    toast('Das Bild wurde heruntergeladen (Ordner „Downloads“ oder „Dateien“).');
  }

  /* ---------- Navigation (Hash-Routen) ---------- */

  var SCREENS = ['home', 'crop', 'busy', 'guide', 'result', 'gallery'];
  function showScreen(name) {
    SCREENS.forEach(function (s) { $('s-' + s).hidden = s !== name; });
    window.scrollTo(0, 0);
    var h = { home: 'h-home', crop: 'h-crop', busy: 'h-busy', guide: 'h-step', result: 'h-result', gallery: 'h-gallery' }[name];
    if (h) $(h).focus({ preventScroll: true });
  }
  function navigate(h) { if (location.hash === h) render(); else location.hash = h; }
  function render() {
    var parts = location.hash.replace(/^#\/?/, '').split('/'), name = parts[0] || 'home';
    if ((name === 'guide' || name === 'result') && !state.model) name = 'home';
    if (name === 'crop' && !state.big) name = 'home';
    if (name === 'result' && !state.result) name = 'guide';
    if (SCREENS.indexOf(name) < 0 || name === 'busy') name = 'home';
    if (name === 'guide') {
      var i = Math.max(0, Math.min(state.plan.length - 1, parseInt(parts[1], 10) || 0));
      if (i !== state.idx) state.peek = false;
      state.idx = i; renderGuide();
    }
    if (name === 'crop') setupCrop();
    if (name === 'result') renderResult();
    if (name === 'gallery') renderGallery();
    if (name === 'home') refreshCount();
    showScreen(name);
  }

  /* ---------- Start ---------- */

  function chooseFile(kind, camera) {
    state.pending = kind;
    $(camera ? 'in-cam' : 'in-pick').click();
  }

  async function startWithFile(file) {
    if (!file || (file.type && file.type.indexOf('image/') !== 0)) { toast('Das ist leider kein Bild.'); return; }
    showScreen('busy');
    try {
      state.big = await fileToCanvas(file, PHOTO_MAX);
      crop.z = 1; crop.cx = 0.5; crop.cy = 0.5;
      navigate('#/crop');
    } catch (e) {
      toast('Dieses Bild konnte ich nicht lesen. Versuch bitte ein anderes.');
      navigate('#/home'); showScreen('home');
    }
  }

  async function analyzeCrop() {
    showScreen('busy');
    try {
      var r = cropRect(), s = PROC / Math.max(r.vw, r.vh), sc = document.createElement('canvas');
      sc.width = Math.max(8, Math.round(r.vw * s)); sc.height = Math.max(8, Math.round(r.vh * s));
      var sctx = sc.getContext('2d', { willReadFrequently: true });
      sctx.drawImage(state.big, r.sx, r.sy, r.vw, r.vh, 0, 0, sc.width, sc.height);
      var model = await analyze(sctx.getImageData(0, 0, sc.width, sc.height), state.level);
      state.model = model; state.plan = PLAN[state.level]; state.idx = 0; state.peek = false; state.cache.clear(); state.result = null;
      navigate('#/guide/0');
    } catch (e) {
      toast('Das hat nicht geklappt. Versuch es bitte nochmal.');
      navigate('#/crop');
    }
  }

  /* ---------- Bildausschnitt wählen (ziehen und zoomen) ---------- */

  var crop = { z: 1, cx: 0.5, cy: 0.5 };
  function cropRect() {
    var b = state.big, vw = b.width / crop.z, vh = b.height / crop.z;
    crop.cx = Math.min(Math.max(crop.cx, vw / (2 * b.width)), 1 - vw / (2 * b.width));
    crop.cy = Math.min(Math.max(crop.cy, vh / (2 * b.height)), 1 - vh / (2 * b.height));
    return { sx: crop.cx * b.width - vw / 2, sy: crop.cy * b.height - vh / 2, vw: vw, vh: vh };
  }
  function drawCrop() {
    var b = state.big, cv = $('crop-canvas'), r = cropRect(), ctx = cv.getContext('2d');
    ctx.drawImage(b, r.sx, r.sy, r.vw, r.vh, 0, 0, cv.width, cv.height);
    /* Vorschau des Gitters für die gewählte Stufe */
    var gd = window.MS.gridFor(cv.width, cv.height, window.MS.LEVELS[state.level].grid), i;
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.beginPath();
    for (i = 1; i < gd.cols; i++) { ctx.moveTo(i * cv.width / gd.cols, 0); ctx.lineTo(i * cv.width / gd.cols, cv.height); }
    for (i = 1; i < gd.rows; i++) { ctx.moveTo(0, i * cv.height / gd.rows); ctx.lineTo(cv.width, i * cv.height / gd.rows); }
    ctx.stroke();
    $('crop-zoom').value = crop.z;
  }
  function sizeCrop() {
    var b = state.big, cv = $('crop-canvas'), maxH = window.innerHeight * 0.55, maxW = Math.min(window.innerWidth - 60, 500);
    var w = Math.min(maxW, maxH * b.width / b.height);
    cv.style.width = Math.round(w) + 'px';
  }
  function setupCrop() {
    var b = state.big, cv = $('crop-canvas');
    cv.width = 800; cv.height = Math.round(800 * b.height / b.width);
    sizeCrop(); drawCrop();
  }
  function initCrop() {
    var cv = $('crop-canvas'), ptrs = new Map(), last = null;
    function dist() { var p = Array.from(ptrs.values()); return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
    cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); last = ptrs.size === 2 ? dist() : null; });
    cv.addEventListener('pointermove', function (e) {
      if (!ptrs.has(e.pointerId)) return;
      var old = ptrs.get(e.pointerId), b = state.big, shown = cv.clientWidth;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) {
        crop.cx -= (e.clientX - old.x) / shown / crop.z; crop.cy -= (e.clientY - old.y) / shown / crop.z * (b.width / b.height);
      } else if (ptrs.size === 2) {
        var d = dist(); if (last) crop.z = Math.min(4, Math.max(1, crop.z * d / last)); last = d;
      }
      drawCrop();
    });
    function up(e) { ptrs.delete(e.pointerId); last = ptrs.size === 2 ? dist() : null; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    $('crop-zoom').addEventListener('input', function (e) { crop.z = parseFloat(e.target.value); drawCrop(); });
    $('btn-crop-ok').addEventListener('click', analyzeCrop);
    $('btn-crop-back').addEventListener('click', function () { navigate('#/home'); });
    window.addEventListener('resize', function () { if (!$('s-crop').hidden) sizeCrop(); });
  }

  async function refreshCount() {
    try {
      var n = await DB.count(), b = $('gallery-count');
      b.textContent = n; b.hidden = !n;
    } catch (e) { $('gallery-count').hidden = true; }
  }

  /* ---------- Anleitung ---------- */

  function stepSpec() {
    var spec = Object.assign({}, INFO[state.plan[state.idx]].spec);
    return state.peek ? { mode: 'photo', grid: spec.grid } : spec;
  }

  function composeStage() {
    var key = state.idx + (state.peek ? 'p' : '');
    if (state.cache.has(key)) return state.cache.get(key);
    var m = state.model, spec = stepSpec(), r = window.MS.renderStep(m, spec, 2);
    var M = spec.grid ? 44 : 0, c = document.createElement('canvas');
    c.width = r.w + M; c.height = r.h + M;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    var tmp = document.createElement('canvas'); tmp.width = r.w; tmp.height = r.h;
    putRGBA(tmp.getContext('2d'), r); ctx.drawImage(tmp, M, M);
    if (M) {
      ctx.fillStyle = '#4f6bff'; ctx.font = '700 ' + Math.round(M * 0.55) + 'px ui-rounded, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var x = 0; x < m.cols; x++) ctx.fillText(letter(x), M + (x + 0.5) * r.w / m.cols, M / 2);
      for (var y = 0; y < m.rows; y++) ctx.fillText(String(y + 1), M / 2, M + (y + 0.5) * r.h / m.rows);
    }
    var out = { canvas: c, M: M, w: r.w, h: r.h, grid: spec.grid };
    state.cache.set(key, out);
    if (state.cache.size > 4) state.cache.delete(state.cache.keys().next().value);
    return out;
  }

  function renderGuide() {
    var key = state.plan[state.idx], info = INFO[key], m = state.model, last = state.idx === state.plan.length - 1;
    $('step-emoji').textContent = info.emoji; $('step-name').textContent = info.name;
    $('step-count').textContent = 'Schritt ' + (state.idx + 1) + ' von ' + state.plan.length;
    $('step-text').textContent = info.text(m); $('step-tip').textContent = info.tip;
    var dots = $('dots'); dots.textContent = '';
    state.plan.forEach(function (_, i) {
      var li = document.createElement('li'); li.className = i < state.idx ? 'done' : i === state.idx ? 'now' : '';
      if (i === state.idx) li.setAttribute('aria-current', 'step'); dots.appendChild(li);
    });
    var st = composeStage(), cv = $('stage');
    cv.width = st.canvas.width; cv.height = st.canvas.height;
    cv.getContext('2d').drawImage(st.canvas, 0, 0);
    cv.setAttribute('aria-label', state.peek ? 'Vorlagenfoto' : info.name);
    $('legend').hidden = !info.legend || state.peek;
    $('btn-peek').setAttribute('aria-pressed', String(state.peek));
    $('btn-peek').setAttribute('aria-label', state.peek ? 'Zurück zur Anleitung' : 'Vorlagenfoto zeigen');
    $('btn-lupe').hidden = !st.grid;
    $('btn-pick-drawing').hidden = !last;
    $('btn-prev').disabled = state.idx === 0;
    $('btn-next').textContent = last ? '📸 Mein Bild fotografieren' : 'Weiter →';
  }

  function goStep(d) {
    var i = state.idx + d;
    if (i < 0) return;
    if (i >= state.plan.length) { chooseFile('drawing', true); return; }
    navigate('#/guide/' + i);
  }

  /* Feld-Lupe */
  function drawCell() {
    var m = state.model, c = state.cell.c, r = state.cell.r, cw = m.w / m.cols, ch = m.h / m.rows;
    var px = cw * 0.18, py = ch * 0.18;
    var reg = { x0: Math.max(0, c * cw - px), y0: Math.max(0, r * ch - py), x1: Math.min(m.w, (c + 1) * cw + px), y1: Math.min(m.h, (r + 1) * ch + py) };
    var cssW = Math.min(window.innerWidth - 56, 480), targetW = Math.min(1000, Math.round(cssW * (window.devicePixelRatio || 1)));
    var S = targetW / (reg.x1 - reg.x0);
    var spec = Object.assign({}, stepSpec(), { grid: false, thin: true });
    var res = window.MS.renderStep(m, spec, S, reg), cv = $('cell-canvas'), ctx;
    cv.width = res.w; cv.height = res.h; ctx = cv.getContext('2d'); putRGBA(ctx, res);
    ctx.strokeStyle = 'rgba(79,107,255,.9)'; ctx.lineWidth = Math.max(4, S * 0.9);
    ctx.strokeRect((c * cw - reg.x0) * S, (r * ch - reg.y0) * S, cw * S, ch * S);
    $('cell-title').textContent = 'Feld ' + letter(c) + (r + 1);
  }
  function openCell(c, r) { state.cell = { c: c, r: r }; drawCell(); openDlg($('dlg-cell')); }
  function stepCell(d) {
    var m = state.model, total = m.cols * m.rows, i = (state.cell.r * m.cols + state.cell.c + d + total) % total;
    state.cell = { c: i % m.cols, r: Math.floor(i / m.cols) }; drawCell();
  }

  function openZoom() {
    var st = composeStage(), cv = $('zoom-canvas');
    cv.width = st.canvas.width; cv.height = st.canvas.height; cv.getContext('2d').drawImage(st.canvas, 0, 0);
    openDlg($('dlg-zoom')); $('zoom-scroll').scrollTo(0, 0);
  }

  function onStageTap(e) {
    var st = composeStage(), cv = $('stage'), rect = cv.getBoundingClientRect();
    if (!st.grid) return openZoom();
    var fx = (e.clientX - rect.left) / rect.width * cv.width - st.M, fy = (e.clientY - rect.top) / rect.height * cv.height - st.M;
    var c = Math.floor(fx / (st.w / state.model.cols)), r = Math.floor(fy / (st.h / state.model.rows));
    if (c < 0 || r < 0 || c >= state.model.cols || r >= state.model.rows) return openZoom();
    openCell(c, r);
  }

  /* ---------- Ergebnis ---------- */

  function drawFit(cv, src, maxW) {
    var s = Math.min(1, maxW / src.width);
    cv.width = Math.round(src.width * s); cv.height = Math.round(src.height * s);
    cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
  }

  function photoCanvas() {
    var m = state.model, c = document.createElement('canvas'); c.width = m.w; c.height = m.h;
    var id = c.getContext('2d').createImageData(m.w, m.h); id.data.set(m.rgb); c.getContext('2d').putImageData(id, 0, 0);
    return c;
  }

  function renderResult() {
    drawFit($('res-drawing'), state.result.canvas, 640); drawFit($('res-photo'), photoCanvas(), 640);
    $('cheer').textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
    var b = $('btn-save-app'); b.disabled = !!state.result.savedId; b.textContent = state.result.savedId ? '✓ In „Meine Bilder“ gespeichert' : '⭐ In „Meine Bilder“ speichern';
  }

  async function handleDrawing(file) {
    if (!file || (file.type && file.type.indexOf('image/') !== 0)) { toast('Das ist leider kein Bild.'); return; }
    try {
      var c = await fileToCanvas(file, DRAWING_MAX), blob = await toBlob(c, 'image/jpeg', 0.9);
      state.result = { canvas: c, blob: blob, savedId: null };
      navigate('#/result');
    } catch (e) { toast('Dieses Foto konnte ich nicht lesen. Versuch es bitte nochmal.'); }
  }

  async function saveToApp() {
    var r = state.result; if (!r || r.savedId) return;
    try {
      var thumbC = document.createElement('canvas'); drawFit(thumbC, r.canvas, 480);
      var photoC = photoCanvas();
      var rec = { created: Date.now(), level: state.level,
        drawing: r.blob, thumb: await toBlob(thumbC, 'image/jpeg', 0.8), photo: await toBlob(photoC, 'image/jpeg', 0.85) };
      r.savedId = await DB.add(rec);
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
      renderResult(); toast('Gespeichert in „Meine Bilder“ ⭐');
    } catch (e) { toast('Speichern in der App klappt hier nicht. Nimm „Im Handy sichern“.'); }
  }

  /* ---------- Galerie ---------- */

  async function renderGallery() {
    rev();
    var list = [], ul = $('tiles'); ul.textContent = '';
    try { list = (await DB.all()).sort(function (a, b) { return b.created - a.created; }); } catch (e) { toast('„Meine Bilder“ geht in diesem Modus nicht.'); }
    $('gallery-empty').hidden = list.length > 0;
    list.forEach(function (w) {
      var li = document.createElement('li'), b = document.createElement('button'), img = document.createElement('img'), sp = document.createElement('span');
      b.type = 'button'; b.className = 'tile'; img.alt = 'Bild vom ' + dateText(w.created); img.src = objUrl(w.thumb); img.loading = 'lazy';
      sp.textContent = dateText(w.created); b.append(img, sp); li.appendChild(b); ul.appendChild(li);
      b.addEventListener('click', function () { openView(w); });
    });
  }

  function openView(w) {
    state.viewId = w.id; state.viewBlob = w.drawing;
    $('view-drawing').src = objUrl(w.drawing); $('view-photo').src = objUrl(w.photo);
    $('view-title').textContent = 'Bild vom ' + dateText(w.created);
    openDlg($('dlg-view'));
  }

  /* ---------- Installation ---------- */

  var deferredInstall = null;
  function setupInstall() {
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    if (standalone) return;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) { $('install-box').hidden = false; $('install-ios').hidden = false; }
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferredInstall = e; $('install-box').hidden = false; $('btn-install').hidden = false;
    });
    $('btn-install').addEventListener('click', async function () {
      if (!deferredInstall) return;
      deferredInstall.prompt(); await deferredInstall.userChoice.catch(function () {}); deferredInstall = null; $('install-box').hidden = true;
    });
    window.addEventListener('appinstalled', function () { $('install-box').hidden = true; });
  }

  function setupSaveHint() {
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var android = /android/i.test(navigator.userAgent);
    $('save-hint').innerHTML = ios ? 'Auf dem iPhone/iPad: Tippe danach auf <b>„Bild sichern“</b>, dann liegt es in Fotos.'
      : android ? 'Wähle danach z. B. <b>„Galerie“</b> oder <b>„Fotos“</b> aus.'
      : 'Das Bild wird in deinen Download-Ordner gelegt.';
  }

  /* ---------- Start der App ---------- */

  function init() {
    $('ver').textContent = VERSION;
    var saved = lsGet('malmeister.level'); if (PLAN[saved]) state.level = saved;
    document.querySelectorAll('input[name="level"]').forEach(function (r) {
      r.checked = r.value === state.level;
      r.addEventListener('change', function () { state.level = r.value; lsSet('malmeister.level', r.value); });
    });

    $('btn-camera').addEventListener('click', function () { chooseFile('photo', true); });
    $('btn-pick').addEventListener('click', function () { chooseFile('photo', false); });
    initCrop();
    $('btn-gallery').addEventListener('click', function () { navigate('#/gallery'); });
    $('btn-gallery-back').addEventListener('click', function () { navigate('#/home'); });
    $('btn-back-home').addEventListener('click', function () { navigate('#/home'); });

    function onFile(e) {
      var f = e.target.files && e.target.files[0]; e.target.value = '';
      if (!f) return;
      if (state.pending === 'drawing') handleDrawing(f); else startWithFile(f);
    }
    $('in-cam').addEventListener('change', onFile); $('in-pick').addEventListener('change', onFile);

    $('btn-prev').addEventListener('click', function () { goStep(-1); });
    $('btn-next').addEventListener('click', function () { goStep(1); });
    $('btn-peek').addEventListener('click', function () { state.peek = !state.peek; renderGuide(); });
    $('btn-lupe').addEventListener('click', function () { openCell(state.cell.c, state.cell.r); });
    $('btn-big').addEventListener('click', openZoom);
    $('btn-pick-drawing').addEventListener('click', function () { chooseFile('drawing', false); });
    $('stage').addEventListener('click', onStageTap);
    $('cell-prev').addEventListener('click', function () { stepCell(-1); });
    $('cell-next').addEventListener('click', function () { stepCell(1); });

    $('btn-result-back').addEventListener('click', function () { navigate('#/guide/' + (state.plan.length - 1)); });
    $('btn-save-app').addEventListener('click', saveToApp);
    $('btn-save-phone').addEventListener('click', function () { if (state.result) saveToPhone(state.result.blob); });
    $('btn-retake').addEventListener('click', function () { chooseFile('drawing', true); });
    $('btn-new').addEventListener('click', function () { state.result = null; navigate('#/home'); });

    $('view-save').addEventListener('click', function () { if (state.viewBlob) saveToPhone(state.viewBlob); });
    $('view-delete').addEventListener('click', function () { openDlg($('dlg-confirm')); });
    $('confirm-yes').addEventListener('click', async function () {
      try { await DB.del(state.viewId); } catch (e) { toast('Löschen hat nicht geklappt.'); }
      closeDlg($('dlg-confirm')); closeDlg($('dlg-view')); renderGallery(); toast('Bild gelöscht.');
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-close]'); if (b) closeDlg(b.closest('dialog'));
    });
    $('dlg-view').addEventListener('close', rev);

    document.addEventListener('keydown', function (e) {
      if (document.querySelector('dialog[open]') || $('s-guide').hidden) return;
      if (e.key === 'ArrowRight') goStep(1); else if (e.key === 'ArrowLeft') goStep(-1);
    });

    window.addEventListener('hashchange', render);
    setupInstall(); setupSaveHint();
    if (!location.hash) history.replaceState(null, '', '#/home');
    render();

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js?v=' + VERSION).catch(function () { /* offline-Funktion optional */ });
    }
  }

  init();
})();
