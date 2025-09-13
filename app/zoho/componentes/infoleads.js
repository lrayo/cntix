'use client';

import ModInfoAdicional from "./modificaradicionaltip";
import ModInfoBasica from "./modificarleadtip";
import { useState } from "react";

export default function InfoLeads({rowData, rowAdicional, setOnChange}) {

  const [modData, setModData] = useState(false);
  const [modDataAd, setModDataAd] = useState(false);

return (
    <div className="">
      {!modData && !modDataAd &&
    <div className=''>
          <div className="overflow-x-auto py-4">
            <table className='table w-full'>
              <thead>
              <tr>
                <th>{rowData.nombre_razonsocial}</th>
                <th>Datos de Contacto</th>
              </tr>
            </thead>
              <tbody>
                <tr className=' justify-center items-center'>
                <td>
                  {rowData.nombre_comercial} 
                  <br />
                  <span className="font-semibold">Nit: {rowData.numero_doc} </span>
                  <br />
                  {rowData.direccion_negocio} 
                  <br />
                  <span className="badge badge-ghost badge-sm">{rowData.ciudad} - {rowData.pais}</span> 
                </td>
                <td>
                    Telefono: <a className=" link link-primary" href={`sip:${rowData.telefono1}`}>{rowData.telefono1}</a><br />
                    Celular: <a className=" link link-primary" href={`sip:${rowData.telefono2}`}>{rowData.telefono2}</a><br />
                    Correo: <a className=" link link-primary" href={`mailto:${rowData.telefono2}`}>{rowData.email}</a><br />
                </td>
                <td>
                  <button className=' btn btn-sm btn-primary' onClick={()=>setModData(true)}>Editar</button>
                </td>
                  </tr>
              </tbody>
              </table>
          </div>
          {
            rowAdicional &&   
          <div className="overflow-x-auto">
            <table className='table w-full'>
              <thead>
              <tr>
                <th>Informacion Adicional</th>
              </tr>
            </thead>
              <tbody>
                <tr className=''>
                <td>
                  {rowAdicional.plan_actual} 
                  <br />
                  <span className="text-sm font-semibold">Costo Fijo Mensual:</span> {rowAdicional.costo_fijo_mensual} 
                  <br />
                  <span className="text-sm font-semibold">Rango Costo Fijo Mensual:</span> {rowAdicional.rango_cfm} 
                  <br />
                  <span className="text-sm font-semibold">Producto:</span> {rowAdicional.producto}
                </td>
                <td>
                <span className="text-sm font-semibold">Zip Code:</span> {rowAdicional.zip_code}
                  <br />
                  <span className="text-sm font-semibold">Pagina Web:</span> {rowAdicional.pagina_web}
                  <br />
                  <span className="text-sm font-semibold">Tipo Negocio:</span> {rowAdicional.desc_tipo_negocio}
                </td>
                <td>
                  <button className='btn btn-sm btn-primary' onClick={()=>setModDataAd(true)}>Editar</button>
                </td>
                  </tr>
                  
              </tbody>
              </table>

          </div>
          }
      </div>
      }
      {modData && 
        <ModInfoBasica rowData={rowData} setModData={setModData} setOnChange={setOnChange}/>
      }
      {modDataAd && 
        <ModInfoAdicional rowData={rowAdicional} setModDataAd={setModDataAd} setOnChange={setOnChange}/>
      }
    </div>
    );
  }