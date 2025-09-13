'use client';

import { useState, useEffect } from 'react';

export default function CrearContactoTip({idEmpresa, setOnChange, formData, setFormData}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formDataContacto, setFormDataContacto] = useState({
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

    const handleChange = (e) => {
       setFormDataContacto({ ...formDataContacto, [e.target.name]: e.target.value });
      };

      useEffect(() => {
        function check() {
          if(formDataContacto && formDataContacto.nombre_contacto && formDataContacto.apellido_1_contacto && (formDataContacto.telefono || formDataContacto.celular)) setCheckForm(false)
          else setCheckForm(true)
        }
        check();
      }, [formDataContacto]);

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
        try {
          setCheckForm(true)
          const response = await fetch('/api/contactos/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formDataContacto),
          });

          const text = await response.text();
          const data = JSON.parse(text); 

          setFormData({ ...formData, 
            contactos_creados: [...formData.contactos_creados, formDataContacto.numero_doc_contacto]
           });
          // console.log(formData.contactos_creados)
          setFormDataContacto({
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
      
          setOnChange(Math.random()) 
          //console.log("Respuesta del servidor:", text);
          if (!text) throw new Error("Respuesta vacía del servidor");
      
          alert(data.message || 'Error en la inserción');
      
        } catch (error) {
          console.error('Error:', error);
          alert("Error al enviar los datos. Revisa la consola.");
        }
      };
     // console.log(formDataContacto)
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

  <div className="min-h-96 ">
  <div className='grid gap-2 p-2'>
  {formDataContacto &&
  <form onSubmit={handleSubmit}>
  <div className='grid lg:flex gap-2'>
  <table className='w-full'>
  <tbody>
  <tr>
      <td className='pr-1'>
      <span className='text-sm font-semibold'>Tipo Documento</span>
        {rowTipoDoc &&
        <select onChange={handleChange} name='id_tipo_doc' className='select select-sm' value={formDataContacto.id_tipo_doc}>
          <option value=''>Seleccione...</option>
          {rowTipoDoc.map((documento) => (
            <option key={documento.id_tipodoc} value={documento.id_tipodoc}>
              {documento.nombre_doc}
            </option>
          ))}
        </select>
        }
      </td>
      </tr>
  <tr>
  <td className='pr-1'>
    <span className='text-sm font-semibold'>Nombre</span>
    <input
          type='text'
          name="nombre_contacto"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.nombre_contacto}
        />
    </td>
  </tr>
  <tr>
  <td className='pr-1'>
    <span className='text-sm font-semibold'>Apellido 2</span>
    <input
          type='text'
          name="apellido_2_contacto"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.apellido_2_contacto}
        />
    </td>
  </tr>
  <tr>
  <td className='pr-1'>
    <span className='text-sm font-semibold'>Email</span>
    <input
          type='email'
          name="email_contacto"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.email_contacto}
        />
    </td>
  </tr>
  <tr>
  <td className='pr-1'>
    <span className='text-sm font-semibold'>Indicativo Telefono</span>
    <input
          type='number'
          name="indicativo"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.indicativo}
        />
    </td>
  </tr>
  <tr>
      <td className='pr-1'>
      <span className='text-sm font-semibold'>Rol</span>
        {rowRoles &&
        <select onChange={handleChange} name='id_rol' className='select select-sm w-full'>
          <option value=''>Seleccione...</option>
          {rowRoles.map((documento) => (
            <option key={documento.id_rol} value={documento.id_rol}>
              {documento.desc_rol}
            </option>
          ))}
        </select>
        }
      </td>
  </tr>
  </tbody>
  </table>

  <table className='w-full'>
  <tbody>
  <tr>
      <td>
        <span className='text-sm font-semibold'>Documento</span>
      <input
            type='number'
            name="numero_doc_contacto"
            className='input input-sm'
            onChange={handleChange}
            value={formDataContacto.numero_doc_contacto}
            required
          />
      </td>
  </tr>
  <tr>
    <td>
    <span className='text-sm font-semibold'>Apellido 1</span>
    <input
          type='text'
          name="apellido_1_contacto"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.apellido_1_contacto}
        />
    </td>
  </tr>
  <tr>
    <td>
    <span className='text-sm font-semibold'>Cargo</span>
    <input
          type='text'
          name="cargo"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.cargo}
        />
    </td>
  </tr>
  <tr>
    <td>
    <span className='text-sm font-semibold'>Celular</span>
    <input
          type='number'
          name="celular"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.celular}
        />
    </td>
  </tr>
  <tr>
    <td>
    <span className='text-sm font-semibold'>Telefono</span>
    <input
          type='number'
          name="telefono"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.telefono}
        />
    </td>
  </tr>
  <tr>
    <td>
    <span className='text-sm font-semibold'>Observaciones</span>
    <input
          type='text'
          name="observaciones"
          className='input input-sm'
          onChange={handleChange}
          value={formDataContacto.observaciones}
        />
    </td>
  </tr>
  </tbody>
  </table>

  </div>
  <div className="flex justify-center gap-4 mt-4">
      <button type="submit" 
        className="btn btn-sm bg-primary text-white" disabled={checkForm}>
          Guardar
      </button>
    </div>
  </form>
  }
    </div>

  </div>
  </div>
    );
  }