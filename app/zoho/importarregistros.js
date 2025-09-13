'use client';

import { useState, useEffect } from 'react';
import Papa from "papaparse";

export default function ImportarRegistros({setOnChange}) {
    
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
            id_empresalead : row.id_empresalead ,
            id_usuario: row.id_usuario,
            id_programacion: row.id_programacion,
            id_contacto_llamada: row.id_contacto_llamada,
            numero_llamada: row.numero_llamada,
          }));
          setData(formattedData);
        },
      });
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        
       if(data){
        setCheckForm(true)
        const response = await fetch('/api/integraciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setOnChange(Math.random()) 
        document.getElementById('modalImportarRegistros').close();
        const text = await response.text();
        console.log("Respuesta del servidor:", text);
        if (!text) throw new Error("Respuesta vacía del servidor");
    
        const datamsg = JSON.parse(text); 
        alert(datamsg.message || 'Error en la inserción');
       }

  
      } catch (error) {
        console.error('Error:', error);
        alert("Error al enviar los datos. Revisa la consola.");
      }
    };

    function cerrarForm() {
      setData([])
      document.getElementById('modalImportarRegistros').close()
    }

    return (
  <div className="flex justify-center">
      <dialog id="modalImportarRegistros" className="modal">

      <div className="modal-box w-11/12 max-w-11/12">
      <div className="p-1 bg-base-100">
        <div className='text-primary text-xl'>Importar Registros CRM - Zoho</div>
      <div>
      <div className="flex flex-col h-96 gap-4">
        <div className="flex gap-2 mt-4">
          <input className="input" type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
        <div className='flex gap-2 justify-center'>
          <div>Archivo
            <pre>{JSON.stringify(data[0], null, 2)}</pre>
          </div>
        </div>
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