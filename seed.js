
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function seed() {
    try {
        await client.connect();
        const db = client.db("juego_online");

        // Limpiar colecciones
        await db.collection("jugadores").deleteMany({});
        await db.collection("partidas").deleteMany({});
        await db.collection("eventos").deleteMany({});

        // Jugadores
        const jugadores = [
            { id: "j1", nombre: "TotoVittorio", puntaje: 1500 },
            { id: "j2", nombre: "DoubleTonka", puntaje: 1400 },
            { id: "j3", nombre: "PetisoOrejudo", puntaje: 1200 },
            { id: "j4", nombre: "El_Rey_Del_Mewing", puntaje: 1600 },
            { id: "j5", nombre: "Farruko", puntaje: 1100 },
            { id: "j6", nombre: "GagaMan", puntaje: 600 },
        ];
        await db.collection("jugadores").insertMany(jugadores);

        // Partidas
        const partidas = [
            {
                _id: "p1",
                estado: "activa",
                jugadores: [
                    { id: "j1", estado: "jugando" },
                    { id: "j2", estado: "jugando" },
                    { id: "j3", estado: "abandonado" },
                ]
            },
            {
                _id: "p2",
                estado: "finalizada",
                jugadores: [
                    { id: "j4", estado: "ganador" },
                    { id: "j5", estado: "perdedor" },
                ]
            },
            {
                _id: "p3",
                estado: "activa",
                jugadores: [
                    { id: "j1", estado: "jugando" },
                    { id: "j4", estado: "jugando" },
                    { id: "j6", estado: "jugando" },
                ]
            }
        ];
        await db.collection("partidas").insertMany(partidas);

        // ebentos onichan uwu
        const eventos = [
            { partidaId: "p1", accion: "movimiento", jugador: "j1", timestamp: new Date("2023-01-01T10:00:00Z") },
            { partidaId: "p1", accion: "ataque", jugador: "j2", timestamp: new Date("2023-01-01T10:01:00Z") },
            { partidaId: "p1", accion: "abandono", jugador: "j3", timestamp: new Date("2023-01-01T10:02:00Z") },
            { partidaId: "p3", accion: "movimiento", jugador: "j1", timestamp: new Date("2023-01-02T12:00:00Z") },
        ];
        await db.collection("eventos").insertMany(eventos);

        console.log("✅ Base de datos poblada con éxito.");
    } catch (err) {
        console.error("❌ Error al poblar la base de datos:", err);
    } finally {
        await client.close();
    }
}

seed();
