'use client';

import { useMemo } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Building2, Calendar, ChartPie, Download, Handshake,
  Headset, House, MessageCircleQuestion, User,
  Clipboard, SendHorizontal, ChartColumnBig, Contact
} from "lucide-react";

const menuItems = [
  { roles: ["all"], href: "/", icon: <House />, label: "Home" },
  { roles: ["admin"], href: "/sources", icon: <Handshake />, label: "Sources" },
  { roles: ["admin", "gtr", "agente"], href: "/empresas", icon: <Building2 />, label: "Empresas" },
  { roles: ["admin", "gtr", "agente"], href: "/contactos", icon: <Contact />, label: "Contactos" },
  { roles: ["admin"], href: "/usuarios", icon: <User />, label: "Usuarios" },
  { roles: ["admin"], href: "/campanas", icon: <Clipboard />, label: "Campañas" },
  { roles: ["admin", "gtr"], href: "/formularios", icon: <MessageCircleQuestion />, label: "Formularios" },
  { roles: ["admin", "gtr"], href: "/programador", icon: <Calendar />, label: "Programador" },
  { roles: ["admin", "gtr", "agente"], href: "/tipificador", icon: <Headset />, label: "Tipificador Claro" },
  { roles: ["admin", "gtr", "agente"], href: "/tipificadorMasivo", icon: <Headset />, label: "Tipificador Claro Masivo" },
  { roles: ["admin", "gtr", "agente"], href: "/suncom", icon: <Headset />, label: "Tipificador SunCom" },
  { roles: ["admin", "gtr", "agente"], href: "/suncom/baterias", icon: <Headset />, label: "Tipificador SunCom Baterías" },
  { roles: ["admin", "gtr", "agente"], href: "/reportes", icon: <ChartPie />, label: "Reportes" },
  { roles: ["admin", "gtr"], href: "/bi", icon: <ChartColumnBig />, label: "BI" },
  { roles: ["admin", "gtr", "agente"], href: "/zoho", icon: <SendHorizontal />, label: "Integración CRM" },
  { roles: ["admin"], href: "/exportar", icon: <Download />, label: "Exportar" },
];

const NavBar = () => {
  const { data: session } = useSession();

  const userInfo = useMemo(() => {
    if (!session) return null;
    return {
      name: session.user.name,
      image: session.user.image,
      rol: session.user.rol,
    };
  }, [session]);

  return (
    <div className="shadow my-2 mx-8 rounded-md">
      <div className="navbar">
        {/* Menú Hamburguesa */}
        <div className="navbar-start">
          {session && (
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <ul tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[10] mt-4 w-52 p-2 shadow">
                {userInfo && menuItems
                  .filter(item => item.roles.includes("all") || item.roles.includes(userInfo.rol))
                  .map((item, index) => (
                    <li key={index}>
                      <Link href={item.href}
                        className="flex flex-row items-center h-8 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-primary">
                        <span className="inline-flex items-center justify-center h-8 text-lg text-gray-400">
                          <i className="bx bx-building"></i>
                        </span>
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="navbar-center">
          <div className="flex items-center justify-center">
            <Link href="/">
              <Image
                src="/logofinal.png"
                alt="BPO logo"
                width={100}
                height={10}
                priority
              />
            </Link>
          </div>
        </div>

        {/* Perfil */}
        <div className="navbar-end gap-4">
          <div className="flex-none">
            {userInfo && (
              <div className="dropdown dropdown-end flex items-center gap-2">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full bg-slate-400">
                    {userInfo.image && (
                      <Image
                        src={userInfo.image}
                        alt="User Avatar"
                        width={50}
                        height={50}
                      />
                    )}
                  </div>
                </div>
                <ul tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[10] mt-4 w-52 p-2 shadow">
                  <li className="flex justify-center">{userInfo.name}</li>
                  <li>
                    <div onClick={() => signOut()}
                      className="flex p-2 cursor-pointer flex-row items-center transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-primary">
                      <span className="inline-flex items-center justify-center h-8 text-lg text-gray-400">
                        <i className="bx bx-log-out"></i>
                      </span>
                      <span className="text-sm font-medium text-red-700">Logout</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
