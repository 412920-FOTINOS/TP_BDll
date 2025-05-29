const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

// 1. Ranking general de jugadores
router.get("/ranking", async (req, res) => {
    try {
        const jugadores = await req.db.collection("jugadores")
            .find({}, { projection: { _id: 0 } })
            .sort({ puntaje: -1 })
            .limit(10)
            .toArray();

        res.json({
            descripcion: "Ranking de los 10 jugadores con mayor puntaje.",
            datos: jugadores
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo ranking" });
    }
});

// 2. Historial de partidas por jugador (con nombres)
router.get("/historial/:id", async (req, res) => {
    try {
        const partidas = await req.db.collection("partidas")
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
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo historial" });
    }
});

// 3. Partidas activas con más jugadores
router.get("/activas", async (req, res) => {
    try {
        const partidas = await req.db.collection("partidas")
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
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo partidas activas" });
    }
});

// 4. Eventos en una partida (con nombre del jugador)
router.get("/eventos/:id", async (req, res) => {
    try {
        const eventos = await req.db.collection("eventos")
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
                        jugador: "$jugador",
                        nombre: { $arrayElemAt: ["$jugadorInfo.nombre", 0] }
                    }
                },
                { $sort: { timestamp: 1 } }
            ]).toArray();

        res.json({
            descripcion: `Eventos registrados en la partida '${req.params.id}'.`,
            datos: eventos
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo eventos" });
    }
});

// 5. Análisis de abandonos
router.get("/abandonos", async (req, res) => {
    try {
        const abandonos = await req.db.collection("partidas").aggregate([
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
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo análisis de abandonos" });
    }
});

// 6. Reporte personalizado por ID
router.get("/reportes/:id", async (req, res) => {
    try {
        const reporte = await req.db.collection("reportes").findOne({ id: req.params.id });

        if (!reporte) {
            return res.status(404).json({ error: "Reporte no encontrado" });
        }

        res.json({
            descripcion: reporte.descripcion,
            datos: reporte.datos
        });
    } catch (error) {
        console.error("Error al obtener reporte:", error);
        res.status(500).json({ error: "Error interno al obtener reporte" });
    }
});

module.exports = router;
