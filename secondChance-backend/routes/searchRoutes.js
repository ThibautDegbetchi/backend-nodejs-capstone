const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Route pour la recherche
router.get('/', async (req, res, next) => {
    try {
        // Se connecter à la base de données MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems"); // Assurez-vous que la collection est correcte

        // Initialiser un objet de requête vide
        let query = {};

        // Vérifier si le paramètre 'name' est présent et non vide
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" }; // Recherche insensible à la casse
        }

        // Ajouter un filtre sur la catégorie si le paramètre 'category' est présent
        if (req.query.category && req.query.category.trim() !== '') {
            query.category = req.query.category; // Filtre exact sur la catégorie
        }

        // Ajouter un filtre sur l'état si le paramètre 'condition' est présent
        if (req.query.condition && req.query.condition.trim() !== '') {
            query.condition = req.query.condition; // Filtre exact sur l'état (condition)
        }

        // Ajouter un filtre sur l'âge si le paramètre 'age_years' est présent
        if (req.query.age_years) {
            const ageYears = parseInt(req.query.age_years);
            if (!isNaN(ageYears)) {
                query.age_years = { $lte: ageYears }; // Chercher des items dont l'âge est inférieur ou égal à celui spécifié
            }
        }

        // Récupérer les éléments qui correspondent aux critères de recherche
        const items = await collection.find(query).toArray(); // Utiliser toArray() pour obtenir les résultats sous forme de tableau

        // Si aucun item trouvé, retourner un message approprié
        if (items.length === 0) {
            return res.status(404).json({ message: 'Aucun élément trouvé correspondant aux critères de recherche' });
        }

        // Retourner les items trouvés
        res.json(items);
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        next(error); // Propager l'erreur vers le middleware de gestion des erreurs
    }
});

module.exports = router;

//The solution

// const express = require('express');
// const router = express.Router();
// const connectToDatabase = require('../models/db');
// require('dotenv').config();
// // Search for gifts
// router.get('/', async (req, res, next) => {
//     try {
//         const db = await connectToDatabase();
//         const collection = db.collection(process.env.MONGO_COLLECTION);
//         // Initialize the query object
//         let query = {};
//         // Add the name filter to the query if the name parameter is not empty
//         if (req.query.name && req.query.name.trim() !== '') {
//             query.name = { $regex: req.query.name, $options: "i" }; // Using regex for partial match, case-insensitive
//         }
//         // Add other filters to the query
//         if (req.query.category) {
//             query.category = req.query.category;
//         }
//         if (req.query.condition) {
//             query.condition = req.query.condition;
//         }
//         if (req.query.age_years) {
//             query.age_years = { $lte: parseInt(req.query.age_years) };
//         }
//         const gifts = await collection.find(query).toArray();
//         res.json(gifts);
//     } catch (e) {
//         next(e);
//     }
// });
// module.exports = router;
