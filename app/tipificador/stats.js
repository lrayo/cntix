"use client";
import { useEffect, useState } from "react";
import { CircleCheck, Clock2, Info, Sparkle } from "lucide-react";

export default function Stats({rowData}) {

  const [realizadas, setRealizadas] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [efectivas, setEfectivas] = useState(0);
  const [total, setTotal] = useState();
  const fechaUTC = new Date();
  const [fechaIni, setFechaIni] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);

  useEffect(() => {
    function reload() {
      const total = rowData.length || 0;
      const realizadas = rowData.filter(item => item.intentos_llamada > 0).length
      const pendientes = rowData.filter(item => item.estado_llamada == "p").length
      const efectivas = rowData.filter(item => item.estado_llamada == "e").length
      setEfectivas(efectivas)
      setPendientes(pendientes)
      setRealizadas(realizadas)
      setTotal(total)
    }
    reload();
  }, [rowData]);

  const filtrarPorFecha = () => {
    // Convertimos las fechas a objetos Date
    const inicio = new Date(`${fechaIni}T00:00:00.000Z`).getTime();
    const fin = new Date(`${fechaFin}T23:59:59.999Z`).getTime();
  
    const filtro = rowData.filter(item => {
      if (!item.sys_fechamod) return false; // Ignorar si es null
      // Convertimos sys_fechamod a objeto Date y quitamos la hora
      const fechaItem = new Date(item.sys_fechamod).getTime() - (5 * 60 * 60 * 1000);
      return fechaItem >= inicio && fechaItem <= fin;
    });

    const realizadas = filtro.filter(item => item.intentos_llamada > 0).length
    const pendientes = filtro.filter(item => item.estado_llamada == "p").length
    const efectivas = filtro.filter(item => item.estado_llamada == "e").length
    setEfectivas(efectivas)
    setPendientes(pendientes)
    setRealizadas(realizadas)

  };

  return (
    <div className="grid justify-center">
   
      <div>
      <div className="stats shadow">

        <div className="stat">
          <div className="stat-figure text-primary">
            <Info />
          </div>
          <div className="stat-title">Programadas</div>
          <div className="stat-value">{total}</div>
          <div className="stat-desc">Total</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-primary">
            <CircleCheck />
          </div>
          <div className="stat-title">Contactadas</div>
          <div className="stat-value">{realizadas}</div>
          <div className="stat-desc">({((realizadas/total)*100).toFixed(2)} %)</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-primary">
            <Clock2 />
          </div>
          <div className="stat-title">Pendientes</div>
          <div className="stat-value">{pendientes}</div>
          <div className="stat-desc">({((pendientes/total)*100).toFixed(2)} %)</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-primary">
            <Sparkle />
          </div>
          <div className="stat-title">Efectivas</div>
          <div className="stat-value">{efectivas}</div>
          <div className="stat-desc">({((efectivas/total)*100).toFixed(2)} %)</div>
        </div>
      </div>
      <div className="flex justify-center gap-2 pt-2 items-end">
      <div className='flex flex-col'>
        <div className='text-xs'>
          Fecha Inicio
        </div>
        <input type='date' className='input input-sm' value={fechaIni} onChange={(e)=>setFechaIni(e.target.value)}/>
      </div>
      <div className='flex flex-col'>
        <div className='text-xs'>
          Fecha Fin
        </div>
        <input type='date' className='input input-sm' value={fechaFin} onChange={(e)=>setFechaFin(e.target.value)}/>
      </div>
      <button className='btn btn-sm btn-primary' onClick={filtrarPorFecha}>Filtrar</button>
      </div>
     
      </div>
       
    </div>
  );
}
