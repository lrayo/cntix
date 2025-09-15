// app/api/monitoring/report/route.js
import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { api_key } = new URL(req.url).searchParams;
    
    // Validación básica de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    const { 
      timestamp,
      period,
      services,
      overall_health,
      alerts,
      metrics,
      recommendations
    } = body;
    
    if (!timestamp || !overall_health || !services) {
      return Response.json({ 
        error: 'timestamp, overall_health y services son requeridos' 
      }, { status: 400 });
    }
    
    const pool = await connectDB();
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      // 1. Insertar reporte principal
      const reporteQuery = `
        INSERT INTO reportes_monitoreo (
          timestamp_reporte, periodo_monitoreo, estado_general,
          datos_servicios, metricas_sistema, alertas_json,
          recomendaciones_json, total_alertas, nivel_criticidad,
          sys_usrcrea, sys_usrmod
        ) VALUES (
          @timestamp, @period, @overall_health,
          @servicios_json, @metricas_json, @alertas_json,
          @recomendaciones_json, @total_alertas, @nivel_criticidad,
          @sys_usrcrea, @sys_usrmod
        )
      `;
      
      // Determinar nivel de criticidad
      const nivelCriticidad = determinarNivelCriticidad(overall_health, alerts);
      
      const reporteResult = await transaction.request()
        .input('timestamp', sql.DateTime, new Date(timestamp))
        .input('period', sql.VarChar, period)
        .input('overall_health', sql.VarChar, overall_health)
        .input('servicios_json', sql.NVarChar, JSON.stringify(services))
        .input('metricas_json', sql.NVarChar, JSON.stringify(metrics || {}))
        .input('alertas_json', sql.NVarChar, JSON.stringify(alerts || []))
        .input('recomendaciones_json', sql.NVarChar, JSON.stringify(recommendations || []))
        .input('total_alertas', sql.Int, alerts ? alerts.length : 0)
        .input('nivel_criticidad', sql.VarChar, nivelCriticidad)
        .input('sys_usrcrea', sql.VarChar, 'n8n_monitoring_system')
        .input('sys_usrmod', sql.VarChar, 'n8n_monitoring_system')
        .query(reporteQuery + '; SELECT SCOPE_IDENTITY() as id_reporte');
      
      const idReporte = reporteResult.recordset[0].id_reporte;
      
      // 2. Insertar detalles por servicio
      for (const [serviceName, serviceData] of Object.entries(services)) {
        await insertarDetalleServicio(transaction, idReporte, serviceName, serviceData);
      }
      
      // 3. Insertar alertas individuales si existen
      if (alerts && alerts.length > 0) {
        for (const alert of alerts) {
          await insertarAlerta(transaction, idReporte, alert);
        }
      }
      
      // 4. Actualizar métricas históricas
      await actualizarMetricasHistoricas(transaction, metrics, overall_health);
      
      // 5. Limpiar reportes antiguos (mantener solo últimos 30 días)
      await limpiarReportesAntiguos(transaction);
      
      await transaction.commit();
      
      return Response.json({
        success: true,
        message: 'Reporte de monitoreo guardado correctamente',
        id_reporte: idReporte,
        timestamp: timestamp,
        estado_general: overall_health,
        total_alertas: alerts ? alerts.length : 0,
        nivel_criticidad: nivelCriticidad
      });
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (err) {
    console.error("❌ Error en API monitoring/report:", err);
    return Response.json({ 
      error: 'Error guardando reporte de monitoreo', 
      details: err.message 
    }, { status: 500 });
  }
}

// GET para obtener reportes de monitoreo
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const api_key = searchParams.get("api_key");
    const limit = parseInt(searchParams.get("limit") || "10");
    const desde = searchParams.get("desde"); // fecha ISO
    const hasta = searchParams.get("hasta"); // fecha ISO
    const estado = searchParams.get("estado"); // healthy, degraded, critical
    
    // Validación de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    const pool = await connectDB();
    
    let query = `
      SELECT TOP (@limit)
        id_reporte_monitoreo,
        timestamp_reporte,
        periodo_monitoreo,
        estado_general,
        datos_servicios,
        metricas_sistema,
        alertas_json,
        recomendaciones_json,
        total_alertas,
        nivel_criticidad,
        sys_fechacrea
      FROM reportes_monitoreo 
      WHERE 1=1
    `;
    
    const request = pool.request().input('limit', sql.Int, limit);
    
    if (desde) {
      query += ` AND timestamp_reporte >= @desde`;
      request.input('desde', sql.DateTime, new Date(desde));
    }
    
    if (hasta) {
      query += ` AND timestamp_reporte <= @hasta`;
      request.input('hasta', sql.DateTime, new Date(hasta));
    }
    
    if (estado) {
      query += ` AND estado_general = @estado`;
      request.input('estado', sql.VarChar, estado);
    }
    
    query += ` ORDER BY timestamp_reporte DESC`;
    
    const result = await request.query(query);
    
    const reportes = result.recordset.map(reporte => ({
      id: reporte.id_reporte_monitoreo,
      timestamp: reporte.timestamp_reporte,
      periodo: reporte.periodo_monitoreo,
      estado_general: reporte.estado_general,
      servicios: JSON.parse(reporte.datos_servicios || '{}'),
      metricas: JSON.parse(reporte.metricas_sistema || '{}'),
      alertas: JSON.parse(reporte.alertas_json || '[]'),
      recomendaciones: JSON.parse(reporte.recomendaciones_json || '[]'),
      total_alertas: reporte.total_alertas,
      nivel_criticidad: reporte.nivel_criticidad,
      fecha_creacion: reporte.sys_fechacrea
    }));
    
    // Obtener estadísticas adicionales
    const estadisticas = await obtenerEstadisticasMonitoreo(pool, desde, hasta);
    
    return Response.json({
      success: true,
      total_reportes: reportes.length,
      reportes: reportes,
      estadisticas: estadisticas
    });
    
  } catch (err) {
    console.error("❌ Error obteniendo reportes de monitoreo:", err);
    return Response.json({ 
      error: 'Error obteniendo reportes de monitoreo', 
      details: err.message 
    }, { status: 500 });
  }
}

