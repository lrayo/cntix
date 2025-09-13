"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule, AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import jsonToCsvExport from "json-to-csv-export";

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

export default function TipificadorGenerico() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const gridRef = useRef(null);

  const exportCSV = () => {
    const filteredRows = [];
    gridRef.current?.api.forEachNodeAfterFilter((node) => {
      if (node.data) {
        filteredRows.push(node.data);
      }
    });

    jsonToCsvExport({ data: filteredRows })
  };

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
  }, []);

  const [colDefs] = useState([
    { field: "id_empresalead", headerName: "Id Empresa", sortable: true},
    { field: "numero_doc", headerName: "Numero de Documento", sortable: true},
    { field: "nombre_comercial", headerName: "Nombre Comercial", width:350 ,sortable: true},
    { field: "email", headerName: "Email", sortable: true },
    { field: "pais", headerName: "Pais", sortable: true },
    { field: "departamento", headerName: "Departamento", sortable: true },
    { field: "ciudad", headerName: "Ciudad", sortable: true },
    { field: "direccion_negocio", headerName: "Direccion", sortable: true },
    { field: "telefono1", headerName: "Telefono", sortable: true },
  ]);
  const defaultColDef = useMemo(() => ({
    filter: true
}), []);


  return (
    <div className="p-6 bg-base-100 text-black ">
      <h1 className="text-2xl font-bold mb-6 text-primary flex gap-2">Exportar Datos</h1>

      {loading && <div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
    <div style={{ height: 450, width: "100%" }} className="pb-8">
        <div className="flex justify-center pb-6">
            <button className="btn btn-sm" onClick={exportCSV}>
                Descargar
            </button>
        </div>

        <AgGridReact
            ref={gridRef}
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
