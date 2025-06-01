// src/components/Calendario.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Calendario = () => {
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
  
  const [selectedTask, setSelectedTask] = useState(null);
  // Nuevo estado para controlar la animación del contenido del modal
  const [showModalContent, setShowModalContent] = useState(false); 

  const getEffectiveUsername = useCallback(() => {
    if (userRole === 'admin' && viewingAsUsername) {
      return viewingAsUsername;
    }
    return username;
  }, [userRole, username, viewingAsUsername]);

  const fetchTasks = useCallback(async () => {
    const usernameToFetch = getEffectiveUsername();
    if (!usernameToFetch) {
      setTasks([]);
      return;
    }
    setIsLoadingTasks(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    try {
      const response = await axios.get(`http://localhost:3000/api/tasks`, {
        params: { username: usernameToFetch, year, month },
        timeout: 10000,
      });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Calendario: Error al obtener las tareas', error);
      setFormError('No se pudieron cargar las tareas del calendario.');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [currentMonth, getEffectiveUsername]);

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
        if (i === 0 && j < dayOffset) { week.push(null); } 
        else if (currentDay <= daysInMonth) { week.push(currentDay); currentDay++; } 
        else { week.push(null); }
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
    const usernameForNewTask = getEffectiveUsername();
    if (!usernameForNewTask) {
        setFormError("No se pudo determinar el usuario para asignar la tarea.");
        return;
    }
    try {
      const newTask = { ...formData, username: usernameForNewTask };
      await axios.post('http://localhost:3000/api/tasks', newTask);
      setFormMessage(`Tarea añadida correctamente para ${usernameForNewTask}.`);
      setFormData({ fecha: '', hora: '', plataforma: '', titulo: '', descripcion: '' });
      fetchTasks(); 
    } catch (error) {
      console.error('Error al añadir la tarea', error);
      const apiErrorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al añadir tarea';
      setFormError(apiErrorMessage);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    // setShowModalContent se manejará en el useEffect de selectedTask
  };

  const handleCloseTaskDetail = () => {
    setShowModalContent(false); // Inicia la animación de salida
    setTimeout(() => {
      setSelectedTask(null); // Elimina el modal del DOM después de la animación
    }, 300); // Debe coincidir con la duración de la transición
  };

  // Efecto para controlar la animación de entrada del modal
  useEffect(() => {
    if (selectedTask) {
      // Pequeño retraso para asegurar que el modal se renderice con clases de "salida" primero
      const timer = setTimeout(() => {
        setShowModalContent(true);
      }, 10); // Un delay muy corto
      return () => clearTimeout(timer);
    } else {
      setShowModalContent(false); // Asegura que esté oculto si no hay tarea seleccionada
    }
  }, [selectedTask]);


  const platformColors = {
    Instagram: 'bg-gradient-to-br from-pink-500 to-purple-600',
    Tiktok: 'bg-black',
    Facebook: 'bg-blue-600',
    Web: 'bg-yellow-400',
    Otra: 'bg-gray-400',
  };

  const platformDotColors = {
    Instagram: 'bg-gradient-to-br from-pink-500 to-purple-600',
    Tiktok: 'bg-black',
    Facebook: 'bg-blue-600',
    Web: 'bg-yellow-400',
    Otra: 'bg-gray-400',
  };
  
  const platformModalTitleColors = {
    Instagram: 'text-pink-600',
    Tiktok: 'text-black',
    Facebook: 'text-blue-700',
    Web: 'text-yellow-600', 
    Otra: 'text-gray-700',
  };

  const monthYearFormatter = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  const formHeaderTitle = () => {
    if (userRole === 'admin') {
      const effectiveUser = getEffectiveUsername();
      if (effectiveUser && effectiveUser !== username) {
        return `Añadir Nueva Tarea para: ${effectiveUser}`;
      }
      return `Añadir Nueva Tarea para: ${username || 'Admin'}`;
    }
    return 'Añadir Nueva Tarea';
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full items-start bg-white">
      <div className="w-full lg:w-3/4 p-4 sm:p-6 md:p-8 flex flex-col gap-10 overflow-y-auto h-full lg:mr-4">
        <div className="bg-white/90 p-5 rounded-lg [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]"> 
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold mb-5">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-200 transition-colors" disabled={isLoadingTasks}>&lt;</button>
            <span className="text-slate-700">{monthYearFormatter.format(currentMonth)}</span>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-200 transition-colors" disabled={isLoadingTasks}>&gt;</button>
          </div>

          <div className="grid grid-cols-7 font-bold bg-gray-100 p-2 text-center rounded-md text-sm sm:text-base text-slate-600">
            <div>Lunes</div><div>Martes</div><div>Miércoles</div>
            <div>Jueves</div><div>Viernes</div><div>Sábado</div><div>Domingo</div>
          </div>
          
          {isLoadingTasks && <div className="text-center p-4 text-slate-500">Cargando tareas...</div>}
          {!isLoadingTasks && tasks.length === 0 && 
            <p className="p-3 text-sm text-slate-500 bg-gray-50 rounded-md text-center my-2">
              {formError || `No hay tareas programadas para ${getEffectiveUsername()} en este mes.`}
            </p>
          }

          <div className="grid grid-cols-1 gap-px bg-gray-200 border border-gray-200 mt-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-px">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1.5 text-left relative ${day ? 'bg-white hover:bg-slate-50 transition-colors' : 'bg-gray-100/50'}`}>
                    {day && (
                      <>
                        <span className="text-xs sm:text-sm font-bold text-slate-600">{day}</span>
                        <div className="mt-1 space-y-1 w-full">
                          {tasks
                            .filter(task => {
                              if (!task.fecha) return false;
                              const taskDate = new Date(task.fecha);
                              return taskDate.getUTCDate() === day &&
                                     taskDate.getUTCMonth() === currentMonth.getMonth() &&
                                     taskDate.getUTCFullYear() === currentMonth.getFullYear();
                            })
                            .map(task => (
                              <div
                                key={task.id || task._id}
                                className="w-full flex items-center p-0.5 rounded hover:bg-gray-200 cursor-pointer transition-colors"
                                title={`${task.plataforma}: ${task.titulo}`}
                                onClick={() => handleTaskClick(task)}
                              >
                                <span
                                  className={`inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0 mr-1.5 rounded-sm ${platformColors[task.plataforma] || 'bg-gray-400'}`}
                                ></span>
                                <span className="text-[10px] sm:text-xs text-gray-700 font-medium break-words leading-tight">
                                  {task.titulo}
                                </span>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="bg-white/90 p-5 rounded-lg [box-shadow:0_6px_12px_rgba(0,0,0,0.15)] mt-8 lg:mt-0">
            <h2 className="text-center text-xl font-semibold mb-5 text-slate-700">{formHeaderTitle()}</h2>
            {formMessage && <p className="mb-3 p-3 text-sm text-green-700 bg-green-100/80 rounded-md">{formMessage}</p>}
            {formError && !isLoadingTasks && <p className="mb-3 p-3 text-sm text-red-700 bg-red-100/80 rounded-md">{formError}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div><label htmlFor="fecha" className="block text-sm font-medium text-gray-600 mb-1">Fecha:</label><input type="date" id="fecha" value={formData.fecha} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"/></div>
              <div><label htmlFor="hora" className="block text-sm font-medium text-gray-600 mb-1">Hora:</label><input type="time" id="hora" value={formData.hora} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"/></div>
              <div><label htmlFor="plataforma" className="block text-sm font-medium text-gray-600 mb-1">Plataforma:</label><select id="plataforma" value={formData.plataforma} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"><option value="">Selecciona una plataforma</option><option value="Instagram">Instagram</option><option value="Tiktok">Tiktok</option><option value="Facebook">Facebook</option><option value="Web">Web</option><option value="Otra">Otra</option></select></div>
              <div><label htmlFor="titulo" className="block text-sm font-medium text-gray-600 mb-1">Título:</label><input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"/></div>
              <div><label htmlFor="descripcion" className="block text-sm font-medium text-gray-600 mb-1">Descripción:</label><textarea id="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"/></div>
              <button type="submit" className="mt-2 py-2.5 px-4 bg-slate-800 text-white font-semibold rounded-md hover:bg-slate-700 transition-colors duration-150">Añadir Tarea</button>
            </form>
          </div>
        )}
      </div>

      <aside className="w-full lg:w-1/4 p-4 sm:p-6 md:p-8 lg:sticky lg:top-[calc(7vh+2rem)] lg:h-[calc(93vh-4rem)]">
        <div className="bg-gray-100/75 rounded-lg p-4 shadow-md h-fit">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Leyenda</h3>
          <div className="space-y-2">
            {Object.entries(platformDotColors).map(([platform, colorClass]) => (
              <div key={platform} className="flex items-center text-sm text-gray-700">
                <span className={`w-3 h-3 rounded-full mr-2.5 border border-gray-300 ${colorClass}`}></span>
                {platform}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Modal para Detalle de Tarea con Animación Tailwind */}
      {selectedTask && (
        <div 
            className={`fixed inset-0 bg-black flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${showModalContent ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}
            onClick={handleCloseTaskDetail}
        >
          <div 
            className={`bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative transform transition-all duration-300 ease-in-out ${showModalContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseTaskDetail}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Cerrar detalle de tarea"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h3 className={`text-2xl font-bold mb-3 ${platformModalTitleColors[selectedTask.plataforma] || 'text-slate-700'}`}>
              {selectedTask.titulo}
            </h3>
            
            <div className="grid grid-cols-2 gap-x-4 mb-4 text-sm">
                <p className="text-gray-600">
                    <span className="font-semibold">Plataforma:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${platformColors[selectedTask.plataforma] || 'bg-gray-400'} ${selectedTask.plataforma === 'Tiktok' || selectedTask.plataforma === 'Facebook' || selectedTask.plataforma === 'Instagram' ? 'text-white' : 'text-gray-800'}`}>
                        {selectedTask.plataforma}
                    </span>
                </p>
                <p className="text-gray-600"><span className="font-semibold">Fecha:</span> {new Date(selectedTask.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="text-gray-600"><span className="font-semibold">Hora:</span> {selectedTask.hora}</p>
            </div>

            <div className="text-gray-700 bg-slate-50 p-4 rounded-md border border-slate-200 max-h-60 overflow-y-auto">
              <p className="font-semibold text-slate-600 mb-1 text-md">Descripción:</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTask.descripcion || 'No hay descripción para esta tarea.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;