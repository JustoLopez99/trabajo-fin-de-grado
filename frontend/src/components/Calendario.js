// src/components/Calendario.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Calendario = () => {
  // Obtiene 'username' (del usuario logueado), 'userRole', y 'viewingAsUsername' (del desplegable del admin)
  const { username, userRole, viewingAsUsername } = useOutletContext();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    plataforma: '',
    titulo: '',
    descripcion: '',
  });
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Determina el username efectivo que se usará para cargar y crear tareas.
  // Si es admin y está viendo como otro usuario, usa viewingAsUsername.
  // Si no, usa el username del usuario logueado (sea admin o cliente).
  const getEffectiveUsername = useCallback(() => {
    if (userRole === 'admin' && viewingAsUsername) {
      return viewingAsUsername;
    }
    return username; // Para cliente, o admin sin "ver como" otro, o admin viendo su propio perfil
  }, [userRole, username, viewingAsUsername]);


  const fetchTasks = useCallback(async () => {
    const usernameToFetch = getEffectiveUsername(); // Usa el username efectivo

    if (!usernameToFetch) {
      setTasks([]);
      console.log("Calendario: No hay username efectivo para buscar tareas.");
      return;
    }

    setIsLoadingTasks(true);
    setFormError('');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    console.log(`Calendario: Buscando tareas para usuario efectivo: ${usernameToFetch}, Año: ${year}, Mes: ${month}`);

    try {
      const response = await axios.get(`http://localhost:3000/api/tasks`, {
        params: { username: usernameToFetch, year, month }, // Envía el username efectivo
        timeout: 10000,
      });
      console.log("Calendario: Tareas recibidas:", response.data);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Calendario: Error al obtener las tareas', error);
      setFormError('No se pudieron cargar las tareas para este mes para el usuario seleccionado.');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [currentMonth, getEffectiveUsername]); // Dependencia de getEffectiveUsername (que a su vez depende de userRole, username, viewingAsUsername)

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const changeMonth = (direction) => {
    setCurrentMonth(prevMonth => {
      const newDate = new Date(prevMonth);
      newDate.setMonth(prevMonth.getMonth() + direction);
      return newDate;
    });
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const weeksArray = [];
    let currentDay = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < dayOffset) {
          week.push(null);
        } else if (currentDay <= daysInMonth) {
          week.push(currentDay);
          currentDay++;
        } else {
          week.push(null);
        }
      }
      weeksArray.push(week);
      if (currentDay > daysInMonth && i >= Math.floor((dayOffset + daysInMonth - 1) / 7)) break;
    }
    return weeksArray;
  };

  const weeks = generateCalendar();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setFormError('');

    const usernameForNewTask = getEffectiveUsername(); // Usa el username efectivo

    if (!usernameForNewTask) {
        setFormError("No se pudo determinar el usuario para asignar la tarea.");
        return;
    }

    try {
      const newTask = { ...formData, username: usernameForNewTask }; // Asigna la tarea al username efectivo
      await axios.post('http://localhost:3000/api/tasks', newTask);
      setFormMessage(`Tarea añadida correctamente para ${usernameForNewTask}`);
      setFormData({ fecha: '', hora: '', plataforma: '', titulo: '', descripcion: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error al añadir la tarea', error);
      const apiErrorMessage = error.response?.data?.message || error.message || 'Error al añadir tarea';
      setFormError(apiErrorMessage);
    }
  };

  const platformColors = {
    Instagram: 'bg-blue-500',
    Tiktok: 'bg-green-500',
    Facebook: 'bg-pink-500',
    Web: 'bg-yellow-500',
    Otra: 'bg-gray-500',
  };

  const platformDotColors = {
    Instagram: 'bg-blue-400',
    Tiktok: 'bg-green-400',
    Facebook: 'bg-pink-400',
    Web: 'bg-yellow-400',
    Otra: 'bg-gray-400',
  };
  
  const monthYearFormatter = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  // Texto para el encabezado del formulario, indicando para quién se añade la tarea si es admin
  const formHeaderTitle = () => {
    if (userRole === 'admin') {
      const effectiveUser = getEffectiveUsername();
      if (effectiveUser && effectiveUser !== username) { // Si es admin y está viendo como OTRO usuario
        return `Añadir Nueva Tarea para: ${effectiveUser}`;
      }
      return `Añadir Nueva Tarea para: ${username} (Admin)`; // Si es admin y viendo su propio calendario o no hay selección
    }
    return 'Añadir Nueva Tarea'; // Para el rol 'client' (aunque el formulario no se muestra)
  };


  return (
    <div
      className="flex flex-col lg:flex-row w-full h-full items-start"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/icons/fondo.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full lg:w-3/4 p-4 sm:p-6 md:p-8 flex flex-col gap-10 overflow-y-auto h-full">
        <div className="bg-white/90 p-5 rounded-lg shadow-xl">
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold mb-5">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-200" disabled={isLoadingTasks}>&lt;</button>
            <span>{monthYearFormatter.format(currentMonth)}</span>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-200" disabled={isLoadingTasks}>&gt;</button>
          </div>

          <div className="grid grid-cols-7 font-bold bg-gray-100 p-2 text-center rounded-md text-sm sm:text-base">
            <div>Lunes</div><div>Martes</div><div>Miércoles</div>
            <div>Jueves</div><div>Viernes</div><div>Sábado</div><div>Domingo</div>
          </div>
          
          {isLoadingTasks && <div className="text-center p-4">Cargando tareas...</div>}
          {!isLoadingTasks && formError && tasks.length === 0 && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md text-center my-2">{formError}</p>}

          <div className="grid grid-cols-1 gap-px bg-gray-200 border border-gray-200 mt-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-px">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className={`min-h-[80px] sm:min-h-[100px] p-1.5 text-left ${day ? 'bg-gray-50 hover:bg-gray-200' : 'bg-gray-100/50'}`}>
                    {day && (
                      <div className="text-xs sm:text-sm font-bold mb-1 flex flex-col items-start h-full">
                        {day}
                        <div className="mt-1 space-y-1 w-full">
                          {tasks
                            .filter(task => {
                              if (!task.fecha) {
                                console.warn("Tarea sin fecha encontrada:", task);
                                return false;
                              }
                              const taskDate = new Date(task.fecha);
                              if (isNaN(taskDate.getTime())) {
                                console.warn(`Fecha inválida procesada de ('${task.fecha}') para tarea: ${task.titulo || task.id}`);
                                return false;
                              }
                              return taskDate.getDate() === day &&
                                     taskDate.getMonth() === currentMonth.getMonth() &&
                                     taskDate.getFullYear() === currentMonth.getFullYear();
                            })
                            .map(task => (
                              <div
                                key={task.id || task._id}
                                className="w-full flex items-center"
                                title={`${task.plataforma}: ${task.titulo} - ${task.descripcion || ''}`}
                              >
                                <span
                                  className={`inline-block w-2 flex-shrink-0 h-3 mr-1.5 rounded-sm ${platformColors[task.plataforma] || 'bg-gray-400'}`}
                                ></span>
                                <span className="text-[10px] sm:text-xs text-gray-700 font-medium break-words leading-tight">
                                  {task.titulo}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* El formulario de añadir tarea solo se muestra si el rol es admin */}
        {userRole === 'admin' && (
          <div className="bg-white p-5 rounded-lg shadow-xl">
            {/* Título dinámico para el formulario */}
            <h2 className="text-center text-xl font-semibold mb-5 text-gray-700">{formHeaderTitle()}</h2>
            
            {formMessage && <p className="mb-3 p-3 text-sm text-green-700 bg-green-100 rounded-md">{formMessage}</p>}
            {formError && !isLoadingTasks && <p className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-md">{formError}</p>}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-600 mb-1">Fecha:</label>
                <input type="date" id="fecha" value={formData.fecha} onChange={handleChange} required className="w-full p-2.5 border rounded-md"/>
              </div>
              <div>
                <label htmlFor="hora" className="block text-sm font-medium text-gray-600 mb-1">Hora:</label>
                <input type="time" id="hora" value={formData.hora} onChange={handleChange} required className="w-full p-2.5 border rounded-md"/>
              </div>
              <div>
                <label htmlFor="plataforma" className="block text-sm font-medium text-gray-600 mb-1">Plataforma:</label>
                <select id="plataforma" value={formData.plataforma} onChange={handleChange} required className="w-full p-2.5 border rounded-md">
                  <option value="">Selecciona una plataforma</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Tiktok">Tiktok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Web">Web</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-600 mb-1">Título:</label>
                <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required className="w-full p-2.5 border rounded-md"/>
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-600 mb-1">Descripción:</label>
                <textarea id="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} className="w-full p-2.5 border rounded-md"/>
              </div>
              <button type="submit" className="mt-2 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                Añadir Tarea
              </button>
            </form>
          </div>
        )}

      </div>

      <aside className="w-full lg:w-1/4 p-4 sm:p-6 md:p-8 lg:sticky lg:top-[calc(7vh+2rem)] lg:h-[calc(93vh-4rem)]">
        <div className="bg-purple-100/70 rounded-lg p-4 shadow-lg h-full lg:overflow-y-auto">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">Leyenda</h3>
          <div className="space-y-2">
            {Object.entries(platformDotColors).map(([platform, colorClass]) => (
              <div key={platform} className="flex items-center text-sm text-gray-700">
                <span className={`w-3 h-3 rounded-full mr-2.5 border ${colorClass}`}></span>
                {platform}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Calendario;
