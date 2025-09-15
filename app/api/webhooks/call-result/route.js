// app/api/webhooks/call-result/route.js
import { connectDB, sql } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      id_progdet,
      id_empresalead, 
      resultado_llamada,
      cliente_interesado,
      transcripcion_llamada,
      duracion_llamada,
      telefono_usado,
      api_key,
      datos_elevenlabs
    } = body;
    
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
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      // 1. Actualizar estado en programaciones_detalle
      let nuevoEstado = 'x'; // Por defecto no contactado
      
      switch (resultado_llamada) {
        case 'contestó':
          nuevoEstado = cliente_interesado === true ? 'e' : 'n'; // efectiva o no efectiva
          break;
        case 'no_contesta':
        case 'buzón':
        case 'ocupado':
          nuevoEstado = 'x'; // no contactado
          break;
        case 'número_errado':
          nuevoEstado = 'x';
          break;
      }
      
      await transaction.request()
        .input('id_progdet', sql.Int, id_progdet)
        .input('estado_llamada', sql.VarChar, nuevoEstado)
        .query(`
          UPDATE programaciones_detalle 
          SET 
            estado_llamada = @estado_llamada,
            intentos_llamada = intentos_llamada + 1,
            sys_fechamod = GETDATE(),
            sys_usrmod = 'n8n_webhook'
          WHERE id_progdet = @id_progdet
        `);
      
      // 2. Crear registro en la tabla de llamadas (si existe)
      if (resultado_llamada === 'contestó') {
        const registroLlamada = {
          id_empresalead: id_empresalead,
          id_usuario: 0, // Sistema automático
          id_programacion: null, // Se obtiene del progdet
          id_contacto_llamada: 0, // No hay contacto específico aún
          fecha_llamada_inicio: new Date(),
          fecha_llamada_fin: new Date(Date.now() + (duracion_llamada || 0) * 1000),
          contactos_creados: [],
          contesto_sn: 's',
          llamada_efectiva_sn: cliente_interesado ? 's' : 'n',
          respuesta_llamada: cliente_interesado ? 'ContactoEfectivo' : 'NoInteresado',
          tipo_venta: null,
          motivo_no_venta: cliente_interesado ? null : 'NoInteresado',
          observaciones: `Llamada automática vía ElevenLabs - María AI. Transcripción: ${transcripcion_llamada || 'No disponible'}`,
          numero_llamada: telefono_usado,
          respuesta_llamada_estado: cliente_interesado ? 'e' : 'n',
          interesado_sn: cliente_interesado,
          sys_usrcrea: 'n8n_webhook',
          sys_usrmod: 'n8n_webhook'
        };
        
        // Obtener id_programacion del progdet
        const progResult = await transaction.request()
          .input('id_progdet', sql.Int, id_progdet)
          .query('SELECT id_programacion FROM programaciones_detalle WHERE id_progdet = @id_progdet');
        
        if (progResult.recordset.length > 0) {
          registroLlamada.id_programacion = progResult.recordset[0].id_programacion;
        }
        
        await transaction.request()
          .input('id_empresalead', sql.Int, registroLlamada.id_empresalead)
          .input('id_usuario', sql.Int, registroLlamada.id_usuario)
          .input('id_programacion', sql.Int, registroLlamada.id_programacion)
          .input('id_contacto_llamada', sql.Int, registroLlamada.id_contacto_llamada)
          .input('fecha_llamada_inicio', sql.DateTime, registroLlamada.fecha_llamada_inicio)
          .input('fecha_llamada_fin', sql.DateTime, registroLlamada.fecha_llamada_fin)
          .input('contactos_creados', sql.NVarChar, JSON.stringify(registroLlamada.contactos_creados))
          .input('contesto_sn', sql.VarChar, registroLlamada.contesto_sn)
          .input('llamada_efectiva_sn', sql.VarChar, registroLlamada.llamada_efectiva_sn)
          .input('respuesta_llamada', sql.VarChar, registroLlamada.respuesta_llamada)
          .input('observaciones', sql.NVarChar, registroLlamada.observaciones)
          .input('numero_llamada', sql.VarChar, registroLlamada.numero_llamada)
          .input('respuesta_llamada_estado', sql.VarChar, registroLlamada.respuesta_llamada_estado)
          .input('interesado_sn', sql.Bit, registroLlamada.interesado_sn)
          .input('sys_usrcrea', sql.VarChar, registroLlamada.sys_usrcrea)
          .input('sys_usrmod', sql.VarChar, registroLlamada.sys_usrmod)
          .query(`
            INSERT INTO registro_llamadas (
              id_empresalead, id_usuario, id_programacion, id_contacto_llamada,
              fecha_llamada_inicio, fecha_llamada_fin, contactos_creados,
              contesto_sn, llamada_efectiva_sn, respuesta_llamada,
              observaciones, numero_llamada, respuesta_llamada_estado,
              interesado_sn, sys_usrcrea, sys_usrmod
            ) VALUES (
              @id_empresalead, @id_usuario, @id_programacion, @id_contacto_llamada,
              @fecha_llamada_inicio, @fecha_llamada_fin, @contactos_creados,
              @contesto_sn, @llamada_efectiva_sn, @respuesta_llamada,
              @observaciones, @numero_llamada, @respuesta_llamada_estado,
              @interesado_sn, @sys_usrcrea, @sys_usrmod
            )
          `);
      }
      
      // 3. Si el cliente está interesado, preparar para transferencia
      let transferencia_info = null;
      if (cliente_interesado === true) {
        // Crear registro en tabla de transferencias (si existe) o usar una cola
        transferencia_info = {
          id_progdet: id_progdet,
          id_empresalead: id_empresalead,
          tipificador_url: `${process.env.NEXTAUTH_URL}/tipificadorMasivo?progdet=${id_progdet}&auto=1&transferencia=1`,
          timestamp: new Date().toISOString(),
          estado: 'pendiente_agente'
        };
        
        // Aquí podrías insertar en una tabla de cola de transferencias
        // o enviar una notificación en tiempo real a los agentes
      }
      
      await transaction.commit();
      
      return Response.json({
        success: true,
        message: 'Resultado de llamada procesado correctamente',
        data: {
          id_progdet: id_progdet,
          nuevo_estado: nuevoEstado,
          cliente_interesado: cliente_interesado,
          transferencia_requerida: cliente_interesado === true,
          transferencia_info: transferencia_info
        }
      });
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (err) {
    console.error("❌ Error en webhook call-result:", err);
    return Response.json({ 
      error: 'Error procesando resultado de llamada', 
      details: err.message 
    }, { status: 500 });
  }
}

