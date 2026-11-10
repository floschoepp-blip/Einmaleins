  /* ================= KERN ================= */
  /* Online-Bestenliste: Firebase (Realtime Database + anonyme Anmeldung). Leer = nur auf diesem Geraet. */
  var FB = { apiKey: 'AIzaSyCoBlKKHyzsb7zadEyDQQ7BB6V5dStJ1os', db: 'https://klasse3a-5ef03-default-rtdb.europe-west1.firebasedatabase.app' };

  var KEY = 'klasse3-v1';
  var LV = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6500];
  var LV_NAME = ['Neuling', 'Entdecker', 'Tüftler', 'Schlaukopf', 'Profi', 'Ass', 'Champion', 'Meister', 'Superhirn', 'Legende', 'Genie', 'Mega-Genie', 'Weltmeister'];
  var WEIGHT = [6, 4, 2, 1];
  var LOOK_ORDER = ['kiwi', 'bear', 'cat', 'unicorn', 'sloth', 'mermaid', 'butterfly', 'space', 'football', 'heft'];
  var BY_ID = {};
  TOPICS.forEach(function (t) { BY_ID[t.id] = t; });
  var RM = false;
  try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function rid(n) { var s = '', c = 'abcdefghijkmnpqrstuvwxyz23456789'; while (s.length < n) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function weekKey() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); var w1 = new Date(d.getFullYear(), 0, 4); return d.getFullYear() + '-W' + ('0' + (1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7))).slice(-2); }
  function zero() { return { de: 0, ma: 0, hsu: 0, en: 0 }; }
  function mkPlayer(name, look) { return { pid: rid(6), name: name, look: look, pts: 0, sub: zero(), wk: weekKey(), wpts: 0, wsub: zero(), topics: {}, box: {}, seenLv: 0, streak: { d: '', n: 0 }, best: 0, rounds: 0 }; }
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (d && Array.isArray(d.players)) {
        if (typeof d.sound !== 'boolean') d.sound = true;
        if (typeof d.code !== 'string') d.code = '';
        if (!(d.cur >= 0 && d.cur < d.players.length)) d.cur = 0;
        d.players.forEach(function (p) { p.sub = p.sub || zero(); p.wsub = p.wsub || zero(); p.topics = p.topics || {}; p.box = p.box || {}; p.streak = p.streak || { d: '', n: 0 }; if (!LOOKS[p.look]) p.look = 'kiwi'; });
        return d;
      }
    } catch (e) {}
    return { cur: 0, sound: true, code: '', players: [] };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  var D = load();
  function P() { return D.players[D.cur]; }
  function rollWeek(p) { var k = weekKey(); if (p.wk !== k) { p.wk = k; p.wpts = 0; p.wsub = zero(); } }
  function level(pts) { var l = 0; while (l + 1 < LV.length && pts >= LV[l + 1]) l++; return l; }
  function av(look, cls, mood) { return '<span class="av ' + (cls || '') + '" style="background:' + (LOOKS[look] || LOOKS.kiwi).bg + '">' + mascotSVG(look, mood || 'happy') + '</span>'; }

  /* ---------- Ton ---------- */
  var AC = null;
  function ac() {
    if (!D.sound) return null;
    try { if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); } if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; }
  }
  function tone(freq, t0, dur, vol, type, slide) {
    var c = ac(); if (!c) return;
    try {
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
      o.type = type || 'triangle'; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch (e) {}
  }
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  var SND = {
    tap: function () { tone(520, 0, 0.05, 0.05); },
    ok: function (st) { var b = 523 * Math.pow(1.06, Math.min(st || 0, 6)); tone(b, 0, 0.1, 0.12); tone(b * 1.26, 0.09, 0.16, 0.12); },
    no: function () { tone(230, 0, 0.25, 0.09, 'sawtooth', 140); },
    star: function (i) { tone(660 + i * 160, 0, 0.22, 0.12); },
    win: function () { [60, 64, 67, 72, 76].forEach(function (n, i) { tone(midi(n), i * 0.1, 0.24, 0.12); }); }
  };
  var tuneTimer = null;
  function playTune(tu) {
    stopTune();
    if (!tu || !ac()) return;
    var p = tu.split('|'), step = 60 / (+p[0]) / 2, notes = p[2].split(' '), i = 0;
    function tick() { var n = notes[i % notes.length]; i++; if (n !== '-') { tone(midi(+n), 0, step * 1.6, 0.09, p[1]); if (i % 4 === 1) tone(midi(+n - 24), 0, step * 1.8, 0.07, 'sine'); } }
    tick(); tuneTimer = setInterval(tick, step * 1000);
  }
  function stopTune() { if (tuneTimer) { clearInterval(tuneTimer); tuneTimer = null; } }

  /* ---------- Englische Aussprache ---------- */
  var VOICE = null;
  function findVoice() {
    try {
      var vs = speechSynthesis.getVoices(), pref = ['Daniel', 'Kate', 'Serena', 'Martha', 'Arthur', 'Google UK English Female', 'Google UK English Male'], i, v;
      for (i = 0; i < pref.length; i++) { v = vs.filter(function (x) { return x.name.indexOf(pref[i]) === 0 && /^en[-_]GB/i.test(x.lang); })[0]; if (v) return v; }
      return vs.filter(function (x) { return /^en[-_]GB/i.test(x.lang); })[0] || vs.filter(function (x) { return /^en/i.test(x.lang); })[0] || null;
    } catch (e) { return null; }
  }
  try { if ('speechSynthesis' in window) { VOICE = findVoice(); speechSynthesis.onvoiceschanged = function () { VOICE = findVoice(); }; } } catch (e) {}
  /* Aufnahmen (audio/<wort>.mp3) zuerst, Geraetestimme nur als Ersatz */
  var AUD = null, audUnlocked = false, SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  try { AUD = new Audio(); AUD.preload = 'auto'; } catch (e) {}
  function unlockAudio() {
    if (audUnlocked || !AUD) return; audUnlocked = true;
    try { AUD.src = SILENT; var pr = AUD.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
  }
  document.addEventListener('pointerdown', unlockAudio, true);
  document.addEventListener('touchend', unlockAudio, true);
  function slug(t) { return String(t).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function speakDevice(text, btn) {
    try {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB'; u.rate = 0.9;
      if (!VOICE) VOICE = findVoice();
      if (VOICE) u.voice = VOICE;
      if (btn) { btn.classList.add('playing'); u.onend = u.onerror = function () { btn.classList.remove('playing'); }; }
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  var sayBtn = null, sayId = 0;
  function say(text, btn) {
    if (!AUD) { speakDevice(text, btn); return; }
    var id = ++sayId, done = false;
    if (sayBtn) sayBtn.classList.remove('playing');
    sayBtn = btn || null;
    function end() { if (id === sayId && sayBtn) sayBtn.classList.remove('playing'); }
    function fail() { if (done || id !== sayId) return; done = true; end(); speakDevice(text, btn); }
    try {
      AUD.onended = end; AUD.onerror = fail;
      AUD.src = 'audio/' + slug(text) + '.mp3';
      if (btn) btn.classList.add('playing');
      var pr = AUD.play();
      if (pr && pr.catch) pr.catch(function (e) { if (e && e.name === 'AbortError') return; fail(); });
    } catch (e) { fail(); }
  }
  function stopSay() { sayId++; try { if (AUD) AUD.pause(); } catch (e) {} if (sayBtn) sayBtn.classList.remove('playing'); try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- Effekte ---------- */
  function burst(x, y, n, wide) {
    if (RM) return;
    var fx = $('#fx'), gl = ['★', '●', '◆', '♥'], cols = ['var(--sun)', 'var(--de)', 'var(--ma)', 'var(--hsu)', 'var(--en)'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.textContent = gl[i % 4]; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = cols[i % 5];
      var a = Math.random() * Math.PI * 2, d = (wide ? 110 : 50) + Math.random() * (wide ? 220 : 80);
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', (Math.sin(a) * d - (wide ? 90 : 20)) + 'px'); s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      s.style.fontSize = (12 + Math.random() * (wide ? 18 : 8)) + 'px';
      fx.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1300); })(s);
    }
  }
  function burstAt(el, n, wide) { if (!el) return; var r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n, wide); }
  var toastT = null;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 2600); }

  /* ---------- Belohnungs-GIFs ---------- */
  var HAT = '<svg viewBox="0 0 40 48" style="position:absolute;left:28%;top:-24%;width:44%;z-index:2"><path d="M20 4 L36 44 L4 44 Z" fill="#ff5ea8" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="5" r="5" fill="#ffd23f"/></svg>';
  var SLICE = '<path d="M20 38 L4 6 Q20 -2 36 6 Z" fill="#ffc14d" stroke="#d98a1f" stroke-width="2" stroke-linejoin="round"/><circle cx="15" cy="14" r="3.5" fill="#e0453a"/><circle cx="24" cy="20" r="3.5" fill="#e0453a"/><circle cx="19" cy="27" r="2.5" fill="#e0453a"/>';
  var CROWN = '<svg class="crown" viewBox="0 0 60 36" style="position:absolute"><path d="M4 32 L2 8 L18 20 L30 2 L42 20 L58 8 L56 32 Z" fill="#ffd23f" stroke="#b87a00" stroke-width="3" stroke-linejoin="round"/><circle cx="30" cy="24" r="4" fill="#ff4fa3"/></svg>';
  var CLIPS = [
    { id: 'dance', n: 'Tanzparty', tune: '132|square|60 - 67 - 64 67 72 - 60 - 67 - 65 64 62 -', h: function (m) { return '<div class="scn c-dance"><i class="lt l1"></i><i class="lt l2"></i><i class="lt l3"></i><i class="disco"></i><div class="m">' + HAT + m + '</div></div>'; } },
    { id: 'tramp', n: 'Trampolin', tune: '120|triangle|60 64 67 72 76 72 67 64 62 65 69 74 77 74 69 65', h: function (m) { return '<div class="scn c-tramp"><i class="leg lg1"></i><i class="leg lg2"></i><i class="bed"></i><div class="m">' + m + '</div></div>'; } },
    { id: 'rocket', n: 'Raketenstart', tune: '150|sawtooth|48 48 60 48 51 51 63 51 53 53 65 53 55 55 67 55', h: function (m) {
      var s = '', sx = [8, 22, 36, 52, 66, 80, 90, 15], sd = [0, -0.3, -0.7, -0.15, -0.5, -0.9, -0.2, -0.6], i;
      for (i = 0; i < 8; i++) s += '<i class="sk" style="left:' + sx[i] + '%;animation-delay:' + sd[i] + 's"></i>';
      return '<div class="scn c-rocket">' + s + '<div class="rk" style="position:absolute"><svg class="fl" viewBox="0 0 40 50"><path d="M20 0 C34 14 36 34 20 50 C4 34 6 14 20 0 Z" fill="#ff9f1c"/><path d="M20 8 C28 18 28 30 20 40 C12 30 12 18 20 8 Z" fill="#ffe066"/></svg><svg class="body" viewBox="0 0 100 200"><path d="M18 112 L-4 164 L18 150 Z M82 112 L104 164 L82 150 Z" fill="#e5484d"/><path d="M50 4 C74 30 82 62 82 100 L82 150 L18 150 L18 100 C18 62 26 30 50 4 Z" fill="#f4f6ff" stroke="#c9d0f0" stroke-width="2"/><path d="M50 4 C60 14 68 26 72 38 L28 38 C32 26 40 14 50 4 Z" fill="#e5484d"/></svg><i class="win">' + m + '</i></div></div>'; } },
    { id: 'juggle', n: 'Jongleur', tune: '126|triangle|72 - 76 - 79 - 76 - 74 - 77 - 81 - 77 -', h: function (m) {
      var s = '', c = ['#ff4d6d', '#3a86ff', '#2fd67b'], g = ['★', '♥', '●'], dl = ['0s', '-0.8s', '-1.6s'], i;
      for (i = 0; i < 3; i++) s += '<i class="jx" style="animation-delay:' + dl[i] + '"><b class="jy" style="background:' + c[i] + ';animation-delay:' + dl[i] + '">' + g[i] + '</b></i>';
      return '<div class="scn c-juggle">' + s + '<div class="m">' + m + '</div></div>'; } },
    { id: 'skate', n: 'Skateboard-Trick', tune: '140|square|64 64 67 64 69 67 64 - 62 62 65 62 67 65 62 -', h: function (m) { return '<div class="scn c-skate"><i class="sun"></i><div class="rd" style="position:absolute"><span><div class="m">' + m + '</div><i class="brd"></i></span></div></div>'; } },
    { id: 'balloon', n: 'Ballonflug', tune: '96|sine|72 76 79 84 79 76 74 77 81 86 81 77 72 - 84 -', h: function (m) { return '<div class="scn c-balloon"><i class="cl c1"></i><i class="cl c2"></i><i class="cl c3"></i><div class="fl" style="position:absolute"><i class="bl b1"></i><i class="bl b2"></i><i class="bl b3"></i><div class="m">' + m + '</div></div></div>'; } },
    { id: 'hero', n: 'Superheld', tune: '138|sawtooth|55 - 55 62 - 62 67 - 67 66 64 62 67 - - -', h: function (m) { return '<div class="scn c-hero"><i class="cl c1"></i><i class="cl c2"></i><i class="cl c3"></i><div class="fly" style="position:absolute"><svg class="cape" viewBox="0 0 60 40" style="position:absolute"><path d="M60 4 L4 0 Q20 20 6 40 L60 36 Z" fill="#e5334f"/></svg><div class="m">' + m + '</div></div><b class="pow">ZACK!</b></div>'; } },
    { id: 'dj', n: 'DJ-Pult', tune: '128|square|48 - 60 48 - 60 51 - 63 51 - 63 53 60 65 67', h: function (m) {
      var s = '', c = ['#ff4fa3', '#ffd23f', '#3da5ff', '#2fd67b', '#ff9f1c', '#b78cff', '#ff4fa3', '#3da5ff'], i;
      for (i = 0; i < 8; i++) s += '<i class="eq" style="left:' + (4 + i * 12) + '%;background:' + c[i] + ';animation-delay:-' + (i * 0.13 % 0.5).toFixed(2) + 's;animation-duration:' + (0.4 + (i * 7 % 5) / 10) + 's"></i>';
      return '<div class="scn c-dj">' + s + '<div class="m">' + m + '</div><i class="desk"></i><i class="disc d1"></i><i class="disc d2"></i></div>'; } },
    { id: 'rainbow', n: 'Regenbogen-Rutsche', tune: '112|triangle|60 62 64 65 67 69 71 72 72 71 69 67 65 64 62 60', h: function (m) { return '<div class="scn c-rainbow"><i class="rb"></i><div class="orb" style="position:absolute"><div class="m">' + m + '</div></div><i class="cld cd1"></i><i class="cld cd2"></i></div>'; } },
    { id: 'fire', n: 'Feuerwerk', tune: '144|triangle|67 - 72 - 76 - 79 84 - 79 - 76 77 79 81 84', h: function (m) { return '<div class="scn c-fire"><i class="fw f1"></i><i class="fw f2"></i><i class="fw f3"></i><i class="fw f4"></i><div class="m">' + m + '</div></div>'; } },
    { id: 'pizza', n: 'Pizza-Regen', tune: '120|square|60 64 67 64 65 69 72 69 67 71 74 71 72 - 72 -', h: function (m) {
      var s = '', px = [6, 22, 38, 54, 70, 84], pd = [0, -0.6, -1.3, -0.3, -1, -1.6], i;
      for (i = 0; i < 6; i++) s += '<svg class="pz" style="position:absolute;left:' + px[i] + '%;animation-delay:' + pd[i] + 's" viewBox="0 0 40 40">' + SLICE + '</svg>';
      return '<div class="scn c-pizza">' + s + '<div class="m">' + m + '</div></div>'; } },
    { id: 'cup', n: 'Goldpokal', tune: '132|sawtooth|60 60 60 64 - 60 64 67 - - 72 72 71 67 72 -', h: function (m) {
      var s = '', c = ['#ff4fa3', '#3da5ff', '#2fd67b', '#fff', '#9b5de5'], i;
      for (i = 0; i < 12; i++) s += '<i class="cf" style="left:' + (4 + i * 8) + '%;background:' + c[i % 5] + ';animation-delay:-' + (i * 0.37 % 2.4).toFixed(2) + 's"></i>';
      return '<div class="scn c-cup"><i class="rays"></i>' + s + '<svg class="cup" viewBox="0 0 60 60" style="position:absolute"><path d="M14 6 h32 v14 a16 16 0 0 1 -32 0 z" fill="#fff3b0" stroke="#b87a00" stroke-width="3"/><path d="M14 10 h-8 a8 8 0 0 0 8 12 M46 10 h8 a8 8 0 0 1 -8 12" fill="none" stroke="#b87a00" stroke-width="3"/><path d="M26 36 h8 v10 h8 v8 h-24 v-8 h8 z" fill="#fff3b0" stroke="#b87a00" stroke-width="3" stroke-linejoin="round"/></svg><div class="m">' + CROWN + m + '</div></div>'; } }
  ];
  function clipHTML(c) { return c.h(mascotSVG(P().look, 'happy')); }
  var ovQueue = [];
  function showClip(c, fresh, lv) {
    $('#ov-k').textContent = fresh ? 'Level ' + (lv + 1) + ' geschafft! Neues GIF:' : 'Deine Belohnung';
    $('#ov-t').textContent = c.n;
    $('#ov-stage').innerHTML = clipHTML(c);
    $('#ov-c').textContent = fresh ? 'Du bist jetzt „' + LV_NAME[lv] + '“. Das GIF liegt in deiner Sammlung.' : 'Tippe auf Weiter, wenn du genug getanzt hast.';
    $('#ov').hidden = false; document.body.classList.add('noscroll');
    if (fresh) { SND.win(); burst(window.innerWidth / 2, window.innerHeight * 0.3, 50, true); setTimeout(function () { if (!$('#ov').hidden) playTune(c.tune); }, 700); }
    else playTune(c.tune);
  }
  function closeOv() {
    stopTune(); $('#ov').hidden = true; $('#ov-stage').innerHTML = ''; document.body.classList.remove('noscroll');
    if (ovQueue.length) { var n = ovQueue.shift(); setTimeout(function () { showClip(n[0], true, n[1]); }, 250); }
  }

  /* ---------- Online-Bestenliste ---------- */
  var ON = { ready: !!(FB.apiKey && FB.db), board: null, at: 0, err: '' };
  var AKEY = 'klasse3-auth';
  function getAuth() { try { return JSON.parse(localStorage.getItem(AKEY) || 'null'); } catch (e) { return null; } }
  function setAuth(a) { try { localStorage.setItem(AKEY, JSON.stringify(a)); } catch (e) {} }
  function jfetch(url, opt) { return fetch(url, opt).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.error && (j.error.message || j.error)) || r.status); return j; }); }); }
  function token() {
    var a = getAuth();
    if (a && a.exp > Date.now() + 60000) return Promise.resolve(a);
    if (a && a.refresh) {
      return jfetch('https://securetoken.googleapis.com/v1/token?key=' + FB.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(a.refresh) })
        .then(function (j) { var n = { uid: j.user_id, tok: j.id_token, refresh: j.refresh_token, exp: Date.now() + (+j.expires_in) * 1000 }; setAuth(n); return n; });
    }
    return jfetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) })
      .then(function (j) { var n = { uid: j.localId, tok: j.idToken, refresh: j.refreshToken, exp: Date.now() + (+j.expiresIn) * 1000 }; setAuth(n); return n; });
  }
  function myKey(a, p) { return a.uid + '_' + p.pid; }
  function entry(p) { rollWeek(p); return { n: p.name.slice(0, 12), a: p.look, t: p.pts, s: p.sub, wk: p.wk, wt: p.wpts, ws: p.wsub, lv: level(p.pts), g: { s: p.snk || 0, t: p.tet || 0, i: p.inv || 0 }, u: Date.now() }; }
  function pushScore(p) {
    if (!ON.ready || !D.code || !p) return Promise.resolve();
    return token().then(function (a) {
      return jfetch(FB.db + '/classes/' + encodeURIComponent(D.code) + '/players/' + myKey(a, p) + '.json?auth=' + a.tok, { method: 'PUT', body: JSON.stringify(entry(p)) });
    }).then(function () { ON.err = ''; }).catch(function (e) { ON.err = String(e.message || e); });
  }
  function removeScore(p, code) {
    if (!ON.ready || !code) return Promise.resolve();
    return token().then(function (a) { return fetch(FB.db + '/classes/' + encodeURIComponent(code) + '/players/' + myKey(a, p) + '.json?auth=' + a.tok, { method: 'DELETE' }); }).catch(function () {});
  }
  function fetchBoard() {
    if (!ON.ready || !D.code) return Promise.resolve(null);
    return token().then(function (a) {
      return jfetch(FB.db + '/classes/' + encodeURIComponent(D.code) + '/players.json?auth=' + a.tok).then(function (j) {
        var list = [], k;
        j = j || {};
        for (k in j) if (j[k] && typeof j[k].n === 'string') list.push({ key: k, mine: k.indexOf(a.uid + '_') === 0, pid: k.slice(a.uid.length + 1), n: j[k].n.slice(0, 14), a: j[k].a, t: +j[k].t || 0, s: j[k].s || {}, wk: j[k].wk, wt: +j[k].wt || 0, ws: j[k].ws || {}, lv: +j[k].lv || 0, g: j[k].g || {} });
        ON.board = list; ON.at = Date.now(); ON.err = '';
        return list;
      });
    }).catch(function (e) { ON.err = String(e.message || e); return null; });
  }
  function cleanCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9ÄÖÜ-]/g, '').slice(0, 12); }
  function localBoard() { return D.players.map(function (p) { rollWeek(p); return { key: p.pid, mine: true, pid: p.pid, n: p.name, a: p.look, t: p.pts, s: p.sub, wk: p.wk, wt: p.wpts, ws: p.wsub, lv: level(p.pts), g: { s: p.snk || 0, t: p.tet || 0, i: p.inv || 0 } }; }); }
  function ranked(tab, f) {
    var src = (ON.ready && D.code && ON.board) ? ON.board.slice() : localBoard(), wk = weekKey(), me = P();
    if (ON.ready && D.code && ON.board && me) { /* eigene Zahlen sofort zeigen, auch wenn der Server noch alt ist */
      D.players.forEach(function (p) { var e = entry(p), hit = src.filter(function (x) { return x.mine && x.pid === p.pid; })[0]; if (hit) { hit.t = Math.max(hit.t, e.t); if (e.wk === wk) { hit.wk = wk; hit.wt = e.wt; hit.ws = e.ws; } hit.s = e.s; hit.n = e.n; hit.a = e.a; hit.g = e.g; } });
    }
    var game = f === 'snk' ? 's' : f === 'tet' ? 't' : f === 'inv' ? 'i' : '';
    var rows = src.map(function (x) { var v = game ? +(x.g || {})[game] || 0 : tab === 'w' ? (x.wk === wk ? (f ? +x.ws[f] || 0 : x.wt) : 0) : (f ? +x.s[f] || 0 : x.t); return { x: x, v: v, me: !!(me && x.mine && x.pid === me.pid) }; });
    if (tab === 'w' || game) rows = rows.filter(function (r) { return r.v > 0 || r.me; });
    rows.sort(function (a, b) { return b.v - a.v || a.x.n.localeCompare(b.x.n); });
    return rows;
  }

  /* ---------- Ansichten ---------- */
  var VIEWS = ['onb', 'home', 'subj', 'play', 'res', 'board', 'album', 'prof', 'snake', 'tet', 'inv'], view = '';
  function show(v) {
    view = v;
    VIEWS.forEach(function (k) { $('#v-' + k).hidden = k !== v; });
    var navOn = ['home', 'board', 'album', 'prof'].indexOf(v) >= 0;
    $('#nav').hidden = !navOn; $('#dock').hidden = v !== 'subj';
    [].forEach.call(document.querySelectorAll('#nav button'), function (b) { b.setAttribute('aria-current', b.getAttribute('data-v') === v ? 'true' : 'false'); });
    try { window.scrollTo(0, 0); } catch (e) {}
    stopSay(); $('#ex').hidden = true;
    if (v !== 'snake') snakeStop();
    if (v !== 'tet') tetStop();
    if (v !== 'inv') invStop();
    if (['snake', 'tet', 'inv'].indexOf(v) < 0 && $('#ov').hidden) document.body.classList.remove('noscroll');
  }
  function mastery(p, id) { var t = p.topics[id]; if (!t || !t.rec) return 0; return (t.rec.split('1').length - 1) / 12; }
  function pips(m) { return m >= 0.92 ? 3 : m >= 0.6 ? 2 : m >= 0.3 ? 1 : 0; }
  function lvlOf(p, id) { var m = mastery(p, id); return m >= 0.8 ? 3 : m >= 0.45 ? 2 : 1; }
  function xpBar(pts, bar, l1, l2) {
    var l = level(pts), a = LV[l], b = LV[l + 1];
    $(bar).style.transform = 'scaleX(' + (b ? Math.max(0.03, (pts - a) / (b - a)) : 1) + ')';
    $(l1).textContent = 'Level ' + (l + 1) + ' · ' + LV_NAME[l];
    $(l2).textContent = b ? 'noch ' + (b - pts) + ' bis Level ' + (l + 2) : 'Höchstes Level!';
  }

  function renderHome() {
    var p = P(); rollWeek(p);
    $('#h-av').innerHTML = av(p.look);
    $('#h-name').textContent = p.name;
    $('#h-title').textContent = 'Level ' + (level(p.pts) + 1) + ' · ' + LV_NAME[level(p.pts)];
    var st = p.streak.d === today() ? p.streak.n : (p.streak.d === yesterday() ? p.streak.n : 0);
    $('#h-streak').textContent = st; $('#h-pts').textContent = p.pts;
    xpBar(p.pts, '#h-xp', '#h-lv', '#h-next');
    var box = $('#h-subj'); box.innerHTML = '';
    SUBJ_ORDER.forEach(function (s) {
      var ts = TOPICS.filter(function (t) { return t.s === s; }), got = 0;
      ts.forEach(function (t) { got += pips(mastery(p, t.id)); });
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'subj'; b.style.setProperty('--c', SUBJ[s].c);
      b.innerHTML = '<span class="em">' + SUBJ[s].e + '</span><b>' + SUBJ[s].n + '</b><span>' + got + ' von ' + ts.length * 3 + ' Sternen</span><span class="bar"><i style="width:' + Math.round(got / (ts.length * 3) * 100) + '%"></i></span>';
      b.addEventListener('click', function () { SND.tap(); openSubj(s); });
      box.appendChild(b);
    });
    renderTeaser();
  }
  function yesterday() { var d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function renderTeaser() {
    var rows = ranked('w', ''), i, me = -1;
    for (i = 0; i < rows.length; i++) if (rows[i].me) me = i;
    if (ON.ready && !D.code) { $('#h-rank').textContent = '🏆'; $('#h-rt').textContent = 'Spiel gegen deine Klasse!'; $('#h-rs').textContent = 'Klassen-Code eingeben oder neu anlegen'; return; }
    $('#h-rank').textContent = me >= 0 && rows[me].v > 0 ? (me + 1) + '.' : '–';
    $('#h-rt').textContent = me >= 0 && rows[me].v > 0 ? 'Platz ' + (me + 1) + ' von ' + rows.length + ' diese Woche' : 'Diese Woche noch keine Punkte';
    $('#h-rs').textContent = ON.ready && D.code ? 'Klasse ' + D.code + (me > 0 ? ' · noch ' + (rows[me - 1].v - rows[me].v + 1) + ' Punkte bis Platz ' + me : '') : 'Bestenliste ansehen';
  }

  /* Fach */
  var SEL = { s: 'de', ids: [] };
  function openSubj(s) {
    SEL = { s: s, ids: [] };
    document.documentElement.style.setProperty('--acc', SUBJ[s].c);
    $('#s-title').textContent = SUBJ[s].e + ' ' + SUBJ[s].n;
    renderTopics(); show('subj');
  }
  function renderTopics() {
    var p = P(), box = $('#s-topics'); box.innerHTML = '';
    TOPICS.filter(function (t) { return t.s === SEL.s; }).forEach(function (t) {
      var w = document.createElement('div'); w.className = 'tpw';
      var b = document.createElement('button'), n = pips(mastery(p, t.id)), on = SEL.ids.indexOf(t.id) >= 0;
      b.type = 'button'; b.className = 'tp'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = '<span class="em">' + t.e + '</span><b></b><span class="pips" aria-label="' + n + ' von 3 Sternen"><i class="' + (n > 0 ? 'on' : '') + '">★</i><i class="' + (n > 1 ? 'on' : '') + '">★</i><i class="' + (n > 2 ? 'on' : '') + '">★</i></span>';
      b.querySelector('b').textContent = t.n;
      b.addEventListener('click', function () { var i = SEL.ids.indexOf(t.id); if (i >= 0) SEL.ids.splice(i, 1); else SEL.ids.push(t.id); SND.tap(); renderTopics(); });
      w.appendChild(b);
      if (EXPL[t.id]) { var ib = document.createElement('button'); ib.type = 'button'; ib.className = 'tp-i'; ib.textContent = '?'; ib.setAttribute('aria-label', 'Erklärung zu ' + t.n); ib.addEventListener('click', function () { openEx(t.id); }); w.appendChild(ib); }
      box.appendChild(w);
    });
    $('#d-info').textContent = SEL.ids.length ? SEL.ids.length + (SEL.ids.length === 1 ? ' Thema' : ' Themen') + ' ausgewählt' : 'Alle Themen gemischt';
  }

  /* ---------- Spielrunde ---------- */
  var S = null;
  function start(mode, ids, subj) {
    stop();
    S = { mode: mode, ids: ids.slice(), subj: subj, asked: 0, right: 0, pts: 0, by: zero(), wrong: [], retry: [], used: {}, streak: 0, cur: null, input: '', locked: false, end: 0, tick: null, to: null, n: mode === 'blitz' ? 0 : 10 };
    document.documentElement.style.setProperty('--acc', subj === 'mix' ? 'var(--sun)' : SUBJ[subj].c);
    $('#p-secs').hidden = mode !== 'blitz'; $('#p-pts').textContent = '0';
    if (mode === 'blitz') { S.end = Date.now() + 60000; S.tick = setInterval(timer, 200); timer(); }
    show('play'); next();
  }
  function stop() { if (S) { clearInterval(S.tick); clearTimeout(S.to); } }
  function timer() {
    if (!S || S.mode !== 'blitz') return;
    var left = Math.max(0, S.end - Date.now());
    $('#p-secs').textContent = Math.ceil(left / 1000); $('#p-prog').style.transform = 'scaleX(' + left / 60000 + ')';
    if (left <= 0) finish();
  }
  function pickQ() {
    var p = P(), r, i;
    if (S.mode !== 'blitz' && S.retry.length && S.retry[0].due <= S.asked) { r = S.retry.shift(); r.q.opts = r.q.opts && !r.q.keep ? shuf(r.q.opts) : r.q.opts; r.again = true; return r; }
    var tps = S.ids.map(function (id) { return BY_ID[id]; }), tot = 0, ws = tps.map(function (t) { var w = 1.6 - mastery(p, t.id) + (S.cur && S.cur.tp === t && tps.length > 1 ? -0.5 : 0); tot += w; return w; });
    r = Math.random() * tot;
    var tp = tps[tps.length - 1];
    for (i = 0; i < tps.length; i++) { r -= ws[i]; if (r <= 0) { tp = tps[i]; break; } }
    var L = lvlOf(p, tp.id), key = '', q;
    if (tp.items) {
      var pool = tp.items.filter(function (it) { return !S.used[it.id]; });
      if (!pool.length) pool = tp.items;
      tot = 0; ws = pool.map(function (it) { var w = WEIGHT[p.box[it.id] || 0]; tot += w; return w; });
      r = Math.random() * tot;
      var it = pool[pool.length - 1];
      for (i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) { it = pool[i]; break; } }
      key = it.id; S.used[key] = 1; q = it.make(L, S.mode !== 'blitz');
    } else q = tp.gen(L, S.mode !== 'blitz');
    return { tp: tp, key: key, q: q, L: L };
  }
  function buildKeys() {
    var k = $('#p-keys'); k.innerHTML = '';
    function add(l, cls, fn, aria) { var b = document.createElement('button'); b.type = 'button'; b.className = 'key ' + cls; b.textContent = l; if (aria) b.setAttribute('aria-label', aria); b.addEventListener('click', fn); k.appendChild(b); }
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { add(n, '', function () { digit(String(n)); }); });
    add('←', 'del', function () { if (S && !S.locked) { S.input = S.input.slice(0, -1); $('#p-ans').textContent = S.input; } }, 'Löschen');
    add('0', '', function () { digit('0'); });
    add('OK', 'go', function () { if (S && !S.locked && S.input) answer(+S.input === S.cur.q.num); }, 'Fertig');
  }
  function digit(c) { if (!S || S.locked || S.input.length >= 4) return; if (S.input === '0') S.input = ''; S.input += c; SND.tap(); $('#p-ans').textContent = S.input; }
  function next() {
    if (!S) return;
    clearTimeout(S.to);
    if (S.mode !== 'blitz' && S.asked >= S.n) { finish(); return; }
    var c = pickQ(), tries = 0;
    while (S.mode === 'blitz' && (c.q.write || c.q.order || c.q.match) && tries++ < 8) c = pickQ();
    var q = c.q;
    S.cur = c; S.asked++; S.input = ''; S.locked = false;
    if (S.mode !== 'blitz') $('#p-prog').style.transform = 'scaleX(' + (S.asked - 1) / S.n + ')';
    $('#p-tag').textContent = c.tp.e + ' ' + c.tp.n + (c.again ? ' · nochmal' : '');
    $('#p-tag').style.background = SUBJ[c.tp.s].c;
    $('#p-q').className = 'q';
    $('#p-text').textContent = q.text;
    $('#p-html').hidden = !q.html; $('#p-html').innerHTML = q.html || ''; $('#p-html').className = 'q-html' + (q.textLeft ? ' left' : '');
    var showBig = q.big != null && !q.listen;
    $('#p-big').hidden = !showBig; $('#p-big').textContent = showBig ? q.big : '';
    $('#p-big').className = 'q-big' + (q.small ? ' small' : showBig && String(q.big).length > 9 ? ' long' : '');
    $('#p-emoji').hidden = !q.emoji; $('#p-emoji').innerHTML = q.emoji || '';
    var spk = !!(q.listen || q.speaker);
    $('#p-spk').hidden = !spk; $('#p-spk').className = 'spk' + (q.listen ? '' : ' sm');
    $('#p-bigrow').hidden = !(showBig || q.emoji || spk);
    $('#p-img').hidden = !q.img; $('#p-img').innerHTML = q.img || ''; $('#p-img').className = 'art' + (q.wide ? ' wide' : '');
    var isNum = q.num != null, isX = !!(q.write || q.order || q.match);
    $('#p-ans').hidden = !isNum; $('#p-ans').textContent = '';
    $('#p-keys').hidden = !isNum; $('#p-keys').setAttribute('data-locked', 'false');
    var box = $('#p-opts'); box.hidden = isNum || isX; box.innerHTML = ''; box.setAttribute('data-locked', 'false');
    $('#p-x').hidden = !isX; $('#p-x').innerHTML = ''; $('#p-x').setAttribute('data-locked', 'false');
    if (isX) buildX(q);
    else if (!isNum) {
      var long = q.opts.some(function (o) { return o.t.length > 16; }), short = q.opts.length === 3 && q.opts.every(function (o) { return o.t.length <= 5; });
      box.className = 'opts' + (q.pics ? '' : short ? ' three' : (long || q.opts.length === 3 || q.opts.length === 5) ? ' one' : '');
      q.opts.forEach(function (o, i) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'opt' + (q.pics ? ' pic' : '');
        if (q.pics) { b.innerHTML = o.img; b.setAttribute('aria-label', 'Bild ' + (i + 1)); } else b.textContent = o.t;
        b.addEventListener('click', function () { if (S && !S.locked) answer(!!o.ok, i); });
        box.appendChild(b);
      });
    }
    $('#p-fb').hidden = true;
    if (q.auto && q.say) setTimeout(function () { if (S && S.cur === c && !S.locked) say(q.say, $('#p-spk')); }, 250);
    else if (q.auto && q.sayDe) setTimeout(function () { if (S && S.cur === c && !S.locked) speakDe(q.sayDe, $('#p-spk'), 0.8); }, 250);
    else if (D.read && S.mode !== 'blitz') setTimeout(function () { if (S && S.cur === c && !S.locked) readQ(); }, 300);
  }
  function answer(ok, idx) {
    var c = S.cur, q = c.q, p = P(), t = p.topics[c.tp.id] || (p.topics[c.tp.id] = { seen: 0, right: 0, rec: '' });
    S.locked = true;
    t.seen++; if (ok) t.right++; t.rec = (t.rec + (ok ? '1' : '0')).slice(-12);
    if (c.key) p.box[c.key] = ok ? Math.min(3, (p.box[c.key] || 0) + 1) : 0;
    var gain = 0;
    if (ok) { gain = 10 + (c.L - 1) * 2 + Math.min(S.streak, 5) * 2; S.streak++; S.right++; S.pts += gain; S.by[c.tp.s] += gain; }
    else { S.streak = 0; S.wrong.push(q.short || q.explain || q.ans); if (S.mode !== 'blitz' && !c.again) S.retry.push({ tp: c.tp, key: c.key, q: q, L: c.L, due: S.asked + 3 }); }
    save();
    $('#p-pts').textContent = S.pts;
    if (q.write || q.order || q.match) $('#p-x').setAttribute('data-locked', 'true');
    else if (q.num == null) { var bs = $('#p-opts').children; q.opts.forEach(function (o, j) { bs[j].classList.add(o.ok ? 'right' : j === idx ? 'wrong' : 'dim'); }); $('#p-opts').setAttribute('data-locked', 'true'); }
    else $('#p-keys').setAttribute('data-locked', 'true');
    $('#p-q').className = 'q ' + (ok ? 'ok' : 'no');
    if (ok) { SND.ok(S.streak); burstAt($('#p-q'), S.streak % 5 === 0 ? 28 : 10, S.streak % 5 === 0); } else SND.no();
    var english = c.tp.s === 'en' && q.say;
    if (english) setTimeout(function () { say(q.say, $('#p-fbspk')); }, ok ? 150 : 450);
    if (S.mode === 'blitz') { S.to = setTimeout(next, ok ? (english ? 900 : 350) : 1300); if (!ok) fb(false, q, 0, true); return; }
    $('#p-prog').style.transform = 'scaleX(' + S.asked / S.n + ')';
    fb(ok, q, gain, false, english);
    if (ok) S.to = setTimeout(next, english ? 1800 : 1100);
  }
  function fb(ok, q, gain, quick, english) {
    var el = $('#p-fb'); el.hidden = false; el.className = 'fb ' + (ok ? 'good' : 'bad');
    $('#p-fbt').textContent = ok ? pick(['Richtig!', 'Super!', 'Genau!', 'Stark!', 'Klasse!']) + (S.streak >= 3 ? ' ' + S.streak + ' in Folge' : '') : q.match ? 'Geschafft, aber mit ' + (S.miss || 1) + (S.miss === 1 ? ' Fehlversuch' : ' Fehlversuchen') : 'Richtig ist: ' + q.ans;
    $('#p-why').hidden = ok || quick || !EXPL[S.cur.tp.id];
    $('#p-gain').textContent = ok ? '+' + gain : '';
    $('#p-fbspk').hidden = !q.say;
    $('#p-ex').textContent = (!ok || english) ? (q.explain || '') : ''; $('#p-ex').hidden = !$('#p-ex').textContent;
    $('#p-next').hidden = quick || ok;
    if (!quick && !ok) setTimeout(function () { try { $('#p-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 60);
  }
  function finish() {
    if (!S) return;
    stop();
    var p = P(), n = S.right, stars, title, bonus;
    if (S.mode === 'blitz') { stars = n >= 14 ? 3 : n >= 9 ? 2 : n >= 5 ? 1 : 0; title = n > p.best && n > 0 ? 'Neuer Rekord!' : 'Zeit ist um!'; if (n > p.best) p.best = n; }
    else { stars = n >= 9 ? 3 : n >= 7 ? 2 : n >= 5 ? 1 : 0; title = n === 10 ? 'Perfekt!' : n >= 9 ? 'Super gemacht!' : n >= 7 ? 'Richtig gut!' : n >= 5 ? 'Guter Anfang!' : 'Weiter üben lohnt sich!'; }
    bonus = stars * 10;
    var before = level(p.pts), total = S.pts + bonus, td = today();
    rollWeek(p);
    p.pts += total; p.wpts += total; p.rounds++;
    SUBJ_ORDER.forEach(function (s) { var share = S.by[s] + (S.pts ? Math.round(bonus * S.by[s] / S.pts) : 0); p.sub[s] += share; p.wsub[s] += share; });
    if (p.streak.d !== td) { p.streak.n = p.streak.d === yesterday() ? p.streak.n + 1 : 1; p.streak.d = td; }
    var after = level(p.pts), gotTix = stars >= 2 && (p.tix || 0) < 5;
    if (gotTix) p.tix = (p.tix || 0) + 1;
    save(); pushScore(p).then(function () { return fetchBoard(); });
    $('#r-title').textContent = title;
    $('#r-av').innerHTML = av(p.look, 'xl', stars ? 'happy' : 'idle');
    var st = $('#r-stars'); st.innerHTML = '';
    for (var i = 0; i < 3; i++) { var e = document.createElement('i'); e.textContent = '★'; if (i < stars) { e.className = 'on'; e.style.setProperty('--i', i); } st.appendChild(e); }
    st.setAttribute('aria-label', stars + ' von 3 Sternen');
    $('#r-pts').textContent = '+' + total + ' Punkte';
    $('#r-sub').textContent = (S.mode === 'blitz' ? n + ' richtig in 60 Sekunden · Rekord: ' + p.best : n + ' von ' + S.n + ' richtig') + (bonus ? ' · ' + bonus + ' Sterne-Bonus' : '');
    xpBar(p.pts, '#r-xp', '#r-lv', '#r-next');
    var ul = $('#r-redo'); ul.innerHTML = '';
    uniq(S.wrong).slice(0, 8).forEach(function (w) { var li = document.createElement('li'); li.textContent = w; ul.appendChild(li); });
    $('#r-redo-box').hidden = !S.wrong.length;
    $('#r-games').hidden = !(p.tix > 0); renderGames('#r-games', gotTix ? 'Du hast ein Spielticket gewonnen!' : 'Du hast noch Tickets übrig.');
    var again = { mode: S.mode, ids: S.ids, subj: S.subj };
    $('#r-again').onclick = function () { start(again.mode, again.ids, again.subj); };
    S = null; show('res');
    for (i = 0; i < stars; i++) (function (k) { setTimeout(function () { SND.star(k); }, 300 + k * 300); })(i);
    if (stars) setTimeout(function () { burst(window.innerWidth / 2, window.innerHeight * 0.3, stars === 3 ? 60 : 30, true); }, 200);
    ovQueue = [];
    for (i = before + 1; i <= after; i++) if (CLIPS[i - 1]) ovQueue.push([CLIPS[i - 1], i]);
    if (ovQueue.length) { var f = ovQueue.shift(); setTimeout(function () { if (view === 'res') showClip(f[0], true, f[1]); }, 1700); }
    else if (stars === 3 && after > 0) { var own = CLIPS.slice(0, after); setTimeout(function () { if (view === 'res') showClip(pick(own), false); }, 1700); }
  }

  /* ---------- Bestenliste ---------- */
  var BT = { tab: 'w', f: '' }, pollT = null;
  function renderBoard() {
    var online = ON.ready, joined = online && !!D.code;
    $('#b-join').hidden = !online || joined; $('#b-class').hidden = !joined;
    $('#b-jt').textContent = 'Gib den Klassen-Code ein, den ihr ausgemacht habt. Oder denk dir einen neuen aus und teile ihn mit deiner Klasse.';
    $('#b-cur').textContent = D.code;
    [].forEach.call(document.querySelectorAll('#b-tabs button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-t') === BT.tab ? 'true' : 'false'); });
    var fb = $('#b-filter'); fb.innerHTML = '';
    [['', 'Alle Fächer']].concat(SUBJ_ORDER.map(function (s) { return [s, SUBJ[s].n]; })).concat([['snk', '🐍 Snake'], ['tet', '🧱 Blockfall'], ['inv', '👾 Sternenjäger']]).forEach(function (f) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = f[1]; b.setAttribute('aria-pressed', BT.f === f[0] ? 'true' : 'false');
      b.addEventListener('click', function () { BT.f = f[0]; renderBoard(); }); fb.appendChild(b);
    });
    var rows = ranked(BT.tab, BT.f), list = $('#b-list'); list.innerHTML = '';
    $('#b-note').textContent = !online ? 'Die Online-Bestenliste für die ganze Klasse wird gerade eingerichtet. Bis dahin siehst du hier alle, die auf diesem Handy spielen.' : !joined ? 'Ohne Klassen-Code siehst du nur die Spieler auf diesem Handy.' : ON.err ? 'Keine Verbindung. Du siehst den letzten Stand.' : !ON.board ? 'Lade Bestenliste …' : (BT.f === 'snk' || BT.f === 'tet' || BT.f === 'inv') ? 'Hier zählt der beste Rekord im Spiel. Die Tickets dafür gibt es nur fürs Lernen.' : BT.tab === 'w' ? 'Jeden Montag startet die Wochenliste neu.' : 'Alle Punkte seit dem Start.';
    rows.forEach(function (r, i) {
      var d = document.createElement('div'); d.className = 'rk' + (r.me ? ' me' : '') + (i < 3 && r.v > 0 ? ' r' + (i + 1) : '');
      d.innerHTML = '<span class="no">' + (i + 1) + '</span>' + av(LOOKS[r.x.a] ? r.x.a : 'kiwi', 'sm') + '<span class="nm"><b></b><span></span></span><span class="sc">' + r.v + '</span>';
      d.querySelector('.nm b').textContent = r.x.n + (r.me ? ' (du)' : '');
      d.querySelector('.nm span').textContent = 'Level ' + ((+r.x.lv || 0) + 1) + ' · ' + LV_NAME[Math.min(+r.x.lv || 0, LV_NAME.length - 1)];
      list.appendChild(d);
    });
    if (!rows.length) { var e = document.createElement('p'); e.className = 'note'; e.textContent = 'Noch keine Punkte. Spiel eine Runde und sei die Nummer 1!'; list.appendChild(e); }
  }
  function openBoard() {
    renderBoard(); show('board');
    clearInterval(pollT);
    if (ON.ready && D.code) { var go = function () { if (view !== 'board') { clearInterval(pollT); return; } fetchBoard().then(function () { if (view === 'board') renderBoard(); }); }; go(); pollT = setInterval(go, 20000); }
  }
  function joinCode(code) {
    code = cleanCode(code);
    if (code.length < 4) { toast('Der Code braucht mindestens 4 Zeichen.'); return false; }
    D.code = code; ON.board = null; save();
    Promise.all(D.players.map(function (p) { return pushScore(p); })).then(function () { return fetchBoard(); }).then(function () { if (view === 'board') renderBoard(); if (view === 'home') renderTeaser(); });
    return true;
  }
  function shareLink() {
    var url = location.origin + location.pathname + '?k=' + encodeURIComponent(D.code), text = 'Spiel mit in unserer Klasse bei Klasse 3 Champions! Unser Code: ' + D.code;
    if (navigator.share) { navigator.share({ title: 'Klasse 3 Champions', text: text, url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(text + ' ' + url).then(function () { toast('Link kopiert!'); }, function () { toast(url); }); } catch (e) { toast(url); }
  }

  /* ---------- Sammlung ---------- */
  function renderAlbum() {
    var p = P(), l = level(p.pts), box = $('#a-list'); box.innerHTML = '';
    renderGames('#a-games', p.tix > 0 ? 'Ein Spiel kostet 1 Ticket.' : 'Hol dir ein Ticket: Schaffe in einer Lernrunde 2 oder 3 Sterne.');
    $('#a-sub').textContent = Math.min(l, CLIPS.length) + ' von ' + CLIPS.length + ' GIFs gesammelt. Jedes neue Level schaltet ein GIF frei.';
    CLIPS.forEach(function (c, i) {
      var got = l > i, b = document.createElement('button'); b.type = 'button'; b.className = 'clip' + (got ? '' : ' locked'); b.disabled = !got;
      b.innerHTML = '<span class="thumb">' + (got ? '<span class="stage">' + clipHTML(c) + '</span>' : '🔒') + '</span><b class="ttl"></b><span class="cap"></span>';
      b.querySelector('.ttl').textContent = got ? c.n : '???';
      b.querySelector('.cap').textContent = got ? 'Antippen mit Musik' : 'ab Level ' + (i + 2) + ' (' + LV[i + 1] + ' Punkte)';
      if (got) b.addEventListener('click', function () { showClip(c, false); });
      box.appendChild(b);
    });
  }

  /* ---------- Profil & Start ---------- */
  function lookPicker(box, cur, onPick) {
    box.innerHTML = '';
    LOOK_ORDER.forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.innerHTML = av(k); b.setAttribute('aria-label', LOOKS[k].name); b.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      b.addEventListener('click', function () { SND.tap(); onPick(k); }); box.appendChild(b);
    });
  }
  function renderProf() {
    var p = P();
    if (document.activeElement !== $('#f-name')) $('#f-name').value = p.name;
    lookPicker($('#f-looks'), p.look, function (k) { p.look = k; save(); pushScore(p); renderProf(); });
    $('#f-snd').textContent = D.sound ? '🔊 Ton an' : '🔇 Ton aus'; $('#f-snd').setAttribute('aria-pressed', D.sound ? 'true' : 'false');
    $('#f-read').textContent = D.read ? '🔈 Fragen vorlesen: an' : '🔈 Fragen vorlesen: aus'; $('#f-read').setAttribute('aria-pressed', D.read ? 'true' : 'false');
    var box = $('#f-players'); box.innerHTML = '';
    D.players.forEach(function (q, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rk' + (i === D.cur ? ' me' : '');
      b.innerHTML = av(q.look, 'sm') + '<span class="nm"><b></b><span></span></span><span class="sc">' + q.pts + '</span>';
      b.querySelector('.nm b').textContent = q.name; b.querySelector('.nm span').textContent = i === D.cur ? 'spielt gerade' : 'antippen zum Wechseln';
      b.addEventListener('click', function () { D.cur = i; save(); SND.tap(); renderProf(); }); box.appendChild(b);
    });
    $('#f-add').hidden = D.players.length >= 4;
    $('#f-del').hidden = false; $('#f-delbox').hidden = true;
    $('#f-del').textContent = '„' + p.name + '“ löschen';
  }
  var ONB = { look: 'kiwi' };
  function openOnb(first) {
    ONB.look = pick(LOOK_ORDER.slice(0, 7));
    $('#o-name').value = ''; $('#o-cancel').hidden = first;
    var k = '';
    try { k = cleanCode(new URLSearchParams(location.search).get('k')); } catch (e) {}
    $('#o-codebox').hidden = !ON.ready || !!D.code; $('#o-code').value = k;
    (function draw() { lookPicker($('#o-looks'), ONB.look, function (x) { ONB.look = x; draw(); }); })();
    show('onb');
  }
  function goHome() { stop(); S = null; document.documentElement.style.setProperty('--acc', 'var(--sun)'); renderHome(); show('home'); }

  /* ---------- Snake (Belohnung, kostet 1 Spielticket) ---------- */
  var K = null, KN = 14, KMAX = 120;
  function snakeStop() { if (K) { cancelAnimationFrame(K.raf); clearInterval(K.clock); K.run = false; } }
  function snakeOpen() {
    var p = P();
    K = { run: false, raf: 0, clock: 0, snake: [], dir: [1, 0], q: [], food: null, score: 0, step: 190, acc: 0, last: 0, left: KMAX, back: view === 'res' ? 'res' : 'album' };
    $('#k-score').textContent = '0'; $('#k-best').textContent = p.snk || 0; $('#k-time').textContent = '2:00';
    show('snake'); document.body.classList.add('noscroll');
    snakeMsg('Snake', 'Friss die Sterne und beiß dich nicht selbst. Ein Spiel dauert höchstens 2 Minuten.', 'Start (1 Ticket)', true);
    snakeReset(); snakeDraw();
  }
  function snakeMsg(t, sub, btn, canGo) { $('#k-msg').hidden = false; $('#k-mt').textContent = t; $('#k-ms').textContent = sub; $('#k-go').textContent = btn; $('#k-go').hidden = !canGo; }
  function snakeReset() { K.snake = [[5, 7], [4, 7], [3, 7]]; K.dir = [1, 0]; K.q = []; K.score = 0; K.step = 190; K.acc = 0; K.left = KMAX; snakeFood(); }
  function snakeFood() { var f; do { f = [R(0, KN - 1), R(0, KN - 1)]; } while (K.snake.some(function (s) { return s[0] === f[0] && s[1] === f[1]; })); K.food = f; }
  function snakeStart() {
    var p = P();
    if (!(p.tix > 0)) return;
    p.tix--; save(); snakeReset();
    $('#k-msg').hidden = true; $('#k-score').textContent = '0';
    K.run = true; K.last = 0;
    clearInterval(K.clock);
    K.clock = setInterval(function () { if (!K.run || document.hidden) return; K.left--; $('#k-time').textContent = Math.floor(K.left / 60) + ':' + ('0' + K.left % 60).slice(-2); if (K.left <= 0) snakeOver(true); }, 1000);
    K.raf = requestAnimationFrame(snakeLoop);
  }
  function snakeLoop(t) {
    if (!K || !K.run) return;
    if (!K.last) K.last = t;
    K.acc += Math.min(250, t - K.last); K.last = t;
    while (K.acc >= K.step && K.run) { K.acc -= K.step; snakeTick(); }
    snakeDraw();
    if (K.run) K.raf = requestAnimationFrame(snakeLoop);
  }
  function snakeTurn(d) {
    if (!K || !K.run) return;
    var v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[d], last = K.q.length ? K.q[K.q.length - 1] : K.dir;
    if (!v || (v[0] === -last[0] && v[1] === -last[1]) || (v[0] === last[0] && v[1] === last[1]) || K.q.length >= 2) return;
    K.q.push(v);
  }
  function snakeTick() {
    if (K.q.length) K.dir = K.q.shift();
    var h = K.snake[0], n = [(h[0] + K.dir[0] + KN) % KN, (h[1] + K.dir[1] + KN) % KN], eat = n[0] === K.food[0] && n[1] === K.food[1];
    if (!eat) K.snake.pop();
    if (K.snake.some(function (s) { return s[0] === n[0] && s[1] === n[1]; })) { K.snake.unshift(n); snakeOver(false); return; }
    K.snake.unshift(n);
    if (eat) { K.score++; $('#k-score').textContent = K.score; K.step = Math.max(95, 190 - K.score * 4); tone(660 + (K.score % 8) * 60, 0, 0.09, 0.1); if (K.snake.length < KN * KN) snakeFood(); }
  }
  function snakeOver(time) {
    K.run = false; cancelAnimationFrame(K.raf); clearInterval(K.clock);
    var p = P(), rec = K.score > (p.snk || 0);
    if (rec) { p.snk = K.score; save(); $('#k-best').textContent = p.snk; pushScore(p); }
    if (rec && K.score > 0) { SND.win(); burstAt($('#k-wrap'), 40, true); } else if (!time) SND.no(); else SND.ok();
    snakeDraw();
    snakeMsg(rec && K.score > 0 ? 'Neuer Rekord: ' + K.score + '!' : time ? 'Zeit um! ' + K.score + ' Sterne' : 'Autsch! ' + K.score + ' Sterne', p.tix > 0 ? 'Du hast noch ' + p.tix + (p.tix === 1 ? ' Ticket.' : ' Tickets.') : 'Keine Tickets mehr. Mit 2 oder 3 Sternen in einer Lernrunde bekommst du ein neues.', 'Nochmal (1 Ticket)', p.tix > 0);
  }
  function snakeDraw() {
    var cv = $('#k-cv'), c = cv.getContext('2d'), W = cv.width, s = W / KN, i, L = LOOKS[P().look] || LOOKS.kiwi, col = L.c[0] === '#FFFFFF' ? '#3EE08A' : L.c[0];
    c.fillStyle = '#0F0B36'; c.fillRect(0, 0, W, W);
    for (i = 0; i < KN * KN; i++) if ((i + Math.floor(i / KN)) % 2 === 0) { c.fillStyle = '#17124A'; c.fillRect((i % KN) * s, Math.floor(i / KN) * s, s, s); }
    function rr(x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill(); }
    if (K.food) {
      var fx = (K.food[0] + 0.5) * s, fy = (K.food[1] + 0.5) * s, a, r;
      c.fillStyle = '#FFD23F'; c.beginPath();
      for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; r = (i % 2 ? 0.2 : 0.44) * s; c.lineTo(fx + r * Math.cos(a), fy + r * Math.sin(a)); }
      c.closePath(); c.fill();
    }
    for (i = K.snake.length - 1; i >= 0; i--) {
      var g = K.snake[i]; c.fillStyle = i === 0 ? '#FFFFFF' : col; c.globalAlpha = i === 0 ? 1 : Math.max(0.55, 1 - i * 0.02);
      rr(g[0] * s + 2, g[1] * s + 2, s - 4, s - 4, s * 0.3);
      if (i === 0) { c.globalAlpha = 1; c.fillStyle = col; rr(g[0] * s + 5, g[1] * s + 5, s - 10, s - 10, s * 0.25); c.fillStyle = '#14103F'; var ex = K.dir[1] !== 0 ? 0.22 : 0, ey = K.dir[0] !== 0 ? 0.22 : 0, ox = K.dir[0] * 0.14, oy = K.dir[1] * 0.14; c.beginPath(); c.arc((g[0] + 0.5 + ox - ex) * s, (g[1] + 0.5 + oy - ey) * s, s * 0.09, 0, 7); c.arc((g[0] + 0.5 + ox + ex) * s, (g[1] + 0.5 + oy + ey) * s, s * 0.09, 0, 7); c.fill(); }
    }
    c.globalAlpha = 1;
  }
  (function () {
    var wrap = $('#k-wrap'), sx = 0, sy = 0, on = false;
    wrap.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; on = true; }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (K && K.run) e.preventDefault();
      if (!on) return;
      var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      snakeTurn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')); sx = t.clientX; sy = t.clientY;
    }, { passive: false });
    wrap.addEventListener('touchend', function () { on = false; });
    [].forEach.call(document.querySelectorAll('#k-pad button'), function (b) {
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); snakeTurn(b.getAttribute('data-d')); });
    });
    $('#k-go').addEventListener('click', snakeStart);
    function leave() { var b = K ? K.back : 'album'; snakeStop(); gameLeave(b); }
    $('#k-end').addEventListener('click', leave); $('#k-quit').addEventListener('click', leave);
    document.addEventListener('keydown', function (e) { if (view !== 'snake') return; var m = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key]; if (m) { snakeTurn(m); e.preventDefault(); } });
  })();

  /* ---------- Spiele-Karten und Rueckweg ---------- */
  function renderGames(sel, note) {
    var p = P(), box = $(sel), has = p.tix > 0;
    box.innerHTML = '<div class="gh"><span></span><b class="tix">🎟️ ' + (p.tix || 0) + '</b></div><div class="gg"><button class="gm snk" type="button"><span class="ic">🐍</span><b>Snake</b><span>Rekord: ' + (p.snk || 0) + '</span></button><button class="gm tet" type="button"><span class="ic">🧱</span><b>Blockfall</b><span>Rekord: ' + (p.tet || 0) + '</span></button><button class="gm inv" type="button"><span class="ic">👾</span><b>Sternen&shy;jäger</b><span>Rekord: ' + (p.inv || 0) + '</span></button></div>';
    box.querySelector('.gh span').textContent = note;
    var bs = box.querySelectorAll('.gm');
    bs[0].disabled = bs[1].disabled = bs[2].disabled = !has;
    bs[0].addEventListener('click', snakeOpen); bs[1].addEventListener('click', tetOpen); bs[2].addEventListener('click', invOpen);
  }
  function gameLeave(b) {
    if (b === 'res' && $('#r-title').textContent) { $('#r-games').hidden = !(P().tix > 0); renderGames('#r-games', 'Du hast noch Tickets übrig.'); show('res'); }
    else { renderAlbum(); show('album'); }
  }

  /* ---------- Blockfall (fallende Steine, kostet 1 Spielticket) ---------- */
  var T = null, TW = 10, TH = 16, TMAX = 180;
  var TSHAPES = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]]];
  var TCOL = ['#3DA5FF', '#FFD23F', '#B78CFF', '#FF9F1C', '#FF4FA3', '#2FD67B', '#FF6B6B'];
  function tetStop() { if (T) { cancelAnimationFrame(T.raf); clearInterval(T.clock); clearInterval(T.rep); T.run = false; } }
  function tetNew() { var k = R(0, 6); return { k: k, m: TSHAPES[k].map(function (r) { return r.slice(); }), x: 0, y: 0 }; }
  function tetOpen() {
    var p = P();
    T = { run: false, raf: 0, clock: 0, rep: 0, g: [], cur: null, nx: tetNew(), score: 0, lines: 0, step: 700, acc: 0, last: 0, left: TMAX, back: view === 'res' ? 'res' : 'album' };
    tetReset();
    $('#t-score').textContent = '0'; $('#t-best').textContent = p.tet || 0; $('#t-time').textContent = '3:00';
    show('tet'); document.body.classList.add('noscroll');
    tetMsg('Blockfall', 'Stapel die Steine und fülle ganze Reihen. Volle Reihen verschwinden und geben Punkte. Ein Spiel dauert höchstens 3 Minuten.', 'Start (1 Ticket)', true);
    tetDraw();
  }
  function tetMsg(t, sub, btn, canGo) { $('#t-msg').hidden = false; $('#t-mt').textContent = t; $('#t-ms').textContent = sub; $('#t-go').textContent = btn; $('#t-go').hidden = !canGo; }
  function tetReset() { T.g = []; for (var y = 0; y < TH; y++) { T.g.push([]); for (var x = 0; x < TW; x++) T.g[y].push(-1); } T.score = 0; T.lines = 0; T.step = 700; T.acc = 0; T.left = TMAX; T.nx = tetNew(); tetSpawn(); }
  function tetFits(m, px, py) { for (var y = 0; y < m.length; y++) for (var x = 0; x < m[y].length; x++) if (m[y][x]) { var gx = px + x, gy = py + y; if (gx < 0 || gx >= TW || gy >= TH || (gy >= 0 && T.g[gy][gx] >= 0)) return false; } return true; }
  function tetSpawn() { T.cur = T.nx; T.nx = tetNew(); T.cur.x = Math.floor((TW - T.cur.m[0].length) / 2); T.cur.y = 0; return tetFits(T.cur.m, T.cur.x, T.cur.y); }
  function tetStart() {
    var p = P();
    if (!(p.tix > 0)) return;
    p.tix--; save(); tetReset();
    $('#t-msg').hidden = true; $('#t-score').textContent = '0';
    T.run = true; T.last = 0;
    clearInterval(T.clock);
    T.clock = setInterval(function () { if (!T.run || document.hidden) return; T.left--; $('#t-time').textContent = Math.floor(T.left / 60) + ':' + ('0' + T.left % 60).slice(-2); if (T.left <= 0) tetOver(true); }, 1000);
    T.raf = requestAnimationFrame(tetLoop);
  }
  function tetLoop(t) {
    if (!T || !T.run) return;
    if (!T.last) T.last = t;
    T.acc += Math.min(300, t - T.last); T.last = t;
    while (T.acc >= T.step && T.run) { T.acc -= T.step; tetDown(false); }
    tetDraw();
    if (T.run) T.raf = requestAnimationFrame(tetLoop);
  }
  function tetMove(dx) { if (T && T.run && tetFits(T.cur.m, T.cur.x + dx, T.cur.y)) { T.cur.x += dx; SND.tap(); } }
  function tetRot() {
    if (!T || !T.run) return;
    var m = T.cur.m, r = [], x, y, ks = [0, -1, 1, -2, 2], i;
    for (x = 0; x < m[0].length; x++) { r.push([]); for (y = m.length - 1; y >= 0; y--) r[x].push(m[y][x]); }
    for (i = 0; i < ks.length; i++) if (tetFits(r, T.cur.x + ks[i], T.cur.y)) { T.cur.m = r; T.cur.x += ks[i]; SND.tap(); return; }
  }
  function tetDown(soft) {
    if (!T || !T.run) return false;
    if (tetFits(T.cur.m, T.cur.x, T.cur.y + 1)) { T.cur.y++; if (soft) T.acc = 0; return true; }
    var m = T.cur.m, x, y, full = 0;
    for (y = 0; y < m.length; y++) for (x = 0; x < m[y].length; x++) if (m[y][x] && T.cur.y + y >= 0) T.g[T.cur.y + y][T.cur.x + x] = T.cur.k;
    for (y = TH - 1; y >= 0; y--) if (T.g[y].every(function (c) { return c >= 0; })) { T.g.splice(y, 1); var row = []; for (x = 0; x < TW; x++) row.push(-1); T.g.unshift(row); full++; y++; }
    T.score += 1 + [0, 10, 30, 50, 80][full]; T.lines += full;
    if (full) { T.step = Math.max(180, 700 - T.lines * 28); [0, 1, 2].slice(0, Math.min(3, full)).forEach(function (i) { tone(520 + i * 180 + full * 40, i * 0.07, 0.14, 0.11); }); burstAt($('#t-wrap'), full * 8, full >= 3); }
    $('#t-score').textContent = T.score;
    if (!tetSpawn()) tetOver(false);
    return false;
  }
  function tetDrop() { if (!T || !T.run) return; var n = 0; while (tetDown(true) && n++ < TH) {} }
  function tetOver(time) {
    T.run = false; cancelAnimationFrame(T.raf); clearInterval(T.clock); clearInterval(T.rep);
    var p = P(), rec = T.score > (p.tet || 0);
    if (rec) { p.tet = T.score; save(); $('#t-best').textContent = p.tet; pushScore(p); }
    if (rec && T.score > 0) { SND.win(); burstAt($('#t-wrap'), 40, true); } else if (!time) SND.no(); else SND.ok();
    tetDraw();
    tetMsg(rec && T.score > 0 ? 'Neuer Rekord: ' + T.score + '!' : time ? 'Zeit um! ' + T.score + ' Punkte' : 'Voll! ' + T.score + ' Punkte', p.tix > 0 ? 'Du hast noch ' + p.tix + (p.tix === 1 ? ' Ticket.' : ' Tickets.') : 'Keine Tickets mehr. Mit 2 oder 3 Sternen in einer Lernrunde bekommst du ein neues.', 'Nochmal (1 Ticket)', p.tix > 0);
  }
  function tetCell(c, x, y, s, col, a) {
    c.globalAlpha = a || 1; c.fillStyle = col; var r = s * 0.2, X = x * s + 1.5, Y = y * s + 1.5, w = s - 3;
    c.beginPath(); c.moveTo(X + r, Y); c.arcTo(X + w, Y, X + w, Y + w, r); c.arcTo(X + w, Y + w, X, Y + w, r); c.arcTo(X, Y + w, X, Y, r); c.arcTo(X, Y, X + w, Y, r); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(X + w * 0.16, Y + w * 0.14, w * 0.68, w * 0.16); c.globalAlpha = 1;
  }
  function tetDraw() {
    var cv = $('#t-cv'), c = cv.getContext('2d'), s = cv.width / TW, x, y, m;
    c.fillStyle = '#0F0B36'; c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#17124A'; for (x = 0; x < TW; x += 2) c.fillRect(x * s, 0, s, cv.height);
    for (y = 0; y < TH; y++) for (x = 0; x < TW; x++) if (T.g[y][x] >= 0) tetCell(c, x, y, s, TCOL[T.g[y][x]]);
    if (T.cur) {
      m = T.cur.m; var gy = T.cur.y;
      while (tetFits(m, T.cur.x, gy + 1)) gy++;
      for (y = 0; y < m.length; y++) for (x = 0; x < m[y].length; x++) if (m[y][x]) { if (T.run) tetCell(c, T.cur.x + x, gy + y, s, TCOL[T.cur.k], 0.22); tetCell(c, T.cur.x + x, T.cur.y + y, s, TCOL[T.cur.k]); }
    }
    var nc = $('#t-next'), n = nc.getContext('2d'), ns = 26; n.clearRect(0, 0, nc.width, nc.height);
    m = TSHAPES[T.nx.k]; var ox = (nc.width - m[0].length * ns) / 2 / ns, oy = (nc.height - m.length * ns) / 2 / ns;
    for (y = 0; y < m.length; y++) for (x = 0; x < m[y].length; x++) if (m[y][x]) tetCell(n, ox + x, oy + y, ns, TCOL[T.nx.k]);
  }
  (function () {
    var wrap = $('#t-wrap'), sx = 0, sy = 0, moved = false, t0 = 0, dropped = false;
    wrap.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; moved = false; dropped = false; t0 = Date.now(); }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (T && T.run) e.preventDefault();
      var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) >= 24 && Math.abs(dx) > Math.abs(dy)) { tetMove(dx > 0 ? 1 : -1); sx = t.clientX; sy = t.clientY; moved = true; }
      else if (dy >= 60 && !dropped) { tetDrop(); dropped = true; moved = true; }
    }, { passive: false });
    wrap.addEventListener('touchend', function (e) { if (!moved && Date.now() - t0 < 350 && T && T.run) { tetRot(); e.preventDefault(); } });
    wrap.addEventListener('click', function (e) { if (T && T.run && e.detail && !('ontouchstart' in window)) tetRot(); });
    function act(a) { if (a === 'l') tetMove(-1); else if (a === 'r') tetMove(1); else if (a === 'rot') tetRot(); else tetDown(true); }
    [].forEach.call(document.querySelectorAll('#t-pad button'), function (b) {
      var a = b.getAttribute('data-a');
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); act(a); clearInterval(T && T.rep); if (T && a !== 'rot') { var first = true; T.rep = setInterval(function () { if (first) { first = false; return; } act(a); }, a === 'd' ? 60 : 110); } });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { if (T) clearInterval(T.rep); }); });
    });
    $('#t-go').addEventListener('click', tetStart);
    function leave() { var b = T ? T.back : 'album'; tetStop(); document.body.classList.remove('noscroll'); gameLeave(b); }
    $('#t-end').addEventListener('click', leave); $('#t-quit').addEventListener('click', leave);
    document.addEventListener('keydown', function (e) { if (view !== 'tet') return; var m = { ArrowUp: 'rot', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key]; if (m) { act(m); e.preventDefault(); } else if (e.key === ' ') { tetDrop(); e.preventDefault(); } });
  })();

  /* ---------- Sternenjaeger (Raumschiff gegen Glibber-Monster, kostet 1 Spielticket) ---------- */
  var V = null, VW = 500, VH = 700, VMAX = 180, VCOL = ['#FF4FA3', '#FFD23F', '#2FD67B', '#3DA5FF'];
  function invStop() { if (V) { cancelAnimationFrame(V.raf); clearInterval(V.clock); V.run = false; V.hold = 0; } }
  function invOpen() {
    var p = P();
    V = { run: false, raf: 0, clock: 0, x: VW / 2, tx: VW / 2, hold: 0, shots: [], bombs: [], al: [], dir: 1, sp: 40, score: 0, lives: 3, wave: 0, fire: 0, last: 0, left: VMAX, hit: 0, t: 0, back: view === 'res' ? 'res' : 'album' };
    invWave();
    $('#i-score').textContent = '0'; $('#i-best').textContent = p.inv || 0; $('#i-time').textContent = '3:00'; $('#i-lives').textContent = '♥♥♥';
    show('inv'); document.body.classList.add('noscroll');
    invMsg('Sternenjäger', 'Triff alle Glibber-Monster, bevor sie unten ankommen. Weich ihren Glibber-Tropfen aus. Ein Spiel dauert höchstens 3 Minuten.', 'Start (1 Ticket)', true);
    invDraw();
  }
  function invMsg(t, sub, btn, canGo) { $('#i-msg').hidden = false; $('#i-mt').textContent = t; $('#i-ms').textContent = sub; $('#i-go').textContent = btn; $('#i-go').hidden = !canGo; }
  function invWave() {
    V.wave++; V.al = []; V.dir = 1; V.sp = 34 + V.wave * 12; V.shots = []; V.bombs = [];
    var rows = Math.min(5, 3 + Math.floor(V.wave / 2)), r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < 6; c++) V.al.push({ x: 60 + c * 68, y: 70 + r * 56, k: r % 4 });
  }
  function invStart() {
    var p = P();
    if (!(p.tix > 0)) return;
    p.tix--; save();
    V.score = 0; V.lives = 3; V.wave = 0; V.left = VMAX; V.x = V.tx = VW / 2; V.hit = 0; V.hold = 0; invWave();
    $('#i-msg').hidden = true; $('#i-score').textContent = '0'; $('#i-lives').textContent = '♥♥♥';
    V.run = true; V.last = 0;
    clearInterval(V.clock);
    V.clock = setInterval(function () { if (!V.run || document.hidden) return; V.left--; $('#i-time').textContent = Math.floor(V.left / 60) + ':' + ('0' + V.left % 60).slice(-2); if (V.left <= 0) invOver('time'); }, 1000);
    V.raf = requestAnimationFrame(invLoop);
  }
  function invLoop(t) {
    if (!V || !V.run) return;
    if (!V.last) V.last = t;
    var dt = Math.min(0.05, (t - V.last) / 1000); V.last = t;
    invStep(dt); invDraw();
    if (V.run) V.raf = requestAnimationFrame(invLoop);
  }
  function invStep(dt) {
    var i, j, a, s, b;
    V.t += dt; if (V.hit > 0) V.hit -= dt;
    if (V.hold) V.tx = Math.max(30, Math.min(VW - 30, V.tx + V.hold * 330 * dt));
    V.x += Math.max(-520 * dt, Math.min(520 * dt, V.tx - V.x));
    V.fire -= dt;
    if (V.fire <= 0) { V.fire = 0.42; V.shots.push({ x: V.x, y: VH - 78 }); tone(880, 0, 0.05, 0.03, 'square'); }
    for (i = V.shots.length - 1; i >= 0; i--) { V.shots[i].y -= 520 * dt; if (V.shots[i].y < -10) V.shots.splice(i, 1); }
    var minx = 1e9, maxx = -1e9, maxy = 0, sp = V.sp * (1 + (30 - Math.min(30, V.al.length)) * 0.035);
    for (i = 0; i < V.al.length; i++) { a = V.al[i]; a.x += V.dir * sp * dt; minx = Math.min(minx, a.x); maxx = Math.max(maxx, a.x); maxy = Math.max(maxy, a.y); }
    if (maxx > VW - 28 || minx < 28) { V.dir = -V.dir; for (i = 0; i < V.al.length; i++) { V.al[i].y += 20; V.al[i].x += V.dir * 4; } }
    for (i = V.shots.length - 1; i >= 0; i--) { s = V.shots[i];
      for (j = V.al.length - 1; j >= 0; j--) { a = V.al[j];
        if (Math.abs(s.x - a.x) < 24 && Math.abs(s.y - a.y) < 22) { V.al.splice(j, 1); V.shots.splice(i, 1); V.score += 10; $('#i-score').textContent = V.score; tone(300 + (V.score % 70) * 6, 0, 0.08, 0.08, 'triangle'); break; } } }
    if (V.al.length && Math.random() < dt * (0.5 + V.wave * 0.18)) { a = V.al[Math.floor(Math.random() * V.al.length)]; V.bombs.push({ x: a.x, y: a.y + 18 }); }
    for (i = V.bombs.length - 1; i >= 0; i--) { b = V.bombs[i]; b.y += (170 + V.wave * 14) * dt;
      if (b.y > VH + 10) { V.bombs.splice(i, 1); continue; }
      if (V.hit <= 0 && Math.abs(b.x - V.x) < 26 && Math.abs(b.y - (VH - 52)) < 24) { V.bombs.splice(i, 1); invHurt(); if (!V.run) return; } }
    if (!V.al.length) { V.score += 50; $('#i-score').textContent = V.score; SND.win(); burstAt($('#i-wrap'), 30, true); invWave(); }
    else if (maxy > VH - 110) invOver('land');
  }
  function invHurt() { V.lives--; V.hit = 1.4; SND.no(); $('#i-lives').textContent = '♥♥♥'.slice(0, V.lives) || '–'; if (V.lives <= 0) invOver('dead'); }
  function invOver(why) {
    V.run = false; cancelAnimationFrame(V.raf); clearInterval(V.clock); V.hold = 0;
    var p = P(), rec = V.score > (p.inv || 0);
    if (rec) { p.inv = V.score; save(); $('#i-best').textContent = p.inv; pushScore(p); }
    if (rec && V.score > 0) { SND.win(); burstAt($('#i-wrap'), 40, true); } else if (why === 'time') SND.ok(); else SND.no();
    invDraw();
    invMsg(rec && V.score > 0 ? 'Neuer Rekord: ' + V.score + '!' : why === 'time' ? 'Zeit um! ' + V.score + ' Punkte' : why === 'land' ? 'Gelandet! ' + V.score + ' Punkte' : 'Getroffen! ' + V.score + ' Punkte', p.tix > 0 ? 'Du hast noch ' + p.tix + (p.tix === 1 ? ' Ticket.' : ' Tickets.') : 'Keine Tickets mehr. Mit 2 oder 3 Sternen in einer Lernrunde bekommst du ein neues.', 'Nochmal (1 Ticket)', p.tix > 0);
  }
  function invDraw() {
    var c = $('#i-cv').getContext('2d'), i, a, L = LOOKS[P().look] || LOOKS.kiwi, col = L.c[0] === '#FFFFFF' ? '#3EE08A' : L.c[0];
    c.fillStyle = '#0B0830'; c.fillRect(0, 0, VW, VH);
    c.fillStyle = 'rgba(255,255,255,.5)'; for (i = 0; i < 40; i++) c.fillRect((i * 137) % VW, (i * 251 + V.t * (10 + i % 3 * 8)) % VH, 2, 2);
    for (i = 0; i < V.al.length; i++) { a = V.al[i]; var wob = Math.sin(V.t * 6 + i) * 2;
      c.fillStyle = VCOL[a.k]; c.beginPath(); c.ellipse(a.x, a.y + wob, 22, 17, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(a.x - 14, a.y + 14 + wob, 5, 0, 7); c.arc(a.x, a.y + 17 + wob, 5, 0, 7); c.arc(a.x + 14, a.y + 14 + wob, 5, 0, 7); c.fill();
      c.strokeStyle = VCOL[a.k]; c.lineWidth = 3; c.beginPath(); c.moveTo(a.x - 9, a.y - 14 + wob); c.lineTo(a.x - 14, a.y - 25 + wob); c.moveTo(a.x + 9, a.y - 14 + wob); c.lineTo(a.x + 14, a.y - 25 + wob); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(a.x - 8, a.y - 2 + wob, 6, 0, 7); c.arc(a.x + 8, a.y - 2 + wob, 6, 0, 7); c.fill();
      c.fillStyle = '#14103F'; c.beginPath(); c.arc(a.x - 8 + V.dir * 2, a.y - 1 + wob, 2.8, 0, 7); c.arc(a.x + 8 + V.dir * 2, a.y - 1 + wob, 2.8, 0, 7); c.fill(); }
    c.fillStyle = '#FFD23F'; for (i = 0; i < V.shots.length; i++) { c.beginPath(); c.arc(V.shots[i].x, V.shots[i].y, 5, 0, 7); c.fill(); }
    c.fillStyle = '#7CFF6B'; for (i = 0; i < V.bombs.length; i++) { a = V.bombs[i]; c.beginPath(); c.moveTo(a.x, a.y - 10); c.quadraticCurveTo(a.x + 9, a.y + 4, a.x, a.y + 8); c.quadraticCurveTo(a.x - 9, a.y + 4, a.x, a.y - 10); c.fill(); }
    if (!(V.hit > 0 && Math.floor(V.t * 12) % 2)) {
      var x = V.x, y = VH - 52;
      c.fillStyle = '#FF9F1C'; c.beginPath(); c.moveTo(x - 9, y + 22); c.lineTo(x, y + 36 + Math.sin(V.t * 30) * 5); c.lineTo(x + 9, y + 22); c.fill();
      c.fillStyle = '#E5484D'; c.beginPath(); c.moveTo(x - 16, y + 6); c.lineTo(x - 30, y + 24); c.lineTo(x - 14, y + 20); c.moveTo(x + 16, y + 6); c.lineTo(x + 30, y + 24); c.lineTo(x + 14, y + 20); c.fill();
      c.fillStyle = '#F4F6FF'; c.beginPath(); c.moveTo(x, y - 30); c.quadraticCurveTo(x + 22, y - 6, x + 16, y + 22); c.lineTo(x - 16, y + 22); c.quadraticCurveTo(x - 22, y - 6, x, y - 30); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.strokeStyle = '#14103F'; c.lineWidth = 2; c.stroke();
    }
    c.fillStyle = 'rgba(255,79,163,.35)'; c.fillRect(0, VH - 112, VW, 2);
  }
  (function () {
    var wrap = $('#i-wrap');
    function to(e) { if (!V || !V.run) return; var t = e.touches ? e.touches[0] : e, r = wrap.getBoundingClientRect(); V.tx = Math.max(30, Math.min(VW - 30, (t.clientX - r.left) / r.width * VW)); }
    wrap.addEventListener('touchstart', to, { passive: true });
    wrap.addEventListener('touchmove', function (e) { if (V && V.run) e.preventDefault(); to(e); }, { passive: false });
    wrap.addEventListener('mousemove', function (e) { if (e.buttons) to(e); });
    wrap.addEventListener('mousedown', to);
    [].forEach.call(document.querySelectorAll('#i-pad button'), function (b) {
      var d = b.getAttribute('data-a') === 'l' ? -1 : 1;
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (V) V.hold = d; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { if (V && V.hold === d) V.hold = 0; }); });
    });
    $('#i-go').addEventListener('click', invStart);
    function leave() { var b = V ? V.back : 'album'; invStop(); gameLeave(b); }
    $('#i-end').addEventListener('click', leave); $('#i-quit').addEventListener('click', leave);
    document.addEventListener('keydown', function (e) { if (view !== 'inv' || !V) return; if (e.key === 'ArrowLeft') { V.hold = -1; e.preventDefault(); } else if (e.key === 'ArrowRight') { V.hold = 1; e.preventDefault(); } });
    document.addEventListener('keyup', function (e) { if (V && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) V.hold = 0; });
  })();

  /* ---------- Deutsch vorlesen (Stimme des Geraets) ---------- */
  var DEV = null;
  function findDe() {
    try {
      var vs = speechSynthesis.getVoices().filter(function (x) { return /^de/i.test(x.lang); }), pref = ['Anna', 'Petra', 'Helena', 'Markus', 'Viktor', 'Martin', 'Google Deutsch'], i, v;
      for (i = 0; i < pref.length; i++) { v = vs.filter(function (x) { return x.name.indexOf(pref[i]) === 0; })[0]; if (v) return v; }
      return vs[0] || null;
    } catch (e) { return null; }
  }
  function deVoiceOK() { try { return 'speechSynthesis' in window && (speechSynthesis.getVoices().length === 0 || !!findDe()); } catch (e) { return false; } }
  function speakDe(text, btn, rate) {
    try {
      if (!('speechSynthesis' in window)) { toast('Dieses Gerät kann leider nicht vorlesen.'); return; }
      stopSay();
      var u = new SpeechSynthesisUtterance(String(text).replace(/▢/g, ' Lücke ').replace(/[„“”]/g, '').replace(/ × /g, ' mal ').replace(/ : /g, ' geteilt durch ').replace(/ − /g, ' minus ').replace(/→/g, ', dann '));
      u.lang = 'de-DE'; u.rate = rate || 0.95;
      if (!DEV) DEV = findDe();
      if (DEV) u.voice = DEV;
      if (btn) { sayBtn = btn; btn.classList.add('playing'); u.onend = u.onerror = function () { btn.classList.remove('playing'); }; }
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function readQ() {
    if (!S || !S.cur) return;
    var q = S.cur.q, parts = [];
    if (!$('#p-fb').hidden && $('#p-ex').textContent && S.cur.tp.s !== 'en') { speakDe($('#p-fbt').textContent + '. ' + $('#p-ex').textContent, $('#p-read')); return; }
    parts.push(q.text);
    if (q.html) parts.push($('#p-html').textContent);
    if (S.cur.tp.s !== 'en' && q.big != null && !q.listen && !q.write) parts.push(String(q.big));
    if (S.cur.tp.s !== 'en' && q.opts && !q.pics && q.opts.every(function (o) { return o.t.length > 3; })) parts.push(q.opts.map(function (o) { return o.t; }).join('. Oder: '));
    speakDe(parts.join('. '), $('#p-read'));
  }

  /* ---------- Schreiben, Sortieren, Zuordnen ---------- */
  function buildX(q) {
    var box = $('#p-x'), i;
    S.miss = 0;
    if (q.write) {
      box.innerHTML = '<div class="wr-row"><input class="field" id="p-wr" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="done" aria-label="Deine Antwort"><button class="btn" id="p-wrok" type="button">OK</button></div>';
      var inp = $('#p-wr');
      var go = function () {
        if (!S || S.locked) return;
        var v = inp.value.trim().replace(/\s+/g, ' '); if (!v) { inp.focus(); return; }
        var w = q.write, ok = w.ans.some(function (a) { return w.ci ? a.toLowerCase() === v.toLowerCase() : a === v; });
        if (!ok && !w.ci && w.ans.some(function (a) { return a.toLowerCase() === v.toLowerCase(); })) q.explain = 'Fast! Achte auf die Groß- und Kleinschreibung: ' + w.ans[0];
        inp.blur(); answer(ok);
      };
      $('#p-wrok').addEventListener('click', go);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } e.stopPropagation(); });
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 80);
      return;
    }
    if (q.order) {
      var items = q.order.items, pool = [], sel = [], tiny = q.order.small;
      do { pool = shuf(items.map(function (_, k) { return k; })); } while (items.length > 1 && pool.every(function (k, j) { return items[k] === items[j]; }));
      box.innerHTML = '<div class="ord-ans' + (q.order.sep === '' ? ' joined' : '') + '" id="p-oa"></div><div class="ord-pool" id="p-op"></div><button class="btn" id="p-ook" type="button" disabled>Fertig</button>';
      var draw = function () {
        var a = $('#p-oa'), o = $('#p-op'); a.innerHTML = ''; o.innerHTML = '';
        sel.forEach(function (k, j) { var b = document.createElement('button'); b.type = 'button'; b.className = 'oc' + (tiny ? ' tiny' : ''); b.textContent = items[k]; b.addEventListener('click', function () { SND.tap(); sel.splice(j, 1); pool.push(k); draw(); }); a.appendChild(b); });
        pool.forEach(function (k, j) { var b = document.createElement('button'); b.type = 'button'; b.className = 'oc' + (tiny ? ' tiny' : ''); b.textContent = items[k]; b.addEventListener('click', function () { SND.tap(); pool.splice(j, 1); sel.push(k); draw(); }); o.appendChild(b); });
        $('#p-ook').disabled = pool.length > 0;
      };
      draw();
      $('#p-ook').addEventListener('click', function () { if (S && !S.locked && !pool.length) answer(sel.every(function (k, j) { return items[k] === items[j]; })); });
      return;
    }
    var pairs = q.match.pairs, left = shuf(pairs.map(function (_, k) { return k; })), right = shuf(left), cur = -1, done = 0, grid = document.createElement('div');
    grid.className = 'mt';
    var lb = {}, rb = {};
    for (i = 0; i < pairs.length; i++) (function (li, ri) {
      var a = document.createElement('button'); a.type = 'button'; a.className = 'mc'; a.textContent = pairs[li][0]; lb[li] = a;
      a.addEventListener('click', function () { if (cur >= 0) lb[cur].classList.remove('sel'); cur = li; a.classList.add('sel'); SND.tap(); });
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mc'; b.textContent = pairs[ri][1]; rb[ri] = b;
      b.addEventListener('click', function () {
        if (cur < 0) { toast('Tippe zuerst links ein Kästchen an.'); return; }
        if (pairs[cur][1] === pairs[ri][1]) { lb[cur].className = 'mc done'; b.className = 'mc done'; cur = -1; done++; SND.ok(done); if (done === pairs.length) answer(S.miss === 0); }
        else { S.miss++; SND.no(); b.classList.add('miss'); setTimeout(function () { b.classList.remove('miss'); }, 350); }
      });
      grid.appendChild(a); grid.appendChild(b);
    })(left[i], right[i]);
    box.appendChild(grid);
  }

  /* ---------- Erklaer-Karten ---------- */
  var EX = { id: '', i: 0 };
  function openEx(id) { if (!EXPL[id]) return; EX = { id: id, i: 0 }; $('#ex-t').textContent = BY_ID[id].e + ' ' + BY_ID[id].n; drawEx(); $('#ex').hidden = false; }
  function drawEx() {
    var st = EXPL[EX.id], d = $('#ex-d'); $('#ex-s').textContent = st[EX.i]; d.innerHTML = '';
    st.forEach(function (_, j) { var i = document.createElement('i'); if (j === EX.i) i.className = 'on'; d.appendChild(i); });
    $('#ex-k').textContent = 'Erklärung · Karte ' + (EX.i + 1) + ' von ' + st.length;
    $('#ex-next').textContent = EX.i + 1 < st.length ? 'Weiter' : 'Verstanden!';
    if (D.read) speakDe(st[EX.i], $('#ex-read'));
  }
  $('#ex-next').addEventListener('click', function () { stopSay(); if (EX.i + 1 < EXPL[EX.id].length) { EX.i++; drawEx(); } else $('#ex').hidden = true; });
  $('#ex-x').addEventListener('click', function () { stopSay(); $('#ex').hidden = true; });
  $('#ex-read').addEventListener('click', function () { speakDe(EXPL[EX.id][EX.i], $('#ex-read')); });

  /* ---------- Verdrahtung ---------- */
  $('#o-go').addEventListener('click', function () {
    var name = $('#o-name').value.trim().slice(0, 12);
    if (!name) { toast('Wie heißt du? Tippe einen Spitznamen ein.'); $('#o-name').focus(); return; }
    D.players.push(mkPlayer(name, ONB.look)); D.cur = D.players.length - 1;
    var c = cleanCode($('#o-code').value);
    if (ON.ready && !D.code && c.length >= 4) D.code = c;
    save(); SND.win(); pushScore(P()).then(fetchBoard).then(function () { if (view === 'home') renderTeaser(); });
    goHome();
  });
  $('#o-cancel').addEventListener('click', function () { renderProf(); show('prof'); });
  $('#h-av').addEventListener('click', function () { renderProf(); show('prof'); });
  $('#h-mix').addEventListener('click', function () { start('blitz', TOPICS.map(function (t) { return t.id; }), 'mix'); });
  $('#h-board').addEventListener('click', openBoard);
  $('#s-back').addEventListener('click', goHome);
  function selIds() { return SEL.ids.length ? SEL.ids : TOPICS.filter(function (t) { return t.s === SEL.s; }).map(function (t) { return t.id; }); }
  $('#d-practice').addEventListener('click', function () { start('practice', selIds(), SEL.s); });
  $('#d-blitz').addEventListener('click', function () { start('blitz', selIds(), SEL.s); });
  $('#p-quit').addEventListener('click', function () { var s = S && S.subj; stop(); S = null; if (s && s !== 'mix') { renderTopics(); show('subj'); } else goHome(); });
  $('#p-next').addEventListener('click', next);
  $('#p-spk').addEventListener('click', function () { if (S && S.cur && S.cur.q.say) say(S.cur.q.say, $('#p-spk')); else if (S && S.cur && S.cur.q.sayDe) speakDe(S.cur.q.sayDe, $('#p-spk'), 0.8); });
  $('#p-fbspk').addEventListener('click', function () { if (S && S.cur && S.cur.q.say) say(S.cur.q.say, $('#p-fbspk')); });
  $('#r-home').addEventListener('click', goHome);
  $('#ov-x').addEventListener('click', closeOv);
  $('#b-go').addEventListener('click', function () { if (joinCode($('#b-code').value)) openBoard(); });
  $('#b-leave').addEventListener('click', function () { var old = D.code; D.players.forEach(function (p) { removeScore(p, old); }); D.code = ''; ON.board = null; save(); $('#b-code').value = ''; renderBoard(); });
  $('#b-share').addEventListener('click', shareLink);
  [].forEach.call(document.querySelectorAll('#b-tabs button'), function (b) { b.addEventListener('click', function () { BT.tab = b.getAttribute('data-t'); renderBoard(); }); });
  $('#f-name').addEventListener('input', function (e) { var v = e.target.value.trim().slice(0, 12); if (v) { P().name = v; save(); } });
  $('#f-name').addEventListener('blur', function () { pushScore(P()); renderProf(); });
  $('#f-snd').addEventListener('click', function () { D.sound = !D.sound; save(); SND.ok(); renderProf(); });
  $('#f-read').addEventListener('click', function () { D.read = !D.read; save(); renderProf(); if (D.read) speakDe('Ich lese dir jetzt jede Frage vor.'); });
  $('#p-read').addEventListener('click', readQ);
  $('#p-why').addEventListener('click', function () { if (S && S.cur) openEx(S.cur.tp.id); });
  $('#f-add').addEventListener('click', function () { openOnb(false); });
  $('#f-del').addEventListener('click', function () {
    var p = P();
    $('#f-delq').textContent = 'Wirklich „' + p.name + '“ mit allen ' + p.pts + ' Punkten, Sternen und GIFs löschen? Das kann man nicht rückgängig machen.' + (ON.ready && D.code ? ' Der Eintrag verschwindet auch aus der Bestenliste von ' + D.code + '.' : '');
    $('#f-del').hidden = true; $('#f-delbox').hidden = false;
    try { $('#f-delbox').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  });
  $('#f-delno').addEventListener('click', renderProf);
  $('#f-delyes').addEventListener('click', function () {
    var p = P(), name = p.name;
    removeScore(p, D.code).then(function () { ON.board = null; return fetchBoard(); });
    if (ON.board) ON.board = ON.board.filter(function (x) { return !(x.mine && x.pid === p.pid); });
    D.players.splice(D.cur, 1); D.cur = 0; save();
    toast('„' + name + '“ wurde gelöscht.');
    if (!D.players.length) openOnb(true); else { renderProf(); show('prof'); }
  });
  [].forEach.call(document.querySelectorAll('#nav button'), function (b) {
    b.addEventListener('click', function () { var v = b.getAttribute('data-v'); SND.tap(); if (v === 'home') goHome(); else if (v === 'board') openBoard(); else if (v === 'album') { renderAlbum(); show('album'); } else { renderProf(); show('prof'); } });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#ov').hidden) { closeOv(); return; }
    if (view !== 'play' || !S) return;
    if (S.locked) { if (e.key === 'Enter' && !$('#p-next').hidden) next(); return; }
    if (S.cur.q.num != null) { if (e.key >= '0' && e.key <= '9') digit(e.key); else if (e.key === 'Backspace') { S.input = S.input.slice(0, -1); $('#p-ans').textContent = S.input; } else if (e.key === 'Enter' && S.input) answer(+S.input === S.cur.q.num); }
    else if (S.cur.q.opts && e.key >= '1' && e.key <= '5' && S.cur.q.opts[+e.key - 1]) answer(!!S.cur.q.opts[+e.key - 1].ok, +e.key - 1);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopTune(); });

  buildKeys();
  if (!D.players.length) openOnb(true);
  else {
    goHome();
    var kk = ''; try { kk = cleanCode(new URLSearchParams(location.search).get('k')); } catch (e) {}
    if (ON.ready && !D.code && kk.length >= 4) joinCode(kk);
    else if (ON.ready && D.code) pushScore(P()).then(fetchBoard).then(function () { if (view === 'home') renderTeaser(); });
  }
  window.__k3 = { cur: function () { return S && S.cur; }, snake: function () { return K; }, tet: function () { return T; }, inv: function () { return V; }, TOPICS: TOPICS, CLIPS: CLIPS, ask: function (id) { start('practice', [id], BY_ID[id].s); }, clip: function (i) { showClip(CLIPS[i], true, i + 1); } };
