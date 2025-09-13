import {useSession} from "next-auth/react";
import Home from "../page";

export default function Permisos({ children }) {

const { data: session, status } = useSession();

  return (
    <div className="flex-1">
          {session && status != "loading" ?
          <div>{children}</div>:
          <div>
          {status != "loading" &&
            <Home />
          }
          </div>
          } 
    </div>
  );
}