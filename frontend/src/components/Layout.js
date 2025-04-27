// src/components/Layout.js
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Layout.css'; // Reutilizamos el CSS existente

const Layout = () => {
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

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
        setFullName(`${response.data.first_name} ${response.data.last_name}`);
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
      {/* Cabecera */}
      <div className="top-banner">
        <div className="top-banner-left">
          <div className="brand-container">
            <img src="/icons/Logo.png" alt="Logo" className="logo-img" />
            <Link to="/principal" className="link-no-style">
              <h1 className="app-name">STRACKWAVE</h1>
            </Link>
          </div>
        </div>
        <div className="top-banner-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>

      {/* Sidebar + contenido */}
      <div className="main-content">
        <div className="sidebar">
          <ul>
            <li>
              <div className="sidebar-item">
                <Link to="/Calendario">
                  <img src="/icons/calendario.png" alt="Calendario" className="sidebar-icon" />
                  <span className="sidebar-label">Calendario</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="sidebar-item">
                <Link to="/Estadisticas">
                  <img src="/icons/estadisticas.png" alt="Estadísticas" className="sidebar-icon" />
                  <span className="sidebar-label">Estadísticas</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="sidebar-item">
                <Link to="/Predicciones">
                  <img src="/icons/predicciones.png" alt="Predicciones" className="sidebar-icon" />
                  <span className="sidebar-label">Predicciones</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="sidebar-item">
                <Link to="/Datos">
                  <img src="/icons/datos.png" alt="Datos" className="sidebar-icon" />
                  <span className="sidebar-label">Datos</span>
                </Link>
              </div>
            </li>
          </ul>
        </div>

        {/* Contenido que cambia */}
        <div className="content-area">
          <Outlet context={{ fullName }} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
