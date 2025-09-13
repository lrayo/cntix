'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function InfoBasica({ rowData }) {

  const [formData, setFormData] = useState(rowData[0]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowSegMer, setRowSegMer] = useState(false);
  const [rowSegRel, setRowSegRel] = useState();
  const [rowTipoDoc, setRowTipoDoc] = useState(false);
  const [rowCiudades, setRowCiudades] = useState(false);
  const [rowSectores, setRowSectores] = useState([]);
  const [rowFuenteTipo, setRowFuenteTipo] = useState(false);
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
          const [seg, tdc, pdc, ctp, sec] = await Promise.all([
            fetch("/api/segmentos"),
            fetch("/api/tipo_doc"),
            fetch("/api/ciudades"),
            fetch("/api/fuentes_tipo"),
            fetch("/api/sector_economico"),
          ]);
  
          if (!seg.ok && !tdc.ok && !pdc.ok && !ctp.ok && !sec.ok) throw new Error("Error al obtener los datos");
          
          const data1 = await seg.json();
          const segmer = data1.filter(item => item.codigo_nivel === "segmer");
          const segrel = data1.filter(item => item.codigo_nivel === "segrel");
          const data4 = await tdc.json();
          const ciudades = await pdc.json();
          const data6 = await ctp.json();
          const data7 = await sec.json();
  
            setRowSegMer(segmer);
            setRowSegRel(segrel);
            setRowTipoDoc(data4);
            setRowCiudades(ciudades);
            setCiudadFiltro(ciudades)
            setRowFuenteTipo(data6);
            setRowSectores(data7);

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
    const loadingToast = toast.loading("Actualizando Informacion");
    try {
      setStatus(true)
      const response = await fetch('/api/empresas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const text = await response.text(); // Lee el texto primero
      const data = JSON.parse(text); // Intenta parsear JSON

      if (response.ok) {
            toast.update(loadingToast, {
              render: "Información actualizada con éxito",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            
          } else {
            toast.update(loadingToast, {
              render: `Error: ${data.error || "No se pudo actualizar"}`,
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
  //console.log(formData)
  return (
    <div className="grid justify-center w-full">
      <div className="text-xl text-primary pb-4">Información Básica</div>
      <table className="table table-sm">
        <tbody>
     
            <tr>
              <td className="font-bold">Nombre Comercial:</td>
              <td className=" p-2">
                <input disabled={status} type="text" name='nombre_comercial' placeholder="Nombre Comercial" className="w-full input input-sm" onChange={handleChange} value={formData.nombre_comercial || ""} />
              </td>
            </tr>
      
            <tr>
              <td className="font-bold">Nombre:</td>
              <td>
              <input disabled={status} type="text" name='nombre' placeholder="Nombre" className="input input-sm" onChange={handleChange} value={formData.nombre || ""} />
              </td>
              <td>
              <input disabled={status} type="text" name='apellido_1' placeholder="Apellido 1" className="input input-sm" onChange={handleChange} value={formData.apellido_1 || ""} />
              </td>
              <td>
              <input disabled={status} type="text" name='apellido_2' placeholder="Apellido 2" className="input input-sm" onChange={handleChange} value={formData.apellido_2 || ""} />  
              </td>
            </tr>
    
          <tr>
            <td className="font-bold">Número de Documento:</td>
            <td className=" p-2 gap-1 flex">
              <input disabled={status} type="text" name='numero_doc' placeholder="Número de Documento" className="flex-1 input input-sm " onChange={handleChange} value={formData.numero_doc || ""} />
              <input disabled={status} type="text" name='digito_verifica' placeholder="DV" className="flex-1 input input-sm " onChange={handleChange} value={formData.digito_verifica || ''} />
            </td>
          </tr>
          <tr>
            <td className="font-bold">Razón Social:</td>
            <td className=" p-2">
              <input disabled={status} type="text" name='nombre_razonsocial' placeholder="Razón Social" className="w-full input input-sm " onChange={handleChange} value={formData.nombre_razonsocial || ''} />
            </td>
          </tr>
          <tr>
            <td className="font-bold">Email:</td>
            <td className=" p-2">
              <input disabled={status} type="text" name='email' placeholder="Email" className="w-full input input-sm " onChange={handleChange} value={formData.email || ""} />
            </td>
          </tr>
          <tr>
            <td className='font-semibold '>Tipo Cliente/Fuente</td>
            <td className=" p-2">
            {rowFuenteTipo &&
              <select onChange={handleChange} name='id_sourcefuentetipo' className='select select-sm w-full' 
              value={formData.id_sourcefuentetipo || ""} disabled={status}>
                <option value=''>Seleccione...</option>
                {rowFuenteTipo.map((item) => (
                  <option key={item.id_sourcefuentetipo} value={item.id_sourcefuentetipo}>
                    {item.des_tipofuente}
                  </option>
                ))}
              </select>
              }
            </td>
          </tr>
            <tr>
              <td className='font-semibold '>Segmento Mercado</td>
              <td className=" p-2">
              {rowSegMer &&
                <select onChange={handleChange} name='segmento_mercado_cod_segmento' className='select select-sm w-full' 
                  value={formData.segmento_mercado_cod_segmento || ""} disabled={status}>
                  <option value=''>Seleccione...</option>
                  {rowSegMer.map((segmento) => (
                    <option key={segmento.id_segjerrec} value={segmento.id_segjerrec}>
                      {segmento.descnivel_rec}
                    </option>
                  ))}
                </select>
                }
              </td>
            </tr>
            <tr>
            <td className='font-semibold '>Segmento Relacional</td>
            <td className=" p-2">
            {rowSegRel && 
              <select onChange={handleChange} name='segmento_relacional_cod_segmento' className='select select-sm w-full'
              value={formData.segmento_relacional_cod_segmento || ""} disabled={status}>
                <option value=''>Seleccione...</option>
                {rowSegRel.map((segmento) => (
                  <option key={segmento.id_segjerrec} value={segmento.id_segjerrec}>
                    {segmento.descnivel_rec}
                  </option>
                ))}
              </select>
              }
            </td>
          </tr>
          <tr>
            <td className='font-semibold '>Tipo Documento</td>
            <td className=" p-2">
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
            <td className='font-semibold '>Pais</td>
            <td className=" p-2">
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
            <td className='font-semibold '>Departameto</td>
            <td className=" p-2">
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
            <td className='font-semibold '>Ciudad</td>
            <td className="p-2">
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
          {rowSectores &&
          <tr>
            <td className='font-semibold'>Sector Economico</td>
            <td className=''>
              <select onChange={handleChange} name='id_sector' className='select select-sm w-full' 
              value={formData.id_sector || ""} disabled={status}>
                <option value=''>Seleccione...</option>
                {rowSectores.map((sector) => (
                  <option key={sector.id_sector} value={sector.id_sector}>
                    {sector.desc_sector}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          }
          <tr>
            <td className="font-bold">Dirección:</td>
            <td className="p-2">
              <input disabled={status} type="text" name='direccion_negocio' placeholder="Dirección" className="w-full input input-sm " onChange={handleChange} value={formData.direccion_negocio || ""} />
            </td>
          </tr>
          <tr>
            <td className="font-bold">Barrio:</td>
            <td className=" p-2">
              <input disabled={status} type="text" name='barrio' placeholder="Barrio" className="w-full input input-sm " onChange={handleChange} value={formData.barrio || ""} />
            </td>
          </tr>
          <tr>
            <td className="font-bold">Teléfono 1:</td>
            <td className=" p-2 gap-1 flex">
              <input disabled={status} type="text" name='ind_telefono1' placeholder="Indicativo" className="w-1/4 input input-sm " onChange={handleChange} value={formData.ind_telefono1 || ""} />
              <input disabled={status} type="text" name='telefono1' placeholder="Teléfono 1" className="w-3/4 input input-sm " onChange={handleChange} value={formData.telefono1 || ""} />
            </td>
          </tr>
          <tr>
            <td className="font-bold">Teléfono 2:</td>
            <td className=" p-2 gap-1 flex" >
              <input disabled={status} type="text" name='ind_telefono2' placeholder="Indicativo" className="w-1/4 input input-sm" onChange={handleChange} value={formData.ind_telefono2 || ""} />
              <input disabled={status} type="text" name='telefono2' placeholder="Teléfono 2" className="w-3/4 input input-sm" onChange={handleChange} value={formData.telefono2 || ""} />
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Fuente Source</td>
            <td className=''>
              <select onChange={handleChange} disabled={status} name='fuentesource' className='select select-sm' defaultValue={formData.fuentesource || ""}>
                <option value=''>Seleccione...</option>
                <option value='CARTERIZADOS CLARO'>CARTERIZADOS CLARO</option>
                <option value='CONECTIX'>CONECTIX</option>
                <option value='SOHO'>SOHO</option>
                <option value='UNIFICADA'>UNIFICADA</option>
                <option value='BARRIDO'>BARRIDO</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-center gap-4 pt-6">
        {!status ? (
          <div className="flex gap-4">
            <button className="btn btn-primary" onClick={handleSubmit}>Guardar</button>
            <button className="btn" onClick={() => setStatus(true)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => setStatus(false)}>Modificar</button>
        )}
      </div>
    </div>
  );
}