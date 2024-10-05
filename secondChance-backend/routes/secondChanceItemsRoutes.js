const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        // Step 2: Task 1 - Récupérer la connexion à la base de données
        const db = await connectToDatabase();

        // Step 2: Task 2 - Récupérer la collection secondChanceItems
        const collection = db.collection("secondChanceItems");

        // Step 2: Task 3 - Récupérer tous les secondChanceItems
        const secondChanceItems = await collection.find({}).toArray();

        // Step 2: Task 4 - Retourner les éléments sous forme de JSON
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('Oops, something went wrong', e);
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        // Task 1: Connect to the MongoDB database
        const db = await connectToDatabase();

        // Task 2: Retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Create a new secondChanceItem from the request body
        let secondChanceItem = req.body;

        // Task 4: Get the last id, increment it by 1, and set it to the new secondChanceItem
        const lastItemQuery = await collection.find().sort({ 'id': -1 }).limit(1);
        await lastItemQuery.forEach(item => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });

        // Task 5: Set the current date in the new item
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added;

        // Add other relevant fields to the item
        secondChanceItem.image = req.file ? `/images/${req.file.filename}` : null;
        secondChanceItem.comments = [];

        // Task 6: Add the secondChanceItem to the database
        const result = await collection.insertOne(secondChanceItem);

        // Task 7: Upload its image to the images directory
        // (This is already done by multer's upload.single middleware)

        // Return the newly added item
        res.status(201).json(result);
    } catch (e) {
        logger.error('Error occurred while adding item', e);
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res) => {
    try {
        // Task 1: Retrieve the database connection
        const db = await connectToDatabase();
        
        // Task 2: Retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        
        // Task 3: Find a specific secondChanceItem by ID
        const id = req.params.id; // Get ID from request parameters
        const secondChanceItem = await collection.findOne({ id: id });

        // Task 4: Return the secondChanceItem or an error message
        if (!secondChanceItem) {
            return res.status(404).send("secondChanceItem not found");
        }
        res.json(secondChanceItem);
    } catch (error) {
        console.error("Error fetching secondChanceItem:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Update an existing item
router.put('/:id', async (req, res) => {
    const id = req.params.id; // Get the ID from request parameters
    try {
        // Task 1: Retrieve the database connection
        const db = await connectToDatabase();
        
        // Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        
        // Task 3: Check if the secondChanceItem exists
        let secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            console.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }
        //console.log(JSON.stringify(secondChanceItem));
        // Task 4: Update the item's attributes
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        // Perform the update in the database
        const updateResult = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        // Task 5: Send confirmation
        if (updateResult) {
            res.json({ "uploaded": "success" });
        } else {
            res.json({ "uploaded": "failed" });
        }
    } catch (error) {
        console.error("Error updating secondChanceItem:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete an existing item
router.delete('/:id', async (req, res) => {
    const id = req.params.id; // Get the ID from request parameters

    try {
        // Task 1: Retrieve the database connection
        const db = await connectToDatabase();
        
        // Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        
        // Task 3: Find a specific secondChanceItem by ID
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            console.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // Task 4: Delete the object
        await collection.deleteOne({ id });
        res.json({ "deleted": "success" });
    } catch (error) {
        console.error("Error deleting secondChanceItem:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
