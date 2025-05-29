const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const reportesRouter = require("./reportes");

const app = express();
const PORT = 3000;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Middleware
app.use(cors());

let db;

// Conexión y enrutado
client.connect().then(() => {
    db = client.db("juego_online");
    console.log("✅ Conectado a MongoDB");

    // Middleware para inyectar la DB en cada request
    app.use((req, res, next) => {
        req.db = db;
        next();
    });

    // Usar las rutas unificadas
    app.use("/", reportesRouter);

    // Iniciar servidor
    app.listen(PORT, () =>
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    );
}).catch(err => {
    console.error("❌ Error conectando a MongoDB:", err);
});
