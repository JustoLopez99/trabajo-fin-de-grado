// src/components/Layout.js

import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componente de diseño principal que envuelve todas las vistas del sistema después de login
const Layout = () => {
  const [fullName, setFullName] = useState(''); // Nombre completo del usuario
  const [username, setUsername] = useState(''); // Nombre de usuario
  const navigate = useNavigate(); // Hook para navegación programática

  // Hook de efecto para obtener la información del usuario al cargar el componente
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token'); // Obtener token guardado
      if (!token) {
        // Si no hay token, redirigir al login
        navigate('/login');
        return;
      }

      try {
        // Llamar a la API para obtener los datos del usuario autenticado
        const response = await axios.get('http://localhost:3000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }, // Token como header
        });

        // Guardar nombre completo y username
        setFullName(`${response.data.first_name} ${response.data.last_name}`);
        setUsername(response.data.username);
      } catch (error) {
        // Si hay error, redirigir al login
        console.error('Error al obtener el usuario:', error);
        navigate('/login');
      }
    };

    fetchUser(); // Ejecutar función al montar el componente
  }, [navigate]);

  // Función para cerrar sesión (borra token y redirige)
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Elementos de navegación lateral
  const sidebarItems = [
    { to: "/Calendario", icon: "/icons/calendario.png", alt: "Calendario", label: "Calendario" },
    { to: "/Estadisticas", icon: "/icons/estadisticas.png", alt: "Estadísticas", label: "Estadísticas" },
    { to: "/Predicciones", icon: "/icons/predicciones.png", alt: "Predicciones", label: "Predicciones" },
    { to: "/Datos", icon: "/icons/datos.png", alt: "Datos", label: "Datos" },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      {/* Cabecera superior */}
      <header className="bg-white h-[7vh] flex items-center justify-between px-4 sm:px-8 text-black shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-[10px]">
          {/* Logo de la app */}
          <img src="/icons/Logo.png" alt="Logo Strackwave" className="h-[40px] sm:h-[50px] md:h-[60px]" />
          {/* Enlace al inicio (puede ser la vista principal) */}
          <Link to="/principal" className="no-underline text-inherit">
            <h1 className="text-xl sm:text-2xl md:text-[2rem] font-thin tracking-wide">STRACKWAVE</h1>
          </Link>
        </div>

        {/* Botón de cerrar sesión */}
        <div className="flex items-center ml-auto">
          <button
            className="bg-[#708090] hover:bg-[#556070] text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-md cursor-pointer transition-colors duration-150 ease-in-out text-sm sm:text-base"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Área principal: incluye barra lateral y contenido */}
      <div className="flex flex-1 min-h-[93vh]">
        
        {/* Barra lateral (sidebar) */}
        <aside className="w-[150px] bg-[#2f4f4f] flex flex-col justify-start items-center py-4 min-h-[93vh] overflow-y-auto">
          <ul className="list-none p-0 m-0 w-full flex flex-col justify-start items-center gap-y-2">
            {/* Iterar sobre elementos del menú */}
            {sidebarItems.map((item) => (
              <li key={item.to} className="flex items-center justify-center w-full h-[170px] shrink-0">
                <div className="flex flex-col items-center relative group w-full h-full">
                  <Link
                    to={item.to}
                    className="flex flex-col items-center justify-center h-full w-full no-underline text-inherit p-2"
                  >
                    {/* Icono del menú */}
                    <img
                      src={item.icon}
                      alt={item.alt}
                      className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                    {/* Etiqueta que aparece al hacer hover */}
                    <span
                      className="mt-[8px] text-[0.75rem] sm:text-[0.8rem] text-center text-white opacity-0 transform translate-y-[10px] transition-all duration-300 ease-in-out pointer-events-none group-hover:opacity-100 group-hover:translate-y-0"
                    >
                      {item.label}
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Contenido dinámico según la ruta (Outlet se usa para las rutas anidadas) */}
        <main className="relative flex-grow min-h-[93vh] overflow-y-auto bg-[#FA8072]">
          <Outlet context={{ fullName, username }} />
          {/* `Outlet` permite renderizar la subruta activa.
              Además, pasamos `fullName` y `username` como contexto para que los componentes hijos puedan acceder. */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
