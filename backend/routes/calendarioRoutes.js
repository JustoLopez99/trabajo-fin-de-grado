const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');

// Ruta para obtener las tareas de un usuario para un mes y año específicos
router.get('/tasks', calendarioController.getTasksForMonth);

// Ruta para agregar una nueva tarea
router.post('/tasks', calendarioController.addTask);

module.exports = router;