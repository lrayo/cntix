'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function VerDetalles({idProgramacion, setIdProgramacion}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowDetalles, setRowDetalles] = useState([]);
    const [barrido, setBarrido] = useState();
    const [contactados, setContactados] = useState();
    const [efectivos, setEfectivos] = useState();
    const fechaUTC = new Date();
    const [fechaIni, setFechaIni] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);
    const [fechaFin, setFechaFin] = useState(new Date(fechaUTC.getTime() - (5 * 60 * 60 * 1000)).toISOString().split("T")[0]);
    const [tab, setTab] = useState(1);
    const [porUsuario, setPorUsuario] = useState(false);
    const gridRef = useRef(null);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const [det, prog] = await Promise.all([
            fetch(`/api/programaciones/detalle/idprog?id=${idProgramacion}`),
            fetch(`/api/programaciones/id?id=${idProgramacion}`),
          ]);
  
          if (!det.ok && !prog.ok) throw new Error("Error al obtener los datos");
        
          const data2 = await det.json();
          const data = await prog.json();
          const agrupado = agruparLlamadasPorUsuario(data2)
          setPorUsuario(agrupado)
          setRowDetalles(data2);
          //setRowData(data[0]);
          const barrido = data2.filter(item => item.intentos_llamada > 0).length
          setBarrido(barrido)
          const contactados = data2.filter(item => item.estado_llamada == "e" || item.estado_llamada == "n").length
          setContactados(contactados)
          const efectivos = data2.filter(item => item.estado_llamada == "e").length
          setEfectivos(efectivos)

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [idProgramacion]);

    const [colDefs] = useState([
      { field: "numero_doc", headerName: "Documento", sortable: true },
      { field: "nombre_comercial", headerName: "Nombre Comercial", width:350, sortable: true },
      { field: "nombre_programacion", headerName: "Programacion", sortable: true },
      { field: "nombre_usuario", headerName: "Agente", sortable: true },
      { field: "intentos_llamada", headerName: "Cantidad Llamadas", sortable: true },
      {
        headerName: "Estado Llamada",
        field: "estado_llamada",
        sortable: true,
        valueFormatter: (params) => {return params.value == "p" ? "Pendiente" : params.value == "e" ? "Efectiva" : params.value == "n" ? "No Efectiva" : "No Contactado" }, sortable: true },

       { field: "sys_fechacrea", headerName: "Fecha Creacion", 
            valueFormatter: (params) => {return new Date(params.value).toISOString().slice(0, 19).replace("T", " ") }, sortable: true },
    ]);

    const [colDefsUsu] = useState([
      { field: "nombre_usuario", headerName: "Agente", width:350, sortable: true },
      { field: "total", headerName: "Asignados", sortable: true },
      { field: "gestionados", headerName: "Gestionados", sortable: true },
      { field: "contestados", headerName: "Contestados", sortable: true },
      { field: "efectivos", headerName: "Efectivos", sortable: true },
   
    ]);
  
    const defaultColDef = useMemo(() => ({
      filter: true
  }), []);

  function cerrarForm(){
    document.getElementById('modalVerProgramacion').close()
    setIdProgramacion("")
  }

  const filtrarPorFecha = () => {
    // Convertimos las fechas a objetos Date
    const inicio = new Date(`${fechaIni}T00:00:00.000Z`).getTime();
    const fin = new Date(`${fechaFin}T23:59:59.999Z`).getTime();
  
    const filtro = rowDetalles.filter(item => {
      if (!item.sys_fechamod) return false; // Ignorar si es null
      // Convertimos sys_fechamod a objeto Date y quitamos la hora
      const fechaItem = new Date(item.sys_fechamod).getTime() - (5 * 60 * 60 * 1000);
      //console.log(convertirGMT5(item.sys_fechamod))
      return fechaItem >= inicio && fechaItem <= fin;
    });
  
    const barrido = filtro.filter(item => item.intentos_llamada > 0).length
    setBarrido(barrido)
    const contactados = filtro.filter(item => item.estado_llamada == "e" || item.estado_llamada == "n").length
    setContactados(contactados)
    const efectivos = filtro.filter(item => item.estado_llamada == "e").length
    setEfectivos(efectivos)
  };

  function agruparLlamadasPorUsuario(data) {
    const resultado = {};
  
    data.forEach(item => {
      const { id_usuario, nombre_usuario, estado_llamada } = item;
  
      if (!resultado[id_usuario]) {
        resultado[id_usuario] = {
          id_usuario,
          nombre_usuario,
          e: 0,
          p: 0,
          x: 0,
          n: 0,
          total: 0,
          gestionados: 0,
          contestados: 0,
          efectivos: 0
        };
      }
  
      if (['e', 'p', 'x', 'n'].includes(estado_llamada)) {
        resultado[id_usuario][estado_llamada]++;
      }
    });
  
    // Calcular los totales por usuario
    Object.values(resultado).forEach(user => {
      user.total = user.e + user.p + user.x + user.n;
      user.gestionados = user.e + user.x + user.n;
      user.contestados = user.e + user.n;
      user.efectivos = user.e;
    });
  
    // Calcular el registro de TOTALES
    const totales = {
      id_usuario: null,
      nombre_usuario: 'TOTALES',
      e: 0,
      p: 0,
      x: 0,
      n: 0,
      total: 0,
      gestionados: 0,
      contestados: 0,
      efectivos: 0
    };
  
    Object.values(resultado).forEach(user => {
      totales.e += user.e;
      totales.p += user.p;
      totales.x += user.x;
      totales.n += user.n;
      totales.total += user.total;
      totales.gestionados += user.gestionados;
      totales.contestados += user.contestados;
      totales.efectivos += user.efectivos;
    });
  
    // Retornar resultados más el total
    return [...Object.values(resultado), totales];
  }

  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv({
      fileName: 'reporte.csv',
      columnSeparator: '|'
    });
  }, []);
  
 //console.log(rowDetalles)
    return (
    <div className="flex justify-center">
        <dialog id="modalVerProgramacion" className="modal">
        {loading ?
        <div className="p-6 bg-base-100 text-black flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>:
        <div className="modal-box w-11/12 max-w-7xl ">
        <div className="p-6 bg-base-100 ">
        <div className="text-xl text-primary">Ver Programacion: {idProgramacion}</div>
        <div className="tabs tabs-box w-auto justify-center my-2">
          <input type="radio" name="my_tabs_21" className="tab" aria-label="Informe" checked={tab == 1 ?true:false} onChange={()=>setTab(1)}/>
          <input type="radio" name="my_tabs_21" className="tab" aria-label="Detalles"  checked={tab == 2 ?true:false} onChange={()=>setTab(2)}/>
          <input type="radio" name="my_tabs_21" className="tab" aria-label="Agentes"  checked={tab == 3 ?true:false} onChange={()=>setTab(3)}/>
        </div>
          {tab == 1 && rowDetalles &&
            <div className='grid gap-2 p-4 min-h-80'>
              <div className='flex gap-2 justify-center items-end'>
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
              <div className='flex justify-center'>
              <table className='table table-sm w-3/4'>
                <thead>
                  <tr>
                    <td></td>
                    <td>Cantidad</td>
                    <td>Porcentaje</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='font-semibold'>Base</td>
                    <td className='font-semibold'>{rowDetalles.length}</td>
                    <td className='font-semibold'></td>
                  </tr>
                  <tr>
                    <td>Barrido</td>
                    <td>{barrido || 0}</td>
                    <td>{((barrido/rowDetalles.length)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td>Faltante</td>
                    <td>{(rowDetalles.length - (barrido || 0))}</td>
                    <td>{(((rowDetalles.length - (barrido || 0))/rowDetalles.length)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td className='font-semibold'>Contactado</td>
                    <td className='font-semibold'>{contactados || 0}</td>
                    <td className='font-semibold'>{((contactados/rowDetalles.length)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td>Efectivo</td>
                    <td>{efectivos || 0}</td>
                    <td>{((efectivos/rowDetalles.length)*100).toFixed(2) || 0} %</td>
                  </tr>
                  <tr>
                    <td>No Efectivo</td>
                    <td>{(contactados || 0) - (efectivos || 0)}</td>
                    <td>{((((contactados || 0) - (efectivos || 0))/rowDetalles.length)*100).toFixed(2)} %</td>
                  </tr>
                  <tr>
                    <td className='font-semibold'>No Contactado</td>
                    <td>{(barrido || 0) - (contactados || 0)}</td>
                    <td>{((((barrido || 0) - (contactados || 0))/rowDetalles.length)*100).toFixed(2)} %</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
          }
          {tab == 2 && rowDetalles &&
            <div className='flex flex-col py-2 gap-2  h-96'>
              <div className='flex'>
                {/* <button className='btn btn-sm btn-primary' onClick={onBtnExport}>Exportar</button> */}
              </div>
            <AgGridReact
              rowData={rowDetalles}
              columnDefs={colDefs}
              pagination={true}
              paginationPageSize={50}
              modules={[ClientSideRowModelModule]}
              defaultColDef={defaultColDef}
              ref={gridRef}
              />
            </div>
          }
          {tab == 3 && porUsuario && 
            <div className='grid gap-2 p-4 h-96'>
            <AgGridReact
              rowData={porUsuario}
              columnDefs={colDefsUsu}
              pagination={true}
              paginationPageSize={50}
              modules={[ClientSideRowModelModule]}
              defaultColDef={defaultColDef}
              />
            </div>
          }
          <div className="flex justify-center gap-4">
                <button className="btn" onClick={cerrarForm}>Cerrar</button>
          </div>
        </div>
        </div>
    }
    </dialog>
    </div>
    );
  }