import { useEffect, useState } from "react";
import CrearContacto from "../contactos/crearcontacto";
import ModificarContacto from "../contactos/modificarcontacto";
import { Trash2, FilePenLine } from "lucide-react";

export default function Contactos({id}) {

  const [rowContactos, setRowContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onChange, setOnChange] = useState(0);
  const [modalContacto, setModalContacto] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await  fetch(`/api/contactos/leads?id=${id}`);
        if (!res.ok) throw new Error("Error al obtener los datos");
        
        const data = await res.json();
        setRowContactos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onChange, id]);

  const eliminarContacto = async (id) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?");
    if (!confirmacion) return; // Si el usuario cancela, se detiene la ejecución
  
    try {
        const res = await fetch(`/api/contactos/leads?id=${id}`, {
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

  const modificarContacto = (contacto) => {
    setModalContacto(contacto)
    document.getElementById('modalModificarContacto').showModal()
   // console.log(contacto)
  };

  if (loading) {
    return (
      <div className="p-6 bg-base-100 text-black flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-base-100 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

    return (
<div className="p-6 bg-base-100 text-black border border-primary rounded-lg ">
<div className="text-xl text-primary pb-4">Contactos</div>
  <div className="flex justify-end pb-4">
    <CrearContacto idEmpresa={id} setOnChange={setOnChange}/>
  </div>
{rowContactos.length > 0 ?
<div>
<div className="grid grid-cols-1 justify-center gap-4">
  {!loading && !error && (
  <div className="overflow-x-auto py-6">
    <table className='table w-full'>
      <thead>
      <tr>
        <th>Nombre</th>
        <th>Numeros de Contacto</th>
        <th>Email</th>
        <th>Observaciones</th>
        <th>Acciones</th>
      </tr>
    </thead>
      <tbody>
      {
      rowContactos.map((field) => (
        <tr key={field.id_empleadscontac}>
          
        <td>
          {field.nombre_completo_contacto} 
            <br />
            <span className="badge badge-ghost badge-sm">{field.cargo}</span> <span className="badge badge-ghost badge-sm">Rol{field.rol}</span>
        </td>
        
        <td>
        Telefono: {field.telefono}
          <br />
          <span className="badge badge-ghost badge-sm">Celular: {field.celular}</span>
        </td>
        <td>
          {field.email_contacto} 
        </td>
        <td>
          {field.observaciones}
        </td>
        <td>
          <div className="flex gap-4">
          <div onClick={()=>modificarContacto(field)} className="flex justify-center cursor-pointer">
            <FilePenLine />
          </div>
            
          <div className="flex justify-center cursor-pointer" onClick={()=>eliminarContacto(field.id_empleadscontac)}>
            <Trash2 />
          </div>
          </div>
        </td>
        </tr>
        ))}
      </tbody>
      </table>
       <ModificarContacto contacto={modalContacto} setOnChange={setOnChange} />
  </div>
    )}
</div>
</div>:
<div className="flex justify-center">
  No hay contactos creados.
</div>
}
</div>
    );
  }