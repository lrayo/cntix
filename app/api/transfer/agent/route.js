// app/api/transfer/agent/route.js
import { connectDB, sql } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      id_progdet,
      id_empresalead,
      agente_id, // ID del agente disponible (opcional)
      prioridad = 'alta', // alta, media, baja
      api_key,
      datos_llamada_ia
    } = body;
    
    // Validación básica de API Key
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    if (!id_progdet || !id_empresalead) {
      return Response.json({ 
        error: 'id_progdet e id_empresalead son requeridos' 
      }, { status: 400 });
    }
    
    const pool = await connectDB();
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      // 1. Obtener información completa del lead
      const leadInfo = await transaction.request()
        .input('id_progdet', sql.Int, id_progdet)
        .input('id_empresalead', sql.Int, id_empresalead)
        .query(`
          SELECT 
            pd.id_progdet,
            pd.id_programacion,
            pd.id_empresalead,
            pd.id_usuario as agente_actual,
            el.numero_doc,
            el.nombre_comercial,
            el.nombre_razonsocial,
            el.telefono1,
            el.telefono2,
            el.email,
            el.direccion_negocio,
            el.ciudad,
            el.departamento,
            u.nombre as nombre_agente_actual,
            u.email as email_agente_actual,
            p.nombre as nombre_programacion
          FROM programaciones_detalle pd
          INNER JOIN empresas_leads el ON pd.id_empresalead = el.id_empresalead
          LEFT JOIN usuarios u ON pd.id_usuario = u.id_usuario
          LEFT JOIN programaciones p ON pd.id_programacion = p.id_programacion
          WHERE pd.id_progdet = @id_progdet 
            AND el.id_empresalead = @id_empresalead
        `);
      
      if (leadInfo.recordset.length === 0) {
        throw new Error('Lead no encontrado');
      }
      
      const lead = leadInfo.recordset[0];
      
      // 2. Buscar agente disponible si no se especificó uno
      let agenteAsignado = agente_id;
      
      if (!agenteAsignado) {
        // Buscar agentes disponibles (que tengan rol de agente y estén activos)
        const agentesDisponibles = await transaction.request()
          .input('id_programacion', sql.Int, lead.id_programacion)
          .query(`
            SELECT DISTINCT 
              u.id_usuario,
              u.nombre,
              u.email,
              COUNT(pd2.id_progdet) as llamadas_pendientes
            FROM usuarios u
            INNER JOIN programaciones_detalle pd2 ON u.id_usuario = pd2.id_usuario
            WHERE u.estado_usuario = 1 
              AND u.id_rol IN (3, 4)  -- Roles de agente (ajustar según tu sistema)
              AND pd2.id_programacion = @id_programacion
              AND pd2.estado_llamada IN ('p', 'x')  -- Solo pendientes o no contactados
            GROUP BY u.id_usuario, u.nombre, u.email
            ORDER BY llamadas_pendientes ASC  -- El que tenga menos carga
          `);
        
        if (agentesDisponibles.recordset.length > 0) {
          agenteAsignado = agentesDisponibles.recordset[0].id_usuario;
        } else {
          // Si no hay agentes, usar el agente actual del lead
          agenteAsignado = lead.agente_actual;
        }
      }
      
      // 3. Crear registro de transferencia
      const transferId = `TRF_${Date.now()}_${id_progdet}`;
      
      await transaction.request()
        .input('id_transferencia', sql.VarChar, transferId)
        .input('id_progdet', sql.Int, id_progdet)
        .input('id_empresalead', sql.Int, id_empresalead)
        .input('id_agente_origen', sql.Int, 0) // Sistema/IA
        .input('id_agente_destino', sql.Int, agenteAsignado)
        .input('estado_transferencia', sql.VarChar, 'pendiente')
        .input('prioridad', sql.VarChar, prioridad)
        .input('datos_llamada_ia', sql.NVarChar, JSON.stringify(datos_llamada_ia || {}))
        .input('sys_usrcrea', sql.VarChar, 'n8n_transfer')
        .query(`
          INSERT INTO transferencias_agente (
            id_transferencia, id_progdet, id_empresalead, 
            id_agente_origen, id_agente_destino, estado_transferencia,
            prioridad, datos_llamada_ia, fecha_transferencia, sys_usrcrea
          ) VALUES (
            @id_transferencia, @id_progdet, @id_empresalead,
            @id_agente_origen, @id_agente_destino, @estado_transferencia,
            @prioridad, @datos_llamada_ia, GETDATE(), @sys_usrcrea
          )
        `);
      
      // 4. Generar URL del tipificador con parámetros
      const tipificadorParams = new URLSearchParams({
        progdet: id_progdet,
        auto: '1',
        transferencia: '1',
        transfer_id: transferId,
        prioridad: prioridad
      });
      
      const tipificadorUrl = `${process.env.NEXTAUTH_URL}/tipificadorMasivo?${tipificadorParams.toString()}`;
      
      // 5. Actualizar el progdet con nueva información si es necesario
      await transaction.request()
        .input('id_progdet', sql.Int, id_progdet)
        .input('sys_usrmod', sql.VarChar, 'n8n_transfer')
        .query(`
          UPDATE programaciones_detalle 
          SET 
            sys_fechamod = GETDATE(),
            sys_usrmod = @sys_usrmod
          WHERE id_progdet = @id_progdet
        `);
      
      await transaction.commit();
      
      // 6. Preparar respuesta con toda la información
      const response = {
        success: true,
        transferencia: {
          id_transferencia: transferId,
          id_progdet: id_progdet,
          tipificador_url: tipificadorUrl,
          prioridad: prioridad,
          estado: 'pendiente'
        },
        cliente: {
          id_empresalead: id_empresalead,
          numero_doc: lead.numero_doc,
          nombre: lead.nombre_comercial || lead.nombre_razonsocial,
          telefono1: lead.telefono1,
          telefono2: lead.telefono2,
          email: lead.email,
          direccion: lead.direccion_negocio,
          ciudad: lead.ciudad,
          departamento: lead.departamento
        },
        agente: {
          id_usuario: agenteAsignado,
          notificacion_requerida: true
        },
        campana: {
          id_programacion: lead.id_programacion,
          nombre: lead.nombre_programacion
        },
        timestamp: new Date().toISOString()
      };
      
      return Response.json(response);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (err) {
    console.error("❌ Error en transferencia a agente:", err);
    return Response.json({ 
      error: 'Error procesando transferencia', 
      details: err.message 
    }, { status: 500 });
  }
}

