// GLITCH-Backend mit Express
// Liefert die Spielseiten aus und stellt die API unter /api bereit.

const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Ordner mit index.html, room.html usw. (eine Ebene über dem Backend)
const gameFolder = path.join(__dirname, "..");

// Erste API-Route: zeigt, dass der Server läuft
app.get("/api/status", (req, res) => {
    res.json({
        status: "ok",
        message: "GLITCH-Server läuft",
        time: new Date().toISOString()
    });
});

// Unbekannte API-Routen als JSON beantworten
app.use("/api", (req, res) => {
    res.status(404).json({ status: "error", message: "Unbekannte API-Route" });
});

// Den Backend-Ordner selbst nicht ausliefern (Quellcode und node_modules)
app.use("/backend", (req, res) => {
    res.status(404).send("Nicht gefunden");
});

// Spielseiten ausliefern, damit Spiel und API auf demselben Server laufen
app.use(express.static(gameFolder));

app.listen(port, () => {
    console.log("GLITCH-Server läuft auf http://localhost:" + port);
});
