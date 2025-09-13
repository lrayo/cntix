import { connectDB, sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function POST(req) {
  const pool = await connectDB();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const body = await req.json();
    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    // Declarar tabla temporal para capturar el ID insertado
    await transaction.request().query(`
      DECLARE @InsertedIds TABLE (id_empresalead INT);
    `);

    // Inserta la empresa y guarda el ID en la tabla temporal
    const insertEmpresaResult = await transaction.request()
  .input('id_source', sql.Int, body.id_source)
  .input('segmento_jer', sql.VarChar, body.segmento_jer)
  .input('segmento_cod_segmento', sql.VarChar, body.segmento_cod_segmento)
  .input('segmento_mercado_jer', sql.VarChar, body.segmento_mercado_jer)
  .input('segmento_mercado_cod_segmento', sql.VarChar, body.segmento_mercado_cod_segmento)
  .input('segmento_relacional_jer', sql.VarChar, body.segmento_relacional_jer)
  .input('segmento_relacional_cod_segmento', sql.VarChar, body.segmento_relacional_cod_segmento)
  .input('id_razon_juridica', sql.Int, body.id_razon_juridica)
  .input('id_tipo_doc', sql.Int, body.id_tipo_doc)
  .input('numero_doc', sql.VarChar, body.numero_doc)
  .input('digito_verifica', sql.Int, body.digito_verifica)
  .input('nombre', sql.VarChar, body.nombre)
  .input('apellido_1', sql.VarChar, body.apellido_1)
  .input('apellido_2', sql.VarChar, body.apellido_2)
  .input('nombre_razonsocial', sql.VarChar, body.nombre_razonsocial)
  .input('nombre_comercial', sql.VarChar, body.nombre_comercial)
  .input('email', sql.VarChar, body.email)
  .input('id_clientetipo', sql.Int, body.id_clientetipo)
  .input('id_pais', sql.Int, body.id_pais)
  .input('pais', sql.VarChar, body.pais)
  .input('id_departamento', sql.Int, body.id_departamento)
  .input('departamento', sql.VarChar, body.departamento)
  .input('id_ciudad', sql.Int, body.id_ciudad)
  .input('id_sector', sql.Int, body.id_sector)
  .input('ciudad', sql.VarChar, body.ciudad)
  .input('barrio', sql.VarChar, body.barrio)
  .input('direccion_negocio', sql.VarChar, body.direccion_negocio)
  .input('fuentesource', sql.VarChar, body.fuentesource)
  .input('ind_telefono1', sql.VarChar, body.ind_telefono1)
  .input('telefono1', sql.VarChar, body.telefono1)
  .input('ind_telefono2', sql.VarChar, body.ind_telefono2)
  .input('telefono2', sql.VarChar, body.telefono2)
  .input('sys_usrcrea', sql.VarChar, session.user.email)
  .input('sys_usrmod', sql.VarChar, session.user.email)
  .input('efectiva', 0)
  .query(`
    DECLARE @InsertedIds TABLE (id_empresalead INT);

    INSERT INTO empresas_leads (
      id_source, segmento_jer, segmento_cod_segmento, segmento_mercado_jer,
      segmento_mercado_cod_segmento, segmento_relacional_jer, segmento_relacional_cod_segmento,
      id_razon_juridica, id_tipo_doc, numero_doc, digito_verifica, nombre,
      apellido_1, apellido_2, nombre_razonsocial, nombre_comercial, email,
      id_clientetipo, id_pais, pais, id_departamento, departamento,
      id_ciudad, id_sector, ciudad, barrio, direccion_negocio, fuentesource,
      ind_telefono1, telefono1, ind_telefono2, telefono2, sys_usrcrea , sys_usrmod, efectiva
    )
    OUTPUT INSERTED.id_empresalead INTO @InsertedIds
    VALUES (
      @id_source, @segmento_jer, @segmento_cod_segmento, @segmento_mercado_jer,
      @segmento_mercado_cod_segmento, @segmento_relacional_jer, @segmento_relacional_cod_segmento,
      @id_razon_juridica, @id_tipo_doc, @numero_doc, @digito_verifica, @nombre,
      @apellido_1, @apellido_2, @nombre_razonsocial, @nombre_comercial, @email,
      @id_clientetipo, @id_pais, @pais, @id_departamento, @departamento,
      @id_ciudad, @id_sector, @ciudad, @barrio, @direccion_negocio, @fuentesource,
      @ind_telefono1, @telefono1, @ind_telefono2, @telefono2, @sys_usrcrea , @sys_usrmod, @efectiva
    );

    SELECT id_empresalead FROM @InsertedIds;
  `);

const idEmpresalead = insertEmpresaResult.recordset[0].id_empresalead;

    // Inserta en la tabla relacionada usando el ID insertado
    await transaction.request()
      .input('id_programacion', sql.Int, 12)
      .input('id_empresalead', sql.Int, idEmpresalead)
      .input('id_usuario', sql.Int, body.id_usuario)
      .input('estado_prog_detalle', sql.Bit, 1)
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .input('fecha_llamada', sql.DateTime, body.fecha_llamada)
      .input('estado_llamada', sql.VarChar, "p")
      .input('intentos_llamada', sql.Int, 0)
      .query(`
        INSERT INTO programaciones_detalle (
          id_programacion, id_empresalead, id_usuario, estado_prog_detalle, sys_usrcrea, sys_usrmod,
          fecha_llamada, estado_llamada, intentos_llamada
        )
        VALUES (
          @id_programacion, @id_empresalead, @id_usuario, @estado_prog_detalle, @sys_usrcrea, @sys_usrmod,
          @fecha_llamada, @estado_llamada, @intentos_llamada
        )
      `);

    await transaction.commit();

    return NextResponse.json({ message: 'Empresa insertada con éxito', id: idEmpresalead });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return Response.json({ error: error.message }, { status: 500 });
  }
}
