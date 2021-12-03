const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const privateKey = process.env.PRIVATE_TOKEN_STRING;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, privateKey);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Id utilisateur non valide';
        } else {
            next();
        }

    } catch (error) {
        res.status(401).json({ error: error | 'Reqête non authentifiée'})
    }
}