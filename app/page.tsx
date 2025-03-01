// app/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primaryBlack text-foreground flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-6 text-spotify">PlayTransfer</h1>
      <p className="mb-8 text-center max-w-lg">
        Transfiere tus playlists de Spotify a YouTube Music de forma rápida y sencilla.
      </p>
      <Link
        href="/auth"
        className="bg-spotify hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition-transform transform hover:scale-105"
      >
        Acceder a la aplicación
      </Link>
    </div>
  );
}
