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
  function entry(p) { rollWeek(p); return { n: p.name.slice(0, 12), a: p.look, t: p.pts, s: p.sub, wk: p.wk, wt: p.wpts, ws: p.wsub, lv: level(p.pts), u: Date.now() }; }
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
        for (k in j) if (j[k] && typeof j[k].n === 'string') list.push({ key: k, mine: k.indexOf(a.uid + '_') === 0, pid: k.slice(a.uid.length + 1), n: j[k].n.slice(0, 14), a: j[k].a, t: +j[k].t || 0, s: j[k].s || {}, wk: j[k].wk, wt: +j[k].wt || 0, ws: j[k].ws || {}, lv: +j[k].lv || 0 });
        ON.board = list; ON.at = Date.now(); ON.err = '';
        return list;
      });
    }).catch(function (e) { ON.err = String(e.message || e); return null; });
  }
  function cleanCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9ÄÖÜ-]/g, '').slice(0, 12); }
  function localBoard() { return D.players.map(function (p) { rollWeek(p); return { key: p.pid, mine: true, pid: p.pid, n: p.name, a: p.look, t: p.pts, s: p.sub, wk: p.wk, wt: p.wpts, ws: p.wsub, lv: level(p.pts) }; }); }
  function ranked(tab, f) {
    var src = (ON.ready && D.code && ON.board) ? ON.board.slice() : localBoard(), wk = weekKey(), me = P();
    if (ON.ready && D.code && ON.board && me) { /* eigene Zahlen sofort zeigen, auch wenn der Server noch alt ist */
      D.players.forEach(function (p) { var e = entry(p), hit = src.filter(function (x) { return x.mine && x.pid === p.pid; })[0]; if (hit) { hit.t = Math.max(hit.t, e.t); if (e.wk === wk) { hit.wk = wk; hit.wt = e.wt; hit.ws = e.ws; } hit.s = e.s; hit.n = e.n; hit.a = e.a; } });
    }
    var rows = src.map(function (x) { var v = tab === 'w' ? (x.wk === wk ? (f ? +x.ws[f] || 0 : x.wt) : 0) : (f ? +x.s[f] || 0 : x.t); return { x: x, v: v, me: !!(me && x.mine && x.pid === me.pid) }; });
    if (tab === 'w') rows = rows.filter(function (r) { return r.v > 0 || r.me; });
    rows.sort(function (a, b) { return b.v - a.v || a.x.n.localeCompare(b.x.n); });
    return rows;
  }

  /* ---------- Ansichten ---------- */
  var VIEWS = ['onb', 'home', 'subj', 'play', 'res', 'board', 'album', 'prof'], view = '';
  function show(v) {
    view = v;
    VIEWS.forEach(function (k) { $('#v-' + k).hidden = k !== v; });
    var navOn = ['home', 'board', 'album', 'prof'].indexOf(v) >= 0;
    $('#nav').hidden = !navOn; $('#dock').hidden = v !== 'subj';
    [].forEach.call(document.querySelectorAll('#nav button'), function (b) { b.setAttribute('aria-current', b.getAttribute('data-v') === v ? 'true' : 'false'); });
    try { window.scrollTo(0, 0); } catch (e) {}
    stopSay();
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
      var b = document.createElement('button'), n = pips(mastery(p, t.id)), on = SEL.ids.indexOf(t.id) >= 0;
      b.type = 'button'; b.className = 'tp'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = '<span class="em">' + t.e + '</span><b></b><span class="pips" aria-label="' + n + ' von 3 Sternen"><i class="' + (n > 0 ? 'on' : '') + '">★</i><i class="' + (n > 1 ? 'on' : '') + '">★</i><i class="' + (n > 2 ? 'on' : '') + '">★</i></span>';
      b.querySelector('b').textContent = t.n;
      b.addEventListener('click', function () { var i = SEL.ids.indexOf(t.id); if (i >= 0) SEL.ids.splice(i, 1); else SEL.ids.push(t.id); SND.tap(); renderTopics(); });
      box.appendChild(b);
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
      key = it.id; S.used[key] = 1; q = it.make(L);
    } else q = tp.gen(L);
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
    var c = pickQ(), q = c.q;
    S.cur = c; S.asked++; S.input = ''; S.locked = false;
    if (S.mode !== 'blitz') $('#p-prog').style.transform = 'scaleX(' + (S.asked - 1) / S.n + ')';
    $('#p-tag').textContent = c.tp.e + ' ' + c.tp.n + (c.again ? ' · nochmal' : '');
    $('#p-tag').style.background = SUBJ[c.tp.s].c;
    $('#p-q').className = 'q';
    $('#p-text').textContent = q.text;
    $('#p-html').hidden = !q.html; $('#p-html').innerHTML = q.html || '';
    var showBig = q.big != null && !q.listen;
    $('#p-big').hidden = !showBig; $('#p-big').textContent = showBig ? q.big : '';
    $('#p-big').className = 'q-big' + (q.small ? ' small' : showBig && String(q.big).length > 9 ? ' long' : '');
    $('#p-emoji').hidden = !q.emoji; $('#p-emoji').innerHTML = q.emoji || '';
    var spk = !!(q.listen || q.speaker);
    $('#p-spk').hidden = !spk; $('#p-spk').className = 'spk' + (q.listen ? '' : ' sm');
    $('#p-bigrow').hidden = !(showBig || q.emoji || spk);
    $('#p-img').hidden = !q.img; $('#p-img').innerHTML = q.img || ''; $('#p-img').className = 'art' + (q.wide ? ' wide' : '');
    var isNum = q.num != null;
    $('#p-ans').hidden = !isNum; $('#p-ans').textContent = '';
    $('#p-keys').hidden = !isNum; $('#p-keys').setAttribute('data-locked', 'false');
    var box = $('#p-opts'); box.hidden = isNum; box.innerHTML = ''; box.setAttribute('data-locked', 'false');
    if (!isNum) {
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
    if (q.num == null) { var bs = $('#p-opts').children; q.opts.forEach(function (o, j) { bs[j].classList.add(o.ok ? 'right' : j === idx ? 'wrong' : 'dim'); }); $('#p-opts').setAttribute('data-locked', 'true'); }
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
    $('#p-fbt').textContent = ok ? pick(['Richtig!', 'Super!', 'Genau!', 'Stark!', 'Klasse!']) + (S.streak >= 3 ? ' ' + S.streak + ' in Folge' : '') : 'Richtig ist: ' + q.ans;
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
    var after = level(p.pts);
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
    [['', 'Alle Fächer']].concat(SUBJ_ORDER.map(function (s) { return [s, SUBJ[s].n]; })).forEach(function (f) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = f[1]; b.setAttribute('aria-pressed', BT.f === f[0] ? 'true' : 'false');
      b.addEventListener('click', function () { BT.f = f[0]; renderBoard(); }); fb.appendChild(b);
    });
    var rows = ranked(BT.tab, BT.f), list = $('#b-list'); list.innerHTML = '';
    $('#b-note').textContent = !online ? 'Die Online-Bestenliste für die ganze Klasse wird gerade eingerichtet. Bis dahin siehst du hier alle, die auf diesem Handy spielen.' : !joined ? 'Ohne Klassen-Code siehst du nur die Spieler auf diesem Handy.' : ON.err ? 'Keine Verbindung. Du siehst den letzten Stand.' : !ON.board ? 'Lade Bestenliste …' : BT.tab === 'w' ? 'Jeden Montag startet die Wochenliste neu.' : 'Alle Punkte seit dem Start.';
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
  $('#p-spk').addEventListener('click', function () { if (S && S.cur && S.cur.q.say) say(S.cur.q.say, $('#p-spk')); });
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
    else if (e.key >= '1' && e.key <= '5' && S.cur.q.opts[+e.key - 1]) answer(!!S.cur.q.opts[+e.key - 1].ok, +e.key - 1);
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
  window.__k3 = { TOPICS: TOPICS, CLIPS: CLIPS, ask: function (id) { start('practice', [id], BY_ID[id].s); }, clip: function (i) { showClip(CLIPS[i], true, i + 1); } };
