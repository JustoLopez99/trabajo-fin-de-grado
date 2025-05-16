// Importaciones necesarias de React y React Router
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Componente principal que envuelve toda la estructura visual
const Estilo = ({ children }) => {
  // Estado para controlar el índice actual del carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lista de imágenes para el carrusel del footer
  const images = [
    "/icons/imagen1.jpg",
    "/icons/imagen2.jpg",
    "/icons/imagen3.jpg",
    "/icons/imagen4.jpg"
  ];

  // Hook que da acceso a la ruta actual
  const location = useLocation();

  // Efecto que cambia la imagen automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext(); // Muestra la siguiente imagen
    }, 3000);
    return () => clearInterval(interval); // Limpieza del intervalo
  }, [currentImageIndex]);

  // Función para imagen anterior
  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // Función para imagen siguiente
  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Renderizado del componente
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* CABECERA */}
      <header className="bg-white h-[7vh] flex items-center justify-between px-4 sm:px-8 text-black shadow-md">
        
        {/* Logo y nombre de la app (izquierda) */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center no-underline text-inherit">
            <img
              src="/icons/Logo.png"
              alt="Strackwave Logo"
              className="h-[40px] sm:h-[50px] mr-2 sm:mr-4"
            />
            <h1 className="text-xl sm:text-2xl md:text-[2rem] font-thin tracking-wide">STRACKWAVE</h1>
          </Link>
        </div>

        {/* Botón de Iniciar Sesión (solo visible en la página de inicio) */}
        {location.pathname === "/" && (
          <div className="flex items-center">
            <Link
              to="/login"
              className="bg-[#708090] hover:bg-[#556070] text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-[5px] no-underline transition-colors duration-150 text-sm sm:text-base"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative flex-1 flex items-center justify-center py-6 sm:py-10">
        
        {/* Imagen de fondo decorativa */}
        <img
          src="/icons/fondo.png"
          alt="Decorative background"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
        />

        {/* Contenido insertado como hijo (children) */}
        <div className="relative z-10 p-4">
          {children}
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="flex flex-col md:flex-row bg-white h-auto md:h-[25vh] shadow-inner_top">
        
        {/* Sección del carrusel de imágenes */}
        <section className="flex-1 relative flex items-center justify-center p-4 md:border-r border-gray-200 min-h-[200px] md:min-h-0 overflow-hidden">
          {images.length > 0 && (
            <>
              {/* Imagen actual del carrusel */}
              <img
                src={images[currentImageIndex]}
                alt={`Carrusel de imágenes ${currentImageIndex + 1}`}
                className="max-h-full h-auto w-auto max-w-full object-contain rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
                key={currentImageIndex}
              />

              {/* Botón anterior */}
              <button
                onClick={handlePrev}
                aria-label="Imagen anterior del carrusel"
                className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 bg-white/70 hover:bg-white/90 text-gray-800 border-none text-2xl md:text-[2rem] p-1 md:p-[0.3rem_0.6rem] cursor-pointer z-20 rounded-full shadow-md transition-colors"
              >
                ❮
              </button>

              {/* Botón siguiente */}
              <button
                onClick={handleNext}
                aria-label="Siguiente imagen del carrusel"
                className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 bg-white/70 hover:bg-white/90 text-gray-800 border-none text-2xl md:text-[2rem] p-1 md:p-[0.3rem_0.6rem] cursor-pointer z-20 rounded-full shadow-md transition-colors"
              >
                ❯
              </button>
            </>
          )}
        </section>

        {/* Sección de contacto */}
        <section className="flex-1 p-6 md:p-8 text-[0.9rem] text-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Contacto</h3>
          <p className="mb-1.5">
            <strong>Teléfono:</strong> <a href="tel:+1234567890" className="hover:text-blue-600">+123 456 7890</a>
          </p>
          <p className="mb-1.5">
            <strong>Correo:</strong> <a href="mailto:contacto@strackwave.com" className="hover:text-blue-600">contacto@strackwave.com</a>
          </p>
          <p className="mb-1.5">
            <strong>Dirección:</strong> Sevilla, España
          </p>

          {/* Enlaces legales */}
          <div className="mt-4">
            <Link to="/privacy-policy" className="text-blue-600 hover:underline mr-4 text-sm">Política de Privacidad</Link>
            <Link to="/terms-of-service" className="text-blue-600 hover:underline text-sm">Términos de Servicio</Link>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default Estilo;
