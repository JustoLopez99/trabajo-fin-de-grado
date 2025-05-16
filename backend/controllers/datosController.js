// controllers/datosController.js
const db = require('../db/db');

// Obtener publicaciones con paginación
exports.getPublicaciones = async (req, res) => {
  const { username, page = 1, limit = 10 } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  try {
    // Query para obtener los datos paginados
    const publicacionesResult = await db.query(
      `SELECT id, tipo_post, titulo, fecha_publicacion, hora_publicacion, 
              impresiones, me_gusta, comentarios, compartidos, interacciones_total, 
              clics_enlaces, contiene_enlace, tiempo_retencion, engagement_rate, 
              formato_contenido, notas
       FROM publicaciones 
       WHERE username = $1 
       ORDER BY fecha_publicacion DESC, hora_publicacion DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [username, limitNum, offset]
    );

    // Query para obtener el total de publicaciones para ese usuario
    const totalResult = await db.query(
      'SELECT COUNT(*) FROM publicaciones WHERE username = $1',
      [username]
    );
    const totalItems = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      message: 'Publicaciones obtenidas correctamente',
      data: publicacionesResult.rows,
      totalPages: totalPages,
      currentPage: pageNum,
      totalItems: totalItems,
    });
  } catch (error) {
    console.error('Error al obtener las publicaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener publicaciones.', error: error.message });
  }
};

// Añadir una nueva publicación
exports.addPublicacion = async (req, res) => {
  const {
    username, // Asegúrate que username viene del frontend (en tu caso, lo añades en el objeto nuevaPublicacion)
    tipo_post,
    titulo,
    fecha_publicacion,
    hora_publicacion,
    impresiones,
    me_gusta = 0, // Default si no se provee
    comentarios = 0,
    compartidos = 0,
    clics_enlaces = 0,
    contiene_enlace = false,
    tiempo_retencion, // Puede ser null
    formato_contenido,
    notas,
  } = req.body;

  // Validaciones básicas (puedes añadir más)
  if (!username || !tipo_post || !fecha_publicacion || !hora_publicacion || impresiones === undefined) {
    return res.status(400).json({ message: 'Faltan campos requeridos.' });
  }
  if (isNaN(parseInt(impresiones, 10)) || parseInt(impresiones, 10) < 0) {
    return res.status(400).json({ message: 'Impresiones debe ser un número no negativo.' });
  }
  // Las columnas `interacciones_total` y `engagement_rate` son generadas por la BD.

  try {
    const queryText = `
      INSERT INTO publicaciones (
        username, tipo_post, titulo, fecha_publicacion, hora_publicacion,
        impresiones, me_gusta, comentarios, compartidos, clics_enlaces,
        contiene_enlace, tiempo_retencion, formato_contenido, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *; 
    `; // RETURNING * devuelve la fila insertada

    const values = [
      username,
      tipo_post,
      titulo || null, // Permite que titulo sea opcional
      fecha_publicacion,
      hora_publicacion,
      parseInt(impresiones, 10),
      parseInt(me_gusta, 10) || 0,
      parseInt(comentarios, 10) || 0,
      parseInt(compartidos, 10) || 0,
      parseInt(clics_enlaces, 10) || 0,
      Boolean(contiene_enlace),
      tiempo_retencion ? parseFloat(tiempo_retencion) : null,
      formato_contenido || null,
      notas || null,
    ];

    const result = await db.query(queryText, values);
    res.status(201).json({
      message: 'Publicación añadida correctamente.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al añadir la publicación:', error);
    if (error.constraint) { // Errores de constraint de la BD (ej. CHECK)
        return res.status(400).json({ message: `Error de base de datos: ${error.detail || error.message}`});
    }
    res.status(500).json({ message: 'Error interno del servidor al añadir publicación.', error: error.message });
  }
};