import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM vw_programacion_det where estado_prog_detalle = 1');
    return Response.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en la API:", err);
    return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
  }
}


export async function POST(req) {
  const pool = await connectDB();

  try {
    const body = await req.json();
    const session = await getServerSession();

    if (!session) {
      return Response.json({ error: 'No autorizado (sesión inválida)' }, { status: 401 });
    }

    const table = new sql.Table('programaciones_detalle');
    table.create = false;

    table.columns.add('id_programacion', sql.Int, { nullable: true });
    table.columns.add('id_empresalead', sql.Int, { nullable: true });
    table.columns.add('id_usuario', sql.Int, { nullable: true });
    table.columns.add('estado_prog_detalle', sql.Bit, { nullable: true });
    table.columns.add('sys_usrcrea', sql.NVarChar(400), { nullable: true });
    table.columns.add('sys_usrmod', sql.NVarChar(400), { nullable: true });
    table.columns.add('fecha_llamada', sql.DateTime, { nullable: true });
    table.columns.add('estado_llamada', sql.VarChar(1), { nullable: true });
    table.columns.add('intentos_llamada', sql.Int, { nullable: true });

    for (const detalle of body) {

      table.rows.add(
        Number(detalle.id_programacion),
        Number(detalle.id_empresalead),
        Number(detalle.id_usuario),
        true,
        session.user.email,
        session.user.email,
        detalle.fecha_llamada,
        'p',
        0
      );
    }

    const requestSQL = pool.request();
    await requestSQL.bulk(table);

    return Response.json({ message: 'Registros creados con éxito (bulk insert)' });
  }    catch (error) {
    console.error('Error al procesar:', error);
    return Response.json({ message: 'Error en la inserción masiva.', error }, { status: 500 });
  }
}