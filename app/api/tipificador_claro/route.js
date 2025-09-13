import { connectDB, sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";

export async function GET() {
  try {

    const session = await getServerSession()
    if (!session) {
      return Response.json("401 No Autorizado");
    }

    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM vw_tipoficador_claro');

    return Response.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en la API:", err);
    return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
  }
}