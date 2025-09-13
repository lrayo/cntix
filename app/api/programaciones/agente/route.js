import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET(req) {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // Obtiene el parámetro "id"

    const pool = await connectDB();
    const result = await pool.request().query(`SELECT * FROM vw_programacion_det WHERE (estado_prog_detalle = 1 AND id_usuario = ${id})`);
    return Response.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en la API:", err);
    return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
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
    const query = `UPDATE programaciones_detalle 
                   SET id_usuario = @id_usuario
                   WHERE id_progdet = @id_progdet`;
    
     const result = await pool.request()
                  .input('id_usuario', sql.Int, body.id_usuario)
                  .input('id_progdet', sql.Int, body.id_progdet)
                  .query(query);
  
    if (result.rowsAffected[0] === 0) {
      return Response.json({ error: "Detalle no encontrado" }, { status: 404 });
    }

    return Response.json({ message: "Agente actualizado con éxito" });
  } catch (error) {
    console.error("Error en la API:", error);
    return Response.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}