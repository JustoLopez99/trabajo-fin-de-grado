// backend/controllers/prediccionesController.js
const pool = require('../db/db');

// Helper para nombres de días de la semana
const getDayName = (dayNumber) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days[dayNumber - 1] || 'Desconocido';
};

// 1. Predicción del Mejor Momento para Publicar
exports.getBestTimeToPost = async (req, res) => {
  const { username, metric = 'engagement_rate' } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }

  const orderByClause = metric === 'interacciones_total'
    ? 'AVG(p.interacciones_total) DESC'
    : 'AVG(p.engagement_rate) DESC';

  try {
    const query = `
      SELECT
        EXTRACT(ISODOW FROM p.fecha_publicacion) AS num_dia_semana,
        EXTRACT(HOUR FROM p.hora_publicacion) AS hora_del_dia,
        COALESCE(AVG(p.engagement_rate), 0) AS avg_engagement_rate,
        COALESCE(AVG(p.interacciones_total), 0) AS avg_interacciones_total,
        COUNT(*) AS num_posts
      FROM publicaciones p
      WHERE p.username = $1
        AND p.fecha_publicacion IS NOT NULL 
        AND p.hora_publicacion IS NOT NULL
      GROUP BY EXTRACT(ISODOW FROM p.fecha_publicacion), EXTRACT(HOUR FROM p.hora_publicacion)
      HAVING COUNT(*) > 0
      ORDER BY ${orderByClause}
      LIMIT 6; 
    `;
    
    const result = await pool.query(query, [username]);
    
    const bestTimes = result.rows.map(row => {
      const numDia = parseInt(row.num_dia_semana, 10);
      const horaDia = parseInt(row.hora_del_dia, 10);
      return {
        dia_semana: getDayName(numDia),
        hora: horaDia, 
        avg_engagement_rate: parseFloat(row.avg_engagement_rate).toFixed(4),
        avg_interacciones_total: parseFloat(row.avg_interacciones_total).toFixed(2),
        num_posts: parseInt(row.num_posts, 10)
      };
    });

    const validBestTimes = bestTimes.filter(time => !isNaN(time.hora));

    if (validBestTimes.length === 0) {
        return res.status(200).json({ message: 'No hay suficientes datos válidos de fecha/hora para determinar el mejor momento.', bestTimes: [] });
    }

    res.status(200).json({ bestTimes: validBestTimes });

  } catch (error) {
    console.error(`[CONTROLLER ERROR - getBestTimeToPost] User: ${username}, Error: ${error.message}`, error.stack);
    res.status(500).json({ message: 'Error interno del servidor al realizar la predicción del mejor momento.' });
  }
};

