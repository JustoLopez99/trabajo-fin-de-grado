// src/components/Calendario.js
import React, { useState, useEffect, useCallback } from 'react'; // Importaciones básicas de React
import { useOutletContext } from 'react-router-dom'; // Hook para acceder al contexto del Outlet (para 'username')
import axios from 'axios'; // Librería para realizar peticiones HTTP

// Definición del componente funcional Calendario
const Calendario = () => {
  // Obtiene 'username' del contexto del Outlet (probablemente proporcionado por un componente Layout)
  const { username } = useOutletContext();
  // Estado para almacenar la fecha del mes que se está visualizando en el calendario. Inicializa con la fecha actual.
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Estado para almacenar el array de tareas obtenidas de la API para el mes actual.
  const [tasks, setTasks] = useState([]);
  // Estado para manejar los datos del formulario de "Añadir Nueva Tarea".
  const [formData, setFormData] = useState({
    fecha: '', // El input 'date' proporcionará un string 'YYYY-MM-DD'
    hora: '',
    plataforma: '',
    titulo: '',
    descripcion: '',
  });
  // Estado para mostrar mensajes de éxito después de enviar el formulario.
  const [formMessage, setFormMessage] = useState('');
  // Estado para mostrar mensajes de error (ya sea del formulario o de la carga de tareas).
  const [formError, setFormError] = useState('');
  // Estado para indicar si las tareas se están cargando (para mostrar un feedback al usuario).
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Función memoizada para obtener las tareas de la API.
  // Se re-creará solo si 'username' o 'currentMonth' cambian.
  const fetchTasks = useCallback(async () => {
    // Si no hay 'username' (ej. aún no se ha cargado del contexto), no hacer nada y limpiar tareas.
    if (!username) {
      setTasks([]);
      return;
    }
    // Indicar que la carga de tareas ha comenzado.
    setIsLoadingTasks(true);
    // Limpiar mensajes de error previos relacionados con la carga de tareas.
    setFormError('');
    // Obtener el año y el mes (0-indexado) del estado 'currentMonth'.
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0 para Enero, 11 para Diciembre

    // Log para depuración: muestra qué se está solicitando.
    console.log(`Calendario: Buscando tareas para usuario: ${username}, Año: ${year}, Mes: ${month}`);

    try {
      // Petición GET a la API para obtener las tareas.
      // Se envían 'username', 'year' y 'month' como parámetros query.
      const response = await axios.get(`http://localhost:3000/api/tasks`, {
        params: { username, year, month }, // El backend debe filtrar por estos parámetros
        timeout: 10000, // Tiempo máximo de espera para la respuesta (10 segundos)
      });
      // Log para depuración: muestra las tareas recibidas.
      console.log("Calendario: Tareas recibidas:", response.data);
      // Actualiza el estado 'tasks'. Si response.data es null/undefined, usa un array vacío.
      // Es crucial que la API devuelva un array.
      // También, cada objeto 'task' en response.data debe tener un campo 'id' (o '_id') y 'fecha'.
      // El campo 'fecha' debe ser un string que `new Date()` pueda parsear (ej: '2025-04-01T00:00:00.000Z').
      setTasks(response.data || []);
    } catch (error) {
      // Manejo de errores en la petición.
      console.error('Calendario: Error al obtener las tareas', error);
      setFormError('No se pudieron cargar las tareas para este mes.'); // Mensaje para el usuario
      setTasks([]); // Limpiar tareas en caso de error
    } finally {
      // Se ejecuta siempre, haya o no error. Indica que la carga ha terminado.
      setIsLoadingTasks(false);
    }
  }, [username, currentMonth]); // Dependencias de useCallback

  // Hook useEffect para ejecutar 'fetchTasks' cuando el componente se monta
  // o cuando la función 'fetchTasks' (que depende de 'username' y 'currentMonth') cambia.
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Función para cambiar el mes visualizado en el calendario.
  // 'direction' puede ser -1 (mes anterior) o 1 (mes siguiente).
  const changeMonth = (direction) => {
    setCurrentMonth(prevMonth => {
      const newDate = new Date(prevMonth);
      newDate.setMonth(prevMonth.getMonth() + direction);
      return newDate;
    });
    // No es necesario llamar a fetchTasks() aquí; el useEffect anterior se encargará
    // ya que 'currentMonth' cambia, lo que hace que 'fetchTasks' cambie su identidad y el efecto se dispare.
  };

  // Función para generar la estructura del calendario (semanas y días).
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Obtiene el día de la semana del primer día del mes (0=Domingo, 1=Lunes, ...).
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    // Obtiene el número total de días en el mes actual.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Calcula el offset para que la semana comience en Lunes (0=Lunes, ..., 6=Domingo).
    // Si firstDayOfMonth es 0 (Domingo), el offset es 6. Si es 1 (Lunes), offset es 0.
    const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const weeksArray = []; // Array para almacenar las semanas.
    let currentDay = 1; // Contador para los días del mes.

    // Itera para generar un máximo de 6 semanas (suficiente para cualquier mes).
    for (let i = 0; i < 6; i++) {
      const week = []; // Array para la semana actual.
      // Itera para los 7 días de la semana.
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < dayOffset) {
          // Si es la primera semana y el día 'j' es menor que el offset, es una celda vacía.
          week.push(null);
        } else if (currentDay <= daysInMonth) {
          // Si 'currentDay' está dentro del rango de días del mes, añade el día.
          week.push(currentDay);
          currentDay++;
        } else {
          // Si se han acabado los días del mes, añade una celda vacía.
          week.push(null);
        }
      }
      weeksArray.push(week); // Añade la semana completa al array de semanas.
      // Optimización: si ya se han añadido todos los días y se ha completado la última semana con días, salir del bucle.
      if (currentDay > daysInMonth && i >= Math.floor((dayOffset + daysInMonth - 1) / 7)) break;
    }
    return weeksArray; // Devuelve el array de semanas.
  };

  // Genera la estructura del calendario cuando 'currentMonth' cambia (porque el componente se re-renderiza).
  const weeks = generateCalendar();

  // Manejador para los cambios en los inputs del formulario.
  // Actualiza el estado 'formData' de forma genérica usando el 'id' del input.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Manejador para el envío del formulario de nueva tarea.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recarga de página).
    setFormMessage(''); // Limpia mensajes de éxito previos.
    setFormError('');   // Limpia mensajes de error previos del formulario.
    try {
      // Crea el objeto de la nueva tarea, incluyendo el 'username'.
      // formData.fecha se espera que sea 'YYYY-MM-DD' del input type="date".
      // El backend debe estar preparado para manejar este formato.
      const newTask = { ...formData, username };
      // Petición POST para añadir la nueva tarea.
      await axios.post('http://localhost:3000/api/tasks', newTask);
      setFormMessage('Tarea añadida correctamente'); // Mensaje de éxito.
      // Resetea los campos del formulario.
      setFormData({ fecha: '', hora: '', plataforma: '', titulo: '', descripcion: '' });
      fetchTasks(); // Vuelve a cargar las tareas para el mes actual para reflejar la nueva tarea.
    } catch (error) {
      console.error('Error al añadir la tarea', error);
      // Intenta obtener un mensaje de error más específico de la respuesta de la API.
      const apiErrorMessage = error.response?.data?.message || error.message || 'Error al añadir tarea';
      setFormError(apiErrorMessage); // Muestra el error en el formulario.
    }
  };

  // Objeto para mapear plataformas a clases de color de Tailwind CSS para la línea/punto de la tarea.
  // Se ajustaron los colores para que sean un poco más oscuros y visibles como líneas.
  const platformColors = {
    Instagram: 'bg-blue-500',
    Tiktok: 'bg-green-500',
    Facebook: 'bg-pink-500',
    Web: 'bg-yellow-500', // Tailwind bg-yellow-300 puede ser muy claro para una línea
    Otra: 'bg-gray-500',
  };

  // Objeto para los colores de los puntos en la leyenda (puede ser igual o diferente a platformColors).
  const platformDotColors = {
    Instagram: 'bg-blue-400',
    Tiktok: 'bg-green-400',
    Facebook: 'bg-pink-400',
    Web: 'bg-yellow-400',
    Otra: 'bg-gray-400',
  };
  
  // Formateador de fecha para mostrar "Mes Año" (ej. "Abril 2025") en el encabezado del calendario.
  const monthYearFormatter = new Intl.DateTimeFormat('es-ES', {
    month: 'long', // Nombre completo del mes
    year: 'numeric' // Año en números
  });

  // Inicio del JSX que se renderizará.
  return (
    <div
      className="flex flex-col lg:flex-row w-full h-full items-start" // Layout principal flex
      style={{ // Estilo en línea para la imagen de fondo
        backgroundImage: `url(${process.env.PUBLIC_URL}/icons/fondo.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Sección principal del calendario y formulario (ocupa 3/4 en pantallas grandes) */}
      <div className="w-full lg:w-3/4 p-4 sm:p-6 md:p-8 flex flex-col gap-10 overflow-y-auto h-full">
        {/* Contenedor del calendario */}
        <div className="bg-white/90 p-5 rounded-lg shadow-xl"> {/* Fondo semi-transparente */}
          {/* Encabezado del calendario: botones de navegación y mes/año actual */}
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold mb-5">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-200" disabled={isLoadingTasks}>&lt;</button>
            <span>{monthYearFormatter.format(currentMonth)}</span>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-200" disabled={isLoadingTasks}>&gt;</button>
          </div>

          {/* Nombres de los días de la semana */}
          <div className="grid grid-cols-7 font-bold bg-gray-100 p-2 text-center rounded-md text-sm sm:text-base">
            <div>Lunes</div><div>Martes</div><div>Miércoles</div>
            <div>Jueves</div><div>Viernes</div><div>Sábado</div><div>Domingo</div>
          </div>
          
          {/* Indicador de carga de tareas */}
          {isLoadingTasks && <div className="text-center p-4">Cargando tareas...</div>}
          {/* Mensaje de error si no se pudieron cargar tareas y no hay tareas mostradas */}
          {!isLoadingTasks && formError && tasks.length === 0 && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md text-center my-2">{formError}</p>}

          {/* Cuadrícula de días del calendario */}
          <div className="grid grid-cols-1 gap-px bg-gray-200 border border-gray-200 mt-1">
            {/* Itera sobre cada semana generada */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-px"> {/* Fila para la semana */}
                {/* Itera sobre cada día de la semana */}
                {week.map((day, dayIndex) => (
                  // Celda para el día
                  <div key={dayIndex} className={`min-h-[80px] sm:min-h-[100px] p-1.5 text-left ${day ? 'bg-gray-50 hover:bg-gray-200' : 'bg-gray-100/50'}`}>
                    {/* Solo renderiza contenido si 'day' no es null (es un día válido del mes) */}
                    {day && (
                      // Contenedor para el número del día y sus tareas
                      <div className="text-xs sm:text-sm font-bold mb-1 flex flex-col items-start h-full">
                        {day} {/* Número del día */}
                        {/* Contenedor para las tareas de este día */}
                        <div className="mt-1 space-y-1 w-full">
                          {tasks // Array de tareas del mes actual
                            .filter(task => { // Filtra las tareas para este día específico
                              // Comprobación de seguridad: si la tarea no tiene fecha, se descarta.
                              if (!task.fecha) {
                                console.warn("Tarea sin fecha encontrada:", task);
                                return false;
                              }
                              // **CORRECCIÓN IMPORTANTE: Parsea task.fecha directamente.**
                              // Se asume que task.fecha es una cadena ISO válida (ej: '2025-04-01T00:00:00.000Z')
                              // como la que se vio en la consola de error.
                              const taskDate = new Date(task.fecha);
                              
                              // Comprueba si el objeto Date creado es válido.
                              if (isNaN(taskDate.getTime())) {
                                console.warn(`Fecha inválida procesada de ('${task.fecha}') para tarea: ${task.titulo || task.id}`);
                                return false;
                              }
                              // Compara día, mes y año de la tarea con el día actual del calendario y el mes/año visualizado.
                              // .getDate() y .getMonth() en taskDate devuelven valores basados en la zona horaria local del navegador.
                              // currentMonth también está en la zona horaria local.
                              return taskDate.getDate() === day &&
                                     taskDate.getMonth() === currentMonth.getMonth() &&
                                     taskDate.getFullYear() === currentMonth.getFullYear();
                            })
                            .map(task => ( // Mapea las tareas filtradas para este día a elementos JSX
                              // Elemento para mostrar cada tarea individual
                              <div
                                key={task.id || task._id} // Clave única para React. Asegúrate que 'task.id' (o '_id') es correcto.
                                                            // Si usas PostgreSQL SERIAL PRIMARY KEY id, entonces es task.id.
                                className="w-full flex items-center" // Contenedor flex para alinear la línea de color y el título.
                                title={`${task.plataforma}: ${task.titulo} - ${task.descripcion || ''}`} // Tooltip opcional con más detalles.
                              >
                                {/* Línea de color indicando la plataforma */}
                                <span
                                  className={`inline-block w-2 flex-shrink-0 h-3 mr-1.5 rounded-sm ${platformColors[task.plataforma] || 'bg-gray-400'}`}
                                ></span> {/* `flex-shrink-0` evita que la línea se encoja. `rounded-sm` para bordes suaves. */}
                                {/* Título de la tarea */}
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

        {/* Sección del formulario para añadir nueva tarea */}
        <div className="bg-white p-5 rounded-lg shadow-xl">
          <h2 className="text-center text-xl font-semibold mb-5 text-gray-700">Añadir Nueva Tarea</h2>
          {/* Mensaje de éxito del formulario */}
          {formMessage && <p className="mb-3 p-3 text-sm text-green-700 bg-green-100 rounded-md">{formMessage}</p>}
          {/* Mensaje de error del formulario (si no se están cargando tareas generales) */}
          {formError && !isLoadingTasks && <p className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-md">{formError}</p>}
          
          {/* Formulario */}
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
      </div>

      {/* Barra lateral para la leyenda (ocupa 1/4 en pantallas grandes) */}
      <aside className="w-full lg:w-1/4 p-4 sm:p-6 md:p-8 lg:sticky lg:top-[calc(7vh+2rem)] lg:h-[calc(93vh-4rem)]">
        <div className="bg-purple-100/70 rounded-lg p-4 shadow-lg h-full lg:overflow-y-auto">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">Leyenda</h3>
          <div className="space-y-2">
            {/* Mapea el objeto platformDotColors para crear la leyenda dinámicamente */}
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

export default Calendario; // Exporta el componente para su uso en otras partes de la aplicación.