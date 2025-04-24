// Importa Express para definir rutas
const express = require('express');
const router = express.Router(); // Crea una instancia de enrutador

// Importa los controladores de usuario
const { registerUser, loginUser } = require('../controllers/userController');

// Ruta POST para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta POST para iniciar sesión
router.post('/login', loginUser);

// Exporta el enrutador para integrarlo en la app principal
module.exports = router;
