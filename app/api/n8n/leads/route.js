// app/api/n8n/leads/route.js
import { connectDB, sql } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parámetros de consulta opcionales
    const programacionId = searchParams.get("programacion_id");
    const limite = parseInt(searchParams.get("limite") || "10");
    const prioridad = searchParams.get("prioridad") || "alta"; // alta, media, baja
    const apiKey = searchParams.get("api_key");
    
    // Validación básica de API Key (configurar en variables de entorno)
    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const pool = await connectDB();
    
    // Query para obtener leads listos para llamar
    let baseQuery = `
      SELECT TOP (@limite)
        pd.id_progdet,
        pd.id_programacion,
        pd.id_empresalead,
        pd.id_usuario,
        pd.intentos_llamada,
        pd.estado_llamada,
        pd.fecha_llamada,
        
        -- Información de la empresa
        el.numero_doc,
        el.nombre_comercial,
        el.nombre_razonsocial,
        el.telefono1,
        el.telefono2,
        el.email,
        el.direccion_negocio,
        el.ciudad,
        el.departamento,
        
        -- Información del agente asignado
        u.nombre as nombre_agente,
        u.email as email_agente,
        
        -- Información de la programación
        p.nombre as nombre_programacion,
        p.descripcion as descripcion_programacion
        
      FROM programaciones_detalle pd
      INNER JOIN empresas_leads el ON pd.id_empresalead = el.id_empresalead
      LEFT JOIN usuarios u ON pd.id_usuario = u.id_usuario
      LEFT JOIN programaciones p ON pd.id_programacion = p.id_programacion
      
      WHERE pd.estado_prog_detalle = 1
        AND pd.estado_llamada = 'p'  -- Solo leads pendientes
        AND el.estado_empresas_leads = 1
        AND (el.telefono1 IS NOT NULL OR el.telefono2 IS NOT NULL)  -- Debe tener al menos un teléfono
    `;
    
    // Agregar filtros adicionales
    if (programacionId) {
      baseQuery += ` AND pd.id_programacion = @programacion_id`;
    }
    
    // Ordenamiento por prioridad
    switch (prioridad) {
      case 'alta':
        baseQuery += ` AND pd.intentos_llamada < 3`;
        break;
      case 'media':
        baseQuery += ` AND pd.intentos_llamada BETWEEN 3 AND 5`;
        break;
      case 'baja':
        baseQuery += ` AND pd.intentos_llamada > 5`;
        break;
    }
    
    baseQuery += `
      ORDER BY 
        pd.intentos_llamada ASC,  -- Menos intentos primero
        pd.sys_fechacrea ASC      -- Más antiguos primero
    `;

    const request = pool.request()
      .input('limite', sql.Int, limite);
    
    if (programacionId) {
      request.input('programacion_id', sql.Int, parseInt(programacionId));
    }
    
    const result = await request.query(baseQuery);
    
    // Formatear respuesta para N8N
    const leadsFormateados = result.recordset.map(lead => ({
      // Identificadores únicos
      id_progdet: lead.id_progdet,
      id_empresalead: lead.id_empresalead,
      
      // Información de contacto
      cliente: {
        numero_doc: lead.numero_doc,
        nombre_comercial: lead.nombre_comercial || lead.nombre_razonsocial,
        telefono_principal: lead.telefono1,
        telefono_secundario: lead.telefono2,
        email: lead.email,
        direccion: lead.direccion_negocio,
        ciudad: lead.ciudad,
        departamento: lead.departamento
      },
      
      // Estado de la llamada
      llamada: {
        intentos_previos: lead.intentos_llamada,
        estado_actual: lead.estado_llamada,
        fecha_programada: lead.fecha_llamada,
        agente_asignado: lead.nombre_agente,
        email_agente: lead.email_agente
      },
      
      // Información de la campaña
      campana: {
        id_programacion: lead.id_programacion,
        nombre: lead.nombre_programacion,
        descripcion: lead.descripcion_programacion
      },
      
      // URLs para callbacks
      urls: {
        webhook_resultado: `${process.env.NEXTAUTH_URL}/api/webhooks/call-result`,
        tipificador_url: `${process.env.NEXTAUTH_URL}/tipificadorMasivo?progdet=${lead.id_progdet}&auto=1`
      }
    }));
    
    return Response.json({
      success: true,
      total_leads: leadsFormateados.length,
      timestamp: new Date().toISOString(),
      leads: leadsFormateados
    });
    
  } catch (err) {
    console.error("❌ Error en API N8N leads:", err);
    return Response.json({ 
      error: 'Error en la base de datos', 
      details: err.message 
    }, { status: 500 });
  }
}

// Método POST para actualizar estado de lead después de intentar llamar
export async function POST(req) {
  try {
    const body = await req.json();
    const { id_progdet, resultado_llamada, api_key } = body;
    
    // Validación básica de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    if (!id_progdet || !resultado_llamada) {
      return Response.json({ 
        error: 'id_progdet y resultado_llamada son requeridos' 
      }, { status: 400 });
    }
    
    const pool = await connectDB();
    
    // Actualizar el intento de llamada
    const query = `
      UPDATE programaciones_detalle 
      SET 
        intentos_llamada = intentos_llamada + 1,
        sys_fechamod = GETDATE(),
        sys_usrmod = 'n8n_system'
      WHERE id_progdet = @id_progdet
    `;
    
    await pool.request()
      .input('id_progdet', sql.Int, id_progdet)
      .query(query);
    
    return Response.json({
      success: true,
      message: 'Estado actualizado correctamente',
      id_progdet: id_progdet
    });
    
  } catch (err) {
    console.error("❌ Error actualizando estado:", err);
    return Response.json({ 
      error: 'Error actualizando estado', 
      details: err.message 
    }, { status: 500 });
  }
}