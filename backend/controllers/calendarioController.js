// controllers/calendarioController.js
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// FUNCIÓN para obtener el username del token (esta la tenías, puede ser útil o no dependiendo de si usas getAuthDetailsFromToken siempre)
const getUsernameFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // IMPORTANTE: Cambiamos el secreto aquí también para que sea consistente si esta función se usa.
      const decoded = jwt.verify(token, 'secret_key');
      return decoded.username;
    } catch (err) {
      console.error("Error decodificando token (getUsernameFromToken):", err.message);
      return null;
    }
  }
  return null;
};

// Función auxiliar para obtener ROL y USERNAME (necesario para la lógica de admin)
const getAuthDetailsFromToken = (req) => {
  const authHeader = req.headers.authorization;
  // Mantenemos los logs de debug que te pedí, son útiles
  console.log('[DEBUG] getAuthDetailsFromToken - authHeader:', authHeader);

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('[DEBUG] getAuthDetailsFromToken - Token extraído:', token);

    try {
      // === CAMBIO PRINCIPAL AQUÍ ===
      // Usamos 'secret_key' para que coincida con el secreto de firma en tu loginUser
      const decoded = jwt.verify(token, 'secret_key');
      console.log('[DEBUG] getAuthDetailsFromToken - Token decodificado:', decoded);

      // Verificamos que los campos necesarios estén en el token decodificado
      if (decoded && decoded.username && decoded.role) {
        return { username: decoded.username, role: decoded.role };
      } else {
        console.error('[DEBUG] getAuthDetailsFromToken - Falta username o role en el token decodificado. Payload del token:', decoded);
        return null;
      }
    } catch (err) {
      // Esto capturará errores como token expirado, malformado, etc., además de 'invalid signature' si el secreto aún no coincidiera.
      console.error('[DEBUG] getAuthDetailsFromToken - Error al verificar token:', err.name, '-', err.message);
      return null;
    }
  } else {
    console.log('[DEBUG] getAuthDetailsFromToken - No hay cabecera Authorization o no es de tipo Bearer.');
    return null;
  }
};

// FUNCIÓN para obtener tareas
const getTasksForMonth = async (req, res) => {
  // Podríamos usar getAuthDetailsFromToken aquí si queremos asegurar que el usuario está autenticado
  // y obtener su rol, incluso para leer tareas. Por ahora, mantenemos tu lógica original que
  // depende del 'username' en query params, asumiendo que Principal.js envía el correcto.
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Faltan parámetros: username' });
  }
  try {
    const tasks = await Task.getTasksByUser(username);
    return res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas (controlador getTasksForMonth):', error.message);
    return res.status(500).json({ error: 'Error al obtener las tareas' });
  }
};

// FUNCIÓN para agregar tareas
const addTask = async (req, res) => {
  // Similar a getTasksForMonth, podríamos añadir una capa de autenticación aquí.
  // Por ahora, se asume que el 'username' en el body es el que se debe usar.
  const { username, fecha, hora, titulo, descripcion, plataforma } = req.body;
  if (!username || !fecha || !hora || !titulo ) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  try {
    const newTask = await Task.addTask(username, fecha, hora, titulo, descripcion, plataforma);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error al agregar tarea (controlador addTask):', error.message);
    return res.status(500).json({ error: 'Error al agregar tarea' });
  }
};

// FUNCIÓN para actualizar el estado 'completado' de una tarea
const updateTaskEstado = async (req, res) => {
  console.log('--- Controlador: updateTaskEstado ---');
  const authDetails = getAuthDetailsFromToken(req); // Obtiene { username, role } usando 'secret_key'

  if (!authDetails || !authDetails.username || !authDetails.role) {
    // Si authDetails es null, o no tiene username o role, el token no fue válido o no contenía la info necesaria.
    // getAuthDetailsFromToken ya habrá logueado la razón específica del fallo (invalid signature, missing fields, etc.)
    return res.status(401).json({ error: "No autorizado o token inválido/incompleto." });
  }

  const authenticatedUsername = authDetails.username;
  const authenticatedUserRole = authDetails.role;

  const { id: taskId } = req.params;
  const { completado, taskOwnerUsername } = req.body;

  console.log(`Controlador updateTaskEstado: taskId=${taskId}, completado=${completado}, authUser=${authenticatedUsername} (Rol=${authenticatedUserRole}), taskOwner=${taskOwnerUsername}`);

  if (typeof completado === 'undefined') {
    return res.status(400).json({ error: "Falta el parámetro 'completado' en el cuerpo." });
  }
  if (!taskId) {
    return res.status(400).json({ error: "Falta el ID de la tarea en la URL." });
  }

  let usernameParaActualizar;

  if (authenticatedUserRole === 'admin') {
    if (!taskOwnerUsername) {
      return res.status(400).json({ error: "Como admin, 'taskOwnerUsername' es requerido en el body para especificar el dueño de la tarea." });
    }
    usernameParaActualizar = taskOwnerUsername;
    console.log(`Admin (${authenticatedUsername}) está actualizando tarea de ${usernameParaActualizar}`);
  } else {
    usernameParaActualizar = authenticatedUsername;
    if (taskOwnerUsername && taskOwnerUsername !== authenticatedUsername) {
      console.warn(`Usuario ${authenticatedUsername} intentó actualizar tarea para ${taskOwnerUsername}. Se forzará la actualización para el usuario autenticado.`);
    }
    console.log(`Usuario (${authenticatedUsername}) está actualizando su propia tarea.`);
  }

  try {
    const updatedTask = await Task.updateTaskCompletadoStatus(taskId, completado, usernameParaActualizar);
    if (!updatedTask) {
      return res.status(404).json({ error: `Tarea con ID ${taskId} no encontrada para el usuario ${usernameParaActualizar} o no se pudo actualizar.` });
    }
    return res.json(updatedTask);
  } catch (error) {
    console.error('Error al actualizar estado de la tarea (controlador catch updateTaskEstado):', error.message);
    return res.status(500).json({ error: 'Error interno al actualizar estado de la tarea.' });
  }
};

module.exports = {
  getTasksForMonth,
  addTask,
  updateTaskEstado
};