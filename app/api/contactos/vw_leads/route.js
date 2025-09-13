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
        const result = await pool.request().query(`SELECT * FROM vw_leads_contactos WHERE id_empresalead = ${id} AND estado_empleads_contacto = 1`);
    
        return Response.json(result.recordset);
      } catch (err) {
        console.error("❌ Error en la API:", err);
        return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
      }
    }