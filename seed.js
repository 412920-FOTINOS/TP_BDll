const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db("juego_online");

        // Crear índices para mejorar rendimiento en las consultas
        await db.collection("jugadores").createIndex({ id: 1 });
        await db.collection("partidas").createIndex({ "jugadores.id": 1 });
        await db.collection("partidas").createIndex({ estado: 1 });

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

        console.log("✅ Índices creados y base de datos poblada correctamente.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error al poblar la base de datos:", error);
        process.exit(1);
    }
}

run();