'use client';

import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function ModificarCampana({idCampana, setOnChange}) {

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowFuentes, setRowFuentes] = useState([]);
    const [rowAgentes, setRowAgentes] = useState([]);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [fue, age, cam] = await Promise.all([
            fetch("/api/sources"),
            fetch("/api/usuarios"),
            fetch(`/api/campanas/id?id=${idCampana}`),
          ]);
  
          if (!fue.ok && !age.ok && !cam.ok) throw new Error("Error al obtener los datos");
        
          const data1 = await fue.json();
          const data2 = await age.json();
          const data = await cam.json();

          setFormData(data[0]);
          setRowFuentes(data1);
          setRowAgentes(data2);
          setLoading(false);
        } catch (err) {
          setError(err.message);
        }
      }
      fetchData();
    }, [idCampana]);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const loadingToast = toast.loading("Modificando campaña... ⏳");
      try {
        const response = await fetch('/api/campanas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        document.getElementById('modalModificarCampana').close();
        //setFormData({});
        const text = await response.text();
        setOnChange(Math.random()) 
        //console.log("Respuesta del servidor:", text);
  
        const data = JSON.parse(text); 
        if (response.ok) {
          toast.update(loadingToast, {
            render: "Campaña modificada con éxito",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          
        } else {
          toast.update(loadingToast, {
            render: `Error: ${data.error || "No se pudo modificar la campaña"}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.update(loadingToast, {
          render: "Error al contactar al servidor",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };
//console.log(formData)
    return (
    <div className="flex justify-center">
        <dialog id="modalModificarCampana" className="modal">
        {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box w-11/12 max-w-5xl">
        <div className="p-6 bg-base-100 ">
          <div className="text-xl text-primary pb-4">Modificar Campaña</div>
          <div className='grid gap-2 p-4'>
        {formData &&
      <table className='table w-full'>
        <tbody>
        <tr>
            <td className='font-semibold'>Source</td>
            <td className=''>
              <select onChange={handleChange} name='id_source' className='select select-sm' value={formData.id_source || ""}>
                <option value=''>Seleccione...</option>
                {rowFuentes.map((item) => (
                  <option key={item.id_source} value={item.id_source}>
                    {item.nombre_razonsocial}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Usuario Admin</td>
            <td className=''>
              <select onChange={handleChange} name='id_usradmin' className='select select-sm' value={formData.id_usradmin || ""}>
                <option value=''>Seleccione...</option>
                {rowAgentes.map((item) => (
                  <option key={item.id_usuario} value={item.id_usuario}>
                    {item.email}
                  </option>
                ))}
              </select>
            </td>
          </tr>
            <tr>
              <td className='font-semibold w-1/4'>Nombre</td>
              <td>
                <input
                  type='text'
                  name="nombre"
                  className='input input-sm'
                  onChange={handleChange}
                  value={formData.nombre}
                />
              </td>
            </tr>
        </tbody>
      </table>
    }
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleSubmit} type="button" className="btn btn-primary text-white">Guardar</button>
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