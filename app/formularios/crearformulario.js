'use client';
import { useState, useEffect } from 'react';

export default function CrearFormulario({setOnChange}) {
    
  const [formData, setFormData] = useState({});
  const [checkForm, setCheckForm] = useState(true);

  useEffect(() => {
    function check() {
      if(formData && formData.cod_formulario && formData.nombre_formulario) 
        setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();

        try {
          setCheckForm(true);
          const response = await fetch('/api/formularios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          document.getElementById('modalCrearFormulario').close();
          setFormData({});
          const text = await response.text();
          setOnChange(Math.random()) 
          console.log("Respuesta del servidor:", text);
          if (!text) throw new Error("Respuesta vacía del servidor");
      
          const data = JSON.parse(text); 
          alert(data.message || 'Error en la inserción');
      
        } catch (error) {
          console.error('Error:', error);
          alert("Error al enviar los datos. Revisa la consola.");
        }
      };

    return (
    <div className="flex justify-center">
        <button type="button" onClick={()=>document.getElementById('modalCrearFormulario').showModal()} 
                className="btn btn-primary text-white">Crear Formulario</button>
        <dialog id="modalCrearFormulario" className="modal">
        <form onSubmit={handleSubmit} className=' w-11/12 justify-center flex'>
        <div className="modal-box w-11/12 max-w-5xl ">
        <div className="p-6 bg-base-100">
          <div className="text-xl text-primary pb-4">Crear Formulario</div>
          <div className='grid gap-2 p-4'>
        {formData &&
      <table className='table'>
        <tbody>
          <tr>
            <td className='font-semibold'>Codigo Formulario</td>
            <td>
                <input
                  type='text' name="cod_formulario" className='input input-sm'
                  onChange={handleChange}
                  value={formData.cod_formulario || ""}
                />
              </td>
          </tr>
            <tr>
              <td className='font-semibold w-1/4'>Nombre</td>
              <td>
                <input
                  type='text' name="nombre_formulario" className='input input-sm'
                  onChange={handleChange}
                  value={formData.nombre_formulario || ""}
                />
              </td>
            </tr>
            <tr>
              <td className='font-semibold w-1/4'>Descripcion</td>
              <td>
                <input
                  type='text' name="descrip_formulario" className='input input-sm'
                  onChange={handleChange}
                  value={formData.descrip_formulario || ""}
                />
              </td>
            </tr>
            <tr>
              <td className='font-semibold'>
                Fecha Inicio Vigencia
              </td>
              <td>
              <input type='datetime-local' name="fecha_ini_vigencia" value={formData.fecha_ini_vigencia || ""} className='input input-sm' placeholder='Fecha Inicio' onChange={handleChange} required/>
              </td>
            </tr>
            <tr>
              <td className='font-semibold'>
                Fecha Fin
              </td>
              <td>
              <input type='datetime-local' name="fecha_fin_vigencia" value={formData.fecha_fin_vigencia || ""} className='input input-sm' placeholder='Fecha Fin' onChange={handleChange} required/>
              </td>
            </tr>
        </tbody>
      </table>
    }
        </div>
          <div className="flex justify-center gap-4">
            <button type="submit" className="btn btn-primary text-white" disabled={checkForm}>Guardar</button>
            <div type='button' className="btn" onClick={()=>document.getElementById('modalCrearFormulario').close()}>Cerrar</div>
          </div>
        </div>
        </div>
      
    </form>
    </dialog>

    </div>
    );
  }