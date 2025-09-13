'use client';

import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function CrearProgramacion({setOnChange}) {
    
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowCampanas, setRowCampanas] = useState([]);
  const [rowFormularios, setRowFormularios] = useState([]);
  const [checkForm, setCheckForm] = useState(true);

  useEffect(() => {
    function check() {
      if(formData && formData.nombre && formData.id_campana) 
        setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [camp, form] = await Promise.all([
            fetch("/api/campanas"),
            fetch("/api/formularios"),
          ]);
  
          if (!camp.ok && !form.ok) throw new Error("Error al obtener los datos");
        
          const data1 = await camp.json();
          const data2 = await form.json();

          setRowCampanas(data1);
          setRowFormularios(data2);
  
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, []);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        document.getElementById('modalCrearProgramacion').close();
        const loadingToast = toast.loading("Asignando leads... ⏳");
        try {
          setCheckForm(true)
          const response = await fetch('/api/programaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          
          setFormData({});
          const text = await response.text();
          setOnChange(Math.random()) 
          //console.log("Respuesta del servidor:", text);
     
          const data = JSON.parse(text); 
      
          if (response.ok) {
            toast.update(loadingToast, {
              render: "Programacion creada con éxito",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            
          } else {
            toast.update(loadingToast, {
              render: `Error: ${data.error || "No se pudo crear la programacion"}`,
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
          }
        } catch (error) {
          toast.update(loadingToast, {
            render: "Error al conectar con el servidor 🚨",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        };
      }

    return (
    <div className="flex justify-center">
        <button type="button" onClick={()=>document.getElementById('modalCrearProgramacion').showModal()} 
                className="btn btn-primary btn-sm text-white">Crear Programacion</button>
        <dialog id="modalCrearProgramacion" className="modal">
        {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box w-11/12 max-w-5xl">
        <div className="p-6 bg-base-100">
          <div className="text-xl text-primary pb-4">Crear Programacion:</div>
          <div className='grid gap-2 p-2'>
        {formData &&
      <table className='table'>
        <tbody>
        <tr>
            <td className='font-semibold'>Campaña</td>
            <td className=''>
              <select onChange={handleChange} name='id_campana' className='select select-sm' defaultValue={formData.id_campana || ""}>
                <option value=''>Seleccione...</option>
                {rowCampanas.map((item) => (
                  <option key={item.id_campana} value={item.id_campana}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Formulario</td>
            <td className=''>
              <select onChange={handleChange} name='id_formulario' className='select select-sm' defaultValue={formData.id_formulario || ""}>
                <option value=''>Seleccione...</option>
                {rowFormularios.map((item) => (
                  <option key={item.id_formulario} value={item.id_formulario}>
                    {item.nombre_formulario}
                  </option>
                ))}
              </select>
            </td>
          </tr>
            <tr>
              <td className='font-semibold w-1/4'>Nombre</td>
              <td>
                <input
                  type='text' name="nombre" className='input input-sm'
                  onChange={handleChange}
                  value={formData.nombre || ""}
                />
              </td>
            </tr>
            <tr>
              <td className='font-semibold w-1/4'>Descripcion</td>
              <td>
                <input
                  type='text' name="descripcion" className='input input-sm'
                  onChange={handleChange}
                  value={formData.descripcion || ""}
                />
              </td>
            </tr>
        </tbody>
      </table>
    }
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleSubmit} type="button" className="btn btn-primary text-white" disabled={checkForm}>Guardar</button>
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