// 2. Predicción del Formato de Contenido Más Efectivo (con Top 5 + Otros)
exports.getMostEffectiveFormat = async (req, res) => {
  const { username, metric = 'engagement_rate' } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }

  try {
    const allFormatsQuery = `
      SELECT
        tipo_post,
        SUM(interacciones_total) as sum_interacciones,
        SUM(impresiones) as sum_impresiones,
        COUNT(*) AS num_posts
      FROM publicaciones
      WHERE username = $1
        AND tipo_post IS NOT NULL AND tipo_post != ''
      GROUP BY tipo_post
      HAVING COUNT(*) > 0;
    `;
    const allFormatsResult = await pool.query(allFormatsQuery, [username]);

    if (allFormatsResult.rows.length === 0) {
      return res.status(200).json({ message: 'No hay suficientes datos para determinar el formato más efectivo.', effectiveFormats: [] });
    }

    let processedFormats = allFormatsResult.rows.map(row => {
      const sumInteracciones = parseFloat(row.sum_interacciones);
      const sumImpresiones = parseFloat(row.sum_impresiones);
      const numPosts = parseInt(row.num_posts, 10);
      
      const avgEngagementRate = (sumImpresiones > 0) ? (sumInteracciones / sumImpresiones) : 0;
      const avgInteraccionesTotal = (numPosts > 0) ? (sumInteracciones / numPosts) : 0;
      
      return {
        tipo_post: row.tipo_post,
        avg_engagement_rate: avgEngagementRate,
        avg_interacciones_total: avgInteraccionesTotal,
        num_posts: numPosts,
        sum_interacciones: sumInteracciones,
        sum_impresiones: sumImpresiones
      };
    });

    processedFormats.sort((a, b) => {
      if (metric === 'interacciones_total') {
        return b.avg_interacciones_total - a.avg_interacciones_total;
      }
      return b.avg_engagement_rate - a.avg_engagement_rate;
    });

    const MAX_INDIVIDUAL_FORMATS = 5;
    let finalFormats = [];

    if (processedFormats.length > MAX_INDIVIDUAL_FORMATS) {
      finalFormats = processedFormats.slice(0, MAX_INDIVIDUAL_FORMATS).map(f => ({
          tipo_post: f.tipo_post,
          avg_engagement_rate: f.avg_engagement_rate.toFixed(4),
          avg_interacciones_total: f.avg_interacciones_total.toFixed(2),
          num_posts: f.num_posts
      }));

      const otherRows = processedFormats.slice(MAX_INDIVIDUAL_FORMATS);
      let otrosSumInteracciones = 0;
      let otrosSumImpresiones = 0;
      let otrosNumPosts = 0;

      otherRows.forEach(row => {
        otrosSumInteracciones += row.sum_interacciones;
        otrosSumImpresiones += row.sum_impresiones;
        otrosNumPosts += row.num_posts;
      });

      if (otrosNumPosts > 0) {
        const otrosAvgEngagementRate = (otrosSumImpresiones > 0) ? (otrosSumInteracciones / otrosSumImpresiones) : 0;
        const otrosAvgInteraccionesTotal = (otrosNumPosts > 0) ? (otrosSumInteracciones / otrosNumPosts) : 0;
        finalFormats.push({
          tipo_post: 'Otros',
          avg_engagement_rate: otrosAvgEngagementRate.toFixed(4),
          avg_interacciones_total: otrosAvgInteraccionesTotal.toFixed(2),
          num_posts: otrosNumPosts
        });
      }
    } else {
      finalFormats = processedFormats.map(f => ({
        tipo_post: f.tipo_post,
        avg_engagement_rate: f.avg_engagement_rate.toFixed(4),
        avg_interacciones_total: f.avg_interacciones_total.toFixed(2),
        num_posts: f.num_posts
      }));
    }
    
    res.status(200).json({ effectiveFormats: finalFormats });

  } catch (error) {
    console.error(`[CONTROLLER ERROR - getMostEffectiveFormat] User: ${username}, Error: ${error.message}`, error.stack);
    res.status(500).json({ message: 'Error interno del servidor al predecir el formato más efectivo.' });
  }
};

// 3. Estimación del Rendimiento Potencial de un Nuevo Post
exports.getPotentialPerformance = async (req, res) => {
  const { username, tipo_post, dia_semana, hora } = req.query; 

  if (!username || !tipo_post || dia_semana === undefined || hora === undefined) {
    return res.status(400).json({ message: 'Usuario, tipo de post, día de la semana y hora son requeridos.' });
  }
  
  const diaSemanaNum = parseInt(dia_semana, 10);
  const horaNum = parseInt(hora, 10);

  if (isNaN(diaSemanaNum) || diaSemanaNum < 1 || diaSemanaNum > 7 || isNaN(horaNum) || horaNum < 0 || horaNum > 23) {
    return res.status(400).json({ message: 'Día de la semana u hora inválidos.' });
  }

  try {
    const query = `
      SELECT
        COALESCE(AVG(p.impresiones), 0) AS avg_impresiones,
        COALESCE(AVG(p.interacciones_total), 0) AS avg_interacciones_total,
        COALESCE(AVG(p.engagement_rate), 0) AS avg_engagement_rate,
        COUNT(*) as num_posts_considerados
      FROM publicaciones p
      WHERE p.username = $1
        AND p.tipo_post = $2
        AND EXTRACT(ISODOW FROM p.fecha_publicacion) = $3
        AND EXTRACT(HOUR FROM p.hora_publicacion) BETWEEN $4 - 1 AND $4 + 1
        AND p.fecha_publicacion IS NOT NULL
        AND p.hora_publicacion IS NOT NULL;
    `;
    const result = await pool.query(query, [username, tipo_post, diaSemanaNum, horaNum]);
    
    const estimation = result.rows[0];
    const numPostsConsidered = (estimation && estimation.num_posts_considerados !== undefined) 
      ? parseInt(estimation.num_posts_considerados, 10) 
      : 0;

    if (numPostsConsidered === 0) {
        return res.status(200).json({ 
            message: 'No se encontraron posts históricos con características suficientemente similares para una estimación fiable.', 
            estimation: {
                avg_impresiones: "N/A",
                avg_interacciones_total: "N/A",
                avg_engagement_rate: "N/A",
                num_posts_considerados: 0
            }
        });
    }

    res.status(200).json({
      estimation: {
        avg_impresiones: parseFloat(estimation.avg_impresiones).toFixed(0),
        avg_interacciones_total: parseFloat(estimation.avg_interacciones_total).toFixed(0),
        avg_engagement_rate: parseFloat(estimation.avg_engagement_rate).toFixed(4),
        num_posts_considerados: numPostsConsidered
      }
    });

  } catch (error) {
    console.error(`[CONTROLLER ERROR - getPotentialPerformance] User: ${username}, Error: ${error.message}`, error.stack);
    res.status(500).json({ message: 'Error interno del servidor al estimar el rendimiento potencial.' });
  }
};

