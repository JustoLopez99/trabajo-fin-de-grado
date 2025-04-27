// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Estilo from './Estilo';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/principal');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <Estilo>
      <div className="form-box">
        <h2>Iniciar Sesión</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
          <button type="submit">Iniciar sesión</button>
        </form>
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </Estilo>
  );
};

export default Login;
