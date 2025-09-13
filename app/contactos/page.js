"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
import { Trash2, FilePenLine } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import ModificarContacto from "../empresas/contactos/modificarcontacto";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

export default function ContactosPage() {
  const [rowData, setRowData] = useState([]);
  const [rowData2, setRowData2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onChange, setOnChange] = useState(false);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState(1);
  const [autorizado, setAutorizado] = useState(false);
  const gridRef = useRef(null);
  const [modalContacto, setModalContacto] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "contactos",
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
        const res = await fetch("/api/contactos");
        if (!res.ok) throw new Error("Error al obtener los datos");
        const data = await res.json();
        setRowData(data);

        const res2 = await fetch("/api/empresas/sincontacto");
        if (!res2.ok) throw new Error("Error al obtener los datos");
        const data2 = await res2.json();
        setRowData2(data2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onChange]);

  const modificarContacto = (contacto) => {
    setModalContacto(contacto)
    document.getElementById('modalModificarContacto').showModal()
   // console.log(contacto)
  };

    const eliminarContacto = async (id) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?");
    if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución
    const loadingToast = toast.loading("Eliminando Usuario... ⏳");
    try {
        const res = await fetch(`/api/contactos/leads?id=${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Error al eliminar");
        }
        setOnChange(id)

         if (res.ok) {
           toast.update(loadingToast, {
             render: "usuario modificado con éxito",
             type: "success",
             isLoading: false,
             autoClose: 3000,
           });
           
         } else {
           toast.update(loadingToast, {
             render: `Error: ${data.error || "No se pudo modificar el usuario"}`,
             type: "error",
             isLoading: false,
             autoClose: 3000,
           });
         }
       } catch (error) {
         toast.update(loadingToast, {
           render: "Error al contactar al servidor",
           type: "error",
           isLoading: false,
           autoClose: 3000,
         });
       }
     };

  const [colDefs] = useState([
        {
      headerName: "Acciones",
      field: "id_empleadscontac",
      width: 100,
      cellRenderer: ( param ) => (
        <div className="flex gap-2 justify-center">
   
        <div onClick={()=>modificarContacto(param.data)} className="flex justify-center hover:text-primary hover:cursor-pointer mt-2">
          <FilePenLine />
        </div>
        {
        session.user.rol === 'admin' && (
          <div className="flex justify-center hover:text-primary mt-2 hover:cursor-pointer" onClick={()=>eliminarContacto(param.data.id_empleadscontac)}>
            <Trash2 />
          </div>
        )
      }
        </div>
      ),
    },
    { field: "nombre_completo_contacto", headerName: "Nombre Contacto", sortable: true },
    { field: "cargo", headerName: "Cargo", sortable: true },
    { field: "email_contacto", headerName: "Email Contacto", sortable: true },
    { field: "celular", headerName: "Celular", sortable: true },
    { field: "telefono", headerName: "Telefono", sortable: true },
    { field: "desc_rol", headerName: "Rol", sortable: true },
    { field: "nombre_comercial", headerName: "Nombre Comercial", width: 350, sortable: true },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: true
}), []);

  const [colDefs2] = useState([
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

  const defaultColDef2 = useMemo(() => ({
    filter: true
}), []);

  return (
    <div className="p-6 bg-base-100 text-black ">
      {loading && autorizado &&<div className='flex items-center justify-center h-96'><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <p className="text-red-500">Error: {error}</p>}

    {!loading && !error && autorizado &&(
    <div style={{ height: 500, width: "100%" }}>
      <ModificarContacto contacto={modalContacto} setOnChange={setOnChange} />
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold mb-4 text-primary flex gap-2">Lista de Contactos</h1>
      </div>

      <div className="tabs tabs-box w-auto justify-center mb-6">
        <input type="radio" name="my_tabs_der" className="tab" aria-label="Contactos" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
        <input type="radio" name="my_tabs_der" className="tab" aria-label="Empresas sin Contacto"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
      </div>

    {tab == 1 && 
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
            }

    {tab == 2 && 
        <AgGridReact
            rowData={rowData2}
            columnDefs={colDefs2}
            pagination={true}
            paginationPageSize={50}
            modules={[ClientSideRowModelModule]}
            defaultColDef={defaultColDef2}
            enableCellTextSelection={true}
            ref={gridRef}
            />
            }
    </div>
      )}
    </div>
  );
}
