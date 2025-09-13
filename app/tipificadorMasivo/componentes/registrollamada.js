'use client';

export default function RegistroLlamada({formData, setFormData, setTab}) {

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeContestoLlamada = (e) => {
    if (e.target.value == "n") {
      setFormData({
        ...formData,
        contesto_sn: e.target.value,
        llamada_efectiva_sn: "n",
        respuesta_llamada: ""
      });
    } else {
      setFormData({
        ...formData,
        contesto_sn: e.target.value,
        llamada_efectiva_sn: "",
        respuesta_llamada: ""
      });
    }
  };

  const handleChangeContesta = (e) => {
    setFormData({
      ...formData,
      llamada_efectiva_sn: e.target.value,
      respuesta_llamada: ""
    });
  };

  const handleChangeRespuesta = (e) => {
    if (
      e.target.value == "LlamarDespues" ||
      e.target.value == "Buzon" ||
      e.target.value == "NoContesta"
    ) {
      setFormData({
        ...formData,
        respuesta_llamada: e.target.value,
        respuesta_nointeresado: "",
        nueva_fecha_llamada: "required"
      });
    } else if (e.target.value != "NoInteresado") {
      setFormData({
        ...formData,
        respuesta_nointeresado: "",
        respuesta_llamada: e.target.value,
        nueva_fecha_llamada: ""
      });
    } else {
      setFormData({
        ...formData,
        respuesta_llamada: e.target.value,
        nueva_fecha_llamada: ""
      });
    }

    if (e.target.value == "NoDecisiones") setTab(3);
  };

  console.log(formData);

  return (
    <div className="">
      {formData && formData.numero_llamada ? (
        <div>
          <div className="font-bold text-primary text-lg py-6">
            Registro de Llamada
          </div>
          <div className="mb-4 text-lg font-semibold flex flex-col gap-2">
            {formData.nombre_contacto_llamada}
            <span className="badge badge-ghost">
              Numero Marcado: {formData.numero_llamada}
            </span>
          </div>

          {/* Contesto llamada */}
          <div className="flex gap-2 items-center py-2">
            <div>Contesto llamada?</div>
            <select
              defaultValue={formData.contesto_sn || "Seleccione"}
              className="select select-sm"
              name="contesto_sn"
              onChange={handleChangeContestoLlamada}
            >
              <option disabled={true}>Seleccione</option>
              <option value={"s"}>Si</option>
              <option value={"n"}>No</option>
            </select>
          </div>

          {/* No contesto */}
          {formData && formData.contesto_sn == "n" && (
            <div>
              <select
                defaultValue={formData.respuesta_llamada || "Seleccione"}
                className="select select-sm"
                name="respuesta_llamada"
                onChange={handleChangeRespuesta}
              >
                <option disabled={true}>Seleccione</option>
                <option value={"Buzon"}>Contestador</option>
                <option value={"NoContesta"}>No contesta</option>
                <option value={"NoExiste"}>Telefono errado</option>
                <option value={"desconectado"}>Telefono desconectado</option>
                <option value={"Telefono_dañado"}>Telefono dañado</option>
                <option value={"Fax"}>Fax</option>
                <option value={"Otros_tonos"}>Otros tonos</option>
              </select>
            </div>
          )}

          {/* Si contesto */}
          {formData && formData.contesto_sn == "s" && (
            <div className="grid grid-cols-2 gap-2">
              <select
                defaultValue={formData.llamada_efectiva_sn || "Seleccione"}
                className="select select-sm"
                name="llamada_efectiva_sn"
                onChange={handleChangeContesta}
              >
                <option disabled={true}>Seleccione</option>
                <option value={"s"}>Efectivo</option>
                <option value={"n"}>No Efectivo</option>
              </select>

              {formData.llamada_efectiva_sn == "n" && (
                <select
                  defaultValue={formData.respuesta_llamada || "Seleccione"}
                  className="select select-sm"
                  name="respuesta_llamada"
                  onChange={handleChangeRespuesta}
                >
                  <option disabled={true}>Seleccione</option>
                  <option value={"Volver_a_Llamar"}>Volver a Llamar</option>
                  <option value={"Cliente_cuelga"}>Cliente cuelga</option>
                  <option value={"No_hay_contacto_con_el_titular"}>
                    No hay contacto con el titular
                  </option>
                </select>
              )}

              {formData.llamada_efectiva_sn == "s" && (
                <>
                  <select
                    defaultValue={formData.respuesta_llamada || "Seleccione"}
                    className="select select-sm"
                    name="respuesta_llamada"
                    onChange={handleChangeRespuesta}
                  >
                    <option disabled={true}>Seleccione</option>
                    <option value={"Venta"}>Venta</option>
                    <option value={"NoVenta"}>No venta</option>
                  </select>

                  {/* Selector cuando es Venta */}
                  {formData.respuesta_llamada == "Venta" && (
                    <select
                      defaultValue={formData.tipo_venta || "Seleccione"}
                      className="select select-sm"
                      name="tipo_venta"
                      onChange={handleChange}
                    >
                      <option disabled={true}>Seleccione</option>
                      <option value={"Movil"}>Movil</option>
                      <option value={"Divergente"}>Divergente</option>
                    </select>
                  )}

                  {/* Selector cuando es NoVenta */}
                  {formData.respuesta_llamada == "NoVenta" && (
                    <>
                      <select
                        defaultValue={formData.motivo_no_venta || "Seleccione"}
                        className="select select-sm"
                        name="motivo_no_venta"
                        onChange={handleChange}
                      >
                        <option disabled={true}>Seleccione</option>
                        <option value={"NoLePareceAtractiva"}>
                          No le parece atractiva la oferta
                        </option>
                        <option value={"MejoresPromociones"}>
                          Mejores promociones
                        </option>
                        <option value={"NoAptoCartera"}>No apto cartera</option>
                        <option value={"NoAptoCartera90Dias"}>
                          No apto cartera / Restriccion cliente no cumple 90 dias
                        </option>
                        <option value={"ProblemasCobertura"}>
                          Problemas de señal / Cobertura movil
                        </option>
                        <option value={"ClienteCorporativo"}>
                          Cliente corporatvo
                        </option>
                        <option value={"NoVolverALlamar"}>
                          Cliente pide no volver a llamar
                        </option>
                        <option value={"YaTienePlanPospago"}>
                          Ya tiene plan pospago con claro
                        </option>
                        <option value={"DesconfiaTelefonicos"}>
                          Cliente desconfia de tramites telefonicos
                        </option>
                      </select>

                      {/* Subselector cuando es No le parece atractiva */}
                      {formData.motivo_no_venta == "NoLePareceAtractiva" && (
                        <select
                          defaultValue={formData.detalle_no_atractiva || "Seleccione"}
                          className="select select-sm"
                          name="detalle_no_atractiva"
                          onChange={handleChange}
                        >
                          <option disabled={true}>Seleccione</option>
                          <option value={"Precio"}>Precio</option>
                          <option value={"Producto"}>Producto</option>
                          <option value={"MalaExperiencia"}>
                            Mala experiencia con procesos de claro
                          </option>
                        </select>
                      )}
                      {/* Subselector cuando es Mejores Promociones */}
                      {formData.motivo_no_venta == "MejoresPromociones" && (
                        <select
                          defaultValue={formData.detalle_mejores_promociones || "Seleccione"}
                          className="select select-sm"
                          name="detalle_mejores_promociones"
                          onChange={handleChange}
                        >
                          <option disabled={true}>Seleccione</option>
                          <option value={"ETB"}>ETB</option>
                          <option value={"TIGO"}>TIGO</option>
                          <option value={"MOVISTAR"}>MOVISTAR</option>
                          <option value={"FLASH"}>FLASH</option>
                          <option value={"WOM"}>WOM</option>
                        </select>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Nueva fecha llamada */}
          {(formData &&
            (formData.respuesta_llamada == "LlamarDespues" ||
              formData.respuesta_llamada == "AgendaVisita" ||
              formData.respuesta_llamada == "AgendaConferencia" ||
              formData.respuesta_llamada == "Buzon" ||
              formData.respuesta_llamada == "NoContesta")) && (
            <input
              type="datetime-local"
              name="nueva_fecha_llamada"
              className="input input-sm mt-2"
              placeholder="Nueva Fecha Llamada"
              onChange={handleChange}
              value={formData.nueva_fecha_llamada}
              required
            />
          )}

          {/* No interesado */}
          {formData && formData.respuesta_llamada == "NoInteresado" && (
            <select
              defaultValue={formData.respuesta_nointeresado || "Seleccione"}
              className="select select-sm mt-2"
              name="respuesta_nointeresado"
              onChange={handleChange}
            >
              <option disabled={true}>Seleccione</option>
              <option value={"TieneProductosClaro"}>
                Tiene Productos Claro
              </option>
              <option value={"MalaExperiencia"}>Mala Experiencia</option>
              <option value={"YaTieneAgenteAsignado"}>
                Ya Tiene Agente Asignado
              </option>
              <option value={"NoLoNecesitaCosto"}>No lo necesita costo</option>
              <option value={"NoLoNecesitaCobertura"}>
                No lo necesita cobertura
              </option>
              <option value={"NoLoNecesitaProductosClaro"}>
                No lo necesita productos claro
              </option>
            </select>
          )}

          {/* Observaciones */}
          <div className="py-2">
            <textarea
              onChange={handleChange}
              placeholder="Observaciones"
              name="observaciones"
              className="textarea border-primary textarea-md w-full"
              defaultValue={formData.observaciones}
            ></textarea>
          </div>
        </div>
      ) : (
        <div className="flex justify-center h-96 items-center text-primary">
          <div role="alert" className="alert text-white bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Debe seleccionar un contacto para comenzar.</span>
          </div>
        </div>
      )}

      {/* Validación contacto */}
      {formData.id_contacto_llamada == 0 &&
        formData.llamada_efectiva_sn == "s" && (
          <div role="alert" className="alert text-white bg-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              Si llamo a la empresa y tiene un contacto efectivo, debe crearlo y
              realizar la tipificacion sobre ese contacto.
            </span>
          </div>
        )}
    </div>
  );
}
