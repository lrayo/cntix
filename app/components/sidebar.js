import { useMemo } from "react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

const Sidebar = () => {
  const { data: session } = useSession();

  // Memoizar la información del usuario
  const userInfo = useMemo(() => {
    if (!session) return null;
    return {
      name: session.user.name,
      image: session.user.image,
    };
  }, [session]); // Solo se recalculará cuando session cambie

  return (
    <div className="min-h-screen flex flex-row bg-gray-100">
      <div className="flex flex-col w-56 bg-white overflow-hidden justify-between h-screen">
        <div>
          <div className="flex items-center justify-center h-20 pt-6">
            <Link href="/">
              <Image
                src="/logofinal.png"
                alt="BPO logo"
                width={180}
                height={38}
                priority
              />
            </Link>
          </div>
          {userInfo && (
            <div className="flex flex-col items-center py-4 border-b">
              <Image
                src={userInfo.image}
                alt="User Avatar"
                width={50}
                height={50}
                className="rounded-full mb-2"
              />
              <p className="text-sm font-medium text-gray-700">{userInfo.name}</p>
            </div>
          )}
          <ul className="flex flex-col py-4">
            <li>
              <Link href="/" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
                <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
                  <i className="bx bx-home"></i>
                </span>
                <span className="text-sm font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/fuentes" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
                <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
                  <i className="bx bx-user"></i>
                </span>
                <span className="text-sm font-medium">Fuentes</span>
              </Link>
            </li>
            <li>
              <Link href="/empresas" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
                <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
                  <i className="bx bx-building"></i>
                </span>
                <span className="text-sm font-medium">Empresas</span>
              </Link>
            </li>
            <li>
              <Link href="/exportar" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
                <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
                  <i className="bx bx-building"></i>
                </span>
                <span className="text-sm font-medium">Exportar</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t">
          {session ? (
            <div onClick={() => signOut()} className="flex cursor-pointer flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
              <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
                <i className="bx bx-log-out"></i>
              </span>
              <span className="text-sm font-medium text-red-700">Logout</span>
            </div>
          ) : (
            <div onClick={() => signIn()} className="flex cursor-pointer flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-bpoblue hover:text-gray-800">
              <Image src="/img/microsoft.png" alt="Logo" width={20} height={20} priority />
              <span className="ml-2">Iniciar Sesión</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;