'use client';

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function InfoAdicional({ rowData, id }) {
  const defaultData = {
    id_empresalead: id,
    id_tipo_cliente: "",
    plan_actual: "",
    costo_fijo_mensual: "",
    rango_cfm: "",
    producto: "",
    fuente: "",
    estado_empresas_leads_adic: ""
  };
  const [status, setStatus] = useState(true);
  const [formData, setFormData] = useState(rowData[0] || defaultData);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Actualizando Informacion");
    try {
      setStatus(true)
      const response = await fetch('/api/empresas/infoadicional', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const text = await response.text(); // Lee el texto primero
      //console.log("Respuesta del servidor:", text); // 👀 Verifica qué devuelve el servidor
      const data = JSON.parse(text); // Intenta parsear JSON
    
      if (response.ok) {
        toast.update(loadingToast, {
          render: "Información actualizada con éxito",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        
      } else {
        toast.update(loadingToast, {
          render: `Error: ${data.error || "No se pudo actualizar"}`,
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
  //console.log(formData)
  return (
    <div className="grid justify-center w-full">
      <div className="text-xl text-primary pb-4">Información Adicional</div>
        <table className="table table-sm ">
          <tbody>
            <tr>
              <td className="font-bold p-2">Plan Actual:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="plan_actual" 
                  placeholder="Ingrese Plan"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.plan_actual || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Costo Fijo Mensual:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="costo_fijo_mensual" 
                  placeholder="Ingrese Costo Fijo Mensual"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.costo_fijo_mensual || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Rango Costo Fijo Mensual:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="rango_cfm" 
                  placeholder="Ingrese Rango CFM"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.rango_cfm || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Producto:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="producto" 
                  placeholder="Ingrese Producto"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.producto || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Fuente:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="fuente" 
                  placeholder="Ingrese Fuente"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.fuente || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Tipo Negocio:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="desc_tipo_negocio" 
                  placeholder="Tipo de Negocio"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.desc_tipo_negocio || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Zip Code:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="zip_code" 
                  placeholder="Zip Code"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.zip_code || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Pagina Web:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="pagina_web" 
                  placeholder="Pagina Web"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.pagina_web || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Latitud:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="latitud" 
                  placeholder="Latitud"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.latitud || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Longitud:</td>
              <td className="p-2">
                <input 
                  disabled={status} 
                  type="text" 
                  name="longitud" 
                  placeholder="Longitud"
                  className="w-full input input-sm border-primary" 
                  onChange={handleChange} 
                  value={formData.longitud || ""}
                />
              </td>
            </tr>
          </tbody>
        </table>

      <div className="flex justify-center gap-4 pt-6">
      {!status ? (
          <div className="flex gap-4">
            <button className="btn btn-primary text-white" onClick={handleSubmit}>Guardar</button>
            <button className="btn" onClick={() => setStatus(true)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn btn-primary text-white" onClick={() => setStatus(false)}>Modificar</button>
        )}
      </div>
    </div>
  );
}