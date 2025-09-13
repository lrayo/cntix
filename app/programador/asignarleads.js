'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule, AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import Distribucion from './distribucion';
import CalcularDist from './calculardist';
import CargarDetProgramacion from './cargardetprogramacion';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

export default function AsignarLeads({idProgramacion, setOnChange}) {
    
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [rowAgentes, setRowAgentes] = useState([]);
  const [rowAgentesSel, setRowAgentesSel] = useState([]);
  const [checkForm, setCheckForm] = useState(true);
  const gridRef = useRef(null);
  const gridRefAg = useRef(null);
  const [tab, setTab] = useState(1);
  const [tipoDistribucion, setTipoDistribucion] = useState("");
  const [fechaLlamada, setFechaLlamada] = useState("");
  const [rowsEmpresasSel, setRowsEmpresasSel] = useState([])

  useEffect(() => {
    function check() {
      if(rowAgentesSel.length > 0 && rowsEmpresasSel.length > 0 && tipoDistribucion) 
        setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [rowsEmpresasSel, rowAgentesSel, tipoDistribucion]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [res1, res2] = await Promise.all([
          fetch("/api/empresas/programador"),
          fetch("/api/usuarios/agentes"),
        ]);

        if (!res1.ok || !res2.ok) throw new Error("Error al obtener los datos");
  
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
        setRowData(data1)
        setRowAgentes(data2)
        setRowAgentesSel([])
        setRowsEmpresasSel([])
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [idProgramacion]);

  const [colDefs] = useState([
    { field: "id_empresalead", headerName: "Id Empresa", sortable: true},
    { field: "numero_doc", headerName: "Numero Documento", sortable: true},
    { field: "nombre_razonsocial", headerName: "Razon Social", sortable: true },
    { field: "nombre_comercial", headerName: "Nombre Comercial", sortable: true },
    { field: "direccion_negocio", headerName: "Direccion", sortable: true },
    { field: "ciudad", headerName: "Ciudad", sortable: true },
    { field: "telefono1", headerName: "Telefono", sortable: true },
    { field: "email", headerName: "Email", sortable: true },
    { field: "carga_idx", headerName: "Fuente", sortable: true },  
  ]);

  const [colDefsAgente] = useState([
    { field: "nombre", headerName: "Nombre", sortable: true},
    { field: "email", headerName: "Email", sortable: true },
    { field: "id_rol", headerName: "Rol", sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

const rowSelection = {
  mode: "multiRow",
  headerCheckbox: true,
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.getElementById('modalAsignarLeads').close();
    const loadingToast = toast.loading("Asignando leads... ⏳");
    try {
      const rowDistribucion = CalcularDist(rowsEmpresasSel, rowAgentesSel, tipoDistribucion, idProgramacion, fechaLlamada)
      setCheckForm(true)
      //console.log(rowDistribucion)
      const response = await fetch('/api/programaciones/detalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowDistribucion),
      });
      setRowAgentesSel([])
      setRowsEmpresasSel([])
      setTipoDistribucion("")
      const text = await response.text();
      setOnChange(Math.random()) 
      //console.log("Respuesta del servidor:", text);
      const data = JSON.parse(text); 

    if (response.ok) {
      toast.update(loadingToast, {
        render: "Leads distribuidos con éxito",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      
    } else {
      toast.update(loadingToast, {
        render: `Error: ${data.error || "No se pudo distribuir los leads"}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  } catch (error) {
    toast.update(loadingToast, {
      render: "Error al conectar con el servidor 🚨",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  };
}

  function adicionarLeads () {
      const filteredRows = [];
      gridRef.current?.api.forEachNodeAfterFilter((node) => {
        if (node.data && node.isSelected()) {
          filteredRows.push(node.data);
        }
      });
      setRowsEmpresasSel((prev) => [...prev, ...filteredRows]);
      //setRowsEmpresasSel({..., id_empleads:[...rowsEmpresasSel.id_empleads, ...filteredRows]})
      //const filteredRows = gridRef.current?.api.getSelectedRows()
    }

    function adicionarAgentes () {
      const filteredRows = [];
      gridRefAg.current?.api.forEachNodeAfterFilter((node) => {
        if (node.data && node.isSelected()) {
          filteredRows.push(node.data);
        }
      });
      setRowAgentesSel((prev) => [...prev, ...filteredRows]);
      //const filteredRows = gridRef.current?.api.getSelectedRows()
      console.log(rowAgentesSel)
    }

    function cerrarForm() {
      setRowAgentesSel([])
      setRowsEmpresasSel([])
      document.getElementById('modalAsignarLeads').close()
    }

    function borrarLeads() {
      setRowsEmpresasSel([])
    }

    function borrarAgentes() {
      setRowAgentesSel([])
    }

    return (
    <div className="flex justify-center">
        <dialog id="modalAsignarLeads" className="modal">
        {loading && !error ?
        <div className="p-4 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box w-11/12 max-w-11/12">
        <div className="p-1 bg-base-100">
          <div className="text-xl text-primary pb-2">Asignar Empresas / Leads: {idProgramacion}</div>
          <div className="text-lg badge badge-lg badge-ghost ">Empresas: {rowsEmpresasSel.length || 0}</div>
          <div className="text-lg badge badge-lg badge-ghost ml-2">Agentes: {rowAgentesSel.length || 0}</div>
          <div className="tabs tabs-box w-auto justify-center my-2">
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Empresas" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Agentes"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Distribución"  checked={tab == 3 ?true:false} onChange={()=>setTab(3)}/>
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Cargar CSV"  checked={tab == 4 ?true:false} onChange={()=>setTab(4)}/>
          </div>
          <div className='grid gap-2 p-2'>
        {rowData && tab == 1 &&
          <div>
            <div className='flex justify-end gap-2 pb-2'>
            <button className='btn btn-secondary text-white' onClick={borrarLeads}>Borrar</button>
            <button className='btn btn-primary text-white' onClick={adicionarLeads}>Adicionar</button>
            </div>
            <div className='h-[420px]'>
          <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={colDefs}
              pagination={true}
              paginationPageSize={20}
              modules={[ClientSideRowModelModule]}
              defaultColDef={defaultColDef}
              rowSelection={rowSelection}
              />
          </div>
          </div>
        }     
        {rowAgentes && tab == 2 &&
          <div>
            <div className='flex justify-end gap-2 pb-2'>
            <button className='btn btn-secondary text-white' onClick={borrarAgentes}>Borrar Agentes</button>
            <button className='btn btn-primary text-white' onClick={adicionarAgentes}>Adicionar Agentes</button>
            </div>
            <div className='h-[420px]'>
          <AgGridReact
              ref={gridRefAg}
              rowData={rowAgentes}
              columnDefs={colDefsAgente}
              pagination={true}
              paginationPageSize={20}
              modules={[ClientSideRowModelModule]}
              defaultColDef={defaultColDef}
              rowSelection={rowSelection}
              />
          </div>
          </div>
        }     
        {rowAgentesSel && rowsEmpresasSel && tab == 3 &&
          <div>
            <Distribucion empresas={rowsEmpresasSel} agentes={rowAgentesSel} setTipoDistribucion={setTipoDistribucion} setFechaLlamada={setFechaLlamada}/>
          </div>
        }   
        {tab == 4 &&
          <div>
           <CargarDetProgramacion />
          </div>
        }   
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleSubmit} type="button" className="btn btn-primary text-white" disabled={checkForm}>Guardar</button>
            <button className="btn" onClick={cerrarForm}>Cerrar</button>
          </div>
        </div>
        </div>
  }
    </dialog>
    </div>
    );
  }