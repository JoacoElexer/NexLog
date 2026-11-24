"use strict";
const dns = require("node:dns");
const mongoose = require("mongoose");

async function connectDatabase() {
    const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (dnsServers.length > 0) {
        dns.setServers(dnsServers);
    }

    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("Falta la variable MONGO_URI en el archivo .env");
    }

    await mongoose.connect(uri);
    console.log(`MongoDB conectado a la base: ${mongoose.connection.name}`);
}

async function disconnectDatabase() {
    await mongoose.disconnect();
    console.log("MongoDB desconectado");
}


module.exports = {
    connectDatabase,
    disconnectDatabase
}
