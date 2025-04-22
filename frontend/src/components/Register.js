import React, { useState } from 'react';
import axios from 'axios';

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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construimos los datos para enviar exactamente lo que espera el backend
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.name,
      last_name: formData.surname
      // No hace falta enviar username ni role, el backend los gestiona
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
    <div>
      <h2>Registro de Usuario</h2>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
    </div>
  );
};

export default Register;
