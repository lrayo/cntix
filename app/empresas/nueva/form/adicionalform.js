'use client';

export default function AdicionalForm({ formDataAd, handleChangeAd }) {


  return (
    <div className="flex justify-center items-center max-w-3xl">
        <table className=" table table-sm">
          <tbody>
            <tr>
              <td className="font-bold">Plan Actual:</td>
              <td>
                <input 
                  type="text" 
                  name="plan_actual" 
                  placeholder="Ingrese Plan"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.plan_actual || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Costo Fijo Mensual:</td>
              <td>
                <input 
                  type="text" 
                  name="costo_fijo_mensual" 
                  placeholder="Ingrese Costo Fijo Mensual"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.costo_fijo_mensual || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Rango Costo Fijo Mensual:</td>
              <td>
                <input 
                  type="text" 
                  name="rango_cfm" 
                  placeholder="Ingrese Rango CFM"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.rango_cfm || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Producto:</td>
              <td>
                <input 
                  type="text" 
                  name="producto" 
                  placeholder="Ingrese Producto"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.producto || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Tipo Negocio:</td>
              <td>
                <input 
                  type="text" 
                  name="desc_tipo_negocio" 
                  placeholder="Tipo de Negocio"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.desc_tipo_negocio || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Zip Code:</td>
              <td>
                <input 
                  type="text" 
                  name="zip_code" 
                  placeholder="Zip Code"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.zip_code || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Pagina Web:</td>
              <td>
                <input 
                  type="text" 
                  name="pagina_web" 
                  placeholder="Pagina Web"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.pagina_web || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Latitud:</td>
              <td>
                <input 
                  type="text" 
                  name="latitud" 
                  placeholder="Latitud"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.latitud || ""}
                />
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Longitud:</td>
              <td>
                <input 
                  type="text" 
                  name="longitud" 
                  placeholder="Longitud"
                  className="input input-sm border-primary" 
                  onChange={handleChangeAd} 
                  value={formDataAd.longitud || ""}
                />
              </td>
            </tr>
          </tbody>
        </table>
    </div>
  );
}