import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Realizamos la solicitud POST al backend para verificar el usuario y contraseña
      const response = await axios.post('http://localhost:3000/api/users/login', formData);

      if (response.data.token) {
        setMessage('Inicio de sesión exitoso');
        localStorage.setItem('token', response.data.token); // Guardamos el token en el almacenamiento local
        setError('');
        
        // Redirigir a la página principal después de un login exitoso
        navigate('/principal');
      } else {
        setError(response.data.message || 'Credenciales incorrectas');
        setMessage('');
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error de conexión');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
