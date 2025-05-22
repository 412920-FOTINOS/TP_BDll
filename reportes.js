const express = require("express");
const router = express.Router();
const { Jugador, Partida, Evento } = require("./models");

// 1. Ranking general de jugadores
router.get("/ranking", async (req, res) => {
    const ranking = await Jugador.find()
        .sort({ puntaje: -1 })
        .limit(10)
        .select("id nombre puntaje -_id");

    res.json({
        descripcion: "Ranking de los 10 jugadores con mayor puntaje.",
        datos: ranking
    });
});

// 2. Historial de partidas por jugador (con nombres de todos los jugadores)
router.get("/historial/:jugadorId", async (req, res) => {
    const { jugadorId } = req.params;
    const partidas = await Partida.find({ "jugadores.id": jugadorId }).lean();

    const todosLosIds = [
        ...new Set(partidas.flatMap(p => p.jugadores.map(j => j.id)))
    ];
    const jugadores = await Jugador.find({ id: { $in: todosLosIds } })
        .select("id nombre -_id")
        .lean();

    const partidasConNombres = partidas.map(p => ({
        estado: p.estado,
        jugadores: p.jugadores.map(j => {
            const jugador = jugadores.find(g => g.id === j.id);
            return {
                id: j.id,
                nombre: jugador?.nombre || j.id,
                estado: j.estado
            };
        })
    }));

    res.json({
        descripcion: `Partidas en las que participó el jugador con id '${jugadorId}'.`,
        datos: partidasConNombres
    });
});

// 3. Partidas activas con más jugadores
router.get("/activas", async (req, res) => {
    const activas = await Partida.find({ estado: "activa" }).lean();

    const partidasConCantidad = activas.map(p => ({
        id: p._id,
        cantidadJugadores: p.jugadores.length,
        jugadores: p.jugadores
    }));

    const ordenadas = partidasConCantidad.sort(
        (a, b) => b.cantidadJugadores - a.cantidadJugadores
    );

    res.json({
        descripcion: "Partidas activas ordenadas por cantidad de jugadores.",
        datos: ordenadas
    });
});

// 4. Eventos en una partida (con nombre del jugador)
router.get("/eventos/:partidaId", async (req, res) => {
    const { partidaId } = req.params;
    const eventos = await Evento.find({ partidaId })
        .sort({ timestamp: 1 })
        .lean();

    const jugadorIds = [...new Set(eventos.map(e => e.jugador))];
    const jugadores = await Jugador.find({ id: { $in: jugadorIds } })
        .select("id nombre -_id")
        .lean();

    const eventosConNombre = eventos.map(e => {
        const jugador = jugadores.find(j => j.id === e.jugador);
        return {
            partidaId: e.partidaId,
            accion: e.accion,
            jugador: e.jugador,
            nombre: jugador?.nombre || e.jugador,
            timestamp: e.timestamp
        };
    });

    res.json({
        descripcion: `Eventos registrados en la partida '${partidaId}'.`,
        datos: eventosConNombre
    });
});

// 5. Análisis de abandonos (jugadores que más abandonaron, con nombre)
router.get("/abandonos", async (req, res) => {
    const resultado = await Evento.aggregate([
        { $match: { accion: "abandono" } },
        { $group: { _id: "$jugador", conteo: { $sum: 1 } } },
        { $sort: { conteo: -1 } },
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
                id: "$_id",
                nombre: { $arrayElemAt: ["$jugadorInfo.nombre", 0] },
                abandonos: "$conteo",
                _id: 0
            }
        }
    ]);

    res.json({
        descripcion: "Cantidad de veces que cada jugador abandonó una partida.",
        datos: resultado
    });
});

module.exports = router;
