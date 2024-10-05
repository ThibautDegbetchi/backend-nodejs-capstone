// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };

    const client = new MongoClient(url);      

   // Task 1: Connect to MongoDB
   await client.connect();  // Connexion au serveur MongoDB
   console.log('Successfully connected to MongoDB');

   // Task 2: Connect to database giftDB and store in variable dbInstance
   dbInstance = client.db(dbName);  // Connexion à la base de données spécifiée
   console.log(`Connected to database: ${dbName}`);

   // Task 3: Return database instance
   return dbInstance;
}

module.exports = connectToDatabase;
