"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Stats from "./stats";
import { Search, FilePenLine } from "lucide-react";
import EditarInfo from "../zoho/editarinfo";
import VerRegistro from "./verregistro";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

export default function ReportesPage() {
  const [rowData, setRowData] = useState([]);
  const [rowDataLogs, setRowDataLogs] = useState([]);
  const [rowTotal, setRowTotal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selRegistro, setSelRegistro] = useState(false);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const gridRef = useRef(null);
  const [tab, setTab] = useState(1);
  const modulo = useMemo(() => ({
    modulo: "reportes",
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
        const res = await fetch("/api/registro_llamadas/view");
        const res2 = await fetch("/api/issabel");

        if (!res.ok && !res2.ok) throw new Error("Error al obtener los datos");

        const data = await res.json();
        const data2 = await res2.json();

        setRowData(data);
        setRowDataLogs(data2);
        setRowTotal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onChange, session.user.rol, session.user.id_usuario]);

  const [colDefs] = useState([
    {
      headerName: "Ver",
      field: "id_regllamada",
      width: 100,
      cellRenderer: (params) => (
        <div className="flex gap-4 justify-center">
          <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>verRegistro(params.data)}>
            <Search />
          </div>
          <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>modRegistro(params.data)}>
            <FilePenLine />
          </div>
        </div>
      ),
    },
    { field: "id_regllamada", headerName: "Id", hide: true},
    { field: "sys_fechamod", headerName: "Fecha", 
      valueFormatter: (params) => {return new Date(params.value).toISOString().slice(0, 19).replace("T", " ") }, sortable: true },
    { field: "numero_doc", headerName: "Numero de Documento", sortable: true},
    { field: "nombre_comercial", headerName: "Nombre Comercial", width:350 ,sortable: true},
    { field: "nombre", headerName: "Agente", sortable: true },
    { field: "nombre_programacion", headerName: "Nombre Programacion", sortable: true },
    { field: "nombre_completo_contacto", headerName: "Nombre Contacto", sortable: true },
    { field: "contesto_sn", headerName: "Contesto S/N", 
      valueFormatter: (params) => {return params.value == "s" ? "Si" : "No" }, sortable: true },
    { field: "llamada_efectiva_sn", headerName: "Llamada Efectiva S/N", 
      valueFormatter: (params) => {return params.value == "s" ? "Si" : "No" }, sortable: true },
    { field: "respuesta_llamada", headerName: "Respuesta Llamada", 
      valueFormatter: (params) => {
        if(params.value == "NoDecisiones")return "No es tomador de decisiones"
        if(params.value == "NoExiste")return "Numero no existe"
        if(params.value == "ContactoEfectivo")return "Contacto Efectivo"
        if(params.value == "ContestaCuelga")return "Contesta y Cuelga"
        if(params.value == "LlamarDespues")return "Llamar Despues"
        if(params.value == "TelefonoErrado")return "Telefono Errado"
        if(params.value == "Buzon")return "Buzon de Voz"
        if(params.value == "NoContesta")return "No Contesta"
       }, sortable: true },
    { field: "numero_llamada", headerName: "Numero Llamada", valueFormatter: (params) => {return Number(params.value) || params.value}, sortable: true },
    { field: "id_contacto_llamada", headerName: "id_contacto_llamada", sortable: true },
    { field: "id_empresalead", headerName: "id_empresalead", sortable: true },
    { field: "observaciones", headerName: "Observaciones", sortable: true },
    { field: "efectiva", headerName: "Efectiva", valueFormatter: (params) => {return params.value ? "Si" : "No"}, sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

 const [colDefsLogs] = useState([
    { field: "telefono", headerName: "Telefono", sortable: true},
    { field: "estado_llamada", headerName: "Estado", sortable: true},
    { field: "agente", headerName: "Extension", sortable: true },
    { field: "nombre_usuario", headerName: "Agente", sortable: true },
    { field: "duracion", headerName: "Duracion", sortable: true },
    { field: "nombre_comercial", headerName: "Nombre Comercial", sortable: true },
  ]);

function verRegistro(data){
  setSelRegistro(data)
  document.getElementById('modalVerRegistro').showModal()
}

function modRegistro(data){
  setSelRegistro(data)
  document.getElementById('modalModRegistroInt').showModal()
}

const onBtnExport = useCallback(() => {
  gridRef.current.api.exportDataAsCsv({
    fileName: 'reporte.csv',
    columnSeparator: '|'
  });
}, []);

  return (
    <div className="p-6 bg-base-100 text-black ">
      {loading && autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && autorizado &&(
    <div style={{ height: 450, width: "100%" }}>
      <Stats rowTotal={rowTotal} setRowData={setRowData}/>
      <div className="flex gap-4 justify-between">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Reporte Llamadas</h1>
        {
          (session.user.rol == "super") &&
          <button className="btn btn-sm btn-primary text-white" onClick={onBtnExport}>Exportar</button>
        }
        
      </div>
      <VerRegistro registro={selRegistro} />
      <EditarInfo registro={selRegistro} setSelRegistro={setSelRegistro} setOnChange={setOnChange}/>

      <div className="tabs tabs-box w-auto justify-center mb-6">
        <input type="radio" name="my_tabs_2er" className="tab" aria-label="Registro Llamadas" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        <input type="radio" name="my_tabs_2er" className="tab" aria-label="Logs Issabel"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
      </div>
      {
        tab == 1 && 
        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            ref={gridRef}
            />
      }
      {
        tab == 2 && 
        <AgGridReact
            rowData={rowDataLogs}
            columnDefs={colDefsLogs}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            />
      }

    </div>
      )}
    </div>
  );
}
