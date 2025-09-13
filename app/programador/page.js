"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
import CrearProgramacion from "./crearprogramacion";
import ModificarProgramacion from "./modificarprogramacion";
import { Building2, FilePenLine, ChartPie, Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import AsignarLeads from "./asignarleads";
import VerDetalles from "./verdetalles";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

export default function Programador() {
  const [rowData, setRowData] = useState([]);
  const [rowDataDet, setRowDataDet] = useState([]);
  const [barrido, setBarrido] = useState();
  const [contactados, setContactados] = useState();
  const [efectivos, setEfectivos] = useState();
  const fechaUTC = new Date();
  const [fechaIni, setFechaIni] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const [idProgramacion, setIdProgramacion] = useState(null);
  const [tab, setTab] = useState(1);
  const [base, setBase] = useState();
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const gridRef = useRef(null);
  const modulo = useMemo(() => ({
    modulo: "programaciones",
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
        const res = await fetch("/api/programaciones");
        const res2 = await fetch("/api/programaciones/detalle");
        if (!res.ok && !res2.ok) throw new Error("Error al obtener los datos");
        const data = await res.json();
        const data2 = await res2.json();
        setRowData(data);
        setBase(data2.length)
        setRowDataDet(data2);
        const barrido = data2.filter(item => item.intentos_llamada > 0).length
        setBarrido(barrido)
        const contactados = data2.filter(item => item.estado_llamada == "e" || item.estado_llamada == "n").length
        setContactados(contactados)
        const efectivos = data2.filter(item => item.estado_llamada == "e").length
        setEfectivos(efectivos)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onChange]);

  const [colDefs] = useState([
    {
      headerName: "Acciones",
      field: "id_programacion",
      width: 200,
      cellRenderer: ( value ) => (
      <div className="flex gap-4 justify-self-center mt-2">
        <div className="flex justify-center cursor-pointer hover:text-primary" onClick={()=>modificar(value.data.id_programacion)}>
          <FilePenLine />
        </div>
        <div className="flex justify-center cursor-pointer hover:text-primary" onClick={()=>asignarLeads(value.data.id_programacion)}>
          <Building2 />
        </div>
        <div className="flex justify-center cursor-pointer hover:text-primary" onClick={()=>verDetalles(value.data.id_programacion)}>
          <ChartPie />
        </div>
     {
      value.data.estado_programacion == 1 ?
      <div className="flex justify-center cursor-pointer hover:text-primary" onClick={()=>eliminar(value.data.id_programacion)}>
        <Eye />
      </div>:
        <div className="flex justify-center cursor-pointer hover:text-primary" onClick={()=>eliminar(value.data.id_programacion)}>
        <EyeOff />
      </div>
     }
      
      </div>
      ),
    },
    { field: "nombre", headerName: "Nombre Programacion", width:350, sortable: true },
    { field: "nombre_campana", headerName: "Campaña", sortable: true },
    { field: "descripcion", headerName: "Descripcion", sortable: true },
  ]);

  const [colDefsDet] = useState([
    { field: "nombre", headerName: "Nombre Programacion", width:350, sortable: true },
    { field: "nombre_usuario", headerName: "Agente", sortable: true },
    { field: "numero_doc", headerName: "Documento", sortable: true },
    { field: "nombre_comercial", headerName: "Nombre Comercial", sortable: true },
    { field: "intentos_llamada", headerName: "Cantidad Llamadas", sortable: true },
    { field: "estado_llamada", headerName: "Estado Llamada", 
      valueFormatter: (params) => {
        if(params.value == "p")return "Pendiente"
        if(params.value == "e")return "Efectiva"
        if(params.value == "n")return "No Efectiva"
        if(params.value == "x")return "No Contactado"
       }, sortable: true },
    { field: "estado_programacion", headerName: "Estado Programacion", sortable: true },
    { field: "id_empresalead", headerName: "Id Empresa", sortable: true },
    { field: "id_usuario", headerName: "Id Agente", sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const eliminar = async (id) => {
  const confirmacion = confirm("¿Estás seguro de que deseas mostrar/ocultar este registro?");
  if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución

  try {
      const res = await fetch(`/api/programaciones?id=${id}`, {
          method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.error || "Error al mostrar/ocultar");
      }
      setOnChange(Math.random());
     // alert("Registro eliminado");
  } catch (error) {
      console.error(error);
      alert("Error al mostrar/ocultar el registro");
  }
};

function verDetalles(id) {
  setIdProgramacion(id)
  document.getElementById('modalVerProgramacion').showModal()
}

function modificar(id) {
  setIdProgramacion(id)
  document.getElementById('modalModificarProgramacion').showModal()
}

function asignarLeads (value) {
  setIdProgramacion(value)
  document.getElementById('modalAsignarLeads').showModal()
}

const filtrarPorFecha = () => {
  // Convertimos las fechas a objetos Date
  const inicio = new Date(`${fechaIni}T00:00:00.000Z`).getTime();
  const fin = new Date(`${fechaFin}T23:59:59.999Z`).getTime();

  const filtro = rowDataDet.filter(item => {
    if (!item.sys_fechamod) return false; // Ignorar si es null
    // Convertimos sys_fechamod a objeto Date y quitamos la hora
    const fechaItem = new Date(item.sys_fechamod).getTime()
    //console.log(convertirGMT5(item.sys_fechamod))
    return fechaItem >= inicio && fechaItem <= fin;
  });

  const barrido = filtro.filter(item => item.intentos_llamada > 0).length
  setBarrido(barrido)
  const contactados = filtro.filter(item => item.estado_llamada == "e" || item.estado_llamada == "n").length
  setContactados(contactados)
  const efectivos = filtro.filter(item => item.estado_llamada == "e").length
  setEfectivos(efectivos)
  setBase(filtro.length)
};

const onBtnExport = useCallback(() => {
  gridRef.current.api.exportDataAsCsv({
    fileName: 'detalles_programacion.csv',
    columnSeparator: '|'
  });
}, []);

  return (
    <div className="p-6 bg-base-100 text-black ">
      {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && (
    <div style={{ height: 450, width: "100%" }}>
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Programaciones</h1>
      </div>
      <div className="tabs tabs-box w-auto justify-center mb-6">
        <input type="radio" name="my_tabs_1er" className="tab" aria-label="Programaciones" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        <input type="radio" name="my_tabs_1er" className="tab" aria-label="Detalles"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
        <input type="radio" name="my_tabs_1er" className="tab" aria-label="Informe Total"  checked={tab == 3 ?true:false} onChange={()=>setTab(3)}/>
      </div>
      {tab == 1 && (
        <div style={{ height: 450, width: "100%" }}>
        <div className="flex gap-4 justify-end pb-4">
          <CrearProgramacion setOnChange={setOnChange}/>
          <ModificarProgramacion idProgramacion={idProgramacion} setOnChange={setOnChange}/>
          <AsignarLeads idProgramacion={idProgramacion} setOnChange={setOnChange} />
          <VerDetalles idProgramacion={idProgramacion} setIdProgramacion={setIdProgramacion} />
        </div>
        
        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={20}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            enableCellTextSelection={true}
            />
        </div>
      )}
      {tab == 2 && (
        <div style={{ height: 450, width: "100%" }}>
        <div className="flex gap-4 justify-between">
          <h1 className="text-lg font-bold mb-4 text-primary flex gap-2">Detalle</h1>
          {/*<button className="btn btn-sm btn-primary text-white" onClick={onBtnExport}>Exportar</button>*/}
        </div>
        <AgGridReact
            rowData={rowDataDet}
            columnDefs={colDefsDet}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            enableCellTextSelection={true}
            ref={gridRef}
            />
        </div>
      )}
      {
        tab == 3 &&
        <div className='grid gap-2 p-4 mb-4'>
              <div className='flex gap-2 justify-center items-end'>
                <div className='flex flex-col'>
                  <div className='text-xs'>
                    Fecha Inicio
                  </div>
                  <input type='date' className='input input-sm' value={fechaIni} onChange={(e)=>setFechaIni(e.target.value)}/>
                </div>
                <div className='flex flex-col'>
                  <div className='text-xs'>
                    Fecha Fin
                  </div>
                  <input type='date' className='input input-sm' value={fechaFin} onChange={(e)=>setFechaFin(e.target.value)}/>
                </div>
                  <button className='btn btn-sm btn-primary' onClick={filtrarPorFecha}>Filtrar</button>
              </div>
              <div className='flex justify-center'>
              <table className='table table-sm w-3/4'>
                <thead>
                  <tr>
                    <td></td>
                    <td>Cantidad</td>
                    <td>Porcentaje</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='font-semibold'>Base</td>
                    <td className='font-semibold'>{base}</td>
                    <td className='font-semibold'></td>
                  </tr>
                  <tr>
                    <td>Barrido</td>
                    <td>{barrido || 0}</td>
                    <td>{((barrido/base)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td>Faltante</td>
                    <td>{(base - (barrido || 0))}</td>
                    <td>{(((base - (barrido || 0))/base)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td className='font-semibold'>Contactado</td>
                    <td className='font-semibold'>{contactados || 0}</td>
                    <td className='font-semibold'>{((contactados/base)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td>Efectivo</td>
                    <td>{efectivos || 0}</td>
                    <td>{((efectivos/base)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td>No Efectivo</td>
                    <td>{(contactados || 0) - (efectivos || 0)}</td>
                    <td>{((((contactados || 0) - (efectivos || 0))/rowDataDet.length)*100).toFixed(2)} %</td>
                  </tr>
                  <tr>
                    <td className='font-semibold'>No Contactado</td>
                    <td>{(barrido || 0) - (contactados || 0)}</td>
                    <td>{((((barrido || 0) - (contactados || 0))/rowDataDet.length)*100).toFixed(2)} %</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
      }
    </div>
      )}
    </div>
  );
}
