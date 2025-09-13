import { connectDB, sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM sources WHERE estado_source = 1');

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

    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    const query = `INSERT INTO sources (
      id_tipo_doc, id_fuente_consolida, id_tipofuente, id_segmento, numero_doc, dv, 
      nombre_razonsocial, nombre_comercial, direccion, id_ciudad, ciudad, 
      zip_code, email, indicativo_tel, telefono, celular, facturacion, 
      proyeccion_recurrente, estado_source, creado_por, mod_por
    ) VALUES (
      @id_tipo_doc, @id_fuente_consolida, @id_tipofuente, @id_segmento, @numero_doc, @dv, 
      @nombre_razonsocial, @nombre_comercial, @direccion, @id_ciudad, @ciudad, 
      @zip_code, @email, @indicativo_tel, @telefono, @celular, @facturacion, 
      @proyeccion_recurrente, @estado_source, @creado_por, @mod_por
    )`;
    console.log(body)
    const result = await pool.request()
      .input('id_tipo_doc', sql.Int, body.id_tipo_doc)
      .input('id_fuente_consolida', sql.Int, body.id_fuente_consolida)
      .input('id_tipofuente', sql.Int, body.id_tipofuente)
      .input('id_segmento', sql.Int, body.id_segmento)
      .input('numero_doc', sql.VarChar, body.numero_doc)
      .input('dv', sql.Int, body.dv)
      .input('nombre_razonsocial', sql.VarChar, body.nombre_razonsocial)
      .input('nombre_comercial', sql.VarChar, body.nombre_comercial)
      .input('direccion', sql.VarChar, body.direccion_negocio)
      .input('id_ciudad', sql.Int, body.id_ciudad)
      .input('ciudad', sql.VarChar, body.ciudad)
      .input('zip_code', sql.VarChar, body.zip_code)
      .input('email', sql.VarChar, body.email)
      .input('indicativo_tel', sql.VarChar, body.indicativo_tel)
      .input('telefono', sql.VarChar, body.telefono)
      .input('celular', sql.VarChar, body.celular)
      .input('facturacion', sql.Float, body.facturacion)
      .input('proyeccion_recurrente', sql.Float, body.proyeccion_recurrente)
      .input('estado_source', sql.Bit, 1)
      .input('creado_por', sql.VarChar, session.user.email)
      .input('mod_por', sql.VarChar, session.user.email)
      .query(query);

    return NextResponse.json({ message: 'Registro insertado con éxito', id: result.recordset?.insertId || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }
    
    const body = await req.json();

    if (!body.id_source) {
      return NextResponse.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE sources 
                   SET id_tipo_doc = @id_tipo_doc, id_fuente_consolida = @id_fuente_consolida, id_tipofuente = @id_tipofuente, 
                       id_segmento = @id_segmento, numero_doc = @numero_doc, dv = @dv, nombre_razonsocial = @nombre_razonsocial, 
                       nombre_comercial = @nombre_comercial, direccion = @direccion, id_ciudad = @id_ciudad, ciudad = @ciudad, 
                       zip_code = @zip_code, email = @email, indicativo_tel = @indicativo_tel, telefono = @telefono, celular = @celular, 
                       facturacion = @facturacion, proyeccion_recurrente = @proyeccion_recurrente, mod_por = @mod_por
                   WHERE id_source = @id_source`;
    
    const result = await pool.request()
      .input('id_source', sql.Int, body.id_source)
      .input('id_tipo_doc', sql.Int, body.tipo_doc)
      .input('id_fuente_consolida', sql.Int, body.id_fuente_consolida)
      .input('id_tipofuente', sql.Int, body.id_tipofuente)
      .input('id_segmento', sql.Int, body.id_segmento)
      .input('numero_doc', sql.Int, body.numero_doc)
      .input('dv', sql.Int, body.dv)
      .input('nombre_razonsocial', sql.VarChar, body.nombre_razonsocial)
      .input('nombre_comercial', sql.VarChar, body.nombre_comercial)
      .input('direccion', sql.VarChar, body.direccion)
      .input('id_ciudad', sql.Int, body.id_ciudad)
      .input('ciudad', sql.VarChar, body.ciudad)
      .input('zip_code', sql.Int, body.zip_code)
      .input('email', sql.VarChar, body.email)
      .input('indicativo_tel', sql.VarChar, body.indicativo_tel)
      .input('telefono', sql.Int, body.telefono)
      .input('celular', body.celular)
      .input('facturacion', sql.Float, body.facturacion)
      .input('proyeccion_recurrente', sql.Float, body.proyeccion_recurrente)
      .input('mod_por', sql.VarChar, session.user.email)
      .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Registro actualizado con éxito" });
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
      const query = "UPDATE sources SET estado_source = '0', mod_por = @mod_por WHERE id_source = @id_source";

      const result = await pool.request()
                   .input('id_source', sql.Int, id)
                   .input('mod_por', sql.VarChar, session.user.email)
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