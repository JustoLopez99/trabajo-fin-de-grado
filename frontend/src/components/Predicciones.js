import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const Predicciones = () => {
  const { username, userRole, viewingAsUsername } = useOutletContext() || {};

  // Estados
  const [bestTimeData, setBestTimeData] = useState(null);
  const [bestTimeLoading, setBestTimeLoading] = useState(true);
  const [bestTimeError, setBestTimeError] = useState('');
  const [bestTimeMetric, setBestTimeMetric] = useState('engagement_rate');

  const [effectiveFormatData, setEffectiveFormatData] = useState(null);
  const [effectiveFormatLoading, setEffectiveFormatLoading] = useState(true);
  const [effectiveFormatError, setEffectiveFormatError] = useState('');
  const [effectiveFormatMetric, setEffectiveFormatMetric] = useState('engagement_rate');

  const [estimationInputs, setEstimationInputs] = useState({ tipo_post: '', dia_semana: '1', hora: '10' });
  const [estimationData, setEstimationData] = useState(null);
  const [estimationLoading, setEstimationLoading] = useState(false);
  const [estimationError, setEstimationError] = useState('');
  const [availablePostTypes, setAvailablePostTypes] = useState([]);

  const [linkImpactData, setLinkImpactData] = useState(null);
  const [linkImpactLoading, setLinkImpactLoading] = useState(true);
  const [linkImpactError, setLinkImpactError] = useState('');

  const [interactionCompositionData, setInteractionCompositionData] = useState(null);
  const [interactionCompositionLoading, setInteractionCompositionLoading] = useState(true);
  const [interactionCompositionError, setInteractionCompositionError] = useState('');

  const [retentionImpactData, setRetentionImpactData] = useState(null);
  const [retentionImpactLoading, setRetentionImpactLoading] = useState(true);
  const [retentionImpactError, setRetentionImpactError] = useState('');

  const getEffectiveUsername = useCallback(() => {
    if (userRole === 'admin' && viewingAsUsername) return viewingAsUsername;
    return username;
  }, [userRole, username, viewingAsUsername]);
  const effectiveUser = getEffectiveUsername();

  // Funciones Fetch
  const fetchAvailablePostTypes = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
        const response = await axios.get(`http://localhost:3000/api/tipos-post-disponibles`, { params: { username: currentUser } });
        setAvailablePostTypes(response.data.availablePostTypes || []);
        if (response.data.availablePostTypes && response.data.availablePostTypes.length > 0 && !estimationInputs.tipo_post) {
            setEstimationInputs(prev => ({ ...prev, tipo_post: response.data.availablePostTypes[0]}));
        }
    } catch (err) { console.error("Error fetching available post types:", err); }
  }, [estimationInputs.tipo_post]);

  const fetchBestTimeToPost = useCallback(async (currentUser, metric) => {
    if (!currentUser) return;
    setBestTimeLoading(true); setBestTimeError(''); setBestTimeData(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/mejor-momento`, { params: { username: currentUser, metric: metric } });
      setBestTimeData(response.data);
    } catch (err) { setBestTimeError(err.response?.data?.message || 'No se pudo cargar la predicción.'); console.error("Error fetching best time to post:", err); } 
    finally { setBestTimeLoading(false); }
  }, []);

  const fetchMostEffectiveFormat = useCallback(async (currentUser, metric) => {
    if (!currentUser) return;
    setEffectiveFormatLoading(true); setEffectiveFormatError(''); setEffectiveFormatData(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/formato-efectivo`, { params: { username: currentUser, metric: metric } });
      setEffectiveFormatData(response.data);
    } catch (err) { setEffectiveFormatError(err.response?.data?.message || 'No se pudo cargar la predicción.'); console.error("Error fetching most effective format:", err); } 
    finally { setEffectiveFormatLoading(false); }
  }, []);
  
  const fetchLinkImpact = useCallback(async (currentUser) => {
    if (!currentUser) return;
    setLinkImpactLoading(true); setLinkImpactError(''); setLinkImpactData(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/impacto-enlace`, { params: { username: currentUser } });
      setLinkImpactData(response.data);
    } catch (err) { setLinkImpactError(err.response?.data?.message || 'No se pudo cargar el análisis.'); console.error("Error fetching link impact:", err); } 
    finally { setLinkImpactLoading(false); }
  }, []);

  const fetchInteractionComposition = useCallback(async (currentUser) => {
    if (!currentUser) return;
    setInteractionCompositionLoading(true); setInteractionCompositionError(''); setInteractionCompositionData(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/composicion-interacciones`, { params: { username: currentUser } });
      setInteractionCompositionData(response.data);
    } catch (err) {
      setInteractionCompositionError(err.response?.data?.message || 'No se pudo cargar el análisis.');
      console.error("Error fetching interaction composition:", err);
    } finally {
      setInteractionCompositionLoading(false);
    }
  }, []);

  const fetchRetentionImpact = useCallback(async (currentUser) => {
    if (!currentUser) return;
    setRetentionImpactLoading(true); setRetentionImpactError(''); setRetentionImpactData(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/impacto-retencion`, { params: { username: currentUser } });
      setRetentionImpactData(response.data);
    } catch (err) {
      setRetentionImpactError(err.response?.data?.message || 'No se pudo cargar el análisis.');
      console.error("Error fetching retention impact:", err);
    } finally {
      setRetentionImpactLoading(false);
    }
  }, []);

  // UseEffects
 useEffect(() => {
    if (effectiveUser) { fetchAvailablePostTypes(effectiveUser); }
  }, [effectiveUser, fetchAvailablePostTypes]);

 useEffect(() => {
    if (effectiveUser) { fetchBestTimeToPost(effectiveUser, bestTimeMetric); }
  }, [effectiveUser, bestTimeMetric, fetchBestTimeToPost]);

  useEffect(() => {
    if (effectiveUser) { fetchMostEffectiveFormat(effectiveUser, effectiveFormatMetric); }
  }, [effectiveUser, effectiveFormatMetric, fetchMostEffectiveFormat]);

  useEffect(() => {
    if (effectiveUser) { fetchLinkImpact(effectiveUser); }
  }, [effectiveUser, fetchLinkImpact]);

  useEffect(() => {
    if (effectiveUser) { fetchInteractionComposition(effectiveUser); }
  }, [effectiveUser, fetchInteractionComposition]);

  useEffect(() => {
    if (effectiveUser) { fetchRetentionImpact(effectiveUser); }
  }, [effectiveUser, fetchRetentionImpact]);

  const handleEstimationInputChange = (e) => {
    const { name, value } = e.target;
    setEstimationInputs(prev => ({ ...prev, [name]: value }));
  };
  const handleEstimationSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveUser || !estimationInputs.tipo_post || !estimationInputs.dia_semana || !estimationInputs.hora) { setEstimationError('Por favor, complete todos los campos para la estimación.'); return; }
    setEstimationLoading(true); setEstimationError(''); setEstimationData(null);
    try {
      const params = { ...estimationInputs, username: effectiveUser };
      const response = await axios.get(`http://localhost:3000/api/estimacion-rendimiento`, { params });
      setEstimationData(response.data);
    } catch (err) { setEstimationError(err.response?.data?.message || 'No se pudo realizar la estimación.'); console.error("Error fetching potential performance:", err); } 
    finally { setEstimationLoading(false); }
  };

  const pageTitle = userRole === 'admin' && effectiveUser && effectiveUser !== username ? `Predicciones para: ${effectiveUser}` : 'Mis Predicciones';

  const initialLoading = !effectiveUser && (bestTimeLoading || effectiveFormatLoading || linkImpactLoading || interactionCompositionLoading || retentionImpactLoading);
  if (initialLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500">Cargando datos iniciales...</div></div>;
  }
  if (!effectiveUser && !userRole) {
     return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500 p-4 bg-gray-100 rounded-lg">Información de usuario no disponible.</div></div>;
  }
   if (!effectiveUser && userRole === 'admin') {
     return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500 p-4 bg-gray-100 rounded-lg">Selecciona un usuario para ver sus predicciones.</div></div>;
  }

  const renderMetricSelector = (metric, setMetric, fetchFunction, idPrefix) => (
    <div className="mb-3">
      <label htmlFor={`${idPrefix}-metric`} className="text-sm font-medium text-slate-600 mr-2">Optimizar para:</label>
      <select id={`${idPrefix}-metric`} value={metric}
        onChange={(e) => { setMetric(e.target.value); if (effectiveUser) { fetchFunction(effectiveUser, e.target.value); } }}
        className="p-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
      ><option value="engagement_rate">Engagement Rate</option><option value="interacciones_total">Interacciones Totales</option></select>
    </div>
  );

  // Determinar el mejor rango de retención
  let bestRetentionRangeItem = null;
  if (retentionImpactData && retentionImpactData.retentionImpact && retentionImpactData.retentionImpact.length > 0) {
    bestRetentionRangeItem = retentionImpactData.retentionImpact.reduce((max, item) => 
      parseFloat(item.avg_engagement_rate) > parseFloat(max.avg_engagement_rate) ? item : max, 
      retentionImpactData.retentionImpact[0]
    );
  }

  // Determinar el tipo de post con más interacciones totales para "Composición de Interacciones"
  let bestInteractionCompositionItem = null;
  if (interactionCompositionData && interactionCompositionData.composition && interactionCompositionData.composition.length > 0) {
    bestInteractionCompositionItem = interactionCompositionData.composition.reduce((max, item) =>
      (item.sum_interacciones_total || 0) > (max.sum_interacciones_total || 0) ? item : max,
      interactionCompositionData.composition[0]
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto pt-5 pb-12 box-border bg-white">
      <div className="w-[95%] sm:w-[90%] max-w-screen-xl my-7 flex flex-col gap-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center mb-6">{pageTitle}</h1>

        {/* Mejor Momento para Publicar */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">💡 Mejor Momento para Publicar</h2>
          {renderMetricSelector(bestTimeMetric, setBestTimeMetric, fetchBestTimeToPost, "bestTime")}
          {bestTimeLoading && <p className="text-slate-500 py-3">Calculando mejor momento...</p>}
          {bestTimeError && <p className="text-red-600 bg-red-100 p-3 rounded-md my-2">{bestTimeError}</p>}
          {bestTimeData && !bestTimeLoading && !bestTimeError && (
            bestTimeData.bestTimes && bestTimeData.bestTimes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {bestTimeData.bestTimes.map((time, index) => {
                  const isBest = index === 0;
                  const cardClasses = isBest 
                    ? "bg-green-100 border-2 border-green-400 p-4 rounded-lg shadow-md transition-shadow duration-150 ease-in-out" 
                    : "bg-purple-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 ease-in-out";
                  const titleColor = isBest ? "text-green-800" : "text-purple-800";
                  const valueColor = isBest ? "text-green-700" : "text-purple-700";
                  const spanColor = isBest ? "text-green-600" : "text-purple-700";

                  return (
                    <div key={index} className={cardClasses}>
                      <h4 className={`font-semibold ${titleColor} text-md truncate`}>
                        {time.dia_semana} <span className={spanColor}>a las</span> {isNaN(time.hora) ? 'N/A' : `${time.hora}:00 - ${time.hora + 1}:00`}
                      </h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-700">
                          Avg. Engagement: <span className={`font-bold ${valueColor}`}>{(parseFloat(time.avg_engagement_rate) * 100).toFixed(2)}%</span>
                        </p>
                        <p className="text-sm text-slate-700">
                          Avg. Interacciones: <span className={`font-bold ${valueColor}`}>{parseFloat(time.avg_interacciones_total).toFixed(1)}</span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">(Basado en {time.num_posts} posts)</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-slate-500 py-3">{bestTimeData.message || 'No hay suficientes datos.'}</p>
          )}
        </section>

        {/* Formato de Contenido Más Efectivo */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">🚀 Formato de Contenido Más Efectivo</h2>
          {renderMetricSelector(effectiveFormatMetric, setEffectiveFormatMetric, fetchMostEffectiveFormat, "effectiveFormat")}
          {effectiveFormatLoading && <p className="text-slate-500 py-3">Analizando formatos...</p>}
          {effectiveFormatError && <p className="text-red-600 bg-red-100 p-3 rounded-md my-2">{effectiveFormatError}</p>}
          {effectiveFormatData && !effectiveFormatLoading && !effectiveFormatError && (
            effectiveFormatData.effectiveFormats && effectiveFormatData.effectiveFormats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {effectiveFormatData.effectiveFormats.map((format, index) => {
                  const isBest = index === 0 && format.tipo_post !== 'Otros';
                  const cardClasses = isBest 
                    ? "bg-green-100 border-2 border-green-400 p-4 rounded-lg shadow-md transition-shadow duration-150 ease-in-out" 
                    : "bg-purple-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 ease-in-out";
                  const titleColor = isBest ? "text-green-800" : "text-purple-800";
                  const valueColor = isBest ? "text-green-700" : "text-purple-700";
                  
                  return (
                    <div key={index} className={cardClasses}>
                      <h4 className={`font-semibold ${titleColor} text-lg truncate`}>{format.tipo_post}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-700">
                          Avg. Engagement: <span className={`font-bold ${valueColor}`}>{(parseFloat(format.avg_engagement_rate) * 100).toFixed(2)}%</span>
                        </p>
                        <p className="text-sm text-slate-700">
                          Avg. Interacciones: <span className={`font-bold ${valueColor}`}>{parseFloat(format.avg_interacciones_total).toFixed(1)}</span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">(Basado en {format.num_posts} posts)</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-slate-500 py-3">{effectiveFormatData.message || 'No hay suficientes datos.'}</p>
          )}
        </section>

        {/* Análisis de Composición de Interacciones */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">📊 Composición de Interacciones por Tipo de Post</h2>
          {interactionCompositionLoading && <p className="text-slate-500 py-3">Analizando composición...</p>}
          {interactionCompositionError && <p className="text-red-600 bg-red-100 p-3 rounded-md my-2">{interactionCompositionError}</p>}
          {interactionCompositionData && !interactionCompositionLoading && !interactionCompositionError && (
            interactionCompositionData.composition && interactionCompositionData.composition.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {interactionCompositionData.composition.map((item, index) => {
                  const isBest = bestInteractionCompositionItem && item.tipo_post === bestInteractionCompositionItem.tipo_post;
                  const cardClasses = isBest 
                    ? "bg-green-100 border-2 border-green-400 p-4 rounded-lg shadow-md transition-shadow duration-150 ease-in-out" 
                    : "bg-purple-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 ease-in-out";
                  const titleColor = isBest ? "text-green-800" : "text-purple-800";
                  const valueColor = isBest ? "text-green-700" : "text-purple-700";

                  return (
                    <div key={index} className={cardClasses}>
                      <h4 className={`font-semibold ${titleColor} text-lg truncate`}>{item.tipo_post}</h4>
                      <p className="text-xs text-slate-500 mb-1">
                        Total Interacciones: <span className={`font-bold ${valueColor}`}>{item.sum_interacciones_total ? item.sum_interacciones_total.toLocaleString() : '0'}</span>
                      </p>
                      <p className="text-xs text-slate-500 mb-2">({item.num_posts} posts)</p>
                      <div className="space-y-1 text-sm">
                        <p>👍 Likes: <span className={`font-semibold ${valueColor}`}>{item.me_gusta.toLocaleString()}</span> ({item.porc_me_gusta}%)</p>
                        <p>💬 Comentarios: <span className={`font-semibold ${valueColor}`}>{item.comentarios.toLocaleString()}</span> ({item.porc_comentarios}%)</p>
                        <p>🔗 Compartidos: <span className={`font-semibold ${valueColor}`}>{item.compartidos.toLocaleString()}</span> ({item.porc_compartidos}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-slate-500 py-3">{interactionCompositionData.message || 'No hay datos para mostrar.'}</p>
          )}
        </section>

        {/* Impacto del Tiempo de Retención */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">⏱️ Impacto del Tiempo de Retención en Engagement</h2>
          {retentionImpactLoading && <p className="text-slate-500 py-3">Analizando impacto de retención...</p>}
          {retentionImpactError && <p className="text-red-600 bg-red-100 p-3 rounded-md my-2">{retentionImpactError}</p>}
          {retentionImpactData && !retentionImpactLoading && !retentionImpactError && (
            retentionImpactData.retentionImpact && retentionImpactData.retentionImpact.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {retentionImpactData.retentionImpact.map((item, index) => {
                  const isBest = bestRetentionRangeItem && item.rango_retencion === bestRetentionRangeItem.rango_retencion;
                  const cardClasses = isBest 
                    ? "bg-green-100 border-2 border-green-400 p-4 rounded-lg shadow-md transition-shadow duration-150 ease-in-out" 
                    : "bg-purple-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 ease-in-out";
                  const titleColor = isBest ? "text-green-800" : "text-purple-800";
                  const valueColor = isBest ? "text-green-700" : "text-purple-700";

                  return (
                   <div key={index} className={cardClasses}>
                    <h4 className={`font-semibold ${titleColor} text-md`}>{item.rango_retencion}</h4>
                     <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-700">Avg. Engagement: <span className={`font-bold ${valueColor}`}>{(parseFloat(item.avg_engagement_rate) * 100).toFixed(2)}%</span></p>
                        <p className="text-sm text-slate-700">Avg. Interacciones: <span className={`font-bold ${valueColor}`}>{parseFloat(item.avg_interacciones_total).toFixed(1)}</span></p>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">({item.num_posts} posts en este rango)</p>
                  </div>
                  );
                })}
              </div>
            ) : <p className="text-slate-500 py-3">{retentionImpactData.message || 'No hay datos suficientes de tiempo de retención.'}</p>
          )}
        </section>

        {/* Estimación del Rendimiento Potencial */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">📊 Estimación de Rendimiento Potencial</h2>
          <form onSubmit={handleEstimationSubmit} className="flex flex-col md:flex-row flex-wrap gap-3 sm:gap-4 items-end mb-4">
            <div className="flex-1 min-w-[150px]"><label htmlFor="tipo_post_est" className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Tipo de Post:</label><select id="tipo_post_est" name="tipo_post" value={estimationInputs.tipo_post} onChange={handleEstimationInputChange} className="w-full p-2 sm:p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">{availablePostTypes.length === 0 && <option value="">Cargando...</option>}{availablePostTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
            <div className="flex-1 min-w-[120px]"><label htmlFor="dia_semana_est" className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Día Semana:</label><select id="dia_semana_est" name="dia_semana" value={estimationInputs.dia_semana} onChange={handleEstimationInputChange} className="w-full p-2 sm:p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"><option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option><option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option><option value="7">Domingo</option></select></div>
            <div className="flex-1 min-w-[100px]"><label htmlFor="hora_est" className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Hora (0-23):</label><input type="number" name="hora" id="hora_est" value={estimationInputs.hora} onChange={handleEstimationInputChange} min="0" max="23" placeholder="Ej: 14" className="w-full p-2 sm:p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"/></div>
            <button type="submit" disabled={estimationLoading} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-5 sm:px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-colors text-sm h-full md:self-end mt-2 md:mt-0">{estimationLoading ? 'Estimando...' : 'Estimar'}</button>
          </form>
          {estimationError && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-3">{estimationError}</p>}
          {estimationData && !estimationLoading && !estimationError && ( estimationData.estimation && estimationData.estimation.num_posts_considerados > 0 ? (<div className="bg-indigo-50 p-3 rounded-md text-slate-700"><p>Rendimiento Estimado:</p><ul className="list-disc pl-5"><li>Impresiones: ~{estimationData.estimation.avg_impresiones}</li><li>Interacciones Totales: ~{estimationData.estimation.avg_interacciones_total}</li><li>Engagement Rate: ~{(parseFloat(estimationData.estimation.avg_engagement_rate) * 100).toFixed(2)}%</li></ul><p className="text-xs text-slate-500 mt-1">Basado en {estimationData.estimation.num_posts_considerados} posts similares.</p></div>) : estimationData.message ? (<p className="text-slate-500">{estimationData.message}</p>) : null )}
        </section>

        {/* Impacto de Incluir un Enlace */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">🔗 Impacto de Incluir un Enlace</h2>
          {linkImpactLoading && <p className="text-slate-500 py-3">Analizando impacto de enlaces...</p>}
          {linkImpactError && <p className="text-red-600 bg-red-100 p-3 rounded-md my-2">{linkImpactError}</p>}
          {linkImpactData && !linkImpactLoading && !linkImpactError && linkImpactData.impact && (
            <div className="grid md:grid-cols-2 gap-4 text-slate-600">
              <div className="bg-green-50 p-3 rounded"><h3 className="font-semibold text-green-700">Con Enlace ({linkImpactData.impact.con_enlace.num_posts} posts)</h3><p>Avg. Engagement Rate: {(parseFloat(linkImpactData.impact.con_enlace.avg_engagement_rate) * 100).toFixed(2)}%</p><p>Avg. Interacciones: {parseFloat(linkImpactData.impact.con_enlace.avg_interacciones_total).toFixed(1)}</p><p>Avg. Clics en Enlace: {parseFloat(linkImpactData.impact.con_enlace.avg_clics_enlaces).toFixed(1)}</p></div>
              <div className="bg-orange-50 p-3 rounded"><h3 className="font-semibold text-orange-700">Sin Enlace ({linkImpactData.impact.sin_enlace.num_posts} posts)</h3><p>Avg. Engagement Rate: {(parseFloat(linkImpactData.impact.sin_enlace.avg_engagement_rate) * 100).toFixed(2)}%</p><p>Avg. Interacciones: {parseFloat(linkImpactData.impact.sin_enlace.avg_interacciones_total).toFixed(1)}</p></div>
               {(linkImpactData.impact.con_enlace.num_posts === 0 && linkImpactData.impact.sin_enlace.num_posts === 0) && <p className="text-slate-500 md:col-span-2 py-3">{linkImpactData.message || 'No hay suficientes datos.'}</p>}
            </div>)}
        </section>

      </div>
    </div>
  );
};

export default Predicciones;