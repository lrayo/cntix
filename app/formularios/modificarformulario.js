'use client';
import { useState, useEffect } from 'react';

export default function ModificarFormulario({idFormulario, setOnChange}) {

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkForm, setCheckForm] = useState(true);

    useEffect(() => {
      function check() {
        if(formData && formData.cod_formulario && formData.nombre_formulario) 
          setCheckForm(false)
        else setCheckForm(true)
      }
      check();
    }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [form] = await Promise.all([
            fetch(`/api/formularios/id?id=${idFormulario}`),
          ]);
  
          if (!form.ok) throw new Error("Error al obtener los datos");
        
          const data = await form.json();

          setFormData(data[0]);
          //new Date(formData.fecha_ini_vigencia).toISOString().replace("T", " ").split(".")[0]
          
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [idFormulario]);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setCheckForm(true);
        const response = await fetch('/api/formularios', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        document.getElementById('modalModificarFormulario').close();
        //setFormData({});
        const text = await response.text();
        setOnChange(Math.random()) 
        //console.log("Respuesta del servidor:", text);
        if (!text) throw new Error("Respuesta vacía del servidor");
    
        const data = JSON.parse(text); 
        alert(data.message || 'Error en la inserción');
    
      } catch (error) {
        console.error('Error:', error);
        alert("Error al enviar los datos. Revisa la consola.");
      }
    };

    function formatDate(date){
      return new Date(date).toISOString().replace("T", " ").split(".")[0]
    }

return (
  <div className="flex justify-center">
  <dialog id="modalModificarFormulario" className="modal">
  {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
  <form onSubmit={handleSubmit} className=' w-11/12 justify-center flex'>
  <div className="modal-box w-11/12 max-w-5xl ">
  <div className="p-6 bg-base-100">
    <div className="text-xl text-primary pb-4">Modificar Formulario: {idFormulario}</div>
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
        <input type='datetime-local' name="fecha_ini_vigencia" value={formatDate(formData.fecha_ini_vigencia) || ""} className='input input-sm' placeholder='Fecha Inicio' onChange={handleChange} required/>
        </td>
      </tr>
      <tr>
        <td className='font-semibold'>
          Fecha Fin
        </td>
        <td>
        <input type='datetime-local' name="fecha_fin_vigencia" value={formatDate(formData.fecha_fin_vigencia) || ""} className='input input-sm' placeholder='Fecha Fin' onChange={handleChange} required/>
        </td>
      </tr>
  </tbody>
</table>
}
  </div>
    <div className="flex justify-center gap-4">
      <button type="submit" className="btn btn-primary text-white" disabled={checkForm}>Guardar</button>
      <button type='button' className="btn" onClick={()=>document.getElementById('modalModificarFormulario').close()}>Cerrar</button>
    </div>
  </div>
  </div>

</form>
}
</dialog>

</div>
);
}