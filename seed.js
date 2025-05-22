const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const ESTADOS = ["jugando", "ganador", "perdedor", "abandonado"];
const ACCIONES = ["movimiento", "ataque", "defensa", "abandono", "uso_habilidad"];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    try {
        await client.connect();
        const db = client.db("juego_online");

        // Limpiar colecciones
        await db.collection("jugadores").deleteMany({});
        await db.collection("partidas").deleteMany({});
        await db.collection("eventos").deleteMany({});

        // Generar 50 jugadores
        const jugadores = [];
        for (let i = 1; i <= 50; i++) {
            jugadores.push({
                id: `j${i}`,
                nombre: `Jugador_${i}`,
                puntaje: randomInt(100, 2000)
            });
        }
        await db.collection("jugadores").insertMany(jugadores);

        // Generar 20 partidas
        const partidas = [];
        for (let i = 1; i <= 20; i++) {
            const cantidadJugadores = randomInt(2, 5);
            const jugadoresPartida = [];
            const usados = new Set();

            while (jugadoresPartida.length < cantidadJugadores) {
                const idx = randomInt(1, 50);
                if (!usados.has(idx)) {
                    usados.add(idx);
                    jugadoresPartida.push({
                        id: `j${idx}`,
                        estado: randomFromArray(ESTADOS)
                    });
                }
            }

            partidas.push({
                _id: `p${i}`,
                estado: i % 3 === 0 ? "finalizada" : "activa",
                jugadores: jugadoresPartida
            });
        }
        await db.collection("partidas").insertMany(partidas);

        // Generar 200 eventos
        const eventos = [];
        for (let i = 0; i < 200; i++) {
            const partidaId = `p${randomInt(1, 20)}`;
            const jugadorId = `j${randomInt(1, 50)}`;
            const accion = randomFromArray(ACCIONES);
            const timestamp = new Date(Date.now() - randomInt(0, 1000000000));

            eventos.push({
                partidaId,
                jugador: jugadorId,
                accion,
                timestamp
            });
        }
        await db.collection("eventos").insertMany(eventos);

        console.log("✅ Base de datos poblada con muchos datos para testeo y gráficos.");
    } catch (err) {
        console.error("❌ Error al poblar la base de datos:", err);
    } finally {
        await client.close();
    }
}

seed();
