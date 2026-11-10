  /* ================= ENGLISCH ================= */
  (function () {
    function swatch(c) { return '<span class="swatch" style="background:' + c + '"></span>'; }
    function misspell(w) {
      var out = [], i = R(1, Math.max(1, w.length - 2));
      if (w.length > 3) out.push(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
      out.push(w.slice(0, i) + w.slice(i + 1));
      out.push(w.slice(0, i) + w[i] + w[i] + w.slice(i + 1));
      var sw = { a: 'e', e: 'a', i: 'y', o: 'u', u: 'o', y: 'i', c: 'k', k: 'c' };
      for (i = w.length - 1; i > 0; i--) if (sw[w[i]]) { out.push(w.slice(0, i) + sw[w[i]] + w.slice(i + 1)); break; }
      return uniq(out).filter(function (x) { return x !== w && x.indexOf('undefined') < 0; });
    }
    /* Vokabel-Thema: Liste "english|deutsch|Bild" */
    function vocab(id, n, e, list, opt) {
      opt = opt || {};
      var V = list.map(function (x) { x = x.split('|'); return { en: x[0], de: x[1], pic: x[2] || '' }; });
      function others(v, f) { return shuf(V.filter(function (o) { return o !== v && o[f] !== v[f]; })).slice(0, 3).map(function (o) { return o[f]; }); }
      function pic(v) { return opt.color ? swatch(v.pic) : v.pic; }
      bank('en', id, n, e, V.map(function (v) {
        return { id: id + ':' + v.en, make: function (L, rich) {
          var types = opt.phrase ? ['en2de', 'de2en', 'listen'] : L === 1 ? ['de2en', 'en2de', 'en2de', 'listen'] : L === 2 ? ['de2en', 'en2de', 'listen', 'listen'] : ['de2en', 'listen', 'spell', 'spell'], t = pick(types);
          var ex = v.en + ' = ' + v.de, base = { say: v.en, explain: ex, sayAfter: true };
          if (t === 'spell' && v.en.length < 4) t = 'de2en';
          if (rich && Math.random() < 0.34) {
            var r = Math.random();
            if (opt.phrase) {
              var ws = v.en.split(' ');
              if (ws.length >= 3 && ws.length <= 7) return ORDER('Bringe die Wörter in die richtige Reihenfolge.', ws, Object.assign(base, { html: esc(v.de), short: ex }));
            } else if (r < 0.5 && V.length >= 4) {
              var four = [v].concat(shuf(V.filter(function (o) { return o !== v && o.de !== v.de && o.en !== v.en; })).slice(0, 3));
              return MATCH('Was gehört zusammen?', shuf(four).map(function (o) { return [o.en, o.de]; }));
            } else if (L >= 2 && v.en.length <= 10 && !/[^a-zA-Z ]/.test(v.en)) {
              return WRITE('Hör zu und schreibe das englische Wort.', v.en, Object.assign(base, { ci: true, big: v.de, emoji: pic(v), speaker: true, auto: true }));
            }
          }
          if (t === 'en2de') return MC('Was heißt das auf Deutsch?', v.de, others(v, 'de'), Object.assign(base, { big: v.en, speaker: true, small: opt.phrase }));
          if (t === 'de2en') return MC('Wie heißt das auf Englisch?', v.en, others(v, 'en'), Object.assign(base, { big: v.de, emoji: pic(v), small: opt.phrase, enOpts: true }));
          if (t === 'listen') return MC('Hör genau zu. Was hörst du?', L === 1 || opt.phrase ? v.de : v.en, others(v, L === 1 || opt.phrase ? 'de' : 'en'), Object.assign(base, { listen: true, auto: true }));
          return MC('Wie schreibt man das richtig?', v.en, misspell(v.en), Object.assign(base, { big: v.de, emoji: pic(v), speaker: true }));
        } };
      }));
    }
    vocab('e_colours', 'Colours', '🎨', ['red|rot|#E3262E', 'blue|blau|#1E63D0', 'green|grün|#2FA84F', 'yellow|gelb|#FFD21F', 'orange|orange|#FF8A1F', 'purple|lila|#8E44C9', 'pink|rosa|#FF7EB6', 'black|schwarz|#111111', 'white|weiß|#FFFFFF', 'brown|braun|#7A4B22', 'grey|grau|#8D8D97'], { color: true });
    vocab('e_numbers', 'Numbers', '🔢', ['one|1', 'two|2', 'three|3', 'four|4', 'five|5', 'six|6', 'seven|7', 'eight|8', 'nine|9', 'ten|10', 'eleven|11', 'twelve|12', 'thirteen|13', 'fourteen|14', 'fifteen|15', 'sixteen|16', 'seventeen|17', 'eighteen|18', 'nineteen|19', 'twenty|20', 'thirty|30', 'forty|40', 'fifty|50', 'sixty|60', 'seventy|70', 'eighty|80', 'ninety|90', 'a hundred|100']);
    vocab('e_family', 'Family & Friends', '👨‍👩‍👧', ['mother|Mutter|👩', 'father|Vater|👨', 'sister|Schwester|👧', 'brother|Bruder|👦', 'grandma|Oma|👵', 'grandpa|Opa|👴', 'baby|Baby|👶', 'family|Familie|👨‍👩‍👧‍👦', 'friend|Freund / Freundin|🤝', 'aunt|Tante', 'uncle|Onkel', 'parents|Eltern', 'boy|Junge|👦', 'girl|Mädchen|👧', 'child|Kind|🧒']);
    vocab('e_body', 'My Body', '🧍', ['head|Kopf', 'hair|Haare|💇', 'eye|Auge|👁️', 'ear|Ohr|👂', 'nose|Nase|👃', 'mouth|Mund|👄', 'tooth|Zahn|🦷', 'arm|Arm|💪', 'hand|Hand|✋', 'finger|Finger|☝️', 'leg|Bein|🦵', 'foot|Fuß|🦶', 'knee|Knie', 'shoulder|Schulter', 'tummy|Bauch', 'face|Gesicht|🙂']);
    vocab('e_clothes', 'Clothes', '👕', ['T-shirt|T-Shirt|👕', 'trousers|Hose|👖', 'dress|Kleid|👗', 'skirt|Rock', 'jumper|Pullover', 'jacket|Jacke|🧥', 'shoes|Schuhe|👟', 'socks|Socken|🧦', 'hat|Hut|👒', 'cap|Kappe|🧢', 'scarf|Schal|🧣', 'gloves|Handschuhe|🧤', 'boots|Stiefel|🥾', 'shorts|kurze Hose|🩳', 'coat|Mantel']);
    vocab('e_animals', 'Animals', '🐶', ['dog|Hund|🐶', 'cat|Katze|🐱', 'mouse|Maus|🐭', 'rabbit|Kaninchen|🐰', 'hamster|Hamster|🐹', 'bird|Vogel|🐦', 'fish|Fisch|🐟', 'horse|Pferd|🐴', 'cow|Kuh|🐮', 'pig|Schwein|🐷', 'sheep|Schaf|🐑', 'duck|Ente|🦆', 'chicken|Huhn|🐔', 'frog|Frosch|🐸', 'lion|Löwe|🦁', 'elephant|Elefant|🐘', 'monkey|Affe|🐵', 'bear|Bär|🐻', 'snake|Schlange|🐍', 'tiger|Tiger|🐯', 'giraffe|Giraffe|🦒', 'penguin|Pinguin|🐧', 'spider|Spinne|🕷️', 'butterfly|Schmetterling|🦋', 'guinea pig|Meerschweinchen', 'budgie|Wellensittich|🦜']);
    vocab('e_food', 'Food & Drink', '🍎', ['apple|Apfel|🍎', 'banana|Banane|🍌', 'pear|Birne|🍐', 'strawberry|Erdbeere|🍓', 'bread|Brot|🍞', 'cheese|Käse|🧀', 'egg|Ei|🥚', 'milk|Milch|🥛', 'water|Wasser|💧', 'juice|Saft|🧃', 'tea|Tee|🍵', 'cake|Kuchen|🍰', 'ice cream|Eis|🍦', 'pizza|Pizza|🍕', 'chips|Pommes|🍟', 'sandwich|belegtes Brot|🥪', 'carrot|Karotte|🥕', 'tomato|Tomate|🍅', 'potato|Kartoffel|🥔', 'sausage|Wurst|🌭', 'chocolate|Schokolade|🍫', 'soup|Suppe|🍲', 'butter|Butter|🧈', 'sweets|Süßigkeiten|🍬', 'biscuit|Keks|🍪', 'breakfast|Frühstück|🍳', 'lunch|Mittagessen', 'dinner|Abendessen']);
    vocab('e_school', 'At School', '🎒', ['pencil|Bleistift|✏️', 'pen|Füller|🖊️', 'book|Buch|📖', 'exercise book|Heft|📓', 'rubber|Radiergummi', 'ruler|Lineal|📏', 'scissors|Schere|✂️', 'glue|Kleber', 'schoolbag|Schultasche|🎒', 'pencil case|Federmäppchen', 'desk|Schultisch', 'chair|Stuhl|🪑', 'board|Tafel', 'teacher|Lehrer / Lehrerin|🧑‍🏫', 'classroom|Klassenzimmer', 'window|Fenster|🪟', 'door|Tür|🚪', 'sharpener|Spitzer']);
    vocab('e_home', 'My Home', '🏠', ['house|Haus|🏠', 'room|Zimmer', 'kitchen|Küche|🍳', 'bedroom|Schlafzimmer', 'bathroom|Badezimmer|🛁', 'living room|Wohnzimmer|🛋️', 'garden|Garten|🌳', 'bed|Bett|🛏️', 'table|Tisch', 'lamp|Lampe|💡', 'toy|Spielzeug|🧸', 'ball|Ball|⚽', 'bike|Fahrrad|🚲', 'car|Auto|🚗', 'bus|Bus|🚌', 'train|Zug|🚆', 'TV|Fernseher|📺', 'clock|Uhr|🕒']);
    vocab('e_weather', 'Weather', '🌦️', ['sunny|sonnig|☀️', 'rainy|regnerisch|🌧️', 'cloudy|bewölkt|☁️', 'windy|windig|💨', 'snowy|verschneit|❄️', 'foggy|neblig|🌫️', 'stormy|stürmisch|⛈️', 'hot|heiß|🥵', 'cold|kalt|🥶', 'warm|warm', 'rainbow|Regenbogen|🌈', 'sun|Sonne|🌞', 'rain|Regen|☔', 'snow|Schnee|⛄', 'wind|Wind|🌬️', 'umbrella|Regenschirm|☂️']);
    vocab('e_days', 'Days & Time', '📆', ['Monday|Montag', 'Tuesday|Dienstag', 'Wednesday|Mittwoch', 'Thursday|Donnerstag', 'Friday|Freitag', 'Saturday|Samstag', 'Sunday|Sonntag', 'today|heute', 'tomorrow|morgen', 'yesterday|gestern', 'week|Woche', 'weekend|Wochenende', 'day|Tag', 'morning|Morgen|🌅', 'night|Nacht|🌙', 'birthday|Geburtstag|🎂']);
    vocab('e_months', 'Months & Seasons', '🍂', ['January|Januar', 'February|Februar', 'March|März', 'April|April', 'May|Mai', 'June|Juni', 'July|Juli', 'August|August', 'September|September', 'October|Oktober', 'November|November', 'December|Dezember', 'spring|Frühling|🌷', 'summer|Sommer|🏖️', 'autumn|Herbst|🍂', 'winter|Winter|☃️', 'month|Monat', 'year|Jahr']);
    vocab('e_hobbies', 'Hobbies & Sports', '⚽', ['football|Fußball|⚽', 'swimming|Schwimmen|🏊', 'dancing|Tanzen|💃', 'riding|Reiten|🏇', 'reading|Lesen|📚', 'singing|Singen|🎤', 'painting|Malen|🎨', 'cycling|Radfahren|🚴', 'running|Laufen|🏃', 'skiing|Skifahren|⛷️', 'tennis|Tennis|🎾', 'basketball|Basketball|🏀', 'music|Musik|🎵', 'computer games|Computerspiele|🎮', 'skating|Eislaufen|⛸️', 'jumping|Springen', 'climbing|Klettern|🧗', 'playing|Spielen|🎲']);
    vocab('e_feelings', 'Feelings & Opposites', '😀', ['happy|glücklich|😀', 'sad|traurig|😢', 'angry|wütend|😠', 'tired|müde|😴', 'hungry|hungrig|🤤', 'thirsty|durstig', 'scared|ängstlich|😱', 'ill|krank|🤒', 'big|groß', 'small|klein', 'good|gut|👍', 'bad|schlecht|👎', 'old|alt', 'new|neu', 'fast|schnell|⚡', 'slow|langsam|🐢', 'long|lang', 'short|kurz', 'funny|lustig|😂', 'nice|nett']);
    vocab('e_phrases', 'Say Hello!', '👋', ['Hello!|Hallo!', 'Good morning!|Guten Morgen!', 'Goodbye!|Auf Wiedersehen!', 'How are you?|Wie geht es dir?', "I'm fine, thank you.|Mir geht es gut, danke.", "What's your name?|Wie heißt du?", 'My name is Tom.|Ich heiße Tom.', 'How old are you?|Wie alt bist du?', "I'm nine years old.|Ich bin neun Jahre alt.", 'Thank you!|Danke!', 'Please.|Bitte.', "I'm sorry.|Es tut mir leid.", 'Happy birthday!|Alles Gute zum Geburtstag!', 'Merry Christmas!|Frohe Weihnachten!', 'I like pizza.|Ich mag Pizza.', "I don't like fish.|Ich mag keinen Fisch.", 'Can I have an apple, please?|Kann ich bitte einen Apfel haben?', 'Where are you from?|Woher kommst du?', "I'm from Germany.|Ich komme aus Deutschland.", 'What time is it?|Wie spät ist es?', 'See you tomorrow!|Bis morgen!', 'Good night!|Gute Nacht!', "You're welcome.|Gern geschehen.", "What's the weather like?|Wie ist das Wetter?", 'Have you got a pet?|Hast du ein Haustier?', "I've got a dog.|Ich habe einen Hund.", "What's this?|Was ist das?", 'Here you are.|Bitte schön. (beim Geben)', "What's your favourite colour?|Was ist deine Lieblingsfarbe?", 'My favourite colour is blue.|Meine Lieblingsfarbe ist Blau.'], { phrase: true });
    vocab('e_class', 'Classroom Phrases', '🧑‍🏫', ['Sit down, please.|Setz dich bitte.', 'Stand up.|Steh auf.', 'Listen.|Hör zu.', 'Look.|Schau.', 'Open your book.|Öffne dein Buch.', 'Close the door, please.|Schließe bitte die Tür.', 'Be quiet, please.|Sei bitte leise.', 'Come here.|Komm her.', 'Put up your hand.|Melde dich.', 'Write.|Schreibe.', 'Read.|Lies.', 'Draw a picture.|Male ein Bild.', "Let's sing a song.|Lasst uns ein Lied singen.", 'Tidy up.|Räum auf.', 'Well done!|Gut gemacht!', 'Can you help me, please?|Kannst du mir bitte helfen?', "I don't understand.|Ich verstehe das nicht.", 'Can I go to the toilet, please?|Darf ich bitte auf die Toilette gehen?', 'Say it again, please.|Sag es bitte noch einmal.', "Let's play a game.|Lasst uns ein Spiel spielen."], { phrase: true });
  })();
