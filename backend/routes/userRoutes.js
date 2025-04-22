const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// Ruta para registrar un usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

module.exports = router;
