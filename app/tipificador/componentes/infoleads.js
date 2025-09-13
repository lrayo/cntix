'use client';

import ModInfoAdicional from "./modificaradicionaltip";
import ModInfoBasica from "./modificarleadtip";
import { useState } from "react";

export default function InfoLeads({rowData, formData, setFormData, rowAdicional, setOnChange}) {

  const [modData, setModData] = useState(false);
  const [modDataAd, setModDataAd] = useState(false);

  const handleCall = (telefono) => {
    setFormData({ ...formData, numero_llamada: telefono,
        id_contacto_llamada: 0, nombre_contacto_llamada: rowData.nombre_razonsocial
     });
   };

return (
    <div className="min-h-96">
      {!modData && !modDataAd &&
    <div className=''>
      <div className="overflow-y-auto">
        <div className="grid grid-cols-1 justify-center gap-4">
        <div className="overflow-x-auto py-2">
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
                <td className="flex gap-2">
                  <button className=' btn btn-sm btn-primary' onClick={()=>setModData(true)}>Editar</button>
                  <div className="dropdown dropdown-left">
                <div tabIndex={0} role="button" className="btn btn-sm btn-primary">Llamar</div>
                    <ul tabIndex={0} className="mt-4 dropdown-content menu bg-base-100 rounded-box z-10 w-32 p-2 shadow-sm">
                        <li className="hover:text-white cursor-pointer hover:bg-primary p-2" onClick={()=>handleCall(rowData.telefono1)}>Teléfono 1</li>
                        <li className="hover:text-white  cursor-pointer hover:bg-primary p-2" onClick={()=>handleCall(rowData.telefono2)}>Teléfono 2</li>
                    </ul>
                </div>
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
          </div>
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