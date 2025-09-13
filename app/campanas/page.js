"use client";
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import CrearCampana from "./crearcampana";
import ModificarCampana from "./modificarcampana";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Trash2, FilePenLine } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Campanas() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const [idCampana, setIdCampana] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "campanas",
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
        const res = await fetch("/api/campanas");
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
      headerName: "Editar",
      field: "id_campana",
      width: 100,
      cellRenderer: ({ value }) => (
        <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>modificar(value)}>
          <FilePenLine />
        </div>
      ),
    },
    { field: "id_campana", headerName: "Id Campaña", sortable: true},
    { field: "nombre", headerName: "Nombre", sortable: true },
    {
      headerName: "Eliminar",
      field: "id_campana",
      width: 100,
      cellRenderer: ({ value }) => (
        <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>eliminar(value)}>
          <Trash2 />
        </div>
      ),
    },
  ]);

const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const eliminar = async (id) => {
  const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?");
  if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución

  try {
      const res = await fetch(`/api/campanas?id=${id}`, {
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
  setIdCampana(id)
  document.getElementById('modalModificarCampana').showModal()
}

  return (
    <div className="p-6 bg-base-100 text-black ">
      {loading && !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}   

    {!loading && !error && autorizado &&(
    <div style={{ height: 450, width: "100%" }}>
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Campañas</h1>
      </div>
      <div className="flex gap-4 justify-end pb-4">
        <CrearCampana setOnChange={setOnChange}/>
        <ModificarCampana idCampana={idCampana} setOnChange={setOnChange}/>
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
