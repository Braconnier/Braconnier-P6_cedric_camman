// imports
const express = require('express'); // Necessite express
require('dotenv').config(); // necessite des informations du fichier .env : https://github.com/motdotla/dotenv#readme
const helmet = require('helmet'); // securisation des headers HTTP : https://helmetjs.github.io/
const mongoSanitize = require('express-mongo-sanitize'); // 'nettoyage' des requêtes; supprime les '$' et les '.' des requêtes: https://github.com/fiznool/express-mongo-sanitize#readme
const path = require('path');
const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// Accès à la base données
const mongoose = require('mongoose');

// Récuperation des infos de connection à la base de données
const DB_CONNECT = process.env.DB_CONNECT;

//  Création de l'app
const app = express();


//  Connection à mongoDb 
mongoose.connect(DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// parametrage des headers pour le CORS (Cross-Origin Ressource Sharing)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// middlewares globaux
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

// midlewares des routes
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

// export de l'app vers le serveur
module.exports = app;