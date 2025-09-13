"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
//console.log(session)
  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center justify-center">
        {session ? (
          <>
          {session.user.image &&
            <Image
              src={session.user.image}
              alt="User Avatar"
              width={50}
              height={50}
              className="rounded-full mb-2"
            />
          }
            <p className="text-lg font-semibold">Bienvenido, {session.user.name}</p>
            <button 
              onClick={() => signOut()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Cerrar sesión
            </button>
          </>
        ) : (
          <div className="flex gap-2">
          <Image src="/img/microsoft.png" alt="Logo" width={40} height={40} priority />
          <button 
            onClick={() => signIn("azure-ad")} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition">
            Iniciar sesión con Microsoft
          </button>
          </div>
        )}
      </div>
    </div>
  );
}