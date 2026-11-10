  var LOOKS = {
    heft:     { name: 'Heft',      mascot: 'Edda',  bg: '#F2F5FB', ink: '#17213B', c: ['#8FB1FF', '#E9F0FF', '#FFC233'], wave: 'triangle', ey: 52, ex: [42, 78], my: 0 },
    space:    { name: 'Weltraum',  mascot: 'Zorbo', bg: '#0B1030', ink: '#F1F3FF', c: ['#5BE3A0', '#2FB87A', '#FFC94A'], wave: 'square',   ey: 60, ex: [42, 78], my: 90 },
    sloth:    { name: 'Costa Rica', mascot: 'Paco',  bg: '#DAF1D6', ink: '#14361F', c: ['#9C8467', '#E9DCC3', '#5B4630'], wave: 'sine',     ey: 60, ex: [42, 78], my: 88 },
    football: { name: 'Fußball',   mascot: 'Bruno', bg: '#D9F0DE', ink: '#0F2A1B', c: ['#FFFFFF', '#1B1B2F', '#E53935'], wave: 'triangle', ey: 62, ex: [44, 76], my: 86 },
    kiwi:     { name: 'Kiwi',      mascot: 'Kiki',  bg: '#EAF5C9', ink: '#26340F', c: ['#8B5E34', '#B98D58', '#F2D9A0'], wave: 'sine',     ey: 54, ex: [44, 76], my: 0 },
    bear:     { name: 'Bär',       mascot: 'Bobo',  bg: '#F6E7C1', ink: '#3B2416', c: ['#B5773E', '#F3D9B1', '#3B2416'], wave: 'triangle', ey: 58, ex: [44, 76], my: 90 },
    unicorn:  { name: 'Einhorn',       mascot: 'Luna',   bg: '#FCEAF4', ink: '#3B1F4A', c: ['#FF8FC0', '#FFFFFF', '#FFD25A'], wave: 'sine',     ey: 58, ex: [44, 76], my: 86 },
    mermaid:  { name: 'Meerjungfrau',  mascot: 'Marina', bg: '#DFF6F5', ink: '#0F3B45', c: ['#2FB5A8', '#FFD9BF', '#FF8FB1'], wave: 'sine',     ey: 64, ex: [46, 74], my: 86 },
    butterfly:{ name: 'Schmetterling', mascot: 'Flora',  bg: '#EEE7FB', ink: '#2D1B55', c: ['#B58CFF', '#FF9CCB', '#FFE0C2'], wave: 'triangle', ey: 64, ex: [46, 74], my: 86 },
    cat:      { name: 'Katze',         mascot: 'Mimi',   bg: '#FFF0B3', ink: '#4A3000', c: ['#F5A25D', '#FFF1DC', '#FF8FA3'], wave: 'triangle', ey: 60, ex: [42, 78], my: 92 }
  };
  var LOOK_ORDER = ['kiwi', 'bear', 'sloth', 'unicorn', 'mermaid', 'butterfly', 'cat', 'heft', 'space', 'football'];
  function face(L, mood) {
    var ey = L.ey, a = L.ex[0], b = L.ex[1], s = '', K = '#1B1B2F';
    [a, b].forEach(function (x) {
      if (mood === 'happy') {
        s += '<path d="M' + (x - 11) + ' ' + (ey + 3) + ' Q' + x + ' ' + (ey - 12) + ' ' + (x + 11) + ' ' + (ey + 3) + '" fill="none" stroke="' + K + '" stroke-width="4" stroke-linecap="round"/>';
      } else {
        s += '<circle cx="' + x + '" cy="' + ey + '" r="11" fill="#fff" stroke="' + K + '" stroke-width="2"/>';
        s += '<circle cx="' + x + '" cy="' + (ey + (mood === 'sad' ? 3 : 0)) + '" r="5" fill="' + K + '"/>';
      }
    });
    if (mood === 'sad') {
      s += '<path d="M' + (a - 12) + ' ' + (ey - 17) + ' L' + (a + 8) + ' ' + (ey - 13) + ' M' + (b + 12) + ' ' + (ey - 17) + ' L' + (b - 8) + ' ' + (ey - 13) + '" fill="none" stroke="' + K + '" stroke-width="3.5" stroke-linecap="round"/>';
    }
    if (L.my) {
      var my = L.my;
      if (mood === 'happy') s += '<path d="M46 ' + my + ' Q60 ' + (my + 20) + ' 74 ' + my + ' Z" fill="#7A1F2B" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>';
      else if (mood === 'sad') s += '<path d="M50 ' + (my + 6) + ' Q60 ' + (my - 4) + ' 70 ' + (my + 6) + '" fill="none" stroke="' + K + '" stroke-width="3.5" stroke-linecap="round"/>';
      else s += '<path d="M50 ' + my + ' Q60 ' + (my + 8) + ' 70 ' + my + '" fill="none" stroke="' + K + '" stroke-width="3.5" stroke-linecap="round"/>';
    }
    return s;
  }

  function mascotSVG(look, mood) {
    var L = LOOKS[look] || LOOKS.heft, c = L.c;
    var m1 = 'fill:' + c[0], m2 = 'fill:' + c[1], m3 = 'fill:' + c[2], body = '';
    if (look === 'space') {
      body = '<line x1="60" y1="16" x2="60" y2="30" style="stroke:' + c[1] + ';stroke-width:4;stroke-linecap:round"/>' +
        '<circle cx="60" cy="12" r="7" style="' + m3 + '"/>' +
        '<ellipse cx="22" cy="74" rx="7" ry="11" style="' + m2 + '"/><ellipse cx="98" cy="74" rx="7" ry="11" style="' + m2 + '"/>' +
        '<ellipse cx="60" cy="68" rx="42" ry="40" style="' + m1 + '"/>';
    } else if (look === 'sloth') {
      body = '<rect x="2" y="12" width="116" height="9" rx="4.5" fill="#7A5230"/>' +
        '<ellipse cx="22" cy="10" rx="12" ry="5" transform="rotate(-25 22 10)" fill="#3DB35A"/><ellipse cx="100" cy="9" rx="12" ry="5" transform="rotate(20 100 9)" fill="#2E9B4C"/>' +
        '<ellipse cx="60" cy="66" rx="46" ry="42" style="' + m1 + '"/>' +
        '<ellipse cx="60" cy="68" rx="36" ry="31" style="' + m2 + '"/>' +
        '<ellipse cx="42" cy="60" rx="16" ry="13" transform="rotate(-22 42 60)" style="' + m3 + '"/><ellipse cx="78" cy="60" rx="16" ry="13" transform="rotate(22 78 60)" style="' + m3 + '"/>' +
        '<ellipse cx="60" cy="75" rx="7" ry="5" style="' + m3 + '"/>';
    } else if (look === 'kiwi') {
      body = '<ellipse cx="46" cy="108" rx="10" ry="6" fill="#F2994A"/><ellipse cx="74" cy="108" rx="10" ry="6" fill="#F2994A"/>' +
        '<ellipse cx="60" cy="62" rx="46" ry="44" style="' + m1 + '"/>' +
        '<ellipse cx="60" cy="70" rx="34" ry="28" style="' + m2 + '"/>' +
        '<path d="M44 26 L48 35 M56 21 L58 32 M66 21 L64 32 M77 26 L72 35" fill="none" stroke="#6B4423" stroke-width="3" stroke-linecap="round"/>';
      body += '<path d="M54 68 L66 68 Q69 94 60 115 Q58 92 54 68 Z" style="' + m3 + ';stroke:#B8935A;stroke-width:1.5;stroke-linejoin:round"/>';
    } else if (look === 'bear') {
      body = '<circle cx="24" cy="30" r="17" style="' + m1 + '"/><circle cx="24" cy="30" r="8" style="' + m2 + '"/>' +
        '<circle cx="96" cy="30" r="17" style="' + m1 + '"/><circle cx="96" cy="30" r="8" style="' + m2 + '"/>' +
        '<circle cx="60" cy="66" r="44" style="' + m1 + '"/>' +
        '<ellipse cx="60" cy="84" rx="21" ry="15" style="' + m2 + '"/>' +
        '<ellipse cx="60" cy="76" rx="7" ry="5" style="' + m3 + '"/>';
    } else if (look === 'unicorn') {
      var rim = ';stroke:#E7B6D4;stroke-width:2.5;stroke-linejoin:round';
      body = '<ellipse cx="22" cy="72" rx="15" ry="30" style="' + m1 + '"/><ellipse cx="98" cy="72" rx="15" ry="30" style="' + m1 + '"/>' +
        '<path d="M36 36 L30 12 L52 28 Z" style="' + m2 + rim + '"/><path d="M84 36 L90 12 L68 28 Z" style="' + m2 + rim + '"/>' +
        '<path d="M60 2 L51 34 L69 34 Z" style="' + m3 + ';stroke:#E5A800;stroke-width:2.5;stroke-linejoin:round"/>' +
        '<ellipse cx="60" cy="68" rx="42" ry="40" style="' + m2 + ';stroke:#E7B6D4;stroke-width:3"/>' +
        '<path d="M27 52 Q60 12 93 52 Q77 38 60 46 Q43 38 27 52 Z" style="' + m1 + '"/>' +
        '<circle cx="31" cy="78" r="7" fill="#FFB3D1" fill-opacity="0.8"/><circle cx="89" cy="78" r="7" fill="#FFB3D1" fill-opacity="0.8"/>';
    } else if (look === 'mermaid') {
      body = '<ellipse cx="60" cy="68" rx="50" ry="48" style="' + m1 + '"/>' +
        '<circle cx="60" cy="68" r="37" style="' + m2 + '"/>' +
        '<path d="M23 62 Q26 26 60 26 Q94 26 97 62 Q80 42 60 48 Q40 42 23 62 Z" style="' + m1 + '"/>' +
        '<circle cx="88" cy="34" r="9" style="' + m3 + '"/><circle cx="88" cy="34" r="4" fill="#FFFFFF" fill-opacity="0.7"/>' +
        '<circle cx="36" cy="82" r="6" fill="#FF9DB5" fill-opacity="0.7"/><circle cx="84" cy="82" r="6" fill="#FF9DB5" fill-opacity="0.7"/>';
    } else if (look === 'butterfly') {
      body = '<ellipse cx="26" cy="42" rx="24" ry="30" style="' + m1 + '"/><ellipse cx="94" cy="42" rx="24" ry="30" style="' + m1 + '"/>' +
        '<ellipse cx="32" cy="88" rx="19" ry="21" style="' + m2 + '"/><ellipse cx="88" cy="88" rx="19" ry="21" style="' + m2 + '"/>' +
        '<circle cx="24" cy="40" r="8" fill="#FFFFFF" fill-opacity="0.6"/><circle cx="96" cy="40" r="8" fill="#FFFFFF" fill-opacity="0.6"/>' +
        '<circle cx="32" cy="88" r="6" fill="#FFFFFF" fill-opacity="0.6"/><circle cx="88" cy="88" r="6" fill="#FFFFFF" fill-opacity="0.6"/>' +
        '<path d="M52 40 Q46 22 40 14 M68 40 Q74 22 80 14" fill="none" stroke="#2D1B55" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="40" cy="14" r="4" fill="#2D1B55"/><circle cx="80" cy="14" r="4" fill="#2D1B55"/>' +
        '<circle cx="60" cy="68" r="30" style="' + m3 + '"/>';
    } else if (look === 'cat') {
      body = '<path d="M20 52 L18 14 L50 34 Z" style="' + m1 + '"/><path d="M26 44 L25 24 L42 36 Z" style="' + m3 + '"/>' +
        '<path d="M100 52 L102 14 L70 34 Z" style="' + m1 + '"/><path d="M94 44 L95 24 L78 36 Z" style="' + m3 + '"/>' +
        '<ellipse cx="60" cy="68" rx="46" ry="40" style="' + m1 + '"/>' +
        '<path d="M52 34 L52 44 M60 32 L60 44 M68 34 L68 44" fill="none" stroke="#8A5A2B" stroke-width="3.5" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="86" rx="22" ry="15" style="' + m2 + '"/>' +
        '<path d="M54 76 L66 76 L60 83 Z" style="' + m3 + '"/>' +
        '<path d="M38 90 L14 86 M38 96 L16 100 M82 90 L106 86 M82 96 L104 100" fill="none" stroke="#1B1B2F" stroke-opacity="0.5" stroke-width="2.5" stroke-linecap="round"/>';
    } else if (look === 'football') {
      body = '<circle cx="60" cy="62" r="46" style="' + m1 + ';stroke:' + c[1] + ';stroke-width:4"/>' +
        '<path d="M60 20 L74 30 L69 46 L51 46 L46 30 Z" style="' + m2 + '"/>' +
        '<path d="M17 52 L31 56 L33 72 L21 78 Z" style="' + m2 + '"/><path d="M103 52 L89 56 L87 72 L99 78 Z" style="' + m2 + '"/>' +
        '<path d="M44 106 L60 99 L76 106 L72 108 L48 108 Z" style="' + m2 + '"/>';
    } else {
      body = '<path d="M28 40 L22 14 L48 28 Z" style="' + m3 + '"/><path d="M92 40 L98 14 L72 28 Z" style="' + m3 + '"/>' +
        '<ellipse cx="60" cy="68" rx="40" ry="42" style="' + m1 + '"/>' +
        '<ellipse cx="60" cy="88" rx="24" ry="20" style="' + m2 + '"/>' +
        '<path d="M53 62 L67 62 L60 74 Z" style="' + m3 + '"/>';
    }
    return '<svg viewBox="0 0 120 120" role="img" aria-label="' + L.mascot + '">' + body + face(L, mood) + '</svg>';
  }

