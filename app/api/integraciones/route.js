import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM vw_integracion_zoho');
    console.log("Consulta GET ejecutada, filas devueltas:", result.recordset.length);
    return Response.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en la API:", err);
    return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
  }
}

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
        .input('id_empresalead', sql.Int, detalle.id_empresalead)
        .input('id_usuario', sql.Int, detalle.id_usuario)
        .input('id_programacion', sql.Int, detalle.id_programacion)
        .input('id_contacto_llamada', sql.Int, detalle.id_contacto_llamada)
        .input('integracion_estado', sql.Bit, 0)
        .input('numero_llamada', sql.Float, detalle.numero_llamada)
        .input('sys_usrcrea', sql.VarChar, session.user.email)
        .input('sys_usrmod', sql.VarChar, session.user.email)
        .query(`INSERT INTO integraciones (
          id_empresalead, id_usuario, id_programacion, id_contacto_llamada,
          integracion_estado, numero_llamada, sys_usrcrea, sys_usrmod
        ) VALUES (
          @id_empresalead, @id_usuario, @id_programacion, @id_contacto_llamada, 
          @integracion_estado, @numero_llamada, @sys_usrcrea , @sys_usrmod
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
