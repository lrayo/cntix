'use client';

import { useState } from "react";
import ModicarContactoTip from "./modificarcontactotip";

export default function ContactosLeads({rowContactos, formData, setFormData, setOnChange}) {

    const [contacto, setContacto] = useState(false);

    const handleMail = (email) => {
        window.location.href = `mailto:${email}`;
      };

      const handleCall = (telefono, contacto, nombre) => {
        setFormData({ ...formData, numero_llamada: telefono,
            id_contacto_llamada: contacto, nombre_contacto_llamada: nombre
         });
       };

    return (
    <div className="min-h-96">
    {rowContactos.length > 0 && rowContactos[0].tipo_registro === "Contacto" ?
    <div className='overflow-y-auto'>
    <div className="grid grid-cols-1 justify-center gap-4">
        <div className="overflow-x-auto py-2 h-[400px] ">
        {!contacto ?
        <table className='table w-full'>
            <thead>
            <tr>
            <th>Nombre</th>
            <th>Datos de Contacto</th>
            </tr>
        </thead>
            <tbody>
            {
            rowContactos.map((field) => (
            <tr key={field.id_empleadscontac}>
            <td>
                {field.nombre_completo_contacto} 
                <br />
                <span className="badge badge-ghost badge-sm">{field.cargo}</span> <span className="badge badge-ghost badge-sm">{field.desc_rol}</span>
            </td>
            <td>
                <div className="flex gap-1">
                    Telefono: <a className="link link-primary" href={`sip:${field.telefono}`}>{field.telefono}</a>
                </div>
                <div className="flex gap-1">
                    Celular: <a className="link link-primary" href={`sip:${field.celular}`}>{field.celular}</a>
                </div>
                {field.email_contacto}
            </td>
            <td className="flex gap-2 items-center">
            <button onClick={()=>setContacto(field)} className=' btn btn-sm'>Editar</button>
            <div className="dropdown dropdown-left">
                <div tabIndex={0} role="button" className="btn btn-sm btn-primary">Contactar</div>
                <ul tabIndex={0} className="mt-4 dropdown-content menu bg-base-100 rounded-box z-10 w-32 p-2 shadow-sm">
                    <li className="hover:text-white cursor-pointer hover:bg-primary p-2" onClick={()=>handleCall(field.telefono, field.id_empleadscontac, field.nombre_completo_contacto)}>Teléfono</li>
                    <li className="hover:text-white  cursor-pointer hover:bg-primary p-2" onClick={()=>handleCall(field.celular, field.id_empleadscontac, field.nombre_completo_contacto)}>Celular</li>
                    <li className="hover:text-white  cursor-pointer hover:bg-primary p-2" onClick={()=>handleCall("Chat", field.id_empleadscontac, field.nombre_completo_contacto)}>Chat</li>
                    <li className="hover:text-white  cursor-pointer hover:bg-primary p-2" onClick={()=>handleCall("Visita", field.id_empleadscontac, field.nombre_completo_contacto)}>Visita</li>
                </ul>
            </div>
            </td>
                </tr>
            ))}
            </tbody>
            </table>:
            <div className="flex justify-center w-full">
                <ModicarContactoTip contacto={contacto} setContacto={setContacto} setOnChange={setOnChange} formData={formData} setFormData={setFormData}/>
            </div>
        }
        </div>
    </div>
    </div>:
    <div className="flex justify-center h-96 items-center text-primary">
        No hay contactos creados.
    </div>
    }
    </div>
    );
  }