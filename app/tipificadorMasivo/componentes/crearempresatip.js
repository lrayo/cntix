'use client';

import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { DateTime } from 'luxon';

export default function CrearEmpresaTip({setOnChange}) {
    
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowSegMer, setRowSegMer] = useState(false);
  const [rowSegRel, setRowSegRel] = useState();
  const [rowTipoDoc, setRowTipoDoc] = useState(false);
  const [rowCiudades, setRowCiudades] = useState(false);
  const [rowSectores, setRowSectores] = useState(false);
  const [rowFuenteTipo, setRowFuenteTipo] = useState(false);
  const [paises, setPaises] = useState(false);
  const [departamentos, setDepartamentos] = useState(false);
  const [departamentoFiltro, setDepartamentoFiltro] = useState(false);
  const [ciudadFiltro, setCiudadFiltro] = useState(false);
  const [checkForm, setCheckForm] = useState(true);
  const { data: session } = useSession();
  const fechaBogota = DateTime.now()
  .setZone('America/Bogota')
  .toFormat('yyyy-MM-dd HH:mm:ss');

  useEffect(() => {
    function check() {
      if(formData && formData.nombre_comercial && formData.telefono1 && formData.numero_doc) 
        setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

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
            setFormData({ id_usuario: session.user.usuario, fecha_llamada: fechaBogota });
          
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
    }, [session.user.usuario]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      document.getElementById('modalCrearEmpresaTip').close();
      const loadingToast = toast.loading("Creando empresa... ⏳");
      try {
        const response = await fetch('/api/empresas/agentes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setFormData({ id_usuario: session.user.usuario, fecha_llamada: fechaBogota });
        const text = await response.text();
        setOnChange(Math.random()) 
        //console.log("Respuesta del servidor:", text);
        const data = JSON.parse(text); 
        if (response.ok) {
          toast.update(loadingToast, {
            render: "Empresa creada con éxito",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          
        } else {
          toast.update(loadingToast, {
            render: `Error: ${data.error || "No se pudo crear la empresa"}`,
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
 // console.log(formData)
    return (
    <div className="flex justify-center">
      <button type="button" onClick={()=>document.getElementById('modalCrearEmpresaTip').showModal()} 
              className="btn btn-sm btn-primary text-white">Crear Empresa</button>
      <dialog id="modalCrearEmpresaTip" className="modal">
      <form onSubmit={handleSubmit}>
      <div className="modal-box w-11/12 max-w-5xl">
      
      <div className="bg-base-100">
      <div className="text-xl text-primary pb-4">Crear Empresa:</div>
      <div className='grid gap-2 p-4'>

     <div className='grid lg:flex lg:gap-2'>
      <table className="w-full">
      <tbody>
        <tr>
          <td className='pr-2 col-span-2'>
          <span className="text-sm font-bold"><span className='text-red-600'>* </span>Nombre Comercial <span className='text-xs text-gray-700'>(como se conoce la empresa)</span></span>
            <input disabled={status} type="text" name='nombre_comercial' placeholder="Nombre Comercial" className="w-full input input-sm" onChange={handleChange} value={formData.nombre_comercial || ""} />
          </td>
        </tr>
        <tr>
        <td className="pr-2">
          <span className='text-sm font-semibold '>Tipo Documento</span>
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
          <td className=" pr-2">
          <span className="text-sm font-bold"><span className='text-red-600'>* </span>Teléfono 1</span>
            <div className="gap-1 flex">
              <input disabled={status} type="number" name='telefono1' placeholder="Teléfono 1" className="input input-sm w-full" onChange={handleChange} value={formData.telefono1 || ""} />
            </div>
          </td>
        </tr>
        <tr>
          <td className=" pr-2">
          <span className="text-sm font-semibold">Email</span>
            <input disabled={status} type="email" name='email' placeholder="Email" className="w-full input input-sm " onChange={handleChange} value={formData.email || ""} />
          </td>
        </tr>
          <tr>
            <td className=" pr-2">
            <span className='text-sm font-semibold '>Segmento Mercado</span>
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
          <td className=" pr-2">
          <span className='text-sm font-semibold '>Pais</span>
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
          <td className="pr-2">
          <span className='text-sm font-semibold '>Ciudad</span>
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
          <td className=" pr-2">
          <span className="text-sm font-bold">Barrio</span>
            <input disabled={status} type="text" name='barrio' placeholder="Barrio" className="w-full input input-sm " onChange={handleChange} value={formData.barrio || ""} />
          </td>
      </tr>
      <tr>
        <td className=''>
        <div className='text-sm font-semibold'>Fuente Source</div>
          <select onChange={handleChange} name='fuentesource' className='select select-sm w-full' defaultValue={formData.fuentesource || ""}>
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

    <table className="w-full">
      <tbody>
        <tr>
          <td>
          <span className="text-sm font-bold">Razón Social <span className='text-xs text-gray-700'>(como esta en el RUT)</span></span>
          <input disabled={status} type="text" name='nombre_razonsocial' placeholder="Razón Social" className="w-full input input-sm " onChange={handleChange} value={formData.nombre_razonsocial || ''} />
        </td> 
        </tr>
        <tr>
          <td >
              <span className="text-sm font-bold"><span className='text-red-600'>* </span>Número de Documento</span>
              <div className="gap-1 flex">
              <input disabled={status} type="text" name='numero_doc' placeholder="Número de Documento" className="flex-1 input input-sm " onChange={handleChange} value={formData.numero_doc || ""} />
              <input disabled={status} type="numer" name='digito_verifica' placeholder="DV" className="flex-1 input input-sm " onChange={handleChange} value={formData.digito_verifica || ''} />
              </div>
          </td>
        </tr>
        <tr>
          <td className="" >
          <span className="text-sm font-bold">Teléfono 2</span>
          <div className="gap-1 flex">
            <input disabled={status} type="number" name='telefono2' placeholder="Teléfono 2" className="input input-sm w-full" onChange={handleChange} value={formData.telefono2 || ""} />
            </div>
          </td>
        </tr>

        <tr>
          <td className=" pr-2">
          <span className='text-sm font-semibold '>Tipo Cliente</span>
          {rowFuenteTipo &&
            <select onChange={handleChange} name='id_clientetipo' className='select select-sm w-full' 
            value={formData.id_clientetipo || ""} disabled={status}>
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
           <td >
          <span className='text-sm font-semibold '>Segmento Relacional</span>
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
          <td>
          <span className='text-sm font-semibold '>Departameto</span>
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
          <td>
          <span className="text-sm font-bold">Dirección</span>
            <input disabled={status} type="text" name='direccion_negocio' placeholder="Dirección" className="w-full input input-sm " onChange={handleChange} value={formData.direccion_negocio || ""} />
          </td>
        </tr>
        <tr>        
        {rowSectores &&
          <td className=''>
          <div className='text-sm font-semibold'>Sector Economico</div>
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
        }
      </tr>
      </tbody>
    </table>
    </div>
  </div>
    <div className="flex justify-center gap-4">
      <button type="submit" className="btn btn-primary btn-sm text-white" disabled={checkForm}>Guardar</button>
        <div className="btn btn-sm" onClick={()=> document.getElementById('modalCrearEmpresaTip').close()}>Cerrar</div>
        </div>
        </div>
        </div>
      </form>
    </dialog>
  </div>
    );
  }