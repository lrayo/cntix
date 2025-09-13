'use client';

import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function CrearCampana({setOnChange}) {
    
  const [formData, setFormData] = useState({});
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [rowSources, setRowSources] = useState([]);
  const [rowAgentes, setRowAgentes] = useState([]);
  const [checkForm, setCheckForm] = useState(true);

  useEffect(() => {
    function check() {
      if (formData?.nombre && formData?.id_usradmin && formData?.id_fuente) {
        setCheckForm(false);
      } else {
        setCheckForm(true);
      }
    }
    check();
  }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          const [fue, age] = await Promise.all([
            fetch("/api/sources"),
            fetch("/api/usuarios"),
          ]);
  
          if (!fue.ok && !age.ok) throw new Error("Error al obtener los datos");
        
          const data1 = await fue.json();
          const data2 = await age.json();

          setRowSources(data1);
          setRowAgentes(data2);
  
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
        document.getElementById('modalCrearCampana').close();
        
        const loadingToast = toast.loading("Creando campaña... ⏳");
        try {
          const response = await fetch('/api/campanas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          
          setFormData({});
          const text = await response.text();
          setOnChange(Math.random()) 
          const data = JSON.parse(text); 
          if (response.ok) {
            toast.update(loadingToast, {
              render: "Campaña creada con éxito",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            
          } else {
            toast.update(loadingToast, {
              render: `Error: ${data.error || "No se pudo crear la campaña"}`,
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

    return (
    <div className="flex justify-center">
        <button type="button" onClick={()=>document.getElementById('modalCrearCampana').showModal()} 
                className="btn btn-primary text-white">Crear Campaña</button>
        <dialog id="modalCrearCampana" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
        <div className="p-6 bg-base-100">
          <div className="text-xl text-primary pb-4">Crear Campaña:</div>
          <div className='grid gap-2 p-4'>
        {formData &&
      <table className='table'>
        <thead>
          <tr>
            <th className='w-1/4'>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='font-semibold'>Source</td>
            <td>
              <select
                onChange={handleChange}
                name='id_fuente'
                className='select select-sm'
                defaultValue={formData.id_fuente || ""}
              >
                <option value=''>Seleccione...</option>
                {rowSources.map((item) => (
                  <option key={item.id_source} value={item.id_source}>
                    {item.nombre_comercial}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td className='font-semibold'>Usuario Admin</td>
            <td>
              <select
                onChange={handleChange}
                name='id_usradmin'
                className='select select-sm'
                defaultValue={formData.id_usradmin || ""}
              >
                <option value=''>Seleccione...</option>
                {rowAgentes.map((item) => (
                  <option key={item.id_usuario} value={item.id_usuario}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td className='font-semibold'>Nombre</td>
            <td>
              <input
                type='text'
                name="nombre"
                className='input input-sm'
                onChange={handleChange}
                value={formData.nombre || ""}
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
    </dialog>
    </div>
    );
  }

  CrearCampana.propTypes = {
  setOnChange: PropTypes.func.isRequired, // valida que sea función obligatoria
  };

//   CrearCampana.propTypes = {
//   setOnChange: PropTypes.func,
// };

// CrearCampana.defaultProps = {
//   setOnChange: () => {}, // no hace nada si no se pasa
// };