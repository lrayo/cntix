import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM formularios WHERE estado_formulario = 1');
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

    const query = `INSERT INTO formularios (
     cod_formulario, nombre_formulario, descrip_formulario, estado_formulario, fecha_ini_vigencia, fecha_fin_vigencia, sys_usrcrea, sys_usrmod
    ) VALUES (
      @cod_formulario, @nombre_formulario, @descrip_formulario, @estado_formulario, @fecha_ini_vigencia, @fecha_fin_vigencia, @sys_usrcrea, @sys_usrmod
    )`;

    const fechaIni = new Date(body.fecha_ini_vigencia).toISOString().slice(0, 19).replace("T", " ");
    const fechaFin = new Date(body.fecha_fin_vigencia).toISOString().slice(0, 19).replace("T", " ");
    
    const result = await pool.request()
      .input('cod_formulario', sql.VarChar, body.cod_formulario)
      .input('nombre_formulario', sql.VarChar, body.nombre_formulario)
      .input('descrip_formulario', sql.VarChar, body.descrip_formulario)
      .input('fecha_ini_vigencia', fechaIni)
      .input('fecha_fin_vigencia', fechaFin)
      .input('estado_formulario', sql.Bit, 1)
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({ message: 'Formulario creado con éxito', id: result.recordset?.insertId || null });
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

    if (!body.id_formulario) {
      return Response.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE formularios 
                   SET cod_formulario = @cod_formulario,
                   nombre_formulario = @nombre_formulario,
                   descrip_formulario = @descrip_formulario,
                   fecha_ini_vigencia = @fecha_ini_vigencia,
                   fecha_fin_vigencia = @fecha_fin_vigencia,
                   sys_usrmod = @sys_usrmod
                   WHERE id_formulario = @id_formulario`;

                   const fechaIni = new Date(body.fecha_ini_vigencia).toISOString().slice(0, 19).replace("T", " ");
                   const fechaFin = new Date(body.fecha_fin_vigencia).toISOString().slice(0, 19).replace("T", " ");
    
     const result = await pool.request()
                  .input('cod_formulario', sql.VarChar, body.cod_formulario)
                  .input('id_formulario', sql.Int, body.id_formulario)
                  .input('nombre_formulario', sql.VarChar, body.nombre_formulario)
                  .input('descrip_formulario', sql.VarChar, body.descrip_formulario)
                  .input('fecha_ini_vigencia', fechaIni)
                  .input('fecha_fin_vigencia', fechaFin)
                  .input('sys_usrmod', sql.VarChar, session.user.email)
                  .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return Response.json({ error: "registro no encontrado" }, { status: 404 });
    }

    return Response.json({ message: "registro actualizado con éxito" });
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
  const query = "UPDATE formularios SET estado_formulario = '0', sys_usrmod = @sys_usrmod WHERE id_formulario = @id_formulario";

  const result = await pool.request()
               .input('id_formulario', sql.Int, id)
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