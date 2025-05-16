// Importa el cliente de la conexión de PostgreSQL desde db.js
const client = require('../db/db');

// Modelo de la tarea
const Task = {
  // Obtener todas las tareas de un usuario (sin filtrar por fecha)
  getTasksByUser: async (username) => {
    // Consulta SQL para obtener las tareas del usuario, ordenadas por fecha y hora
    const query = `
      SELECT * FROM calendario 
      WHERE username = $1
      ORDER BY fecha, hora;
    `;
    // Parámetro para la consulta, el nombre de usuario
    const values = [username];
    
    try {
      // Ejecuta la consulta usando el cliente de PostgreSQL
      const result = await client.query(query, values); 
      // Retorna las filas obtenidas en la consulta
      return result.rows;  
    } catch (error) {
      // Si ocurre un error, lo captura y lo muestra
      console.error('Error al obtener tareas:', error);
      throw new Error('Error al obtener tareas');
    }
  },

  // Agregar una nueva tarea
  addTask: async (username, fecha, hora, titulo, descripcion, plataforma) => {
    // Consulta SQL para insertar una nueva tarea
    const query = `
      INSERT INTO calendario (username, fecha, hora, titulo, descripcion, plataforma) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    // Parámetros para la consulta, con los datos de la nueva tarea
    const values = [username, fecha, hora, titulo, descripcion, plataforma];
    
    try {
      // Ejecuta la consulta usando el cliente de PostgreSQL
      const result = await client.query(query, values); 
      // Retorna la tarea recién insertada
      return result.rows[0]; 
    } catch (error) {
      // Si ocurre un error, lo captura y lo muestra
      console.error('Error al agregar tarea:', error);
      throw new Error('Error al agregar tarea');
    }
  }
};

// Exporta el modelo para que se pueda usar en otros archivos
module.exports = Task;
