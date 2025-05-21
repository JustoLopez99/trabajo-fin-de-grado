const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); // Asegúrate que la ruta a este archivo sea correcta
const isAdmin = require('../middlewares/adminMiddleware');     // Asegúrate que la ruta a este archivo sea correcta
const {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController'); // Asegúrate que la ruta a este archivo sea correcta

// Ruta para registrar un nuevo usuario (POST /api/users/register)
// Esta ruta es relativa a donde se monta el router en server.js (que es /api/users)
// Por lo tanto, la ruta completa será POST /api/users/register
router.post('/register', registerUser);

// Ruta para iniciar sesión (POST /api/users/login)
// Ruta completa: POST /api/users/login
router.post('/login', loginUser);

// Ruta para obtener los datos del usuario autenticado (GET /api/users/me)
// Ruta completa: GET /api/users/me
router.get('/me', authenticateToken, (req, res) => {
  // El middleware authenticateToken ya ha verificado el token y añadido req.user
  const { id, username, email, first_name, last_name, role } = req.user;
  res.json({ id, username, email, first_name, last_name, role });
});

// --- RUTAS PARA GESTIÓN DE USUARIOS POR ADMIN ---
// Estas rutas estarán bajo el prefijo /api/users (definido en server.js)

// Obtener todos los usuarios (GET /api/users)
// Como el router está montado en '/api/users', una ruta '/' aquí se refiere a '/api/users'
router.get('/', authenticateToken, isAdmin, getAllUsers);

// Actualizar un usuario específico por su ID (PUT /api/users/:id)
// Una ruta '/:id' aquí se refiere a '/api/users/:id'
router.put('/:id', authenticateToken, isAdmin, updateUser);

// Eliminar un usuario específico por su ID (DELETE /api/users/:id)
// Una ruta '/:id' aquí se refiere a '/api/users/:id'
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;