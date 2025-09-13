'use client';
import { useState, useEffect } from 'react';

export default function ModificarContacto({contacto, setContacto, setOnChange, formData, setFormData}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formDataContacto, setFormDataContacto] = useState(contacto);
    const [rowRoles, setRowRoles] = useState(false);
    const [rowTipoDoc, setRowTipoDoc] = useState(false);
    const [checkForm, setCheckForm] = useState(true);

    useEffect(() => {
      function check() {
        if(formDataContacto && formDataContacto.nombre_contacto && (formDataContacto.telefono || formDataContacto.celular)) setCheckForm(false)
        else setCheckForm(true)
      }
      check();
    }, [formDataContacto]);

    const handleChange = (e) => {
       setFormDataContacto({ ...formDataContacto, [e.target.name]: e.target.value });
      };

      useEffect(() => {
        async function fetchData() {
          try {
            const [tdc, rol] = await Promise.all([
              fetch("/api/tipo_doc"),
              fetch("/api/roles"),
            ]);
    
            if (!tdc.ok || !rol.ok) throw new Error("Error al obtener los datos");
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

      useEffect(() => {
        function update() {
          setFormDataContacto(contacto)
        }
        update();
      }, [contacto]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          setCheckForm(true)
          const response = await fetch('/api/contactos/leads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formDataContacto),
          });
      
          const text = await response.text();
          setContacto("")
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
      <div className="flex justify-center w-full">

      <div className="min-h-96 w-full">
          <div className=" text-primary pb-2">Modificar Contacto: {formDataContacto.nombre_completo_contacto}</div>
          <div className='grid gap-2'>
          {formDataContacto &&
        <div className='grid lg:flex gap-2'>
        <table className='w-full'>
          <tbody>
          <tr>
            <td className='pr-1'>
            <div className='text-sm font-semibold'>Tipo Documento</div>
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
          <div className='text-sm font-semibold'>Nombre</div>
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
          <div className='text-sm font-semibold'>Apellido 1</div>
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
        <td className='pr-1'>
          <div className='text-sm font-semibold'>Email</div>
          <input
                type='text'
                name="email_contacto"
                className='input input-sm'
                onChange={handleChange}
                value={formDataContacto.email_contacto}
              />
          </td>
        </tr>
        <tr>
        <td className='pr-1'>
          <div className='text-sm font-semibold'>Indicativo Telefono</div>
          <input
                type='text'
                name="indicativo"
                className='input input-sm'
                onChange={handleChange}
                value={formDataContacto.indicativo}
              />
          </td>
        </tr>
        <tr>
            <td className='pr-1'>
            <div className='text-sm font-semibold'>Rol</div>
              {rowRoles &&
              <select onChange={handleChange} name='id_rol' className='select select-sm' value={formDataContacto.id_rol}>
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
              <div className='text-sm font-semibold'>Documento</div>
              <input
                type='text'
                name="numero_doc_contacto"
                className='input input-sm'
                onChange={handleChange}
                value={formDataContacto.numero_doc_contacto}
              />
            </td>
        </tr>
        <tr>
          <td>
          <div className='text-sm font-semibold'>Apellido 2</div>
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
          <td>
          <div className='text-sm font-semibold'>Cargo</div>
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
          <div className='text-sm font-semibold'>Celular</div>
          <input
                type='text'
                name="celular"
                className='input input-sm'
                onChange={handleChange}
                value={formDataContacto.celular}
              />
          </td>
        </tr>
        <tr>
          <td>
          <div className='text-sm font-semibold'>Telefono</div>
          <input
                type='text'
                name="telefono"
                className='input input-sm'
                onChange={handleChange}
                value={formDataContacto.telefono}
              />
          </td>
        </tr>
        <tr>
            <td>
          <div className='text-sm font-semibold'>Observaciones</div>
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
         }
        </div>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={handleSubmit} type="button" className="btn-primary btn btn-sm text-white" disabled={checkForm}>Guardar</button>
            <button onClick={()=>setContacto("")} className="btn btn-sm">Cancelar</button>
          </div>
        </div>
        
        </div>
    );
  }