// Método GET para consultar estado de transferencias pendientes
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const api_key = searchParams.get("api_key");
    
    if (!api_key || api_key !== process.env.N8N_API_KEY) {
      return Response.json({ error: 'API Key inválida' }, { status: 401 });
    }
    
    const pool = await connectDB();
    
    // Obtener llamadas que requieren transferencia (efectivas recientes)
    const result = await pool.request().query(`
      SELECT 
        rl.id_regllamada,
        rl.id_empresalead,
        rl.id_programacion,
        rl.fecha_llamada_inicio,
        rl.observaciones,
        el.nombre_comercial,
        el.telefono1,
        el.telefono2,
        pd.id_progdet
      FROM registro_llamadas rl
      INNER JOIN empresas_leads el ON rl.id_empresalead = el.id_empresalead
      INNER JOIN programaciones_detalle pd ON rl.id_empresalead = pd.id_empresalead 
        AND rl.id_programacion = pd.id_programacion
      WHERE rl.llamada_efectiva_sn = 's'
        AND rl.interesado_sn = 1
        AND rl.sys_usrcrea = 'n8n_webhook'
        AND rl.fecha_llamada_inicio >= DATEADD(hour, -1, GETDATE())  -- Últimas 1 hora
      ORDER BY rl.fecha_llamada_inicio DESC
    `);
    
    const transferencias = result.recordset.map(item => ({
      id_regllamada: item.id_regllamada,
      id_progdet: item.id_progdet,
      cliente: item.nombre_comercial,
      telefono: item.telefono1 || item.telefono2,
      fecha_llamada: item.fecha_llamada_inicio,
      tipificador_url: `${process.env.NEXTAUTH_URL}/tipificadorMasivo?progdet=${item.id_progdet}&auto=1&transferencia=1`
    }));
    
    return Response.json({
      success: true,
      transferencias_pendientes: transferencias.length,
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