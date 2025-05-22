// server.js - Backend Node.js + Express + MongoDB
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;
const { getReporte } = require("./reportes");

app.use(cors());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

client.connect().then(() => {
    db = client.db("juego_online");
    console.log("Conectado a MongoDB");
});

// 1. Ranking general de jugadores
app.get("/ranking", async (req, res) => {
    const jugadores = await db.collection("jugadores")
        .find({}, { projection: { _id: 0 } })
        .sort({ puntaje: -1 })
        .limit(10)
        .toArray();

    res.json({
        descripcion: "Ranking de los 10 jugadores con mayor puntaje.",
        datos: jugadores
    });
});

// 2. Historial de partidas por jugador (con nombres)
app.get("/historial/:id", async (req, res) => {
    const partidas = await db.collection("partidas")
        .aggregate([
            { $match: { "jugadores.id": req.params.id } },
            {
                $lookup: {
                    from: "jugadores",
                    localField: "jugadores.id",
                    foreignField: "id",
                    as: "infoJugadores"
                }
            },
            {
                $project: {
                    _id: 0,
                    estado: 1,
                    jugadores: 1,
                    nombres: "$infoJugadores.nombre"
                }
            }
        ]).toArray();

    res.json({
        descripcion: `Partidas en las que participó el jugador con id '${req.params.id}'.`,
        datos: partidas
    });
});

// 3. Partidas activas con más jugadores
app.get("/activas", async (req, res) => {
    const partidas = await db.collection("partidas")
        .aggregate([
            { $match: { estado: "activa" } },
            {
                $addFields: {
                    cantidadJugadores: { $size: "$jugadores" }
                }
            },
            { $sort: { cantidadJugadores: -1 } },
            {
                $project: {
                    _id: 0,
                    jugadores: 1,
                    estado: 1,
                    cantidadJugadores: 1
                }
            }
        ]).toArray();

    res.json({
        descripcion: "Partidas activas ordenadas por cantidad de jugadores.",
        datos: partidas
    });
});

// 4. Eventos en una partida
app.get("/eventos/:id", async (req, res) => {
    const eventos = await db.collection("eventos")
        .aggregate([
            { $match: { partidaId: req.params.id } },
            {
                $lookup: {
                    from: "jugadores",
                    localField: "jugador",
                    foreignField: "id",
                    as: "jugadorInfo"
                }
            },
            {
                $project: {
                    _id: 0,
                    accion: 1,
                    timestamp: 1,
                    jugador: { $arrayElemAt: ["$jugadorInfo.nombre", 0] }
                }
            },
            { $sort: { timestamp: 1 } }
        ]).toArray();

    res.json({
        descripcion: `Eventos registrados en la partida '${req.params.id}'.`,
        datos: eventos
    });
});

// 5. Análisis de abandonos
app.get("/abandonos", async (req, res) => {
    const abandonos = await db.collection("partidas").aggregate([
        { $unwind: "$jugadores" },
        { $match: { "jugadores.estado": "abandonado" } },
        {
            $group: {
                _id: "$jugadores.id",
                conteo: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "jugadores",
                localField: "_id",
                foreignField: "id",
                as: "jugadorInfo"
            }
        },
        {
            $project: {
                _id: 0,
                id: "$_id",
                nombre: { $arrayElemAt: ["$jugadorInfo.nombre", 0] },
                abandonos: "$conteo"
            }
        },
        { $sort: { abandonos: -1 } }
    ]).toArray();

    res.json({
        descripcion: "Cantidad de veces que cada jugador abandonó una partida.",
        datos: abandonos
    });
});

// 6. Reporte personalizado por ID
app.get("/reportes/:id", async (req, res) => {
    try {
        const data = await getReporte(db, req.params.id);
        res.json(data);
    } catch (error) {
        console.error("Error al obtener reporte:", error);
        res.status(404).json({ error: "Reporte no encontrado o error interno." });
    }
});

app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
