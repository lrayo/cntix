"use client";
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import CrearFormulario from "./crearformulario";
import ModificarFormulario from "./modificarformulario";
import { Trash2, FilePenLine, Cog, ChartPie } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import ConfigurarFormulario from "./configurarformulario";
import VerFormulario from "./verformulario";
import { DateTime } from "luxon";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Formularios() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const [idFormulario, setIdFormulario] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "formularios",
    id_rol: session?.user?.rol || "",
    id_campana: session?.user?.campana || ""
}), [session]);

const convertirGMT5 = (fecha) => {
  return DateTime.fromISO(fecha, { zone: "utc" }) 
    .setZone("America/Bogota") 
    .toFormat("yyyy-MM-dd HH:mm:ss"); 
};

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
        const res = await fetch("/api/formularios");
        if (!res.ok) throw new Error("Error al obtener los datos");
        const data = await res.json();
        setRowData(data);
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
      field: "id_formulario",
      width: 150,
      cellRenderer: ({ value }) => (
        <div className="flex justify-center mt-2 gap-2 ">
          <div className="cursor-pointer hover:text-primary" onClick={()=>modificar(value)}>
            <FilePenLine />
          </div>
          <div className="cursor-pointer hover:text-primary" onClick={()=>configurar(value)}>
            <Cog />
          </div>
          <div className="cursor-pointer hover:text-primary" onClick={()=>ver(value)}>
          <ChartPie />
        </div>
        {
        session.user.rol === 'admin' && (
        <div className="cursor-pointer  hover:text-error" onClick={()=>eliminar(value)}>
          <Trash2 />
        </div>
          )
        }
        </div>
      ),
    },
    { field: "cod_formulario", headerName: "Codigo", sortable: true},
    { field: "nombre_formulario", headerName: "Nombre", sortable: true },
    { field: "descrip_formulario", headerName: "Descripcion", sortable: true },
    { field: "fecha_ini_vigencia", headerName: "Inicio Vigencia", 
      valueFormatter: (params) => {return convertirGMT5(params.value)}, sortable: true },
    { field: "fecha_fin_vigencia", headerName: "Fin Vigencia", 
      valueFormatter: (params) => {return convertirGMT5(params.value)}, sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const eliminar = async (id) => {
  const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?");
  if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución

  try {
      const res = await fetch(`/api/formularios?id=${id}`, {
          method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.error || "Error al eliminar");
      }
      setOnChange(id)
      alert("Registro eliminado");
  } catch (error) {
      console.error(error);
      alert("Error al eliminar el registro");
  }
};

function modificar(id) {
  setIdFormulario(id)
  document.getElementById('modalModificarFormulario').showModal()
}

function configurar(id) {
  setIdFormulario(id)
  document.getElementById('modalConfigurarFormulario').showModal()
}

function ver(id) {
  setIdFormulario(id)
  document.getElementById('modalVerFormulario').showModal()
}

  return (
    <div className="p-4 bg-base-100 text-black ">

      {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && autorizado &&(
    <div style={{ height: 450, width: "100%" }}>
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Formularios</h1>
      </div>
      <div className="flex gap-4 justify-end pb-4">
        <CrearFormulario setOnChange={setOnChange}/>
        <ModificarFormulario idFormulario={idFormulario} setOnChange={setOnChange}/>
        <ConfigurarFormulario idFormulario={idFormulario}/>
        <VerFormulario idFormulario={idFormulario} setIdFormulario={setIdFormulario} />
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
    </div>
  );
}
