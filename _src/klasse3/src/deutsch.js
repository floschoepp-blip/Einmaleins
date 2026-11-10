  /* ================= DEUTSCH ================= */
  (function () {
    var NOMEN = 'der Hund Hunde|die Katze Katzen|das Haus Häuser|der Baum Bäume|die Blume Blumen|das Kind Kinder|der Apfel Äpfel|die Maus Mäuse|das Buch Bücher|der Vogel Vögel|die Hand Hände|das Auto Autos|der Stuhl Stühle|die Tür Türen|das Bild Bilder|der Ball Bälle|die Schule Schulen|das Fenster Fenster|der Tisch Tische|die Lampe Lampen|das Pferd Pferde|der Zahn Zähne|die Nacht Nächte|das Ei Eier|der Wald Wälder|die Stadt Städte|das Tier Tiere|der Fuß Füße|die Wolke Wolken|das Glas Gläser|der Garten Gärten|die Tasche Taschen|das Heft Hefte|der Lehrer Lehrer|die Bank Bänke|das Blatt Blätter|der Stift Stifte|die Uhr Uhren|das Rad Räder|der Zug Züge|die Brücke Brücken|das Schiff Schiffe|der Freund Freunde|die Straße Straßen|das Dorf Dörfer|der Berg Berge|die Kuh Kühe|das Kleid Kleider|der Brief Briefe|die Gabel Gabeln|das Messer Messer|der Löffel Löffel|die Burg Burgen|das Zimmer Zimmer|der Fluss Flüsse|die Wiese Wiesen|das Spiel Spiele|der Koffer Koffer|die Oma Omas|das Lied Lieder'.split('|').map(function (x) { x = x.split(' '); return { a: x[0], s: x[1], p: x[2] }; });
    var VERBEN = 'gehen geht ging ist_gegangen|laufen läuft lief ist_gelaufen|essen isst aß hat_gegessen|trinken trinkt trank hat_getrunken|schreiben schreibt schrieb hat_geschrieben|lesen liest las hat_gelesen|spielen spielt spielte hat_gespielt|lachen lacht lachte hat_gelacht|singen singt sang hat_gesungen|schlafen schläft schlief hat_geschlafen|fahren fährt fuhr ist_gefahren|sehen sieht sah hat_gesehen|kommen kommt kam ist_gekommen|finden findet fand hat_gefunden|geben gibt gab hat_gegeben|nehmen nimmt nahm hat_genommen|malen malt malte hat_gemalt|lernen lernt lernte hat_gelernt|rufen ruft rief hat_gerufen|springen springt sprang ist_gesprungen|schwimmen schwimmt schwamm ist_geschwommen|helfen hilft half hat_geholfen|kaufen kauft kaufte hat_gekauft|fragen fragt fragte hat_gefragt|sagen sagt sagte hat_gesagt|fliegen fliegt flog ist_geflogen|fallen fällt fiel ist_gefallen|bringen bringt brachte hat_gebracht|denken denkt dachte hat_gedacht|tragen trägt trug hat_getragen|werfen wirft warf hat_geworfen|bleiben bleibt blieb ist_geblieben|ziehen zieht zog hat_gezogen|hören hört hörte hat_gehört|kochen kocht kochte hat_gekocht|tanzen tanzt tanzte hat_getanzt'.split('|').map(function (x) { x = x.split(' '); return { i: x[0], pr: x[1], pt: x[2], pf: x[3].replace('_', ' '), fu: 'wird ' + x[0] }; });
    var ADJ = 'groß größer am_größten klein|klein kleiner am_kleinsten groß|schnell schneller am_schnellsten langsam|alt älter am_ältesten jung|jung jünger am_jüngsten alt|warm wärmer am_wärmsten kalt|kalt kälter am_kältesten warm|lang länger am_längsten kurz|kurz kürzer am_kürzesten lang|hoch höher am_höchsten niedrig|gut besser am_besten schlecht|viel mehr am_meisten wenig|stark stärker am_stärksten schwach|hell heller am_hellsten dunkel|dunkel dunkler am_dunkelsten hell|laut lauter am_lautesten leise|schwer schwerer am_schwersten leicht|schön schöner am_schönsten hässlich|nah näher am_nächsten weit|teuer teurer am_teuersten billig|hart härter am_härtesten weich|dick dicker am_dicksten dünn|klug klüger am_klügsten dumm|reich reicher am_reichsten arm|nass nasser am_nassesten trocken|früh früher am_frühesten spät|sauber sauberer am_saubersten schmutzig|gern lieber am_liebsten -'.split('|').map(function (x) { x = x.split(' '); return { p: x[0], k: x[1], s: x[2].replace('_', ' '), g: x[3] }; });
    var WA = { N: 'Nomen', V: 'Verb', J: 'Adjektiv', A: 'Artikel', P: 'Pronomen' };
    var WA_TIP = { N: 'Nomen (Namenwörter) schreibt man groß. Man kann der, die oder das davorsetzen.', V: 'Verben (Tunwörter) sagen, was jemand tut.', J: 'Adjektive (Wiewörter) sagen, wie etwas ist.', A: 'Artikel (Begleiter) stehen vor dem Nomen: der, die, das, ein, eine.', P: 'Pronomen (Fürwörter) stehen für ein Nomen: ich, du, er, sie, es, wir, ihr, sie.' };
    var SAETZE = ['Der/A kleine/J Hund/N bellt/V im Garten/N .', 'Meine Oma/N backt/V einen/A leckeren/J Kuchen/N .', 'Wir/P spielen/V auf der/A grünen/J Wiese/N .', 'Die/A Katze/N schläft/V auf dem weichen/J Sofa/N .', 'Er/P liest/V ein/A spannendes/J Buch/N .', 'Das/A Mädchen/N malt/V ein buntes/J Bild/N .', 'Im Winter/N fällt/V kalter/J Schnee/N .', 'Sie/P fährt/V mit dem neuen/J Fahrrad/N zur Schule/N .', 'Der/A alte/J Baum/N verliert/V seine Blätter/N .', 'Ich/P esse/V einen/A roten/J Apfel/N .', 'Die/A Kinder/N lachen/V über den lustigen/J Clown/N .', 'Du/P schreibst/V einen/A langen/J Brief/N .', 'Ein/A schneller/J Hase/N hoppelt/V über das Feld/N .', 'Ihr/P singt/V ein/A schönes/J Lied/N .', 'Der/A Lehrer/N erklärt/V die schwere/J Aufgabe/N .', 'Es/P regnet/V auf die nasse/J Straße/N .'];

    topic('de', 'd_wortart', 'Wortarten', '🏷️', function (L) {
      if (L === 1 && Math.random() < 0.6) {
        var t = pick(['N', 'V', 'J']), w = t === 'N' ? pick(NOMEN).s : t === 'V' ? pick(VERBEN).i : pick(ADJ).p;
        return MC('Welche Wortart ist das?', WA[t], [], { fixed: ['Nomen', 'Verb', 'Adjektiv'], big: w, explain: WA_TIP[t] });
      }
      var toks = pick(SAETZE).split(' ').map(function (x) { var p = x.split('/'); return { w: p[0], t: p[1] }; });
      var cand = toks.filter(function (x) { return x.t && (L > 1 || 'NVJ'.indexOf(x.t) >= 0); }), tg = pick(cand);
      var html = toks.map(function (x) { return x === tg ? '<mark>' + esc(x.w) + '</mark>' : esc(x.w); }).join(' ').replace(' .', '.');
      return MC('Welche Wortart ist das markierte Wort?', WA[tg.t], [], { fixed: L === 1 ? ['Nomen', 'Verb', 'Adjektiv'] : ['Nomen', 'Verb', 'Adjektiv', 'Artikel', 'Pronomen'], html: html, explain: '„' + tg.w + '“ ist ein ' + WA[tg.t] + '. ' + WA_TIP[tg.t] });
    });
    bank('de', 'd_artikel', 'Der, die oder das?', '🎩', NOMEN.map(function (n) {
      return { id: 'art:' + n.s, make: function () { return MC('Welcher Artikel passt?', n.a, [], { fixed: ['der', 'die', 'das'], big: '▢ ' + n.s, explain: n.a + ' ' + n.s }); } };
    }));
    function uml(w) { var m = w.match(/^(.*)(au|a|o|u)([^aou]*)$/); if (!m) return w; return m[1] + { au: 'äu', a: 'ä', o: 'ö', u: 'ü' }[m[2]] + m[3]; }
    bank('de', 'd_mehrzahl', 'Einzahl & Mehrzahl', '👥', NOMEN.map(function (n) {
      return { id: 'mz:' + n.s, make: function () {
        var s = n.s, c = [s + 'e', s + 'en', s + 'er', s + 's', s + 'n', uml(s) + 'e', uml(s) + 'er', uml(s), s].filter(function (x) { return x !== n.p && !/ee|een$|eer$/.test(x.slice(-3)) || x === s; });
        return MC('Wie heißt die Mehrzahl?', 'die ' + n.p, c.filter(function (x) { return x !== n.p; }).map(function (x) { return 'die ' + x; }), { big: n.a + ' ' + n.s, explain: n.a + ' ' + n.s + ' – die ' + n.p });
      } };
    }));
    var ZF = { pr: 'Gegenwart (Präsens)', pt: '1. Vergangenheit (Präteritum)', pf: '2. Vergangenheit (Perfekt)', fu: 'Zukunft (Futur)' };
    topic('de', 'd_zeit', 'Zeitformen', '⏳', function (L) {
      var v = pick(VERBEN), sub = pick(['er', 'sie', 'es']), keys = L === 1 ? ['pr', 'pt', 'pf'] : ['pr', 'pt', 'pf', 'fu'], k = pick(keys);
      if (Math.random() < 0.5) return MC('In welcher Zeitform steht das Verb?', ZF[k], [], { fixed: keys.map(function (x) { return ZF[x]; }), big: sub + ' ' + v[k], explain: '„' + sub + ' ' + v[k] + '“ ist ' + ZF[k] + '. Grundform: ' + v.i });
      var reg = v.i.replace(/e?n$/, '') + 'te', wr = [v.pr, v.pt, v.pf, v.fu];
      if (reg !== v.pt) wr.push(reg);
      if (k === 'pr') k = 'pt';
      return MC('Setze in die ' + ZF[k] + '.', sub + ' ' + v[k], wr.map(function (x) { return sub + ' ' + x; }), { big: sub + ' ' + v.pr, explain: v.i + ': ' + sub + ' ' + v.pr + ' – ' + sub + ' ' + v.pt + ' – ' + sub + ' ' + v.pf });
    });
    topic('de', 'd_grundform', 'Grundform des Verbs', '🌱', function (L) {
      var v = pick(VERBEN), f = pick(L === 1 ? ['pr'] : L === 2 ? ['pr', 'pt'] : ['pt', 'pf']);
      return MC('Wie heißt die Grundform?', v.i, shuf(VERBEN).slice(0, 5).map(function (x) { return x.i; }), { big: 'er ' + v[f], explain: 'er ' + v[f] + ' → Grundform: ' + v.i });
    });
    var SA = { A: 'Aussagesatz ( . )', F: 'Fragesatz ( ? )', R: 'Ausrufe- oder Aufforderungssatz ( ! )' };
    var SATZ = ['A:Morgen fahren wir in den Zoo', 'A:Der Hund schläft im Körbchen', 'A:Ich mag Erdbeereis', 'A:Die Sonne scheint heute', 'A:Mein Bruder ist acht Jahre alt', 'A:Im Herbst fallen die Blätter', 'A:Wir haben heute Sport', 'A:Die Katze trinkt Milch', 'F:Wann kommst du nach Hause', 'F:Wie heißt dein Hund', 'F:Hast du die Hausaufgaben gemacht', 'F:Wo wohnt deine Oma', 'F:Kommst du mit ins Schwimmbad', 'F:Warum weinst du', 'F:Wer hat das Fenster geöffnet', 'F:Darf ich mitspielen', 'R:Komm sofort her', 'R:Pass auf', 'R:Räum bitte dein Zimmer auf', 'R:Hör mir zu', 'R:Hurra, wir haben gewonnen', 'R:Gib mir bitte den Stift', 'R:Sei leise', 'R:Mach die Tür zu'];
    bank('de', 'd_satzart', 'Satzarten & Satzzeichen', '❓', SATZ.map(function (x) {
      var t = x.charAt(0), s = x.slice(2);
      return { id: 'sa:' + s, make: function () {
        if (Math.random() < 0.5) return MC('Welches Satzzeichen fehlt am Ende?', { A: '.', F: '?', R: '!' }[t], [], { fixed: ['.', '?', '!'], html: esc(s) + ' <mark>▢</mark>', explain: 'Das ist ein ' + SA[t].replace(/ \(.*/, '') + '.' });
        return MC('Welche Satzart ist das?', SA[t], [], { fixed: [SA.A, SA.F, SA.R], html: esc(s) + ' <mark>▢</mark>', explain: 'Das ist ein ' + SA[t] });
      } };
    }));
    var SG = ['Am Morgen|Z füttert|P Oma|S die Katze|X', 'Der Hund|S bellt|P im Garten|O', 'Heute|Z spielen|P die Kinder|S auf dem Pausenhof|O', 'Mein Bruder|S liest|P am Abend|Z ein Buch|X', 'Im Wald|O sammelt|P Lena|S Pilze|X', 'Die Lehrerin|S schreibt|P an die Tafel|X', 'Nach der Schule|Z isst|P Tim|S einen Apfel|X', 'Der Vogel|S baut|P im Frühling|Z ein Nest|X', 'Im Schwimmbad|O schwimmt|P Paul|S jeden Samstag|Z', 'Meine Freundin|S malt|P ein Bild|X', 'Am Sonntag|Z backt|P Papa|S einen Kuchen|X', 'Die Katze|S schläft|P auf dem Sofa|O', 'In der Küche|O kocht|P Opa|S eine Suppe|X', 'Gestern|Z besuchte|P Mia|S ihre Tante|X'];
    var SGQ = { S: ['Finde das Subjekt. Frage: Wer oder was?', 'Subjekt (Satzgegenstand): Wer oder was tut etwas?'], P: ['Finde das Prädikat. Frage: Was tut jemand?', 'Prädikat (Satzaussage): Was tut jemand? Es ist immer ein Verb.'], Z: ['Finde die Zeitangabe. Frage: Wann?', 'Zeitangabe: Wann geschieht es?'], O: ['Finde die Ortsangabe. Frage: Wo?', 'Ortsangabe: Wo geschieht es?'] };
    topic('de', 'd_satzglied', 'Satzglieder', '🧱', function (L) {
      var raw = pick(SG).split(/\|([SPZOX]) ?/), parts = [], ri; for (ri = 0; ri + 1 < raw.length; ri += 2) parts.push({ w: raw[ri], t: raw[ri + 1] });
      var types = uniq(parts.map(function (p) { return p.t; })).filter(function (t) { return t !== 'X' && (L > 1 || t === 'S' || t === 'P'); }), t = pick(types);
      var right = parts.filter(function (p) { return p.t === t; })[0].w;
      return MC(SGQ[t][0], right, parts.map(function (p) { return p.w; }), { html: esc(parts.map(function (p) { return p.w; }).join(' ') + '.'), explain: '„' + right + '“ – ' + SGQ[t][1] });
    });
    var GK = [['Ich habe großen ___.', 'Hunger', 'hunger'], ['Der Hund kann schnell ___.', 'laufen', 'Laufen'], ['Meine Oma ist sehr ___.', 'nett', 'Nett'], ['Wir gehen in den ___.', 'Wald', 'wald'], ['Das ___ ist spannend.', 'Buch', 'buch'], ['Die Blume ist ___.', 'schön', 'Schön'], ['Am ___ gehe ich ins Bett.', 'Abend', 'abend'], ['Ich ___ gern Nudeln.', 'esse', 'Esse'], ['Mir tut der ___ weh.', 'Kopf', 'kopf'], ['Heute ist das ___ schön.', 'Wetter', 'wetter'], ['Tim hat große ___ vor Spinnen.', 'Angst', 'angst'], ['Das Eis schmeckt ___.', 'lecker', 'Lecker'], ['Wir haben viel ___ gehabt.', 'Glück', 'glück'], ['Lena kann gut ___.', 'schwimmen', 'Schwimmen'], ['Ich wünsche dir viel ___.', 'Freude', 'freude'], ['Der ___ Hase hoppelt weg.', 'kleine', 'Kleine'], ['Opa erzählt eine ___.', 'Geschichte', 'geschichte'], ['Das Auto fährt ___.', 'langsam', 'Langsam']];
    bank('de', 'd_gross', 'Groß oder klein?', '🔠', GK.map(function (g) {
      return { id: 'gk:' + g[1], make: function () { var up = g[1].charAt(0) === g[1].charAt(0).toUpperCase(); return MC('Wie schreibt man das Wort richtig?', g[1], [g[2]], { html: esc(g[0]).replace('___', '<mark>▢</mark>'), explain: '„' + g[1] + '“: ' + (up ? 'Nomen schreibt man groß.' : 'Verben und Adjektive schreibt man klein.') }); } };
    }));
    gaps('de', 'd_doppel', 'Doppelte Mitlaute, ck, tz', '✌️', [['Ba_', 'll', 'l', 'Ball'], ['Mu_er', 'tt', 't', 'Mutter'], ['So_e', 'nn', 'n', 'Sonne'], ['Ka_e', 'tz', 'z', 'Katze'], ['Ja_e', 'ck', 'k', 'Jacke'], ['Ko_er', 'ff', 'f', 'Koffer'], ['Hi_el', 'mm', 'm', 'Himmel'], ['Pu_e', 'pp', 'p', 'Puppe'], ['Be_', 'tt', 't', 'Bett'], ['schne_', 'll', 'l', 'schnell'], ['Bri_e', 'll', 'l', 'Brille'], ['Zu_er', 'ck', 'k', 'Zucker'], ['Bli_', 'tz', 'z', 'Blitz'], ['Bro_', 't', 'tt', 'Brot'], ['Tü_e', 't', 'tt', 'Tüte'], ['Scha_', 'f', 'ff', 'Schaf'], ['Glo_e', 'ck', 'k', 'Glocke'], ['Pla_', 'tz', 'z', 'Platz'], ['Ha_en', 'k', 'ck', 'Haken'], ['kle_ern', 'tt', 't', 'klettern'], ['Lö_el', 'ff', 'f', 'Löffel'], ['Te_er', 'll', 'l', 'Teller'], ['Ra_e', 'b', 'bb', 'Rabe'], ['Schi_', 'ff', 'f', 'Schiff'], ['De_e', 'ck', 'k', 'Decke'], ['Ne_', 'tz', 'z', 'Netz'], ['Na_e', 'm', 'mm', 'Name'], ['ko_en', 'mm', 'm', 'kommen'], ['re_en', 'nn', 'n', 'rennen'], ['Ho_e', 's', 'ss', 'Hose']], 'Nach einem kurzen Selbstlaut folgt ein doppelter Mitlaut (oder ck, tz). Nach einem langen Selbstlaut nur ein Mitlaut.');
    gaps('de', 'd_ie', 'i oder ie?', '🐝', [['B_ne', 'ie', 'i', 'Biene'], ['T_ger', 'i', 'ie', 'Tiger'], ['L_be', 'ie', 'i', 'Liebe'], ['W_se', 'ie', 'i', 'Wiese'], ['K_no', 'i', 'ie', 'Kino'], ['Sp_l', 'ie', 'i', 'Spiel'], ['Br_f', 'ie', 'i', 'Brief'], ['Z_ge', 'ie', 'i', 'Ziege'], ['M_nute', 'i', 'ie', 'Minute'], ['T_r', 'ie', 'i', 'Tier'], ['v_r', 'ie', 'i', 'vier'], ['l_la', 'i', 'ie', 'lila'], ['Fl_ge', 'ie', 'i', 'Fliege'], ['Masch_ne', 'i', 'ie', 'Maschine'], ['s_ben', 'ie', 'i', 'sieben'], ['Kr_mi', 'i', 'ie', 'Krimi'], ['D_nstag', 'ie', 'i', 'Dienstag'], ['F_sch', 'i', 'ie', 'Fisch'], ['W_nd', 'i', 'ie', 'Wind'], ['R_se', 'ie', 'i', 'Riese'], ['Kl_ma', 'i', 'ie', 'Klima'], ['Pap_r', 'ie', 'i', 'Papier'], ['Krokod_l', 'i', 'ie', 'Krokodil'], ['Apfels_ne', 'i', 'ie', 'Apfelsine'], ['sp_len', 'ie', 'i', 'spielen'], ['K_nd', 'i', 'ie', 'Kind']], 'Das lange i schreibt man meistens ie. Das kurze i schreibt man i. Merkwörter mit langem i: Tiger, Kino, Maschine.');
    gaps('de', 'd_s', 's, ss oder ß?', '🐍', [['Fu_', 'ß', 0, 'Fuß'], ['Wa_er', 'ss', 0, 'Wasser'], ['Ha_e', 's', 0, 'Hase'], ['Stra_e', 'ß', 0, 'Straße'], ['Flu_', 'ss', 0, 'Fluss'], ['wei_', 'ß', 0, 'weiß'], ['Ta_e', 'ss', 0, 'Tasse'], ['Ro_e', 's', 0, 'Rose'], ['Schlo_', 'ss', 0, 'Schloss'], ['gro_', 'ß', 0, 'groß'], ['hei_', 'ß', 0, 'heiß'], ['Nu_', 'ss', 0, 'Nuss'], ['Ku_', 'ss', 0, 'Kuss'], ['Grü_e', 'ß', 0, 'Grüße'], ['Me_er', 'ss', 0, 'Messer'], ['Spa_', 'ß', 0, 'Spaß'], ['Gla_', 's', 0, 'Glas'], ['Gra_', 's', 0, 'Gras'], ['sü_', 'ß', 0, 'süß'], ['Schlü_el', 'ss', 0, 'Schlüssel'], ['e_en', 'ss', 0, 'essen'], ['Na_e', 's', 0, 'Nase'], ['Hau_', 's', 0, 'Haus'], ['flei_ig', 'ß', 0, 'fleißig'], ['Ka_e', 'ss', 0, 'Kasse'], ['drau_en', 'ß', 0, 'draußen']].map(function (g) { g[2] = ['s', 'ss', 'ß']; return g; }), 'Nach kurzem Selbstlaut: ss. Nach langem Selbstlaut oder ei, au, eu: ß (scharf) oder s (weich).', ['s', 'ss', 'ß']);
    gaps('de', 'd_auslaut', 'd/t, g/k, b/p am Ende', '🔚', [['Hun_', 'd', 't', 'Hund', 'Hunde'], ['Wal_', 'd', 't', 'Wald', 'Wälder'], ['Gel_', 'd', 't', 'Geld', 'Gelder'], ['Kin_', 'd', 't', 'Kind', 'Kinder'], ['Pfer_', 'd', 't', 'Pferd', 'Pferde'], ['Bro_', 't', 'd', 'Brot', 'Brote'], ['Hef_', 't', 'd', 'Heft', 'Hefte'], ['Wel_', 't', 'd', 'Welt', 'Welten'], ['Zel_', 't', 'd', 'Zelt', 'Zelte'], ['Mon_', 'd', 't', 'Mond', 'Monde'], ['Wan_', 'd', 't', 'Wand', 'Wände'], ['Han_', 'd', 't', 'Hand', 'Hände'], ['Hu_', 't', 'd', 'Hut', 'Hüte'], ['Bil_', 'd', 't', 'Bild', 'Bilder'], ['Ber_', 'g', 'k', 'Berg', 'Berge'], ['Zwer_', 'g', 'k', 'Zwerg', 'Zwerge'], ['Ta_', 'g', 'k', 'Tag', 'Tage'], ['Zu_', 'g', 'k', 'Zug', 'Züge'], ['Ban_', 'k', 'g', 'Bank', 'Bänke'], ['Wer_', 'k', 'g', 'Werk', 'Werke'], ['Kru_', 'g', 'k', 'Krug', 'Krüge'], ['Geschen_', 'k', 'g', 'Geschenk', 'Geschenke'], ['Kor_', 'b', 'p', 'Korb', 'Körbe'], ['lie_', 'b', 'p', 'lieb', 'lieber'], ['Die_', 'b', 'p', 'Dieb', 'Diebe'], ['Sta_', 'b', 'p', 'Stab', 'Stäbe'], ['Kal_', 'b', 'p', 'Kalb', 'Kälber'], ['gel_', 'b', 'p', 'gelb', 'gelbe'], ['Lau_', 'b', 'p', 'Laub', 'Laubes']], 'Verlängere das Wort, dann hörst du den Buchstaben.');
    gaps('de', 'd_umlaut', 'ä/e und äu/eu', '🅰️', [['B_me', 'äu', 'eu', 'Bäume', 'von Baum'], ['H_ser', 'äu', 'eu', 'Häuser', 'von Haus'], ['L_te', 'eu', 'äu', 'Leute'], ['Fr_nd', 'eu', 'äu', 'Freund'], ['M_se', 'äu', 'eu', 'Mäuse', 'von Maus'], ['F_er', 'eu', 'äu', 'Feuer'], ['n_', 'eu', 'äu', 'neu'], ['Tr_me', 'äu', 'eu', 'Träume', 'von Traum'], ['h_te', 'eu', 'äu', 'heute'], ['Z_ne', 'äu', 'eu', 'Zäune', 'von Zaun'], ['K_lte', 'ä', 'e', 'Kälte', 'von kalt'], ['F_ld', 'e', 'ä', 'Feld'], ['H_nde', 'ä', 'e', 'Hände', 'von Hand'], ['W_lder', 'ä', 'e', 'Wälder', 'von Wald'], ['Z_lt', 'e', 'ä', 'Zelt'], ['N_chte', 'ä', 'e', 'Nächte', 'von Nacht'], ['G_ld', 'e', 'ä', 'Geld'], ['B_lle', 'ä', 'e', 'Bälle', 'von Ball'], ['St_rn', 'e', 'ä', 'Stern'], ['M_nsch', 'e', 'ä', 'Mensch'], ['G_ste', 'ä', 'e', 'Gäste', 'von Gast'], ['B_tt', 'e', 'ä', 'Bett'], ['Bl_tter', 'ä', 'e', 'Blätter', 'von Blatt'], ['H_ft', 'e', 'ä', 'Heft'], ['l_ft', 'äu', 'eu', 'läuft', 'von laufen'], ['Z_hne', 'ä', 'e', 'Zähne', 'von Zahn']], 'Gibt es ein verwandtes Wort mit a oder au? Dann schreibe ä oder äu.');
    gaps('de', 'd_dehnung', 'Dehnungs-h', '🧘', [['Z_n', 'ah', 'a', 'Zahn'], ['Sch_l', 'a', 'ah', 'Schal'], ['St_l', 'uh', 'u', 'Stuhl'], ['Bl_me', 'u', 'uh', 'Blume'], ['F_rrad', 'ah', 'a', 'Fahrrad'], ['S_n', 'oh', 'o', 'Sohn'], ['M_nd', 'o', 'oh', 'Mond'], ['L_rer', 'eh', 'e', 'Lehrer'], ['k_l', 'üh', 'ü', 'kühl'], ['T_r', 'ü', 'üh', 'Tür'], ['N_me', 'a', 'ah', 'Name'], ['f_ren', 'ah', 'a', 'fahren'], ['H_n', 'uh', 'u', 'Huhn'], ['T_l', 'a', 'ah', 'Tal'], ['J_r', 'ah', 'a', 'Jahr'], ['B_ne', 'oh', 'o', 'Bohne'], ['Sch_le', 'u', 'uh', 'Schule'], ['z_n', 'eh', 'e', 'zehn'], ['R_gen', 'e', 'eh', 'Regen'], ['_ne', 'oh', 'o', 'ohne'], ['S_ne', 'ah', 'a', 'Sahne'], ['W_gen', 'a', 'ah', 'Wagen'], ['fr_', 'üh', 'ü', 'früh'], ['gr_n', 'ü', 'üh', 'grün'], ['w_nen', 'oh', 'o', 'wohnen'], ['_r', 'Uh', 'U', 'Uhr']], 'Das Dehnungs-h steht oft vor l, m, n, r. Man hört es nicht, es macht den Selbstlaut lang. Das sind Merkwörter.');
    gaps('de', 'd_vf', 'V oder F?', '🦊', [['_ogel', 'V', 'F', 'Vogel'], ['_ater', 'V', 'F', 'Vater'], ['_isch', 'F', 'V', 'Fisch'], ['_ier', 'v', 'f', 'vier'], ['_ertig', 'f', 'v', 'fertig'], ['_or', 'v', 'f', 'vor'], ['_ür', 'f', 'v', 'für'], ['_enster', 'F', 'V', 'Fenster'], ['_oll', 'v', 'f', 'voll'], ['_erkehr', 'V', 'F', 'Verkehr'], ['_erien', 'F', 'V', 'Ferien'], ['_amilie', 'F', 'V', 'Familie'], ['_ergessen', 'v', 'f', 'vergessen'], ['_erkäufer', 'V', 'F', 'Verkäufer'], ['_reund', 'F', 'V', 'Freund'], ['_orsicht', 'V', 'F', 'Vorsicht'], ['_euer', 'F', 'V', 'Feuer'], ['_olk', 'V', 'F', 'Volk'], ['_om', 'v', 'f', 'vom'], ['_liegen', 'f', 'v', 'fliegen'], ['_erlieren', 'v', 'f', 'verlieren'], ['_orlesen', 'v', 'f', 'vorlesen']], 'Wörter mit V sind Merkwörter. Die Vorsilben ver- und vor- schreibt man immer mit v.');
    var FAM = { fahren: ['Fahrer', 'Fahrrad', 'Abfahrt', 'Fahrt'], spielen: ['Spielzeug', 'Spieler', 'verspielt', 'Spielplatz'], lesen: ['Leser', 'Lesebuch', 'vorlesen', 'lesbar'], backen: ['Bäcker', 'Gebäck', 'Backofen', 'Bäckerei'], laufen: ['Läufer', 'Wettlauf', 'verlaufen', 'Laufschuh'], schreiben: ['Schrift', 'Schreibtisch', 'abschreiben', 'Beschreibung'], wohnen: ['Wohnung', 'Bewohner', 'Wohnzimmer', 'wohnlich'], freuen: ['Freude', 'erfreut', 'Vorfreude', 'freudig'], malen: ['Maler', 'Malkasten', 'Gemälde', 'anmalen'], kaufen: ['Käufer', 'Einkauf', 'Verkäufer', 'Kaufhaus'] };
    var FK = Object.keys(FAM);
    topic('de', 'd_wortfamilie', 'Wortfamilien', '👨‍👩‍👧', function (L) {
      var f = pick(FK), other = shuf(FK.filter(function (x) { return x !== f; }));
      if (Math.random() < 0.5) return MC('Welches Wort gehört zur Wortfamilie „' + f + '“?', pick(FAM[f]), other.slice(0, 3).map(function (o) { return pick(FAM[o]); }), { explain: 'Zur Wortfamilie „' + f + '“ gehören: ' + FAM[f].join(', ') + '. Sie haben den gleichen Wortstamm.' });
      var odd = pick(FAM[other[0]]);
      return MC('Welches Wort gehört NICHT zur Wortfamilie „' + f + '“?', odd, shuf(FAM[f]).slice(0, 3), { explain: '„' + odd + '“ gehört zur Wortfamilie „' + other[0] + '“.' });
    });
    var ZN = [['das Haus', 'die Tür', 'Haustür'], ['der Regen', 'der Schirm', 'Regenschirm'], ['der Apfel', 'der Baum', 'Apfelbaum'], ['der Fuß', 'der Ball', 'Fußball'], ['die Schule', 'die Tasche', 'Schultasche'], ['der Hund', 'die Hütte', 'Hundehütte'], ['die Sonne', 'die Brille', 'Sonnenbrille'], ['der Schnee', 'der Mann', 'Schneemann'], ['das Bett', 'die Decke', 'Bettdecke'], ['der Tisch', 'das Tuch', 'Tischtuch'], ['die Hand', 'der Schuh', 'Handschuh'], ['das Kind', 'der Garten', 'Kindergarten'], ['der Zahn', 'die Bürste', 'Zahnbürste'], ['die Blume', 'der Topf', 'Blumentopf'], ['das Spiel', 'der Platz', 'Spielplatz'], ['der Vogel', 'das Nest', 'Vogelnest'], ['die Nacht', 'das Hemd', 'Nachthemd'], ['das Haus', 'das Tier', 'Haustier'], ['der Garten', 'die Bank', 'Gartenbank'], ['das Buch', 'der Laden', 'Buchladen']];
    bank('de', 'd_zusammen', 'Zusammengesetzte Nomen', '🧲', ZN.map(function (z) {
      var art = z[1].split(' ')[0], a = z[0].split(' ')[1], b = z[1].split(' ')[1];
      return { id: 'zn:' + z[2], make: function () {
        if (Math.random() < 0.6) return MC('Welcher Artikel passt zum neuen Wort?', art, [], { fixed: ['der', 'die', 'das'], big: '▢ ' + z[2], html: esc(z[0] + ' + ' + z[1]), explain: 'Das letzte Wort bestimmt den Artikel: ' + z[1] + ' → ' + art + ' ' + z[2] });
        return MC('Wie heißt das zusammengesetzte Nomen?', z[2], [b + a.toLowerCase(), a + 'e' + b.toLowerCase(), a + 's' + b.toLowerCase(), a + ' ' + b], { html: esc(z[0] + ' + ' + z[1]), explain: z[0] + ' + ' + z[1] + ' = ' + art + ' ' + z[2] });
      } };
    }));
    topic('de', 'd_steigern', 'Adjektive: Steigern & Gegenteil', '📈', function (L) {
      var a = pick(ADJ), t = R(0, 2);
      if (t === 0 && a.g !== '-') return MC('Was ist das Gegenteil?', a.g, shuf(ADJ).slice(0, 6).map(function (x) { return x.p; }).filter(function (x) { return x !== a.p; }), { big: a.p, explain: a.p + ' ↔ ' + a.g });
      if (t === 1) return MC('Welches Wort fehlt?', a.k, [a.p + 'er', 'mehr ' + a.p, a.s.replace('am ', ''), a.p + 'ter'], { big: a.p + ' – ▢ – ' + a.s, explain: a.p + ' – ' + a.k + ' – ' + a.s });
      return MC('Welches Wort fehlt?', a.s, ['am ' + a.p + 'sten', 'am ' + a.k + 'sten', 'am meisten ' + a.p, 'am ' + a.p + 'esten'], { big: a.p + ' – ' + a.k + ' – ▢', explain: a.p + ' – ' + a.k + ' – ' + a.s });
    });
    var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    topic('de', 'd_abc', 'ABC & Wörterbuch', '🔤', function (L) {
      if (Math.random() < 0.3) { var i = R(1, 24), nach = Math.random() < 0.5; return MC('Welcher Buchstabe kommt im ABC ' + (nach ? 'nach' : 'vor') + ' ' + ABC[i] + '?', ABC[nach ? i + 1 : i - 1], [ABC[nach ? i - 1 : i + 1], ABC[(i + 2) % 26], ABC[(i + 24) % 26]], { explain: ABC.slice(Math.max(0, i - 2), i + 3).split('').join(' ') }); }
      var pool = shuf(NOMEN.map(function (n) { return n.s; })), ws = [], w, t = 0;
      if (L === 1) pool.forEach(function (x) { if (ws.length < 4 && !ws.some(function (y) { return y[0] === x[0]; })) ws.push(x); });
      else { while (ws.length < 3 && t++ < 60) { w = pool[t]; ws = pool.filter(function (x) { return x[0] === w[0]; }).slice(0, 4); } if (ws.length < 3) ws = pool.slice(0, 4); }
      var sorted = ws.slice().sort(function (a, b) { return a.localeCompare(b, 'de'); });
      return MC('Welches Wort steht im Wörterbuch zuerst?', sorted[0], ws, { explain: 'Nach dem ABC geordnet: ' + sorted.join(', ') + (L > 1 ? '. Ist der erste Buchstabe gleich, schaust du auf den zweiten.' : '') });
    });
    var SIL = ['Scho-ko-la-de', 'Ba-na-ne', 'Hund', 'Kat-ze', 'E-le-fant', 'Schmet-ter-ling', 'To-ma-te', 'Fens-ter', 'Baum', 'Re-gen-bo-gen', 'Kro-ko-dil', 'Blu-me', 'Te-le-fon', 'Ap-fel', 'Ma-ri-en-kä-fer', 'Schu-le', 'Fuß-ball', 'Ka-len-der', 'Maus', 'Was-ser-me-lo-ne', 'Li-mo-na-de', 'Pa-pa-gei', 'Son-ne', 'Brot', 'Ge-burts-tag', 'Fe-ri-en', 'Lö-we', 'Zi-tro-ne', 'Kin-der-gar-ten', 'But-ter'];
    bank('de', 'd_silben', 'Silben', '👏', SIL.map(function (sp) {
      var w = sp.replace(/-/g, ''), n = sp.split('-').length;
      return { id: 'sil:' + w, make: function (L) {
        if (n > 1 && L > 1 && Math.random() < 0.5) {
          var wr = [], i;
          for (i = 0; i < sp.length; i++) if (sp[i] === '-') { if (sp[i + 2] && sp[i + 2] !== '-') wr.push(sp.slice(0, i) + sp[i + 1] + '-' + sp.slice(i + 2)); if (i > 1 && sp[i - 2] !== '-') wr.push(sp.slice(0, i - 1) + '-' + sp[i - 1] + sp.slice(i + 1)); }
          return MC('Wie trennt man das Wort richtig?', sp, wr, { big: w, explain: 'Sprich das Wort langsam und klatsche: ' + sp });
        }
        return MC('Wie viele Silben hat das Wort?', n, [n + 1, n - 1 || n + 2, n + 2, n - 2 > 0 ? n - 2 : n + 3], { big: w, explain: sp + ' – ' + n + (n === 1 ? ' Silbe' : ' Silben') });
      } };
    }));
    topic('de', 'd_pronomen', 'Pronomen einsetzen', '🔁', function (L) {
      var n = pick(NOMEN), pl = L > 1 && Math.random() < 0.3 && n.p !== n.s, adj = pick(['neu', 'schön', 'alt', 'klein', 'groß', 'toll']);
      var pro = pl ? 'Sie sind' : { der: 'Er ist', die: 'Sie ist', das: 'Es ist' }[n.a];
      return MC('Ersetze das Nomen durch ein Pronomen.', pro + ' ' + adj + '.', [], { fixed: ['Er ist ' + adj + '.', 'Sie ist ' + adj + '.', 'Es ist ' + adj + '.', 'Sie sind ' + adj + '.'], html: esc(pl ? 'Die ' + n.p + ' sind ' + adj + '.' : n.a.charAt(0).toUpperCase() + n.a.slice(1) + ' ' + n.s + ' ist ' + adj + '.'), explain: (pl ? 'die ' + n.p + ' (Mehrzahl) → sie' : n.a + ' ' + n.s + ' → ' + { der: 'er', die: 'sie', das: 'es' }[n.a]) });
    });
    var WR = [['Mia sagt: „Ich habe Hunger.“', 'Mia sagt „Ich habe Hunger.“', 'Mia sagt: Ich habe Hunger.'], ['Papa ruft: „Das Essen ist fertig!“', 'Papa ruft: „das Essen ist fertig!“', 'Papa ruft „Das Essen ist fertig!“'], ['Tim fragt: „Kommst du mit?“', 'Tim fragt: „Kommst du mit“?', 'Tim fragt: Kommst du mit?'], ['Oma flüstert: „Gute Nacht.“', 'Oma flüstert: Gute Nacht.“', 'Oma flüstert „Gute Nacht.“'], ['Die Lehrerin sagt: „Holt bitte eure Hefte heraus.“', 'Die Lehrerin sagt: „holt bitte eure Hefte heraus.“', 'Die Lehrerin sagt „Holt bitte eure Hefte heraus“.'], ['Lena jubelt: „Wir haben gewonnen!“', 'Lena jubelt „Wir haben gewonnen!“', 'Lena jubelt: Wir haben gewonnen!'], ['Opa fragt: „Wer möchte ein Eis?“', 'Opa fragt: „wer möchte ein Eis?“', 'Opa fragt: „Wer möchte ein Eis“?']];
    var items = WR.map(function (w, i) { return { id: 'wr:' + i, make: function () { return MC('Welcher Satz ist richtig geschrieben?', w[0], [w[1], w[2]], { explain: 'Nach dem Begleitsatz steht ein Doppelpunkt. Die wörtliche Rede steht in Anführungszeichen („unten“ und “oben”) und beginnt groß.' }); } }; });
    [['Wie heißt der Teil „Mia sagt:“ vor der wörtlichen Rede?', 'Begleitsatz', 'Fragesatz', 'Hauptwort', 'Nebensatz'], ['Welches Zeichen steht nach dem Begleitsatz, wenn er vorne steht?', 'Doppelpunkt', 'Komma', 'Fragezeichen', 'Punkt'], ['Wo stehen die Anführungszeichen am Anfang der wörtlichen Rede?', 'unten', 'oben', 'in der Mitte', 'gar nicht'], ['Was zeigt die wörtliche Rede?', 'Was jemand genau sagt', 'Was jemand denkt', 'Wo jemand ist', 'Wie jemand aussieht']].forEach(function (f, i) { items.push({ id: 'wrf:' + i, make: function () { return MC(f[0], f[1], f.slice(2), { explain: f[1] + '.' }); } }); });
    bank('de', 'd_rede', 'Wörtliche Rede', '💬', items);
    var VS = [['Lisa hat sich im Wald ___laufen.', 'ver', ['vor', 'ab', 'an']], ['Wir müssen jetzt ___steigen, der Bus hält.', 'aus', ['ver', 'zer', 'be']], ['Das Glas ist ___brochen.', 'zer', ['ver', 'be', 'an']], ['Ich habe meine Jacke ___gessen.', 'ver', ['zer', 'ab', 'be']], ['Kannst du mir das ___klären?', 'er', ['zer', 'ab', 'aus']], ['Mama hat mir ein Buch ___gelesen.', 'vor', ['zer', 'ent', 'be']], ['Wir wollen Oma ___suchen.', 'be', ['zer', 'ab', 'vor']], ['Der Hund ist ___gelaufen.', 'weg', ['zer', 'be', 'er']], ['Ich muss mein Zimmer ___räumen.', 'auf', ['zer', 'be', 'er']], ['Opa hat eine Geschichte ___zählt.', 'er', ['zer', 'ab', 'auf']], ['Ich habe den Text von der Tafel ___geschrieben.', 'ab', ['zer', 'be', 'er']], ['Der Dieb ist ___kommen.', 'ent', ['zer', 'be', 'auf']]];
    bank('de', 'd_vorsilbe', 'Vorsilben', '🧩', VS.map(function (v) { return { id: 'vs:' + v[0], make: function () { return MC('Welche Vorsilbe passt?', v[1], v[2], { html: esc(v[0]).replace('___', '<mark>▢</mark>'), explain: v[0].replace('___', v[1]) }); } }; }));

    /* --- Schreiben, Sortieren, Zuordnen --- */
    enrich('d_mehrzahl', function (L, it) {
      var s = it.id.slice(3), n = NOMEN.filter(function (x) { return x.s === s; })[0];
      return WRITE('Schreibe die Mehrzahl.', n.p, { big: n.a + ' ' + n.s + ' → die …', explain: n.a + ' ' + n.s + ' – die ' + n.p + '. Nomen schreibt man groß.' });
    }, 0.35);
    enrich('d_zeit', function (L) {
      var v = pick(VERBEN);
      return WRITE('Schreibe das Verb in der 1. Vergangenheit.', v.pt, { ci: true, big: 'er ' + v.pr + ' → er …', explain: v.i + ': er ' + v.pr + ' – er ' + v.pt + ' – er ' + v.pf });
    }, 0.3);
    enrich('d_grundform', function () {
      var vs = shuf(VERBEN).slice(0, 4);
      return MATCH('Was gehört zusammen? Grundform und 1. Vergangenheit.', vs.map(function (v) { return [v.i, 'er ' + v.pt]; }));
    }, 0.35);
    enrich('d_steigern', function () {
      var as = [], used = {};
      shuf(ADJ).forEach(function (a) { if (as.length < 4 && a.g !== '-' && !used[a.p] && !used[a.g]) { used[a.p] = used[a.g] = 1; as.push([a.p, a.g]); } });
      return MATCH('Finde die Gegenteile.', as);
    }, 0.3);
    enrich('d_abc', function (L) {
      var ws = [];
      shuf(NOMEN).forEach(function (n) { if (ws.length < 4 && !ws.some(function (y) { return y[0] === n.s[0]; })) ws.push(n.s); });
      ws.sort(function (a, b) { return a.localeCompare(b, 'de'); });
      return ORDER('Ordne die Wörter nach dem ABC.', ws, { sep: ', ', explain: 'Nach dem ABC: ' + ws.join(', ') });
    }, 0.45);
    enrich('d_artikel', function () {
      var ns = shuf(NOMEN).slice(0, 12), ps = [], seen = {};
      ns.forEach(function (n) { if (ps.length < 3 && !seen[n.a]) { seen[n.a] = 1; ps.push([n.s, n.a]); } });
      return ps.length === 3 ? MATCH('Welcher Artikel gehört zu welchem Nomen?', ps) : null;
    }, 0.2);
    enrich('d_silben', function (L, it) {
      var sp = SIL.filter(function (x) { return 'sil:' + x.replace(/-/g, '') === it.id; })[0];
      if (!sp || sp.split('-').length < 3) return null;
      return ORDER('Setze die Silben zum Wort zusammen.', sp.split('-'), { sep: '', explain: sp + ' → ' + sp.replace(/-/g, '') });
    }, 0.35);
    topic('de', 'd_satzbau', 'Sätze bauen', '🧩', function (L) {
      var ws = pick(SAETZE).replace(' .', '').split(' ').map(function (x) { return x.split('/')[0]; });
      return ORDER('Baue aus den Wörtern einen Satz. Das großgeschriebene Wort am Satzanfang hilft dir.', ws, { explain: ws.join(' ') + '. Am Satzanfang schreibt man groß, am Ende steht ein Punkt.', short: ws.join(' ') + '.' });
    });
    var LERN = ['Ball', 'Mutter', 'Sonne', 'Katze', 'Jacke', 'Himmel', 'Wasser', 'Bett', 'Brille', 'Zucker', 'Blitz', 'Brot', 'Schaf', 'Glocke', 'Platz', 'Löffel', 'Teller', 'Schiff', 'Biene', 'Tiger', 'Wiese', 'Spiel', 'Brief', 'Ziege', 'Tier', 'Fliege', 'Fisch', 'Wind', 'Papier', 'Fuß', 'Straße', 'Fluss', 'Tasse', 'Rose', 'Schloss', 'Nuss', 'Messer', 'Spaß', 'Glas', 'Schlüssel', 'Hund', 'Wald', 'Geld', 'Kind', 'Pferd', 'Heft', 'Zelt', 'Mond', 'Hand', 'Berg', 'Zwerg', 'Tag', 'Zug', 'Bank', 'Korb', 'Bäume', 'Häuser', 'Leute', 'Freund', 'Mäuse', 'Feuer', 'Hände', 'Wälder', 'Stern', 'Mensch', 'Zahn', 'Stuhl', 'Blume', 'Fahrrad', 'Sohn', 'Lehrer', 'Tür', 'Name', 'Huhn', 'Jahr', 'Bohne', 'Schule', 'Uhr', 'Vogel', 'Vater', 'Fenster', 'Ferien', 'Familie', 'Garten', 'Apfel', 'Wolke', 'Lampe', 'Tasche', 'Brücke', 'Kuchen'];
    bank('de', 'd_schreiben', 'Lernwörter schreiben', '✍️', LERN.map(function (w) {
      return { id: 'lw:' + w, make: function (L, rich) {
        var canHear = rich && deVoiceOK();
        if (canHear && Math.random() < 0.6) return WRITE('Hör gut zu und schreibe das Wort.', w, { sayDe: w, listen: true, auto: true, explain: 'Richtig geschrieben: ' + w, short: 'Lernwort: ' + w });
        var ls = w.split('');
        if (ls.length > 7 || !rich) { var wr = []; var i = R(1, w.length - 2); wr.push(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)); wr.push(w.slice(0, i) + w.slice(i + 1)); wr.push(w.slice(0, i) + w[i] + w[i] + w.slice(i + 1)); wr.push(w.charAt(0).toLowerCase() + w.slice(1)); return MC('Welches Wort ist richtig geschrieben?', w, wr.filter(function (x) { return x.indexOf('undefined') < 0; }), { explain: 'Richtig geschrieben: ' + w, short: 'Lernwort: ' + w }); }
        return ORDER('Buchstabensalat! Tippe die Buchstaben in der richtigen Reihenfolge an.', ls, { sep: '', tiny: true, explain: 'Das Wort heißt: ' + w, short: 'Lernwort: ' + w });
      } };
    }));
  })();
