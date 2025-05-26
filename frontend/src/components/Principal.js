// src/components/Principal.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Principal = () => {
    const {
        username: loggedInUsername,
        userRole,
        viewingAsUsername,
        fullName
    } = useOutletContext() || {};

    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('month');
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

    const getEffectiveUsername = useCallback(() => {
        if (userRole === 'admin' && viewingAsUsername) {
            return viewingAsUsername;
        }
        return loggedInUsername;
    }, [userRole, loggedInUsername, viewingAsUsername]);

    const fetchTasks = useCallback(async () => {
        const usernameToFetch = getEffectiveUsername();
        if (!usernameToFetch) {
            setTasks([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        console.log(`Principal: Buscando tareas para usuario: ${usernameToFetch}, Año LOCAL: ${year}, Mes LOCAL (0-indexed): ${month}`);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/tasks`, {
                params: {
                    username: usernameToFetch,
                    year: year,
                    month: month + 1
                },
                timeout: 10000,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const fetchedTasks = response.data || [];
            console.log("Principal: Tareas recibidas del backend:", fetchedTasks); // DEBUG: Ver qué llega

            setTasks(fetchedTasks.map(task => {
                // Convertir la cadena de fecha del backend a un objeto Date de JS.
                // new Date() puede interpretar "YYYY-MM-DD" como UTC o local dependiendo del navegador.
                // Si task.fecha es un ISO string completo (ej: "2023-10-26T00:00:00.000Z"), new Date() lo manejará bien.
                // Si es solo "YYYY-MM-DD", para asegurar que se trata como una fecha local y no UTC medianoche
                // (que podría cambiar de día por timezone), es mejor parsearlo con cuidado o añadir T00:00:00.
                // Pero dado que Calendario.js usa new Date(task.fecha) y parece funcionar, probemos eso primero.
                let fechaObj = null;
                if (task.fecha) {
                    // Si task.fecha es solo "YYYY-MM-DD", new Date() puede interpretarlo como UTC.
                    // Para tratarlo como local, podemos dividirlo.
                    const parts = task.fecha.split('-');
                    if (parts.length === 3) {
                        // Año, Mes (0-indexado), Día
                        fechaObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    } else {
                        // Si es un timestamp completo, new Date() debería funcionar
                        fechaObj = new Date(task.fecha);
                    }
                     // Verifica si la fecha es válida después de parsear
                    if (isNaN(fechaObj.getTime())) {
                        console.warn(`Principal: Fecha inválida para tarea ID ${task.id || 'N/A'}: '${task.fecha}'`);
                        fechaObj = null; // Asignar null si la fecha es inválida
                    }
                }
                
                return {
                    ...task,
                    completado: task.completado === undefined ? false : Boolean(task.completado),
                    fechaObj: fechaObj // Almacenamos el objeto Date parseado
                };
            }));
        } catch (err) {
            console.error('Principal: Error al obtener tareas:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'No se pudieron cargar las tareas. Inténtalo de nuevo.');
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth, getEffectiveUsername]);

    useEffect(() => {
        if (loggedInUsername) {
            fetchTasks();
        }
    }, [fetchTasks, loggedInUsername]);

    useEffect(() => {
        setCurrentWeekIndex(0);
    }, [currentMonth, viewMode]);

    const handleToggleComplete = async (taskId) => {
        const effectiveUsernameForUpdate = getEffectiveUsername();
        if (!effectiveUsernameForUpdate) { /* ... manejo de error ... */ return; }
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (!taskToUpdate) { /* ... manejo de error ... */ return; }
        const calculatedNewCompletadoStatus = !taskToUpdate.completado;
        const originalTasks = tasks.map(t => ({ ...t }));
        setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, completado: calculatedNewCompletadoStatus } : task));
        setIsUpdatingTask(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) { /* ... manejo de error ... */ setTasks(originalTasks); setIsUpdatingTask(false); return; }
        try {
            await axios.patch(`http://localhost:3000/api/tasks/${taskId}/estado`,
                { completado: calculatedNewCompletadoStatus, taskOwnerUsername: effectiveUsernameForUpdate },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (err) { /* ... manejo de error ... */ setTasks(originalTasks); }
        finally { setIsUpdatingTask(false); }
    };

    const changeMonth = (direction) => {
        setCurrentMonth(prevMonth => {
            const newYear = prevMonth.getFullYear();
            const newMonth = prevMonth.getMonth() + direction;
            return new Date(newYear, newMonth, 1);
        });
    };

    const generateMonthDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, index) => index + 1);
    };

    const getTasksForDay = (dayNumber) => {
        const targetMonth = currentMonth.getMonth();
        const targetYear = currentMonth.getFullYear();

        return tasks.filter((task) => {
            // Ahora comparamos usando el objeto fechaObj que ya es un Date de JS
            if (!task.fechaObj || isNaN(task.fechaObj.getTime())) { // Verificar si fechaObj es válido
                 // console.log('Tarea sin fechaObj o fechaObj inválida:', task); // DEBUG
                return false;
            }
            // console.log(`Comparando tarea ${task.id}: ${task.fechaObj.getDate()}/${task.fechaObj.getMonth()}/${task.fechaObj.getFullYear()} con ${dayNumber}/${targetMonth}/${targetYear}`); // DEBUG
            return task.fechaObj.getDate() === dayNumber &&
                   task.fechaObj.getMonth() === targetMonth &&
                   task.fechaObj.getFullYear() === targetYear;
        });
    };
    
    const monthYearFormatter = new Intl.DateTimeFormat('es-ES', {
        month: 'long',
        year: 'numeric'
    });

    const getWelcomeMessage = () => {
        const effectiveUserDisplay = (userRole === 'admin' && viewingAsUsername) ? viewingAsUsername : (fullName || loggedInUsername);
        if (userRole === 'admin' && viewingAsUsername && viewingAsUsername !== loggedInUsername) {
            return `Viendo novedades de: ${effectiveUserDisplay}`;
        }
        return effectiveUserDisplay ? `Bienvenido ${effectiveUserDisplay}, consulta tus novedades` : 'Bienvenido, consulta tus novedades';
    };

    const getWeeksInCurrentMonth = useCallback(() => {
        const weeks = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDateOfMonth = new Date(year, month, 1);
        const lastDateOfMonth = new Date(year, month + 1, 0);
        let currentDateIterator = new Date(firstDateOfMonth);
        let dayOfWeek = currentDateIterator.getDay();
        let diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentDateIterator.setDate(currentDateIterator.getDate() + diffToMonday);
        let weekNumber = 1;
        let safety = 0;
        while (safety < 7 && currentDateIterator <= lastDateOfMonth) {
            const weekStartDate = new Date(currentDateIterator);
            const weekEndDate = new Date(currentDateIterator);
            weekEndDate.setDate(currentDateIterator.getDate() + 6);
            if (weekStartDate <= lastDateOfMonth && weekEndDate >= firstDateOfMonth) {
                const displayStartDate = new Date(Math.max(weekStartDate.getTime(), firstDateOfMonth.getTime()));
                const displayEndDate = new Date(Math.min(weekEndDate.getTime(), lastDateOfMonth.getTime()));
                weeks.push({
                    weekNumber,
                    startDate: weekStartDate,
                    endDate: weekEndDate,
                    displayLabel: `Semana ${weekNumber}: ${displayStartDate.toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})} - ${displayEndDate.toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})}`
                });
            }
            currentDateIterator.setDate(currentDateIterator.getDate() + 7);
            if (currentDateIterator.getFullYear() > year || (currentDateIterator.getFullYear() === year && currentDateIterator.getMonth() > month)) {
                if (weekEndDate < firstDateOfMonth && weekStartDate.getMonth() !== month ) break; // Ajuste para salir si la semana ya no toca el mes actual.
            }
            weekNumber++;
            safety++;
        }
        return weeks;
    }, [currentMonth]);

    const changeWeek = (direction) => {
        const weeks = getWeeksInCurrentMonth();
        setCurrentWeekIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            if (newIndex >= 0 && newIndex < weeks.length) {
                return newIndex;
            }
            return prevIndex;
        });
    };

    const getDaysForWeekInMonthView = (weekStartDate, weekEndDate) => {
        const days = [];
        let currentDate = new Date(weekStartDate);
        const actualMonth = currentMonth.getMonth();
        const actualYear = currentMonth.getFullYear();
        for (let i = 0; i < 7; i++) {
            if (currentDate.getMonth() === actualMonth && currentDate.getFullYear() === actualYear) {
                days.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    };
    
    const weeksToDisplay = getWeeksInCurrentMonth();

    return (
        <div
            className="flex flex-col items-center relative min-h-screen w-full p-5 pb-[70px] box-border"
            style={{ backgroundColor: 'white' }}
        >
            <div className="w-full max-w-[1200px] mb-[50px] z-10 flex flex-col items-center">
                <div className="w-full text-center mb-[30px]">
                    <h2 className="text-[clamp(1.5rem,4vw,2rem)] text-center text-gray-800 mt-[30px] mb-[10px] [text-shadow:1px_1px_2px_rgba(255,255,255,0.7)]">
                        {getWelcomeMessage()}
                    </h2>
                </div>

                <div className="mb-5 bg-white/85 p-[15px] rounded-lg flex flex-col sm:flex-row justify-center items-center gap-[15px] [box-shadow:0_2px_5px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-center items-center gap-[15px]">
                        <button
                            onClick={() => changeMonth(-1)}
                            disabled={isLoading || isUpdatingTask}
                            className="py-[10px] px-[20px] text-base bg-slate-800 text-white border-none rounded-[5px] cursor-pointer transition-colors duration-300 ease-in-out transform active:scale-[0.98] hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            &lt; Anterior
                        </button>
                        <span className="text-[1.3rem] font-bold text-gray-800 min-w-[180px] text-center">
                            {monthYearFormatter.format(currentMonth)}
                        </span>
                        <button
                            onClick={() => changeMonth(1)}
                            disabled={isLoading || isUpdatingTask}
                            className="py-[10px] px-[20px] text-base bg-slate-800 text-white border-none rounded-[5px] cursor-pointer transition-colors duration-300 ease-in-out transform active:scale-[0.98] hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Siguiente &gt;
                        </button>
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="py-[10px] px-[15px] text-base border border-gray-300 rounded-[5px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || isUpdatingTask}
                        >
                            <option value="month">Ver por Mes</option>
                            <option value="week">Ver por Semana</option>
                        </select>
                    </div>
                </div>

                {(isLoading && !isUpdatingTask) && (
                    <div className="w-full max-w-[600px] my-5 mx-auto p-[15px] rounded-lg text-center text-[1.1rem] font-bold bg-yellow-100/90 text-yellow-800">
                        Cargando tareas...
                    </div>
                )}
                {error && (
                    <div className="w-full max-w-[600px] my-5 mx-auto p-[15px] rounded-lg text-center text-[1.1rem] font-bold bg-red-100/90 text-red-800">
                        {error}
                    </div>
                )}
                {isUpdatingTask && (
                     <div className="w-full max-w-[600px] my-2 mx-auto p-[10px] rounded-lg text-center text-[1rem] font-medium bg-blue-100/90 text-blue-800">
                        Actualizando tarea...
                    </div>
                )}

                {!isLoading && !error && viewMode === 'month' && (
                    <div className="flex flex-col gap-[25px] p-[25px] rounded-[10px] w-full bg-white/90 [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
                        {generateMonthDays().map((dayNumber) => {
                            const dailyTasks = getTasksForDay(dayNumber);
                            return (
                                <div key={`month-day-${dayNumber}`} className="bg-white p-5 rounded-lg border border-gray-200">
                                    <h3 className="text-[1.6rem] mt-0 mb-[15px] text-slate-800 border-b-2 border-gray-100 pb-[10px]">
                                        {dayNumber} de {currentMonth.toLocaleDateString('es-ES', { month: 'long' })}
                                    </h3>
                                    <div className="flex flex-col gap-[15px]">
                                        {dailyTasks.length === 0 ? (
                                            <p className="text-gray-500 italic py-[10px]">No hay tareas para este día.</p>
                                        ) : (
                                            dailyTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`p-[15px] border border-gray-300 border-l-[5px] ${
                                                        task.completado ? 'border-l-green-500 bg-green-50' : 'border-l-slate-800 bg-gray-50'
                                                    } rounded-md transition-all duration-300 ease-in-out [box-shadow:0_1px_3px_rgba(0,0,0,0.08)] hover:[box-shadow:0_3px_6px_rgba(0,0,0,0.12)] flex justify-between items-center`}
                                                >
                                                    <div className="flex-grow">
                                                        <p className="my-[5px] leading-normal"><strong className="text-gray-800">{task.titulo}</strong></p>
                                                        <p className="my-[5px] leading-normal">{task.descripcion}</p>
                                                        {task.hora && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.9em]">Hora: {task.hora}</small></p>}
                                                        {task.plataforma && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.9em]">Plataforma: {task.plataforma}</small></p>}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completado || false}
                                                        onChange={() => handleToggleComplete(task.id)}
                                                        disabled={isUpdatingTask}
                                                        className="h-5 w-5 accent-green-600 rounded border-gray-300 focus:ring-green-500 ml-4 cursor-pointer flex-shrink-0 disabled:opacity-50"
                                                        aria-label={`Marcar ${task.titulo} como completada`}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {tasks.length === 0 && !isLoading && generateMonthDays().length > 0 && !error && (
                            <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5">
                                <p className="text-gray-500 italic py-[10px]">No hay tareas programadas para este mes.</p>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && !error && viewMode === 'week' && (() => {
                    if (!weeksToDisplay || weeksToDisplay.length === 0) {
                        return <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5"><p className="text-gray-500 italic py-[10px]">No hay semanas para mostrar en este mes.</p></div>;
                    }
                    const currentDisplayWeek = weeksToDisplay[currentWeekIndex];
                     if (!currentDisplayWeek) {
                        return <div className="bg-white p-5 rounded-lg border border-gray-200 mt-5"><p className="text-gray-500 italic py-[10px]">No se pudo cargar la información de la semana.</p></div>;
                    }
                    const daysInWeekForMonthView = getDaysForWeekInMonthView(currentDisplayWeek.startDate, currentDisplayWeek.endDate);

                    return (
                        <div className="flex flex-col gap-[25px] p-[25px] rounded-[10px] w-full bg-white/90 [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
                            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-md">
                                <button onClick={() => changeWeek(-1)} disabled={currentWeekIndex === 0 || isLoading || isUpdatingTask} className="py-2 px-4 text-sm bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-300">&lt; Semana Anterior</button>
                                <h3 className="text-lg sm:text-xl font-semibold text-center text-slate-800 mx-2">{currentDisplayWeek.displayLabel}</h3>
                                <button onClick={() => changeWeek(1)} disabled={currentWeekIndex >= weeksToDisplay.length - 1 || isLoading || isUpdatingTask} className="py-2 px-4 text-sm bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-300">Semana Siguiente &gt;</button>
                            </div>
                            <div className="bg-white p-5 rounded-lg border border-gray-200">
                                {daysInWeekForMonthView.length === 0 && <p className="text-gray-500 italic py-[10px]">Esta porción de la semana no tiene días en el mes actual.</p>}
                                {daysInWeekForMonthView.map(dayDate => {
                                    const dailyTasks = getTasksForDay(dayDate.getDate());
                                    return (
                                        <div key={`week-${currentDisplayWeek.weekNumber}-day-${dayDate.toISOString()}`} className="mb-5 pl-4 border-l-4 border-slate-400 py-2">
                                            <h4 className="text-[1.4rem] mt-0 mb-[10px] text-slate-800">{dayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                                            <div className="flex flex-col gap-[10px]">
                                                {dailyTasks.length === 0 ? (
                                                    <p className="text-gray-500 italic py-[5px] text-sm">No hay tareas para este día.</p>
                                                ) : (
                                                    dailyTasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={`p-[10px] border border-gray-300 border-l-[5px] ${
                                                                task.completado ? 'border-l-green-500 bg-green-50' : 'border-l-slate-800 bg-gray-50'
                                                            } rounded-md transition-all duration-300 ease-in-out [box-shadow:0_1px_2px_rgba(0,0,0,0.06)] hover:[box-shadow:0_2px_4px_rgba(0,0,0,0.1)] flex justify-between items-center`}
                                                        >
                                                            <div className="flex-grow">
                                                                <p className="my-[5px] leading-normal"><strong className="text-gray-800">{task.titulo}</strong></p>
                                                                <p className="my-[5px] leading-normal text-sm">{task.descripcion}</p>
                                                                {task.hora && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.85em]">Hora: {task.hora}</small></p>}
                                                                {task.plataforma && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.85em]">Plataforma: {task.plataforma}</small></p>}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={task.completado || false}
                                                                onChange={() => handleToggleComplete(task.id)}
                                                                disabled={isUpdatingTask}
                                                                className="h-5 w-5 accent-green-600 rounded border-gray-300 focus:ring-green-500 ml-4 cursor-pointer flex-shrink-0 disabled:opacity-50"
                                                                aria-label={`Marcar ${task.titulo} como completada`}
                                                            />
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                             {tasks.length === 0 && !isLoading && weeksToDisplay.length > 0 && !error && (<div className="bg-white p-5 rounded-lg border border-gray-200 mt-5"><p className="text-gray-500 italic py-[10px]">No hay tareas programadas para este mes.</p></div>)}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default Principal;