"use client";
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import Tipificar from "./tipificar";
import { Headset, CopyPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Stats from "./stats";
import { DateTime } from "luxon";
import CrearEmpresaTip from "./componentes/crearempresatip";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TipificadorPage() {
  const [rowData, setRowData] = useState([]);
  const [rowDataAuto, setRowDataAuto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const [idProgDet, setIdProgDet] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState(1);
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "tipificaciones",
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
        
        const res = await fetch("/api/programaciones/agente?id="+session.user.usuario);
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

  function abrirTipificador (value) {
    setIdProgDet(value)
    document.getElementById('modalTipificador').showModal()
  }

  async function copiarEmpresasPropias(value){
    if(confirm("Desea copiar la empresa a EMPRESAS PROPIAS")){
      const loadingToast = toast.loading("Copiando empresa... ⏳");
      try {
        value.id_programacion = process.env.NEXT_PUBLIC_ID_PROGRAMACION_EMPRESAS
        const data2 = [value]
        const response = await fetch('/api/programaciones/detalle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data2),
        });
        const text = await response.text();
        setOnChange(Math.random()) 
        const data = JSON.parse(text); 
        if (response.ok) {
          toast.update(loadingToast, {
            render: "Empresa copiada con éxito",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          
        } else {
          toast.update(loadingToast, {
            render: `Error: ${data.error || "No se pudo copiar la empresa"}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }  catch (error) {
        toast.update(loadingToast, {
          render: "Error al contactar al servidor",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  }

  const [colDefs] = useState([
    {
      headerName: "Tipificar",
      field: "id_progdet",
      width: 100,
      cellRenderer: ( value ) => (
      <div className="flex gap-4"> 
        <div className="flex justify-center cursor-pointer mt-2 hover:text-primary" onClick={()=>abrirTipificador(value.value)}>
          <Headset />
        </div>
        <div className="flex justify-center cursor-pointer mt-2 hover:text-primary" onClick={()=>copiarEmpresasPropias(value.data)}>
          <CopyPlus />
        </div>
      </div>
      ),
    },
    { field: "nombre_comercial", headerName: "Nombre Comercial", width:350 ,sortable: true},
    { field: "numero_doc", headerName: "Numero de Documento", sortable: true},
    { field: "nombre", headerName: "Programacion", sortable: true },
    { field: "telefono1", headerName: "Telefono 1", sortable: true },
    { field: "telefono2", headerName: "Telefono 2", sortable: true },
    { field: "fecha_llamada", headerName: "Fecha Llamada", 
      valueFormatter: (params) => {return convertirGMT5(params.value) }, sortable: true },
    { field: "intentos_llamada", headerName: "Llamadas", sortable: true },
    {
      headerName: "Estado Llamada",
      field: "estado_llamada",
      sortable: true,
      cellRenderer: ({ value }) => (
        <div className="flex justify-center mt-2 cursor-pointer">
          {value == "p" ? "Pendiente" : value == "e" ? "Efectiva" : value == "n" ? "No Efectiva" : "No Contactado"}
        </div>
      ),
    },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const convertirGMT5 = (fecha) => {
  return DateTime.fromISO(fecha, { zone: "utc" }) 
    .setZone("America/Bogota") 
    .toFormat("yyyy-MM-dd HH:mm:ss"); 
};

  return (
    <div className="p-6 bg-base-100 text-black ">

      {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && autorizado &&(
    <div style={{ height: 450, width: "100%" }}>
      <div className="hidden lg:flex lg:justify-center">
        <Stats rowData={rowData} />
      </div>
        <div className="flex gap-4 justify-between">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Tipificador</h1>
        <CrearEmpresaTip setOnChange={setOnChange} />
      </div>
      <div className="tabs tabs-box w-auto justify-center mb-6">
        <input type="radio" name="my_tabs_2er" className="tab" aria-label="Personales" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        <input type="radio" name="my_tabs_2er" className="tab" aria-label="Automaticos"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
      </div>
       <Tipificar idProgDet={idProgDet} setIdProgDet={setIdProgDet} setOnChange={setOnChange} />
        {tab == 1 && (
        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            />
        )}

      {tab == 2 && (
        <AgGridReact
            rowData={rowDataAuto}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            />
        )}

    </div>
      )}
    </div>
  );
}