// 4. Impacto de Incluir un Enlace
exports.getLinkImpact = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }

  try {
    const query = `
      SELECT
        contiene_enlace,
        COALESCE(AVG(engagement_rate), 0) AS avg_engagement_rate,
        COALESCE(AVG(clics_enlaces), 0) AS avg_clics_enlaces,
        COALESCE(AVG(interacciones_total), 0) AS avg_interacciones_total,
        COUNT(*) as num_posts
      FROM publicaciones
      WHERE username = $1
      GROUP BY contiene_enlace;
    `;
    const result = await pool.query(query, [username]);

    let impact = {
      con_enlace: { avg_engagement_rate: "0.0000", avg_clics_enlaces: "0.00", avg_interacciones_total: "0.00", num_posts:0 },
      sin_enlace: { avg_engagement_rate: "0.0000", avg_clics_enlaces: "0.00", avg_interacciones_total: "0.00", num_posts:0 }
    };

    if (result.rows.length > 0) {
        result.rows.forEach(row => {
          const data = {
            avg_engagement_rate: parseFloat(row.avg_engagement_rate).toFixed(4),
            avg_clics_enlaces: parseFloat(row.avg_clics_enlaces).toFixed(2),
            avg_interacciones_total: parseFloat(row.avg_interacciones_total).toFixed(2),
            num_posts: parseInt(row.num_posts, 10)
          };
          if (row.contiene_enlace) {
            impact.con_enlace = data;
          } else {
            impact.sin_enlace = data;
          }
        });
    } else {
         return res.status(200).json({ message: 'No hay datos de publicaciones para analizar el impacto de los enlaces.', impact });
    }
    
    res.status(200).json({ impact });

  } catch (error) {
    console.error(`[CONTROLLER ERROR - getLinkImpact] User: ${username}, Error: ${error.message}`, error.stack);
    res.status(500).json({ message: 'Error interno del servidor al analizar el impacto del enlace.' });
  }
};

// 5. Obtener Tipos de Post Disponibles
exports.getAvailablePostTypes = async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
    }
    try {
        const distinctPostTypesQuery = `
            SELECT DISTINCT tipo_post 
            FROM publicaciones 
            WHERE username = $1 
              AND tipo_post IS NOT NULL AND tipo_post != ''
            ORDER BY tipo_post ASC;
        `;
        const distinctPostTypesResult = await pool.query(distinctPostTypesQuery, [username]);
        const availablePostTypes = distinctPostTypesResult.rows.map(row => row.tipo_post);
        res.status(200).json({ availablePostTypes });
    } catch (error) {
        console.error(`[CONTROLLER ERROR - getAvailablePostTypes] User: ${username}, Error: ${error.message}`, error.stack);
        res.status(500).json({ message: 'Error interno del servidor al obtener tipos de post.' });
    }
};

