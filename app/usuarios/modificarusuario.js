'use client';
import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ModificarUsuario({idUsuario, setOnChange}) {

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkForm, setCheckForm] = useState(true);
    const [rowRoles, setRowRoles] = useState({});
    const [rowCampanas, setRowCampanas] = useState([]);

    useEffect(() => {
      function check() {
        if(formData && formData.email) 
          setCheckForm(false)
        else setCheckForm(true)
      }
      check();
    }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);

          const [rol, res, cam] = await Promise.all([
            fetch("/api/usuarios/roles"),
            fetch(`/api/usuarios/id?id=${idUsuario}`),
            fetch("/api/campanas"),
          ]);

          if (!rol.ok && !res.ok && !cam.ok) throw new Error("Error al obtener los datos");
          const data = await res.json();
          const data1 = await rol.json();
          const data2 = await cam.json();
          setRowRoles(data1);
          setFormData(data[0]);
          setRowCampanas(data2);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [idUsuario]);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        setCheckForm(true)
        document.getElementById('modalModificarUsuario').close();
        const loadingToast = toast.loading("Modificando Usuario... ⏳");
        const response = await fetch('/api/usuarios', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        //setFormData({});
        const text = await response.text();
        setOnChange(Math.random()) 
        //console.log("Respuesta del servidor:", text);
        if (!text) throw new Error("Respuesta vacía del servidor");
    
         const data = JSON.parse(text); 
        if (response.ok) {
          toast.update(loadingToast, {
            render: "usuario modificado con éxito",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          
        } else {
          toast.update(loadingToast, {
            render: `Error: ${data.error || "No se pudo modificar el usuario"}`,
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

  if (error) {
    return (
      <div className="p-6 bg-base-100 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }
//console.log(formData)
    return (
    <div className="flex justify-center">
        <dialog id="modalModificarUsuario" className="modal">
        {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box w-11/12 max-w-5xl">
        <div className="p-6 bg-base-100 ">
          <div className="text-xl text-primary pb-4">Modificar Usuario: {idUsuario}</div>
          <div className='grid gap-2 p-4'>
        {formData && rowRoles &&
      <table className='table w-full'>
        <tbody>
        <tr>
            <td className='font-semibold'>Rol</td>
            <td className=''>
              <select onChange={handleChange} name='id_rol' className='select select-sm' value={formData.id_rol || ""}>
                <option value=''>Seleccione...</option>
                {rowRoles.map((item) => (
                  <option key={item.id_rol} value={item.id_rol}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
             <td className='font-semibold'>Campaña</td>
            <td className=''>
              <select onChange={handleChange} name='id_campana' className='select select-sm' value={formData.id_campana || ""}>
                <option value=''>Seleccione...</option>
                {rowCampanas.map((item) => (
                  <option key={item.id_campana} value={item.id_campana}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        {[
            { label: 'Nombre', name: 'nombre', value: `${formData.nombre}` },
            { label: 'Email', name: 'email', value: `${formData.email}` },
            { label: 'Ext', name: 'ext', value: `${formData.ext}` },
          ].map((field) => (
            <tr key={field.name}>
              <td className='font-semibold w-1/4'>{field.label}</td>
              <td>
                <input
                  type='text'
                  name={field.name}
                  className='input input-sm rounded '
                  onChange={handleChange}
                  value={field.value}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    }
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleSubmit} type="button" className="text-white btn btn-primary" disabled={checkForm}>Guardar</button>
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