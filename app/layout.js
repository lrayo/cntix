"use client";

import Head from "next/head";
import "./globals.css";
import {SessionProvider } from "next-auth/react";
import Permisos from "./components/permisos";
import NavBar from "./components/navbar";
import Footer from "./components/footer";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }) {

  return (
    <html lang="en"  data-theme="corporate">
      <Head>
        <title>Conectix App</title>
      </Head>
      <body className="flex flex-col h-screen">
        <SessionProvider>
          <NavBar />
          <ToastContainer position="top-left" autoClose={3000} />
          <Permisos >
            {children}
          </Permisos>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}