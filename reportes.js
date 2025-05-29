const express = require("express");
const router = express.Router();
const { JugadorModel, PartidaModel } = require("./models"); // Importando modelos

// 1. Ranking general de jugadores
router.get("/ranking", async (req, res) => {
    try {
        const jugadores = await JugadorModel.find({}, { _id: 0, nombre: 1, puntaje: 1 })
            .sort({ puntaje: -1 })
            .limit(10);

        if (!jugadores.length) {
            return res.status(404).json({ mensaje: "No se encontraron jugadores" });
        }

        res.json({
            descripcion: "Ranking de los 10 jugadores con mayor puntaje.",
            datos: jugadores
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo ranking" });
    }
});

// 2. Historial de partidas por jugador
router.get("/historial/:id", async (req, res) => {
    const { id } = req.params;
    if (!id.match(/^[a-f\d]{24}$/i)) {
        return res.status(400).json({ error: "ID de jugador inválido" });
    }

    try {
        const partidas = await PartidaModel.aggregate([
            { $match: { "jugadores.id": id } },
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
        ]);

        if (!partidas.length) {
            return res.status(404).json({ mensaje: "No se encontraron partidas para ese jugador" });
        }

        res.json({
            descripcion: `Historial de partidas del jugador '${id}'.`,
            datos: partidas
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo historial" });
    }
});

// Aplicar validaciones similares a las demás rutas...

module.exports = router;