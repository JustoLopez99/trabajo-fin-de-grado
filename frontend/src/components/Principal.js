// src/components/Principal.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Principal = () => {
    // Obtener username del usuario logueado, su rol, y el username que el admin podría estar viendo
    const { username, userRole, viewingAsUsername } = useOutletContext() || {}; // Proporcionar un objeto vacío por defecto

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('month'); // 'month' (mes) o 'week' (semana)
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // Índice de la semana actual en la vista semanal

    // Determina el username efectivo para la carga de datos
    const getEffectiveUsername = useCallback(() => {
        if (userRole === 'admin' && viewingAsUsername) {
            return viewingAsUsername;
        }
        return username; // Username del usuario logueado (cliente o admin viendo su propio perfil)
    }, [userRole, username, viewingAsUsername]);

    // Obtiene las tareas para el mes y usuario efectivos
    const fetchTasks = useCallback(async () => {
        const usernameToFetch = getEffectiveUsername(); // Usar el username efectivo
        if (!usernameToFetch) {
            setTasks([]); // Limpiar tareas si no hay usuario efectivo
            return;
        }
        setIsLoading(true);
        setError(null);
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth(); // 0 para Enero, 11 para Diciembre
        console.log(`Principal: Buscando tareas para usuario efectivo: ${usernameToFetch}, Año: ${year}, Mes: ${month}`);
        try {
            const response = await axios.get(`http://localhost:3000/api/tasks`, {
                params: { username: usernameToFetch, year, month }, // Enviar el username efectivo
                timeout: 10000 // Tiempo máximo de espera
            });
            setTasks(response.data || []); // Establecer tareas o array vacío si no hay datos
        } catch (error) {
            console.error('Principal: Error al obtener tareas:', error);
            setError('No se pudieron cargar las tareas. Inténtalo de nuevo más tarde.');
            setTasks([]); // Limpiar tareas en caso de error
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth, getEffectiveUsername]); // Dependencias de useCallback

    // Efecto para llamar a fetchTasks cuando cambian sus dependencias
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Efecto para resetear el índice de la semana cuando cambia el mes o el modo de vista
    useEffect(() => {
        setCurrentWeekIndex(0);
    }, [currentMonth, viewMode]);

    // Cambia el mes visualizado (anterior/siguiente)
    const changeMonth = (direction) => {
        setCurrentMonth(prevMonth => {
            const newDate = new Date(prevMonth);
            newDate.setMonth(prevMonth.getMonth() + direction);
            return newDate;
        });
        // setCurrentWeekIndex(0); // El useEffect [currentMonth, viewMode] ya lo maneja
    };

    // Cambia la semana visualizada (anterior/siguiente) en la vista semanal
    const changeWeek = (direction) => {
        const weeks = getWeeksInCurrentMonth(); // Necesitamos el total de semanas para los límites
        setCurrentWeekIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            if (newIndex >= 0 && newIndex < weeks.length) {
                return newIndex;
            }
            return prevIndex; // Mantenerse dentro de los límites
        });
    };


    // Genera un array con los números de los días del mes actual
    const generateMonthDays = () => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, index) => index + 1);
    };

    // Obtiene las tareas para un día específico del mes actual
    const getTasksForDay = (dayNumber, month, year) => {
        const targetMonth = month === undefined ? currentMonth.getMonth() : month;
        const targetYear = year === undefined ? currentMonth.getFullYear() : year;

        return tasks.filter((task) => {
            try {
                if (!task.fecha) return false; 
                const taskDate = new Date(task.fecha); 
                return taskDate.getDate() === dayNumber &&
                       taskDate.getMonth() === targetMonth &&
                       taskDate.getFullYear() === targetYear;
            } catch (e) {
                console.error("Principal: Error procesando fecha de tarea:", task.fecha, e);
                return false; 
            }
        });
    };
    
    // Función auxiliar para obtener todas las semanas en el mes actual
    const getWeeksInCurrentMonth = useCallback(() => {
        const weeks = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDateOfMonth = new Date(year, month, 1);
        const lastDateOfMonth = new Date(year, month + 1, 0);
        
        let currentIterationDate = new Date(firstDateOfMonth);
        let dayOfWeek = currentIterationDate.getDay(); 
        let diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
        currentIterationDate.setDate(currentIterationDate.getDate() + diffToMonday);

        let weekNumber = 1;
        while(currentIterationDate <= lastDateOfMonth) {
            const weekStartDate = new Date(currentIterationDate); 
            const weekEndDate = new Date(currentIterationDate);
            weekEndDate.setDate(currentIterationDate.getDate() + 6); 

            const displayLabelStartDate = new Date(Math.max(weekStartDate, firstDateOfMonth));
            const displayLabelEndDate = new Date(Math.min(weekEndDate, lastDateOfMonth));
            
            if (weekStartDate.getMonth() === month || weekEndDate.getMonth() === month || (weekStartDate < firstDateOfMonth && weekEndDate > lastDateOfMonth) ) {
                 weeks.push({
                    weekNumber,
                    startDate: weekStartDate, 
                    endDate: weekEndDate,    
                    displayLabel: `Semana ${weekNumber}: ${displayLabelStartDate.toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})} - ${displayLabelEndDate.toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})}`
                });
            }
            
            currentIterationDate.setDate(currentIterationDate.getDate() + 7); 
            weekNumber++;
            if (weekNumber > 7) break; 
        }
        return weeks;
    }, [currentMonth]); // Dependencia de currentMonth

    // Formateador de fecha para mostrar "Mes Año"
    const monthYearFormatter = new Intl.DateTimeFormat('es-ES', {
        month: 'long',
        year: 'numeric'
    });

    // Determina el mensaje de bienvenida
    const getWelcomeMessage = () => {
        const effectiveUser = getEffectiveUsername();
        if (userRole === 'admin' && viewingAsUsername && viewingAsUsername !== username) {
            return `Viendo novedades de: ${viewingAsUsername}`;
        }
        return effectiveUser ? `Bienvenido ${effectiveUser}, consulta tus novedades` : 'Bienvenido, consulta tus novedades';
    };

    // Genera los días para una semana específica que caen dentro del mes actual
    const getDaysForWeekInMonth = (weekStartDate, weekEndDate) => {
        const days = [];
        let currentDate = new Date(weekStartDate);
        while (currentDate <= weekEndDate) {
            if (currentDate.getMonth() === currentMonth.getMonth() && currentDate.getFullYear() === currentMonth.getFullYear()) {
                days.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    };

    const weeksToDisplay = getWeeksInCurrentMonth(); // Calcular semanas una vez por render

    return (
        <div
            className="flex flex-col items-center relative min-h-screen w-full p-5 pb-[70px] box-border"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/icons/fondovertical.png)`,
                backgroundSize: '100% auto',
                backgroundPosition: 'top center',
                backgroundRepeat: 'repeat-y',
            }}
        >
            <div className="w-full max-w-[1200px] mb-[50px] z-10 flex flex-col items-center">
                {/* Sección de bienvenida */}
                <div className="w-full text-center mb-[30px]">
                    <h2 className="text-[clamp(1.5rem,4vw,2rem)] text-center text-gray-800 mt-[30px] mb-[10px] [text-shadow:1px_1px_2px_rgba(255,255,255,0.7)]">
                        {getWelcomeMessage()}
                    </h2>
                </div>

                {/* Controles de navegación de mes y selector de vista */}
                <div className="mb-5 bg-white/85 p-[15px] rounded-lg flex flex-col sm:flex-row justify-center items-center gap-[15px] [box-shadow:0_2px_5px_rgba(0,0,0,0.1)]">
                    {/* Navegación de Mes */}
                    <div className="flex justify-center items-center gap-[15px]">
                        <button
                            onClick={() => changeMonth(-1)}
                            disabled={isLoading}
                            className="py-[10px] px-[20px] text-base bg-blue-600 text-white border-none rounded-[5px] cursor-pointer transition-colors duration-300 ease-in-out transform active:scale-[0.98] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            &lt; Anterior
                        </button>
                        <span className="text-[1.3rem] font-bold text-gray-800 min-w-[180px] text-center">
                            {monthYearFormatter.format(currentMonth)}
                        </span>
                        <button
                            onClick={() => changeMonth(1)}
                            disabled={isLoading}
                            className="py-[10px] px-[20px] text-base bg-blue-600 text-white border-none rounded-[5px] cursor-pointer transition-colors duration-300 ease-in-out transform active:scale-[0.98] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Siguiente &gt;
                        </button>
                    </div>
                    {/* Selector de Vista (Mes/Semana) */}
                    <div className="mt-3 sm:mt-0">
                        <select 
                            value={viewMode} 
                            onChange={(e) => setViewMode(e.target.value)}
                            className="py-[10px] px-[15px] text-base border border-gray-300 rounded-[5px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            <option value="month">Ver por Mes</option>
                            <option value="week">Ver por Semana</option>
                        </select>
                    </div>
                </div>

                {/* Indicador de carga */}
                {isLoading && (
                    <div className="w-full max-w-[600px] my-5 mx-auto p-[15px] rounded-lg text-center text-[1.1rem] font-bold bg-yellow-100/90 text-yellow-800">
                        Cargando tareas...
                    </div>
                )}
                {/* Mensaje de error */}
                {error && (
                    <div className="w-full max-w-[600px] my-5 mx-auto p-[15px] rounded-lg text-center text-[1.1rem] font-bold bg-red-100/90 text-red-800">
                        {error}
                    </div>
                )}

                {/* Vista por Mes */}
                {!isLoading && !error && viewMode === 'month' && (
                    <div className="flex flex-col gap-[25px] p-[25px] rounded-[10px] w-full bg-white/90 [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
                        {generateMonthDays().map((dayNumber) => {
                            const dailyTasks = getTasksForDay(dayNumber); 
                            return (
                                <div key={`month-day-${dayNumber}`} className="bg-white p-5 rounded-lg border border-gray-200">
                                    <h3 className="text-[1.6rem] mt-0 mb-[15px] text-blue-700 border-b-2 border-gray-100 pb-[10px]">
                                        {dayNumber} de {currentMonth.toLocaleString('es-ES', { month: 'long' })}
                                    </h3>
                                    <div className="flex flex-col gap-[15px]">
                                        {dailyTasks.length === 0 ? (
                                            <p className="text-gray-500 italic py-[10px]">No hay tareas para este día.</p>
                                        ) : (
                                            dailyTasks.map((task) => (
                                                <div
                                                    key={task.id || task._id} 
                                                    className="p-[15px] border border-gray-300 border-l-[5px] border-l-blue-600 rounded-md bg-gray-50 transition-shadow duration-300 ease-in-out [box-shadow:0_1px_3px_rgba(0,0,0,0.08)] hover:[box-shadow:0_3px_6px_rgba(0,0,0,0.12)]"
                                                >
                                                    <p className="my-[5px] leading-normal"><strong className="text-gray-800">{task.titulo}</strong></p>
                                                    <p className="my-[5px] leading-normal">{task.descripcion}</p>
                                                    {task.hora && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.9em]">Hora: {task.hora}</small></p>}
                                                    {task.plataforma && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.9em]">Plataforma: {task.plataforma}</small></p>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {tasks.length === 0 && generateMonthDays().length > 0 && (
                            <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5">
                                <p className="text-gray-500 italic py-[10px]">No hay tareas programadas para este mes.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Vista por Semana (una semana a la vez) */}
                {!isLoading && !error && viewMode === 'week' && (() => {
                    // const weeksToDisplay = getWeeksInCurrentMonth(); // Ya se calcula fuera del return
                    if (!weeksToDisplay || weeksToDisplay.length === 0) {
                        return (
                            <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5">
                                <p className="text-gray-500 italic py-[10px]">No hay semanas para mostrar en este mes.</p>
                            </div>
                        );
                    }
                    const currentDisplayWeek = weeksToDisplay[currentWeekIndex];
                     if (!currentDisplayWeek) { // Seguridad adicional
                        return (
                            <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5">
                                <p className="text-gray-500 italic py-[10px]">No se pudo cargar la información de la semana.</p>
                            </div>
                        );
                    }


                    return (
                        <div className="flex flex-col gap-[25px] p-[25px] rounded-[10px] w-full bg-white/90 [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
                            {/* Controles de Navegación Semanal */}
                            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-md">
                                <button 
                                    onClick={() => changeWeek(-1)} 
                                    disabled={currentWeekIndex === 0 || isLoading}
                                    className="py-2 px-4 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                                >
                                    &lt; Semana Anterior
                                </button>
                                <h3 className="text-lg sm:text-xl font-semibold text-center text-green-700 mx-2">
                                    {currentDisplayWeek.displayLabel}
                                </h3>
                                <button 
                                    onClick={() => changeWeek(1)} 
                                    disabled={currentWeekIndex >= weeksToDisplay.length - 1 || isLoading}
                                    className="py-2 px-4 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                                >
                                    Semana Siguiente &gt;
                                </button>
                            </div>

                            {/* Contenido de la semana actual (días y tareas) */}
                            <div className="bg-white p-5 rounded-lg border border-gray-200">
                                {getDaysForWeekInMonth(currentDisplayWeek.startDate, currentDisplayWeek.endDate).map(dayDate => {
                                    const dailyTasks = getTasksForDay(dayDate.getDate(), dayDate.getMonth(), dayDate.getFullYear());
                                    return (
                                        <div key={`week-${currentDisplayWeek.weekNumber}-day-${dayDate.getDate()}`} className="mb-5 pl-4 border-l-4 border-green-200 py-2">
                                            <h4 className="text-[1.4rem] mt-0 mb-[10px] text-green-600">
                                                {dayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h4>
                                            <div className="flex flex-col gap-[10px]">
                                                {dailyTasks.length === 0 ? (
                                                    <p className="text-gray-500 italic py-[5px] text-sm">No hay tareas para este día.</p>
                                                ) : (
                                                    dailyTasks.map((task) => (
                                                        <div
                                                            key={task.id || task._id}
                                                            className="p-[10px] border border-gray-300 border-l-[5px] border-l-green-500 rounded-md bg-gray-50 transition-shadow duration-300 ease-in-out [box-shadow:0_1px_2px_rgba(0,0,0,0.06)] hover:[box-shadow:0_2px_4px_rgba(0,0,0,0.1)]"
                                                        >
                                                            <p className="my-[5px] leading-normal"><strong className="text-gray-800">{task.titulo}</strong></p>
                                                            <p className="my-[5px] leading-normal text-sm">{task.descripcion}</p>
                                                            {task.hora && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.85em]">Hora: {task.hora}</small></p>}
                                                            {task.plataforma && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.85em]">Plataforma: {task.plataforma}</small></p>}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {getDaysForWeekInMonth(currentDisplayWeek.startDate, currentDisplayWeek.endDate).length === 0 && (
                                     <p className="text-gray-500 italic py-[10px]">Esta semana no tiene días en el mes actual.</p>
                                )}
                            </div>
                             {tasks.length === 0 && weeksToDisplay.length > 0 && ( // Si no hay tareas en todo el mes
                                <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5">
                                    <p className="text-gray-500 italic py-[10px]">No hay tareas programadas para este mes.</p>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default Principal;
