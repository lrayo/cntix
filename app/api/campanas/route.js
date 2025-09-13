import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM campanas WHERE estado_campana = 1');
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

    const query = `INSERT INTO campanas (
     id_usradmin, id_fuente, nombre, estado_campana, sys_usrcrea, sys_usrmod
    ) VALUES (
      @id_usradmin, @id_fuente, @nombre, @estado_campana, @sys_usrcrea, @sys_usrmod
    )`;
    
    const result = await pool.request()
      .input('id_usradmin', sql.VarChar, body.id_usradmin)
      .input('id_fuente', sql.Int, body.id_fuente)
      .input('nombre', sql.VarChar, body.nombre)
      .input('estado_campana', sql.VarChar, "1")
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({ message: 'Campaña creada con éxito', id: result.recordset?.insertId || null });
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

    if (!body.id_campana) {
      return Response.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE campanas 
                   SET id_usradmin = @id_usradmin,
                   id_fuente = @id_fuente,
                   nombre = @nombre,
                   sys_usrmod = @sys_usrmod
                   WHERE id_campana = @id_campana`;
    
     const result = await pool.request()
                  .input('id_campana', sql.Int, body.id_campana)
                  .input('id_usradmin', sql.VarChar, body.id_usradmin)
                  .input('id_fuente', sql.Int, body.id_fuente)
                  .input('nombre', sql.VarChar, body.nombre)
                  .input('sys_usrmod', sql.VarChar, session.user.email)
                  .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return Response.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    return Response.json({ message: "Campaña actualizada con éxito" });
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
  const query = "UPDATE campanas SET estado_campana = '0', sys_usrmod = @sys_usrmod WHERE id_campana = @id_campana";

  const result = await pool.request()
               .input('id_campana', sql.Int, id)
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