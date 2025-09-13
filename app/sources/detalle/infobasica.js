import { useState, useEffect, useMemo } from 'react';

export default function InfoBasica({ rowData }) {

  const [formData, setFormData] = useState(rowData[0] || []);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowTipoDoc, setRowTipoDoc] = useState(false);
  const [rowCiudades, setRowCiudades] = useState(false);
  const [paises, setPaises] = useState(false);
  const [departamentos, setDepartamentos] = useState(false);
  const [departamentoFiltro, setDepartamentoFiltro] = useState(false);
  const [ciudadFiltro, setCiudadFiltro] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

   const handleChangePais = (e) => {
      if (e.target.value) {
      const filtrado = departamentos.filter((item) => Number(item.PaisID) === Number(e.target.value));
      const paisesFiltrados = paises.filter((pais) => Number(pais.PaisID) === Number(e.target.value));
      setDepartamentoFiltro(filtrado);

      if(paisesFiltrados.length > 0){
        setFormData({...formData, [e.target.name]: e.target.value, "pais": paisesFiltrados[0].Pais, "departamento":"", "id_departamento":"" , "ciudad":"", "id_ciudad":"" });
      }
      
    }else {
        setDepartamentoFiltro(departamentos);
      }
    };
  
    const handleChangeDepartamento = (e) => {
      if (e.target.value) {
      const filtrado = rowCiudades.filter((ciudad) => Number(ciudad.DivisionID) === Number(e.target.value));
      const departFiltrados = departamentos.filter((item) => Number(item.DivisionID) === Number(e.target.value));
      setCiudadFiltro(filtrado);
      setFormData({...formData, [e.target.name]: e.target.value, "departamento": departFiltrados[0].Division, "ciudad":"", "id_ciudad":"" });
      }else {
        setCiudadFiltro(rowCiudades);
      }
    };
  
    const handleChangeCiudad = (e) => {
      if (e.target.value) {
      const filtrado = rowCiudades.filter((ciudad) => Number(ciudad.CiudadID) === Number(e.target.value));
      setFormData({...formData, [e.target.name]: e.target.value, "ciudad": filtrado[0].Ciudad});
    };
    };

    useEffect(() => {
      async function fetchData() {
        try {
          
          const [tdc, ciu] = await Promise.all([
            fetch("/api/tipo_doc"),
            fetch("/api/ciudades"),
          ]);
  
          if (!ciu.ok && !tdc.ok) throw new Error("Error al obtener los datos");
           
          const data4 = await tdc.json();
          const ciudades = await ciu.json();
  
            setRowTipoDoc(data4);
            setRowCiudades(ciudades);
            setCiudadFiltro(ciudades)

          const paises = [...new Map(ciudades.map(item => [item.PaisID, item])).values()];
          setPaises(paises)
          const depart = [...new Map(ciudades.map(item => [item.DivisionID, item])).values()];
          setDepartamentos(depart)
          setDepartamentoFiltro(depart)
  
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
      setStatus(true)
      const response = await fetch('/api/sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const text = await response.text(); // Lee el texto primero
      console.log("Respuesta del servidor:", text); // 👀 Verifica qué devuelve el servidor
  
      if (!text) throw new Error("Respuesta vacía del servidor");
  
      const data = JSON.parse(text); // Intenta parsear JSON
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
  //console.log(formData)
  return (
    <div className="p-4">
      <div className="text-xl text-primary pb-4">Información Básica</div>
      <table className="w-full table">
        <tbody>
            <tr>
              <td className="font-bold">Nombre Comercial:</td>
              <td className="">
                <input disabled={status} type="text" name='nombre_comercial' placeholder="Nombre Comercial" className="w-full input input-sm" onChange={handleChange} value={formData.nombre_comercial || ""} />
              </td>
            </tr>
          <tr>
            <td className="font-bold">Número de Documento:</td>
            <td className="gap-1 flex">
              <input disabled={status} type="text" name='numero_doc' placeholder="Número de Documento" className="flex-1 input input-sm " onChange={handleChange} value={formData.numero_doc || ""} />
              <input disabled={status} type="text" name='dv' placeholder="DV" className="flex-1 input input-sm " onChange={handleChange} value={formData.dv || ''} />
            </td>
          </tr>
          <tr>
            <td className="font-bold ">Razón Social:</td>
            <td className="">
              <input disabled={status} type="text" name='nombre_razonsocial' placeholder="Razón Social" className="w-full input input-sm " onChange={handleChange} value={formData.nombre_razonsocial || ''} />
            </td>
          </tr>
          <tr>
            <td className="font-bold ">Email:</td>
            <td className="">
              <input disabled={status} type="text" name='email' placeholder="Email" className="w-full input input-sm " onChange={handleChange} value={formData.email || ""} />
            </td>
          </tr>
          <tr>
            <td className='font-semibold '>Tipo Documento</td>
            <td className="">
            {rowTipoDoc && 
              <select onChange={handleChange} name='id_tipo_doc' className='select select-sm w-full'
              value={formData.id_tipo_doc || ""} disabled={status}>
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
            <td className='font-semibold'>Pais</td>
            <td className="">
            {paises &&
              <select onChange={handleChangePais} name='id_pais' className='select select-sm w-full'
                value={Number(formData.id_pais) || ''} disabled={status}>
                <option value=''>Seleccione...</option>
                {paises.map((pais) => (
                  <option key={pais.PaisID} value={pais.PaisID}>
                    {pais.Pais}
                  </option>
                ))}
              </select>
            }
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Departameto</td>
            <td className="">
            {departamentoFiltro &&
              <select onChange={handleChangeDepartamento} name='id_departamento' className='select select-sm w-full'
              value={formData.id_departamento || ""} disabled={status}>
                <option value=''>Seleccione...</option>
                {departamentoFiltro.map((dep) => (
                  <option key={dep.DivisionID} value={dep.DivisionID}>
                    {dep.Division}
                  </option>
                ))}
              </select>
               }
            </td>
          </tr>
          <tr>
            <td className=' font-semibold '>Ciudad</td>
            <td className="">
            {ciudadFiltro &&
              <select onChange={handleChangeCiudad} name='id_ciudad' className='select select-sm w-full'
              value={formData.id_ciudad || ""} disabled={status}>
                <option value=''>Seleccione...</option>
                {ciudadFiltro.map((ciudad) => (
                  <option key={ciudad.CiudadID} value={ciudad.CiudadID}>
                    {ciudad.Ciudad}
                  </option>
                ))}
              </select>
              }
            </td>
          </tr>
          <tr>
            <td className="font-bold ">Dirección:</td>
            <td className="">
              <input disabled={status} type="text" name='direccion' placeholder="Dirección" className="w-full input input-sm " onChange={handleChange} value={formData.direccion || ""} />
            </td>
          </tr>
          <tr>
            <td className="font-bold ">Zip Code:</td>
            <td className="">
              <input disabled={status} type="text" name='zip_code' placeholder="Zip Code" className="w-full input input-sm " onChange={handleChange} value={formData.zip_code || ""} />
            </td>
          </tr>
          <tr>
            <td className="font-bold ">Teléfono:</td>
            <td className="gap-1 flex">
              <input disabled={status} type="text" name='indicativo_tel' placeholder="Indicativo" className="w-1/4 input input-sm " onChange={handleChange} value={formData.indicativo_tel || ""} />
              <input disabled={status} type="text" name='telefono' placeholder="Teléfono 1" className="w-3/4 input input-sm " onChange={handleChange} value={formData.telefono || ""} />
            </td>
          </tr>
          <tr>
            <td className="font-bold ">Celular:</td>
            <td className=" gap-1 flex" >
              <input disabled={status} type="text" name='celular' placeholder="Celular" className="w-full input input-sm" onChange={handleChange} value={formData.celular || ""} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-center gap-4 pt-6">
        {!status ? (
          <div className="flex gap-4">
            <button className="btn btn-primary text-white" onClick={handleSubmit}>Guardar</button>
            <button className="btn" onClick={() => setStatus(true)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn btn-primary text-white" onClick={() => setStatus(false)}>Modificar</button>
        )}
      </div>
    </div>
  );
}
