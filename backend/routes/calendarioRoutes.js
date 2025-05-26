// calendarioroutes.js
const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');

// Ruta para obtener las tareas de un usuario
// Principal.js llama a GET /api/tasks?username=...&year=...&month=...
router.get('/tasks', calendarioController.getTasksForMonth);

// Ruta para agregar una nueva tarea
router.post('/tasks', calendarioController.addTask);

// Ruta para actualizar el estado 'completado' de una tarea
// Principal.js llama a PATCH /api/tasks/:id/estado
router.patch('/tasks/:id/estado', calendarioController.updateTaskEstado);

module.exports = router;