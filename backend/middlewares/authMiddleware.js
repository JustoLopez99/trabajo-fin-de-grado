const jwt = require('jsonwebtoken');
const db = require('../db/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key'); // Usa tu misma clave secreta
    const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    req.user = user; // Guarda el usuario en la request
    next(); // Continúa al siguiente middleware/controlador
  } catch (err) {
    res.status(403).json({ message: 'Token inválido' });
  }
};

module.exports = authenticateToken;
