'use client';
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import { Trash2, FilePenLine, Cog } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ConfigurarFormulario({idFormulario}) {

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkForm, setCheckForm] = useState(true);
    const [tab, setTab] = useState(1);
    const [rowData, setRowData] = useState([]);
    const [onChange, setOnChange] = useState(false);

    const [colDefs] = useState([
      {
        headerName: "Acciones",
        field: "id_formulario_campo",
        width: 100,
        cellRenderer: ({ value }) => (
          <div className="flex justify-center mt-2 gap-2">
            <div className="cursor-pointer" onClick={()=>eliminar(value)}>
            <Trash2 />
          </div>
          </div>
        ),
      },
      { field: "cod_campo", headerName: "Codigo", sortable: true},
      { field: "descrip_campo", headerName: "Pregunta", sortable: true },
      { field: "tipo_campo", headerName: "Tipo Respuesta", sortable: true },
      { field: "opcion_campo", headerName: "Opciones", sortable: true },
      { field: "campo_obligatorio_sn", headerName: "Obligatorio", sortable: true },
    ]);
  
    const defaultColDef = useMemo(() => ({
      filter: true
  }), []);

    useEffect(() => {
      function check() {
        if(formData && formData.cod_campo && formData.descrip_campo && formData.tipo_campo && formData.campo_obligatorio_sn) 
          setCheckForm(false)
        else setCheckForm(true)
      }
      check();
    }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [form] = await Promise.all([
            fetch(`/api/formularios/campos?id=${idFormulario}`),
          ]);
  
          if (!form.ok) throw new Error("Error al obtener los datos");
          const data = await form.json();
          setRowData(data);
          setFormData({id_formulario: idFormulario});
          
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [idFormulario, onChange]);
    
    const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setCheckForm(true);
        const response = await fetch('/api/formularios/campos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setTab(1);
        setFormData({});
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

    const eliminar = async (id) => {
      const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?");
      if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución
    
      try {
          const res = await fetch(`/api/formularios/campos?id=${id}`, {
              method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) {
              throw new Error(data.error || "Error al eliminar");
          }
          setOnChange(Math.random()) 
          alert("Registro eliminado");
      } catch (error) {
          console.error(error);
          alert("Error al eliminar el registro");
      }
    };

return (
  <div className="flex justify-center">
  <dialog id="modalConfigurarFormulario" className="modal">
  {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
  <form onSubmit={handleSubmit} className=' w-11/12 justify-center flex'>
  <div className="modal-box w-11/12 max-w-5xl ">
  <div className="p-6 bg-base-100">
    <div className="text-xl text-primary pb-4">Configurar Formulario: {idFormulario}</div>
    <div className='grid gap-2 p-2'>
    <div className="tabs tabs-box w-auto justify-center mb-2">
      <input type="radio" name="my_tabs_1" className="tab" aria-label="Campos Creados" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
      <input type="radio" name="my_tabs_1" className="tab" aria-label="Crear Campos"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
    </div>
  {formData && tab == 2 &&
  <div className="h-80">
  <table className='table'>
  <tbody>
    <tr>
      <td>
      <div className='font-semibold'>Codigo Campo</div>
          <input
            type='text' name="cod_campo" className='input input-sm'
            onChange={handleChange}
            value={formData.cod_campo || ""}
          />
        </td>
      <td>
      <div className='font-semibold'>Pregunta</div>
          <input
            type='text' name="descrip_campo" className='input input-sm'
            onChange={handleChange}
            value={formData.descrip_campo || ""}
          />
        </td>
    </tr>
    <tr>
      <td>
      <div className='font-semibold'>Tipo Respuesta</div>
        <select defaultValue="Seleccione" className="select select-sm" name='tipo_campo' onChange={handleChange}>
          <option disabled={true}>Seleccione</option>
          <option value={"text"}>Texto</option>
          <option value={"textarea"}>Texto Largo</option>
          <option value={"date"}>Fecha</option>
          <option value={"number"}>Numero</option>
          <option value={"select"}>Lista de Opciones</option>
        </select>
      </td>
      <td>
      <div className='font-semibold'>Campo Obligatorio</div>
      <select defaultValue="Seleccione" className="select select-sm" name='campo_obligatorio_sn' onChange={handleChange}>
          <option disabled={true}>Seleccione</option>
          <option value={1}>Si</option>
          <option value={0}>No</option>
        </select>
        </td>
    </tr>
    {
      formData.tipo_campo === 'select' &&
    <tr>
      <td className=' col-span-2'>
        <div className='font-semibold'>Opciones de Respuesta</div>
      <textarea name="opcion_campo" className='textarea textarea-sm' onChange={handleChange} value={formData.opcion_campo || ""}>

      </textarea>
        </td>
    </tr>
    }

  </tbody>
</table>
  <button type="submit" className="btn btn-sm btn-primary text-white" disabled={checkForm}>Guardar</button>
</div>
}
{tab == 1 &&
<div className="h-80">
<AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={20}
          modules={[ClientSideRowModelModule]}
          defaultColDef={defaultColDef}
          />
</div>  
  }
  </div>
    <div className="flex justify-center gap-4">
      
      <button type='button' className="btn" onClick={()=>document.getElementById('modalConfigurarFormulario').close()}>Cerrar</button>
    </div>
  </div>
  </div>

</form>
}
</dialog>

</div>
);
}