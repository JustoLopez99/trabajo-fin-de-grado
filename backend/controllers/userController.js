const bcrypt = require('bcryptjs');
const db = require('../db/db');
const jwt = require('jsonwebtoken');

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

    const result = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',  
      [username, email, hashedPassword, first_name, last_name] // Añade username
    );

    res.status(201).json({
      message: 'Usuario registrado',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};



// Ruta para iniciar sesión
const loginUser = async (req, res) => {
  const { email, password } = req.body; 
  const db = req.dbClient;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]); // Buscar por email
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });

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
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

module.exports = { registerUser, loginUser };
