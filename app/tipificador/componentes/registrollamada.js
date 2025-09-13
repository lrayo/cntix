'use client';

export default function RegistroLlamada({formData, setFormData, setTab}) {

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleChangeContestoLlamada = (e) => {
      if(e.target.value == "n") setFormData({ ...formData, 
          contesto_sn: e.target.value,
          llamada_efectiva_sn: "n",
          respuesta_llamada: ""
      });
      else setFormData({ ...formData, 
          contesto_sn: e.target.value,
          llamada_efectiva_sn: "",
          respuesta_llamada: ""
        });
      };
  
    const handleChangeContesta = (e) => {
     setFormData({ ...formData, 
        llamada_efectiva_sn: e.target.value,
        respuesta_llamada: ""
      });
      };

      const handleChangeRespuesta = (e) => {
        if(e.target.value == "LlamarDespues" || e.target.value == "Buzon" || e.target.value == "NoContesta")
          setFormData({ ...formData, 
            respuesta_llamada: e.target.value,
            respuesta_nointeresado: "",
            nueva_fecha_llamada: "required"
          })
        else 
          if(e.target.value != "NoInteresado"){
            setFormData({ ...formData, 
            respuesta_nointeresado: "",
            respuesta_llamada: e.target.value,
            nueva_fecha_llamada: ""
          })
          }
        else{
            setFormData({ ...formData,
              respuesta_llamada: e.target.value,
              nueva_fecha_llamada: ""
            });
          }




          if(e.target.value == "NoDecisiones") setTab(3)
        };

console.log(formData)
    return (
  <div className="">
    {formData && formData.numero_llamada ?
    <div>
    <div className='font-bold text-primary text-lg py-6'>Registro de Llamada</div>
    <div className='mb-4 text-lg font-semibold flex flex-col gap-2'>{formData.nombre_contacto_llamada}
      <span className='badge badge-ghost'>Numero Marcado: {formData.numero_llamada}</span>
    </div>
      <div className='flex gap-2 items-center py-2'>
        <div>Contesto llamada?</div>
        <select defaultValue={formData.contesto_sn || "Seleccione"} className="select select-sm" name='contesto_sn' onChange={handleChangeContestoLlamada}>
          <option disabled={true}>Seleccione</option>
          <option value={"s"}>Si</option>
          <option value={"n"}>No</option>
        </select>
      </div>
        {formData && formData.contesto_sn == "n" &&
          <div>
            <select defaultValue={formData.respuesta_llamada || "Seleccione"} className="select select-sm" name='respuesta_llamada' onChange={handleChangeRespuesta}>
              <option disabled={true}>Seleccione</option>
              <option value={"Buzon"}>Buzon de Voz</option>
              <option value={"NoExiste"}>Numero No Existe</option>
              <option value={"NoContesta"}>No Contesta</option>
            </select>
          </div>
        }
        {formData && formData.contesto_sn == "s" &&
          <div className='flex gap-2'>
            <select defaultValue={formData.llamada_efectiva_sn || "Seleccione"} className="select select-sm" name='llamada_efectiva_sn' onChange={handleChangeContesta}>
              <option disabled={true}>Seleccione</option>
              <option value={"s"}>Efectivo</option>
              <option value={"n"}>No Efectivo</option>
            </select>
            {formData && formData.llamada_efectiva_sn == "n" &&
              <select defaultValue={formData.respuesta_llamada || "Seleccione"} className="select select-sm" name='respuesta_llamada' onChange={handleChangeRespuesta}>
                <option disabled={true}>Seleccione</option>
                <option value={"TelefonoErrado"}>Telefono Errado / No Existe</option>
                <option value={"LlamarDespues"}>Llamar Despues - No Efectivo</option>
                <option value={"ContestaCuelga"}>Contesta y Cuelga</option>
                <option value={"NoDecisiones"}>No es tomardor de decisiones</option>
                <option value={"EnvioCarta"}>Envio Carta Presentacion</option>
              </select>
            }
            {formData && formData.llamada_efectiva_sn == "s" &&
              <select defaultValue={formData.respuesta_llamada || "Seleccione"} className="select select-sm" name='respuesta_llamada' onChange={handleChangeRespuesta}>
                <option disabled={true}>Seleccione</option>
                <option value={"Solucion"}>Solucion</option>
                <option value={"Negociacion"}>Negociacion</option>
                <option value={"CierreVenta"}>Cierre de Venta</option>
                <option value={"LlamarDespues"}>Llamar Despues</option>
                <option value={"NoInteresado"}>No Interesado</option>
              </select>
            }
          </div>
        }
      {(formData && (formData.respuesta_llamada == "LlamarDespues"|| formData.respuesta_llamada == "AgendaVisita"|| formData.respuesta_llamada == "AgendaConferencia" || formData.respuesta_llamada == "Buzon" || formData.respuesta_llamada == "NoContesta"))  &&
        <input type='datetime-local' name="nueva_fecha_llamada" className='input input-sm mt-2' placeholder='Nueva Fecha Llamada' onChange={handleChange} value={formData.nueva_fecha_llamada} required/>
      }
     {(formData && (formData.respuesta_llamada == "NoInteresado"))  &&
          <select defaultValue={formData.respuesta_nointeresado || "Seleccione"} className="select select-sm mt-2" name='respuesta_nointeresado' onChange={handleChange}>
            <option disabled={true}>Seleccione</option>
            <option value={"TieneProductosClaro"}>Tiene Productos Claro</option>
            <option value={"MalaExperiencia"}>Mala Experiencia</option>
            <option value={"YaTieneAgenteAsignado"}>Ya Tiene Agente Asignado</option>
            <option value={"NoLoNecesitaCosto"}>No lo necesita costo</option>
            <option value={"NoLoNecesitaCobertura"}>No lo necesita cobertura</option>
            <option value={"NoLoNecesitaProductosClaro"}>No lo necesita productos claro</option>
          </select>
      }
    <div className='py-2'>
      <textarea onChange={handleChange} placeholder="Observaciones" name='observaciones' className="textarea border-primary textarea-md w-full" defaultValue={formData.observaciones} ></textarea>
    </div>
    </div>:
    <div className="flex justify-center h-96 items-center text-primary">
          <div role="alert" className="alert text-white bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Debe seleccionar un contacto para comenzar.</span>
          </div>
      </div>
    }
  {
    formData.id_contacto_llamada == 0 && formData.llamada_efectiva_sn == 's' &&
    <div role="alert" className="alert text-white bg-error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Si llamo a la empresa y tiene un contacto efectivo, debe crearlo y realizar la tipificacion sobre ese contacto.</span>
    </div>
  }
  </div>
    );
  }