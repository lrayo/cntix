"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function CargarDetProgramacion() {
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
    setCheckForm(true)
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const formattedData = result.data.map((row) => ({
            id_programacion: row.id_programacion,
            id_empresalead: row.id_empresalead,
            id_usuario: row.id_usuario,
            fecha_llamada: row.fecha_llamada,
          }));
          setData(formattedData);
        },
      });
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setCheckForm(true)
      try {
       if(data){
        const response = await fetch('/api/programaciones/detalle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        document.getElementById('modalAsignarLeads').close();
        const text = await response.text();
        //console.log("Respuesta del servidor:", text);
        if (!text) throw new Error("Respuesta vacía del servidor");
    
        const datamsg = JSON.parse(text); 
        alert(datamsg.message || 'Error en la inserción');
       }

  
      } catch (error) {
        console.error('Error:', error);
        alert("Error al enviar los datos. Revisa la consola.");
      }
    };

  return (
    <div className="flex flex-col h-96 gap-4">
      <div className="flex gap-2 mt-4">
        <input className="input" type="file" accept=".csv" onChange={handleFileUpload} />
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={checkForm}>Cargar </button>
      </div>
      <pre>{JSON.stringify(data[0], null, 2)}</pre>
    </div>
  );
}