// Método GET para consultar transferencias pendientes
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const agente_id = searchParams.get("agente_id");
    const api_key = searchParams.get("api_key");
    
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    const pool = await connectDB();
    
    let query = `
      SELECT 
        ta.id_transferencia,
        ta.id_progdet,
        ta.id_empresalead,
        ta.id_agente_destino,
        ta.estado_transferencia,
        ta.prioridad,
        ta.fecha_transferencia,
        ta.datos_llamada_ia,
        el.nombre_comercial,
        el.numero_doc,
        el.telefono1,
        el.telefono2,
        u.nombre as nombre_agente,
        u.email as email_agente,
        p.nombre as nombre_programacion
      FROM transferencias_agente ta
      INNER JOIN empresas_leads el ON ta.id_empresalead = el.id_empresalead
      INNER JOIN usuarios u ON ta.id_agente_destino = u.id_usuario
      INNER JOIN programaciones_detalle pd ON ta.id_progdet = pd.id_progdet
      INNER JOIN programaciones p ON pd.id_programacion = p.id_programacion
      WHERE ta.estado_transferencia = 'pendiente'
    `;
    
    const request = pool.request();
    
    if (agente_id) {
      query += ` AND ta.id_agente_destino = @agente_id`;
      request.input('agente_id', sql.Int, parseInt(agente_id));
    }
    
    query += ` ORDER BY ta.prioridad DESC, ta.fecha_transferencia ASC`;
    
    const result = await request.query(query);
    
    const transferencias = result.recordset.map(item => ({
      id_transferencia: item.id_transferencia,
      id_progdet: item.id_progdet,
      cliente: {
        nombre: item.nombre_comercial,
        documento: item.numero_doc,
        telefono1: item.telefono1,
        telefono2: item.telefono2
      },
      agente: {
        id: item.id_agente_destino,
        nombre: item.nombre_agente,
        email: item.email_agente
      },
      campana: item.nombre_programacion,
      prioridad: item.prioridad,
      fecha_transferencia: item.fecha_transferencia,
      datos_ia: JSON.parse(item.datos_llamada_ia || '{}'),
      tipificador_url: `${process.env.NEXTAUTH_URL}/tipificadorMasivo?progdet=${item.id_progdet}&auto=1&transferencia=1&transfer_id=${item.id_transferencia}`
    }));
    
    return Response.json({
      success: true,
      total_transferencias: transferencias.length,
      transferencias: transferencias
    });
    
  } catch (err) {
    console.error("❌ Error obteniendo transferencias:", err);
    return Response.json({ 
      error: 'Error obteniendo transferencias', 
      details: err.message 
    }, { status: 500 });
  }
}

// Método PUT para actualizar estado de transferencia
export async function PUT(req) {
  try {
    const body = await req.json();
    const { 
      id_transferencia,
      nuevo_estado, // 'aceptada', 'completada', 'rechazada'
      agente_id,
      observaciones,
      api_key
    } = body;
    
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    if (!id_transferencia || !nuevo_estado) {
      return Response.json({ 
        error: 'id_transferencia y nuevo_estado son requeridos' 
      }, { status: 400 });
    }
    
    const pool = await connectDB();
    
    await pool.request()
      .input('id_transferencia', sql.VarChar, id_transferencia)
      .input('nuevo_estado', sql.VarChar, nuevo_estado)
      .input('agente_id', sql.Int, agente_id || null)
      .input('observaciones', sql.NVarChar, observaciones || null)
      .query(`
        UPDATE transferencias_agente 
        SET 
          estado_transferencia = @nuevo_estado,
          fecha_actualizacion = GETDATE(),
          observaciones = @observaciones,
          id_agente_actual = @agente_id
        WHERE id_transferencia = @id_transferencia
      `);
    
    return Response.json({
      success: true,
      message: 'Estado de transferencia actualizado',
      id_transferencia: id_transferencia,
      nuevo_estado: nuevo_estado
    });
    
  } catch (err) {
    console.error("❌ Error actualizando transferencia:", err);
    return Response.json({ 
      error: 'Error actualizando transferencia', 
      details: err.message 
    }, { status: 500 });
  }
}