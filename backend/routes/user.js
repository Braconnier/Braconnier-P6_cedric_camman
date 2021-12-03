// imports
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// export
module.exports = router;