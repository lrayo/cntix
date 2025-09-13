"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useSearchParams } from "next/navigation";
import InfoBasica from "./infobasica";
import Contactos from "./contactos";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DetalleFuente() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [tab, setTab] = useState(1);
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

  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [res1] = await Promise.all([
        fetch(`/api/sources/infobasica?id=${id}`),
      ]);

      if (!res1.ok) throw new Error("Error al obtener los datos");

      const [data1] = await Promise.all([res1.json()]);

      setRowData(data1);
      setLoading(false);
    } catch (err) {
      setError(err.message);
    } 
  }, [id]);

  // Ejecutar la obtención de datos cuando cambie el id
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !autorizado) {
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
    <div className="p-6 bg-base-100 text-black">
    {autorizado &&
      <div>
      <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Detalle de Source</h1>
      <div className="grid gap-4">
      <div className="tabs tabs-box w-auto justify-center mb-6">
        <input type="radio" name="my_tabs_1" className="tab" aria-label="Información Basica" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        <input type="radio" name="my_tabs_1" className="tab" aria-label="Contactos"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
      </div>
      {
        tab == 1 && rowData &&
        <InfoBasica rowData={rowData} />
      }
      {
        tab == 2 &&
        <Contactos id={id} />
      }
      </div>
      </div>
    }
    </div>
  );
}
