// backend/routes/estadisticasRoutes.js
const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

router.get('/dashboard', estadisticasController.getDashboardStats);
// Ruta para el gráfico de resumen de interacciones
router.get('/interactions-overview', estadisticasController.getInteractionsOverviewStats);

module.exports = router;