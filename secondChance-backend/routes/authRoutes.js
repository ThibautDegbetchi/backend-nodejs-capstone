const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db'); // Assurez-vous que connectToDatabase est bien défini dans db.js
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Assurez-vous d'avoir un logger défini
const JWT_SECRET = process.env.JWT_SECRET; // Le secret JWT doit être défini dans vos variables d'environnement

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();

        // Task 2: Access the users collection
        const collection = db.collection("users");

        // Task 3: Check if user credentials already exist in the database and throw an error if they do
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Task 5: Insert the user into the database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId, // Utilisation de l'id généré pour l'utilisateur
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Expiration du token en 1 heure

        // Task 7: Log the successful registration using the logger
        logger.info('User registered successfully');

        // Task 8: Return the user email and the token as a JSON response
        res.json({ email: req.body.email, authtoken });

    } catch (e) {
        logger.error('Error during user registration', e);
        return res.status(500).send('Internal server error');
    }
});

router.put('/update', [
    // Task 1: Use the body for input validation
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'), // Add more validations as needed
], async (req, res) => {
    try {
        // Task 2: Validate the input using validationResult
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Validation errors in update request', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        // Task 3: Check if email is present in the header
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: Find the user credentials in the database
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user credentials
        existingUser.updatedAt = new Date();
        existingUser.firstName = req.body.firstName || existingUser.firstName; // Update other fields similarly
        existingUser.lastName = req.body.lastName || existingUser.lastName; // Assuming you're updating lastName too

        // Task 6: Update user credentials in the database
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        // Task 7: Create JWT authentication with user._id as a payload
        const payload = {
            user: {
                id: updatedUser.value._id.toString(),
            },
        };
        const JWT_SECRET = process.env.JWT_SECRET; // Make sure this is set in your .env file
        const authtoken = jwt.sign(payload, JWT_SECRET);

        res.json({ authtoken });
    } catch (e) {
        logger.error(e.message);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
