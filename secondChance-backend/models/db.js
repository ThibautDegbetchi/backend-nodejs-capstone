// db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

let url = "mongodb://root:WMVYTNKQN3uvOuMUc9cNOVes@172.21.2.195:27017";

let dbInstance = null;
const dbName = "secondChance";

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance; 
    }

    try {
        // Connexion à MongoDB
        const client = new MongoClient(url);
        await client.connect(); 

        // Connexion à la base de données "secondChance"
        dbInstance = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);

        // Retourne l'instance de la base de données
        return dbInstance;
    } catch (error) {
        console.error("Failed to connect to the database", error);
        throw error; 
    }
}

module.exports = connectToDatabase;
