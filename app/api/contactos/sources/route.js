import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET(req) {

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Obtiene el parámetro "id"
  
    try {
      const session = await getServerSession();
      if (!session) {
        return Response.json("401 No Autorizado");
      }
      
      const pool = await connectDB();
      const result = await pool.request().query(`SELECT * FROM sources_contactos WHERE id_source = ${id} AND estado_contacto = 1`);
  
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

    const query = `INSERT INTO sources_contactos (
      id_source, id_tipo_doc, numero_doc_contacto,
      nombre_contacto, apellido_1_contacto, apellido_2_contacto, nombre_completo_contacto,
      cargo, email_contacto, celular, telefono, indicativo,
      id_rol, estado_contacto, observaciones,
      sys_usrcrea, sys_usrmod
    ) VALUES (
      @id_source, @id_tipo_doc, @numero_doc_contacto,
      @nombre_contacto, @apellido_1_contacto, @apellido_2_contacto, @nombre_completo_contacto,
      @cargo, @email_contacto, @celular, @telefono, @indicativo,
      @id_rol, @estado_contacto, @observaciones,
      @sys_usrcrea, @sys_usrmod
    )`;
    
    const result = await pool.request()
      .input('id_source', sql.Int, body.id_source)
      .input('id_tipo_doc', sql.Int, body.id_tipo_doc)
      .input('numero_doc_contacto', sql.VarChar, body.numero_doc_contacto)
      .input('nombre_contacto', sql.VarChar, body.nombre_contacto)
      .input('apellido_1_contacto', sql.VarChar, body.apellido_1_contacto)
      .input('apellido_2_contacto', sql.VarChar, body.apellido_2_contacto)
      .input('nombre_completo_contacto', sql.VarChar, body.nombre_contacto+" "+body.apellido_1_contacto+" "+body.apellido_2_contacto)
      .input('cargo', sql.VarChar, body.cargo)
      .input('email_contacto', sql.VarChar, body.email_contacto)
      .input('celular', sql.VarChar, body.celular)
      .input('telefono', sql.VarChar, body.telefono)
      .input('indicativo', sql.VarChar, body.indicativo)
      .input('id_rol', sql.Int, body.id_rol)
      .input('estado_contacto', sql.VarChar, "1")
      .input('observaciones', sql.VarChar, body.observaciones)
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({ message: 'Contacto creado con éxito', id: result.recordset?.insertId || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }
    
    const body = await req.json();
    console.log("Datos recibidos para actualizar:", body);

    if (!body.id_sourcecontac) {
      return Response.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE sources_contactos 
                   SET id_source = @id_source, id_tipo_doc = @id_tipo_doc, numero_doc_contacto = @numero_doc_contacto,
                       nombre_contacto = @nombre_contacto, apellido_1_contacto = @apellido_1_contacto,
                       apellido_2_contacto = @apellido_2_contacto, nombre_completo_contacto = @nombre_completo_contacto,
                       cargo = @cargo, email_contacto = @email_contacto, celular = @celular, telefono = @telefono,
                       indicativo = @indicativo, id_rol = @id_rol, observaciones = @observaciones, sys_usrmod = @sys_usrmod
                   WHERE id_sourcecontac = @id_sourcecontac`;
    
    const result = await pool.request()
                   .input('id_sourcecontac', sql.Int, body.id_sourcecontac)
                   .input('id_source', sql.Int, body.id_source)
                   .input('id_tipo_doc', sql.Int, body.id_tipo_doc)
                   .input('numero_doc_contacto', sql.VarChar, body.numero_doc_contacto)
                   .input('nombre_contacto', sql.VarChar, body.nombre_contacto)
                   .input('apellido_1_contacto', sql.VarChar, body.apellido_1_contacto)
                   .input('apellido_2_contacto', sql.VarChar, body.apellido_2_contacto)
                   .input('nombre_completo_contacto', sql.VarChar, body.nombre_contacto+" "+body.apellido_1_contacto+" "+body.apellido_2_contacto)
                   .input('cargo', sql.VarChar, body.cargo)
                   .input('email_contacto', sql.VarChar, body.email_contacto)
                   .input('celular', body.celular)
                   .input('telefono', body.telefono)
                   .input('indicativo', sql.VarChar, body.indicativo)
                   .input('id_rol', sql.Int, body.id_rol)
                   .input('observaciones', sql.Text, body.observaciones)
                   .input('sys_usrmod', sql.VarChar, session.user.email)
                   .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return Response.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    return Response.json({ message: "Contacto actualizado con éxito" });
  } catch (error) {
    console.error("Error en la API:", error);
    return Response.json({ error: error.message || "Error interno" }, { status: 500 });
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
      return Response.json({ error: "ID es requerido" }, { status: 400 });
  }
  const pool = await connectDB();
  const query = "UPDATE sources_contactos SET estado_contacto = '0', sys_usrmod = @sys_usrmod WHERE id_sourcecontac = @id_sourcecontac";

  const result = await pool.request()
               .input('id_sourcecontac', sql.Int, id)
               .input('sys_usrmod', sql.VarChar, session.user.email)
               .query(query);

  if (result.affectedRows === 0) {
      return Response.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  return Response.json({ message: "Registro eliminado correctamente" });
} catch (error) {
  console.error("Error al eliminar registro:", error);
  return Response.json({ error: "Error interno del servidor" }, { status: 500 });
}
}