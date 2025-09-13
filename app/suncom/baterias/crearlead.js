'use client';

import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

export default function CrearLead({setOnChange}) {
    
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowSources, setRowSources] = useState([]);
  const [checkForm, setCheckForm] = useState(true);

  useEffect(() => {
    function check() {
      if(formData && formData.nombre_lead && formData.apellido_lead && formData.telefono && formData.direccion && formData.fecha_nacimiento) 
        setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          const [fue] = await Promise.all([
            fetch("/api/suncom/municipios"),
          ]);
  
          if (!fue.ok ) throw new Error("Error al obtener los datos");
        
          const data1 = await fue.json();

          setRowSources(data1);
  
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
        document.getElementById('modalCrearLead').close();
        setFormData({});
        
        const loadingToast = toast.loading("Creando Lead... ⏳");
        try {
          const response = await fetch('/api/suncom/baterias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          
          setOnChange(Math.random()) 
          const text = await response.text();
          
          //console.log("Respuesta del servidor:", text);
          const data = JSON.parse(text); 
          if (response.ok) {
            toast.update(loadingToast, {
              render: "Lead creado con éxito",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            
          } else {
            toast.update(loadingToast, {
              render: `Error: ${data.error || "No se pudo crear el lead"}`,
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
        <button type="button" onClick={()=>document.getElementById('modalCrearLead').showModal()} 
                className="btn btn-primary text-white">Crear Lead Baterias</button>
        <dialog id="modalCrearLead" className="modal">
          
        <div className="modal-box w-11/12 max-w-5xl">
         <form onSubmit={handleSubmit}>
        <div className="p-6 bg-base-100">
          <div className="flex justify-between items-center">

          <div className="text-2xl font-bold text-primary pb-4">Nuevo Lead</div>
                  <Image
                      src="/img/suncom.png"
                      alt="BPO logo"
                      width={150}
                      height={100}
                      priority
                      />
          </div>
          <div className='grid gap-2 p-4'>
        {formData &&
      <div className='flex justify-center items-center text-center'>
      <table className='table w-3/4'>
        <tbody>

            <tr>
              <td className='font-semibold w-1/4'>Nombre Cliente</td>
              <td>
                <input
                  type='text' name="nombre_lead" className='input input-sm'
                  onChange={handleChange}
                  value={formData.nombre_lead || ""}
                />
              </td>
            </tr>
            <tr>
              <td className='font-semibold w-1/4'>Apellido Cliente</td>
              <td>
                <input
                  type='text' name="apellido_lead" className='input input-sm'
                  onChange={handleChange}
                  value={formData.apellido_lead || ""}
                />
              </td>
            </tr>

            <tr>
              <td className='font-semibold w-1/4'>Ingresos Mensuales</td>
              <td>
                <input
                  type='number' name="ingresos_mensuales" className='input input-sm'
                  onChange={handleChange}
                  value={formData.ingresos_mensuales || ""}
                />
              </td>
            </tr>
                        <tr>
              <td className='font-semibold w-1/4'>Fecha Nacimiento</td>
              <td>
                <input
                  type='date' name="fecha_nacimiento" className='input input-sm'
                  onChange={handleChange}
                  value={formData.fecha_nacimiento || ""}
                />
              </td>
            </tr>
            <tr>
            <td className='font-semibold'>Municipio / Pueblo</td>
            <td className=''>
              <select onChange={handleChange} name='nombre_municipio' className='select select-sm' value={formData.nombre_municipio || ""}>
                <option value=''>Seleccione...</option>
                {rowSources.map((item) => (
                  <option key={item.id_munsuncom} value={item.nombre_municipio}>
                    {item.nombre_municipio}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
              <td className='font-semibold w-1/4'>Telefono</td>
              <td>
                <input
                  type='number' name="telefono" className='input input-sm'
                  onChange={handleChange}
                  value={formData.telefono || ""}
                />
              </td>
            </tr>
            <tr>
              <td className='font-semibold w-1/4'>Direccion</td>
              <td>
                <input
                  type='texto' name="direccion" className='input input-sm'
                  onChange={handleChange}
                  value={formData.direccion || ""}
                />
              </td>
            </tr>
          <tr>
              <td className='font-semibold w-1/4'>Observaciones</td>
              <td>
                <input
                  type='text' name="observaciones" className='input input-sm'
                  onChange={handleChange}
                  value={formData.observaciones || ""}
                />
              </td>
            </tr>

        </tbody>
      </table>
      </div>
    }
          </div>
          <div className="flex justify-center gap-4">
            <button type="submit" 
            className="btn btn-sm bg-primary text-white" disabled={checkForm}>
              Guardar
          </button>

          <div className="btn btn-sm" onClick={()=> document.getElementById('modalCrearLead').close()}>Cerrar</div>

          </div>
        </div>
        
        </form>
        </div>
    </dialog>
    </div>
    );
  }