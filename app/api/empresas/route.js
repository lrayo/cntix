import { connectDB, sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function GET() {
  try {

    const session = await getServerSession()
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM empresas_leads WHERE estado_empresas_leads = 1');

    return Response.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en la API:", err);
    return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  
  try {
    const body = await req.json();
    const pool = await connectDB();

    const session = await getServerSession()
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    const query = `INSERT INTO empresas_leads (
      id_source, segmento_jer, segmento_cod_segmento, segmento_mercado_jer,
      segmento_mercado_cod_segmento, segmento_relacional_jer, segmento_relacional_cod_segmento,
      id_razon_juridica, id_tipo_doc, numero_doc, digito_verifica, nombre,
      apellido_1, apellido_2, nombre_razonsocial, nombre_comercial, email,
      id_clientetipo, id_pais, pais, id_departamento, departamento,
      id_ciudad, id_sector, ciudad, barrio, direccion_negocio, fuentesource,
      ind_telefono1, telefono1, ind_telefono2, telefono2, sys_usrcrea, sys_usrmod, efectiva
    ) VALUES (
      @id_source, @segmento_jer, @segmento_cod_segmento, @segmento_mercado_jer,
      @segmento_mercado_cod_segmento, @segmento_relacional_jer, @segmento_relacional_cod_segmento,
      @id_razon_juridica, @id_tipo_doc, @numero_doc, @digito_verifica, @nombre,
      @apellido_1, @apellido_2, @nombre_razonsocial, @nombre_comercial, @email,
      @id_clientetipo, @id_pais, @pais, @id_departamento, @departamento,
      @id_ciudad, @id_sector, @ciudad, @barrio, @direccion_negocio, @fuentesource,
      @ind_telefono1, @telefono1, @ind_telefono2, @telefono2, @sys_usrcrea , @sys_usrmod, @efectiva
    )`;
    
    const result = await pool.request()
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
      .query(query);

    return NextResponse.json({ message: 'Empresa insertada con éxito', id: result.recordset?.insertId || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    
    const session = await getServerSession()
    if (!session) {
      return Response.json("401 No Autorizado");
    }
    
    const body = await req.json();
    console.log("Datos recibidos para actualizar:", body);

    if (!body.id_empresalead) {
      return NextResponse.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE empresas_leads 
                   SET id_source = @id_source, segmento_jer = @segmento_jer, segmento_cod_segmento = @segmento_cod_segmento,
                       segmento_mercado_jer = @segmento_mercado_jer, segmento_mercado_cod_segmento = @segmento_mercado_cod_segmento,
                       segmento_relacional_jer = @segmento_relacional_jer, segmento_relacional_cod_segmento = @segmento_relacional_cod_segmento,
                       id_razon_juridica = @id_razon_juridica, id_tipo_doc = @id_tipo_doc, numero_doc = @numero_doc,
                       digito_verifica = @digito_verifica, nombre = @nombre, apellido_1 = @apellido_1, apellido_2 = @apellido_2,
                       nombre_razonsocial = @nombre_razonsocial, nombre_comercial = @nombre_comercial, email = @email,
                       id_clientetipo = @id_clientetipo, id_pais = @id_pais, pais = @pais, id_departamento = @id_departamento,
                       departamento = @departamento, id_ciudad = @id_ciudad, id_sector = @id_sector, ciudad = @ciudad, barrio = @barrio,
                       direccion_negocio = @direccion_negocio, ind_telefono1 = @ind_telefono1, telefono1 = @telefono1, sys_usrmod = @sys_usrmod,
                       ind_telefono2 = @ind_telefono2, telefono2 = @telefono2, fuentesource = @fuentesource
                   WHERE id_empresalead = @id_empresalead`;
    
     const result = await pool.request()
                   .input('id_empresalead', sql.Int, body.id_empresalead)
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
                   .input('ind_telefono1', sql.VarChar, body.ind_telefono1 ? String(body.ind_telefono1) : null)
                   .input('telefono1', sql.VarChar, body.telefono1 ? String(body.telefono1) : null)
                   .input('ind_telefono2', sql.VarChar, body.ind_telefono2 ? String(body.ind_telefono2) : null)
                   .input('telefono2', sql.VarChar, body.telefono2 ? String(body.telefono2) : null)
                   .input('sys_usrmod', sql.VarChar, session.user.email)
                   .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Empresa actualizada con éxito" });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
      const session = await getServerSession()
      if (!session) {
        return Response.json("401 No Autorizado");
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
   
      if (!id) {
          return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
      }
      const pool = await connectDB();
      const query = "UPDATE empresas_leads SET estado_empresas_leads = '0', sys_usrmod = @sys_usrmod WHERE id_empresalead = @id_empresalead";

      const result = await pool.request()
                   .input('id_empresalead', sql.Int, id)
                   .input('sys_usrmod', sql.VarChar, session.user.email)
                   .query(query);

      if (result.affectedRows === 0) {
          return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
      }

      return NextResponse.json({ message: "Registro eliminado correctamente" });
  } catch (error) {
      console.error("Error al eliminar registro:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}