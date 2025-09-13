import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query("SELECT id_programacion ,pr.id_campana ,pr.id_formulario ,pr.nombre ,ca.nombre as nombre_campana ,pr.descripcion ,pr.cantidad_leads ,pr.estado_programacion ,pr.sys_usrcrea ,pr.sys_usrmod ,pr.sys_fechacrea ,pr.sys_fechamod FROM dbo.programaciones pr LEFT JOIN campanas ca ON ca.id_campana = pr.id_campana ORDER BY pr.estado_programacion DESC");
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

    const query = `INSERT INTO programaciones (
     id_campana, id_formulario, nombre, descripcion, cantidad_leads, estado_programacion, sys_usrcrea, sys_usrmod
    ) VALUES (
      @id_campana, @id_formulario, @nombre, @descripcion, @cantidad_leads, @estado_programacion, @sys_usrcrea, @sys_usrmod
    )`;
    
    const result = await pool.request()
      .input('id_campana', sql.Int, body.id_campana)
      .input('id_formulario', sql.Int, body.id_formulario)
      .input('nombre', sql.VarChar, body.nombre)
      .input('descripcion', sql.VarChar, body.descripcion)
      .input('cantidad_leads', sql.Int, body.cantidad_leads)
      .input('estado_programacion', sql.VarChar, "1")
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({ message: 'Registro creado con éxito', id: result.recordset?.insertId || null });
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

    if (!body.id_programacion) {
      return Response.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
    }

    const pool = await connectDB();
    const query = `UPDATE programaciones 
                   SET id_campana = @id_campana,
                    id_formulario = @id_formulario,
                    nombre = @nombre,
                    descripcion = @descripcion,
                    cantidad_leads = @cantidad_leads,
                   sys_usrmod = @sys_usrmod
                   WHERE id_programacion = @id_programacion`;
    
     const result = await pool.request()
                  .input('id_programacion', sql.Int, body.id_programacion)
                  .input('id_campana', sql.Int, body.id_campana)
                  .input('id_formulario', sql.Int, body.id_formulario)
                  .input('nombre', sql.VarChar, body.nombre)
                  .input('descripcion', sql.VarChar, body.descripcion)
                  .input('cantidad_leads', sql.Int, body.cantidad_leads)
                  .input('sys_usrmod', sql.VarChar, session.user.email)
                  .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return Response.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    return Response.json({ message: "Registro actualizado con éxito" });
  } catch (error) {
    console.error("Error en la API:", error);
    return Response.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req) {

  const pool = await connectDB();
  const transaction = pool.transaction();
  await transaction.begin();

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

  const validar = await transaction.request()
  .input('id_programacion', sql.Int, id)
  .query("SELECT estado_programacion FROM programaciones WHERE id_programacion = @id_programacion")

  const estado_programacion = validar.recordset[0].estado_programacion ? false : true

  const query = "UPDATE programaciones SET estado_programacion = @estado_programacion, sys_usrmod = @sys_usrmod WHERE id_programacion = @id_programacion";

  const result = await transaction.request()
               .input('id_programacion', sql.Int, id)
               .input('estado_programacion', sql.Bit, estado_programacion)
               .input('sys_usrmod', sql.VarChar, session.user.email)
               .query(query);

  const query2 = "UPDATE programaciones_detalle SET estado_prog_detalle = @estado_programacion, sys_usrmod = @sys_usrmod WHERE id_programacion = @id_programacion";

  await transaction.request()
              .input('id_programacion', sql.Int, id)
              .input('estado_programacion', sql.Bit, estado_programacion)
              .input('sys_usrmod', sql.VarChar, session.user.email)
              .query(query2);

  await transaction.commit();

  if (result.affectedRows === 0) {
      return Response.json({ error: "Registro no encontrado" }, { status: 404 });
  }
  return Response.json({ message: "Registro actualizado correctamente" });

}  catch (error) {
    if (transaction )await transaction.rollback();
    return Response.json({ error: error.message }, { status: 500 });
  }
}