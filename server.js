const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { JugadorModel, PartidaModel, EventoModel } = require("./models"); // Importando modelos
const reportesRouter = require("./reportes");

const app = express();
const PORT = 3000;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Middleware
app.use(cors());

let db;

// Conexión y enrutado con validación mejorada
client.connect().then(() => {
    db = client.db("juego_online");

    if (!db) {
        console.error("❌ No se pudo conectar a MongoDB");
        process.exit(1);
    }

    console.log("✅ Conectado a MongoDB");

    // Middleware para inyectar la DB en cada request
    app.use((req, res, next) => {
        req.db = db;
        req.models = { JugadorModel, PartidaModel, EventoModel }; // Inyectar modelos en las solicitudes
        next();
    });

    // Usar las rutas después de la configuración de DB
    app.use("/api", reportesRouter);

    // Iniciar servidor
    app.listen(PORT, () =>
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    );
}).catch(err => {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
});