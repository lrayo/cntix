'use client';
import { useState, useEffect } from 'react';

export default function VerRegistroInt({registro}) {



//console.log(formData)
    return (
    <div className="flex justify-center">
        <dialog id="modalVerRegistroInt" className="modal">
          {registro && 
        <div className="modal-box w-11/12 max-w-5xl">
        <div className="p-6 bg-base-100 ">
          <div className="text-xl text-primary">Registro: {registro.id_integracion}</div>
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
                <div className='font-semibold'>{registro.nombre_razonsocial}</div>
                  <div>{registro.nombre_comercial}</div>
                  <div>{registro.cod_tipodoc} {registro.numero_doc} - {registro.digito_verifica}</div>
                  <div>Direccion: {registro.direccion_negocio}</div>
                  <div>Email: {registro.email}</div>
                  <div>{registro.pais} - {registro.departamento} - {registro.ciudad}</div>
                  <div>Sector: {registro.desc_sector}</div>
                  <div>ZipCode: {registro.zip_code}</div>
                  <div>Pagina web: {registro.pagina_web}</div>
                  <div>Telefono 1: {registro.telefono1}</div>
                  <div>Telefono 2: {registro.telefono2}</div>
                </td>
                <td>
                  <div className='font-semibold'>{registro.nombre_completo_contacto}</div>
                  <div>Nombre: {registro.nombre_contacto}</div>
                  <div>Apellido 1: {registro.apellido_1_contacto}</div>
                  <div>Apellido 2: {registro.apellido_2_contacto}</div>
                  <div>Documento: {registro.tipodoc_contacto} {registro.numero_doc_contacto}</div>
                  <div>Cargo: {registro.cargo} / Rol: {registro.desc_rol}</div>
                  <div className='text-primary'>Celular: {registro.celular}</div>
                  <div className='text-primary'>Telefono: {registro.telefono}</div>
                  <div className='text-primary'>Email: {registro.email_contacto}</div>
                </td>
                <td>
                  <div className='font-semibold'>{registro.nombre_usuario}</div>
                  <div>{registro.email_usuario}</div>
                  <div>Programacion: {registro.nombre_programacion}</div>
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