'use client';
import { useState, useEffect, useMemo } from 'react';
import ComunForm from '../form/comunform';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function NuevaFuente() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState([]);
  const [rowTipoDoc, setRowTipoDoc] = useState(false);
  const [rowCiudades, setRowCiudades] = useState(false);
  const [checkForm, setCheckForm] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "sources",
    id_rol: session?.user?.rol || ""
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
      if(formData && formData.numero_doc && formData.nombre_comercial && formData.telefono) setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tdc, ciu ] = await Promise.all([
          fetch("/api/tipo_doc"),
          fetch("/api/ciudades"),
        ]);

        if (!tdc.ok && !ciu.ok) throw new Error("Error al obtener los datos");
        
        const data1 = await tdc.json();
        const data2 = await ciu.json();

        setRowCiudades(data2);
        setRowTipoDoc(data1);

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
      setCheckForm(true);
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  return (
    <div className='bg-white p-6'>
    {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
    {error && <p className="text-red-500">Error: {error}</p>}
    {!loading && autorizado &&
    <div  className="">
        <h1 className="text-2xl font-bold mb-4 text-primary">Crear Source</h1>
        <ComunForm rowTipoDoc={rowTipoDoc} rowCiudades={rowCiudades} formData={formData} setFormData={setFormData}/>
      <button type="button" className="btn btn-primary text-white" onClick={handleSubmit} disabled={checkForm}>Guardar</button>
    </div>
    }
    </div>
  );
}