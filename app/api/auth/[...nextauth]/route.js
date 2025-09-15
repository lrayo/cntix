// import NextAuth from "next-auth";
// import AzureADProvider from "next-auth/providers/azure-ad";
// import { connectDB, sql } from "@/lib/db"; 

// export const authOptions = {
//   providers: [
//     AzureADProvider({
//       clientId: process.env.AZURE_AD_CLIENT_ID,
//       clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
//       tenantId: process.env.AZURE_AD_TENANT_ID,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token }) {
//       try {
//         const pool = await connectDB();
//         const result = await pool
//           .request()
//           .input("email", sql.VarChar, token.email)
//           .query("SELECT id_usuario, id_rol, id_campana FROM usuarios WHERE email = @email");

//         if (result.recordset.length > 0) {
//           token.id_rol = result.recordset[0].id_rol;
//           token.id_campana = result.recordset[0].id_campana;
//           token.id_usuario = result.recordset[0].id_usuario;
//         } else {
//           token.id_rol = ""; // Nivel por defecto
//           token.id_campana = "";
//           token.id_usuario = "";
//         }
//       } catch (error) {
//         console.error("Error obteniendo permisos del usuario:", error);
//         token.id_rol = ""; // En caso de error
//         token.id_usuario = "";
//         token.id_campana = "";
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.sub;
//       session.user.rol = token.id_rol; // Agregamos el nivel de permisos
//       session.user.usuario = token.id_usuario;
//       session.user.campana = token.id_campana;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB, sql } from "@/lib/db";

const providers = [
  AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID,
  }),
];

// Solo en desarrollo añadimos credenciales de prueba
if (process.env.NODE_ENV !== "production") {
  providers.push(
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // 🔹 Caso especial: lacardona@bpogs.com → buscar en BD
        if (credentials?.username === "lacardona@bpogs.com") {
          try {
            const pool = await connectDB();
            const result = await pool
              .request()
              .input("email", sql.VarChar, credentials.username)
              .query(
                "SELECT id_usuario, id_rol, id_campana FROM usuarios WHERE email = @email"
              );

            if (result.recordset.length > 0) {
              return {
                id: result.recordset[0].id_usuario,
                name: "Login de prueba (lacardona)",
                email: credentials.username,
                rol: result.recordset[0].id_rol,
                usuario: result.recordset[0].id_usuario,
                campana: result.recordset[0].id_campana,
              };
            }
          } catch (error) {
            console.error("Error obteniendo usuario lacardona:", error);
            return null;
          }
        }

        // 🔹 Usuario de prueba genérico
        if (
          credentials?.username === "testuser" &&
          credentials?.password === "1234"
        ) {
          return {
            id: "999",
            name: "Usuario de Prueba",
            email: "test@fake.local",
            rol: "admin",
            usuario: "999",
            campana: "demo",
          };
        }

        return null;
      },
    })
  );
}

export const authOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user || {};
        token.id = u.id || token.sub;
        token.name = u.name || token.name;
        token.email = u.email || token.email;
        token.id_rol = u.rol || "";
        token.id_campana = u.campana || "";
        token.id_usuario = u.usuario || "";
      }

      // 🔹 Caso Azure AD: buscar en BD por email
      if (!user && token?.email) {
        try {
          const pool = await connectDB();
          const result = await pool
            .request()
            .input("email", sql.VarChar, token.email)
            .query(
              "SELECT id_usuario, id_rol, id_campana FROM usuarios WHERE email = @email"
            );

          if (result.recordset.length > 0) {
            token.id_rol = result.recordset[0].id_rol;
            token.id_campana = result.recordset[0].id_campana;
            token.id_usuario = result.recordset[0].id_usuario;
          } else {
            token.id_rol = "";
            token.id_campana = "";
            token.id_usuario = "";
          }
        } catch (error) {
          console.error("Error obteniendo permisos del usuario:", error);
          token.id_rol = "";
          token.id_usuario = "";
          token.id_campana = "";
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id || token.sub;
      session.user.rol = token.id_rol || "";
      session.user.usuario = token.id_usuario || "";
      session.user.campana = token.id_campana || "";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

// App Router → Handlers nombrados
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
