// Importa las dependencias necesarias de React y otras bibliotecas.
import React, { useState, useEffect, useCallback } from 'react';
// Importa el hook para acceder al contexto proporcionado por Outlet en React Router.
import { useOutletContext } from 'react-router-dom';
// Importa la biblioteca Axios para realizar peticiones HTTP.
import axios from 'axios';

// Define el componente funcional Principal.
const Principal = () => {
    // Obtiene el 'username' del contexto proporcionado por el Outlet de React Router.
    const { username } = useOutletContext();
    // Define el estado 'currentMonth' para almacenar la fecha del mes actual, inicializado con la fecha de hoy.
    const [currentMonth, setCurrentMonth] = useState(new Date());
    // Define el estado 'tasks' para almacenar la lista de tareas obtenidas, inicializado como un array vacío.
    const [tasks, setTasks] = useState([]);
    // Define el estado 'isLoading' para controlar la visualización de un indicador de carga.
    const [isLoading, setIsLoading] = useState(false);
    // Define el estado 'error' para almacenar mensajes de error si ocurren durante la carga de datos.
    const [error, setError] = useState(null);

    // Define una función asíncrona 'fetchTasks' para obtener las tareas, memoizada con useCallback.
    const fetchTasks = useCallback(async () => {
        // Verifica si el 'username' está disponible antes de proceder.
        if (!username) {
            // Imprime un mensaje en consola si el username aún no está disponible.
            console.log("Esperando nombre de usuario...");
            // Vacía la lista de tareas si no hay username.
            setTasks([]);
            // Termina la ejecución de la función si no hay username.
            return;
        }

        // Establece el estado 'isLoading' a true para mostrar el indicador de carga.
        setIsLoading(true);
        // Resetea el estado 'error' a null al iniciar una nueva petición.
        setError(null);
        // Obtiene el año completo del estado 'currentMonth'.
        const year = currentMonth.getFullYear();
        // Obtiene el mes del estado 'currentMonth' (0 para Enero, 11 para Diciembre).
        const month = currentMonth.getMonth();

        // Imprime en consola los datos con los que se realizará la petición (para depuración).
        console.log(`Workspaceing tasks for: ${username}, Year: ${year}, Month: ${month}`);

        // Inicia un bloque try-catch para manejar posibles errores durante la petición HTTP.
        try {
            // Realiza una petición GET a la API de tareas usando axios.
            const response = await axios.get(`http://localhost:3000/api/tasks`, {
                // Pasa los parámetros 'username', 'year' y 'month' en la query string de la URL.
                params: {
                    username: username,
                    year: year,
                    month: month // Parámetro 'month' enviado al backend (formato 0-11).
                },
                // Establece un tiempo máximo de espera para la respuesta de la petición (10 segundos).
                timeout: 10000
            });
            // Imprime en consola los datos recibidos de la API (para depuración).
            console.log("Tasks received:", response.data);
            // Actualiza el estado 'tasks' con los datos recibidos (o un array vacío si no hay datos).
            setTasks(response.data || []);
        // Captura cualquier error que ocurra durante la petición.
        } catch (error) {
            // Imprime el error detallado en la consola.
            console.error('Error al obtener tareas:', error);
            // Establece un mensaje de error en el estado 'error' para mostrar al usuario.
            setError('No se pudieron cargar las tareas. Inténtalo de nuevo más tarde.');
            // Vacía la lista de tareas en caso de error.
            setTasks([]);
        // El bloque finally se ejecuta siempre, haya habido error o no.
        } finally {
            // Establece el estado 'isLoading' a false para ocultar el indicador de carga.
            setIsLoading(false);
        }
    // Define las dependencias de useCallback: la función se recreará si 'username' o 'currentMonth' cambian.
    }, [username, currentMonth]);

    // Hook useEffect que se ejecuta cuando el componente se monta y cada vez que 'fetchTasks' cambia.
    useEffect(() => {
        // Llama a la función 'fetchTasks' para obtener las tareas.
        fetchTasks();
    // La dependencia es 'fetchTasks', que a su vez depende de 'username' y 'currentMonth'.
    }, [fetchTasks]);

    // Define la función 'changeMonth' para actualizar el estado 'currentMonth'.
    const changeMonth = (direction) => {
        // Actualiza 'currentMonth' usando una función para asegurar el acceso al valor previo.
        setCurrentMonth(prevMonth => {
            // Crea un nuevo objeto Date basado en el mes anterior.
            const newDate = new Date(prevMonth);
            // Modifica el mes del nuevo objeto Date sumando la dirección (-1 o 1).
            newDate.setMonth(prevMonth.getMonth() + direction);
            // Comentario de código original: // if (newDate > new Date() && direction > 0) return prevMonth;
            // Devuelve la nueva fecha calculada para actualizar el estado.
            return newDate;
        });
    };

    // Define la función 'generateMonthDays' para crear un array con los números de los días del mes actual.
    const generateMonthDays = () => {
        // Calcula el número de días en el mes actual. Se usa mes+1 y día 0 para obtener el último día del mes actual.
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        // Crea y devuelve un array con números desde 1 hasta el número de días en el mes.
        return Array.from({ length: daysInMonth }, (_, index) => index + 1);
    };

    // Define la función 'getTasksForDay' para filtrar las tareas del estado 'tasks' que corresponden a un día específico.
    const getTasksForDay = (day) => {
        // Filtra el array 'tasks'.
        return tasks.filter((task) => {
            // Inicia un bloque try-catch para manejar posibles errores con las fechas de las tareas.
            try {
                // Verifica si la propiedad 'fecha' existe en la tarea.
                if (!task.fecha) return false; // Si no hay fecha, no se incluye la tarea.
                // Crea un objeto Date a partir de la propiedad 'fecha' de la tarea.
                const taskDate = new Date(task.fecha);
                // Verifica si el objeto Date creado es válido.
                if (isNaN(taskDate.getTime())) {
                    // Advierte en consola si el formato de fecha no es válido.
                    console.warn("Formato de fecha inválido detectado:", task.fecha, "para tarea:", task.id);
                    // Si la fecha no es válida, no se incluye la tarea.
                    return false;
                }
                // Compara el día, mes y año de la tarea con el día proporcionado y el mes/año del estado 'currentMonth'.
                return taskDate.getDate() === day &&
                       taskDate.getMonth() === currentMonth.getMonth() &&
                       taskDate.getFullYear() === currentMonth.getFullYear();
            // Captura cualquier error durante el procesamiento de la fecha.
            } catch (e) {
                // Imprime el error en consola.
                console.error("Error procesando fecha de tarea:", task.fecha, e);
                // Si hay un error, no se incluye la tarea.
                return false;
            }
        });
    };

    // Crea un formateador de fechas internacionalizado para mostrar el mes y año en español.
    const monthYearFormatter = new Intl.DateTimeFormat('es-ES', {
        month: 'long', // Formato de mes: nombre completo (e.g., "Abril").
        year: 'numeric' // Formato de año: número (e.g., "2025").
    });

    // Inicio de la estructura JSX que renderiza el componente.
    return (
        // Contenedor principal del componente
        <div
            className="flex flex-col items-center relative min-h-screen w-full p-5 pb-[70px] box-border"
            style={{
                // Establece la imagen de fondo usando una variable de entorno para la ruta.
                backgroundImage: `url(${process.env.PUBLIC_URL}/icons/fondovertical.png)`,
                // Ajusta el tamaño del fondo al 100% del ancho y altura automática para mantener la proporción.
                backgroundSize: '100% auto',
                // Posiciona la imagen de fondo arriba y centrada.
                backgroundPosition: 'top center',
                // Hace que la imagen de fondo se repita solo verticalmente.
                backgroundRepeat: 'repeat-y',
            }}
        >
            {/* Contenedor que envuelve el contenido principal para aplicar estilos o centrado. */}
            <div className="w-full max-w-[1200px] mb-[50px] z-10 flex flex-col items-center">
                {/* Sección para mostrar el mensaje de bienvenida. */}
                <div className="w-full text-center mb-[30px]">
                    {/* Muestra un mensaje de bienvenida personalizado si 'username' existe, o uno genérico si no. */}
                    <h2 className="text-[clamp(1.5rem,4vw,2rem)] text-center text-gray-800 mt-[30px] mb-[10px] [text-shadow:1px_1px_2px_rgba(255,255,255,0.7)]">
                        {username ? `Bienvenido ${username}, consulta tus novedades` : 'Bienvenido, consulta tus novedades'}
                    </h2>
                </div>

                {/* Sección para la navegación entre meses. */}
                <div className="mb-[30px] bg-white/85 p-[15px] rounded-lg flex justify-center items-center gap-[15px] [box-shadow:0_2px_5px_rgba(0,0,0,0.1)]">
                    {/* Botón para ir al mes anterior. Llama a changeMonth con -1. Deshabilitado si isLoading es true. */}
                    <button
                        onClick={() => changeMonth(-1)}
                        disabled={isLoading}
                        className="py-[10px] px-[20px] text-base bg-blue-600 text-white border-none rounded-[5px] cursor-pointer transition-colors duration-300 ease-in-out transform active:scale-[0.98] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        &lt; Anterior
                    </button>
                    {/* Muestra el mes y año actual formateado. */}
                    <span className="text-[1.3rem] font-bold text-gray-800 min-w-[180px] text-center">
                        {monthYearFormatter.format(currentMonth)}
                    </span>
                    {/* Botón para ir al mes siguiente. Llama a changeMonth con 1. Deshabilitado si isLoading es true. */}
                    <button
                        onClick={() => changeMonth(1)}
                        disabled={isLoading}
                        className="py-[10px] px-[20px] text-base bg-blue-600 text-white border-none rounded-[5px] cursor-pointer transition-colors duration-300 ease-in-out transform active:scale-[0.98] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Siguiente &gt;
                    </button>
                </div>

                {/* Muestra un mensaje de carga si isLoading es true. */}
                {isLoading && (
                    <div className="w-full max-w-[600px] my-5 mx-auto p-[15px] rounded-lg text-center text-[1.1rem] font-bold bg-yellow-100/90 text-yellow-800">
                        Cargando tareas...
                    </div>
                )}
                {/* Muestra un mensaje de error si error tiene un valor. */}
                {error && (
                    <div className="w-full max-w-[600px] my-5 mx-auto p-[15px] rounded-lg text-center text-[1.1rem] font-bold bg-red-100/90 text-red-800">
                        {error}
                    </div>
                )}

                {/* Renderiza la lista de tareas solo si no está cargando y no hay errores. */}
                {!isLoading && !error && (
                    // Contenedor para la lista de días y sus tareas.
                    <div className="flex flex-col gap-[25px] p-[25px] rounded-[10px] w-full bg-white/90 [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
                        {/* Itera sobre el array de días generado por generateMonthDays. */}
                        {generateMonthDays().map((day) => {
                            // Obtiene las tareas filtradas para el día actual de la iteración.
                            const dailyTasks = getTasksForDay(day);
                            // Renderiza un contenedor para cada día. 'key' es necesaria para listas en React.
                            return (
                                <div key={day} className="bg-white p-5 rounded-lg border border-gray-200">
                                    {/* Muestra el número del día y el nombre del mes. */}
                                    <h3 className="text-[1.6rem] mt-0 mb-[15px] text-blue-700 border-b-2 border-gray-100 pb-[10px]">
                                        {day} de {currentMonth.toLocaleString('es-ES', { month: 'long' })}
                                    </h3>

                                    {/* Contenedor para las tareas de este día específico. */}
                                    <div className="flex flex-col gap-[15px]">
                                        {/* Comprueba si no hay tareas para este día. */}
                                        {dailyTasks.length === 0 ? (
                                            // Muestra un mensaje si no hay tareas.
                                            <p className="text-gray-500 italic py-[10px]">No hay tareas para este día.</p>
                                        ) : (
                                            // Si hay tareas, itera sobre ellas.
                                            dailyTasks.map((task) => (
                                                // Renderiza un contenedor para cada tarea. Usa task.id o task._id como key.
                                                <div
                                                    key={task.id || task._id}
                                                    className="p-[15px] border border-gray-300 border-l-[5px] border-l-blue-600 rounded-md bg-gray-50 transition-shadow duration-300 ease-in-out [box-shadow:0_1px_3px_rgba(0,0,0,0.08)] hover:[box-shadow:0_3px_6px_rgba(0,0,0,0.12)]"
                                                >
                                                    {/* Muestra el título de la tarea en negrita. */}
                                                    <p className="my-[5px] leading-normal"><strong className="text-gray-800">{task.titulo}</strong></p>
                                                    {/* Muestra la descripción de la tarea. */}
                                                    <p className="my-[5px] leading-normal">{task.descripcion}</p>
                                                    {/* Muestra la hora de la tarea si existe. */}
                                                    {task.hora && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.9em]">Hora: {task.hora}</small></p>}
                                                    {/* Muestra la plataforma de la tarea si existe. */}
                                                    {task.plataforma && <p className="my-[5px] leading-normal"><small className="text-gray-600 text-[0.9em]">Plataforma: {task.plataforma}</small></p>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Muestra un mensaje general si no hay ninguna tarea en todo el mes y hay días en el mes. */}
                        {tasks.length === 0 && generateMonthDays().length > 0 && (
                            <div className="bg-white p-5 rounded-lg border border-gray-200">
                                <p className="text-gray-500 italic py-[10px]">No hay tareas programadas para este mes.</p>
                            </div>
                        )}
                    </div>
                )}
            {/* Cierre del div 'content-wrapper'. */}
            </div>
        {/* Cierre del div 'principal-container'. */}
        </div>
    );
};
// Exporta el componente Principal para que pueda ser usado en otras partes de la aplicación.
export default Principal;