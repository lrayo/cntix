'use client';
import { useState, useEffect } from 'react';
import InfoLeads from './componentes/infoleads';
import { useSession } from "next-auth/react";
import ModificarContacto from './componentes/modificarcontacto';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function EditarInfo({registro, setSelRegistro, setOnChange}) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [rowData, setRowData] = useState(false);
  const [rowAdicional, setRowAdicional] = useState(false);
  const [rowContactos, setRowContactos] = useState(false);
  const [tab, setTab] = useState(1);
  const [onChange2, setOnChange2] = useState(false);
  const [checkForm, setCheckForm] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    function check() {
      if(formData) setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          if(registro){
            const [res1, res2, res3] = await Promise.all([
              fetch(`/api/empresas/infobasica?id=${registro.id_empresalead}`),
              fetch(`/api/contactos/id?id=${registro.id_contacto_llamada}`),
              fetch(`/api/empresas/infoadicional?id=${registro.id_empresalead}`),
            ]);

            if (!res1.ok || !res2.ok || !res3.ok) throw new Error("Error al obtener los datos");
      
            const [data1, data2, data3] = await Promise.all([res1.json(), res2.json(), res3.json()]);
            setRowData(data1[0]);
            setRowContactos(data2[0])
            setRowAdicional(data3[0])
            setLoading(false);
          }
        } catch (err) {
          setError(err.message);
        } 
      }
      fetchData();
    }, [registro, onChange2]);

  const closeForm = () =>{
    setFormData({})
    setLoading(true)
    setSelRegistro(false)  
    document.getElementById('modalModRegistroInt').close()
    }

  if (error) {
    return (
      <div className="p-6 bg-base-100 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }
 // console.log(formData)
  return (
  <div className="flex justify-center">
    <dialog id="modalModRegistroInt" className="modal">
      {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
      <div className="p-4 bg-white rounded-2xl h-11/12 w-11/12 overflow-y-auto">  
      <div className='flex justify-center text-primary font-bold text-2xl py-2'>Editar Informacion</div>      
      <div>
        <div className="p-2 flex gap-2 justify-center">
        <div className='w-1/2'>
          <div className="tabs tabs-box w-auto justify-center">
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Empresa"/>
          </div>
        {rowData &&
        <div className='flex flex-col gap-2 overflow-y-auto mt-2'>
         <InfoLeads rowData={rowData} rowAdicional={rowAdicional} setOnChange={setOnChange2}/>
        </div>
        }

        </div>
          <div className="divider divider-horizontal"></div>
          <div className='gap-2 flex-1 flex-col'>
 
          <div className="tabs tabs-box w-auto justify-center">
            <input type="radio" name="my_tabs_1x" className="tab" aria-label="Contacto" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
          </div>
          <ModificarContacto contacto={rowContactos} setContacto={setRowContactos} setOnChange={setOnChange}/>
        </div>
        </div>
        </div> 
        
      <div className='flex gap-4 justify-end'>
          <button className=' btn btn-sm rounded-lg' onClick={()=>closeForm()}>Cerrar</button>
      </div>

      </div>
      }
    </dialog>
</div>
    );
  }