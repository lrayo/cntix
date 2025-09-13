'use client';

import { useState, useEffect } from 'react';

export default function ComunForm({ rowClientes, rowSegMer, rowSegRel, rowCiudades, rowSectores, formData, setFormData, rowFuenteTipo }) {
  
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
      <table className='table table-sm'>
        <tbody>
          <tr>
            <td className='font-semibold w-1/4'>Source</td>
            <td className=''>
              <select onChange={handleChange} name='id_fuente' className='select select-sm' defaultValue={formData.id_source || ""}>
                <option value="">Seleccione...</option>
                {rowClientes.map((item) => (
                  <option key={item.id_source} value={item.id_source}>
                    {item.nombre_comercial}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Fuente Tipo</td>
            <td className=''>
              <select onChange={handleChange} name='id_sourcefuentetipo' className='select select-sm' defaultValue={formData.id_sourcefuentetipo || ""}>
                <option value=''>Seleccione...</option>
                {rowFuenteTipo.map((item) => (
                  <option key={item.id_sourcefuentetipo} value={item.id_sourcefuentetipo}>
                    {item.des_tiposourcefuente}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Segmento Mercado</td>
            <td className=''>
              <select onChange={handleChange} name='segmento_mercado_cod_segmento' className='select select-sm' defaultValue={formData.segmento_mercado_cod_segmento || ""}>
                <option value=''>Seleccione...</option>
                {rowSegMer.map((segmento) => (
                  <option key={segmento.id_segjerrec} value={segmento.id_segjerrec}>
                    {segmento.descnivel_rec}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className='font-semibold'>Segmento Relacional</td>
            <td className=''>
              <select onChange={handleChange} name='segmento_relacional_cod_segmento' className='select select-sm' defaultValue={formData.segmento_relacional_cod_segmento || ""}>
                <option value=''>Seleccione...</option>
                {rowSegRel.map((segmento) => (
                  <option key={segmento.id_segjerrec} value={segmento.id_segjerrec}>
                    {segmento.descnivel_rec}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          {paisFiltro &&
          <tr>
            <td className='font-semibold'>Pais</td>
            <td className=''>
              <select onChange={handleChangePais} name='id_pais' className='select select-sm' defaultValue={formData.id_pais || ""}>
                <option value=''>Seleccione...</option>
                {paisFiltro.map((pais) => (
                  <option key={pais.PaisID} value={pais.PaisID}>
                    {pais.Pais}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          }
          {departamentoFiltro &&
          <tr>
            <td className='font-semibold'>Departameto</td>
            <td className=''>
              <select onChange={handleChangeDepartamento} name='id_departamento' className='select select-sm' defaultValue={formData.id_departamento || ""}>
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
            <td className='font-semibold'>Ciudad</td>
            <td className=''>
              <select onChange={handleChangeCiudad} name='id_ciudad' className='select select-sm' defaultValue={formData.id_ciudad || ""}>
                <option value=''>Seleccione...</option>
                {ciudadFiltro.map((ciudad) => (
                  <option key={ciudad.CiudadID} value={ciudad.CiudadID}>
                    {ciudad.Ciudad}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          }
          {rowSectores &&
          <tr>
            <td className='font-semibold'>Sector Economico</td>
            <td className=''>
              <select onChange={handleChange} name='id_sector' className='select select-sm' defaultValue={formData.id_sector || ""}>
                <option value=''>Seleccione...</option>
                {rowSectores.map((sector) => (
                  <option key={sector.id_sector} value={sector.id_sector}>
                    {sector.desc_sector}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          }
          <tr>
            <td className='font-semibold'>Fuente Source</td>
            <td className=''>
              <select onChange={handleChange} name='fuentesource' className='select select-sm' defaultValue={formData.fuentesource || ""}>
                <option value=''>Seleccione...</option>
                <option value='CARTERIZADOS CLARO'>CARTERIZADOS CLARO</option>
                <option value='CONECTIX'>CONECTIX</option>
                <option value='SOHO'>SOHO</option>
                <option value='UNIFICADA'>UNIFICADA</option>
                <option value='BARRIDO'>BARRIDO</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}