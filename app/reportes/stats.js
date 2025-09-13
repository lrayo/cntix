"use client";
import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Info, Sparkle } from "lucide-react";

export default function Stats({rowTotal, setRowData}) {

  const [contestadas, setContestadas] = useState(0);
  const [efectivas, setEfectivas] = useState(0);
  const [total, setTotal] = useState(0);
  const fechaUTC = new Date();
  const [fechaIni, setFechaIni] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);

  useEffect(() => {
    function reload() {
      const efectivas = rowTotal.filter(item => item.llamada_efectiva_sn == "s").length
      setEfectivas(efectivas)
      const contestadas = rowTotal.filter(item => item.contesto_sn == "s").length
      setContestadas(contestadas)
      setTotal(rowTotal.length)
    }
    reload();
  }, [rowTotal]);

  const filtrarPorFecha = () => {
    // Convertimos las fechas a objetos Date
    const inicio = new Date(`${fechaIni}T00:00:00.000Z`).getTime();
    const fin = new Date(`${fechaFin}T23:59:59.999Z`).getTime();
  
    const filtro = rowTotal.filter(item => {
      if (!item.sys_fechamod) return false; // Ignorar si es null
      // Convertimos sys_fechamod a objeto Date y quitamos la hora
      const fechaItem = new Date(item.sys_fechamod).getTime() - (5 * 60 * 60 * 1000);
      return fechaItem >= inicio && fechaItem <= fin;
    });
    const total = filtro.length || 0;
    setTotal(total)
    const efectivas = filtro.filter(item => item.llamada_efectiva_sn == "s").length
    setEfectivas(efectivas)
    const contestadas = filtro.filter(item => item.contesto_sn == "s").length
    setContestadas(contestadas)
    setRowData(filtro)
  };

  return (
    <div className="grid justify-center">
      {rowTotal && 
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Info />
          </div>
          <div className="stat-title">Llamadas Realizadas</div>
          <div className="stat-value">{total}</div>
          <div className="stat-desc">Total</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-red-700">
            <CircleX />
          </div>
          <div className="stat-title">Llamadas No Contestadas</div>
          <div className="stat-value">{total - contestadas}</div>
          <div className="stat-desc">({(((total - contestadas)/total)*100).toFixed(2)} %)</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-green-700">
            <CircleCheck />
          </div>
          <div className="stat-title">Llamadas Contestadas</div>
          <div className="stat-value">{contestadas}</div>
          <div className="stat-desc">({((contestadas/total)*100).toFixed(2)} %)</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-yellow-500">
            <Sparkle />
          </div>
          <div className="stat-title">Llamadas Efectivas</div>
          <div className="stat-value">{efectivas}</div>
          <div className="stat-desc">({((efectivas/total)*100).toFixed(2)} %)</div>
        </div>
      </div>
      }
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
  );
}
