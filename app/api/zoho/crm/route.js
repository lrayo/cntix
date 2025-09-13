import { NextResponse } from "next/server";
import { connectDB, sql } from '@/lib/db';
import { getServerSession } from "next-auth";

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  const now = Date.now();

  // Si el token existe y no ha expirado, lo devolvemos
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  // Si no hay token o ya expiró, se solicita uno nuevo
  const params = new URLSearchParams({
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const response = await fetch(process.env.ZOHO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error obteniendo access token");
  }

  // Guardar token y fecha de expiración (1 hora)
  cachedToken = data.access_token;
  tokenExpiry = now + 60 * 60 * 1000; // 1 hora

  return cachedToken;
}

export async function POST(req) {
  try {

    const session = await getServerSession();
    if (!session) {
      return Response.json("401 No Autorizado");
    }
    // Obtener access token
    const accessToken = await getAccessToken();
    
    const body = await req.json();
   
    const response = await fetch(process.env.ZOHO_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            Tipo_Documento: body.cod_tipodoc,
            Numero_Documento: body.numero_doc,
            Digito_Verificacion: body.digito_verifica?.toString() ?? "",
            Company: body.nombre_comercial,
            Razon_Social: body.nombre_razonsocial,
            Direcci_n: body.direccion_negocio,
            City: body.ciudad,
            Country: body.pais,
            Departamento: body.departamento,
            Email: body.email,
            Phone: body.telefono1?.toString() || body.telefono2?.toString(),
            Mobile: body.telefono2?.toString() || body.telefono1?.toString(),
            Website: body.pagina_web,
            Zip_Code: body.zip_code,
            Sector_Economico: body.desc_sector,
            Lead_Source: body.fuentesource,
            Nombre_Completo_Agente: body.nombre_usuario,
            First_Name: body.nombre_contacto,
            Last_Name: body.apellido_1_contacto+" "+body.apellido_2_contacto,
            Tipo_Documento_Contacto: body.tipodoc_contacto,
            Numero_de_documento: body.numero_doc_contacto,
            Cargo: body.cargo,
            Email_Contacto: body.email_contacto,
            Celular_Contacto: body.celular?.toString() || body.telefono?.toString(),
            Telefono_Contacto: body.telefono?.toString() || body.celular?.toString(),
            Rol: body.desc_rol,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Resultado Transaccion:", data.data)
    const pool = await connectDB();
    const query = `UPDATE integraciones 
                   SET fecha_envio = @fecha_envio,
                   transaccion = @transaccion,
                   integracion_estado = @integracion_estado,
                   sys_usrmod = @sys_usrmod
                   WHERE id_integracion = @id_integracion`;
    
     await pool.request()
                  .input('id_integracion', sql.Int, body.id_integracion)
                  .input('fecha_envio', sql.Date, new Date().toISOString().slice(0, 19).replace("T", " "))
                  .input('transaccion', sql.VarChar, "status: " + data.data[0].status + " / message: " +  data.data[0].message)
                  .input('integracion_estado', sql.Bit, 1)
                  .input('sys_usrmod', sql.VarChar, session.user.email)
                  .query(query);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
