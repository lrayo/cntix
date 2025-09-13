'use client';
import { useState, useEffect } from 'react';

export default function VerRegistro({registro}) {

    const obtenerRespuestaLlamada = (codigo) => {
      const respuestas = {
        NoDecisiones: "No es tomador de decisiones",
        NoExiste: "Número no existe",
        ContactoEfectivo: "Contacto Efectivo",
        ContestaCuelga: "Contesta y Cuelga",
        LlamarDespues: "Llamar Después",
        TelefonoErrado: "Teléfono Errado",
        Buzon: "Buzón de Voz",
        NoContesta: "No Contesta",
      };
    
      return respuestas[codigo] || codigo;
    };
//console.log(formData)
    return (
    <div className="flex justify-center">
        <dialog id="modalVerRegistro" className="modal">
          {registro && registro.sys_fechamod &&
        <div className="modal-box w-11/12 max-w-5xl">
        <div className="p-6 bg-base-100 ">
          <div className="text-xl text-primary">Registro: {registro.id_regllamada}</div>
          <div className="text-sm">Fecha: {registro.sys_fechamod.split('T')[0]}</div>
          <div className='grid gap-2 p-4'>
          <table className='table table-sm'>
            <thead>
              <tr>
                <td>
                  Empresa
                </td>
                <td>
                  Contacto
                </td>
                <td>
                  Agente
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className='font-semibold'>{registro.nombre_comercial}</div>
                  <div>{registro.numero_doc}</div>
                </td>
                <td>
                  <div className='font-semibold'>{registro.nombre_completo_contacto}</div>
                  <div>CC {registro.numero_doc_contacto}</div>
                  <div className='text-primary'>{registro.numero_llamada}</div>
                </td>
                <td>
                  <div className='font-semibold'>{registro.nombre}</div>
                  <div>{registro.email}</div>
                  <div>{registro.nombre_programacion}</div>
                </td>
              </tr>
            </tbody>
          </table>


          <table className='table table-sm'>
            <thead>
              <tr>
                <td>
                  Registro Llamada
                </td>
                <td>
                  Observaciones
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div>Contesto Llamada: <span className='font-semibold'>{registro.contesto_sn == "s" ? "Si" : "No"}</span></div>
                  <div>Llamada Efectiva: <span className='font-semibold'>{registro.llamada_efectiva_sn == "s" ? "Si" : "No"}</span></div>
                  <div>Respuesta Llamada: <span className='font-semibold'>{obtenerRespuestaLlamada(registro.respuesta_llamada)}</span></div>
                </td>
                <td>
                  {registro.observaciones}
                </td>
              </tr>
            </tbody>
          </table>



          </div>
          <div className="flex justify-center gap-4">

            <form method="dialog">
                <button className="btn">Cerrar</button>
            </form>
          </div>
        </div>
        </div>
    }
    </dialog>
    </div>
    );
  }