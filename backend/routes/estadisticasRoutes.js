// backend/routes/estadisticasRoutes.js
const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
// const { verifyToken } = require('../middleware/authMiddleware'); // Si usas autenticación

router.get('/dashboard', estadisticasController.getDashboardStats);
// Nueva ruta para el gráfico de resumen de interacciones
router.get('/interactions-overview', estadisticasController.getInteractionsOverviewStats);

module.exports = router;