'use client';

export default function PersonasForm({ rowTipoDoc, formData, handleChange }) {
  return (
    <div>
      <table className='table table-sm'>
        <tbody>
          <tr>
            <td className='font-semibold'>Tipo Documento</td>
            <td className=''>
              <select onChange={handleChange} name='id_tipo_doc' className='select select-sm' defaultValue={formData.id_tipo_doc || ""}>
                <option value=''>Seleccione...</option>
                {rowTipoDoc.map((documento) => (
                  <option key={documento.id_tipodoc} value={documento.id_tipodoc}>
                    {documento.nombre_doc}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Número de Documento <span className="text-red-500">*</span></td>
            <td>
              <input type='text' name='numero_doc' className='input input-sm' onChange={handleChange} value={formData.numero_doc || ""} required />
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Nombre <span className="text-red-500">*</span></td>
            <td>
              <input type='text' name='nombre' className='input input-sm' onChange={handleChange} value={formData.nombre || ""} required />
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Primer Apellido <span className="text-red-500">*</span></td>
            <td>
              <input type='text' name='apellido_1' className='input input-sm' onChange={handleChange} value={formData.apellido_1 || ""} required/>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Segundo Apellido</td>
            <td>
              <input type='text' name='apellido_2' className='input input-sm' onChange={handleChange} value={formData.apellido_2 || ""}/>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Email</td>
            <td>
              <input type='text' name='email' className='input input-sm' onChange={handleChange}  value={formData.email || ""}/>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Dirección</td>
            <td>
              <input type='text' name='direccion_negocio' className='input input-sm' onChange={handleChange}  value={formData.direccion_negocio || ""}/>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Barrio</td>
            <td>
              <input type='text' name='barrio' className='input input-sm' onChange={handleChange}  value={formData.barrio || ""}/>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Indicativo Teléfono 1</td>
            <td>
              <input type='text' name='ind_telefono1' className='input input-sm' onChange={handleChange}  value={formData.ind_telefono1 || ""}/>
            </td>
          </tr>
          <tr>
            <td className='font-semibold w-1/4'>Teléfono 1 <span className="text-red-500">*</span></td>
            <td>
              <input type='text' name='telefono1' className='input input-sm' onChange={handleChange} value={formData.telefono1 || ""} required/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}