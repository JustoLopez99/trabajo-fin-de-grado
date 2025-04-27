// Importa Express para definir rutas
const express = require('express');
const router = express.Router(); // Crea una instancia de enrutador

// Importa el middleware de autenticación para proteger rutas privadas
const authenticateToken = require('../middlewares/authMiddleware');

// Importa los controladores de usuario
const { registerUser, loginUser } = require('../controllers/userController');

// Ruta POST para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta POST para iniciar sesión
router.post('/login', loginUser);

// Ruta GET protegida para obtener información del usuario autenticado
// Utiliza el middleware 'authenticateToken' para validar el token JWT
router.get('/me', authenticateToken, (req, res) => {
  // Extrae los datos del usuario desde la request (agregado por el middleware)
  const { id, username, email, first_name, last_name, role } = req.user;

  // Devuelve los datos del usuario autenticado en formato JSON
  res.json({ id, username, email, first_name, last_name, role });
});

// Exporta el enrutador para integrarlo en la app principal
module.exports = router;
