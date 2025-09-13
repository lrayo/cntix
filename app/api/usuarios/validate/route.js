import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const pool = await connectDB();

    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }
    const result = await pool
      .request()
      .input("modulo", sql.VarChar, body.modulo)
      .input("id_rol", sql.VarChar, body.id_rol)
      .input("id_campana", sql.Int, body.id_campana)
      .query("SELECT * FROM usuarios_permisos WHERE modulo = @modulo AND id_rol = @id_rol AND id_campana = @id_campana");

      if (result.recordset.length > 0) {
        return Response.json(true);
      } else {
        return Response.json(false);
      }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}