// Función auxiliar para insertar detalle de servicio
async function insertarDetalleServicio(transaction, idReporte, serviceName, serviceData) {
  const query = `
    INSERT INTO detalle_servicios_monitoreo (
      id_reporte_monitoreo, nombre_servicio, estado_servicio,
      detalles_json, error_mensaje, tiempo_respuesta_ms,
      disponibilidad_porcentaje, sys_usrcrea
    ) VALUES (
      @id_reporte, @nombre_servicio, @estado_servicio,
      @detalles_json, @error_mensaje, @tiempo_respuesta,
      @disponibilidad, 'n8n_monitoring_system'
    )
  `;
  
  await transaction.request()
    .input('id_reporte', sql.Int, idReporte)
    .input('nombre_servicio', sql.VarChar, serviceName)
    .input('estado_servicio', sql.VarChar, serviceData.status || 'unknown')
    .input('detalles_json', sql.NVarChar, JSON.stringify(serviceData.details || {}))
    .input('error_mensaje', sql.NVarChar, serviceData.error || null)
    .input('tiempo_respuesta', sql.Int, serviceData.response_time_ms || null)
    .input('disponibilidad', sql.Float, serviceData.availability_percent || null)
    .query(query);
}

// Función auxiliar para insertar alerta
async function insertarAlerta(transaction, idReporte, alert) {
  const query = `
    INSERT INTO alertas_monitoreo (
      id_reporte_monitoreo, servicio_afectado, nivel_alerta,
      mensaje_alerta, detalles_json, fecha_alerta, sys_usrcrea
    ) VALUES (
      @id_reporte, @servicio, @nivel, @mensaje,
      @detalles_json, GETDATE(), 'n8n_monitoring_system'
    )
  `;
  
  await transaction.request()
    .input('id_reporte', sql.Int, idReporte)
    .input('servicio', sql.VarChar, alert.service || 'general')
    .input('nivel', sql.VarChar, alert.level || 'info')
    .input('mensaje', sql.NVarChar, alert.message || '')
    .input('detalles_json', sql.NVarChar, JSON.stringify(alert))
    .query(query);
}

// Función auxiliar para actualizar métricas históricas
async function actualizarMetricasHistoricas(transaction, metrics, overallHealth) {
  if (!metrics) return;
  
  const query = `
    INSERT INTO metricas_historicas (
      fecha_metrica, total_llamadas, tasa_exito_porcentaje,
      transferencias_activas, estado_general_sistema, uptime_minutos,
      sys_usrcrea
    ) VALUES (
      GETDATE(), @total_llamadas, @tasa_exito, @transferencias_activas,
      @estado_general, @uptime, 'n8n_monitoring_system'
    )
  `;
  
  await transaction.request()
    .input('total_llamadas', sql.Int, metrics.total_calls || 0)
    .input('tasa_exito', sql.Float, metrics.success_rate || 0)
    .input('transferencias_activas', sql.Int, metrics.active_transfers || 0)
    .input('estado_general', sql.VarChar, overallHealth)
    .input('uptime', sql.Int, metrics.system_uptime || 0)
    .query(query);
}

// Función auxiliar para limpiar reportes antiguos
async function limpiarReportesAntiguos(transaction) {
  const query = `
    DELETE FROM reportes_monitoreo 
    WHERE timestamp_reporte < DATEADD(day, -30, GETDATE())
  `;
  
  await transaction.request().query(query);
}

// Función auxiliar para determinar nivel de criticidad
function determinarNivelCriticidad(overallHealth, alerts) {
  if (overallHealth === 'critical') return 'critico';
  if (overallHealth === 'degraded') return 'medio';
  
  if (alerts && alerts.length > 0) {
    const hascritical = alerts.some(alert => alert.level === 'critical');
    if (hasCritical) return 'critico';
    
    const hasWarning = alerts.some(alert => alert.level === 'warning');
    if (hasWarning) return 'medio';
  }
  
  return 'bajo';
}

// Función auxiliar para obtener estadísticas
async function obtenerEstadisticasMonitoreo(pool, desde, hasta) {
  try {
    let whereClause = '';
    const request = pool.request();
    
    if (desde) {
      whereClause += ' AND timestamp_reporte >= @desde';
      request.input('desde', sql.DateTime, new Date(desde));
    }
    
    if (hasta) {
      whereClause += ' AND timestamp_reporte <= @hasta';
      request.input('hasta', sql.DateTime, new Date(hasta));
    }
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_reportes,
        SUM(CASE WHEN estado_general = 'healthy' THEN 1 ELSE 0 END) as reportes_healthy,
        SUM(CASE WHEN estado_general = 'degraded' THEN 1 ELSE 0 END) as reportes_degraded,
        SUM(CASE WHEN estado_general = 'critical' THEN 1 ELSE 0 END) as reportes_critical,
        AVG(total_alertas) as promedio_alertas,
        MAX(total_alertas) as max_alertas
      FROM reportes_monitoreo 
      WHERE 1=1 ${whereClause}
    `;
    
    const result = await request.query(statsQuery);
    return result.recordset[0];
    
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {};
  }
}