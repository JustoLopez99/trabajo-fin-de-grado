import React, { useState, useEffect } from 'react'; // Hook para manejar el estado y efectos
import axios from 'axios'; // Cliente HTTP para hacer peticiones al backend
import { useNavigate, Link } from 'react-router-dom'; // Navegación y enlaces
import './login.css'; // Estilos personalizados del componente Login

const Login = () => {
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState(''); // Estado para almacenar errores
  const [message, setMessage] = useState(''); // Estado para almacenar mensajes de éxito
  const navigate = useNavigate(); // Hook para la navegación

  //  Estado y lógica para el carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice de la imagen actual
  const images = [
    "/icons/imagen1.jpg",
    "/icons/imagen2.jpg",
    "/icons/imagen3.jpg",
    "/icons/imagen4.jpg"
  ];

  //  Cambia la imagen automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext(); // Usa la misma lógica de la flecha derecha
    }, 3000);

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  //  Función para ir a la imagen anterior
  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  //  Función para ir a la imagen siguiente
  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Función que maneja los cambios en los campos de entrada
  const handleChange = (e) => {
    const { name, value } = e.target; // Obtiene el nombre y el valor del campo
    setFormData({
      ...formData, // Mantiene los valores anteriores
      [name]: value // Actualiza solo el campo que cambió
    });
  };

  // Función para enviar los datos del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto (recarga de la página)

    try {
      // Realiza la petición POST al backend con los datos del formulario
      const response = await axios.post('http://localhost:3000/api/users/login', formData);

      if (response.data.token) {
        setMessage('Inicio de sesión exitoso'); // Muestra mensaje de éxito si hay un token
        localStorage.setItem('token', response.data.token); // Almacena el token en el localStorage
        setError(''); // Limpia cualquier error previo
        navigate('/principal'); // Redirige a la página principal
      } else {
        // Si no se obtiene un token, muestra un mensaje de error
        setError(response.data.message || 'Credenciales incorrectas');
        setMessage(''); // Limpia cualquier mensaje previo
      }
    } catch (err) {
      // Maneja errores de conexión o cualquier otro tipo de error
      setError(err.response ? err.response.data.message : 'Error de conexión');
      setMessage(''); // Limpia cualquier mensaje previo
    }
  };

  return (
    <div className="login-page">
      <div className="top-banner">
        <img src="/icons/Logo.png" alt="Logo" className="logo-img" /> {/* Muestra el logo */}
        <h1 className="app-name">STRACKWAVE</h1> {/* Título de la aplicación */}
      </div>

      <div className="middle-section">
        <img src="/icons/fondo.png" alt="Fondo" className="background-img" /> {/* Imagen de fondo */}
        <div className="login-form-box">
          <h2>Iniciar Sesión</h2>
          {/* Muestra mensajes de éxito o error */}
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          {/* Formulario de inicio de sesión */}
          <form onSubmit={handleSubmit}>
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
            <button type="submit">Iniciar sesión</button> {/* Botón para enviar el formulario */}
          </form>
          {/* Enlace para redirigir a la página de registro */}
          <p className="register-link">
            ¿No tienes cuenta aún? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>

      <div className="bottom-section">
        <div className="carousel-section">
          {/* 🔹 Flechas izquierda y derecha para navegación manual */}
          <button className="carousel-button left" onClick={handlePrev}>❮</button>
          <img
            src={images[currentImageIndex]}
            alt={`Imagen ${currentImageIndex + 1}`}
            className="carousel-img"
          />
          <button className="carousel-button right" onClick={handleNext}>❯</button>
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

export default Login; // Exporta el componente Login para ser usado en otras partes de la aplicación