// 6. Análisis de la Composición de Interacciones
exports.getInteractionComposition = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }

  try {
    const query = `
      SELECT
        tipo_post,
        COALESCE(SUM(me_gusta), 0) AS total_me_gusta,
        COALESCE(SUM(comentarios), 0) AS total_comentarios,
        COALESCE(SUM(compartidos), 0) AS total_compartidos,
        COALESCE(SUM(interacciones_total), 0) AS sum_interacciones_total,
        COUNT(*) AS num_posts
      FROM publicaciones
      WHERE username = $1
        AND tipo_post IS NOT NULL AND tipo_post != ''
      GROUP BY tipo_post
      ORDER BY tipo_post;
    `;
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No hay datos para analizar la composición de interacciones.', composition: [] });
    }

    const composition = result.rows.map(row => {
      const sumInteraccionesTotalNum = parseFloat(row.sum_interacciones_total);
      const totalMeGusta = parseInt(row.total_me_gusta, 10);
      const totalComentarios = parseInt(row.total_comentarios, 10);
      const totalCompartidos = parseInt(row.total_compartidos, 10);

      return {
        tipo_post: row.tipo_post,
        num_posts: parseInt(row.num_posts, 10),
        me_gusta: totalMeGusta,
        comentarios: totalComentarios,
        compartidos: totalCompartidos,
        sum_interacciones_total: sumInteraccionesTotalNum,
        porc_me_gusta: sumInteraccionesTotalNum > 0 ? ((totalMeGusta / sumInteraccionesTotalNum) * 100).toFixed(1) : "0.0",
        porc_comentarios: sumInteraccionesTotalNum > 0 ? ((totalComentarios / sumInteraccionesTotalNum) * 100).toFixed(1) : "0.0",
        porc_compartidos: sumInteraccionesTotalNum > 0 ? ((totalCompartidos / sumInteraccionesTotalNum) * 100).toFixed(1) : "0.0",
      };
    });

    res.status(200).json({ composition });

  } catch (error) {
    console.error(`[CONTROLLER ERROR - getInteractionComposition] User: ${username}, Error: ${error.message}`, error.stack);
    res.status(500).json({ message: 'Error interno del servidor al analizar la composición de interacciones.' });
  }
};

// 7. Impacto del tiempo_retencion en el Engagement
exports.getRetentionImpact = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }

  try {
    const query = `
      SELECT
        CASE
          WHEN tiempo_retencion > 0 AND tiempo_retencion <= 15 THEN 'Muy Corto (0-15s)'
          WHEN tiempo_retencion > 15 AND tiempo_retencion <= 45 THEN 'Corto (16-45s)'
          WHEN tiempo_retencion > 45 AND tiempo_retencion <= 90 THEN 'Medio (46-90s)'
          WHEN tiempo_retencion > 90 AND tiempo_retencion <= 180 THEN 'Largo (91-180s)'
          WHEN tiempo_retencion > 180 THEN 'Muy Largo (>180s)'
          ELSE 'N/D'
        END AS rango_retencion_key,
        MIN(CASE
          WHEN tiempo_retencion > 0 AND tiempo_retencion <= 15 THEN 1
          WHEN tiempo_retencion > 15 AND tiempo_retencion <= 45 THEN 2
          WHEN tiempo_retencion > 45 AND tiempo_retencion <= 90 THEN 3
          WHEN tiempo_retencion > 90 AND tiempo_retencion <= 180 THEN 4
          WHEN tiempo_retencion > 180 THEN 5
          ELSE 0 
        END) as rango_order,
        COALESCE(AVG(engagement_rate), 0) AS avg_engagement_rate,
        COALESCE(AVG(interacciones_total), 0) AS avg_interacciones_total,
        COUNT(*) AS num_posts
      FROM publicaciones
      WHERE username = $1
        AND tiempo_retencion IS NOT NULL AND tiempo_retencion > 0
      GROUP BY rango_retencion_key
      ORDER BY rango_order;
    `;
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No hay suficientes datos de tiempo de retención para analizar su impacto.', retentionImpact: [] });
    }
    
    const retentionImpact = result.rows.map(row => ({
        rango_retencion: row.rango_retencion_key,
        avg_engagement_rate: parseFloat(row.avg_engagement_rate).toFixed(4),
        avg_interacciones_total: parseFloat(row.avg_interacciones_total).toFixed(2),
        num_posts: parseInt(row.num_posts, 10)
    })).filter(item => item.rango_retencion !== 'N/D');

    res.status(200).json({ retentionImpact });

  } catch (error) {
    console.error(`[CONTROLLER ERROR - getRetentionImpact] User: ${username}, Error: ${error.message}`, error.stack);
    res.status(500).json({ message: 'Error interno del servidor al analizar el impacto del tiempo de retención.' });
  }
};