const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db("juego_online");

        // Limpia las colecciones si ya existen
        await db.collection("jugadores").deleteMany({});
        await db.collection("partidas").deleteMany({});
        await db.collection("eventos").deleteMany({});
        await db.collection("reportes").deleteMany({});

        // Insertar jugadores
        await db.collection("jugadores").insertMany([
            { id: "j1", nombre: "Juan Pérez", puntaje: 1200 },
            { id: "j2", nombre: "Ana Gómez", puntaje: 1350 },
            { id: "j3", nombre: "Carlos Ruiz", puntaje: 980 },
            { id: "j4", nombre: "Lucía Torres", puntaje: 1450 }
        ]);

        // Insertar partidas
        await db.collection("partidas").insertMany([
            {
                estado: "activa",
                jugadores: [
                    { id: "j1", estado: "jugando" },
                    { id: "j2", estado: "jugando" }
                ]
            },
            {
                estado: "finalizada",
                jugadores: [
                    { id: "j2", estado: "ganador" },
                    { id: "j3", estado: "abandonado" }
                ]
            },
            {
                estado: "activa",
                jugadores: [
                    { id: "j1", estado: "jugando" },
                    { id: "j4", estado: "jugando" },
                    { id: "j3", estado: "jugando" }
                ]
            }
        ]);

        // Insertar eventos
        await db.collection("eventos").insertMany([
            {
                partidaId: "1",
                jugador: "j1",
                accion: "apostar",
                timestamp: new Date("2023-01-01T10:00:00Z")
            },
            {
                partidaId: "1",
                jugador: "j2",
                accion: "subir",
                timestamp: new Date("2023-01-01T10:01:00Z")
            },
            {
                partidaId: "2",
                jugador: "j3",
                accion: "abandono",
                timestamp: new Date("2023-01-02T15:00:00Z")
            }
        ]);

        // Insertar reporte personalizado
        await db.collection("reportes").insertMany( [
            {
                id: "1",
                descripcion: "Reporte de prueba 1",
                datos: {
                    jugadoresTotales: 4,
                    partidasTotales: 3,
                    eventosTotales: 3,
                    jugadorTop: "Lucía Torres"
                }
            },
            {
                id: "2",
                descripcion: "Reporte de prueba 2",
                datos: {
                    jugadoresTotales: 3,
                    partidasTotales: 1,
                    eventosTotales: 5,
                    jugadorTop: "Ana Gómez"
                }
            },
            {
                id: "3",
                descripcion: "Reporte de prueba 3",
                datos: {
                    jugadoresTotales: 6,
                    partidasTotales: 5,
                    eventosTotales: 12,
                    jugadorTop: "Carlos Ruiz"
                }
            }
        ]);


        console.log("✅ Datos de prueba insertados correctamente.");
    } catch (error) {
        console.error("❌ Error insertando datos de prueba:", error);
    } finally {
        await client.close();
    }
}

run();
