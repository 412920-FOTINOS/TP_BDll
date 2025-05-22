// reportes.js
async function getReporte(db, id) {
    switch (parseInt(id)) {
        case 1: // Ranking general de jugadores
            return await db.collection("jugadores")
                .find()
                .sort({ puntaje: -1 })
                .limit(10)
                .toArray();

        case 2: // Historial de partidas por jugador fijo (hardcodeado por ahora)
            return await db.collection("partidas")
                .find({ "jugadores.id": "jugador1" }) // Cambiar a uno real si querés
                .toArray();

        case 3: // Partidas activas con más jugadores
            return await db.collection("partidas")
                .find({ estado: "activa" })
                .sort({ "jugadores.length": -1 }) // puede que esto no funcione bien en Mongo
                .toArray();

        case 4: // Eventos en una partida (hardcodeado por ahora)
            return await db.collection("eventos")
                .find({ partidaId: "partida1" }) // Cambiar a uno real si querés
                .sort({ timestamp: 1 })
                .toArray();

        case 5: // Análisis de abandonos
            return await db.collection("partidas").aggregate([
                { $unwind: "$jugadores" },
                { $match: { "jugadores.estado": "abandonado" } },
                { $group: { _id: "$jugadores.id", conteo: { $sum: 1 } } },
                { $sort: { conteo: -1 } }
            ]).toArray();

        default:
            throw new Error("Reporte no definido");
    }
}

module.exports = { getReporte };
