const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db("juego_online");

        // Limpiar colecciones
        await db.collection("jugadores").deleteMany({});
        await db.collection("partidas").deleteMany({});
        await db.collection("eventos").deleteMany({});
        await db.collection("reportes").deleteMany({});

        // Insertar jugadores
        await db.collection("jugadores").insertMany([
            { id: "j1", nombre: "Juan Pérez", puntaje: 1200 },
            { id: "j2", nombre: "Ana Gómez", puntaje: 1350 },
            { id: "j3", nombre: "Carlos Ruiz", puntaje: 980 },
            { id: "j4", nombre: "Lucía Torres", puntaje: 1450 },
            { id: "j5", nombre: "Mariana López", puntaje: 1100 },
            { id: "j6", nombre: "Pedro Sánchez", puntaje: 900 },
            { id: "j7", nombre: "Sofía Ramírez", puntaje: 1250 },
            { id: "j8", nombre: "Diego Fernández", puntaje: 1000 },
            { id: "j9", nombre: "Valeria Díaz", puntaje: 1320 },
            { id: "j10", nombre: "Martín Herrera", puntaje: 1190 },
            { id: "j11", nombre: "Camila Vargas", puntaje: 1500 },
            { id: "j12", nombre: "Roberto Núñez", puntaje: 970 }
        ]);

        // Insertar partidas
        await db.collection("partidas").insertMany([
            { estado: "activa", jugadores: [ { id: "j1", estado: "jugando" }, { id: "j2", estado: "jugando" } ] },
            { estado: "finalizada", jugadores: [ { id: "j2", estado: "ganador" }, { id: "j3", estado: "abandonado" } ] },
            { estado: "activa", jugadores: [ { id: "j1", estado: "jugando" }, { id: "j4", estado: "jugando" }, { id: "j3", estado: "jugando" } ] },
            { estado: "finalizada", jugadores: [ { id: "j5", estado: "ganador" }, { id: "j6", estado: "perdedor" } ] },
            { estado: "activa", jugadores: [ { id: "j7", estado: "jugando" }, { id: "j8", estado: "jugando" } ] },
            { estado: "finalizada", jugadores: [ { id: "j9", estado: "ganador" }, { id: "j10", estado: "perdedor" } ] },
            { estado: "activa", jugadores: [ { id: "j11", estado: "jugando" }, { id: "j12", estado: "jugando" } ] },
            { estado: "finalizada", jugadores: [ { id: "j8", estado: "ganador" }, { id: "j3", estado: "abandonado" } ] },
            { estado: "activa", jugadores: [ { id: "j4", estado: "jugando" }, { id: "j6", estado: "jugando" }, { id: "j9", estado: "jugando" } ] }
        ]);

        // Insertar eventos
        await db.collection("eventos").insertMany([
            { partidaId: "1", jugador: "j1", accion: "apostar", timestamp: new Date("2023-01-01T10:00:00Z") },
            { partidaId: "1", jugador: "j2", accion: "subir", timestamp: new Date("2023-01-01T10:01:00Z") },
            { partidaId: "2", jugador: "j3", accion: "abandono", timestamp: new Date("2023-01-02T15:00:00Z") },
            { partidaId: "4", jugador: "j5", accion: "apostar", timestamp: new Date("2023-01-03T12:00:00Z") },
            { partidaId: "5", jugador: "j7", accion: "pasar", timestamp: new Date("2023-01-04T13:00:00Z") },
            { partidaId: "6", jugador: "j9", accion: "subir", timestamp: new Date("2023-01-05T14:00:00Z") },
            { partidaId: "7", jugador: "j11", accion: "apostar", timestamp: new Date("2023-01-06T15:00:00Z") },
            { partidaId: "8", jugador: "j8", accion: "subir", timestamp: new Date("2023-01-07T16:00:00Z") },
            { partidaId: "9", jugador: "j4", accion: "apostar", timestamp: new Date("2023-01-08T17:00:00Z") }
        ]);

        // Insertar reportes
        await db.collection("reportes").insertMany([
            { id: "1", descripcion: "Reporte de prueba 1", datos: { jugadoresTotales: 12, partidasTotales: 9, eventosTotales: 9 } },
            { id: "2", descripcion: "Estadísticas mensuales", datos: { partidasActivas: 5, abandonos: 2 } },
            { id: "3", descripcion: "Jugadores con mejor rendimiento", datos: { top: ["Camila Vargas", "Lucía Torres", "Ana Gómez"] } }
        ]);

        console.log("Base de datos poblada correctamente.");
        process.exit(0);
    } catch (error) {
        console.error("Error al poblar la base de datos:", error);
        process.exit(1);
    }
}

run();
