# Online-Bestenliste einrichten (einmalig, ca. 5 Minuten)

Die App speichert die Bestenliste in einer kostenlosen Firebase Realtime Database.
Gespeichert werden pro Kind nur: Spitzname, gewähltes Tier, Punkte, Level.

1. https://console.firebase.google.com öffnen, mit Google-Konto anmelden, **Projekt hinzufügen** (Name z. B. `klasse3`). Google Analytics kann ausgeschaltet bleiben.
2. Links **Build → Authentication → Los geht's → Anmeldemethode → Anonym → Aktivieren → Speichern**.
3. Links **Build → Realtime Database → Datenbank erstellen**. Standort **Belgien (europe-west1)**, Start im **gesperrten Modus**.
4. Im Tab **Regeln** alles ersetzen durch den Block unten und **Veröffentlichen**.
5. Im Tab **Daten** die Adresse oben kopieren (sieht aus wie `https://klasse3-xxxx-default-rtdb.europe-west1.firebasedatabase.app`).
6. Zahnrad **Projekteinstellungen → Allgemein → Web-API-Schlüssel** kopieren (beginnt mit `AIza…`). Falls dort noch keiner steht: unten unter „Meine Apps“ eine Web-App (`</>`) anlegen, dann erscheint er.
7. Beides (Datenbank-Adresse und API-Schlüssel) in `index.html` bei `var FB = { apiKey: '', db: '' };` eintragen.

```json
{
  "rules": {
    "classes": {
      "$code": {
        "players": {
          ".read": "auth != null",
          "$pid": {
            ".write": "auth != null && $pid.beginsWith(auth.uid + '_')",
            ".validate": "newData.hasChildren(['n', 't']) && newData.child('n').isString() && newData.child('n').val().length <= 14 && newData.child('t').isNumber() && newData.child('t').val() >= 0 && newData.child('t').val() < 10000000"
          }
        }
      }
    }
  }
}
```

Die Regeln bedeuten: Lesen kann nur, wer den Klassen-Code kennt. Schreiben kann jedes Gerät nur seinen eigenen Eintrag.
Der API-Schlüssel ist kein Geheimnis, er darf in der Seite stehen.
