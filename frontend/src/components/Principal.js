// Importación de hooks y librerías necesarias
import React, { useEffect, useState } from 'react'; // React y sus hooks
import { useNavigate, Link } from 'react-router-dom'; // Para navegación y enlaces
import axios from 'axios'; // Para hacer peticiones HTTP
import './Principal.css'; // Estilos CSS del componente

// Componente Principal
const Principal = () => {
  // Estado para guardar el nombre del usuario autenticado
  const [userName, setUserName] = useState('');
  const navigate = useNavigate(); // Hook para redireccionar

  // Hook que se ejecuta una sola vez al montar el componente
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage

      // Si no hay token, redirige al login
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Petición para obtener datos del usuario autenticado
        const response = await axios.get('http://localhost:3000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }, // Enviar token en headers
        });

        // Guardar el nombre del usuario
        setUserName(response.data.name); // Asegúrate de que "name" exista en tu backend
      } catch (error) {
        console.error('Error al obtener el usuario', error);
        navigate('/login'); // Si falla, redirige al login
      }
    };

    fetchUser(); // Ejecutar la función al montar
  }, [navigate]); // Solo se vuelve a ejecutar si cambia navigate

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar token del navegador
    navigate('/login'); // Redirigir al login
  };

  // Renderizado del componente
  return (
    <div className="principal-page">
      {/* Cabecera superior */}
      <div className="top-banner">
        <img src="/icons/Logo.png" alt="Logo" className="logo-img" />
        <h1 className="app-name">STRACKWAVE</h1>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {/* Contenido principal dividido en barra lateral + contenido */}
      <div className="main-content">

        {/* Barra lateral con íconos de navegación */}
        <div className="sidebar">
          <ul>
            <li>
              <Link to="/Calendario">
                <img src="/icons/calendario.png" alt="Calendario" className="sidebar-icon" />
              </Link>
            </li>
            <li>
              <Link to="/Estadisticas">
                <img src="/icons/estadisticas.png" alt="Estadísticas" className="sidebar-icon" />
              </Link>
            </li>
            <li>
              <Link to="/Predicciones">
                <img src="/icons/predicciones.png" alt="Predicciones" className="sidebar-icon" />
              </Link>
            </li>
            <li>
              <Link to="/Datos">
                <img src="/icons/datos.png" alt="Datos" className="sidebar-icon" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Área de contenido con fondo e información */}
        <div className="content-area">
          <img src="/icons/fondo.png" alt="Fondo" className="background-img" />
          <div className="welcome-text">
            <h2>Bienvenido {userName}, consulta tus novedades</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportar el componente para usarlo en App.js u otros lugares
export default Principal;
