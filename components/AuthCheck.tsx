// components/AuthCheck.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface AuthCheckProps {
  children: React.ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-secondaryGray">Cargando sesión...</p>
      </div>
    );
  }

  const hasSpotify = !!session?.spotifyAccessToken;
  const hasGoogle = !!session?.googleAccessToken;

  if (!hasSpotify || !hasGoogle) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
        <h2 className="text-2xl font-bold text-spotify mb-4">
          Acceso Restringido
        </h2>
        <p className="text-secondaryGray mb-6 text-center max-w-md">
          Debes conectar ambas cuentas (Spotify y Google) para acceder al Dashboard.
        </p>
        <Link
          href="/auth"
          className="bg-spotify hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
        >
          Ir a la página de autenticación
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
