import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './principal.css';

const Principal = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(response.data.name); // Ajusta si el nombre de la propiedad en tu backend es diferente
      } catch (error) {
        console.error('Error al obtener el usuario', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="principal-page">
      <div className="top-banner">
        <img src="/Logo.png" alt="Logo" className="logo-img" />
        <h1 className="app-name">STRACKWAVE</h1>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <ul>
            <li><Link to="/calendario">Calendario</Link></li>
            <li><Link to="/estadisticas">Estadísticas</Link></li>
            <li><Link to="/predicciones">Predicciones</Link></li>
            <li><Link to="/datos">Datos</Link></li>
          </ul>
        </div>

        <div className="content-area">
          <img src="/fondo.png" alt="Fondo" className="background-img" />
          <div className="welcome-text">
            <h2>Bienvenido {userName}, consulta tus novedades</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Principal;
