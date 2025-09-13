export default function CalcularDist(empresas, agentes, distribucion, idProgramacion, fechaLlamada){

  const objetos = []
  let agenteIndex = 0;

  if(distribucion == "dif"){
    empresas.forEach((empresa) => {
      let objeto = {
        id_programacion: idProgramacion,
        id_empresalead: empresa.id_empresalead,
        fecha_llamada: fechaLlamada,
        id_usuario: agentes[agenteIndex].id_usuario
      }

      objetos.push(objeto)
      agenteIndex = (agenteIndex + 1) % agentes.length; // Ciclo entre los agentes
    });
  }

  if(distribucion == "igu"){

    empresas.map((empresa) => {
     agentes.map((agente) => {
      
      const objeto = {
        id_programacion: idProgramacion,
        id_empresalead: empresa.id_empresalead,
        fecha_llamada: fechaLlamada,
        id_usuario: agente.id_usuario
      }
    
      objetos.push(objeto)
     })

    })
  }

return objetos
}