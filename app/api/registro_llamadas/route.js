import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

// ============================
// Helpers
// ============================

async function insertarRegistroLlamada(transaction, body, session) {
  const query = `INSERT INTO registro_llamadas (
      id_empresalead,
      id_usuario,
      id_programacion,
      id_contacto_llamada,
      fecha_llamada_inicio,
      fecha_llamada_fin,
      contactos_creados,
      contesto_sn,
      llamada_efectiva_sn,
      respuesta_llamada,
      tipo_venta,
      motivo_no_venta,
      detalle_no_atractiva,
      detalle_mejores_promociones,
      observaciones,
      numero_llamada,
      respuesta_llamada_estado,
      interesado_sn,
      respuesta_nointeresado,
      sys_usrmod,
      sys_usrcrea
    ) VALUES (
      @id_empresalead,
      @id_usuario,
      @id_programacion,
      @id_contacto_llamada,
      @fecha_llamada_inicio,
      @fecha_llamada_fin,
      @contactos_creados,
      @contesto_sn,
      @llamada_efectiva_sn,
      @respuesta_llamada,
      @tipo_venta,
      @motivo_no_venta,
      @detalle_no_atractiva,
      @detalle_mejores_promociones,
      @observaciones,
      @numero_llamada,
      @respuesta_llamada_estado,
      @interesado_sn,
      @respuesta_nointeresado,
      @sys_usrmod,
      @sys_usrcrea
    )`;

  await transaction.request()
    .input('id_empresalead', sql.Int, body.id_empresalead)
    .input('id_usuario', sql.Int, body.id_usuario)
    .input('id_programacion', sql.Int, body.id_programacion)
    .input('id_contacto_llamada', sql.Int, body.id_contacto_llamada)
    .input('fecha_llamada_inicio', sql.DateTime, body.fecha_llamada_inicio)
    .input('fecha_llamada_fin', sql.DateTime, body.fecha_llamada_fin)
    .input('contactos_creados', JSON.stringify(body.contactos_creados))
    .input('contesto_sn', sql.VarChar, body.contesto_sn)
    .input('llamada_efectiva_sn', sql.VarChar, body.llamada_efectiva_sn)
    .input('respuesta_llamada', sql.VarChar, body.respuesta_llamada)
    .input('tipo_venta', sql.VarChar, body.tipo_venta) 
    .input('motivo_no_venta', sql.VarChar, body.motivo_no_venta) 
    .input('detalle_no_atractiva', sql.VarChar, body.detalle_no_atractiva)
    .input('detalle_mejores_promociones', sql.VarChar, body.detalle_mejores_promociones)
    .input('observaciones', sql.VarChar, body.observaciones)
    .input('numero_llamada', body.numero_llamada)
    .input('respuesta_llamada_estado', sql.VarChar, body.respuesta_llamada_estado)
    .input('interesado_sn', body.interesado_sn)
    .input('respuesta_nointeresado', body.respuesta_nointeresado)
    .input('sys_usrmod', sql.VarChar, session.user.email)
    .input('sys_usrcrea', sql.VarChar, session.user.email)
    .query(query);
}

function calcularEstadoLlamada(body) {
  if (body.contesto_sn === "s") {
    return body.llamada_efectiva_sn === "s" ? "e" : "n";
  }
  return "x";
}

function obtenerFechaSQL(fecha) {
  if (!fecha) return null;
  return new Date(fecha).toISOString().slice(0, 19).replace("T", " ");
}

async function actualizarProgramacion(transaction, body, session, estadoLlamada, fechaSQL) {
  let queryBase = `UPDATE programaciones_detalle 
                  SET estado_llamada = @estado_llamada, 
                      intentos_llamada = intentos_llamada + 1, 
                      sys_usrmod = @sys_usrmod`;
  if (fechaSQL) queryBase += ", fecha_llamada = @fecha_llamada";
  queryBase += " WHERE id_progdet = @id_progdet";

  const request = transaction.request()
    .input("id_progdet", sql.Int, body.id_progdet)
    .input("estado_llamada", sql.VarChar, estadoLlamada)
    .input("sys_usrmod", sql.VarChar, session.user.email);

  if (fechaSQL) {
    request.input("fecha_llamada", fechaSQL);
  }

  await request.query(queryBase);
}

