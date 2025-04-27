import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Estilo from './Estilo'; // Importas tu layout general

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.name,
      last_name: formData.surname
    };

    try {
      const response = await axios.post('http://localhost:3000/api/users/register', payload);
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error de conexión');
      setMessage('');
    }
  };

  return (
    <Estilo> {/* Ahora todo tu contenido va dentro del componente Estilo */}
      <div className="form-box">
        <h2>Registro de Usuario</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="surname"
            placeholder="Apellido"
            value={formData.surname}
            onChange={handleChange}
            required
          />
          <button type="submit">Registrar</button>
        </form>

        <p className="register-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </Estilo>
  );
};

export default Register;
