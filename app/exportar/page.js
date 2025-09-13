"use client";
import { useState, useEffect, useMemo } from "react";
import TipificadorClaro from "./claro";
import TipificadorGenerico from "./generico";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function ExportarPage() {

  const [tipificador, setTipificador] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "prohibido",
    id_rol: session?.user?.rol || ""
}), [session]);

useEffect(() => {
  async function checkPermisos() {
    if (session) {
      const response = await fetch("/api/usuarios/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modulo),
      });

      if (!response.ok) throw new Error("Error al obtener los datos");

      const data = await response.json();
      if (!data) {
        router.replace('/noautorizado');
      } else {
        setAutorizado(true);
      }
    }
  }
  checkPermisos();
}, [session, router, modulo]); 
  
  const handleChange = (e) => {
    if(e.target.value == "Claro"){
      setTipificador(<TipificadorClaro />)
    }
    if(e.target.value == "Generico"){
      setTipificador(<TipificadorGenerico />)
    }
  };

  return (
    <div className="p-6 bg-base-100 text-black">
      {
        autorizado &&
      <div>
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-bold text-primary flex gap-2">Exportar Empresas CSV</h1>
        <div className="flex items-center justify-center p-6 gap-4">
          <select onChange={handleChange} className="border p-2 rounded bg-white text-black">
            <option value="">...Seleccione Tipificador</option>
            <option value="Claro">Claro</option>
            <option value="Generico">Generico</option>
          </select>
        </div>
        
      </div>
      {tipificador}
      </div>
    }
    </div>
  );
}
