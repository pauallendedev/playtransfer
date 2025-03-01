// app/api/auth/error/page.tsx
import React from "react";
import Link from "next/link";

interface ErrorPageProps {
  searchParams?: { error?: string };
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold text-[#1DB954] mb-4">Algo salió mal</h1>
      <p className="text-gray-300">
        Error: {searchParams?.error || "Error desconocido"}
      </p>
      <p className="text-gray-500 mt-2 mb-6">
        Intenta iniciar sesión con otra cuenta o contacta al soporte.
      </p>
      <Link
        href="/"
        className="bg-[#1DB954] hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
