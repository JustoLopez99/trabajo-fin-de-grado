// Importa el módulo 'jsonwebtoken' para verificar tokens JWT
const jwt = require('jsonwebtoken');
// Importa la base de datos configurada desde otro archivo
const db = require('../db/db');

// Middleware para autenticar un token JWT
const authenticateToken = async (req, res, next) => {
  // Obtiene el header de autorización de la petición
  const authHeader = req.headers['authorization'];
  // Extrae el token después del prefijo "Bearer "
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  // Si no se proporciona token, responde con error 401 (no autorizado)
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica y decodifica el token usando la clave secreta
    const decoded = jwt.verify(token, 'secret_key'); // Usa tu misma clave secreta

    // Consulta a la base de datos el usuario con el ID extraído del token
    const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    // Si el usuario no existe, responde con error 404
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Guarda el usuario autenticado en la solicitud para uso posterior
    req.user = user;

    // Continúa al siguiente middleware o controlador
    next();
  } catch (err) {
    // Si el token no es válido, responde con error 403 (prohibido)
    res.status(403).json({ message: 'Token inválido' });
  }
};

// Exporta el middleware para usarlo en rutas protegidas
module.exports = authenticateToken;
