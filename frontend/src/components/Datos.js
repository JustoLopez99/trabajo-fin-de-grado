// src/components/Datos.js
import React, { useState, useEffect, useCallback } from 'react'; // Importaciones básicas de React
import { useOutletContext } from 'react-router-dom'; // Hook para acceder al contexto del Outlet (para 'username')
import axios from 'axios'; // Librería para realizar peticiones HTTP

// Definición del componente funcional Datos
const Datos = () => {
  // Obtiene 'username' del contexto del Outlet
  const { username } = useOutletContext();
  // Estado para la página actual de la tabla de publicaciones
  const [currentPage, setCurrentPage] = useState(1);
  // Estado para el número de ítems por página (constante en este caso)
  const [itemsPerPage] = useState(10);
  // Estado para el número total de páginas (calculado a partir de la respuesta de la API)
  const [totalPages, setTotalPages] = useState(0);
  // Estado para almacenar el array de publicaciones obtenidas de la API
  const [publicaciones, setPublicaciones] = useState([]);
  // Estado para indicar si las publicaciones se están cargando
  const [isLoading, setIsLoading] = useState(true);
  // Estado para almacenar mensajes de error si ocurren durante la carga de la tabla
  const [tableError, setTableError] = useState('');

  // Estado inicial para el formulario de añadir publicación. Se usa para resetear el formulario.
  const initialFormData = {
    tipo_post: '',
    titulo: '',
    fecha_publicacion: '',
    hora_publicacion: '',
    impresiones: '',
    me_gusta: '',
    comentarios: '',
    compartidos: '',
    clics_enlaces: '',
    contiene_enlace: false, // Checkbox
    tiempo_retencion: '',
    tiempo_retencion_na: false, // Checkbox para N/A en tiempo_retencion
    formato_contenido: '',
    notas: '',
  };

  // Estado para manejar los datos del formulario de "Añadir Nueva Publicación"
  const [formData, setFormData] = useState(initialFormData);
  // Estado para mostrar mensajes de éxito después de enviar el formulario
  const [formMessage, setFormMessage] = useState('');
  // Estado para mostrar mensajes de error del formulario
  const [formError, setFormError] = useState('');

  // Función memoizada para obtener las publicaciones de la API con paginación.
  // Se re-creará solo si 'username', 'currentPage', o 'itemsPerPage' cambian.
  const fetchPublicaciones = useCallback(async () => {
    // Si no hay 'username', no hacer nada e indicar que la carga ha terminado.
    if (!username) {
      setIsLoading(false);
      setPublicaciones([]); // Asegurar que no haya datos viejos
      setTotalPages(0);
      return;
    }
    // Indicar que la carga de publicaciones ha comenzado.
    setIsLoading(true);
    // Limpiar errores previos de la tabla.
    setTableError('');
    try {
      // Petición GET a la API para obtener las publicaciones.
      // Se envían 'username', 'page' (página actual) y 'limit' (ítems por página) como parámetros query.
      const response = await axios.get(`http://localhost:3000/api/publicaciones`, {
        params: { username, page: currentPage, limit: itemsPerPage },
      });
      // Actualiza el estado 'publicaciones' con los datos recibidos (response.data.data).
      // Actualiza 'totalPages' con el total de páginas informado por la API.
      setPublicaciones(response.data.data || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error al obtener las publicaciones', error);
      setPublicaciones([]); // Limpiar publicaciones en caso de error.
      setTotalPages(0);     // Resetear total de páginas.
      setTableError('No se pudieron cargar las publicaciones. Inténtalo de nuevo más tarde.');
    } finally {
      // Se ejecuta siempre. Indica que la carga ha terminado.
      setIsLoading(false);
    }
  }, [username, currentPage, itemsPerPage]); // Dependencias de useCallback

  // Hook useEffect para ejecutar 'fetchPublicaciones' cuando el componente se monta
  // o cuando la función 'fetchPublicaciones' cambia.
  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  // Función para cambiar la página de la tabla de publicaciones.
  // 'direction' puede ser -1 (página anterior) o 1 (página siguiente).
  const changePage = (direction) => {
    const newPage = currentPage + direction;
    // Cambia de página solo si la nueva página está dentro del rango válido.
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manejador para los cambios en los inputs del formulario.
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target; // Destructura propiedades del evento target.
    // Determina el nuevo valor del campo (maneja checkboxes de forma diferente).
    const newFieldValue = type === 'checkbox' ? checked : value;

    // Actualiza el estado 'formData' usando el valor previo para no perder otros campos.
    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, [id]: newFieldValue };

      // Lógica condicional para campos dependientes:
      // Si se desmarca "contiene_enlace", se limpia "clics_enlaces".
      if (id === 'contiene_enlace') {
        if (!checked) {
          updatedFormData.clics_enlaces = '';
        }
      }

      // Si se marca "N/A" para "tiempo_retencion", se limpia "tiempo_retencion".
      if (id === 'tiempo_retencion_na') {
        if (checked) {
          updatedFormData.tiempo_retencion = '';
        }
      }
      
      // Si se escribe algo en "tiempo_retencion", se desmarca el checkbox "N/A".
      if (id === 'tiempo_retencion' && newFieldValue !== '') {
        updatedFormData.tiempo_retencion_na = false;
      }

      return updatedFormData; // Devuelve el estado del formulario actualizado.
    });
  };

  // Manejador para el envío del formulario de nueva publicación.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene la recarga de la página.
    // Comprobación de seguridad por si 'username' no estuviera disponible.
    if (!username) {
      setFormError('Nombre de usuario no disponible. No se puede añadir la publicación.');
      return;
    }
    // Limpia mensajes previos del formulario.
    setFormMessage('');
    setFormError('');
    try {
      // Prepara el objeto de la publicación para enviar al backend.
      // Convierte strings numéricos a enteros o flotantes según corresponda.
      // Maneja campos que pueden ser 0 o null.
      const publicacionAEnviar = {
        ...formData, // Copia todos los campos del estado formData.
        username,    // Añade el username.
        impresiones: parseInt(formData.impresiones, 10) || 0,
        me_gusta: parseInt(formData.me_gusta, 10) || 0,
        comentarios: parseInt(formData.comentarios, 10) || 0,
        compartidos: parseInt(formData.compartidos, 10) || 0,
        // Si 'contiene_enlace' es false, 'clics_enlaces' se envía como 0.
        clics_enlaces: formData.contiene_enlace ? (parseInt(formData.clics_enlaces, 10) || 0) : 0,
        // Si 'tiempo_retencion_na' es true, 'tiempo_retencion' se envía como null.
        tiempo_retencion: formData.tiempo_retencion_na ? null : (parseFloat(formData.tiempo_retencion) || null),
      };
      // El campo 'tiempo_retencion_na' es solo para la lógica del UI, no se envía al backend.
      delete publicacionAEnviar.tiempo_retencion_na;


      // Petición POST a la API para añadir la nueva publicación.
      await axios.post('http://localhost:3000/api/publicaciones', publicacionAEnviar);
      setFormMessage('Publicación añadida correctamente.'); // Mensaje de éxito.
      setFormData(initialFormData); // Resetea el formulario a su estado inicial.
      fetchPublicaciones(); // Vuelve a cargar las publicaciones para reflejar la nueva.
    } catch (error) {
      console.error('Error al añadir la publicación', error.response ? error.response.data : error);
      // Intenta obtener un mensaje de error útil de la respuesta de la API.
      setFormError(error.response?.data?.message || error.response?.data?.error || error.response?.data || 'Error al añadir publicación.');
    }
  };

  // Define las cabeceras de la tabla de publicaciones.
  // 'key' debe coincidir con el nombre de la propiedad en los objetos de publicación.
  // 'label' es lo que se muestra al usuario.
  const tableHeaders = [
    // { key: 'id', label: 'ID' }, // Se puede añadir si es necesario.
    { key: 'tipo_post', label: 'Tipo Post' },
    { key: 'titulo', label: 'Título' }, { key: 'fecha_publicacion', label: 'Fecha' },
    { key: 'hora_publicacion', label: 'Hora' }, { key: 'impresiones', label: 'Impresiones' },
    { key: 'me_gusta', label: 'Me Gusta' }, { key: 'comentarios', label: 'Comentarios' },
    { key: 'compartidos', label: 'Compartidos' }, { key: 'clics_enlaces', label: 'Clics Enlaces' },
    { key: 'contiene_enlace', label: '¿Enlace?' }, { key: 'tiempo_retencion', label: 'Retención (s)' },
    { key: 'formato_contenido', label: 'Formato' }, { key: 'notas', label: 'Notas' },
    // Estos dos últimos campos ('interacciones_total', 'engagement_rate') se asume que los calcula el backend
    // y los incluye en la respuesta de la API.
    { key: 'interacciones_total', label: 'Total Inter.' }, { key: 'engagement_rate', label: 'Engagement %' },
  ];

  // Inicio del JSX que se renderizará.
  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto pt-5 pb-12 box-border"
         style={{ // Estilo en línea para la imagen de fondo
           backgroundImage: `url(${process.env.PUBLIC_URL}/icons/fondo.png)`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           backgroundAttachment: 'fixed', // Fondo fijo para que no se desplace con el scroll
         }}>
      {/* Contenedor principal para centrar el contenido y aplicar márgenes */}
      <div className="w-[95%] sm:w-[90%] max-w-screen-xl my-7 flex flex-col gap-8 sm:gap-10">
        
        {/* Sección de la Tabla de Publicaciones */}
        <div className="bg-white/95 p-4 sm:p-6 rounded-xl shadow-2xl"> {/* Fondo semi-transparente */}
          <h2 className="text-center text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-gray-700">Mis Publicaciones</h2>
          {/* Indicador de carga */}
          {isLoading && <p className="text-center text-gray-500 py-4">Cargando publicaciones...</p>}
          {/* Mensaje de error de la tabla */}
          {tableError && !isLoading && <p className="mb-4 p-3 text-sm text-center text-red-700 bg-red-100 rounded-md shadow">{tableError}</p>}
          {/* Renderiza la tabla solo si no está cargando, no hay error y hay publicaciones */}
          {!isLoading && !tableError && publicaciones.length > 0 ? (
            <div className="overflow-x-auto"> {/* Permite scroll horizontal en tablas grandes */}
              <table className="w-full border-collapse min-w-[1200px]"> {/* Ancho mínimo para evitar compresión excesiva */}
                <thead>
                  <tr className="bg-gray-100"> {/* Fila de cabecera */}
                    {tableHeaders.map(header => (
                      <th key={header.key} className="border border-gray-300 p-2 sm:p-3 text-left text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Itera sobre cada publicación para crear una fila */}
                  {publicaciones.map((pub) => (
                    <tr key={pub.id} className="hover:bg-gray-50 even:bg-gray-50/50"> {/* `pub.id` como clave única */}
                      {/* Itera sobre las cabeceras para crear las celdas de la fila actual */}
                      {tableHeaders.map(header => (
                        <td key={`${pub.id}-${header.key}`} className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm text-gray-700 align-middle">
                          {/* Lógica de formateo condicional para diferentes tipos de datos */}
                          {header.key === 'fecha_publicacion' ? new Date(pub[header.key]).toLocaleDateString() : // Formatea fecha
                           header.key === 'contiene_enlace' ? (pub[header.key] ? 'Sí' : 'No') : // Muestra Sí/No para booleano
                           header.key === 'tiempo_retencion' ? (pub[header.key] !== null && pub[header.key] !== undefined ? Number(pub[header.key]).toFixed(2) : 'N/A') : // Formatea número y maneja N/A
                           header.key === 'engagement_rate' ? (pub[header.key] !== null && pub[header.key] !== undefined ? (Number(pub[header.key]) * 100).toFixed(2) + '%' : 'N/A') : // Formatea porcentaje y maneja N/A
                           (pub[header.key] !== null && pub[header.key] !== undefined ? pub[header.key] : 'N/A')} {/* Valor por defecto o N/A */}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Mensaje si no hay publicaciones y no está cargando ni hay error
            !isLoading && !tableError && <p className="text-center text-gray-500 py-4">No hay publicaciones para mostrar.</p>
          )}
          {/* Controles de paginación, se muestran si hay más de una página y no está cargando/error */}
          {totalPages > 0 && !isLoading && !tableError && (
            <div className="flex justify-center items-center mt-5 sm:mt-6 gap-3 sm:gap-4">
              <button onClick={() => changePage(-1)} disabled={currentPage === 1}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                &lt; Anterior
              </button>
              <span className="text-xs sm:text-sm text-gray-700">Página {currentPage} de {totalPages}</span>
              <button onClick={() => changePage(1)} disabled={currentPage === totalPages}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                Siguiente &gt;
              </button>
            </div>
          )}
        </div>

        {/* Sección del Formulario para Añadir Nueva Publicación */}
        <div className="bg-white/95 p-4 sm:p-6 rounded-xl shadow-2xl">
          <h2 className="text-center text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-gray-700">Añadir Nueva Publicación</h2>
          {/* Mensaje de éxito del formulario */}
          {formMessage && <p className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md shadow">{formMessage}</p>}
          {/* Mensaje de error del formulario */}
          {formError && <p className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md shadow">{formError}</p>}
          
          {/* Formulario con diseño de dos columnas en pantallas medianas y grandes */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Columna 1 del formulario */}
            <div className="md:col-span-1 flex flex-col gap-4 sm:gap-5">
              <div>
                <label htmlFor="tipo_post" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Tipo de Post:</label>
                <select 
                  id="tipo_post" 
                  value={formData.tipo_post} 
                  onChange={handleChange} 
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Web">Web</option>
                  <option value="X">X (Twitter)</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div>
                <label htmlFor="titulo" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Título:</label>
                <input type="text" id="titulo" value={formData.titulo} onChange={handleChange}
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="fecha_publicacion" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Fecha de Publicación:</label>
                <input type="date" id="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} required
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="hora_publicacion" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Hora de Publicación:</label>
                <input type="time" id="hora_publicacion" value={formData.hora_publicacion} onChange={handleChange} required
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="impresiones" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Impresiones:</label>
                <input type="number" id="impresiones" value={formData.impresiones} onChange={handleChange} required min="0"
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="me_gusta" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Me Gusta:</label>
                <input type="number" id="me_gusta" value={formData.me_gusta} onChange={handleChange} min="0"
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
               <div>
                <label htmlFor="formato_contenido" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Formato del Contenido:</label>
                <input type="text" id="formato_contenido" value={formData.formato_contenido} onChange={handleChange}
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
            </div>
            {/* Columna 2 del formulario */}
            <div className="md:col-span-1 flex flex-col gap-4 sm:gap-5">
              <div>
                <label htmlFor="comentarios" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Comentarios:</label>
                <input type="number" id="comentarios" value={formData.comentarios} onChange={handleChange} min="0"
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="compartidos" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Compartidos:</label>
                <input type="number" id="compartidos" value={formData.compartidos} onChange={handleChange} min="0"
                       className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"/>
              </div>
               {/* Checkbox para 'contiene_enlace' */}
               <div className="flex items-center gap-2 pt-2 sm:pt-3">
                <input type="checkbox" id="contiene_enlace" checked={formData.contiene_enlace} onChange={handleChange} 
                       className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                <label htmlFor="contiene_enlace" className="text-xs sm:text-sm font-medium text-gray-600">Contiene Enlace</label>
              </div>
              <div>
                <label htmlFor="clics_enlaces" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Clics en Enlaces:</label>
                <input 
                  type="number" 
                  id="clics_enlaces" 
                  value={formData.clics_enlaces} 
                  onChange={handleChange} 
                  min="0"
                  disabled={!formData.contiene_enlace} // Deshabilitado si 'contiene_enlace' es false
                  className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              
              {/* Checkbox para 'tiempo_retencion_na' (N/A) */}
              <div className="flex items-center gap-2 pt-2 sm:pt-3">
                 <input 
                    type="checkbox" 
                    id="tiempo_retencion_na" 
                    checked={formData.tiempo_retencion_na} 
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                <label htmlFor="tiempo_retencion_na" className="text-xs sm:text-sm font-medium text-gray-600">N/A para Tiempo Retención</label>
              </div>
              <div>
                <label htmlFor="tiempo_retencion" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Tiempo de Retención (segundos):</label>
                <input 
                  type="number" 
                  step="0.01" // Permite decimales
                  id="tiempo_retencion" 
                  value={formData.tiempo_retencion} 
                  onChange={handleChange} 
                  min="0"
                  disabled={formData.tiempo_retencion_na} // Deshabilitado si 'tiempo_retencion_na' es true
                  className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="notas" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Notas:</label>
                <textarea id="notas" rows="3" value={formData.notas} onChange={handleChange}
                          className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm resize-vertical min-h-[60px] sm:min-h-[75px]"/>
              </div>
            </div>
            {/* Botón de envío del formulario, ocupa todo el ancho en la última fila del grid */}
            <div className="md:col-span-2">
              <button type="submit"
                      className="mt-3 sm:mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors text-sm sm:text-base">
                Añadir Publicación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Datos; // Exporta el componente