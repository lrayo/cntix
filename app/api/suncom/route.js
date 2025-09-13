import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";
import { SunComCRM } from './crm';

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM leads_suncom WHERE estado_lead = 1');
    return Response.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en la API:", err);
    return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1. Parsear el cuerpo de la solicitud
    const body = await req.json();

    // 2. Verificar sesión
    const session = await getServerSession();
    if (!session) {
      return Response.json({ error: "401 No Autorizado" }, { status: 401 });
    }

    // 3. Conectar a la base de datos
    const pool = await connectDB();

    // 4. Preparar datos del applicant para el CRM
    const applicant = {
      first_name: body.nombre_lead,
      last_name: body.apellido_lead,
      phone: body.telefono,
      city: body.nombre_municipio,
    };

    // 5. Intentar integrar con el CRM, pero que no bloquee si falla
    try {
      const resultCRM = await SunComCRM(applicant);
      console.log("CRM Response:", resultCRM);
      // Si necesitas guardar algún dato como fecha_integracion en el futuro, aquí puedes hacerlo
    } catch (crmError) {
      console.error("Error en integración con CRM:", crmError.message || crmError);
      // Puedes registrar este error en un log, tabla, o notificar si es necesario
    }

    // 6. Insertar el lead en la base de datos
    const query = `
      INSERT INTO leads_suncom (
        nombre_lead, apellido_lead, municipio, observaciones, telefono, estado_lead,
        sys_usrcrea, sys_usrmod
      ) VALUES (
        @nombre_lead, @apellido_lead, @municipio, @observaciones, @telefono, @estado_lead,
        @sys_usrcrea, @sys_usrmod
      )
    `;

    const result = await pool.request()
      .input('nombre_lead', sql.VarChar, body.nombre_lead)
      .input('apellido_lead', sql.VarChar, body.apellido_lead)
      .input('municipio', sql.VarChar, body.nombre_municipio)
      .input('observaciones', sql.VarChar, body.observaciones)
      .input('telefono', sql.VarChar, body.telefono)
      .input('estado_lead', sql.VarChar, "1")
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    // 7. Respuesta exitosa
    return Response.json({
      message: 'Lead creado con éxito',
      id: result.recordset?.insertId || null
    });

  } catch (error) {
    // 8. Manejo de errores generales
    console.error("Error en POST /leads_suncom:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
