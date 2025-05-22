// server.js - Backend Node.js + Express + MongoDB
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;

app.use(cors());

// Reemplazá esta URI con tu conexión local o de MongoDB Atlas
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

client.connect().then(() => {
    db = client.db("juego_online");
    console.log("Conectado a MongoDB");
});

// 1. Ranking general de jugadores
app.get("/ranking", async (req, res) => {
    const result = await db.collection("jugadores")
        .find()
        .sort({ puntaje: -1 })
        .limit(10)
        .toArray();
    res.json(result);
});

// 2. Historial de partidas por jugador
app.get("/historial/:id", async (req, res) => {
    const result = await db.collection("partidas")
        .find({ "jugadores.id": req.params.id })
        .toArray();
    res.json(result);
});

// 3. Partidas activas con más jugadores
app.get("/activas", async (req, res) => {
    const result = await db.collection("partidas")
        .find({ estado: "activa" })
        .sort({ "jugadores.length": -1 })
        .toArray();
    res.json(result);
});

// 4. Eventos en una partida
app.get("/eventos/:id", async (req, res) => {
    const result = await db.collection("eventos")
        .find({ partidaId: req.params.id })
        .sort({ timestamp: 1 })
        .toArray();
    res.json(result);
});

// 5. Análisis de abandonos
app.get("/abandonos", async (req, res) => {
    const result = await db.collection("partidas").aggregate([
        { $unwind: "$jugadores" },
        { $match: { "jugadores.estado": "abandonado" } },
        { $group: { _id: "$jugadores.id", conteo: { $sum: 1 } } },
        { $sort: { conteo: -1 } }
    ]).toArray();
    res.json(result);
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));