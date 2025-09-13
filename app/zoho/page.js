"use client";

import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import { SendHorizontal, Search, FilePenLine } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import ImportarRegistros from "./importarregistros";
import VerRegistroInt from "./verregistroint";
import EditarInfo from "./editarinfo";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ZohoCRM() {

  const [rowData, setRowData] = useState({});
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selRegistro, setSelRegistro] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "integraciones",
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
      const res = await fetch("/api/integraciones");
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
    field: "id_integracion",
    width: 150,
    cellRenderer: (params) => (
          <div className="flex gap-4 justify-center">
            <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>verRegistro(params.data)}>
              <Search />
            </div>
            <div className="flex justify-center mt-2 cursor-pointer hover:text-primary" onClick={()=>modRegistro(params.data)}>
              <FilePenLine />
            </div>
            {session.user.rol == "admin" &&
            <div className="flex justify-center mt-2 cursor-pointer hover:text-green-600" onClick={()=>enviar(params.data)}>
              <SendHorizontal />
            </div>
            }
          </div>
    ),
  },

  { field: "integracion_estado", headerName: "integracion_estado", sortable: true},
  { field: "fecha_envio", headerName: "fecha_envio", sortable: true},
  { field: "transaccion", headerName: "transaccion", sortable: true},
  { field: "cod_tipodoc", headerName: "cod_tipodoc", sortable: true },
  { field: "numero_doc", headerName: "numero_doc", sortable: true },
  { field: "digito_verifica", headerName: "digito_verifica", sortable: true },
  { field: "nombre_comercial", headerName: "nombre_comercial", sortable: true },
  { field: "nombre_razonsocial", headerName: "nombre_razonsocial", sortable: true },
  { field: "direccion_negocio", headerName: "direccion_negocio", sortable: true },
  { field: "ciudad", headerName: "ciudad", sortable: true },
  { field: "pais", headerName: "pais", sortable: true },
  { field: "departamento", headerName: "departamento", sortable: true },
  { field: "email", headerName: "email", sortable: true },
  { field: "telefono1", headerName: "telefono1", sortable: true },
  { field: "telefono2", headerName: "telefono2", sortable: true },
  { field: "pagina_web", headerName: "pagina_web", sortable: true },
  { field: "zip_code", headerName: "zip_code", sortable: true },
  { field: "desc_sector", headerName: "desc_sector", sortable: true },
  { field: "nombre_programacion", headerName: "nombre_programacion", sortable: true },
  { field: "fuentesource", headerName: "Fuente", sortable: true },
  { field: "nombre_usuario", headerName: "nombre_usuario", sortable: true },

  { field: "nombre_contacto", headerName: "nombre_contacto", sortable: true},
  { field: "apellido_1_contacto", headerName: "apellido_1_contacto", sortable: true},
  { field: "apellido_2_contacto", headerName: "apellido_2_contacto", sortable: true},
  { field: "nombre_completo_contacto", headerName: "nombre_completo_contacto", sortable: true},
  { field: "tipodoc_contacto", headerName: "tipodoc_contacto", sortable: true},
  { field: "numero_doc_contacto", headerName: "numero_doc_contacto", sortable: true},
  { field: "cargo", headerName: "cargo", sortable: true},
  { field: "email_contacto", headerName: "email_contacto", sortable: true},
  { field: "celular", headerName: "celular", sortable: true},
  { field: "telefono", headerName: "telefono", sortable: true},
  { field: "desc_rol", headerName: "desc_rol", sortable: true},
  { field: "id_empresalead", headerName: "id_empresalead", sortable: true },
  { field: "id_empleadscontac", headerName: "id_empleadscontac", sortable: true },
]);

const defaultColDef = useMemo(() => ({
  filter: true
}), []);

async function enviar(value) {

  const loadingToast = toast.loading("Enviando lead... ⏳");

  try {
    const confirmacion = confirm("¿Está seguro de enviar el registro?");
    if (!confirmacion) {
      toast.dismiss(loadingToast);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/zoho/crm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });

    const data = await response.json();

    if (response.ok) {
      toast.update(loadingToast, {
        render: "Lead enviado con éxito",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      
    } else {
      toast.update(loadingToast, {
        render: `Error: ${data.error || "No se pudo enviar el lead"}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  } catch (error) {
    toast.update(loadingToast, {
      render: "Error al conectar con la API 🚨",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
  setOnChange(Math.random());
}

function verRegistro(data){
  setSelRegistro(data)
  document.getElementById('modalVerRegistroInt').showModal()
}

function modRegistro(data){
  setSelRegistro(data)
  document.getElementById('modalModRegistroInt').showModal()
}


  return (
<div className="p-6 bg-base-100 text-black ">
      {loading || !autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}   

    {!loading && !error && autorizado &&(
    <div style={{ height: 450, width: "100%" }}>
      <ImportarRegistros setOnChange={setOnChange} />
      <VerRegistroInt registro={selRegistro} />
      <EditarInfo  registro={selRegistro} setSelRegistro={setSelRegistro} setOnChange={setOnChange}/>
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Integracion Zoho CRM</h1>
      </div>
      <div className="flex justify-end">
      <button className="btn text-white" onClick={()=>document.getElementById('modalImportarRegistros').showModal()}>Importar</button>
      </div>
      <div className="flex gap-4 justify-end pb-4">

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
