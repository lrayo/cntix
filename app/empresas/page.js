"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
import { Trash2, FilePenLine } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import ImportarEmpresas from "./importar/importarempresas";
import ActualizarDatos from "./importar/actualizardatos";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

export default function EmpresasPage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const gridRef = useRef(null);
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
    async function fetchData() {
      try {
        const res = await fetch("/api/empresas");
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
      field: "id_empresalead",
      width: 100,
      cellRenderer: ({ value }) => (
        <div className="flex gap-2 justify-center">
        <a href={`/empresas/detalle?id=${value}`} className="flex justify-center hover:text-primary mt-2">
          <FilePenLine />
        </a>
        {
        session.user.rol === 'admin' && (
        <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>eliminarRegistro(value)}>
          <Trash2 />
        </div>
        )
      }
        </div>
      ),
    },
    { field: "id_empresalead", headerName: "Id Empresa", sortable: true },
    { field: "numero_doc", headerName: "Numero de Documento", sortable: true},
    { field: "nombre_razonsocial", headerName: "Razon Social", sortable: true},
    { field: "nombre_comercial", headerName: "Nombre Comercial", width:350 ,sortable: true},
    { field: "email", headerName: "Email", sortable: true },
    { field: "pais", headerName: "Pais", sortable: true },
    { field: "departamento", headerName: "Departamento", sortable: true },
    { field: "ciudad", headerName: "Ciudad", sortable: true },
    { field: "direccion_negocio", headerName: "Direccion", sortable: true },
    { field: "telefono1", headerName: "Telefono 1", sortable: true },
    { field: "telefono2", headerName: "Telefono 2", sortable: true },
    { field: "fuentesource", headerName: "Fuente", sortable: true },
    { field: "sys_usrcrea", headerName: "Usuario Creacion", sortable: true },
    { field: "sys_fechacrea", headerName: "Fecha Creacion", valueFormatter: (params) => {return new Date(params.value).toISOString().slice(0, 19).replace("T", " ") }, sortable: true },
    { field: "efectiva", headerName: "Efectiva", valueFormatter: (params) => {return params.value ? "Si" : "No"}, sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const eliminarRegistro = async (id) => {
  const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?");
  if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución

  try {
      const res = await fetch(`/api/empresas?id=${id}`, {
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

const onBtnExport = useCallback(() => {
  gridRef.current.api.exportDataAsCsv({
    fileName: 'reporteEmpresas.csv',
    columnSeparator: '|'
  });
}, []);

  return (
    <div className="p-6 bg-base-100 text-black ">
      {loading && autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && autorizado &&(
    <div style={{ height: 500, width: "100%" }}>
      <ImportarEmpresas setOnChange={setOnChange} />
      <ActualizarDatos setOnChange={setOnChange} />
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Lista de Empresas / Leads</h1>
      </div>
      {
        session.user.rol === 'admin' && (
          <div className="flex gap-4 justify-end pb-4">
            <button className="btn btn-sm text-white" onClick={()=>document.getElementById('modalImportarEmpresa').showModal()}>Importar</button>
            <button className="btn btn-sm text-white" onClick={()=>document.getElementById('modalActualizarDatos').showModal()}>Actualizar CSV</button>
            {session.user.rol === ('super' || 'admin' || 'gtr') && 
            <a href="/empresas/nueva" className=" justify-end">
              <button className="btn btn-sm btn-primary text-white">Crear Empresa</button>
            </a>
            }
            {
              (session.user.rol == "admin") &&
              <button className="btn btn-sm btn-primary text-white" onClick={onBtnExport}>Exportar</button>
            }
          </div>
        )
      }
        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef}
            enableCellTextSelection={true}
            ref={gridRef}
            />
    </div>
      )}
    </div>
  );
}
