const mongoose = require("mongoose");

const jugadorSchema = new mongoose.Schema({
    id: String,
    nombre: String,
    puntaje: Number
});

const partidaSchema = new mongoose.Schema({
    estado: String,
    jugadores: [
        {
            id: String,
            estado: String
        }
    ]
});

const eventoSchema = new mongoose.Schema({
    partidaId: String,
    accion: String,
    jugador: String,
    timestamp: Date
});

const JugadorModel = mongoose.model("Jugador", jugadorSchema);
const PartidaModel = mongoose.model("Partida", partidaSchema);
const EventoModel = mongoose.model("Evento", eventoSchema);

module.exports = { JugadorModel, PartidaModel, EventoModel };