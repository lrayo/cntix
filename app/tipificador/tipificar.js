'use client';
import { useState, useEffect } from 'react';
import CrearContactoTip from './componentes/crearcontactotip';
import ContactosLeads from './componentes/contactosleads';
import InfoLeads from './componentes/infoleads';
import RegistroLlamada from './componentes/registrollamada';
import Historial from './componentes/historial';
import { useSession } from "next-auth/react";
import RegistroFormulario from './componentes/registroformulario';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function Tipificar({idProgDet, setIdProgDet, setOnChange}) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [rowData, setRowData] = useState(false);
  const [rowAdicional, setRowAdicional] = useState(false);
  const [rowContactos, setRowContactos] = useState(false);
  const [tab, setTab] = useState(1);
  const [tab2, setTab2] = useState(1);
  const [onChange2, setOnChange2] = useState(false);
  const [checkForm, setCheckForm] = useState(true);
  const [historial, setHistorial] = useState(true);
  const [idEmpresa, setIdEmpresa] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    function check() {
      if(formData && formData.contesto_sn && formData.llamada_efectiva_sn && formData.respuesta_llamada && formData.nueva_fecha_llamada !="required" && (formData.id_contacto_llamada != 0 || formData.llamada_efectiva_sn != 's')) setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [formData]);

    useEffect(() => {
      async function fetchData() {
        try {
          if(idProgDet){
           
            const [res] = await Promise.all([
              fetch(`/api/programaciones/detalle/id?id=${idProgDet}`),
            ]);
            if (!res) throw new Error("Error al obtener los datos");
            const id = await res.json()

            const [res1, res2, res3, res4] = await Promise.all([
              fetch(`/api/empresas/infobasica?id=${id[0].id_empresalead}`),
              fetch(`/api/contactos/vw_leads?id=${id[0].id_empresalead}`),
              fetch(`/api/empresas/infoadicional?id=${id[0].id_empresalead}`),
              fetch(`/api/registro_llamadas/id?id=${id[0].id_empresalead}`),
            ]);

            if (!res1.ok || !res2.ok || !res3.ok) throw new Error("Error al obtener los datos");
      
            const [data1, data2, data3, data4] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json()]);
            setRowData(data1[0]);
            setRowContactos(data2)
            setRowAdicional(data3[0])
            setHistorial(data4)
            setLoading(false);
          }

        } catch (err) {
          setError(err.message);
        } 
      }
      fetchData();
    }, [idProgDet, onChange2, idEmpresa]);

    useEffect(() => {
     async function fetchData() {
      if(idProgDet){
        const [res] = await Promise.all([
          fetch(`/api/programaciones/detalle/id?id=${idProgDet}`),
        ]);
        if (!res) throw new Error("Error al obtener los datos");
        const id = await res.json()

        setIdEmpresa(id[0].id_empresalead)
            setFormData({
              id_programacion: id[0].id_programacion,
              id_empresalead: id[0].id_empresalead,
              intentos_llamada: id[0].intentos_llamada,
              id_progdet: idProgDet,
              fecha_llamada_inicio: new Date().toISOString(),
              contactos_creados:[],
              id_usuario: session.user.usuario,
             });
          }
        }
      fetchData();
    }, [idProgDet, session.user.usuario]);

  const closeForm = () =>{
    setFormData({})
    setLoading(true)
    setIdProgDet(false)  
    document.getElementById('modalTipificador').close()
    }

  const handleSubmit = async () => {
      try {
        document.getElementById('modalTipificador').close()
        const loadingToast = toast.loading("Guardando registro de llamada");
        setCheckForm(true)
        setIdProgDet(false)
        const formDataFinal = {...formData, fecha_llamada_fin: new Date().toISOString()}

        const response = await fetch('/api/registro_llamadas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDataFinal),
        });
    
        const text = await response.text();
        setOnChange(Math.random()) 
        closeForm()
        //console.log("Respuesta del servidor:", text);

           if (response.ok) {
             toast.update(loadingToast, {
               render: "Registro enviado con éxito",
               type: "success",
               isLoading: false,
               autoClose: 5000,
             });
             
           } else {
             toast.update(loadingToast, {
               render: `Error: ${data.error || "No se pudo enviar el registro"}`,
               type: "error",
               isLoading: false,
               autoClose: 5000,
             });
           }
        
      } catch (error) {
        console.error('Error:', error);
        alert("Error al enviar los datos. Revisa la consola.");
      }
    };

  if (error) {
    return (
      <div className="p-6 bg-base-100 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }
  //console.log(formData)
  return (
  <div className="flex justify-center">
    <dialog id="modalTipificador" className="modal">
      {loading ?
        <div className="p-4 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
      <div className="p-4 bg-white rounded-2xl h-11/12 w-11/12 overflow-y-auto">  
      <div className='flex justify-center text-primary font-bold text-2xl py-2'>{rowData.nombre_razonsocial}</div>      
      <div>
        <div className="grid p-2 lg:flex md:flex gap-2 justify-center">
        <div className='lg:w-1/2'>
          <div className="tabs tabs-box w-auto justify-center">
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Empresa" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Contactos"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Crear Contacto" checked={tab == 3 ?true:false} onChange={()=>setTab(3)}/>
            <input type="radio" name="my_tabs_1" className="tab" aria-label="Historial" checked={tab == 4 ?true:false} onChange={()=>setTab(4)}/>
          </div>
        {rowData && tab == 1 &&
        <div className='overflow-y-auto mt-2'>
         <InfoLeads rowData={rowData} formData={formData} setFormData={setFormData} rowAdicional={rowAdicional} setOnChange={setOnChange2}/>
        </div>
        }
        {rowContactos && tab == 2 &&
          <div className='overflow-y-auto mt-2'>
            <ContactosLeads rowContactos={rowContactos} formData={formData} setFormData={setFormData} setOnChange={setOnChange2}/>
          </div>
          }
        {tab == 3 &&
          <div className='overflow-y-auto mt-2'>
            <CrearContactoTip idEmpresa={idEmpresa} setOnChange={setOnChange2} formData={formData} setFormData={setFormData}/>
          </div>
        }
        {tab == 4 && historial &&
          <div className='overflow-y-auto mt-2'>
            <Historial historial={historial} />
          </div>
        }
        </div>
          <div className="divider divider-horizontal"></div>
          <div className='gap-2 flex-1 flex-col'>
          <div className="tabs tabs-box w-auto justify-center">
            <input type="radio" name="my_tabs_2" className="tab" aria-label="Gestión" defaultChecked={tab2 == 1 ?true:false} onClick={()=>setTab2(1)}/>
            {<input type="radio" name="my_tabs_2" className="tab" aria-label="Tipificación"  defaultChecked={tab2 == 2 ?true:false} onClick={()=>setTab2(2)}/>}
          </div>
          {tab2 == 1 && formData &&
          <div>
            <RegistroLlamada formData={formData} setFormData={setFormData} setTab={setTab} />
          </div>
          }
          {tab2 == 2 && formData &&
          <div>
            <RegistroFormulario formData={formData} setFormData={setFormData} />
          </div>
          }
        </div>
        </div>
        </div> 
        
      <div className='flex gap-4 justify-end'>
          <button className=' btn btn-sm btn-primary rounded-lg' onClick={()=>handleSubmit()} disabled={checkForm}>Guardar</button>
          <button className=' btn btn-sm rounded-lg' onClick={()=>closeForm()}>Cerrar</button>
      </div>

      </div>
      }
    </dialog>
</div>
    );
  }