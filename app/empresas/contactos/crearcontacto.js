'use client';

import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function CrearContacto({idEmpresa, setOnChange}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
      id_empresalead: idEmpresa,
      id_tipo_doc: "",
      numero_doc_contacto: "",
      nombre_contacto: "",
      apellido_1_contacto: "",
      apellido_2_contacto: "",
      nombre_completo_contacto: "",
      cargo: "",
      email_contacto: "",
      celular: "",
      telefono: "",
      indicativo: "",
      id_rol: "",
      estado_empleads_contacto: "",
      observaciones: "",
    });
    const [rowRoles, setRowRoles] = useState(false);
    const [rowTipoDoc, setRowTipoDoc] = useState(false);
    const [checkForm, setCheckForm] = useState(true);

    useEffect(() => {
      function check() {
        if(formData && formData.nombre_contacto && formData.apellido_1_contacto && (formData.telefono || formData.celular)) setCheckForm(false)
        else setCheckForm(true)
      }
      check();
    }, [formData]);

    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      useEffect(() => {
        async function fetchData() {
          try {
    
            const [tdc, rol] = await Promise.all([
              fetch("/api/tipo_doc"),
              fetch("/api/roles"),
            ]);
    
            if ( !tdc.ok || !rol.ok) throw new Error("Error al obtener los datos");
              const [data1, data2] = await Promise.all([tdc.json(), rol.json()]);
              setRowTipoDoc(data1);
              setRowRoles(data2);

          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
        fetchData();
      }, []);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setCheckForm(true);
        document.getElementById('modalCrearContacto').close();
        const loadingToast = toast.loading("Creando Contacto");
        setFormData({
          id_empresalead: idEmpresa,
          id_tipo_doc: "",
          numero_doc_contacto: "",
          nombre_contacto: "",
          apellido_1_contacto: "",
          apellido_2_contacto: "",
          nombre_completo_contacto: "",
          cargo: "",
          email_contacto: "",
          celular: "",
          telefono: "",
          indicativo: "",
          id_rol: "",
          estado_empleads_contacto: "",
          observaciones: "",
        });
        try {
          const response = await fetch('/api/contactos/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
      
          const text = await response.text();
          setOnChange(Math.random()) 
          //console.log("Respuesta del servidor:", text);   
          const data = JSON.parse(text); 

          if (response.ok) {
            toast.update(loadingToast, {
              render: "Contacto creado con éxito",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            
          } else {
            toast.update(loadingToast, {
              render: `Error: ${data.error || "No se pudo crear"}`,
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

      if (loading) {
        return (
          <div className="p-6 bg-base-100 text-black flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="p-6 bg-base-100 text-red-500">
            <p>Error: {error}</p>
          </div>
        );
      }
 
    return (
    <div className="flex justify-center">
        <button type="button" onClick={()=>document.getElementById('modalCrearContacto').showModal()} className="btn btn-primary">Crear Contacto</button>
        <dialog id="modalCrearContacto" className="modal">
        <form onSubmit={handleSubmit}>
        <div className="modal-box w-11/12 min-w-5xl">
        <div className="p-6 bg-base-100 ">
          <div className="text-xl text-primary pb-4">Informacion de Contacto:</div>
          <div className='p-4'>
        {formData &&
        <table className='table table-sm'>
        <tbody>
        <tr>
            <td className='pr-1'>
            <div className='text-sm font-semibold'>Tipo Documento</div>
              {rowTipoDoc &&
              <select onChange={handleChange} name='id_tipo_doc' className='select select-sm' value={formData.id_tipo_doc} required>
                <option value=''>Seleccione...</option>
                {rowTipoDoc.map((documento) => (
                  <option key={documento.id_tipodoc} value={documento.id_tipodoc}>
                    {documento.nombre_doc}
                  </option>
                ))}
              </select>
              }
            </td>
            <td>
              <div className='text-sm font-semibold'>Documento</div>
              <input
                    type='text'
                    name="numero_doc_contacto"
                    className='input input-sm'
                    onChange={handleChange}
                    value={formData.numero_doc_contacto}
                    required
                  />
            </td>
        </tr>
        <tr>
        <td>
          <div className='text-sm font-semibold'>Nombre</div>
          <input
                type='text'
                name="nombre_contacto"
                className='input input-sm'
                onChange={handleChange}
                value={formData.nombre_contacto}
                required
              />
          </td>
          <td>
          <div className='text-sm font-semibold'>Apellido 1</div>
          <input
                type='text'
                name="apellido_1_contacto"
                className='input input-sm'
                onChange={handleChange}
                value={formData.apellido_1_contacto}
                required
              />
          </td>
        </tr>
        <tr>
        <td className='pr-1'>
          <div className='text-sm font-semibold'>Apellido 2</div>
          <input
                type='text'
                name="apellido_2_contacto"
                className='input input-sm'
                onChange={handleChange}
                value={formData.apellido_2_contacto}
              />
          </td>
          <td>
          <div className='text-sm font-semibold'>Cargo</div>
          <input
                type='text'
                name="cargo"
                className='input input-sm'
                onChange={handleChange}
                value={formData.cargo}
              />
          </td>
        </tr>
        <tr>
        <td className='pr-1'>
          <div className='text-sm font-semibold'>Email</div>
          <input
                type='email'
                name="email_contacto"
                className='input input-sm'
                onChange={handleChange}
                value={formData.email_contacto}
              />
          </td>
          <td>
          <div className='text-sm font-semibold'>Celular</div>
          <input
                type='number'
                name="celular"
                className='input input-sm'
                onChange={handleChange}
                value={formData.celular}
              />
          </td>
        </tr>
        <tr>
        <td className='pr-1'>
          <div className='text-sm font-semibold'>Indicativo Telefono</div>
          <input
                type='number'
                name="indicativo"
                className='input input-sm'
                onChange={handleChange}
                value={formData.indicativo}
              />
          </td>
          <td>
          <div className='text-sm font-semibold'>Telefono</div>
          <input
                type='number'
                name="telefono"
                className='input input-sm'
                onChange={handleChange}
                value={formData.telefono}
              />
          </td>
        </tr>
      
        <tr>
            <td >
            <div className='text-sm font-semibold'>Rol</div>
              {rowRoles &&
              <select onChange={handleChange} name='id_rol' className='select select-sm'>
                <option value=''>Seleccione...</option>
                {rowRoles.map((documento) => (
                  <option key={documento.id_rol} value={documento.id_rol}>
                    {documento.desc_rol}
                  </option>
                ))}
              </select>
              }
            </td>
            <td>
          <div className='text-sm font-semibold'>Observaciones</div>
          <input
                type='text'
                name="observaciones"
                className='input input-sm'
                onChange={handleChange}
                value={formData.observaciones}
              />
          </td>
        </tr>
        </tbody>
        </table>
      }
          </div>
          <div className="flex justify-center gap-4">
            <button type="submit" className="bg-primary w-32 hover:bg-blue-500 text-white p-2 rounded-md" disabled={checkForm}>Guardar</button>
            <div className="btn" onClick={()=>document.getElementById('modalCrearContacto').close()}>Cerrar</div>
           
          </div>
        </div>
        </div>
        </form>
    </dialog>
    </div>
    );
  }