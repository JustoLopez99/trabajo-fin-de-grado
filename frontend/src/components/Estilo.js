import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Estilo.css';

const Estilo = ({ children }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/icons/imagen1.jpg",
    "/icons/imagen2.jpg",
    "/icons/imagen3.jpg",
    "/icons/imagen4.jpg"
  ];

  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="page-container">
      {/* CABECERA */}
      <header className="top-banner">
        <div className="left-section">
          <Link to="/" className="app-name-link">
            <img src="/icons/Logo.png" alt="Logo" className="logo-img" />
            <h1 className="app-name">STRACKWAVE</h1>
          </Link>
        </div>
        {/* Mostrar botón "Iniciar sesión" solo en el Index */}
        {location.pathname === "/" && (
          <div className="right-section">
            <Link to="/login" className="login-button">Iniciar Sesión</Link>
          </div>
        )}
      </header>

      {/* CONTENIDO */}
      <main className="middle-section">
        <img src="/icons/fondo.png" alt="Fondo" className="background-img" />
        <div className="content-box">
          {children}
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="bottom-section">
        <div className="carousel-section">
          <button className="carousel-button left" onClick={handlePrev}>❮</button>
          <img src={images[currentImageIndex]} alt="Carrusel" className="carousel-img" />
          <button className="carousel-button right" onClick={handleNext}>❯</button>
        </div>
        <div className="contact-section">
          <h3>Contacto</h3>
          <p>📞 Teléfono: +123 456 7890</p>
          <p>📬 Correo: contacto@strackwave.com</p>
          <p>📍 Dirección: Sevilla, España</p>
        </div>
      </footer>
    </div>
  );
};

export default Estilo;
