// Importación de módulos necesarios
const bcrypt = require('bcryptjs'); // Para el hash de contraseñas
const db = require('../db/db'); // Conexión a la base de datos
const jwt = require('jsonwebtoken'); // Para generar tokens JWT

// --- FUNCIONES EXISTENTES ---

// Ruta para registrar un usuario
const registerUser = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  try {
    const existingUser = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Usuario o correo ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRole = 'client'; // Asignar rol 'client' por defecto

    const result = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, first_name, last_name, role',
      [username, email, hashedPassword, first_name, last_name, defaultRole]
    );

    res.status(201).json({
      message: 'Usuario registrado',
      user: result.rows[0]
    });

  } catch (err) {
    console.error("Error en registerUser:", err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Ruta para iniciar sesión
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // const db = req.dbClient; // Asegúrate de que db esté disponible; usualmente se importa directamente como arriba.

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, 'secret_key', { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      }
    });

  } catch (err) {
    console.error("Error en loginUser:", err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// --- NUEVAS FUNCIONES PARA GESTIÓN DE USUARIOS (ADMIN) ---

/**
 * @description Obtener todos los usuarios (solo para admin)
 * @route GET /api/users
 */
const getAllUsers = async (req, res) => {
  try {
    // El middleware isAdmin ya debería haber verificado el rol.
    // El middleware authenticateToken ya debería haber cargado req.user.
    const result = await db.query('SELECT id, username, email, first_name, last_name, role FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getAllUsers:", err);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

/**
 * @description Actualizar un usuario por su ID (solo para admin)
 * @route PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  const { id } = req.params; // ID del usuario a actualizar
  const { email, first_name, last_name, role } = req.body; // Nuevos datos

  // Validación básica de entrada
  if (!email || !first_name || !last_name || !role) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios: email, first_name, last_name, role.' });
  }
  if (!['admin', 'client'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido. Debe ser "admin" o "client".' });
  }

  try {
    // Verificar si el email ya está en uso por OTRO usuario
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso por otro usuario.' });
    }

    const result = await db.query(
      'UPDATE users SET email = $1, first_name = $2, last_name = $3, role = $4 WHERE id = $5 RETURNING id, username, email, first_name, last_name, role',
      [email, first_name, last_name, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
    }

    res.json({ message: 'Usuario actualizado correctamente.', user: result.rows[0] });
  } catch (err) {
    console.error(`Error en updateUser (ID: ${id}):`, err);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};

/**
 * @description Eliminar un usuario por su ID (solo para admin)
 * @route DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  const { id } = req.params; // ID del usuario a eliminar
  const adminUserId = req.user.id; // ID del admin que realiza la acción

  if (parseInt(id, 10) === adminUserId) {
    return res.status(403).json({ message: 'Un administrador no puede eliminarse a sí mismo desde esta función.' });
  }

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
    }

    res.json({ message: `Usuario ${result.rows[0].username} (ID: ${result.rows[0].id}) eliminado correctamente.` });
  } catch (err) {
    console.error(`Error en deleteUser (ID: ${id}):`, err);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};


// Exportar todas las funciones
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,     // Nueva función
  updateUser,      // Nueva función
  deleteUser       // Nueva función
};