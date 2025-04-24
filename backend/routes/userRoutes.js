// Importa Express para definir rutas
const express = require('express');
const router = express.Router(); // Crea una instancia de enrutador
const authenticateToken = require('../middlewares/authMiddleware');

// Importa los controladores de usuario
const { registerUser, loginUser } = require('../controllers/userController');

// Ruta POST para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta POST para iniciar sesión
router.post('/login', loginUser);

// Ruta protegida para obtener info del usuario
router.get('/me', authenticateToken, (req, res) => {
    const { id, username, email, first_name, last_name, role } = req.user;
    res.json({ id, username, email, first_name, last_name, role });
  });

// Exporta el enrutador para integrarlo en la app principal
module.exports = router;
