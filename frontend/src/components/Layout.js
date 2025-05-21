// src/components/Layout.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LOCAL_STORAGE_ADMIN_VIEW_KEY = 'adminSelectedUserView';

const Layout = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState(''); // Username del admin logueado
  const [userRole, setUserRole] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Estados para el desplegable de admin y la preferencia
  const [allUsernames, setAllUsernames] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingUsernames, setLoadingUsernames] = useState(false);
  const [selectedUserPreference, setSelectedUserPreference] = useState(''); // Username seleccionado para "ver como"
  const dropdownRef = useRef(null);

  // 1. Cargar datos del usuario logueado
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
        setUsername(response.data.username); // Username del admin
        setUserRole(response.data.role);
        setEmail(response.data.email);
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY); // Limpiar preferencia
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // 2. Cargar todos los usernames si es admin y luego inicializar/validar la preferencia
  const fetchAllUsernames = useCallback(async () => {
    if (userRole === 'admin') {
      setLoadingUsernames(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingUsernames(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let fetchedUsernames = [];
        if (Array.isArray(response.data)) {
          fetchedUsernames = response.data.map(user => user.username).filter(name => name);
          setAllUsernames(fetchedUsernames);
        } else {
          console.error("La respuesta de /api/users no es un array:", response.data);
          setAllUsernames([]);
        }

        const storedPreference = localStorage.getItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
        if (storedPreference && fetchedUsernames.includes(storedPreference)) {
          setSelectedUserPreference(storedPreference);
        } else if (storedPreference) {
          localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
          setSelectedUserPreference('');
        } else {
          // Opcional: setSelectedUserPreference(username); si quieres que por defecto vea su propio perfil
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
      setAllUsernames([]);
      setSelectedUserPreference('');
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
      setIsDropdownOpen(false);
    }
  }, [userRole, username]);

  useEffect(() => {
    fetchAllUsernames();
  }, [fetchAllUsernames]);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_VIEW_KEY);
    setUserRole('');
    setUsername('');
    setFullName('');
    setEmail('');
    setSelectedUserPreference('');
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    if (userRole === 'admin' && !loadingUsernames) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleUserSelection = (selectedUsername) => {
    setSelectedUserPreference(selectedUsername);
    localStorage.setItem(LOCAL_STORAGE_ADMIN_VIEW_KEY, selectedUsername);
    setIsDropdownOpen(false);
    console.log("Admin está viendo como:", selectedUsername);
  };

  const sidebarItems = [
    { to: "/Principal", icon: "/icons/principal.png", alt: "Principal", label: "Principal" },
    { to: "/Calendario", icon: "/icons/calendario.png", alt: "Calendario", label: "Calendario" },
    { to: "/Estadisticas", icon: "/icons/estadisticas.png", alt: "Estadísticas", label: "Estadísticas" },
    { to: "/Predicciones", icon: "/icons/predicciones.png", alt: "Predicciones", label: "Predicciones" },
    { to: "/Datos", icon: "/icons/datos.png", alt: "Datos", label: "Datos" },
  ];

  const getDropdownButtonText = () => {
    if (loadingUsernames) return 'Cargando usuarios...';
    if (selectedUserPreference) return `Viendo como: ${selectedUserPreference}`;
    if (allUsernames.length > 0 && allUsernames.some(name => name !== username)) return 'Seleccionar vista de usuario'; // Modificado para ser más preciso
    if (username) return `Viendo como: ${username} (Admin)`; // Si solo está el admin o no hay otros
    return 'No hay usuarios para seleccionar'; // Caso genérico
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <header className="bg-white h-[7vh] flex items-center justify-between px-4 sm:px-8 text-black shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-[10px] flex-shrink-0">
          <img src="/icons/Logo.png" alt="Logo Strackwave" className="h-[40px] sm:h-[50px] md:h-[60px]" />
          <Link to="/principal" className="no-underline text-inherit">
            <h1 className="text-xl sm:text-2xl md:text-[2rem] font-thin tracking-wide">STRACKWAVE</h1>
          </Link>
        </div>

        <div className="flex-grow flex justify-center">
          {userRole === 'admin' && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center min-w-[200px] justify-between"
                disabled={loadingUsernames && !selectedUserPreference}
              >
                <span className="truncate">{getDropdownButtonText()}</span>
                {(allUsernames.filter(name => name !== username).length > 0 || (selectedUserPreference && selectedUserPreference !== username)) && !loadingUsernames && ( // Modificado para mostrar flecha si hay opciones o una opción seleccionada diferente al admin
                   <svg className={`w-5 h-5 ml-2 shrink-0 inline transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                >
                  <div className="py-1 max-h-60 overflow-y-auto" role="none">
                    {username && (
                        <button
                            onClick={() => handleUserSelection(username)}
                            className={`text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 ${selectedUserPreference === username || !selectedUserPreference ? 'font-bold bg-gray-100' : ''}`} // Resaltar si es la vista actual o no hay ninguna seleccionada (implica admin)
                            role="menuitem"
                        >
                           Ver como: {username} (Admin)
                        </button>
                    )}
                    {allUsernames.filter(name => name !== username).map((name, index) => (
                      <button
                        key={index}
                        onClick={() => handleUserSelection(name)}
                        className={`text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 ${selectedUserPreference === name ? 'font-bold bg-gray-100' : ''}`}
                        role="menuitem"
                      >
                        {name}
                      </button>
                    ))}
                    {loadingUsernames && <div className="px-4 py-2 text-sm text-gray-500">Cargando...</div>}
                    {!loadingUsernames && allUsernames.filter(name => name !== username).length === 0 && username && ( // Modificado para verificar si no hay *otros* usuarios
                        <div className="px-4 py-2 text-sm text-gray-500">No hay otros usuarios para seleccionar.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {userRole === 'admin' && (
            <Link
              to="/admin/user-management"
              title="Gestión de Usuarios"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-150 ease-in-out p-1 rounded-full hover:bg-gray-100"
            >
              <img
                 src="/icons/ajustesadmin.png"
                 alt="Configuración de Admin"
                 className="h-[24px] w-[24px]"
              />
            </Link>
          )}
          <button
            className="bg-[#708090] hover:bg-[#556070] text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-md cursor-pointer transition-colors duration-150 ease-in-out text-sm sm:text-base"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-[93vh]">
        {/* Barra lateral principal con ancho fijo y no encogible */}
        <aside className="w-[150px] shrink-0 bg-[#2f4f4f] flex flex-col justify-start items-center py-4 min-h-[93vh] overflow-y-auto"> {/* MODIFICACIÓN AQUÍ */}
          <ul className="list-none p-0 m-0 w-full flex flex-col justify-start items-center gap-y-2">
            {sidebarItems.map((item) => (
              <li key={item.to} className="flex items-center justify-center w-full h-[170px] shrink-0"> {/* shrink-0 también en los li por si acaso */}
                <div className="flex flex-col items-center relative group w-full h-full">
                  <Link
                    to={item.to}
                    className="flex flex-col items-center justify-center h-full w-full no-underline text-inherit p-2"
                  >
                    <img
                      src={item.icon}
                      alt={item.alt}
                      className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
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

        <main className="relative flex-grow min-h-[93vh] overflow-y-auto bg-[#FA8072]">
          <Outlet context={{ fullName, username, userRole, email, viewingAsUsername: selectedUserPreference }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;