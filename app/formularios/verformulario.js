'use client';

import { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function VerFormulario({idFormulario, setIdFormulario}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowDetalles, setRowDetalles] = useState([]);
    const [tab, setTab] = useState(1);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [det] = await Promise.all([
            fetch(`/api/formularios/respuestas?id=${idFormulario}`),
          ]);
  
          if (!det.ok) throw new Error("Error al obtener los datos");
        
          const data = await det.json();
          setRowDetalles(data);
  
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [idFormulario]);

    const [colDefs] = useState([
      { field: "id_formulario", headerName: "Id Formulario", sortable: true },
      { field: "id_formulario_campo", headerName: "Id Campo", sortable: true },
      { field: "id_empresalead", headerName: "Empresa", sortable: true },
      { field: "id_usuario", headerName: "Agente", sortable: true },
      { field: "respuesta", headerName: "Respuesta", sortable: true },
      ]);
  
    const defaultColDef = useMemo(() => ({
      filter: true
  }), []);

  function cerrarForm(){
    document.getElementById('modalVerFormulario').close()
    setIdFormulario("")
  }

    return (
    <div className="flex justify-center">
        <dialog id="modalVerFormulario" className="modal">
        {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box w-11/12 max-w-7xl ">
        <div className="p-6 bg-base-100 ">
        <div className="text-xl text-primary">Ver Programacion: {idFormulario}</div>
        <div className="tabs tabs-box w-auto justify-center my-2">
          <input type="radio" name="my_tabs_x1" className="tab" aria-label="Registros" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        </div>
       
          {tab == 1 && rowDetalles &&
            <div className='grid gap-2 p-4 h-96'>
            <AgGridReact
              rowData={rowDetalles}
              columnDefs={colDefs}
              pagination={true}
              paginationPageSize={20}
              modules={[ClientSideRowModelModule]}
              defaultColDef={defaultColDef}
              />
            </div>
          }
          <div className="flex justify-center gap-4">
                <button className="btn" onClick={cerrarForm}>Cerrar</button>
          </div>
        </div>
        </div>
    }
    </dialog>
    </div>
    );
  }