// backend/controllers/estadisticasController.js
const pool = require('../db/db');

// Colores para gráficos (puedes expandir esta lista o moverla a un archivo de constantes)
const CHART_COLORS_RGBA = [
  'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
  'rgba(255, 99, 71, 0.7)',  'rgba(60, 179, 113, 0.7)', 'rgba(218, 112, 214, 0.7)',
  'rgba(100, 149, 237, 0.7)', 'rgba(255, 127, 80, 0.7)', 'rgba(32, 178, 170, 0.7)'
];
const CHART_COLORS_RGB = CHART_COLORS_RGBA.map(color => color.replace('0.7', '1').replace('rgba', 'rgb'));


exports.getDashboardStats = async (req, res) => {
  const { username, startDate, endDate, tipo_post } = req.query;

  if (!username || !startDate || !endDate) {
    return res.status(400).json({ message: 'Usuario, fecha de inicio y fecha de fin son requeridos.' });
  }

  try {
    const distinctPostTypesQuery = `
      SELECT DISTINCT tipo_post 
      FROM publicaciones 
      WHERE username = $1 ORDER BY tipo_post ASC;
    `;
    const distinctPostTypesResult = await pool.query(distinctPostTypesQuery, [username]);
    const availablePostTypes = distinctPostTypesResult.rows.map(row => row.tipo_post);

    let baseQueryFrom = `FROM publicaciones WHERE username = $1 AND fecha_publicacion >= $2 AND fecha_publicacion <= $3`;
    const baseQueryParams = [username, startDate, endDate];
    
    let filteredQueryFrom = baseQueryFrom;
    const filteredQueryParams = [...baseQueryParams];
    let currentParamIndexForFiltered = 3;

    if (tipo_post) {
      currentParamIndexForFiltered++;
      filteredQueryFrom += ` AND tipo_post = $${currentParamIndexForFiltered}`;
      filteredQueryParams.push(tipo_post);
    }

    // 1. Gráfico de Tendencias
    const trendQuery = `
      SELECT
        TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS date_str,
        SUM(impresiones) AS total_impressions,
        SUM(interacciones_total) AS total_interactions,
        COALESCE(AVG(engagement_rate) * 100, 0) AS engagement_rate_avg_percent 
      ${filteredQueryFrom}
      GROUP BY date_str
      ORDER BY date_str ASC;
    `;
    const trendResult = await pool.query(trendQuery, filteredQueryParams);
    const trendChartData = {
      labels: trendResult.rows.map(row => new Date(row.date_str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
      datasets: [
        { label: 'Impresiones', data: trendResult.rows.map(row => parseInt(row.total_impressions, 10)), borderColor: CHART_COLORS_RGB[3], backgroundColor: CHART_COLORS_RGBA[3].replace('0.7','0.2'), tension: 0.1, fill: true },
        { label: 'Interacciones', data: trendResult.rows.map(row => parseInt(row.total_interactions, 10)), borderColor: CHART_COLORS_RGB[0], backgroundColor: CHART_COLORS_RGBA[0].replace('0.7','0.2'), tension: 0.1, fill: true },
        { label: 'Engagement Rate (%)', data: trendResult.rows.map(row => parseFloat(row.engagement_rate_avg_percent).toFixed(2)), borderColor: CHART_COLORS_RGB[1], backgroundColor: CHART_COLORS_RGBA[1].replace('0.7','0.2'), tension: 0.1, fill: true, yAxisID: 'y1' }
      ]
    };

    // 2. Rendimiento (Engagement Rate %) por Tipo de Post (ignora filtro tipo_post)
    const performanceByPostTypeQuery = `
      SELECT tipo_post, COALESCE(AVG(engagement_rate) * 100, 0) AS engagement_rate_avg_percent
      ${baseQueryFrom}
      GROUP BY tipo_post ORDER BY engagement_rate_avg_percent DESC;
    `;
    const performanceResult = await pool.query(performanceByPostTypeQuery, baseQueryParams);
    const postTypePerformanceChartData = {
      labels: performanceResult.rows.map(row => row.tipo_post),
      datasets: [{
        label: 'Engagement Rate Promedio (%)',
        data: performanceResult.rows.map(row => parseFloat(row.engagement_rate_avg_percent).toFixed(2)),
        backgroundColor: CHART_COLORS_RGBA.slice(0, performanceResult.rows.length),
        borderColor: CHART_COLORS_RGB.slice(0, performanceResult.rows.length),
        borderWidth: 1
      }]
    };
    
    // KPIs Generales (con filtro tipo_post)
    const kpiQuery = `
      SELECT
        SUM(impresiones) AS total_kpi_impressions,
        SUM(interacciones_total) AS total_kpi_interactions,
        COALESCE(AVG(engagement_rate) * 100, 0) AS avg_kpi_engagement_rate_percent,
        SUM(clics_enlaces) AS total_kpi_clicks
      ${filteredQueryFrom}; 
    `;
    const kpiResult = await pool.query(kpiQuery, filteredQueryParams);
    const kpis = kpiResult.rows[0] || {};

    // 3. Distribución de Publicaciones por tipo_post (Circular - ignora filtro tipo_post)
    const postTypeDistributionQuery = `
      SELECT tipo_post, COUNT(*) AS cantidad_publicaciones
      ${baseQueryFrom}
      GROUP BY tipo_post ORDER BY cantidad_publicaciones DESC;
    `;
    const postTypeDistributionResult = await pool.query(postTypeDistributionQuery, baseQueryParams);
    const postTypeDistributionChartData = {
      labels: postTypeDistributionResult.rows.map(row => row.tipo_post),
      datasets: [{
        data: postTypeDistributionResult.rows.map(row => row.cantidad_publicaciones),
        backgroundColor: CHART_COLORS_RGBA.slice(0, postTypeDistributionResult.rows.length),
        borderColor: CHART_COLORS_RGB.slice(0, postTypeDistributionResult.rows.length),
        borderWidth: 1
      }]
    };

    // 4. Tiempo de Retención Promedio por tipo_post (Barras - ignora filtro tipo_post)
    const avgRetentionTimeQuery = `
      SELECT tipo_post, COALESCE(AVG(tiempo_retencion), 0) AS retencion_promedio
      ${baseQueryFrom} AND tiempo_retencion IS NOT NULL AND tiempo_retencion > 0
      GROUP BY tipo_post ORDER BY retencion_promedio DESC;
    `;
    const avgRetentionTimeResult = await pool.query(avgRetentionTimeQuery, baseQueryParams);
    const avgRetentionTimeByPostTypeChartData = {
      labels: avgRetentionTimeResult.rows.map(row => row.tipo_post),
      datasets: [{
        label: 'Tiempo Retención Prom. (valor)',
        data: avgRetentionTimeResult.rows.map(row => parseFloat(row.retencion_promedio).toFixed(1)),
        backgroundColor: CHART_COLORS_RGBA.slice(0, avgRetentionTimeResult.rows.length),
        borderColor: CHART_COLORS_RGB.slice(0, avgRetentionTimeResult.rows.length),
        borderWidth: 1
      }]
    };
    
    // 5. Variación de Impresiones a lo Largo del Tiempo (Línea - con filtro tipo_post)
    const impressionsOverTimeQuery = `
      SELECT TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS date_str, SUM(impresiones) AS total_impressions
      ${filteredQueryFrom}
      GROUP BY date_str ORDER BY date_str ASC;
    `;
    const impressionsOverTimeResult = await pool.query(impressionsOverTimeQuery, filteredQueryParams);
    const impressionsOverTimeChartData = {
      labels: impressionsOverTimeResult.rows.map(row => new Date(row.date_str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short'})),
      datasets: [{
        label: 'Impresiones',
        data: impressionsOverTimeResult.rows.map(row => parseInt(row.total_impressions, 10)),
        borderColor: CHART_COLORS_RGB[4], // Color diferente
        backgroundColor: CHART_COLORS_RGBA[4].replace('0.7','0.2'),
        tension: 0.1,
        fill: true
      }]
    };

    // 6. Engagement Rate Promedio por Día de la Semana (Barras - con filtro tipo_post)
    const engagementByDayOfWeekQuery = `
      SELECT
        EXTRACT(ISODOW FROM fecha_publicacion) AS num_dia_semana,
        CASE EXTRACT(ISODOW FROM fecha_publicacion)
          WHEN 1 THEN 'Lunes' WHEN 2 THEN 'Martes' WHEN 3 THEN 'Miércoles'
          WHEN 4 THEN 'Jueves' WHEN 5 THEN 'Viernes' WHEN 6 THEN 'Sábado'
          ELSE 'Domingo'
        END AS nombre_dia_semana,
        COALESCE(AVG(engagement_rate) * 100, 0) AS engagement_rate_promedio_percent
      ${filteredQueryFrom}
      GROUP BY num_dia_semana
      ORDER BY num_dia_semana ASC;
    `;
    const engagementByDayOfWeekResult = await pool.query(engagementByDayOfWeekQuery, filteredQueryParams);
    const engagementByDayOfWeekChartData = {
      labels: engagementByDayOfWeekResult.rows.map(row => row.nombre_dia_semana),
      datasets: [{
        label: 'Engagement Rate Prom. (%)',
        data: engagementByDayOfWeekResult.rows.map(row => parseFloat(row.engagement_rate_promedio_percent).toFixed(2)),
        backgroundColor: CHART_COLORS_RGBA.slice(0, engagementByDayOfWeekResult.rows.length),
        borderColor: CHART_COLORS_RGB.slice(0, engagementByDayOfWeekResult.rows.length),
        borderWidth: 1
      }]
    };

    res.status(200).json({
      availablePostTypes,
      trendChart: trendChartData,
      postTypePerformanceChart: postTypePerformanceChartData,
      keyMetrics: {
        totalImpressions: parseInt(kpis.total_kpi_impressions, 10) || 0,
        totalInteractions: parseInt(kpis.total_kpi_interactions, 10) || 0,
        averageEngagementRate: parseFloat(kpis.avg_kpi_engagement_rate_percent).toFixed(2) || '0.00',
        totalClicks: parseInt(kpis.total_kpi_clicks, 10) || 0,
      },
      postTypeDistributionChart: postTypeDistributionChartData,
      avgRetentionTimeByPostTypeChart: avgRetentionTimeByPostTypeChartData,
      impressionsOverTimeChart: impressionsOverTimeChartData,
      engagementByDayOfWeekChart: engagementByDayOfWeekChartData,
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor al calcular estadísticas.' });
  }
};

exports.getInteractionsOverviewStats = async (req, res) => {
  const { username } = req.query; 
  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }
  try {
    const overviewQuery = `
      SELECT
        fecha_publicacion, -- Necesitamos la fecha completa para ordenar y obtener min/max
        TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS date_str,
        SUM(interacciones_total) AS total_interactions
      FROM publicaciones
      WHERE username = $1
      GROUP BY fecha_publicacion 
      ORDER BY fecha_publicacion ASC; 
    `;
    const overviewResult = await pool.query(overviewQuery, [username]);

    if (overviewResult.rows.length === 0) {
      return res.status(200).json({ labels: [], datasets: [{ data: [] }], firstDateDisplay: null, lastDateDisplay: null, hasData: false });
    }

    const labels = overviewResult.rows.map(row => new Date(row.date_str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    const data = overviewResult.rows.map(row => parseInt(row.total_interactions, 10));
    
    const firstDateDisplay = new Date(overviewResult.rows[0].date_str).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const lastDateDisplay = new Date(overviewResult.rows[overviewResult.rows.length - 1].date_str).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    res.status(200).json({
      labels: labels, 
      datasets: [
        {
          label: 'Interacciones Totales', data: data,
          borderColor: 'rgb(112, 76, 182)', backgroundColor: 'rgba(112, 76, 182, 0.2)',
          tension: 0.2, fill: true, pointRadius: 1, pointHoverRadius: 4, borderWidth: 1.5
        }
      ],
      firstDateDisplay: firstDateDisplay, 
      lastDateDisplay: lastDateDisplay,  
      hasData: true
    });
  } catch (error) {
    console.error('Error al obtener resumen de interacciones:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener resumen de interacciones.' });
  }
};