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
      const result = await pool.request().query(`SELECT * FROM formularios_campos WHERE estado_formcampo = 1 AND id_formulario = ${id}`);
  
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

    const query = `INSERT INTO formularios_campos (
     id_formulario, cod_campo, descrip_campo, tipo_campo, opcion_campo, campo_obligatorio_sn, estado_formcampo, sys_usrcrea, sys_usrmod
    ) VALUES (
      @id_formulario, @cod_campo, @descrip_campo, @tipo_campo, @opcion_campo, @campo_obligatorio_sn, @estado_formcampo, @sys_usrcrea, @sys_usrmod
    )`;
    
    const result = await pool.request()
      .input('id_formulario', sql.Int, body.id_formulario)
      .input('cod_campo', sql.VarChar, body.cod_campo)
      .input('descrip_campo', sql.VarChar, body.descrip_campo)
      .input('tipo_campo', sql.VarChar, body.tipo_campo)
      .input('opcion_campo', sql.VarChar, body.opcion_campo)
      .input('campo_obligatorio_sn', sql.Bit, body.campo_obligatorio_sn)
      .input('estado_formcampo', sql.Bit, 1)
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({ message: 'Campo creado con éxito', id: result.recordset?.insertId || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
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
  const query = "UPDATE formularios_campos SET estado_formcampo = '0', sys_usrmod = @sys_usrmod WHERE id_formulario_campo = @id_formulario_campo";

  const result = await pool.request()
               .input('id_formulario_campo', sql.Int, id)
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