"use strict";

const app = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDatabase();
        const server = app.listen(PORT, () => {
            console.log("Servidor corriendo en el puerto " + PORT);
            console.log("localhost: http://localhost:" + PORT + "/api/health");
            console.log("=========================================");
        });

        let isShuttingDown = false;
        async function shutdown(signal) {
            if (isShuttingDown) return;
            isShuttingDown = true;
            console.log(`\nSe recibió ${signal}. Cerrando servidor...`);
            server.close(async () => {
                try {
                    await disconnectDatabase();
                    console.log("Servidor y conexión con MongoDB cerrados correctamente.");
                    process.exit(0);
                } catch {
                    console.error("No se pudo cerrar la conexión con MongoDB.");
                    process.exit(1);
                }
            });
        }

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch {
        console.error("No se pudo iniciar el servidor. Revisa la configuración de MongoDB.");
        process.exit(1);
    }
}


startServer();
