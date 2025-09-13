import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";
import { SunComCRM } from '../crm';

export async function GET() {
  try {
      const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
    
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM leads_suncom_baterias WHERE estado_lead = 1');
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
      return Response.json({ error: "401 No Autorizado" }, { status: 401 });
    }

    // Preparar el objeto para el CRM
    const applicant = {
      first_name: body.nombre_lead,
      last_name: body.apellido_lead,
      phone: body.telefono,
      city: body.nombre_municipio,
      date_of_birth: body.fecha_nacimiento,
      physical_address: body.direccion,
    };

    // Intentar enviar al CRM, pero sin bloquear la inserción en DB si falla
    try {
      const resultCRM = await SunComCRM(applicant);
      console.log("CRM Response:", resultCRM);
    } catch (crmError) {
      console.error("Error al enviar al CRM:", crmError.message || crmError);
      // Si quieres registrar que falló el CRM, puedes incluir un campo más adelante o log en base de datos.
    }

    // Insertar en base de datos
    const query = `INSERT INTO leads_suncom_baterias (
      nombre_lead, apellido_lead, municipio, observaciones, telefono, direccion,
      estado_lead, sys_usrcrea, sys_usrmod, fecha_nacimiento, ingresos_mensuales
    ) VALUES (
      @nombre_lead, @apellido_lead, @municipio, @observaciones, @telefono, @direccion,
      @estado_lead, @sys_usrcrea, @sys_usrmod, @fecha_nacimiento, @ingresos_mensuales
    )`;

    const result = await pool.request()
      .input('nombre_lead', sql.VarChar, body.nombre_lead)
      .input('apellido_lead', sql.VarChar, body.apellido_lead)
      .input('municipio', sql.VarChar, body.nombre_municipio)
      .input('observaciones', sql.VarChar, body.observaciones)
      .input('telefono', sql.Numeric, body.telefono)
      .input('direccion', sql.VarChar, body.direccion)
      .input('fecha_nacimiento', sql.DateTime, body.fecha_nacimiento)
      .input('ingresos_mensuales', sql.Numeric, body.ingresos_mensuales)
      .input('estado_lead', sql.VarChar, "1")
      .input('sys_usrcrea', sql.VarChar, session.user.email)
      .input('sys_usrmod', sql.VarChar, session.user.email)
      .query(query);

    return Response.json({
      message: 'Lead baterías creado con éxito',
      id: result.recordset?.insertId || null
    });

  } catch (error) {
    console.error("Error en POST:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

