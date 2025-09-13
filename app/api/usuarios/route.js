import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query('SELECT usu.*, ca.nombre as nombre_campana FROM usuarios usu LEFT JOIN campanas ca ON ca.id_campana = usu.id_campana WHERE usu.estado = 1');
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

    const query = `INSERT INTO usuarios (
     email, id_rol, nombre, estado, ext, id_campana, sys_usrcrea, sys_usrmod
    ) VALUES (
      @email, @id_rol, @nombre, @estado, @ext, @id_campana, @sys_usrcrea, @sys_usrmod
    )`;
    
    const result = await pool.request()
      .input('email', sql.VarChar, body.email)
      .input('id_rol', sql.VarChar, body.id_rol)
      .input('nombre', sql.VarChar, body.nombre)
      .input('estado', sql.VarChar, "1")
      .input('ext', sql.Int, body.ext)
      .input('id_campana', sql.Int, body.id_campana)
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({ message: 'Usuario creado con éxito', id: result.recordset?.insertId || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
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

    if (!body.id_usuario) {
      return Response.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE usuarios 
                   SET email = @email,
                   id_rol = @id_rol,
                   nombre = @nombre,
                   id_campana = @id_campana,
                   ext = @ext,
                   sys_usrmod = @sys_usrmod
                   WHERE id_usuario = @id_usuario`;
    
     const result = await pool.request()
                   .input('id_usuario', sql.Int, body.id_usuario)
                   .input('email', sql.VarChar, body.email)
                   .input('id_rol', sql.VarChar, body.id_rol)
                   .input('nombre', sql.VarChar, body.nombre)
                   .input('ext', sql.Int, body.ext)
                   .input('id_campana', sql.Int, body.id_campana)
                   .input('sys_usrmod', sql.VarChar, session.user.email)
                   .query(query);
          
    if (result.rowsAffected[0] === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return Response.json({ message: "Usuario actualizado con éxito" });
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
  const query = "UPDATE usuarios SET estado = '0', sys_usrmod = @sys_usrmod WHERE id_usuario = @id_usuario";

  const result = await pool.request()
               .input('id_usuario', sql.Int, id)
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