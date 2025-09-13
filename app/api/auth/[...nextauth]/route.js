import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { connectDB, sql } from "@/lib/db"; 

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      try {
        const pool = await connectDB();
        const result = await pool
          .request()
          .input("email", sql.VarChar, token.email)
          .query("SELECT id_usuario, id_rol, id_campana FROM usuarios WHERE email = @email");

        if (result.recordset.length > 0) {
          token.id_rol = result.recordset[0].id_rol;
          token.id_campana = result.recordset[0].id_campana;
          token.id_usuario = result.recordset[0].id_usuario;
        } else {
          token.id_rol = ""; // Nivel por defecto
          token.id_campana = "";
          token.id_usuario = "";
        }
      } catch (error) {
        console.error("Error obteniendo permisos del usuario:", error);
        token.id_rol = ""; // En caso de error
        token.id_usuario = "";
        token.id_campana = "";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.rol = token.id_rol; // Agregamos el nivel de permisos
      session.user.usuario = token.id_usuario;
      session.user.campana = token.id_campana;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };