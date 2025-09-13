import { connectDB, sql } from '@/lib/db';
import { NextResponse } from 'next/server';
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
          const result = await pool.request().query(`SELECT * FROM empresas_leads_datos_adicionales WHERE id_empresalead = ${id}`);
      
          return Response.json(result.recordset);
        } catch (err) {
          console.error("❌ Error en la API:", err);
          return Response.json({ error: 'Error en la base de datos', details: err.message }, { status: 500 });
        }
      }
  
    export async function PUT(req) {
      try {
        const session = await getServerSession();
        if (!session) {
          return Response.json("401 No Autorizado");
        }
        
        const body = await req.json();
        console.log("Datos recibidos para actualizar:", body);
    
        if (!body.id_empresalead) {
          return NextResponse.json({ error: "El ID es obligatorio para actualizar" }, { status: 400 });
        }
    
        const pool = await connectDB();
        
        // Verificar si existe el registro
        const checkQuery = `SELECT COUNT(*) AS count FROM empresas_leads_datos_adicionales WHERE id_empresalead = @id_empresalead`;
        const checkResult = await pool.request()
                          .input('id_empresalead', sql.Int, body.id_empresalead)
                          .query(checkQuery);
        
        const recordExists = checkResult.recordset[0].count > 0;
       
        if (recordExists) {
          // Actualizar si el registro existe
          const updateQuery = `UPDATE empresas_leads_datos_adicionales 
                             SET id_tipo_cliente = @id_tipo_cliente, plan_actual = @plan_actual, costo_fijo_mensual = @costo_fijo_mensual,
                                 rango_cfm = @rango_cfm, producto = @producto, fuente = @fuente,
                                 estado_empresas_leads_adic = @estado_empresas_leads_adic,
                                 sys_usrmod = @sys_usrmod, desc_tipo_negocio = @desc_tipo_negocio, zip_code = @zip_code,
                                 latitud = @latitud, longitud = @longitud, pagina_web = @pagina_web
                             WHERE id_empresalead_adic = @id_empresalead_adic`;
          
          await pool.request()
              .input('id_empresalead_adic', sql.Int, body.id_empresalead_adic)
              .input('id_tipo_cliente', sql.Int, body.id_tipo_cliente)
              .input('plan_actual', sql.VarChar, body.plan_actual)
              .input('costo_fijo_mensual', sql.VarChar, body.costo_fijo_mensual)
              .input('rango_cfm', sql.VarChar, body.rango_cfm)
              .input('producto', sql.VarChar, body.producto)
              .input('fuente', sql.VarChar, body.fuente)
              .input('estado_empresas_leads_adic', sql.VarChar, body.estado_empresas_leads_adic || "")
              .input('sys_usrmod', sql.VarChar, session.user.email)
              .input('desc_tipo_negocio', sql.VarChar, body.desc_tipo_negocio)
              .input('zip_code', sql.VarChar, body.zip_code)
              .input('latitud', body.latitud)
              .input('longitud', body.longitud)
              .input('pagina_web', body.pagina_web)
              .query(updateQuery);
          
          return NextResponse.json({ message: "Empresa actualizada con éxito" });
        } else {
          // Insertar si el registro no existe
          const insertQuery = `INSERT INTO empresas_leads_datos_adicionales (id_empresalead, id_tipo_cliente, plan_actual, costo_fijo_mensual, rango_cfm, 
                                            producto, fuente, estado_empresas_leads_adic, sys_usrcrea, 
                                            sys_usrmod, desc_tipo_negocio, zip_code, latitud, 
                                            longitud, pagina_web)
                               VALUES (@id_empresalead, @id_tipo_cliente, @plan_actual, @costo_fijo_mensual, @rango_cfm, 
                                       @producto, @fuente, @estado_empresas_leads_adic, @sys_usrcrea, 
                                       @sys_usrmod, @desc_tipo_negocio, @zip_code,@latitud, @longitud, 
                                       @pagina_web)`;
          
          await pool.request()
              .input('id_empresalead', sql.Int, body.id_empresalead)
              .input('id_tipo_cliente', sql.Int, body.id_tipo_cliente)
              .input('plan_actual', sql.VarChar, body.plan_actual)
              .input('costo_fijo_mensual', sql.VarChar, body.costo_fijo_mensual)
              .input('rango_cfm', sql.VarChar, body.rango_cfm)
              .input('producto', sql.VarChar, body.producto)
              .input('fuente', sql.VarChar, body.fuente)
              .input('estado_empresas_leads_adic', sql.Int, 1)
              .input('sys_usrcrea', sql.VarChar, session.user.email)
              .input('sys_usrmod', sql.VarChar, session.user.email)
              .input('desc_tipo_negocio', sql.VarChar, body.desc_tipo_negocio)
              .input('zip_code', sql.VarChar, body.zip_code)
              .input('latitud', sql.VarChar, body.latitud)
              .input('longitud', sql.VarChar, body.longitud)
              .input('pagina_web', sql.VarChar, body.pagina_web)
              .query(insertQuery);
          
          return NextResponse.json({ message: "Informacion insertada con éxito" });
        }
      } catch (error) {
        console.error("Error en la API:", error);
        return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
      }
    }
    

   