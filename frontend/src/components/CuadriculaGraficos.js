// src/components/CuadriculaGraficos.js
import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';

// El helper noDataMsg puede vivir aquí o ser importado si es más genérico
const noDataMsg = (chartName) => (
  <div className="bg-white p-6 rounded-xl shadow-xl flex items-center justify-center h-[350px] sm:h-[450px] md:h-[500px]">
    <p className="text-slate-500 text-center">No hay datos para '{chartName}' con filtros actuales.</p>
  </div>
);

const CuadriculaGraficos = ({ statsData, chartOptionsBase }) => {
  if (!statsData) {
    return null; // O un mensaje indicando que no hay datos para los gráficos principales
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {/* Gráfico 1: Tendencias */}
      {statsData.trendChart?.labels?.length ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl h-[350px] sm:h-[450px] md:h-[500px]"><div className="h-full">
          <Line data={statsData.trendChart} options={{...chartOptionsBase, plugins:{...chartOptionsBase.plugins, title:{...(chartOptionsBase.plugins?.title || {}), text:'Tendencia: Impresiones, Interacciones y Engagement Rate'}}, scales:{...chartOptionsBase.scales, y1: statsData.trendChart.datasets.some(ds=>ds.yAxisID==='y1') ? chartOptionsBase.scales.y1 : {...(chartOptionsBase.scales?.y1||{}), display:false}}}}/>
        </div></div>
      ) : noDataMsg('Tendencias')}
      
      {/* Gráfico 2: Rendimiento por Tipo de Post */}
      {statsData.postTypePerformanceChart?.labels?.length ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl h-[350px] sm:h-[450px] md:h-[500px]"><div className="h-full">
          <Bar data={statsData.postTypePerformanceChart} options={{...chartOptionsBase, plugins:{...chartOptionsBase.plugins, title:{...(chartOptionsBase.plugins?.title || {}), text:'Engagement Rate Prom. (%) por Tipo de Post'}}, scales:{x:chartOptionsBase.scales.x, y:{...chartOptionsBase.scales.y, ticks:{callback:v=>v+'%'}}}}}/>
        </div></div>
      ) : noDataMsg('Rendimiento por Tipo de Post')}
      
      {/* Gráfico 3: Distribución por Tipo de Post (Circular) */}
      {statsData.postTypeDistributionChart?.labels?.length ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl h-[350px] sm:h-[450px] md:h-[500px]"><div className="h-full flex flex-col items-center justify-center">
          <Pie data={statsData.postTypeDistributionChart} options={{...chartOptionsBase, plugins:{...chartOptionsBase.plugins, title:{...(chartOptionsBase.plugins?.title || {}), text:'Distribución por Tipo de Post'}}}}/>
        </div></div>
      ) : noDataMsg('Distribución por Tipo de Post')}
      
      {/* Gráfico 4: Tiempo Retención Promedio por Tipo de Post */}
      {statsData.avgRetentionTimeByPostTypeChart?.labels?.length ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl h-[350px] sm:h-[450px] md:h-[500px]"><div className="h-full">
          <Bar data={statsData.avgRetentionTimeByPostTypeChart} options={{...chartOptionsBase, plugins:{...chartOptionsBase.plugins, title:{...(chartOptionsBase.plugins?.title || {}), text:'Tiempo Retención Prom. por Tipo de Post'}}, scales:{...chartOptionsBase.scales, y:{...chartOptionsBase.scales.y, title:{display:true, text:'Tiempo Promedio (valor)'}}}}}/>
        </div></div>
      ) : noDataMsg('Tiempo de Retención Promedio')}
      
      {/* Gráfico 5: Variación de Impresiones */}
      {statsData.impressionsOverTimeChart?.labels?.length ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl h-[350px] sm:h-[450px] md:h-[500px]"><div className="h-full">
          <Line data={statsData.impressionsOverTimeChart} options={{...chartOptionsBase, plugins:{...chartOptionsBase.plugins, title:{...(chartOptionsBase.plugins?.title || {}), text:'Variación de Impresiones'}}, scales:{x:chartOptionsBase.scales.x, y:{...chartOptionsBase.scales.y, title:{display:true,text:'Impresiones'}}, y1:{display:false}}}}/>
        </div></div>
      ) : noDataMsg('Variación de Impresiones')}
      
      {/* Gráfico 6: Engagement Rate Prom. por Día Semana */}
      {statsData.engagementByDayOfWeekChart?.labels?.length ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl h-[350px] sm:h-[450px] md:h-[500px]"><div className="h-full">
          <Bar data={statsData.engagementByDayOfWeekChart} options={{...chartOptionsBase, plugins:{...chartOptionsBase.plugins, title:{...(chartOptionsBase.plugins?.title || {}), text:'Engagement Rate Prom. por Día Semana (%)'}}, scales:{x:chartOptionsBase.scales.x, y:{...chartOptionsBase.scales.y, ticks:{callback:v=>v+'%'}}}}}/>
        </div></div>
      ) : noDataMsg('Engagement por Día de Semana')}
    </div>
  );
};

export default CuadriculaGraficos;