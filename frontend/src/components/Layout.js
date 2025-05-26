// src/components/Layout.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Clave para guardar la preferencia de vista del administrador en localStorage.
const LOCAL_STORAGE_ADMIN_VIEW_KEY = 'adminSelectedUserView';

// Componente principal de la estructura de la página (Layout).
const Layout = () => {
  // Estados para almacenar la información del usuario actual.
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [email, setEmail] = useState('');

  // Hooks de react-router-dom para navegación y acceso a la ubicación.
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para la funcionalidad de selección de vista de usuario para administradores.
  const [allUsernames, setAllUsernames] = useState([]); // Almacena todos los nombres de usuario si el usuario es admin.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controla la visibilidad del menú desplegable.
  const [loadingUsernames, setLoadingUsernames] = useState(false); // Indica si se están cargando los nombres de usuario.
  const [selectedUserPreference, setSelectedUserPreference] = useState(''); // Almacena el usuario seleccionado por el admin para ver la app.
  const dropdownRef = useRef(null); // Referencia al elemento del menú desplegable para detectar clics fuera.

  // Efecto para obtener los datos del usuario autenticado al cargar el componente o al cambiar la navegación.
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirige al login si no hay token.
        return;
      }
      try {
        // Petición para obtener los datos del usuario.
        const response = await axios.get('http://localhost:3000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Actualiza los estados con los datos del usuario.
        setFullName(`${response.data.first_name} ${response.data.last_name}`);
        setUsername(response.data.username);
        setUserRole(response.data.role);
        setEmail(response.data.email);
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
        // Limpia el token y redirige al login en caso de error.
        localStorage.removeItem('token');
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]); // Se ejecuta cuando `Maps` cambia (generalmente solo una vez al montar).

  // Función para obtener todos los nombres de usuario (si el usuario es administrador).
  const fetchAllUsernames = useCallback(async () => {
    if (userRole === 'admin') { // Solo se ejecuta si el usuario es admin.
      setLoadingUsernames(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingUsernames(false);
        return;
      }
      try {
        // Petición para obtener la lista de todos los usuarios.
        const response = await axios.get('http://localhost:3000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let fetchedUsernames = [];
        if (Array.isArray(response.data)) {
          // Filtra y mapea los nombres de usuario.
          fetchedUsernames = response.data.map(user => user.username).filter(name => name);
          setAllUsernames(fetchedUsernames);
        } else {
          setAllUsernames([]);
        }

        // Restaura la preferencia de vista del administrador desde localStorage.
        const storedPreference = localStorage.getItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
        if (storedPreference && fetchedUsernames.includes(storedPreference)) {
          setSelectedUserPreference(storedPreference);
        } else if (storedPreference) {
          // Si la preferencia almacenada ya no es válida, se elimina.
          localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
          setSelectedUserPreference('');
        }
      } catch (error) {
        console.error('Error al obtener todos los usernames:', error);
        setAllUsernames([]);
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
        setSelectedUserPreference('');
      } finally {
        setLoadingUsernames(false);
      }
    } else {
      // Si el usuario no es admin, se resetean los estados relacionados.
      setAllUsernames([]);
      setSelectedUserPreference('');
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
      setIsDropdownOpen(false);
    }
  }, [userRole]);

  // Efecto para llamar a `WorkspaceAllUsernames` cuando la función (o sus dependencias) cambian.
  useEffect(() => {
    fetchAllUsernames();
  }, [fetchAllUsernames]);

  // Efecto para manejar clics fuera del menú desplegable y cerrarlo.
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Agrega el event listener si el dropdown está abierto.
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Limpia el event listener al desmontar el componente o cuando `isDropdownOpen` cambia.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Función para manejar el cierre de sesión.
  const handleLogout = () => {
    // Limpia el token y los datos del usuario de localStorage y del estado.
    localStorage.removeItem('token');
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
    setUserRole('');
    setUsername('');
    setFullName('');
    setEmail('');
    setSelectedUserPreference('');
    setIsDropdownOpen(false);
    navigate('/login'); // Redirige al login.
  };

  // Función para alternar la visibilidad del menú desplegable de selección de usuario.
  const toggleDropdown = () => {
    if (userRole === 'admin' && !loadingUsernames) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  // Función para manejar la selección de un usuario en el menú desplegable (vista de admin).
  const handleUserSelection = (selectedUsername) => {
    setSelectedUserPreference(selectedUsername);
    localStorage.setItem(LOCAL_STORAGE_ADMIN_VIEW_KEY, selectedUsername);
    setIsDropdownOpen(false);
    console.log("Admin está viendo como:", selectedUsername); // Log para debugging.
  };

  // Definición de los ítems de la barra lateral de navegación.
  const sidebarItems = [
    { to: "/Principal", icon: "/icons/principal.png", alt: "Principal", label: "Principal" },
    { to: "/Calendario", icon: "/icons/calendario.png", alt: "Calendario", label: "Calendario" },
    { to: "/Estadisticas", icon: "/icons/estadisticas.png", alt: "Estadísticas", label: "Estadísticas" },
    { to: "/Predicciones", icon: "/icons/predicciones.png", alt: "Predicciones", label: "Predicciones" },
    { to: "/Datos", icon: "/icons/datos.png", alt: "Datos", label: "Datos" },
  ];

  // Función para determinar el texto del botón del menú desplegable de selección de usuario.
  const getDropdownButtonText = () => {
    if (loadingUsernames) return 'Cargando usuarios...';
    // Si hay un usuario seleccionado para la vista y es diferente al admin actual.
    if (selectedUserPreference && selectedUserPreference !== username) return `Viendo como: ${selectedUserPreference}`;
    // Si el admin está viendo como sí mismo.
    if (username) return `Viendo como: ${username} (Admin)`;
    // Si hay otros usuarios disponibles para seleccionar.
    if (allUsernames.length > 0 && allUsernames.some(name => name !== username)) return 'Seleccionar vista de usuario';
    return 'No hay usuarios para seleccionar'; // Si no hay usuarios (o solo está el admin).
  };

  // Renderizado del componente Layout.
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Cabecera de la aplicación */}
      <header className="bg-white h-[7vh] flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-50">
        {/* Logo y título */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/icons/Logo.png" alt="Logo Strackwave" className="h-8 sm:h-10 md:h-12" />
          <Link to="/principal" className="no-underline text-slate-800">
            <h1 className="text-lg sm:text-xl md:text-2xl font-light tracking-tight">STRACKWAVE</h1>
          </Link>
        </div>

        {/* Menú desplegable para administradores para cambiar la vista de usuario */}
        <div className="flex-grow flex justify-center px-4">
          {userRole === 'admin' && ( // Solo se muestra si el usuario es admin.
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center min-w-[220px] justify-between transition-colors duration-150"
                disabled={loadingUsernames && !(selectedUserPreference && selectedUserPreference !== username)}
              >
                <span className="truncate">{getDropdownButtonText()}</span>
                {/* Icono de flecha del desplegable */}
                {(allUsernames.filter(name => name !== username).length > 0 || (selectedUserPreference && selectedUserPreference !== username)) && !loadingUsernames && (
                   <svg className={`w-4 h-4 ml-2 shrink-0 inline transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              {/* Contenido del menú desplegable */}
              {isDropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1 max-h-60 overflow-y-auto" role="menu">
                    {/* Opción para ver como el propio admin */}
                    {username && (
                        <button
                            onClick={() => handleUserSelection(username)}
                            className={`text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 hover:text-slate-900 ${selectedUserPreference === username || !selectedUserPreference ? 'font-semibold bg-slate-100' : ''}`}
                            role="menuitem"
                        >
                           Ver como: {username} (Admin)
                        </button>
                    )}
                    {/* Lista de otros usuarios para seleccionar */}
                    {allUsernames.filter(name => name !== username).map((name, index) => (
                      <button
                        key={index}
                        onClick={() => handleUserSelection(name)}
                        className={`text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 hover:text-slate-900 ${selectedUserPreference === name ? 'font-semibold bg-slate-100' : ''}`}
                        role="menuitem"
                      >
                        {name}
                      </button>
                    ))}
                    {/* Indicador de carga o mensaje si no hay otros usuarios */}
                    {loadingUsernames && <div className="px-4 py-2 text-sm text-slate-500">Cargando...</div>}
                    {!loadingUsernames && allUsernames.filter(name => name !== username).length === 0 && username && (
                        <div className="px-4 py-2 text-sm text-slate-500">No hay otros usuarios para seleccionar.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controles de usuario: enlace a gestión de usuarios (admin) y botón de cerrar sesión */}
        <div className="flex items-center gap-3 sm:gap-4">
          {userRole === 'admin' && ( // Enlace para la gestión de usuarios, solo para admin.
            <Link
              to="/admin/user-management"
              title="Gestión de Usuarios"
              className="text-slate-600 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
              <img src="/icons/ajustesadmin.png" alt="Configuración de Admin" className="h-9 w-9"/>
            </Link>
          )}
          {/* Botón de Cerrar sesión */}
          <button
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-md cursor-pointer transition-colors text-sm"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenedor principal para la barra lateral y el contenido de la página */}
      <div className="flex flex-1" style={{ height: 'calc(100vh - 7vh)' }}> {/* Calcula la altura restante de la pantalla */}
        {/* Barra lateral de navegación */}
        <aside className="w-60 shrink-0 bg-slate-800 flex flex-col py-6 px-3 overflow-y-auto">
          <nav className="flex-grow">
            <ul className="space-y-2">
              {/* Mapea los ítems de la barra lateral para crear los enlaces */}
              {sidebarItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to); // Determina si el enlace está activo.
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out
                                  ${isActive 
                                    ? 'bg-slate-600 text-white shadow-md' // Estilos para enlace activo.
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`} // Estilos para enlace inactivo.
                    >
                      <img
                        src={item.icon}
                        alt={item.alt}
                        className="w-10 h-10 shrink-0" 
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Contenido principal de la página, donde se renderizarán las rutas anidadas */}
        <main className="relative flex-grow overflow-y-auto p-4 sm:p-6 bg-white">
          {/* Outlet renderiza el componente de la ruta hija activa. Pasa el contexto del usuario. */}
          <Outlet context={{ fullName, username, userRole, email, viewingAsUsername: selectedUserPreference }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;