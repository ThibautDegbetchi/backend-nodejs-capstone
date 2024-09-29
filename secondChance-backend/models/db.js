// db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance; // Retourner l'instance si elle existe déjà
    }

    try {
        // Task 1: Connect to MongoDB
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect(); // Connexion au client MongoDB

        // Task 2: Connecter à la base de données secondChance et stocker dans dbInstance
        dbInstance = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);

        // Task 3: Retourner l'instance de la base de données
        return dbInstance;
    } catch (error) {
        console.error("Failed to connect to the database", error);
        throw error; // Propager l'erreur en cas d'échec
    }
}

module.exports = connectToDatabase;
