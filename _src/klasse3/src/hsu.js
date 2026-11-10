  /* ================= HSU ================= */
  (function () {
    bank('hsu', 'h_wald', 'Wald & Bäume', '🌳', BAUM.map(function (b) { return { id: 'baum:' + b.id, make: b.make }; }));

    facts('hsu', 'h_waldtiere', 'Tiere im Wald', '🦊', [
      ['Welches Tier baut einen Kobel hoch oben im Baum?', 'Eichhörnchen', 'Fuchs', 'Dachs', 'Reh', 'Das Nest des Eichhörnchens heißt Kobel.'],
      ['Wie heißt die Wohnung des Fuchses?', 'Bau', 'Kobel', 'Horst', 'Nest', 'Der Fuchs lebt in einem Bau unter der Erde.'],
      ['Welcher Vogel klopft mit dem Schnabel Löcher in Baumstämme?', 'Specht', 'Amsel', 'Eule', 'Kuckuck', 'Der Specht sucht so Insekten und baut seine Bruthöhle.'],
      ['Wie nennt man das Kind von Reh und Rehbock?', 'Kitz', 'Frischling', 'Welpe', 'Küken', 'Das Rehkitz hat weiße Punkte im Fell.'],
      ['Wie heißen die Jungen vom Wildschwein?', 'Frischlinge', 'Kitze', 'Welpen', 'Fohlen', 'Frischlinge haben ein gestreiftes Fell.'],
      ['Was macht der Igel im Winter?', 'Winterschlaf', 'Er fliegt in den Süden', 'Er sammelt Nüsse', 'Er wechselt die Farbe', 'Der Igel schläft den ganzen Winter und zehrt von seinem Fettpolster.'],
      ['Was macht das Eichhörnchen im Winter?', 'Winterruhe: Es schläft viel und frisst zwischendurch von seinen Vorräten', 'Winterschlaf ohne Aufwachen', 'Es zieht in den Süden', 'Es erstarrt', 'Winterruhe heißt: viel schlafen, aber immer wieder aufwachen und fressen.'],
      ['Welche Tiere fallen im Winter in Winterstarre?', 'Frösche und Eidechsen', 'Rehe und Hirsche', 'Füchse', 'Spechte', 'Wechselwarme Tiere wie Frösche werden bei Kälte ganz starr.'],
      ['Welches Tier ist nachts unterwegs und kann den Kopf sehr weit drehen?', 'Eule', 'Specht', 'Reh', 'Eichhörnchen', 'Eulen jagen nachts und fliegen fast lautlos.'],
      ['Was frisst das Reh?', 'Blätter, Knospen und Gräser', 'Mäuse', 'Würmer und Käfer', 'Eicheln und Vögel', 'Das Reh ist ein Pflanzenfresser.'],
      ['Eichenblatt → Raupe → Meise → Sperber. Wie nennt man das?', 'Nahrungskette', 'Stockwerke', 'Jahresringe', 'Kreislauf des Wassers', 'In einer Nahrungskette frisst ein Lebewesen das andere.'],
      ['Womit beginnt jede Nahrungskette?', 'Mit einer Pflanze', 'Mit einem Raubtier', 'Mit einem Vogel', 'Mit einem Pilz', 'Am Anfang steht immer eine Pflanze.'],
      ['Wer kümmert sich beruflich um den Wald?', 'Förster', 'Bäcker', 'Gärtner', 'Landwirt', 'Der Förster pflegt den Wald und schützt Tiere und Pflanzen.'],
      ['Welches Tier lebt in der Wurzelschicht?', 'Regenwurm', 'Specht', 'Reh', 'Eichhörnchen', 'Im Boden leben Regenwürmer, Käferlarven und Maulwürfe.'],
      ['In welchem Stockwerk des Waldes lebt das Eichhörnchen meistens?', 'Baumschicht', 'Moosschicht', 'Wurzelschicht', 'Krautschicht', 'Eichhörnchen klettern und leben in den Baumkronen.'],
      ['Warum ist der Wald wichtig für uns Menschen?', 'Er macht frische Luft und speichert Wasser', 'Er macht den Boden trocken', 'Er macht Lärm', 'Er hält den Regen ab', 'Bäume geben Sauerstoff ab, filtern Staub und speichern Wasser.'],
      ['Wie verhältst du dich im Wald richtig?', 'Leise sein, auf den Wegen bleiben, keinen Müll liegen lassen', 'Äste abbrechen', 'Tiere füttern und streicheln', 'Laut rufen', 'So störst du die Tiere nicht und schützt die Pflanzen.'],
      ['Welcher Vogel legt seine Eier in fremde Nester?', 'Kuckuck', 'Specht', 'Meise', 'Eule', 'Der Kuckuck lässt seine Jungen von anderen Vögeln aufziehen.']
    ]);

    facts('hsu', 'h_feuer', 'Feuer', '🔥', [
      ['Welche drei Dinge braucht ein Feuer zum Brennen?', 'Brennstoff, Sauerstoff und Hitze', 'Wasser, Luft und Erde', 'Holz, Wasser und Wind', 'Rauch, Asche und Glut', 'Das nennt man das Verbrennungsdreieck. Fehlt eines davon, geht das Feuer aus.'],
      ['Welche Nummer wählst du, wenn es brennt?', '112', '110', '911', '115', 'Die Feuerwehr und der Rettungsdienst haben die Nummer 112.'],
      ['Was passiert mit einer Kerze, wenn du ein Glas darüberstülpst?', 'Sie geht aus, weil der Sauerstoff fehlt', 'Sie brennt heller', 'Sie brennt ewig weiter', 'Das Glas schmilzt', 'Ohne Sauerstoff aus der Luft kann nichts brennen.'],
      ['Warum löscht Wasser ein Holzfeuer?', 'Es kühlt ab und nimmt die Hitze weg', 'Es gibt dem Feuer Luft', 'Es ist ein Brennstoff', 'Es macht Rauch', 'Wasser kühlt den Brennstoff unter die Zündtemperatur.'],
      ['Was darf man NIE mit Wasser löschen?', 'Brennendes Fett oder Öl in der Pfanne', 'Ein Lagerfeuer', 'Brennendes Papier', 'Eine Kerze', 'Bei Fettbrand gibt es mit Wasser eine gefährliche Stichflamme. Deckel drauf!'],
      ['Es brennt und das Zimmer ist voller Rauch. Wie bewegst du dich?', 'Gebückt oder kriechend am Boden', 'Aufrecht und langsam', 'Auf einem Stuhl', 'Gar nicht', 'Rauch steigt nach oben. Am Boden ist die Luft besser.'],
      ['Was ist bei einem Brand am gefährlichsten?', 'Der giftige Rauch', 'Das Licht', 'Das Knistern', 'Die Asche', 'Die meisten Menschen werden durch Rauch verletzt, nicht durch Flammen.'],
      ['Welche Frage gehört NICHT zu den W-Fragen beim Notruf?', 'Wie ist das Wetter?', 'Wo ist es passiert?', 'Was ist passiert?', 'Wie viele Verletzte gibt es?', 'Wichtig sind: Wo? Was? Wie viele Verletzte? Wer ruft an? Warten auf Rückfragen!'],
      ['Was machst du am Ende eines Notrufs?', 'Warten, ob noch Fragen kommen', 'Sofort auflegen', 'Laut schreien', 'Nochmal anrufen', 'Die Leitstelle beendet das Gespräch, nicht du.'],
      ['Welcher Stoff brennt NICHT?', 'Stein', 'Papier', 'Holz', 'Stroh', 'Stein, Sand, Glas und Metall sind nicht brennbar.'],
      ['Wie erstickt man ein kleines Feuer?', 'Mit einer Decke oder Sand abdecken', 'Hineinpusten', 'Papier drauflegen', 'Fenster aufmachen', 'Abdecken nimmt dem Feuer den Sauerstoff.'],
      ['Was gehört zu einem sicheren Lagerfeuer?', 'Ein Eimer Wasser steht bereit und ein Erwachsener ist dabei', 'Viel trockenes Laub rundherum', 'Starker Wind', 'Benzin zum Anzünden', 'Feuer nur mit Erwachsenen, mit Abstand und Löschwasser.'],
      ['Wie hat Feuer den Menschen früher geholfen?', 'Es gab Wärme, Licht und man konnte Essen kochen', 'Es machte Regen', 'Es ließ Pflanzen wachsen', 'Es kühlte die Höhle', 'Feuer war für die Menschen schon in der Steinzeit sehr wichtig.'],
      ['Was warnt dich nachts in der Wohnung vor Rauch?', 'Rauchmelder', 'Thermometer', 'Wecker', 'Lichtschalter', 'Rauchmelder an der Decke piepen laut, wenn Rauch aufsteigt.'],
      ['Es brennt im Schulhaus. Was tust du?', 'Ruhig bleiben und mit der Klasse zum Sammelplatz gehen', 'Die Schultasche packen', 'Dich verstecken', 'Mit dem Aufzug fahren', 'Alles liegen lassen, zusammenbleiben und den Fluchtweg benutzen.']
    ]);

    facts('hsu', 'h_wasser', 'Wasser & Wetter', '💧', [
      ['Wie heißen die drei Zustände von Wasser?', 'fest, flüssig, gasförmig', 'kalt, warm, heiß', 'nass, feucht, trocken', 'klar, trüb, schmutzig', 'Eis ist fest, Wasser flüssig, Wasserdampf gasförmig.'],
      ['Bei welcher Temperatur gefriert Wasser zu Eis?', '0 Grad Celsius', '10 Grad Celsius', '100 Grad Celsius', '37 Grad Celsius', 'Bei 0 °C wird Wasser fest.'],
      ['Bei welcher Temperatur kocht (siedet) Wasser?', '100 Grad Celsius', '0 Grad Celsius', '50 Grad Celsius', '1000 Grad Celsius', 'Bei 100 °C wird Wasser zu Wasserdampf.'],
      ['Wie nennt man es, wenn Wasser zu unsichtbarem Wasserdampf wird?', 'Verdunsten', 'Gefrieren', 'Schmelzen', 'Kondensieren', 'Die Sonne erwärmt das Wasser, es verdunstet und steigt auf.'],
      ['Wie nennt man es, wenn Wasserdampf wieder zu Tröpfchen wird?', 'Kondensieren', 'Verdunsten', 'Schmelzen', 'Gefrieren', 'Oben kühlt der Wasserdampf ab und kondensiert zu Wolken.'],
      ['Woraus bestehen Wolken?', 'Aus winzigen Wassertröpfchen', 'Aus Rauch', 'Aus Watte', 'Aus Staub', 'Wolken sind viele kleine Wassertröpfchen oder Eiskristalle.'],
      ['Was gehört NICHT zum Niederschlag?', 'Wind', 'Regen', 'Schnee', 'Hagel', 'Niederschlag ist Wasser, das aus Wolken fällt: Regen, Schnee, Hagel, Graupel.'],
      ['Die richtige Reihenfolge im Wasserkreislauf ist:', 'Verdunsten – Wolken – Regen – Flüsse – Meer', 'Regen – Meer – Schnee – Wolken', 'Wolken – Meer – Verdunsten – Eis', 'Flüsse – Wolken – Meer – Regen', 'Das Wasser wandert immer im Kreis. Es geht nichts verloren.'],
      ['Womit misst man die Temperatur?', 'Thermometer', 'Lineal', 'Waage', 'Kompass', 'Das Thermometer zeigt die Temperatur in Grad Celsius (°C).'],
      ['Wie nennt man es, wenn Eis zu Wasser wird?', 'Schmelzen', 'Verdunsten', 'Gefrieren', 'Kondensieren', 'Wird es wärmer als 0 °C, schmilzt Eis.'],
      ['Woher kommt unser Trinkwasser meistens?', 'Aus dem Grundwasser und aus Quellen', 'Aus dem Meer', 'Direkt aus dem Regen', 'Aus der Kläranlage', 'Im Wasserwerk wird Grundwasser gereinigt und in die Häuser gepumpt.'],
      ['Wo wird schmutziges Abwasser gereinigt?', 'In der Kläranlage', 'Im Wasserwerk', 'Im Schwimmbad', 'Im Brunnen', 'In der Kläranlage wird Abwasser in mehreren Stufen sauber gemacht.'],
      ['Wie kannst du Wasser sparen?', 'Duschen statt baden und den Wasserhahn zudrehen', 'Lange baden', 'Den Hahn laufen lassen', 'Jeden Tag das Auto waschen', 'Sauberes Trinkwasser ist kostbar.'],
      ['Womit wird die Windrichtung angezeigt?', 'Windfahne oder Windsack', 'Thermometer', 'Regenmesser', 'Barometer', 'Die Windfahne zeigt, woher der Wind kommt.'],
      ['Womit misst man, wie viel es geregnet hat?', 'Regenmesser', 'Thermometer', 'Windsack', 'Kompass', 'Im Regenmesser sammelt sich das Regenwasser.'],
      ['Welcher Stoff schwimmt auf Wasser?', 'Holz', 'Stein', 'Eisennagel', 'Münze', 'Holz und Kork sind leichter als Wasser und schwimmen.'],
      ['Wie viel der Erdoberfläche ist mit Wasser bedeckt?', 'Mehr als die Hälfte', 'Fast nichts', 'Genau ein Viertel', 'Weniger als die Hälfte', 'Etwa zwei Drittel der Erde sind von Wasser bedeckt. Deshalb heißt sie der blaue Planet.'],
      ['Was passiert mit Wasser, wenn es gefriert?', 'Es dehnt sich aus und braucht mehr Platz', 'Es wird kleiner', 'Es verschwindet', 'Es wird schwerer', 'Deshalb kann eine volle Glasflasche im Gefrierfach platzen.']
    ]);

    facts('hsu', 'h_koerper', 'Körper & Gesundheit', '🫀', [
      ['Wie viele Zähne hat ein vollständiges Milchgebiss?', '20', '10', '28', '32', 'Das Milchgebiss hat 20 Zähne. Das bleibende Gebiss hat bis zu 32.'],
      ['Wie viele Zähne hat das bleibende Gebiss eines Erwachsenen (mit Weisheitszähnen)?', '32', '20', '24', '40', 'Erwachsene haben bis zu 32 Zähne.'],
      ['Welche Zähne zermahlen die Nahrung?', 'Backenzähne', 'Schneidezähne', 'Eckzähne', 'Milchzähne', 'Schneidezähne beißen ab, Eckzähne reißen, Backenzähne zermahlen.'],
      ['Wie heißt die Zahnkrankheit, bei der Löcher entstehen?', 'Karies', 'Grippe', 'Masern', 'Schnupfen', 'Bakterien machen aus Zucker Säure. Die greift den Zahn an.'],
      ['Wie oft am Tag solltest du mindestens die Zähne putzen?', 'Zweimal', 'Einmal in der Woche', 'Nur abends jeden zweiten Tag', 'Nie', 'Morgens und abends, jeweils etwa 2 bis 3 Minuten.'],
      ['Was solltest du am meisten trinken?', 'Wasser', 'Limonade', 'Kakao', 'Cola', 'Wasser und ungesüßter Tee sind die besten Durstlöscher.'],
      ['Wovon solltest du nur wenig essen?', 'Süßigkeiten und Fettes', 'Gemüse', 'Obst', 'Vollkornbrot', 'In der Ernährungspyramide stehen Süßes und Fettes ganz oben an der kleinen Spitze.'],
      ['Wovon solltest du reichlich essen?', 'Gemüse und Obst', 'Schokolade', 'Chips', 'Wurst', 'Am besten 5 Portionen Obst und Gemüse am Tag.'],
      ['Wie heißt der schwarze Kreis in der Mitte des Auges?', 'Pupille', 'Iris', 'Linse', 'Wimper', 'Durch die Pupille fällt das Licht ins Auge.'],
      ['Wie heißt der farbige Teil des Auges?', 'Iris (Regenbogenhaut)', 'Pupille', 'Netzhaut', 'Augenlid', 'Die Iris kann blau, grün oder braun sein.'],
      ['Was passiert mit der Pupille bei hellem Licht?', 'Sie wird kleiner', 'Sie wird größer', 'Sie wird blau', 'Sie verschwindet', 'So kommt weniger Licht ins Auge und es wird geschützt.'],
      ['Was schützt das Auge vor Staub und Schweiß?', 'Lid, Wimpern und Augenbrauen', 'Pupille', 'Linse', 'Sehnerv', 'Das Lid wischt wie ein Scheibenwischer über das Auge.'],
      ['Welches Häutchen im Ohr schwingt, wenn Schall ankommt?', 'Trommelfell', 'Ohrmuschel', 'Ohrläppchen', 'Pupille', 'Die Ohrmuschel fängt den Schall auf, das Trommelfell schwingt.'],
      ['Was schadet dem Gehör?', 'Sehr laute Musik und Lärm', 'Leises Flüstern', 'Vogelgezwitscher', 'Lesen', 'Zu viel Lärm kann das Gehör dauerhaft schädigen.'],
      ['Wie viele Knochen hat ein erwachsener Mensch ungefähr?', 'Über 200', 'Etwa 20', 'Etwa 50', 'Über 1000', 'Das Skelett stützt den Körper und schützt die Organe.'],
      ['Was verbindet zwei Knochen beweglich miteinander?', 'Gelenk', 'Muskel', 'Haut', 'Zahn', 'Zum Beispiel Knie, Ellbogen und Schulter sind Gelenke.'],
      ['Was bewegt unsere Knochen?', 'Muskeln', 'Haare', 'Nägel', 'Zähne', 'Muskeln ziehen sich zusammen und bewegen so die Knochen.'],
      ['Welches Organ pumpt das Blut durch den Körper?', 'Herz', 'Lunge', 'Magen', 'Gehirn', 'Das Herz schlägt etwa 70- bis 100-mal in der Minute.'],
      ['Womit atmen wir?', 'Lunge', 'Herz', 'Magen', 'Leber', 'Die Lunge nimmt Sauerstoff aus der Luft auf.'],
      ['Was tut deinem Körper gut?', 'Bewegung, genug Schlaf und gesundes Essen', 'Den ganzen Tag sitzen', 'Wenig schlafen', 'Nur Süßes essen', 'Kinder sollten sich jeden Tag mindestens eine Stunde bewegen.'],
      ['Welche fünf Sinne hat der Mensch?', 'Sehen, Hören, Riechen, Schmecken, Tasten', 'Sehen, Laufen, Essen, Denken, Schlafen', 'Hören, Sprechen, Lachen, Gehen, Fühlen', 'Riechen, Atmen, Trinken, Tasten, Lesen', 'Mit Augen, Ohren, Nase, Zunge und Haut nehmen wir die Welt wahr.']
    ]);

    function kompass(q) {
      var s = '<circle cx="50" cy="50" r="44" fill="#fff" stroke="#241B6B" stroke-width="3"/><path d="M50 14 L57 50 L43 50 Z" fill="#FF4FA3"/><path d="M50 86 L57 50 L43 50 Z" fill="#B8A6FF"/><path d="M14 50 L50 44 L50 56 Z" fill="#D9CFFF"/><path d="M86 50 L50 44 L50 56 Z" fill="#D9CFFF"/><circle cx="50" cy="50" r="4" fill="#241B6B"/>';
      [['N', 50, 11], ['O', 92, 54], ['S', 50, 97], ['W', 8, 54]].forEach(function (d) { s += '<text x="' + d[1] + '" y="' + d[2] + '" font-size="12" font-weight="800" text-anchor="middle" fill="' + (d[0] === q ? '#FF9F1C' : '#241B6B') + '" font-family="sans-serif">' + (d[0] === q ? '?' : d[0]) + '</text>'; });
      return svg(s, '-4 -4 108 108');
    }
    var DIR = { N: 'Norden', O: 'Osten', S: 'Süden', W: 'Westen' };
    var orient = Object.keys(DIR).map(function (d) { return { id: 'h_orient:k' + d, make: function () { return MC('Welche Himmelsrichtung fehlt auf der Windrose?', DIR[d], ['Norden', 'Osten', 'Süden', 'Westen'], { img: kompass(d), explain: 'Im Uhrzeigersinn: Norden, Osten, Süden, Westen. Merksatz: Nie Ohne Seife Waschen.' }); } }; });
    [
      ['Wo geht die Sonne auf?', 'Im Osten', 'Im Westen', 'Im Norden', 'Im Süden', 'Im Osten geht die Sonne auf, im Süden nimmt sie ihren Lauf, im Westen will sie untergehn, im Norden ist sie nie zu sehn.'],
      ['Wo geht die Sonne unter?', 'Im Westen', 'Im Osten', 'Im Norden', 'Im Süden', 'Die Sonne geht im Westen unter.'],
      ['Wo steht die Sonne am Mittag?', 'Im Süden', 'Im Norden', 'Im Osten', 'Im Westen', 'Mittags steht die Sonne im Süden am höchsten.'],
      ['Wohin zeigt die Kompassnadel?', 'Nach Norden', 'Nach Süden', 'Zur Sonne', 'Nach unten', 'Die magnetische Nadel zeigt immer nach Norden.'],
      ['Welche Himmelsrichtung ist auf den meisten Karten oben?', 'Norden', 'Süden', 'Osten', 'Westen', 'Karten sind genordet: Norden ist oben.'],
      ['Was erklärt die Zeichen und Farben auf einer Karte?', 'Legende', 'Maßstab', 'Kompass', 'Register', 'In der Legende (Zeichenerklärung) steht, was die Zeichen bedeuten.'],
      ['Welche Farbe haben Flüsse und Seen auf der Landkarte?', 'Blau', 'Grün', 'Braun', 'Rot', 'Gewässer sind blau, Tiefland ist grün, Gebirge sind braun.'],
      ['Was zeigt die Farbe Braun auf einer Landkarte?', 'Gebirge', 'Wälder', 'Seen', 'Städte', 'Je dunkler das Braun, desto höher die Berge.'],
      ['Was sagt der Maßstab einer Karte?', 'Wie stark die Wirklichkeit verkleinert wurde', 'Wie alt die Karte ist', 'Wer die Karte gemalt hat', 'Wo Norden ist', 'Zum Beispiel: 1 cm auf der Karte ist 1 km in Wirklichkeit.'],
      ['Wie sieht man die Dinge auf einem Plan oder einer Karte?', 'Von oben (Vogelperspektive)', 'Von der Seite', 'Von unten', 'Von innen', 'Eine Karte zeigt die Welt verkleinert und von oben.'],
      ['Wie heißt die Hauptstadt von Bayern?', 'München', 'Nürnberg', 'Berlin', 'Augsburg', 'München ist die Landeshauptstadt von Bayern.'],
      ['Wie heißt die Hauptstadt von Deutschland?', 'Berlin', 'München', 'Hamburg', 'Bonn', 'Berlin ist die Bundeshauptstadt.'],
      ['Wie viele Bundesländer hat Deutschland?', '16', '7', '12', '20', 'Deutschland hat 16 Bundesländer. Bayern ist das größte.'],
      ['Wie viele Regierungsbezirke hat Bayern?', '7', '5', '16', '10', 'Oberbayern, Niederbayern, Oberpfalz, Oberfranken, Mittelfranken, Unterfranken und Schwaben.'],
      ['Welcher ist KEIN bayerischer Regierungsbezirk?', 'Sachsen', 'Niederbayern', 'Oberpfalz', 'Schwaben', 'Sachsen ist ein eigenes Bundesland.'],
      ['Wie heißt der höchste Berg Deutschlands? Er steht in Bayern.', 'Zugspitze', 'Watzmann', 'Großer Arber', 'Brocken', 'Die Zugspitze ist 2962 Meter hoch.'],
      ['Welcher große Fluss fließt durch Regensburg und Passau?', 'Donau', 'Rhein', 'Elbe', 'Main', 'Die Donau fließt von Westen nach Osten durch Bayern.'],
      ['Welches Land ist ein Nachbarland von Bayern?', 'Österreich', 'Italien', 'Frankreich', 'Polen', 'Bayern grenzt an Österreich und Tschechien.'],
      ['Auf welchem Kontinent liegt Deutschland?', 'Europa', 'Asien', 'Afrika', 'Amerika', 'Deutschland liegt mitten in Europa.'],
      ['Welche Farben hat die bayerische Flagge?', 'Weiß und Blau', 'Schwarz, Rot, Gold', 'Rot und Weiß', 'Grün und Weiß', 'Weiß und Blau sind die Landesfarben von Bayern.']
    ].forEach(function (f, i) { orient.push({ id: 'h_orient:' + i, make: function () { return MC(f[0], f[1], [f[2], f[3], f[4]], { explain: f[5] }); } }); });
    bank('hsu', 'h_orient', 'Orientierung & Bayern', '🧭', orient);

    facts('hsu', 'h_gemeinde', 'Gemeinde & Zusammenleben', '🏛️', [
      ['Wer leitet eine Gemeinde oder Stadt?', 'Bürgermeisterin oder Bürgermeister', 'Schulleiter', 'Polizist', 'Pfarrer', 'Der Bürgermeister leitet die Gemeinde und den Gemeinderat.'],
      ['Wo arbeitet der Bürgermeister?', 'Im Rathaus', 'Im Bahnhof', 'In der Schule', 'Im Krankenhaus', 'Im Rathaus ist die Verwaltung der Gemeinde.'],
      ['Wer entscheidet zusammen mit dem Bürgermeister über die Gemeinde?', 'Gemeinderat', 'Lehrerkonferenz', 'Elternbeirat', 'Feuerwehr', 'Der Gemeinderat (in Städten: Stadtrat) wird von den Bürgern gewählt.'],
      ['Wie werden Bürgermeister und Gemeinderat bestimmt?', 'Die Bürger wählen sie', 'Sie werden ausgelost', 'Der älteste Einwohner bestimmt sie', 'Sie bewerben sich bei der Schule', 'In Bayern wird alle 6 Jahre gewählt.'],
      ['Was ist eine Aufgabe der Gemeinde?', 'Müllabfuhr, Wasser, Straßen und Spielplätze', 'Hausaufgaben kontrollieren', 'Brot backen', 'Autos bauen', 'Die Gemeinde kümmert sich um vieles, was alle brauchen.'],
      ['Wie nennt man es, wenn die Mehrheit entscheidet?', 'Abstimmung', 'Streit', 'Befehl', 'Zufall', 'Bei einer Abstimmung gewinnt, wofür die meisten sind. Das ist demokratisch.'],
      ['Wer vertritt die Klasse und spricht für die Mitschüler?', 'Klassensprecherin oder Klassensprecher', 'Hausmeister', 'Bürgermeister', 'Schulbusfahrer', 'Die Klasse wählt ihre Klassensprecher.'],
      ['Wie löst man einen Streit am besten?', 'Miteinander reden und zuhören', 'Schlagen', 'Wegrennen und nie wieder reden', 'Laut schreien', 'Jeder sagt, was ihn stört, dann sucht man gemeinsam eine Lösung.'],
      ['Welches ist ein Kinderrecht?', 'Das Recht auf Bildung und Schutz', 'Das Recht auf ein Handy', 'Das Recht auf Süßigkeiten', 'Das Recht, nie aufzuräumen', 'Kinderrechte gelten für alle Kinder der Welt, zum Beispiel Bildung, Gesundheit, Spiel und Schutz vor Gewalt.'],
      ['Warum gibt es Regeln in der Klasse?', 'Damit alle gut zusammen lernen und sich wohlfühlen', 'Damit die Lehrer Spaß haben', 'Damit es langweilig ist', 'Damit niemand reden darf', 'Regeln helfen, dass es fair und sicher zugeht.'],
      ['Wohin gehört eine leere Glasflasche ohne Pfand?', 'In den Glascontainer', 'In die Papiertonne', 'In die Biotonne', 'In den Wald', 'Müll trennen hilft, Rohstoffe wiederzuverwerten (Recycling).'],
      ['Was gehört in die Biotonne?', 'Obst- und Gemüsereste', 'Plastiktüten', 'Glas', 'Batterien', 'Aus Biomüll wird Kompost oder Biogas.'],
      ['Was ist besser für die Umwelt?', 'Eine Brotdose statt Alufolie', 'Jeden Tag eine neue Plastiktüte', 'Das Licht brennen lassen', 'Kurze Strecken mit dem Auto fahren', 'Müll vermeiden ist noch besser als Müll trennen.'],
      ['Woher bekommt die Gemeinde das Geld für ihre Aufgaben?', 'Aus Steuern und Gebühren', 'Vom Spielplatz', 'Aus dem Sparschwein des Bürgermeisters', 'Von den Kindern', 'Alle Bürger und Firmen zahlen Steuern.']
    ]);

    var SIGN = {
      stop: '<path d="M33 8 h34 l25 25 v34 l-25 25 h-34 l-25 -25 v-34 z" fill="#E3262E" stroke="#fff" stroke-width="4"/><text x="50" y="59" font-size="24" font-weight="800" text-anchor="middle" fill="#fff" font-family="sans-serif">STOP</text>',
      gewaehren: '<path d="M8 14 h84 l-42 74 z" fill="#fff" stroke="#E3262E" stroke-width="9" stroke-linejoin="round"/>',
      vorfahrt: '<path d="M50 6 L94 50 L50 94 L6 50 Z" fill="#fff" stroke="#241B6B" stroke-width="2"/><path d="M50 22 L78 50 L50 78 L22 50 Z" fill="#FFC928"/>',
      einfahrt: '<circle cx="50" cy="50" r="44" fill="#E3262E"/><rect x="20" y="42" width="60" height="16" fill="#fff"/>',
      radweg: '<circle cx="50" cy="50" r="44" fill="#1E63D0"/><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="60" r="12"/><circle cx="68" cy="60" r="12"/><path d="M32 60 L44 40 L62 40 L68 60 M44 40 L52 60 L32 60 M40 34 h9 M62 40 l-3 -8 h7"/></g>',
      zebra: '<rect x="6" y="6" width="88" height="88" rx="8" fill="#1E63D0"/><path d="M50 16 L86 80 H14 Z" fill="#fff"/><g fill="#241B6B"><circle cx="50" cy="38" r="5"/><path d="M47 45 h7 l3 14 -4 1 -2 -8 -1 9 6 12 -4 2 -7 -12 -5 12 -4 -2 6 -15 z"/><rect x="26" y="74" width="6" height="4"/><rect x="38" y="74" width="6" height="4"/><rect x="56" y="74" width="6" height="4"/><rect x="68" y="74" width="6" height="4"/></g>'
    };
    var SN = { stop: 'Halt! Vorfahrt gewähren (Stoppschild)', gewaehren: 'Vorfahrt gewähren', vorfahrt: 'Vorfahrtstraße', einfahrt: 'Verbot der Einfahrt', radweg: 'Radweg', zebra: 'Fußgängerüberweg (Zebrastreifen)' };
    var ST = { stop: 'Hier musst du immer anhalten, auch wenn kein Auto kommt.', gewaehren: 'Die anderen dürfen zuerst fahren.', vorfahrt: 'Auf dieser Straße hast du Vorfahrt.', einfahrt: 'In diese Straße darfst du nicht hineinfahren.', radweg: 'Radfahrer müssen diesen Weg benutzen.', zebra: 'Hier haben Fußgänger Vorrang.' };
    var verkehr = Object.keys(SIGN).map(function (k) { return { id: 'h_verkehr:s' + k, make: function () { return MC('Was bedeutet dieses Verkehrszeichen?', SN[k], Object.keys(SN).map(function (x) { return SN[x]; }), { img: svg(SIGN[k]), explain: SN[k] + ': ' + ST[k] }); } }; });
    [
      ['Wie viele Bremsen braucht ein verkehrssicheres Fahrrad?', 'Zwei, die unabhängig voneinander funktionieren', 'Eine', 'Keine', 'Vier', 'Eine Bremse für vorne und eine für hinten.'],
      ['Welche Farbe hat das Licht vorne am Fahrrad?', 'Weiß', 'Rot', 'Gelb', 'Blau', 'Vorne weißer Scheinwerfer und weißer Reflektor.'],
      ['Welche Farbe hat das Rücklicht am Fahrrad?', 'Rot', 'Weiß', 'Gelb', 'Grün', 'Hinten rotes Rücklicht und roter Reflektor.'],
      ['Welche Farbe haben die Rückstrahler an den Pedalen?', 'Gelb', 'Rot', 'Weiß', 'Blau', 'Pedale und Speichen haben gelbe Rückstrahler.'],
      ['Was schützt deinen Kopf beim Radfahren?', 'Der Fahrradhelm', 'Eine Mütze', 'Eine Kapuze', 'Kopfhörer', 'Der Helm muss fest sitzen und geschlossen sein.'],
      ['Was gehört NICHT zum verkehrssicheren Fahrrad?', 'Fahrradkorb', 'Klingel', 'Zwei Bremsen', 'Rücklicht', 'Pflicht sind: Klingel, zwei Bremsen, Lichter und Rückstrahler.'],
      ['Wo müssen Kinder bis 8 Jahre mit dem Fahrrad fahren?', 'Auf dem Gehweg', 'Auf der Straße', 'Auf der Autobahn', 'Auf den Schienen', 'Bis 8 Jahre müssen Kinder den Gehweg benutzen, bis 10 Jahre dürfen sie es. Gibt es einen baulich getrennten Radweg, dürfen sie auch dort fahren.'],
      ['An einer Kreuzung ohne Schilder und Ampel gilt:', 'Rechts vor links', 'Links vor rechts', 'Der Schnellere zuerst', 'Der Größere zuerst', 'Wer von rechts kommt, hat Vorfahrt.'],
      ['Wie zeigst du mit dem Fahrrad an, dass du abbiegen willst?', 'Arm in die Richtung ausstrecken (Handzeichen)', 'Klingeln', 'Laut rufen', 'Schneller fahren', 'Vorher umschauen, dann deutlich Handzeichen geben.'],
      ['Was ist der „tote Winkel“?', 'Der Bereich, den ein Fahrer im Spiegel nicht sehen kann', 'Eine scharfe Kurve', 'Ein kaputtes Schild', 'Eine Sackgasse', 'Bleibe hinter Lastwagen und Bussen, nie direkt daneben.'],
      ['Wie überquerst du eine Straße ohne Ampel?', 'Stehen bleiben, nach links, rechts und wieder links schauen, zügig gehen', 'Schnell rennen', 'Zwischen parkenden Autos durchlaufen', 'Mit geschlossenen Augen', 'Am besten an einer übersichtlichen Stelle.'],
      ['Was hilft, damit Autofahrer dich im Dunkeln sehen?', 'Helle Kleidung und Reflektoren', 'Dunkle Kleidung', 'Leise sein', 'Schnell laufen', 'Mit Reflektoren sieht man dich viel früher.'],
      ['Die Ampel zeigt für Fußgänger Rot. Was tust du?', 'Stehen bleiben und warten', 'Schnell rüberlaufen', 'Langsam gehen', 'Auf die Straße stellen', 'Bei Rot bleibst du stehen, bei Grün darfst du gehen.']
    ].forEach(function (f, i) { verkehr.push({ id: 'h_verkehr:' + i, make: function () { return MC(f[0], f[1], [f[2], f[3], f[4]], { explain: f[5] }); } }); });
    bank('hsu', 'h_verkehr', 'Verkehr & Fahrrad', '🚲', verkehr);

    facts('hsu', 'h_getreide', 'Vom Korn zum Brot', '🌾', [
      ['Welches ist KEINE Getreideart?', 'Kartoffel', 'Weizen', 'Roggen', 'Hafer', 'Getreidearten sind Weizen, Roggen, Gerste, Hafer, Mais, Dinkel und Reis.'],
      ['Welches Getreide hat sehr lange Grannen (Haare an der Ähre)?', 'Gerste', 'Hafer', 'Mais', 'Weizen', 'Die Gerste erkennt man an den langen Grannen.'],
      ['Bei welchem Getreide hängen die Körner an einer Rispe statt an einer Ähre?', 'Hafer', 'Weizen', 'Roggen', 'Gerste', 'Beim Hafer hängen die Körner einzeln an feinen Stielen.'],
      ['Aus welchem Getreide wird das meiste helle Brot und die Semmeln gebacken?', 'Weizen', 'Hafer', 'Mais', 'Gerste', 'Weizenmehl ist das wichtigste Mehl für Brot und Gebäck.'],
      ['Woraus werden Haferflocken gemacht?', 'Hafer', 'Weizen', 'Roggen', 'Mais', 'Haferkörner werden gequetscht.'],
      ['Wie heißt der lange Stängel der Getreidepflanze?', 'Halm', 'Stamm', 'Ast', 'Zweig', 'Der Halm ist hohl und hat Knoten.'],
      ['Wo sitzen bei Weizen die Körner?', 'In der Ähre', 'An der Wurzel', 'Im Halm', 'Im Blatt', 'Oben am Halm sitzt die Ähre mit den Körnern.'],
      ['Welche Maschine erntet das Getreide?', 'Mähdrescher', 'Bagger', 'Kran', 'Rasenmäher', 'Der Mähdrescher mäht und trennt die Körner vom Stroh.'],
      ['Wie nennt man die trockenen Halme nach der Ernte?', 'Stroh', 'Heu', 'Laub', 'Mehl', 'Stroh sind die Getreidehalme. Heu ist getrocknetes Gras.'],
      ['Wo wird aus Körnern Mehl gemacht?', 'In der Mühle', 'In der Bäckerei', 'Auf dem Feld', 'Im Supermarkt', 'Der Müller mahlt die Körner zu Mehl.'],
      ['Die richtige Reihenfolge ist:', 'säen – wachsen – ernten – mahlen – backen', 'ernten – säen – backen – mahlen', 'mahlen – säen – ernten – backen', 'backen – mahlen – säen – ernten', 'Vom Korn zum Brot dauert es fast ein Jahr.'],
      ['Was ist das Besondere an Vollkornmehl?', 'Das ganze Korn mit Schale wird gemahlen', 'Es ist ganz weiß', 'Es ist aus Kartoffeln', 'Es enthält Zucker', 'In der Schale stecken viele Vitamine und Ballaststoffe.'],
      ['Was braucht man für einen einfachen Brotteig?', 'Mehl, Wasser, Salz und Hefe oder Sauerteig', 'Mehl, Zucker und Schokolade', 'Nur Mehl', 'Eier und Milch', 'Hefe oder Sauerteig lassen den Teig aufgehen.'],
      ['Wann wird Wintergetreide gesät?', 'Im Herbst', 'Im Sommer', 'Im Winter bei Schnee', 'Nie', 'Wintergetreide wird im Herbst gesät und im Sommer geerntet.']
    ]);

    facts('hsu', 'h_strom', 'Strom', '💡', [
      ['Was brauchst du für einen einfachen Stromkreis?', 'Batterie, Kabel und Glühlämpchen', 'Wasser, Kabel und Holz', 'Magnet und Schnur', 'Nur eine Batterie', 'Der Strom fließt von der Batterie durch das Kabel zum Lämpchen und zurück.'],
      ['Wann leuchtet das Lämpchen im Stromkreis?', 'Wenn der Stromkreis geschlossen ist', 'Wenn der Stromkreis offen ist', 'Wenn die Batterie leer ist', 'Immer', 'Strom fließt nur im geschlossenen Kreis.'],
      ['Was macht ein Schalter?', 'Er öffnet und schließt den Stromkreis', 'Er macht Strom', 'Er speichert Strom', 'Er misst die Temperatur', 'Schalter aus: Stromkreis offen, Lampe aus.'],
      ['Welcher Stoff leitet den Strom?', 'Metall, zum Beispiel Kupfer oder Eisen', 'Plastik', 'Holz', 'Glas', 'Alle Metalle sind Leiter.'],
      ['Welcher Stoff leitet den Strom NICHT?', 'Gummi', 'Eisen', 'Kupfer', 'Aluminium', 'Gummi, Plastik, Glas und trockenes Holz sind Nichtleiter (Isolatoren).'],
      ['Warum sind Kabel mit Plastik umhüllt?', 'Plastik leitet nicht und schützt uns vor dem Strom', 'Damit sie bunt aussehen', 'Damit der Strom schneller fließt', 'Damit sie schwerer sind', 'Die Hülle heißt Isolierung.'],
      ['Was darfst du NIE tun?', 'Etwas in die Steckdose stecken, das kein Stecker ist', 'Das Licht ausschalten', 'Eine Taschenlampe benutzen', 'Batterien einlegen', 'Strom aus der Steckdose ist lebensgefährlich.'],
      ['Warum sind Strom und Wasser zusammen gefährlich?', 'Wasser leitet den Strom', 'Wasser macht Strom kalt', 'Strom macht Wasser schmutzig', 'Gar nicht', 'Deshalb nie den Föhn in der Badewanne benutzen.'],
      ['Womit wird Strom umweltfreundlich erzeugt?', 'Mit Sonne, Wind und Wasser', 'Mit Kohle', 'Mit Erdöl', 'Mit Müll', 'Das nennt man erneuerbare Energien.'],
      ['Was macht eine Solaranlage auf dem Dach?', 'Sie macht aus Sonnenlicht Strom', 'Sie fängt Regen auf', 'Sie macht Wind', 'Sie kühlt das Haus', 'Solarzellen wandeln Licht in Strom um.'],
      ['Wie kannst du Strom sparen?', 'Licht ausmachen, wenn du aus dem Zimmer gehst', 'Den Fernseher immer laufen lassen', 'Den Kühlschrank offen lassen', 'Alle Lampen anschalten', 'Auch Geräte ganz ausschalten statt Stand-by spart Strom.'],
      ['Was speichert Strom für die Taschenlampe?', 'Batterie oder Akku', 'Glühbirne', 'Schalter', 'Kabel', 'Eine Batterie hat einen Pluspol und einen Minuspol.'],
      ['Wie heißen die zwei Pole einer Batterie?', 'Pluspol und Minuspol', 'Nordpol und Südpol', 'Oberpol und Unterpol', 'Links und Rechts', 'Auf der Batterie steht + und −.'],
      ['Wohin gehören leere Batterien?', 'In die Sammelbox im Geschäft oder zum Wertstoffhof', 'In den Hausmüll', 'In die Biotonne', 'In den Wald', 'Batterien enthalten giftige Stoffe und werden recycelt.']
    ]);

    facts('hsu', 'h_zeit', 'Zeit & Kalender', '📅', [
      ['Wie viele Monate hat ein Jahr?', '12', '10', '7', '24', 'Januar bis Dezember: 12 Monate.'],
      ['Wie viele Tage hat ein normales Jahr?', '365', '300', '356', '400', 'Ein Schaltjahr hat 366 Tage.'],
      ['Welcher Monat hat nur 28 oder 29 Tage?', 'Februar', 'Januar', 'April', 'November', 'In einem Schaltjahr hat der Februar 29 Tage.'],
      ['Wie viele Jahre sind ein Jahrhundert?', '100', '10', '50', '1000', 'Ein Jahrzehnt sind 10 Jahre, ein Jahrhundert 100 Jahre, ein Jahrtausend 1000 Jahre.'],
      ['Wie viele Jahre sind ein Jahrzehnt?', '10', '100', '12', '5', 'Zehn Jahre sind ein Jahrzehnt.'],
      ['Wann beginnt der Frühling im Kalender?', 'Im März', 'Im Januar', 'Im Mai', 'Im Juni', 'Frühling: März, Sommer: Juni, Herbst: September, Winter: Dezember.'],
      ['Wann beginnt der Sommer im Kalender?', 'Im Juni', 'Im April', 'Im August', 'Im September', 'Um den 21. Juni ist der längste Tag des Jahres.'],
      ['Welcher Monat hat 31 Tage?', 'Juli', 'Juni', 'September', 'April', '31 Tage haben Januar, März, Mai, Juli, August, Oktober und Dezember.'],
      ['Womit ordnet man Ereignisse der Vergangenheit der Reihe nach?', 'Zeitleiste', 'Landkarte', 'Stundenplan', 'Thermometer', 'Auf einer Zeitleiste steht links das Ältere, rechts das Neuere.'],
      ['Was ist eine Quelle in der Geschichte?', 'Etwas, das uns über früher erzählt, z. B. alte Fotos oder Briefe', 'Ein Bach', 'Ein Märchen', 'Eine Vermutung', 'Es gibt Bildquellen, Textquellen, Gegenstände und Zeitzeugen.'],
      ['Wie nennt man einen Menschen, der von früher erzählt, weil er es selbst erlebt hat?', 'Zeitzeuge', 'Forscher', 'Erfinder', 'Reporter', 'Oma und Opa sind Zeitzeugen für ihre Kindheit.'],
      ['Womit schrieben Schulkinder vor etwa 100 Jahren?', 'Mit Griffel auf einer Schiefertafel', 'Mit dem Tablet', 'Mit Kugelschreiber im Heft', 'Mit der Schreibmaschine', 'Die Schiefertafel konnte man abwischen und wieder benutzen.'],
      ['Wo findest du alte Gegenstände aus deinem Ort ausgestellt?', 'Im Heimatmuseum', 'Im Supermarkt', 'Im Schwimmbad', 'Im Kino', 'Museen sammeln und zeigen Dinge von früher.'],
      ['Warum gibt es Tag und Nacht?', 'Weil sich die Erde um sich selbst dreht', 'Weil die Sonne sich ausschaltet', 'Weil der Mond die Sonne verdeckt', 'Weil Wolken kommen', 'Die Erde dreht sich in 24 Stunden einmal um sich selbst.'],
      ['Wie lange braucht die Erde für eine Runde um die Sonne?', 'Ein Jahr', 'Einen Tag', 'Einen Monat', 'Eine Woche', 'Deshalb dauert ein Jahr etwa 365 Tage.']
    ]);

    addItems('h_getreide', [
      { id: 'h_getreide:o1', make: function () { return ORDER('Vom Korn zum Brot: Bringe die Schritte in die richtige Reihenfolge.', ['säen', 'wachsen', 'ernten', 'mahlen', 'backen'], { sep: ' → ', explain: 'säen → wachsen → ernten → mahlen → backen' }); } },
      { id: 'h_getreide:m1', make: function () { return MATCH('Wer macht was?', [['Landwirt', 'sät und erntet'], ['Müller', 'mahlt das Mehl'], ['Bäcker', 'backt das Brot'], ['Mähdrescher', 'trennt Korn und Stroh']]); } }
    ]);
    addItems('h_wasser', [
      { id: 'h_wasser:o1', make: function () { return ORDER('Der Wasserkreislauf: Beginne beim Verdunsten.', ['Wasser verdunstet', 'Wolken entstehen', 'Es regnet', 'Wasser fließt zum Meer'], { sep: ' → ', explain: 'Wasser verdunstet → Wolken entstehen → Es regnet → Wasser fließt zum Meer. Dann beginnt alles von vorn.' }); } },
      { id: 'h_wasser:m1', make: function () { return MATCH('Was gehört zusammen?', [['Eis', 'fest'], ['Wasser', 'flüssig'], ['Wasserdampf', 'gasförmig']]); } },
      { id: 'h_wasser:m2', make: function () { return MATCH('Was passiert?', [['Schmelzen', 'Eis wird zu Wasser'], ['Gefrieren', 'Wasser wird zu Eis'], ['Verdunsten', 'Wasser wird zu Dampf'], ['Kondensieren', 'Dampf wird zu Tröpfchen']]); } }
    ]);
    addItems('h_wald', [
      { id: 'baum:m1', make: function () { return MATCH('Welche Frucht gehört zu welchem Baum?', shuf([['Eiche', 'Eichel'], ['Buche', 'Buchecker'], ['Ahorn', 'Flügelfrucht'], ['Birke', 'Kätzchen'], ['Fichte', 'hängender Zapfen'], ['Tanne', 'stehender Zapfen']]).slice(0, 4)); } },
      { id: 'baum:m2', make: function () { return MATCH('Welches Blatt gehört zu welchem Baum?', shuf([['Eiche', 'gelappt, runde Buchten'], ['Linde', 'herzförmig'], ['Ahorn', '5 spitze Lappen'], ['Kastanie', 'gefingert'], ['Birke', 'dreieckig, gesägt']]).slice(0, 4)); } },
      { id: 'baum:o1', make: function () { return ORDER('Die Stockwerke des Waldes: Beginne ganz unten.', ['Wurzelschicht', 'Moosschicht', 'Krautschicht', 'Strauchschicht', 'Baumschicht'], { sep: ' → ', explain: 'Von unten nach oben: Wurzelschicht, Moosschicht, Krautschicht, Strauchschicht, Baumschicht.' }); } }
    ]);
    addItems('h_koerper', [
      { id: 'h_koerper:m1', make: function () { return MATCH('Welcher Sinn gehört zu welchem Körperteil?', [['Sehen', 'Auge'], ['Hören', 'Ohr'], ['Riechen', 'Nase'], ['Schmecken', 'Zunge']]); } },
      { id: 'h_koerper:m2', make: function () { return MATCH('Welcher Zahn hat welche Aufgabe?', [['Schneidezahn', 'abbeißen'], ['Eckzahn', 'festhalten und reißen'], ['Backenzahn', 'zermahlen']]); } }
    ]);
    addItems('h_orient', [
      { id: 'h_orient:m1', make: function () { return MATCH('Wo steht die Sonne?', [['am Morgen', 'im Osten'], ['am Mittag', 'im Süden'], ['am Abend', 'im Westen']]); } },
      { id: 'h_orient:m2', make: function () { return MATCH('Was bedeuten die Farben auf der Landkarte?', [['Blau', 'Wasser'], ['Grün', 'Tiefland'], ['Braun', 'Gebirge']]); } },
      { id: 'h_orient:o1', make: function () { return ORDER('Die Himmelsrichtungen im Uhrzeigersinn: Beginne mit Norden.', ['Norden', 'Osten', 'Süden', 'Westen'], { sep: ' → ', explain: 'Norden → Osten → Süden → Westen. Merksatz: Nie Ohne Seife Waschen.' }); } }
    ]);
    addItems('h_strom', [{ id: 'h_strom:m1', make: function () { return MATCH('Was macht welches Teil im Stromkreis?', [['Batterie', 'liefert den Strom'], ['Schalter', 'öffnet und schließt'], ['Kabel', 'leitet den Strom'], ['Lämpchen', 'leuchtet']]); } }]);
    addItems('h_zeit', [
      { id: 'h_zeit:o1', make: function () { return ORDER('Ordne von der kürzesten zur längsten Zeit.', ['Tag', 'Woche', 'Monat', 'Jahr', 'Jahrhundert'], { sep: ' < ', explain: 'Tag < Woche < Monat < Jahr < Jahrhundert' }); } },
      { id: 'h_zeit:o2', make: function () { return ORDER('Die Jahreszeiten: Beginne mit dem Frühling.', ['Frühling', 'Sommer', 'Herbst', 'Winter'], { sep: ' → ', explain: 'Frühling → Sommer → Herbst → Winter' }); } }
    ]);
    addItems('h_feuer', [{ id: 'h_feuer:o1', make: function () { return ORDER('Notruf 112: In welcher Reihenfolge sagst du es?', ['Wo ist es passiert?', 'Was ist passiert?', 'Wie viele Verletzte?', 'Warten auf Rückfragen'], { sep: ' → ', explain: 'Wo? → Was? → Wie viele Verletzte? → Warten auf Rückfragen.' }); } }]);
  })();
