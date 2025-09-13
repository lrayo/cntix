"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function NoAutorizado() {
  const { data: session } = useSession();
//console.log(session)
  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center justify-center">
       No Autorizado
      </div>
    </div>
  );
}