'use client';
import { useState, useEffect, useMemo } from 'react';
import EmpresasForm from './form/empresaform';
import PersonasForm from './form/personaform';
import ComunForm from './form/comunform';
import AdicionalForm from './form/adicionalform';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function NuevaEmpresa() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowSegMer, setRowSegMer] = useState([]);
  const [rowSegRel, setRowSegRel] = useState([]);
  const [rowJuridica, setRowJuridica] = useState([]);
  const [rowClientes, setRowClientes] = useState([]);
  const [rowSectores, setRowSectores] = useState([]);
  const [formData, setFormData] = useState({});
  const [formDataAd, setFormDataAd] = useState({});
  const [selJuridica, setSelJuridica] = useState(false);
  const [rowTipoDoc, setRowTipoDoc] = useState(false);
  const [rowCiudades, setRowCiudades] = useState(false);
  const [rowFuenteTipo, setRowFuentesTipo] = useState(false);
  const [tab, setTab] = useState(1);
  const [checkForm, setCheckForm] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "empresas",
    id_rol: session?.user?.rol || "",
    id_campana: session?.user?.campana || ""
}), [session]);

useEffect(() => {
  async function checkPermisos() {
    if (session) {
      const response = await fetch("/api/usuarios/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modulo),
      });

      if (!response.ok) throw new Error("Error al obtener los datos");

      const data = await response.json();
      if (!data) {
        router.replace('/noautorizado');
      } else {
        setAutorizado(true);
      }
    }
  }
  checkPermisos();
}, [session, router, modulo]); 

  useEffect(() => {
    function check() {
      if(formData && formData.numero_doc && (formData.nombre_comercial || formData.nombre) && (formData.telefono1 || formData.telefono2)) setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [seg, jur, cli, tdc, pdc, ctp, sec] = await Promise.all([
          fetch("/api/segmentos"),
          fetch("/api/razon_juridica"),
          fetch("/api/sources"),
          fetch("/api/tipo_doc"),
          fetch("/api/ciudades"),
          fetch("/api/fuentes_tipo"),
          fetch("/api/sector_economico"),
        ]);

        if (!seg.ok && !jur.ok  && !cli.ok && !tdc.ok && !pdc.ok && !ctp.ok && !sec.ok) throw new Error("Error al obtener los datos");
        
        const data1 = await seg.json();
        const segmer = data1.filter(item => item.codigo_nivel === "segmer");
        const segrel = data1.filter(item => item.codigo_nivel === "segrel");

        const data2 = await jur.json();
        const data3 = await cli.json();
        const data4 = await tdc.json();
        const data5 = await pdc.json();
        const data6 = await ctp.json();
        const data7 = await sec.json();

        setRowSegMer(segmer);
        setRowSegRel(segrel);
        setRowJuridica(data2);
        setRowClientes(data3);
        setRowTipoDoc(data4);
        setRowCiudades(data5);
        setRowSectores(data7);
        setRowFuentesTipo(data6);

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
    if(e.target.name == "numero_doc") setFormDataAd({ ...formDataAd, [e.target.name]: e.target.value })
  };

  const handleChangeAd = (e) => {
    setFormDataAd({ ...formDataAd, [e.target.name]: e.target.value });
  };

  const handleChangeJuridica = (e) => {
    setSelJuridica(e.target.value );
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCheckForm(true)
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const response2 = await fetch('/api/empresas/infoadicional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataAd),
      });
  
      const text = await response.text(); 
      console.log("Respuesta del servidor:", text);
  
      if (!text) throw new Error("Respuesta vacía del servidor");
  
      const data = JSON.parse(text); 
      alert(data.message || 'Error en la inserción');
  
    } catch (error) {
      console.error('Error:', error);
      alert("Error al enviar los datos. Revisa la consola.");
    }
  };

  //console.log(formData)
  return (
    <div className='bg-white p-6'>
      {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}
    
      {!loading && autorizado &&
    <div>
      
    <h1 className="text-2xl font-bold mb-4 text-primary">Crear Empresa</h1>
    <select onChange={handleChangeJuridica} name='id_razon_juridica' className="select select-sm">
        <option value="">...Seleccione Tipo</option>
        {rowJuridica.map((juridica) => (
          <option key={juridica.id_razon_juridica} value={juridica.id_razon_juridica}>
            {juridica.desc_razon	}
          </option>
        ))}
      </select>
    
    {!loading && selJuridica !="" &&
    <form onSubmit={handleSubmit} className="flex flex-col pt-4">
      <div className="tabs tabs-box w-auto justify-center mb-6">
        <input type="radio" name="my_tabs_1" className="tab" aria-label="Información Basica" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        <input type="radio" name="my_tabs_1" className="tab" aria-label="Información Adicional"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
      </div>
      {tab == 1 &&
      <div className='flex'>
      {
        selJuridica && selJuridica == "2" &&
        <div className='flex justify-center w-full' >
          <EmpresasForm rowTipoDoc={rowTipoDoc} formData={formData} handleChange={handleChange}/>
        </div>
      }
      {
        selJuridica && selJuridica == "1" &&
        <div className='flex justify-center w-full' >
          <PersonasForm rowTipoDoc={rowTipoDoc} formData={formData} handleChange={handleChange}/>
        </div>
      }
      </div>
      }
      {
        tab == 2 &&
        <div className='grid grid-cols-2 justify-center'>
          <ComunForm rowClientes={rowClientes} rowSegMer={rowSegMer} rowSegRel={rowSegRel} rowCiudades={rowCiudades} rowSectores={rowSectores} formData={formData} setFormData={setFormData} rowFuenteTipo={rowFuenteTipo}/>
          <AdicionalForm formDataAd={formDataAd} handleChangeAd={handleChangeAd} />
        </div>
      }
        <div className='flex justify-center pt-4'>
          <button type="submit" className="btn btn-primary" disabled={checkForm}>Guardar</button>
        </div>
      
    </form>
     }
     </div>
     }
    </div>
  );
}