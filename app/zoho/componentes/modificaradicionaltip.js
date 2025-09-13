import { useState } from "react";

export default function ModInfoAdicional({ rowData, setModDataAd, setOnChange }) {

  const [status, setStatus] = useState(false);
  const [formData, setFormData] = useState(rowData);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus(true)
      const response = await fetch('/api/empresas/infoadicional', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setModDataAd(false)
      setOnChange(Math.random()) 
      const text = await response.text(); // Lee el texto primero
      //console.log("Respuesta del servidor:", text); // 👀 Verifica qué devuelve el servidor
  
      if (!text) throw new Error("Respuesta vacía del servidor");
  
      const data = JSON.parse(text); // Intenta parsear JSON
      alert(data.message || 'Error en la inserción');
  
    } catch (error) {
      console.error('Error:', error);
      alert("Error al enviar los datos. Revisa la consola.");
    }
  };
  //console.log(formData)
  return (
    <div className="grid justify-center w-full mt-4">
        <table className="w-full table">
          <tbody>
            <tr>
              <td className="pr-2">
              <div className="font-bold text-sm">Plan Actual</div>
                <input disabled={status} 
                  type="text" 
                  name="plan_actual" 
                  placeholder="Ingrese Plan"
                  className="input input-sm" 
                  onChange={handleChange} 
                  value={formData.plan_actual || ""}
                />
              </td>
              <td >
              <div className="font-bold text-sm">Costo Fijo Mensual</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="costo_fijo_mensual" 
                  placeholder="Ingrese Costo Fijo Mensual"
                  className="input input-sm" 
                  onChange={handleChange} 
                  value={formData.costo_fijo_mensual || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="pr-2">
              <div className="font-bold text-sm">Rango Costo Fijo Mensual</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="rango_cfm" 
                  placeholder="Ingrese Rango CFM"
                  className="input input-sm" 
                  onChange={handleChange} 
                  value={formData.rango_cfm || ""}
                />
              </td>
              <td>
              <div className="font-bold text-sm">Producto</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="producto" 
                  placeholder="Ingrese Producto"
                  className="input input-sm " 
                  onChange={handleChange} 
                  value={formData.producto || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="pr-2">
              <div className="font-bold text-sm">Fuente</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="fuente" 
                  placeholder="Ingrese Fuente"
                  className="input input-sm" 
                  onChange={handleChange} 
                  value={formData.fuente || ""}
                />
              </td>
              <td>
              <div className="font-bold text-sm">Tipo Negocio</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="desc_tipo_negocio" 
                  placeholder="Tipo de Negocio"
                  className="input input-sm w-full" 
                  onChange={handleChange} 
                  value={formData.desc_tipo_negocio || ""}
                />
              </td>
            </tr>
            <tr>
              
              <td className="pr-2">
              <div className="font-bold text-sm">Zip Code</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="zip_code" 
                  placeholder="Zip Code"
                  className="w-full input input-sm" 
                  onChange={handleChange} 
                  value={formData.zip_code || ""}
                />
              </td>
              <td className="p-2">
              <div className="font-bold text-sm">Pagina Web</div>
                <input 
                  disabled={status} 
                  type="text" 
                  name="pagina_web" 
                  placeholder="Pagina Web"
                  className="w-full input input-sm" 
                  onChange={handleChange} 
                  value={formData.pagina_web || ""}
                />
              </td>
            </tr>

        
          </tbody>
        </table>

        <div className="flex justify-center gap-4 pt-6">
            <div className="flex gap-4">
              <button className="btn btn-sm btn-primary" onClick={handleSubmit}>Guardar</button>
              <button className="btn btn-sm" onClick={() => setModDataAd(false)}>Cancelar</button>
            </div>
        </div>
    </div>
  );
}