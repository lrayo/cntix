'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ModificarProgramacion({idProgramacion, setOnChange}) {

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowCampanas, setRowCampanas] = useState([]);
    const [rowFormularios, setRowFormularios] = useState([]);
    const [rowDetalles, setRowDetalles] = useState([]);
    const [rowAgentes, setRowAgentes] = useState([]);
    const [checkForm, setCheckForm] = useState(true);
    const [tab, setTab] = useState(1);

    useEffect(() => {
      function check() {
        if(formData && formData.nombre && formData.id_campana) 
          setCheckForm(false)
        else setCheckForm(true)
      }
      check();
    }, [formData]);
   
    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [camp, form, prog, det, agen] = await Promise.all([
            fetch("/api/campanas"),
            fetch("/api/formularios"),
            fetch(`/api/programaciones/id?id=${idProgramacion}`),
            fetch(`/api/programaciones/detalle/idprog?id=${idProgramacion}`),
            fetch("/api/usuarios/agentes"),
          ]);
  
          if (!camp.ok && !form.ok && !prog.ok && !det.ok) throw new Error("Error al obtener los datos");
        
          const data1 = await camp.json();
          const data2 = await form.json();
          const data = await prog.json();
          const data3 = await det.json();
          const data4 = await agen.json();

          setRowCampanas(data1);
          setRowFormularios(data2);
          setFormData(data[0]);
          setRowDetalles(data3)
          setRowAgentes(data4);
          
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [idProgramacion]);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setCheckForm(true)
        const response = await fetch('/api/programaciones', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        document.getElementById('modalModificarProgramacion').close();
        //setFormData({});
        const text = await response.text();
        setOnChange(Math.random()) 
        //console.log("Respuesta del servidor:", text);
        if (!text) throw new Error("Respuesta vacía del servidor");
    
        const data = JSON.parse(text); 
        alert(data.message || 'Error en la inserción');
    
      } catch (error) {
        console.error('Error:', error);
        alert("Error al enviar los datos. Revisa la consola.");
      }
    };

    const actualizarAgente = useCallback(async  (params) => {
      try {
        setCheckForm(true)
        const response = await fetch('/api/programaciones/agente', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params.data),
        });

        //setFormData({});
        const text = await response.text();

        //console.log("Respuesta del servidor:", text);
        if (!text) throw new Error("Respuesta vacía del servidor");
    
        const data = JSON.parse(text); 
        alert(data.message || 'Error en la inserción');
    
      } catch (error) {
        console.error('Error:', error);
        alert("Error al enviar los datos. Revisa la consola.");
      }
      return true; // Indica que el valor se ha actualizado
    }, []);

    const colDefs = [
      {
        headerName: "Agente",
        field: "id_usuario",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: rowAgentes.map((ag) => ag.nombre.toString()), // Opciones basadas en IDs
        },
        editable: true,
        valueGetter: (params) => {
          const agente = rowAgentes.find((ag) => ag.id_usuario === params.data.id_usuario);
          return agente ? agente.nombre.toString() : "";
        },
        valueSetter: (params) => {
          const selectedAgente = rowAgentes.find(
            (ag) => ag.nombre.toString() === params.newValue
          );
          if (selectedAgente) {
            params.data.id_usuario = selectedAgente.id_usuario; // Asigna el ID del agente
            actualizarAgente(params); // Llama a la función de actualización
            return true;
          }
          return false;
        },
      },
      { field: "nombre_comercial", headerName: "Nombre Comercial", width:350, sortable: true },
      { field: "numero_doc", headerName: "Documento", sortable: true },
      { field: "nombre_programacion", headerName: "Programacion", sortable: true },
      { field: "intentos_llamada", headerName: "Llamadas", sortable: true },
    ];
   
    const defaultColDef = useMemo(() => ({
      filter: true
  }), []);

    return (
    <div className="flex justify-center">
        <dialog id="modalModificarProgramacion" className="modal">
        {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box min-w-3/4 max-w-5xl">
        <div className="p-6 bg-base-100 ">
          <div className="text-xl text-primary pb-4">Modificar Programacion: {idProgramacion}</div>
          <div className='grid gap-2 p-4'>

          <div className="tabs tabs-box w-auto justify-center my-2">
            <input type="radio" name="my_tabs_1x" className="tab" aria-label="Info Basica" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
            <input type="radio" name="my_tabs_1x" className="tab" aria-label="Asignaciones"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
          </div>
        {formData && tab == 1 &&
          <div className="flex justify-center h-80">
          <table className='table w-3/4'>
          <tbody>
          <tr>
              <td className='font-semibold'>Campaña</td>
              <td className=''>
                <select onChange={handleChange} name='id_campana' className='select select-sm' defaultValue={formData.id_campana || ""}>
                  <option value=''>Seleccione...</option>
                  {rowCampanas.map((item) => (
                    <option key={item.id_campana} value={item.id_campana}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td className='font-semibold'>Formulario</td>
              <td className=''>
                <select onChange={handleChange} name='id_formulario' className='select select-sm' value={formData.id_formulario || ""}>
                  <option value=''>Seleccione...</option>
                  {rowFormularios.map((item) => (
                    <option key={item.id_formulario} value={item.id_formulario}>
                      {item.nombre_formulario}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
              <tr>
                <td className='font-semibold w-1/4'>Nombre</td>
                <td>
                  <input
                    type='text' name="nombre" className='input input-sm'
                    onChange={handleChange}
                    value={formData.nombre || ""}
                  />
                </td>
              </tr>
              <tr>
                <td className='font-semibold w-1/4'>Descripcion</td>
                <td>
                  <input
                    type='text' name="descripcion" className='input input-sm'
                    onChange={handleChange}
                    value={formData.descripcion || ""}
                  />
                </td>
              </tr>
          </tbody>
        </table>
        </div>
    }
    {formData && tab == 2 &&
    <div className="h-80">
      <AgGridReact
          rowData={rowDetalles}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={50}
          modules={[ClientSideRowModelModule]}
          defaultColDef={defaultColDef}
          enableCellTextSelection={true}
          />
    </div>
    }
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleSubmit} type="button" className="btn btn-primary text-white" disabled={checkForm}>Guardar</button>
            <form method="dialog">
                <button className="btn">Cerrar</button>
            </form>
          </div>
        </div>
        </div>
    }
    </dialog>
    </div>
    );
  }