"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule, AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import jsonToCsvExport from "json-to-csv-export";

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

export default function TipificadorClaro() {
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

    jsonToCsvExport({ data: filteredRows, headers })
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/tipificador_claro");
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
    { field: "descnivel_rec", headerName: "Segmento Mercado (IL)", sortable: true},
    { field: "telefono1", headerName: "Telefono (TELE_NUMB)", sortable: true },
    { field: "cfm", headerName: "VALOR", sortable: true },
    { field: "nombre_comercial", headerName: "NOMBRE_CLIENTE_MTR", width:350 ,sortable: true},
    { field: "numero_doc", headerName: "IDENTIFICACION_MTR" ,sortable: true},
    { field: "direccion_negocio", headerName: "DIRECCION_AC", sortable: true },
    { field: "ciudad", headerName: "CIUDAD", sortable: true },
    { field: "telefono2", headerName: "Telefono (TELEFONO1)", sortable: true },
    { field: "contacto", headerName: "CONTACTO", sortable: true },
    { field: "email", headerName: "EMAIL", sortable: true },
    { field: "fuente", headerName: "FUENTE", sortable: true },  
  ]);
  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const headers = [
  { key: "descnivel_rec", label: "SEG_MERCADO" },
  { key: "telefono1", label: "TELE_NUMB" },
  { key: "cfm", label: " Valor " },
  { key: "nombre_comercial", label: "NOMBRE_CLIENTE_MTR" },
  { key: "numero_doc", label: "IDENTIFICACION_MTR" },
  { key: "direccion_negocio", label: "DIRECCION_AC" },
  { key: "ciudad", label: "CIUDAD" },
  { key: "telefono2", label: "TELEFONO1" },
  { key: "contacto", label: "CONTACTO" },
  { key: "email", label: "EMAIL" },
  { key: "fuente", label: "FUENTE" },
];

  return (
    <div className="p-6 bg-base-100 text-black ">
      <h1 className="text-2xl font-bold mb-6 text-primary flex gap-2">Tipificador Claro</h1>

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
