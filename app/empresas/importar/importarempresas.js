'use client';

import { useState, useEffect } from 'react';
import Papa from "papaparse";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

export default function ImportarEmpresas({setOnChange}) {
    
  const [data, setData] = useState([]);
  const [checkForm, setCheckForm] = useState(true);

  useEffect(() => {
    function check() {
      if(data.length > 0) 
        setCheckForm(false)
      else setCheckForm(true)
    }
    check();
  }, [data]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const formattedData = result.data.map((row) => ({
            id_source : row.id_source ,
            segmento_cod_segmento: row.segmento_cod_segmento,
            segmento_relacional_cod_segmento: row.segmento_relacional_cod_segmento,
            id_tipo_doc: row.id_tipo_doc,
            numero_doc: row.numero_doc,
            digito_verifica: row.digito_verifica,
            nombre: row.nombre,
            apellido_1: row.apellido_1,
            apellido_2: row.apellido_2,
            nombre_razonsocial: row.nombre_razonsocial,
            nombre_comercial: row.nombre_comercial,
            email: row.email,
            id_clientetipo: row.id_clientetipo,
            id_pais: row.id_pais,
            pais: row.pais,
            id_departamento: row.id_departamento,
            departamento: row.departamento,
            id_ciudad: row.id_ciudad,
            ciudad: row.ciudad,
            barrio: row.barrio,
            direccion_negocio: row.direccion_negocio,
            ind_telefono1: row.ind_telefono1,
            telefono1: row.telefono1,
            ind_telefono2: row.ind_telefono2,
            telefono2: row.telefono2,
            carga_idx: row.carga_idx,
            fuentesource: row.fuentesource
          }));
          setData(formattedData);
        },
      });
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      document.getElementById('modalImportarEmpresa').close();
      const loadingToast = toast.loading("Importando empresas... ⏳");
      try {
        setCheckForm(true)
        const response = await fetch('/api/empresas/importar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        setOnChange(Math.random()) 
      
        const text = await response.text();
        const datar = JSON.parse(text); 

      console.log(datar)

        if (response.ok) {
          toast.update(loadingToast, {
            render: "Empresas importadas con éxito",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          
        } else {
          toast.update(loadingToast, {
            render: `Error: ${datar.error || "No se pudo importar las empresas"}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      
      } catch (error) {
        toast.update(loadingToast, {
          render: `Error: ${error}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };

    function cerrarForm() {
      setData([])
      document.getElementById('modalImportarEmpresa').close()
    }

    return (
  <div className="flex justify-center">
      <dialog id="modalImportarEmpresa" className="modal">

      <div className="modal-box w-11/12 max-w-11/12">
      <div className="p-1 bg-base-100">
        <div className='text-primary text-xl'>Importar Empresas CSV</div>
      <div>
      <div className="flex flex-col h-96 gap-4">
        <div className="flex gap-2 mt-4">
          <input className="input" type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
        <pre>{JSON.stringify(data[0], null, 2)}</pre>
      </div>
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={handleSubmit} type="button" className="btn btn-primary text-white" disabled={checkForm}>Importar</button>
        <button className="btn" onClick={cerrarForm}>Cerrar</button>
      </div>
    </div>
    </div>

  </dialog>
  </div>
  );
}