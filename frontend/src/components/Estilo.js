// Importaciones necesarias de React y React Router
import React, { useState, useEffect, useCallback } from 'react'; // Añadido useCallback
import { Link, useLocation } from 'react-router-dom';

// Lista de imágenes para el carrusel del footer 
const FOOTER_IMAGES = [
  "/icons/imagen1.jpg",
  "/icons/imagen2.jpg",
  "/icons/imagen3.jpg",
  "/icons/imagen4.jpg"
];

// Componente principal que envuelve toda la estructura visual
const Estilo = ({ children }) => {
  // Estado para controlar el índice actual del carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hook que da acceso a la ruta actual
  const location = useLocation();

  // Función para imagen siguiente
  const handleNext = useCallback(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FOOTER_IMAGES.length);
  }, []); 

  // Efecto que cambia la imagen automáticamente cada 3 segundos
  useEffect(() => {
    if (FOOTER_IMAGES.length > 0) { 
      const interval = setInterval(() => {
        handleNext(); 
      }, 3000);
      return () => clearInterval(interval); // Limpieza del intervalo
    }
  }, [handleNext]); 

  // Función para imagen anterior 
  const handlePrev = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? FOOTER_IMAGES.length - 1 : prev - 1
    );
  }, []); 

  // Renderizado del componente
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* CABECERA */}
      <header className="bg-white h-[7vh] flex items-center justify-between px-4 sm:px-8 shadow-md">
        
        <div className="flex items-center">
          <Link to="/" className="flex items-center no-underline text-slate-800">
            <img
              src="/icons/Logo.png"
              alt="Strackwave Logo"
              className="h-[40px] sm:h-[50px] mr-2 sm:mr-4"
            />
            <h1 className="text-lg sm:text-xl md:text-2xl font-light tracking-tight">STRACKWAVE</h1>
          </Link>
        </div>

        {location.pathname === "/" && (
          <div className="flex items-center">
            <Link
              to="/login"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-[5px] no-underline transition-colors duration-150 text-sm sm:text-base"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative flex-1 flex items-center justify-center py-6 sm:py-10">
        
        <img
          src="/icons/fondo.png"
          alt="Decorative background"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
        />

        <div className="relative z-10 p-4">
          {children}
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="flex flex-col md:flex-row bg-white h-auto md:h-[25vh] shadow-inner_top">
        
        <section className="flex-1 relative flex items-center justify-center p-4 md:border-r border-gray-200 min-h-[200px] md:min-h-0 overflow-hidden">
          {FOOTER_IMAGES.length > 0 && (
            <>
              <img
                src={FOOTER_IMAGES[currentImageIndex]}
                alt={`Carrusel de imágenes ${currentImageIndex + 1}`}
                className="max-h-full h-auto w-auto max-w-full object-contain rounded-lg shadow-lg transition-opacity duration-500 ease-in-out"
                key={currentImageIndex}
              />

              {/* Botón anterior */}
              <button
                onClick={handlePrev}
                aria-label="Imagen anterior del carrusel"
                className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 bg-slate-800 hover:bg-slate-700 text-white border-none text-2xl md:text-[2rem] p-1 md:p-[0.3rem_0.6rem] cursor-pointer z-20 rounded-full shadow-md transition-colors"
              >
                ❮
              </button>

              {/* Botón siguiente */}
              <button
                onClick={handleNext}
                aria-label="Siguiente imagen del carrusel"
                className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 bg-slate-800 hover:bg-slate-700 text-white border-none text-2xl md:text-[2rem] p-1 md:p-[0.3rem_0.6rem] cursor-pointer z-20 rounded-full shadow-md transition-colors"
              >
                ❯
              </button>
            </>
          )}
        </section>

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