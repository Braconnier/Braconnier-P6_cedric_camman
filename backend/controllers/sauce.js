const Sauce = require('../models/Sauce');
const fs = require('fs');

// créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        userId: req.body.userId,
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce créee avec succés' }))
        .catch(error => res.status(400).json({ error }))
};

// récuperation de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};

// récuperation d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
};

// modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceId = req.params.id;
    Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            // récuperation de l'URL de l'ancienne image
            oldSauceImageUrl = sauce.imageUrl;

            // si changement de l'image
            const sauceObject = req.file ?
                {
                    ...JSON.parse(req.body.sauce),
                    // source de la nouvelle image
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body };

            Sauce.updateOne({ _id: sauceId }, { ...sauceObject, _id: sauceId })
                .then(sauce => res.status(200).json(sauce))
                .catch(() => res.status(403).json({ message: 'Unahthorized request' }))

            // suppression de l'ancienne image
            const filename = oldSauceImageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => { res.end })
        })
        .catch(() => res.status(500).json({ message: 'erreur lors de la modification du post' }))
};

// suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée avec succés' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error }))
};


exports.likeSauce = (req, res, next) => {
    let like = req.body.like;
    let userId = req.body.userId;
    let sauceId = req.params.id;
    switch (like) {
        // Si l'utilisateur aime le produit :
        case 1:
            Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 } })
                .then(() => res.status(200).json({ message: 'evaluation complétée: like' }))
                .catch((error) => res.status(400).json({ error }))
            break;
        // Si l'utilisateur a enlever son like ou dislike :
        case 0:
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    if (sauce.usersLiked.includes(userId)) {
                        Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
                            .then(() => res.status(200).json({ message: 'evaluation complétée: neutral' }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                    if (sauce.usersDisliked.includes(userId)) {
                        Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
                            .then(() => res.status(200).json({ message: 'evaluation complétée: neutral' }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                })
                .catch((error) => res.status(404).json({ error }))
            break;
        // Si l'utilisateur n'aime pas le produit :
        case -1:
            Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } })
                .then(() => { res.status(200).json({ message: 'evaluation complétée: dislike' }) })
                .catch((error) => res.status(400).json({ error }))
            break;

        default: console.log(error);
    }
};