// models.js
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

const Jugador = mongoose.model("Jugador", jugadorSchema);
const Partida = mongoose.model("Partida", partidaSchema);
const Evento = mongoose.model("Evento", eventoSchema);

module.exports = { Jugador, Partida, Evento };
