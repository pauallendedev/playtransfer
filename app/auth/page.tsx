// app/auth/page.tsx
"use client";

import React, { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const hasSpotify = !!session?.spotifyAccessToken;
  const hasGoogle = !!session?.googleAccessToken;

  useEffect(() => {
    if (status === "authenticated" && hasSpotify && hasGoogle) {
      router.push("/dashboard");
    }
  }, [status, hasSpotify, hasGoogle, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primaryBlack text-foreground flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-spotify">
        Bienvenido a PlayTransfer
      </h1>
      <p className="mb-4 text-center max-w-md">
        Para acceder a PlayTransfer, debes conectar tu cuenta de Spotify y Google.
      </p>
      <div className="flex flex-col gap-4">
        {!hasSpotify && (
          <button
            onClick={() => signIn("spotify", { redirect: false })}
            className="bg-spotify hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
          >
            Conectar Spotify
          </button>
        )}
        {!hasGoogle && (
          <button
            onClick={() => signIn("google", { redirect: false })}
            className="bg-googleBlue hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
          >
            Conectar Google
          </button>
        )}
        {session && (hasSpotify || hasGoogle) && !(hasSpotify && hasGoogle) && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
          >
            Reiniciar sesión
          </button>
        )}
      </div>
      <div className="mt-6">
        <p className="text-secondaryGray text-sm">
          Una vez conectadas ambas cuentas, serás redirigido al Dashboard.
        </p>
      </div>
    </div>
  );
}
