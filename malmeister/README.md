# Malmeister – Zeichnen Schritt für Schritt (PWA)

Foto machen → App rechnet Linien aus → Schritt-für-Schritt-Anleitung (Gitter, grobe Formen, wichtige Linien, Details, Schatten) → fertiges Bild abfotografieren → in „Meine Bilder“ (IndexedDB) und per Teilen-Menü in die Fotos-App sichern.

- Reines HTML/CSS/JS, keine Bibliotheken, läuft offline (Service Worker), alles bleibt auf dem Gerät.
- Dateien: `index.html`, `styles.css`, `app.js` (Oberfläche), `imaging.js` (Bildanalyse, reine Funktionen), `worker.js`, `sw.js`, `manifest.webmanifest`, `icons/`.
- Veröffentlichen: Ordner `malmeister/` ins GitHub-Repo legen (GitHub Pages, HTTPS nötig für Installation/Offline). Danach in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
- Neue Version: `VERSION` in `app.js` hochzählen (steuert auch den Cache im Service Worker).
- Icons neu erzeugen: `node tools/make_icons.js`. Test: `node tools/e2e.js foto.jpg ausgabeordner` (Playwright + Chrome).
- Stufen: Leicht (3er-Gitter, 4 Schritte), Mittel (4er, 5 Schritte), Profi (6er, 6 Schritte inkl. Schraffur).
- Grenzen: iOS erlaubt Web-Apps kein stilles Schreiben in die Fotos-App, daher „Im Handy sichern“ über das Teilen-Menü. Getestet nur mit Testbildern und emuliertem iPhone, nicht auf echtem Gerät.
