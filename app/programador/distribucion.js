"use client";
import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Distribucion({empresas, agentes, setTipoDistribucion, setFechaLlamada}) {
  
 const [colDefs] = useState([
    { field: "numero_doc", headerName: "Numero Documento", sortable: true},
    { field: "nombre_razonsocial", headerName: "Razon Social", sortable: true },
    { field: "nombre_comercial", headerName: "Nombre Comercial", sortable: true },
    { field: "direccion_negocio", headerName: "Direccion", sortable: true },
    { field: "ciudad", headerName: "Ciudad", sortable: true },
    { field: "telefono1", headerName: "Telefono", sortable: true },
    { field: "email", headerName: "Email", sortable: true },
    { field: "fuente", headerName: "Fuente", sortable: true },  
  ]);

  const [colDefsAgente] = useState([
    { field: "nombre", headerName: "Nombre", sortable: true},
    { field: "email", headerName: "Email", sortable: true },
    { field: "id_rol", headerName: "Rol", sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

  return (
  <div className="pb-2 bg-base-100 text-black ">
    <div className="flex justify-end gap-2">
      <div className="text-sm flex items-center">Fecha de Llamadas</div><input className="input input-sm" type="datetime-local" onChange={(e)=>setFechaLlamada(e.target.value)}/>
    <select defaultValue="Seleccione" className="select select-sm" name='respuesta_llamada' onChange={(e)=>setTipoDistribucion(e.target.value)}>
      <option disabled={true} value={"Seleccione"}>Seleccione tipo de distribución</option>
      <option value={"dif"}>Empresas Diferentes por Agente</option>
      <option value={"igu"}>Empresas Iguales por Agentes</option>
    </select>
    </div>
    <div>
      <div className="text-primary my-2">Agentes</div>
      <div style={{ height: 200, width: "100%" }}>
      <AgGridReact
        rowData={agentes}
        columnDefs={colDefsAgente}
        pagination={true}
        paginationPageSize={20}
        modules={[ClientSideRowModelModule]}
        defaultColDef={defaultColDef}
        />
        </div>
      <div className="text-primary my-2">Empresas</div>
      <div style={{ height: 250, width: "100%" }}>
      <AgGridReact
        rowData={empresas}
        columnDefs={colDefs}
        pagination={true}
        paginationPageSize={20}
        modules={[ClientSideRowModelModule]}
        defaultColDef={defaultColDef}
        />
      </div>
    </div>
    </div>
  );
}
