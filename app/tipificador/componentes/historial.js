'use client';

import { DateTime } from "luxon";

export default function Historial({historial}) {

  const convertirGMT5 = (fecha) => {
    return DateTime.fromISO(fecha, { zone: "utc" }) 
      .setZone("America/Bogota") 
      .toFormat("yyyy-MM-dd HH:mm:ss"); 
  };

    return (
    <div className=" min-h-96">

    <div className='overflow-y-auto'>
    <div className="grid grid-cols-1 justify-center gap-4">
        <div className="overflow-x-auto py-2 max-h-[600px] ">
        {historial.length > 0 ?
        <table className='table w-full'>
            <thead>
            <tr>
            <th>Datos de Contacto</th>
            <th>Datos de Llamada</th>
            <th>Agente</th>
            <th>Observaciones</th>
            </tr>
        </thead>
            <tbody>
            {
            historial.map((field) => (
            <tr key={field.id_regllamada}>
            <td>
              {field.nombre_completo_contacto}<br />
              {Number(field.numero_llamada) || field.numero_llamada}<br />
              <span className="font-semibold">{convertirGMT5(field.sys_fechamod)}</span>
            </td>
            <td>
              <div>Contesto Llamada: <span className="font-semibold">{field.contesto_sn == "s" ? "Si" : "No"}</span></div>
              <div>Motivo: <span className="font-semibold">{field.respuesta_llamada}</span></div>
              <div>Fecha: </div>
            </td>
            <td>
              {field.nombre}<br/>
              <span className=" text-xs badge-ghost">{field.nombre_programacion}</span>
            </td>
            <td>{field.observaciones}</td>
            </tr>
           
            ))}
            </tbody>
            </table>:
            <div className="flex justify-center items-center h-80 text-primary">No hay historial.</div>
        }
        </div>
    </div>
    </div>
    
    </div>
    );
  }