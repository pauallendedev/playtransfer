// components/LoginButtons.tsx
"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButtons() {
  const { data: session } = useSession();

  const hasSpotify = !!session?.spotifyAccessToken;
  const hasGoogle = !!session?.googleAccessToken;

  return (
    <div className="flex flex-col gap-4 items-center">
      {!hasSpotify && (
        <button
          onClick={() => signIn("spotify", { redirect: false })}
          className="bg-spotify hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
          aria-label="Conectar con Spotify"
        >
          Conectar Spotify
        </button>
      )}
      {!hasGoogle && (
        <button
          onClick={() => signIn("google", { redirect: false })}
          className="bg-googleBlue hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
          aria-label="Conectar con Google"
        >
          Conectar Google
        </button>
      )}
      {hasSpotify && hasGoogle && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-transform transform hover:scale-105"
          aria-label="Cerrar sesión"
        >
          Cerrar Sesión
        </button>
      )}
    </div>
  );
}
