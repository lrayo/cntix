import { connectDB, sql } from '@/lib/db';
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

    for (const detalle of body) {
      const result = await transaction.request()
        .input('id_source', sql.Int, detalle.id_source)
        .input('segmento_jer', sql.VarChar, detalle.segmento_jer)
        .input('segmento_cod_segmento', sql.VarChar, detalle.segmento_cod_segmento)
        .input('segmento_mercado_jer', sql.VarChar, detalle.segmento_mercado_jer)
        .input('segmento_mercado_cod_segmento', sql.VarChar, detalle.segmento_mercado_cod_segmento)
        .input('segmento_relacional_jer', sql.VarChar, detalle.segmento_relacional_jer)
        .input('segmento_relacional_cod_segmento', sql.VarChar, detalle.segmento_relacional_cod_segmento)
        .input('id_razon_juridica', sql.Int, detalle.id_razon_juridica)
        .input('id_tipo_doc', sql.Int, detalle.id_tipo_doc)
        .input('numero_doc', sql.VarChar, detalle.numero_doc)
        .input('digito_verifica', sql.Int, detalle.digito_verifica)
        .input('nombre', sql.VarChar, detalle.nombre)
        .input('apellido_1', sql.VarChar, detalle.apellido_1)
        .input('apellido_2', sql.VarChar, detalle.apellido_2)
        .input('nombre_razonsocial', sql.VarChar, detalle.nombre_razonsocial)
        .input('nombre_comercial', sql.VarChar, detalle.nombre_comercial)
        .input('email', sql.VarChar, detalle.email)
        .input('id_clientetipo', sql.Int, detalle.id_clientetipo)
        .input('id_pais', sql.Int, detalle.id_pais)
        .input('pais', sql.VarChar, detalle.pais)
        .input('id_departamento', sql.Int, detalle.id_departamento)
        .input('departamento', sql.VarChar, detalle.departamento)
        .input('id_ciudad', sql.Int, detalle.id_ciudad)
        .input('ciudad', sql.VarChar, detalle.ciudad)
        .input('barrio', sql.VarChar, detalle.barrio)
        .input('direccion_negocio', sql.VarChar, detalle.direccion_negocio)
        .input('ind_telefono1', sql.VarChar, detalle.ind_telefono1)
        .input('telefono1', sql.VarChar, detalle.telefono1)
        .input('ind_telefono2', sql.VarChar, detalle.ind_telefono2)
        .input('telefono2', sql.VarChar, detalle.telefono2)
        .input('sys_usrcrea', sql.VarChar, session.user.email)
        .input('sys_usrmod', sql.VarChar, session.user.email)
        .input('carga_idx', detalle.carga_idx)
        .input('fuentesource', detalle.fuentesource)
        .query(`INSERT INTO empresas_leads (
          id_source, segmento_jer, segmento_cod_segmento, segmento_mercado_jer,
          segmento_mercado_cod_segmento, segmento_relacional_jer, segmento_relacional_cod_segmento,
          id_razon_juridica, id_tipo_doc, numero_doc, digito_verifica, nombre,
          apellido_1, apellido_2, nombre_razonsocial, nombre_comercial, email,
          id_clientetipo, id_pais, pais, id_departamento, departamento,
          id_ciudad, ciudad, barrio, direccion_negocio, fuentesource,
          ind_telefono1, telefono1, ind_telefono2, telefono2, sys_usrcrea , sys_usrmod, carga_idx
        ) VALUES (
          @id_source, @segmento_jer, @segmento_cod_segmento, @segmento_mercado_jer,
          @segmento_mercado_cod_segmento, @segmento_relacional_jer, @segmento_relacional_cod_segmento,
          @id_razon_juridica, @id_tipo_doc, @numero_doc, @digito_verifica, @nombre,
          @apellido_1, @apellido_2, @nombre_razonsocial, @nombre_comercial, @email,
          @id_clientetipo, @id_pais, @pais, @id_departamento, @departamento,
          @id_ciudad, @ciudad, @barrio, @direccion_negocio, @fuentesource,
          @ind_telefono1, @telefono1, @ind_telefono2, @telefono2, @sys_usrcrea , @sys_usrmod, @carga_idx
        )`);

      console.log("Insert ejecutado, filas afectadas:", result.rowsAffected, "Detalle:", detalle);
    }

    await transaction.commit();
    return Response.json({ message: 'Registro creado con éxito' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const pool = await connectDB();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const body = await req.json();
    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    for (const detalle of body) {
      const result = await transaction.request()
        .input('id_empresalead', sql.Int, detalle.id_empresalead)
        .input('efectiva', 1)
        .input('sys_usrmod', sql.VarChar, session.user.email)
        .query(`UPDATE empresas_leads 
                SET efectiva = @efectiva 
                WHERE id_empresalead = @id_empresalead`);

      console.log("Update ejecutado, filas afectadas:", result.rowsAffected, "Detalle:", detalle);
    }

    await transaction.commit();
    return Response.json({ message: 'Registro actualizado con éxito' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return Response.json({ error: error.message }, { status: 500 });
  }
}
