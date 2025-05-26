// models/Task.js
const client = require('../db/db.js');

const Task = {
  // FUNCIÓN para obtener tareas
  getTasksByUser: async (username) => {
    const query = `
      SELECT * FROM calendario
      WHERE username = $1
      ORDER BY fecha, hora;
    `;
    const values = [username];
    try {
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener tareas (modelo):', error);
      throw new Error('Error al obtener tareas desde la base de datos.');
    }
  },

  // FUNCIÓN para agregar tareas
  addTask: async (username, fecha, hora, titulo, descripcion, plataforma) => {
    const query = `
      INSERT INTO calendario (username, fecha, hora, titulo, descripcion, plataforma, completado)
      VALUES ($1, $2, $3, $4, $5, $6, FALSE) RETURNING *;
    `;
    const values = [username, fecha, hora, titulo, descripcion, plataforma];
    try {
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al agregar tarea (modelo):', error);
      throw new Error('Error al agregar tarea en la base de datos.');
    }
  },

  // función para actualizar el estado 'completado'.
  updateTaskCompletadoStatus: async (taskId, completado, usernameTarget) => {
    const esCompletado = Boolean(completado);
    const query = `
      UPDATE calendario
      SET completado = $1
      WHERE id = $2 AND username = $3
      RETURNING *;
    `;
    const values = [esCompletado, taskId, usernameTarget];
    try {
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        return null; // Tarea no encontrada para ese usuario o no se actualizó
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar estado de la tarea (modelo):', error);
      throw error;
    }
  }
};

module.exports = Task;