// Importa el modelo de tarea que contiene las funciones para interactuar con la base de datos
const Task = require('../models/Task');

// Obtener tareas de un usuario para un mes específico
const getTasksForMonth = async (req, res) => {
  const { username } = req.query; // Obtenemos el parámetro 'username' desde la query de la URL

  // Si no se proporciona el 'username', devolvemos un error 400 indicando que faltan parámetros
  if (!username) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    // Llamamos al modelo para obtener las tareas asociadas a ese 'username'
    const tasks = await Task.getTasksByUser(username);
    // Enviamos las tareas obtenidas en formato JSON como respuesta
    return res.json(tasks);
  } catch (error) {
    // En caso de error, mostramos el error en consola y devolvemos un error 500 al cliente
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({ error: 'Error al obtener las tareas' });
  }
};

// Agregar una nueva tarea
const addTask = async (req, res) => {
  // Desestructuramos los parámetros del cuerpo de la solicitud (req.body)
  const { username, fecha, hora, titulo, descripcion, plataforma } = req.body;

  // Comprobamos si falta algún parámetro esencial para crear la tarea. Si falta alguno, devolvemos un error 400.
  if (!username || !fecha || !hora || !titulo || !descripcion || !plataforma) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    // Llamamos al modelo para agregar una nueva tarea a la base de datos
    const newTask = await Task.addTask(username, fecha, hora, titulo, descripcion, plataforma);
    // Enviamos la tarea recién creada en formato JSON como respuesta con un código de estado 201 (creado)
    return res.status(201).json(newTask);
  } catch (error) {
    // Si ocurre un error al agregar la tarea, mostramos el error en consola y devolvemos un error 500 al cliente
    console.error('Error al agregar tarea:', error);
    return res.status(500).json({ error: 'Error al agregar tarea' });
  }
};

// Exportamos las funciones para que puedan ser utilizadas en otros archivos (por ejemplo, en el router)
module.exports = {
  getTasksForMonth,
  addTask
};
