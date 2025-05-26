// src/components/Estadisticas.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import CuadriculaGraficos from './CuadriculaGraficos';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler );

const formatDateToDDMMYYYY = (yyyyMmDdStr) => {
  if (!yyyyMmDdStr || typeof yyyyMmDdStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDdStr)) {
    return "";
  }
  const parts = yyyyMmDdStr.split('-');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const formatDateToYYYYMMDD = (ddMmYyyyStr) => {
  if (!ddMmYyyyStr || typeof ddMmYyyyStr !== 'string' || !/^\d{2}-\d{2}-\d{4}$/.test(ddMmYyyyStr)) {
    return "";
  }
  const parts = ddMmYyyyStr.split('-');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return "";
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return "";
};

const Estadisticas = () => {
  const { username, userRole, viewingAsUsername } = useOutletContext() || {};

  const [overviewChartData, setOverviewChartData] = useState(null);
  const [overviewIsLoading, setOverviewIsLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  const [statsData, setStatsData] = useState(null);
  const [keyMetrics, setKeyMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const initialStartDateYYYYMMDD = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  const initialEndDateYYYYMMDD = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ startDate: initialStartDateYYYYMMDD, endDate: initialEndDateYYYYMMDD });
  const [displayedDateInput, setDisplayedDateInput] = useState({ startDate: formatDateToDDMMYYYY(initialStartDateYYYYMMDD), endDate: formatDateToDDMMYYYY(initialEndDateYYYYMMDD) });
  const [selectedPostType, setSelectedPostType] = useState('');
  const [availablePostTypes, setAvailablePostTypes] = useState([]);

  const getEffectiveUsername = useCallback(() => {
    if (userRole === 'admin' && viewingAsUsername) return viewingAsUsername;
    return username;
  }, [userRole, username, viewingAsUsername]);
  const effectiveUser = getEffectiveUsername();

  useEffect(() => {
    if (effectiveUser) {
      setOverviewIsLoading(true);
      setOverviewError('');
      axios.get(`http://localhost:3000/api/interactions-overview`, { params: { username: effectiveUser } })
        .then(response => {
            setOverviewChartData(response.data);
        })
        .catch(err => {
            console.error("Error fetching overview stats:", err);
            setOverviewError('No se pudo cargar el resumen de interacciones.');
            setOverviewChartData(null);
        })
        .finally(() => {
          setOverviewIsLoading(false);
        });
    } else {
      setOverviewChartData(null);
      setOverviewIsLoading(false);
      setOverviewError('');
    }
  }, [effectiveUser]);

  const fetchStatsData = useCallback(async () => {
    if (!effectiveUser) { setError("Usuario no determinado para estadísticas."); setIsLoading(false); setStatsData(null); setKeyMetrics(null); return; }
    if (!dateRange.startDate || !dateRange.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(dateRange.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dateRange.endDate)) {
      setError('Fechas inválidas para estadísticas. Use DD-MM-YYYY.'); setIsLoading(false); return;
    }
    setIsLoading(true); setError(''); setStatsData(null); setKeyMetrics(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/dashboard`, {
        params: { username: effectiveUser, startDate: dateRange.startDate, endDate: dateRange.endDate, tipo_post: selectedPostType || undefined }
      });
      if (response.data) {
        setStatsData({
          trendChart: response.data.trendChart,
          postTypePerformanceChart: response.data.postTypePerformanceChart,
          postTypeDistributionChart: response.data.postTypeDistributionChart,
          avgRetentionTimeByPostTypeChart: response.data.avgRetentionTimeByPostTypeChart,
          impressionsOverTimeChart: response.data.impressionsOverTimeChart,
          engagementByDayOfWeekChart: response.data.engagementByDayOfWeekChart,
        });
        setKeyMetrics(response.data.keyMetrics || null);
        setAvailablePostTypes(response.data.availablePostTypes || []);
      } else { setError('No se recibieron datos del servidor para estadísticas.'); }
    } catch (err) {
      let msg = 'No se pudieron cargar las estadísticas.';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message) msg = err.message;
      setError(msg); console.error('Error fetching dashboard stats:', err);
      setStatsData(null); setKeyMetrics(null);
    } finally { setIsLoading(false); }
  }, [effectiveUser, dateRange, selectedPostType]);

  useEffect(() => {
    setDisplayedDateInput({ startDate: formatDateToDDMMYYYY(dateRange.startDate), endDate: formatDateToDDMMYYYY(dateRange.endDate) });
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (effectiveUser) {
      if (!dateRange.startDate || !dateRange.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(dateRange.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dateRange.endDate)) {
        setError('Fechas iniciales inválidas para estadísticas.'); setIsLoading(false); setStatsData(null); setKeyMetrics(null); return;
      }
      fetchStatsData();
    } else {
      setIsLoading(false); setStatsData(null); setKeyMetrics(null); setAvailablePostTypes([]);
    }
  }, [effectiveUser, dateRange.startDate, dateRange.endDate, fetchStatsData]);

  const handleDateInputChange = (e) => {
    const { name, value } = e.target;
    setDisplayedDateInput(prev => ({ ...prev, [name]: value }));
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      setDateRange(prev => ({ ...prev, [name]: formatDateToYYYYMMDD(value) }));
    } else {
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (!dateRange.startDate || !dateRange.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(dateRange.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dateRange.endDate)) {
     setError('Formato de fechas inválido o fechas no seleccionadas correctamente. Use DD-MM-YYYY y asegúrese de que se conviertan.'); return;
    }
    fetchStatsData();
  };

  const chartOptionsBase = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 20, font: { size: 13 }}},
      title: { display: true, font: { size: 16, weight: 'bold' }, padding: { top: 10, bottom: 20 }},
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: {size:14}, bodyFont: {size:12}, padding:10, cornerRadius:4 }
    },
    scales: {
      x: { ticks: { font: {size:11}, maxRotation:45, minRotation:0, padding: 5 }, grid: {display:false}},
      y: { beginAtZero:true, ticks: {font:{size:11}}, title: {display:false, text:''}},
      y1: { type:'linear', display:true, position:'right', grid:{drawOnChartArea:false}, ticks:{font:{size:11}, callback: v => v + "%"}, beginAtZero:true }
    }
  };

  const pageTitle = userRole === 'admin' && effectiveUser && effectiveUser !== username ? `Estadísticas para: ${effectiveUser}` : 'Mis Estadísticas';

  if (overviewIsLoading && isLoading && !effectiveUser ) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500">Cargando datos iniciales...</div></div>;
  }
  if (!effectiveUser && !overviewIsLoading) {
     return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500 p-4 bg-gray-100 rounded-lg">{userRole === 'admin' ? 'Selecciona un usuario para ver sus estadísticas.' : 'Información de usuario no disponible.'}</div></div>;
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto pt-5 pb-12 box-border bg-white">
      <div className="w-[95%] sm:w-[90%] max-w-screen-2xl my-7 flex flex-col gap-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center">{pageTitle}</h1>

        {/* Gráfico de Resumen General */}
        {overviewIsLoading && effectiveUser && <div className="text-center text-slate-500 py-5">Cargando resumen general de interacciones...</div>}
        {overviewError && <div className="my-4 p-3.5 text-center text-red-700 bg-red-100 rounded-lg shadow-md">{overviewError}</div>}
        {overviewChartData?.hasData && !overviewIsLoading && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700 text-center mb-1">Historial Completo de Interacciones Totales</h2>
            {overviewChartData.firstDateDisplay && overviewChartData.lastDateDisplay && <p className="text-xs text-slate-500 text-center mb-4">Datos desde {overviewChartData.firstDateDisplay} hasta {overviewChartData.lastDateDisplay}</p>}
            <div className="h-[300px] sm:h-[350px]">
              <Line
                data={overviewChartData}
                options={{
                  ...chartOptionsBase,
                  plugins: { ...chartOptionsBase.plugins, title:{...chartOptionsBase.plugins.title, display:false}, legend:{...chartOptionsBase.plugins.legend, display:true, position:'bottom'}},
                  scales: { ...chartOptionsBase.scales, x:{...chartOptionsBase.scales.x, ticks: {...chartOptionsBase.scales.x.ticks, callback: function(v, i, tA){ const l=overviewChartData?.labels||[]; return(i===0||i===l.length-1)?l[i]:null;}, autoSkip:false, maxRotation:0, padding:10}}, y:{...chartOptionsBase.scales.y, title:{display:true, text:'Interacciones Totales'}}, y1:{...chartOptionsBase.scales.y1, display:false} }
                }}
              />
            </div>
          </div>
        )}
        {!overviewChartData?.hasData && !overviewIsLoading && !overviewError && effectiveUser &&
          <div className="text-center text-slate-500 py-5 mb-6 bg-white p-4 rounded-xl shadow-md">No hay datos históricos de interacciones para {effectiveUser}.</div>
        }

        {/* Formulario de Filtros */}
        <form onSubmit={handleFilterSubmit} className="bg-white p-4 sm:p-5 rounded-xl shadow-lg mb-6 sm:mb-8 flex flex-col md:flex-row flex-wrap gap-3 sm:gap-4 items-end">
          <div className="flex-1 min-w-[180px] sm:min-w-[200px]"><label htmlFor="startDate" className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Fecha Inicio:</label><input type="text" name="startDate" id="startDate" value={displayedDateInput.startDate} onChange={handleDateInputChange} placeholder="DD-MM-YYYY" className="w-full p-2 sm:p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"/></div>
          <div className="flex-1 min-w-[180px] sm:min-w-[200px]"><label htmlFor="endDate" className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Fecha Fin:</label><input type="text" name="endDate" id="endDate" value={displayedDateInput.endDate} onChange={handleDateInputChange} placeholder="DD-MM-YYYY" className="w-full p-2 sm:p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"/></div>
          {(availablePostTypes.length > 0) && <div className="flex-1 min-w-[180px] sm:min-w-[200px]"><label htmlFor="selectedPostType" className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Tipo de Post:</label><select id="selectedPostType" value={selectedPostType} onChange={(e)=>setSelectedPostType(e.target.value)} className="w-full p-2.5 sm:p-[11px] border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"><option value="">Todos los tipos</option>{availablePostTypes.map(type=><option key={type} value={type}>{type}</option>)}</select></div>}
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-5 sm:px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-colors text-sm h-full md:self-end mt-2 md:mt-0">Aplicar</button>
        </form>

        {isLoading && effectiveUser && <div className="text-center text-slate-500 py-5">Cargando estadísticas filtradas...</div>}
        {error && !isLoading && <div className="my-4 p-3.5 text-center text-red-700 bg-red-100 rounded-lg shadow-md">{error}</div>}

        {keyMetrics && !isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-lg text-center"><h3 className="text-sm sm:text-base font-medium text-slate-500 mb-1">Total Impresiones</h3><p className="text-xl sm:text-2xl font-bold text-slate-800">{keyMetrics.totalImpressions?.toLocaleString()||'0'}</p></div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center"><h3 className="text-sm sm:text-base font-medium text-slate-500 mb-1">Total Interacciones</h3><p className="text-xl sm:text-2xl font-bold text-slate-800">{keyMetrics.totalInteractions?.toLocaleString()||'0'}</p></div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center"><h3 className="text-sm sm:text-base font-medium text-slate-500 mb-1">Engagement Rate Prom.</h3><p className="text-xl sm:text-2xl font-bold text-slate-800">{keyMetrics.averageEngagementRate||'0.00'}%</p></div>
            <div className="bg-white p-4 rounded-xl shadow-lg text-center"><h3 className="text-sm sm:text-base font-medium text-slate-500 mb-1">Total Clics</h3><p className="text-xl sm:text-2xl font-bold text-slate-800git">{keyMetrics.totalClicks?.toLocaleString()||'0'}</p></div>
          </div>
        )}
        {!statsData && !isLoading && !error && effectiveUser &&
          <div className="text-center text-slate-500 py-10 text-lg">No hay datos de estadísticas para mostrar con los filtros actuales para {effectiveUser}.</div>
        }

        {/* Contenedor de los 6 Gráficos Principales */}
        {statsData && !isLoading && !error && (
          <CuadriculaGraficos statsData={statsData} chartOptionsBase={chartOptionsBase} />
        )}
      </div>
    </div>
  );
};

export default Estadisticas;