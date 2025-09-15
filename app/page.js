// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// import Image from "next/image";

// export default function Home() {
//   const { data: session } = useSession();
// //console.log(session)
//   return (
//     <div className="flex flex-col items-center justify-center min-h-96">
//       <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center justify-center">
//         {session ? (
//           <>
//           {session.user.image &&
//             <Image
//               src={session.user.image}
//               alt="User Avatar"
//               width={50}
//               height={50}
//               className="rounded-full mb-2"
//             />
//           }
//             <p className="text-lg font-semibold">Bienvenido, {session.user.name}</p>
//             <button 
//               onClick={() => signOut()} 
//               className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
//               Cerrar sesión
//             </button>
//           </>
//         ) : (
//           <div className="flex gap-2">
//           <Image src="/img/microsoft.png" alt="Logo" width={40} height={40} priority />
//           <button 
//             onClick={() => signIn("azure-ad")} 
//             className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition">
//             Iniciar sesión con Microsoft
//           </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center justify-center">
        {session ? (
          <>
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="User Avatar"
                width={50}
                height={50}
                className="rounded-full mb-2"
              />
            )}

            <p className="text-lg font-semibold">
              Bienvenido, {session.user.name}
            </p>
            <p>Rol: {session.user.rol || "No asignado"}</p>
            <p>ID Usuario: {session.user.usuario || "-"}</p>
            <p>Campaña: {session.user.campana || "-"}</p>

            <button
              onClick={() => signOut()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cerrar sesión
            </button>

            {/* Debug opcional */}
            <pre className="text-xs text-left bg-gray-100 p-2 mt-4 rounded max-w-sm overflow-x-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Login con Microsoft */}
            <div className="flex gap-2 items-center">
              <Image
                src="/img/microsoft.png"
                alt="Logo Microsoft"
                width={40}
                height={40}
                priority
              />
              <button
                onClick={() => signIn("azure-ad")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Iniciar sesión con Microsoft
              </button>
            </div>

            {/* Login de prueba genérico */}
            <div className="flex gap-2 items-center">
              <Image
                src="/img/test.png"
                alt="Logo Test"
                width={40}
                height={40}
                priority
              />
              <button
                onClick={() =>
                  signIn("credentials", {
                    username: "testuser",
                    password: "1234",
                    redirect: true,
                    callbackUrl: "/",
                  })
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Iniciar sesión de prueba
              </button>
            </div>

            {/* Login directo como lacardona */}
            <div className="flex gap-2 items-center">
              <Image
                src="/img/user.png"
                alt="Logo Usuario"
                width={40}
                height={40}
                priority
              />
              <button
                onClick={() =>
                  signIn("credentials", {
                    username: "lacardona@bpogs.com",
                    password: "dummy", // puede ser cualquier cosa
                    redirect: true,
                    callbackUrl: "/",
                  })
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Iniciar sesión como Lacardona
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
