"use client";
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import CrearLead from "./crearlead";
import { Headset } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TipificadorPage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "suncom",
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
    async function fetchData() {
      try {
        
        const res = await fetch("/api/suncom");
        const resAuto =  false //await fetch("/api/programaciones/auto");
        //if (!resAuto.ok) throw new Error("Error al obtener los datos");
        if (!res.ok) throw new Error("Error al obtener los datos");
        const data = await res.json();
        //const dataAuto = await resAuto.json();
        //setRowDataAuto(dataAuto);
        setRowData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onChange, session.user.usuario]);

  const [colDefs] = useState([
    { field: "nombre_lead", headerName: "Nombre", width:350 ,sortable: true},
    { field: "apellido_lead", headerName: "Apellido", sortable: true},
    { field: "municipio", headerName: "Municipio", sortable: true},
    { field: "observaciones", headerName: "Observaciones", sortable: true },
    { field: "telefono", headerName: "Telefono", sortable: true },
    { field: "sys_usrcrea", headerName: "Agente Creacion", sortable: true },
    { field: "sys_fechacrea", headerName: "Fecha Creacion", valueFormatter: (params) => {return new Date(params.value).toISOString().slice(0, 19).replace("T", " ") }, sortable: true },
    { field: "fecha_integracion", headerName: "Fecha Integracion CRM", valueFormatter: (params) => {return new Date(params.value).toISOString().slice(0, 19).replace("T", " ") }, sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

return (
    <div className="p-6 bg-base-100 text-black ">

      {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && autorizado &&(
    <div style={{ height: 450, width: "100%" }}>
      
      

      <div className="flex gap-4 justify-between pb-4 items-center">
        <Image
            src="/img/suncom.png"
            alt="BPO logo"
            width={150}
            height={100}
            priority
            />
        <CrearLead setOnChange={setOnChange}/>
      </div>

        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            />

    </div>
      )}
    </div>
  );
}
