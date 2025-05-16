// routes/datosRoutes.js
const express = require('express');
const router = express.Router();
const datosController = require('../controllers/datosController');

// Ruta para obtener todas las publicaciones de un usuario (con paginación)
// GET /api/publicaciones?username=xxx&page=1&limit=10
router.get('/publicaciones', datosController.getPublicaciones);

// Ruta para añadir una nueva publicación
// POST /api/publicaciones
router.post('/publicaciones', datosController.addPublicacion);

module.exports = router;