async function guardarRespuestasFormulario(transaction, body, session) {
  if (!body.respuestas_formulario 
      || typeof body.respuestas_formulario !== "object" 
      || Object.keys(body.respuestas_formulario).length === 0) return;

  for (const [id_formulario_campo, respuesta] of Object.entries(body.respuestas_formulario)) {
    const query = `INSERT INTO formularios_respuestas (
        id_formulario, id_formulario_campo, id_empresalead, id_usuario, 
        id_contacto, estado_formres, respuesta, sys_usrcrea, sys_usrmod
      ) VALUES (
        @id_formulario, @id_formulario_campo, @id_empresalead, @id_usuario, 
        @id_contacto, @estado_formres, @respuesta, @sys_usrcrea, @sys_usrmod
      )`;

    await transaction.request()
      .input('id_formulario', sql.Int, body.id_formulario)
      .input('id_formulario_campo', sql.Int, parseInt(id_formulario_campo))
      .input('id_empresalead', sql.Int, body.id_empresalead)
      .input('id_usuario', sql.Int, body.id_usuario)
      .input('id_contacto', sql.Int, body.id_contacto_llamada)
      .input('estado_formres', sql.Bit, 1)
      .input('respuesta', sql.VarChar, respuesta)
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);
  }
}

async function registrarIntegracion(transaction, body, session) {
  const checkQuery = `SELECT COUNT(*) AS count 
                      FROM integraciones 
                      WHERE id_empresalead = @id_empresalead`;

  const checkResult = await transaction.request()
    .input('id_empresalead', sql.Int, body.id_empresalead)
    .query(checkQuery);

  if (checkResult.recordset[0].count === 0) {
    const query = `INSERT INTO integraciones (
        id_empresalead, id_usuario, id_programacion, id_contacto_llamada, 
        numero_llamada, integracion_estado, sys_usrcrea, sys_usrmod
      ) VALUES (
        @id_empresalead, @id_usuario, @id_programacion, @id_contacto_llamada, 
        @numero_llamada, @integracion_estado, @sys_usrcrea, @sys_usrmod
      )`;

    await transaction.request()
      .input('id_empresalead', sql.Int, body.id_empresalead)
      .input('id_usuario', sql.Int, body.id_usuario)
      .input('id_programacion', sql.Int, body.id_programacion)
      .input('id_contacto_llamada', sql.Int, body.id_contacto_llamada)
      .input('numero_llamada', body.numero_llamada)
      .input('integracion_estado', sql.Bit, 0) // 0 no enviado - 1 enviado
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);
  }
}

// ============================
// Endpoint principal
// ============================

export async function POST(req) {
  const body = await req.json();
  const pool = await connectDB();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const session = await getServerSession();
    if (!session) return Response.json("401 No Autorizado");

    // Paso 1: insertar registro
    await insertarRegistroLlamada(transaction, body, session);

    // Paso 2: calcular estado y fecha
    const estadoLlamada = calcularEstadoLlamada(body);
    const fechaSQL = obtenerFechaSQL(body.nueva_fecha_llamada);

    // Paso 3: actualizar programación
    await actualizarProgramacion(transaction, body, session, estadoLlamada, fechaSQL);

    // Paso 4: guardar respuestas formulario
    await guardarRespuestasFormulario(transaction, body, session);

    // Paso 5: registrar integración si aplica
    if (estadoLlamada === "e") {
      await registrarIntegracion(transaction, body, session);
    }

    await transaction.commit();
    return Response.json({ message: 'Registro insertado con éxito' });

  } catch (error) {
    if (transaction) await transaction.rollback();
    return Response.json({ error: error.message }, { status: 500 });
  }
}
