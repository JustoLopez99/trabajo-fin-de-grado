import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Register.css'; // Importa los estilos personalizados del componente Register

const Register = () => {
  // Estado que almacena los datos del formulario de registro
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: ''
  });

  // Estado para almacenar errores y mensajes
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target; // Extrae nombre y valor del campo
    setFormData({ ...formData, [name]: value }); // Actualiza solo el campo correspondiente
  };

  // Envía los datos del formulario al backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Crea el objeto con los datos del formulario para enviarlos
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.name,
      last_name: formData.surname
    };

    try {
      // Realiza la solicitud POST al servidor con los datos del formulario
      const response = await axios.post('http://localhost:3000/api/users/register', payload);
      setMessage(response.data.message); // Muestra el mensaje de éxito
      setError(''); // Limpia posibles errores
    } catch (err) {
      // Maneja los errores, mostrando un mensaje adecuado
      setError(err.response ? err.response.data.message : 'Error de conexión');
      setMessage(''); // Limpia cualquier mensaje previo
    }
  };

  return (
    <div className="register-page">
      {/* Parte superior: banner con logo y nombre de la app */}
      <div className="top-banner">
        <img src="/Logo.png" alt="Logo" className="logo-img" /> {/* Logo */}
        <h1 className="app-name">STRACKWAVE</h1> {/* Nombre de la app */}
      </div>

      {/* Parte media: formulario de registro */}
      <div className="middle-section">
        <img src="/fondo.png" alt="Fondo" className="background-img" /> {/* Imagen de fondo */}
        <div className="register-form-box">
          <h2>Registro de Usuario</h2> {/* Título del formulario */}
          {/* Mostrar mensajes de éxito o error */}
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          {/* Formulario de registro */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange} // Llama a handleChange para actualizar el estado
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange} // Llama a handleChange para actualizar el estado
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange} // Llama a handleChange para actualizar el estado
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={formData.name}
              onChange={handleChange} // Llama a handleChange para actualizar el estado
              required
            />
            <input
              type="text"
              name="surname"
              placeholder="Apellido"
              value={formData.surname}
              onChange={handleChange} // Llama a handleChange para actualizar el estado
              required
            />
            <button type="submit">Registrar</button> {/* Botón para enviar el formulario */}
          </form>

          {/* Enlace para redirigir a la página de login */}
          <p className="register-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>

      {/* Parte inferior: carrusel e información de contacto */}
      <div className="bottom-section">
        <div className="carousel-section">
          <img src="/imagen1.jpg" alt="Imagen 1" className="carousel-img" /> {/* Imagen en el carrusel */}
        </div>
        <div className="contact-section">
          <h3>Contacto</h3>
          {/* Información de contacto */}
          <p>📞 Teléfono: +123 456 7890</p>
          <p>📬 Correo: contacto@strackwave.com</p>
          <p>📍 Dirección: Sevilla, España</p>
        </div>
      </div>
    </div>
  );
};

export default Register; // Exporta el componente Register para ser usado en otras partes de la app
