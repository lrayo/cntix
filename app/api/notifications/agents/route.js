// app/api/notifications/agent/route.js
import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      agente_id,
      tipo,
      mensaje,
      datos,
      api_key
    } = body;
    
    // Validación básica de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    if (!agente_id || !tipo || !mensaje) {
      return Response.json({ 
        error: 'agente_id, tipo y mensaje son requeridos' 
      }, { status: 400 });
    }
    
    const pool = await connectDB();
    
    // Insertar notificación en base de datos
    const query = `
      INSERT INTO notificaciones_agente (
        id_usuario, tipo_notificacion, mensaje, datos_json, 
        estado_notificacion, fecha_notificacion, leida_sn,
        sys_usrcrea, sys_usrmod
      ) VALUES (
        @agente_id, @tipo, @mensaje, @datos_json,
        'enviada', GETDATE(), 0,
        @sys_usrcrea, @sys_usrmod
      )
    `;
    
    await pool.request()
      .input('agente_id', sql.Int, agente_id)
      .input('tipo', sql.VarChar, tipo)
      .input('mensaje', sql.NVarChar, mensaje)
      .input('datos_json', sql.NVarChar, JSON.stringify(datos || {}))
      .input('sys_usrcrea', sql.VarChar, 'n8n_notification_system')
      .input('sys_usrmod', sql.VarChar, 'n8n_notification_system')
      .query(query);
    
    // Si es notificación urgente, también crear alerta en tiempo real
    if (tipo === 'transferencia_urgente') {
      await crearAlertaTiempoReal(pool, agente_id, mensaje, datos);
    }
    
    return Response.json({
      success: true,
      message: 'Notificación enviada correctamente',
      timestamp: new Date().toISOString(),
      agente_id: agente_id,
      tipo: tipo
    });
    
  } catch (err) {
    console.error("❌ Error en API notifications/agent:", err);
    return Response.json({ 
      error: 'Error procesando notificación', 
      details: err.message 
    }, { status: 500 });
  }
}

// GET para obtener notificaciones pendientes de un agente
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const agente_id = searchParams.get("agente_id");
    const api_key = searchParams.get("api_key");
    const solo_no_leidas = searchParams.get("solo_no_leidas") === "true";
    
    // Validación de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    if (!agente_id) {
      return Response.json({ error: 'agente_id es requerido' }, { status: 400 });
    }
    
    const pool = await connectDB();
    
    let query = `
      SELECT 
        id_notificacion_agente,
        tipo_notificacion,
        mensaje,
        datos_json,
        estado_notificacion,
        fecha_notificacion,
        leida_sn,
        fecha_leida
      FROM notificaciones_agente 
      WHERE id_usuario = @agente_id
    `;
    
    if (solo_no_leidas) {
      query += ` AND leida_sn = 0`;
    }
    
    query += ` ORDER BY fecha_notificacion DESC`;
    
    const result = await pool.request()
      .input('agente_id', sql.Int, parseInt(agente_id))
      .query(query);
    
    const notificaciones = result.recordset.map(notif => ({
      id: notif.id_notificacion_agente,
      tipo: notif.tipo_notificacion,
      mensaje: notif.mensaje,
      datos: JSON.parse(notif.datos_json || '{}'),
      estado: notif.estado_notificacion,
      fecha: notif.fecha_notificacion,
      leida: notif.leida_sn === 1,
      fecha_leida: notif.fecha_leida
    }));
    
    return Response.json({
      success: true,
      agente_id: parseInt(agente_id),
      total_notificaciones: notificaciones.length,
      notificaciones_no_leidas: notificaciones.filter(n => !n.leida).length,
      notificaciones: notificaciones
    });
    
  } catch (err) {
    console.error("❌ Error obteniendo notificaciones:", err);
    return Response.json({ 
      error: 'Error obteniendo notificaciones', 
      details: err.message 
    }, { status: 500 });
  }
}

// PUT para marcar notificaciones como leídas
export async function PUT(req) {
  try {
    const body = await req.json();
    const { 
      notificacion_id,
      agente_id,
      marcar_como_leida = true,
      api_key
    } = body;
    
    // Validación de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    const pool = await connectDB();
    
    let query;
    let request = pool.request();
    
    if (notificacion_id) {
      // Marcar notificación específica
      query = `
        UPDATE notificaciones_agente 
        SET leida_sn = @leida, 
            fecha_leida = CASE WHEN @leida = 1 THEN GETDATE() ELSE NULL END,
            sys_fechamod = GETDATE()
        WHERE id_notificacion_agente = @notificacion_id
      `;
      
      request.input('notificacion_id', sql.Int, notificacion_id);
      
    } else if (agente_id) {
      // Marcar todas las notificaciones del agente
      query = `
        UPDATE notificaciones_agente 
        SET leida_sn = @leida,
            fecha_leida = CASE WHEN @leida = 1 THEN GETDATE() ELSE NULL END,
            sys_fechamod = GETDATE()
        WHERE id_usuario = @agente_id AND leida_sn = 0
      `;
      
      request.input('agente_id', sql.Int, agente_id);
      
    } else {
      return Response.json({ 
        error: 'Se requiere notificacion_id o agente_id' 
      }, { status: 400 });
    }
    
    request.input('leida', sql.Bit, marcar_como_leida ? 1 : 0);
    
    const result = await request.query(query);
    
    return Response.json({
      success: true,
      message: `${result.rowsAffected[0]} notificaciones actualizadas`,
      notificaciones_actualizadas: result.rowsAffected[0]
    });
    
  } catch (err) {
    console.error("❌ Error actualizando notificaciones:", err);
    return Response.json({ 
      error: 'Error actualizando notificaciones', 
      details: err.message 
    }, { status: 500 });
  }
}

// Función auxiliar para crear alertas en tiempo real
async function crearAlertaTiempoReal(pool, agente_id, mensaje, datos) {
  try {
    // Crear alerta de alta prioridad para mostrar en dashboard
    const alertaQuery = `
      INSERT INTO alertas_tiempo_real (
        id_usuario, tipo_alerta, mensaje, datos_json,
        prioridad, estado_alerta, fecha_alerta, expira_en,
        sys_usrcrea
      ) VALUES (
        @agente_id, 'transferencia_urgente', @mensaje, @datos_json,
        'alta', 'activa', GETDATE(), DATEADD(hour, 2, GETDATE()),
        'n8n_urgent_system'
      )
    `;
    
    await pool.request()
      .input('agente_id', sql.Int, agente_id)
      .input('mensaje', sql.NVarChar, mensaje)
      .input('datos_json', sql.NVarChar, JSON.stringify(datos || {}))
      .query(alertaQuery);
      
  } catch (error) {
    console.error("Error creando alerta tiempo real:", error);
    // No lanzar error para no afectar la notificación principal
  }
}