// imports
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const privateKey = process.env.PRIVATE_TOKEN_STRING;

// export de la fonction d'inscription
exports.signup = (req, res, next) => {
    // cryptage 10 'salts' du mot de passe
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // enregistrement en db de l'email et du MdP crypté
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créee avec succés' }))
                .catch(() => res.status(400).json({ message: 'Utilisateur déjà existant' }));
        })
        .catch(error => res.status(500).json({ error }))
};

// export de la fonction de connection d'utilisateur
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id }, privateKey, { expiresIn: '24h' })
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }));
};