// src/components/Datos.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Datos = () => {
  const { username, userRole, viewingAsUsername } = useOutletContext() || {};

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableError, setTableError] = useState('');

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
    contiene_enlace: false,
    tiempo_retencion: '',
    tiempo_retencion_na: false,
    formato_contenido: '',
    notas: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  const getEffectiveUsername = useCallback(() => {
    if (userRole === 'admin' && viewingAsUsername) {
      return viewingAsUsername;
    }
    return username;
  }, [userRole, username, viewingAsUsername]);

  const fetchPublicaciones = useCallback(async () => {
    const usernameToFetch = getEffectiveUsername();

    if (!usernameToFetch) {
      setIsLoading(false);
      setPublicaciones([]);
      setTotalPages(0);
      console.log("Datos: Esperando nombre de usuario efectivo...");
      return;
    }
    setIsLoading(true);
    setTableError('');
    try {
      console.log(`Datos: Buscando publicaciones para usuario efectivo: ${usernameToFetch}, Página: ${currentPage}`);
      const response = await axios.get(`http://localhost:3000/api/publicaciones`, {
        params: { username: usernameToFetch, page: currentPage, limit: itemsPerPage },
      });
      setPublicaciones(response.data.data || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Datos: Error al obtener las publicaciones', error);
      setPublicaciones([]);
      setTotalPages(0);
      setTableError('No se pudieron cargar las publicaciones. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, getEffectiveUsername]);

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  const changePage = (direction) => {
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newFieldValue = type === 'checkbox' ? checked : value;

    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, [id]: newFieldValue };
      if (id === 'contiene_enlace' && !checked) {
        updatedFormData.clics_enlaces = '';
      }
      if (id === 'tiempo_retencion_na' && checked) {
        updatedFormData.tiempo_retencion = '';
      }
      if (id === 'tiempo_retencion' && newFieldValue !== '') {
        updatedFormData.tiempo_retencion_na = false;
      }
      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameForNewPost = getEffectiveUsername();

    if (!usernameForNewPost) {
      setFormError('Nombre de usuario efectivo no disponible. No se puede añadir la publicación.');
      return;
    }
    setFormMessage('');
    setFormError('');
    try {
      const publicacionAEnviar = {
        ...formData,
        username: usernameForNewPost,
        impresiones: parseInt(formData.impresiones, 10) || 0,
        me_gusta: parseInt(formData.me_gusta, 10) || 0,
        comentarios: parseInt(formData.comentarios, 10) || 0,
        compartidos: parseInt(formData.compartidos, 10) || 0,
        clics_enlaces: formData.contiene_enlace ? (parseInt(formData.clics_enlaces, 10) || 0) : 0,
        tiempo_retencion: formData.tiempo_retencion_na ? null : (parseFloat(formData.tiempo_retencion) || null),
      };
      delete publicacionAEnviar.tiempo_retencion_na;

      await axios.post('http://localhost:3000/api/publicaciones', publicacionAEnviar);
      setFormMessage(`Publicación añadida correctamente para ${usernameForNewPost}.`);
      setFormData(initialFormData);
      if (currentPage !== 1) setCurrentPage(1);
      else fetchPublicaciones();
    } catch (error) {
      console.error('Datos: Error al añadir la publicación', error.response ? error.response.data : error);
      setFormError(error.response?.data?.message || error.response?.data?.error || error.response?.data || 'Error al añadir publicación.');
    }
  };

  const tableHeaders = [
    { key: 'tipo_post', label: 'Tipo Post' },
    { key: 'titulo', label: 'Título' }, { key: 'fecha_publicacion', label: 'Fecha' },
    { key: 'hora_publicacion', label: 'Hora' }, { key: 'impresiones', label: 'Impresiones' },
    { key: 'me_gusta', label: 'Me Gusta' }, { key: 'comentarios', label: 'Comentarios' },
    { key: 'compartidos', label: 'Compartidos' }, { key: 'clics_enlaces', label: 'Clics Enlaces' },
    { key: 'contiene_enlace', label: '¿Enlace?' }, { key: 'tiempo_retencion', label: 'Retención (s)' },
    { key: 'formato_contenido', label: 'Formato' }, { key: 'notas', label: 'Notas' },
    { key: 'interacciones_total', label: 'Total Inter.' }, { key: 'engagement_rate', label: 'Engagement %' },
  ];

  const getFormTitle = () => {
    const effectiveUser = getEffectiveUsername();
    if (userRole === 'admin' && effectiveUser && effectiveUser !== username) {
      return `Añadir Nueva Publicación para: ${effectiveUser}`;
    }
    return 'Añadir Nueva Publicación';
  };
  
  const getTableTitle = () => {
    const effectiveUser = getEffectiveUsername();
     if (userRole === 'admin' && effectiveUser && effectiveUser !== username) {
      return `Publicaciones de: ${effectiveUser}`;
    }
    return 'Mis Publicaciones';
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto pt-5 pb-12 box-border bg-white">
      <div className="w-[95%] sm:w-[90%] max-w-screen-xl my-7 flex flex-col gap-8 sm:gap-10">
        
        {/* Bloque de la tabla de publicaciones con nuevo estilo */}
        <div className="bg-white/90 p-4 sm:p-6 rounded-lg [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
          <h2 className="text-center text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-gray-700">{getTableTitle()}</h2>
          {isLoading && <p className="text-center text-gray-500 py-4">Cargando publicaciones...</p>}
          {tableError && !isLoading && <p className="mb-4 p-3 text-sm text-center text-red-700 bg-red-100/80 rounded-md shadow">{tableError}</p>}
          {!isLoading && !tableError && publicaciones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-100"> {/* El fondo del encabezado de la tabla puede permanecer así o ajustarse */}
                    {tableHeaders.map(header => (
                      <th key={header.key} className="border border-gray-300 p-2 sm:p-3 text-left text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {publicaciones.map((pub) => (
                    <tr key={pub.id} className="hover:bg-gray-50/50 even:bg-transparent"> {/* Ajuste de even:bg para el nuevo fondo del bloque */}
                      {tableHeaders.map(header => (
                        <td key={`${pub.id}-${header.key}`} className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm text-gray-700 align-middle">
                          {header.key === 'fecha_publicacion' ? new Date(pub[header.key]).toLocaleDateString() :
                           header.key === 'contiene_enlace' ? (pub[header.key] ? 'Sí' : 'No') :
                           header.key === 'tiempo_retencion' ? (pub[header.key] !== null && pub[header.key] !== undefined ? Number(pub[header.key]).toFixed(2) : 'N/A') :
                           header.key === 'engagement_rate' ? (pub[header.key] !== null && pub[header.key] !== undefined ? (Number(pub[header.key]) * 100).toFixed(2) + '%' : 'N/A') :
                           (pub[header.key] !== null && pub[header.key] !== undefined ? pub[header.key] : 'N/A')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !isLoading && !tableError && <p className="text-center text-gray-500 py-4">No hay publicaciones para mostrar para el usuario seleccionado.</p>
          )}
          {totalPages > 0 && !isLoading && !tableError && (
            <div className="flex justify-center items-center mt-5 sm:mt-6 gap-3 sm:gap-4">
              <button onClick={() => changePage(-1)} disabled={currentPage === 1}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                &lt; Anterior
              </button>
              <span className="text-xs sm:text-sm text-gray-700">Página {currentPage} de {totalPages}</span>
              <button onClick={() => changePage(1)} disabled={currentPage === totalPages}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                Siguiente &gt;
              </button>
            </div>
          )}
        </div>

        {/* Bloque del formulario para añadir publicación con nuevo estilo */}
        {userRole === 'admin' && (
          <div className="bg-white/90 p-4 sm:p-6 rounded-lg [box-shadow:0_6px_12px_rgba(0,0,0,0.15)]">
            <h2 className="text-center text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-gray-700">{getFormTitle()}</h2>
            {formMessage && <p className="mb-4 p-3 text-sm text-green-700 bg-green-100/80 rounded-md shadow">{formMessage}</p>}
            {formError && <p className="mb-4 p-3 text-sm text-red-700 bg-red-100/80 rounded-md shadow">{formError}</p>}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="md:col-span-1 flex flex-col gap-4 sm:gap-5">
                <div>
                  <label htmlFor="tipo_post" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Tipo de Post:</label>
                  <select 
                    id="tipo_post" 
                    value={formData.tipo_post} 
                    onChange={handleChange} 
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white" /* Añadido bg-white */
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
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div>
                  <label htmlFor="fecha_publicacion" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Fecha de Publicación:</label>
                  <input type="date" id="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleChange} required
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div>
                  <label htmlFor="hora_publicacion" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Hora de Publicación:</label>
                  <input type="time" id="hora_publicacion" value={formData.hora_publicacion} onChange={handleChange} required
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div>
                  <label htmlFor="impresiones" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Impresiones:</label>
                  <input type="number" id="impresiones" value={formData.impresiones} onChange={handleChange} required min="0"
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div>
                  <label htmlFor="me_gusta" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Me Gusta:</label>
                  <input type="number" id="me_gusta" value={formData.me_gusta} onChange={handleChange} min="0"
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div>
                  <label htmlFor="formato_contenido" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Formato del Contenido:</label>
                  <input type="text" id="formato_contenido" value={formData.formato_contenido} onChange={handleChange}
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
              </div>
              <div className="md:col-span-1 flex flex-col gap-4 sm:gap-5">
                <div>
                  <label htmlFor="comentarios" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Comentarios:</label>
                  <input type="number" id="comentarios" value={formData.comentarios} onChange={handleChange} min="0"
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div>
                  <label htmlFor="compartidos" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Compartidos:</label>
                  <input type="number" id="compartidos" value={formData.compartidos} onChange={handleChange} min="0"
                        className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm bg-white"/> {/* Añadido bg-white */}
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-3">
                  <input type="checkbox" id="contiene_enlace" checked={formData.contiene_enlace} onChange={handleChange} 
                        className="h-4 w-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"/>
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
                    disabled={!formData.contiene_enlace}
                    className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 disabled:text-gray-500 bg-white" /* Añadido bg-white, el disabled:bg-gray-100 lo sobreescribirá */
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-2 sm:pt-3">
                  <input 
                      type="checkbox" 
                      id="tiempo_retencion_na" 
                      checked={formData.tiempo_retencion_na} 
                      onChange={handleChange}
                      className="h-4 w-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                    />
                  <label htmlFor="tiempo_retencion_na" className="text-xs sm:text-sm font-medium text-gray-600">N/A para Tiempo Retención</label>
                </div>
                <div>
                  <label htmlFor="tiempo_retencion" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Tiempo de Retención (segundos):</label>
                  <input 
                    type="number" 
                    step="0.01"
                    id="tiempo_retencion" 
                    value={formData.tiempo_retencion} 
                    onChange={handleChange} 
                    min="0"
                    disabled={formData.tiempo_retencion_na}
                    className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 bg-white" /* Añadido bg-white, el disabled:bg-gray-100 lo sobreescribirá */
                  />
                </div>
                <div>
                  <label htmlFor="notas" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Notas:</label>
                  <textarea id="notas" rows="3" value={formData.notas} onChange={handleChange}
                            className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 text-xs sm:text-sm resize-vertical min-h-[60px] sm:min-h-[75px] bg-white"/> {/* Añadido bg-white */}
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="submit"
                        className="mt-3 sm:mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors text-sm sm:text-base">
                  Añadir Publicación
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Datos;