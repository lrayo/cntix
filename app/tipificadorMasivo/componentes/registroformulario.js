'use client';

import { useState, useEffect } from 'react';

export default function RegistroFormulario({formData, setFormData}) {

  const [rowCampos, setRowCampos] = useState(false);

  useEffect(() => {
    if (!formData.id_programacion) return;
  
    async function fetchData() {
      try {
        const [prog] = await Promise.all([
          fetch(`/api/programaciones/id?id=${formData.id_programacion}`),
        ]);
  
        if (!prog) throw new Error("Error al obtener los datos");
        const idProg = await prog.json();
  
        const [res] = await Promise.all([
          fetch(`/api/formularios/campos?id=${idProg[0].id_formulario}`),
        ]);
  
        if (!res) throw new Error("Error al obtener los datos");
  
        const campos = await res.json();
        setFormData((prev) => ({
          ...prev,
          id_formulario: idProg[0].id_formulario,
          respuestas_formulario: {},
        }));
        setRowCampos(campos);
      } catch (err) {
        console.log(err.message);
      }
    }
  
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
    const handleChange = (e) => {
      setFormData({ ...formData, 
        respuestas_formulario: {...formData.respuestas_formulario, [e.target.name]: e.target.value}
       });
      };

    return (
  <div className="flex justify-center">
    {rowCampos && rowCampos.length > 0 && formData.numero_llamada ?
    <div className='w-80 flex flex-col gap-4 pt-4'>
     {rowCampos.map((campo) => { 
       if(campo.tipo_campo === "text"){
         return (
           <div className='flex flex-col' key={campo.id_formulario_campo}>
             <label className="text-xs">{campo.descrip_campo}</label>
             <input type="text" name={campo.id_formulario_campo} id={campo.id_formulario_campo} autoComplete="off" 
              onChange={handleChange} className="input input-sm" 
              required={campo.campo_obligatorio_sn} />
           </div>
         )
       }
       if(campo.tipo_campo === "date"){
        return (
          <div className='flex flex-col' key={campo.id_formulario_campo}>
            <label className="text-xs">{campo.descrip_campo}</label>
            <input type="date" name={campo.id_formulario_campo} id={campo.id_formulario_campo} autoComplete="off" 
              onChange={handleChange} className="input input-sm" 
              required={campo.campo_obligatorio_sn}/>
          </div>
        )
      }
      if(campo.tipo_campo === "number"){
        return (
          <div className='flex flex-col' key={campo.id_formulario_campo}>
            <label className="text-xs">{campo.descrip_campo}</label>
            <input type="number" name={campo.id_formulario_campo} id={campo.id_formulario_campo} autoComplete="off" 
              onChange={handleChange} className="input input-sm" 
              required={campo.campo_obligatorio_sn}/>
          </div>
        )
      }
      if(campo.tipo_campo === "textarea"){
        return (
          <div className='flex flex-col' key={campo.id_formulario_campo}>
            <label className="text-xs">{campo.descrip_campo}</label>
            <textarea type="date" name={campo.id_formulario_campo} id={campo.id_formulario_campo} autoComplete="off" 
              onChange={handleChange} className="textarea textarea-sm" 
              required={campo.campo_obligatorio_sn}/>
          </div>
        )
      }
      if(campo.tipo_campo === "select"){
        return (
          <div className='flex flex-col' key={campo.id_formulario_campo}>
            <label className="text-xs">{campo.descrip_campo}</label>
            <select name={campo.id_formulario_campo} id={campo.id_formulario_campo} autoComplete="off" 
              onChange={handleChange} className="input input-sm" 
              required={campo.campo_obligatorio_sn}>
              <option value="">Seleccione una opción</option>
              {campo.opcion_campo.split(',').map((opcion) => {
                return (
                  <option key={opcion} value={opcion}>{opcion}</option>
                )
              })}
              </select>
          </div>
        )
      }
      })}
    </div>:
    <div className="flex justify-center h-96 items-center text-primary">
          <div role="alert" className="alert text-white bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No hay tipificaciones para realizar.</span>
          </div>
      </div>
    }

  </div>
    );
  }