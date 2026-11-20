// GLITCH-Backend mit Express
// Liefert die Spielseiten aus und stellt die API unter /api bereit.

const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Ordner mit index.html, room.html usw. (eine Ebene über dem Backend)
const gameFolder = path.join(__dirname, "..");

// Gespeicherte Bestzeiten und Spielstände (wird nicht ins Repository übernommen)
const dataFolder = path.join(__dirname, "data");
const dataFile = path.join(dataFolder, "speicher.json");

// Höchstens so viele Bestzeiten aufbewahren
const maxBestTimes = 100;

// Gespeicherte Daten laden; fehlt die Datei oder ist sie beschädigt, beginnt der Server leer
function loadData() {
    try {
        const saved = JSON.parse(fs.readFileSync(dataFile, "utf8"));

        return {
            bestzeiten: Array.isArray(saved.bestzeiten) ? saved.bestzeiten : [],
            spielstaende: saved.spielstaende && typeof saved.spielstaende === "object" ? saved.spielstaende : {}
        };
    } catch (error) {
        return { bestzeiten: [], spielstaende: {} };
    }
}

// Daten zuerst in eine Hilfsdatei schreiben, damit ein Absturz die alte Datei nicht zerstört
function saveData() {
    fs.mkdirSync(dataFolder, { recursive: true });
    fs.writeFileSync(dataFile + ".tmp", JSON.stringify(data, null, 2));
    fs.renameSync(dataFile + ".tmp", dataFile);
}

const data = loadData();

// Bestzeiten nach Zeit sortieren, bei gleicher Zeit zählt der frühere Eintrag
function sortBestTimes() {
    data.bestzeiten.sort((a, b) => a.seconds - b.seconds || a.date.localeCompare(b.date));
}

app.use(express.json({ limit: "10kb" }));

// Erste API-Route: zeigt, dass der Server läuft
app.get("/api/status", (req, res) => {
    res.json({
        status: "ok",
        message: "GLITCH-Server läuft",
        time: new Date().toISOString()
    });
});

// Die zehn besten Zeiten
app.get("/api/bestzeiten", (req, res) => {
    res.json(data.bestzeiten.slice(0, 10));
});

// Neue Zeit speichern: { name, seconds }
app.post("/api/bestzeiten", (req, res) => {
    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : "";
    const seconds = body.seconds;

    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 86400) {
        return res.status(400).json({ status: "error", message: "Ungültige Zeit" });
    }

    const entry = { name: name || "Anonym", seconds: seconds, date: new Date().toISOString() };

    data.bestzeiten.push(entry);
    sortBestTimes();
    data.bestzeiten = data.bestzeiten.slice(0, maxBestTimes);
    saveData();

    const rank = data.bestzeiten.indexOf(entry) + 1;
    res.status(201).json({ status: "ok", entry: entry, rank: rank > 0 ? rank : null });
});

// Spielerkennung prüfen (wird im Browser zufällig erzeugt)
function isValidPlayerId(playerId) {
    return typeof playerId === "string" && /^[a-z0-9]{8,40}$/.test(playerId);
}

// Spielstand eines Spielers lesen
app.get("/api/spielstand/:playerId", (req, res) => {
    const playerId = req.params.playerId;

    if (!isValidPlayerId(playerId)) {
        return res.status(400).json({ status: "error", message: "Ungültige Spielerkennung" });
    }

    const saved = data.spielstaende[playerId];

    if (!saved) {
        return res.status(404).json({ status: "error", message: "Kein Spielstand gespeichert" });
    }

    res.json(saved);
});

// Spielstand speichern: { playerId, unlockedLevel, bestTime }
app.post("/api/spielstand", (req, res) => {
    const body = req.body || {};

    if (!isValidPlayerId(body.playerId)) {
        return res.status(400).json({ status: "error", message: "Ungültige Spielerkennung" });
    }

    if (!Number.isInteger(body.unlockedLevel) || body.unlockedLevel < 1 || body.unlockedLevel > 20) {
        return res.status(400).json({ status: "error", message: "Ungültiges Level" });
    }

    if (body.bestTime !== null && (!Number.isInteger(body.bestTime) || body.bestTime < 1)) {
        return res.status(400).json({ status: "error", message: "Ungültige Bestzeit" });
    }

    const saved = {
        unlockedLevel: body.unlockedLevel,
        bestTime: body.bestTime,
        updatedAt: new Date().toISOString()
    };

    data.spielstaende[body.playerId] = saved;
    saveData();

    res.json({ status: "ok", spielstand: saved });
});

// Unbekannte API-Routen als JSON beantworten
app.use("/api", (req, res) => {
    res.status(404).json({ status: "error", message: "Unbekannte API-Route" });
});

// Ungültiges JSON in einer Anfrage
app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed" || error.type === "entity.too.large") {
        return res.status(400).json({ status: "error", message: "Ungültige Anfrage" });
    }

    next(error);
});

// Den Backend-Ordner selbst nicht ausliefern (Quellcode, Daten und node_modules)
app.use("/backend", (req, res) => {
    res.status(404).send("Nicht gefunden");
});

// HTML-Seiten mit einem Merkmal ausliefern: So weiss das Frontend, dass es über
// diesen Server läuft und Daten an die API senden kann. Ohne Server bleibt alles lokal.
app.use((req, res, next) => {
    const page = req.path === "/" ? "/index.html" : req.path;

    if (!page.endsWith(".html")) return next();

    const file = path.join(gameFolder, page);

    if (!file.startsWith(gameFolder + path.sep)) return next();

    fs.readFile(file, "utf8", (error, html) => {
        if (error) return next();

        res.type("html").send(
            html.replace("</head>", "    <script>window.glitchServer = true;</script>\n</head>")
        );
    });
});

// Alle anderen Dateien (CSS, JavaScript) normal ausliefern
app.use(express.static(gameFolder));

app.listen(port, () => {
    console.log("GLITCH-Server läuft auf http://localhost:" + port);
});
