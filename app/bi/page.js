"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function Campanas() {

  const { data: session } = useSession();
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const modulo = useMemo(() => ({
    modulo: "bi",
    id_rol: session?.user?.rol || "",
    id_campana: session?.user?.campana || ""
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
  
  return (
    <div>
      {autorizado &&
      <div className="p-6 bg-base-100 text-black ">
        <div className="text-primary text-xl mb-4">Power BI</div>
        <div className="flex justify-center w-full">
          <iframe title="conectix 1" className="w-full h-[600px]" src="https://app.powerbi.com/view?r=eyJrIjoiMjg5NTQwMjQtYmIyZi00NmRhLWEzOWUtZWUyNzllZDk1MDUyIiwidCI6IjYxYzBjYzEwLWViYzEtNDBmYi1iMzJmLWRlZjFjNjZhNDAzYyJ9" allowFullScreen={true}></iframe>
        </div>
      </div>
      }
    </div>
  );
}
