'use client';

import { useState, useEffect } from 'react';

export default function ComunForm({ rowTipoDoc, rowCiudades, formData, setFormData }) {
  
  const [paises, setPaises] = useState(false);
  const [departamentos, setDepartamentos] = useState(false);
  const [paisFiltro, setPaisFiltro] = useState(false);
  const [departamentoFiltro, setDepartamentoFiltro] = useState(false);
  const [ciudadFiltro, setCiudadFiltro] = useState(rowCiudades);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangePais = (e) => {
    if (e.target.value) {
    const filtrado = departamentos.filter((item) => Number(item.PaisID) === Number(e.target.value));
    const paisesFiltrados = paises.filter((pais) => Number(pais.PaisID) === Number(e.target.value));
    setDepartamentoFiltro(filtrado);
    setFormData({...formData, [e.target.name]: e.target.value, "pais": paisesFiltrados[0].Pais, "departamento":"", "id_departamento":"" , "ciudad":"", "id_ciudad":"" });
    setCiudadFiltro(rowCiudades);
  }else {
      setDepartamentoFiltro(departamentos);
    }
  };

  const handleChangeDepartamento = (e) => {
    if (e.target.value) {
    const filtrado = rowCiudades.filter((ciudad) => Number(ciudad.DivisionID) === Number(e.target.value));
    const departFiltrados = departamentos.filter((item) => Number(item.DivisionID) === Number(e.target.value));
    setCiudadFiltro(filtrado);
    setFormData({...formData, [e.target.name]: e.target.value, "departamento": departFiltrados[0].Division, "ciudad":"", "id_ciudad":"" });
    }else {
      setCiudadFiltro(rowCiudades);
    }
  };

  const handleChangeCiudad = (e) => {
    if (e.target.value) {
    const filtrado = rowCiudades.filter((ciudad) => Number(ciudad.CiudadID) === Number(e.target.value));
    setFormData({...formData, [e.target.name]: e.target.value, "ciudad": filtrado[0].Ciudad});
  };
  };

  useEffect(() => {
    function filtros() {
      const paises = [...new Map(rowCiudades.map(item => [item.PaisID, item])).values()];
      setPaises(paises)
      setPaisFiltro(paises)
      const depart = [...new Map(rowCiudades.map(item => [item.DivisionID, item])).values()];
      setDepartamentos(depart)
      setDepartamentoFiltro(depart)
    }
    filtros();
  }, [rowCiudades]);

  return (
    <div>
      <table className='table table-sm w-full'>
        <tbody>
          <tr>
            <td className='p-2'>
            <div className='text-sm font-semibold'>Tipo Documento</div>
              <select onChange={handleChange} name='id_tipo_doc' className='select select-sm'>
                <option value=''>Seleccione...</option>
                {rowTipoDoc.map((documento) => (
                  <option key={documento.id_tipodoc} value={documento.id_tipodoc}>
                    {documento.nombre_doc}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <div className='text-sm font-semibold'>Numero Documento</div>
              <input type='text' name="numero_doc" className='input input-sm ' onChange={handleChange} />
              <input type='text' name="dv" placeholder="dv" className='input input-sm w-12' onChange={handleChange} />
          </td>
          </tr>
          {paisFiltro && departamentoFiltro &&
          <tr>
            <td className=''>
            <div className='text-sm font-semibold'>Pais</div>
              <select onChange={handleChangePais} name='id_pais' className='select select-sm'>
                <option value=''>Seleccione...</option>
                {paisFiltro.map((pais) => (
                  <option key={pais.PaisID} value={pais.PaisID}>
                    {pais.Pais}
                  </option>
                ))}
              </select>
            </td>
            <td className=''>
            <div className='text-sm font-semibold'>Departameto</div>
              <select onChange={handleChangeDepartamento} name='id_departamento' className='select select-sm'>
                <option value=''>Seleccione...</option>
                {departamentoFiltro.map((dep) => (
                  <option key={dep.DivisionID} value={dep.DivisionID}>
                    {dep.Division}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          }
          {ciudadFiltro &&
          <tr>
            
            <td className=''>
            <div className='text-sm font-semibold'>Ciudad</div>
              <select onChange={handleChangeCiudad} name='id_ciudad' className='select select-sm'>
                <option value=''>Seleccione...</option>
                {ciudadFiltro.map((ciudad) => (
                  <option key={ciudad.CiudadID} value={ciudad.CiudadID}>
                    {ciudad.Ciudad}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <div className='text-sm font-semibold'>Dirección</div>
              <input type='text' name="direccion_negocio" className='input input-sm ' onChange={handleChange} />
            </td>
          </tr>
          }
          <tr>
            <td>
              <div className='text-sm font-semibold'>Razón Social</div>
              <input type='text' name="nombre_razonsocial" className='input input-sm ' onChange={handleChange} />
            </td>
            <td>
              <div className='text-sm font-semibold'>Nombre Comercial</div>
              <input type='text' name="nombre_comercial" className='input input-sm ' onChange={handleChange} />
            </td>
          </tr>
          <tr>
            <td>
              <div className='text-sm font-semibold'>Email</div>
              <input type='text' name="email" className='input input-sm ' onChange={handleChange} />
            </td>
            <td>
              <div className='text-sm font-semibold'>Zip Code</div>
              <input type='text' name="zip_code" className='input input-sm ' onChange={handleChange} />
            </td>
          </tr>
          <tr>
            <td>
              <div className='text-sm font-semibold'>Indicativo Teléfono</div>
              <input type='text' name="indicativo_tel" className='input input-sm ' onChange={handleChange} />
            </td>
            <td>
              <div className='text-sm font-semibold'>Teléfono 1</div>
              <input type='text' name="telefono" className='input input-sm ' onChange={handleChange} />
            </td>
          </tr>
          <tr>
            <td>
              <div className='text-sm font-semibold'>Celular</div>
              <input type='text' name="celular" className='input input-sm ' onChange={handleChange} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}