// Importación de módulos necesarios
const bcrypt = require('bcryptjs'); // Para el hash de contraseñas
const db = require('../db/db'); // Conexión a la base de datos
const jwt = require('jsonwebtoken'); // Para generar tokens JWT

// Ruta para registrar un usuario
const registerUser = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body; // Datos enviados por el cliente

  try {
    // Verificar si ya existe un usuario con ese username o email
    const existingUser = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2', 
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      // Si ya existe, retornar error
      return res.status(400).json({ message: 'Usuario o correo ya registrado' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario en la base de datos
    const result = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',  
      [username, email, hashedPassword, first_name, last_name]
    );

    // Responder con el nuevo usuario creado
    res.status(201).json({
      message: 'Usuario registrado',
      user: result.rows[0]
    });

  } catch (err) {
    // Manejo de errores del servidor
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Ruta para iniciar sesión
const loginUser = async (req, res) => {
  const { email, password } = req.body; 
  const db = req.dbClient; // Obtener cliente de base de datos desde la solicitud

  try {
    // Buscar usuario por email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      // Si no se encuentra el usuario, retornar error
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Si no coinciden, retornar error
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT para autenticación
    const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });

    // Responder con el token y los datos del usuario
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,  
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      }
    });

  } catch (err) {
    // Manejo de errores del servidor
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Exportar las funciones para que puedan ser usadas en otros archivos
module.exports = { registerUser, loginUser };
