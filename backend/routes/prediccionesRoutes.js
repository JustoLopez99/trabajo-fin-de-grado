// backend/routes/prediccionesRoutes.js
const express = require('express');
const router = express.Router();
const prediccionesController = require('../controllers/prediccionesController');

// Rutas
router.get('/mejor-momento', prediccionesController.getBestTimeToPost);
router.get('/formato-efectivo', prediccionesController.getMostEffectiveFormat);
router.get('/estimacion-rendimiento', prediccionesController.getPotentialPerformance);
router.get('/impacto-enlace', prediccionesController.getLinkImpact);
router.get('/tipos-post-disponibles', prediccionesController.getAvailablePostTypes);
router.get('/composicion-interacciones', prediccionesController.getInteractionComposition);
router.get('/impacto-retencion', prediccionesController.getRetentionImpact);
// --------------------

module.exports = router;