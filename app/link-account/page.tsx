"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut, signIn, useSession } from "next-auth/react";

export default function LinkAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "";
  const tempUserId = searchParams.get("tempUserId") || "";
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[LinkAccountPage] provider =", provider, "tempUserId =", tempUserId);
    console.log("[LinkAccountPage] session =", session);
  }, [provider, tempUserId, session]);

  async function handleLink() {
    setError("");
    try {
      let userId = tempUserId;
      if (!userId) {
        console.log("[LinkAccountPage] No tempUserId => verifying credentials");
        const resVerify = await fetch("/api/auth/verify-password", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
        });
        if (!resVerify.ok) {
          throw new Error("Credenciales inválidas");
        }
        const dataVerify = await resVerify.json();
        userId = dataVerify.userId;
        console.log("[LinkAccountPage] Verified userId =", userId);
      }
      console.log("[LinkAccountPage] Linking provider =", provider, "to userId =", userId);
      const res = await fetch(`/api/link-account/${provider}`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      console.log("[LinkAccountPage] Link success => forcing signIn with", provider);
      await signIn(provider, { redirect: false });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[LinkAccountPage] Error linking account:", err.message);
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-primaryBlack text-foreground flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-spotify mb-4">
        Vincular {provider}
      </h1>
      {tempUserId ? (
        <p className="mb-6 text-center">
          Hemos detectado que ya tienes una cuenta principal. Haz click en “Vincular” para unificar {provider} con tu cuenta.
        </p>
      ) : (
        <>
          <p className="mb-6 text-center">
            Para vincular tu cuenta de {provider}, ingresa el email y contraseña de tu cuenta principal.
          </p>
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-gray-800 text-white mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="p-2 rounded bg-gray-800 text-white mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex gap-4">
        <button
          onClick={handleLink}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
        >
          Vincular
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
