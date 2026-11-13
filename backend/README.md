# GLITCH – Backend

Grundlage für das Backend mit **Node.js** und **Express**. Der Server liefert das
Spiel aus und stellt die API unter `/api` bereit. Das Spiel funktioniert weiterhin
auch ohne Server.

## Starten

Node.js muss installiert sein.

```
cd backend
npm install
npm start
```

Danach läuft der Server auf <http://localhost:3000>.

- Spiel: <http://localhost:3000>
- Verbindung testen: <http://localhost:3000/server-test.html>

## API

| Route | Antwort |
|---|---|
| `GET /api/status` | `{ "status": "ok", "message": "GLITCH-Server läuft", "time": "…" }` |

Unbekannte Routen unter `/api` antworten mit Status 404 und einer JSON-Fehlermeldung.

## Dateien

- `server.js` – Express-Server mit der ersten API-Route
- `../api.js` – Verbindung vom Frontend zur API
- `../server-test.html` – Testseite für die Verbindung zwischen Frontend und Backend
