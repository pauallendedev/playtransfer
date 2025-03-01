// app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import SpotifyPlaylists from "@/components/SpotifyPlaylists";
import ProcessingModal from "@/components/ProcessingModal";
import AuthCheck from "@/components/AuthCheck";

export default function DashboardPage() {
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (selectedPlaylists.length === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedPlaylists.map((pid) =>
          fetch(`/api/transfer/${pid}`, { method: "POST" })
        )
      );
    } catch (error) {
      console.error("Error durante la transferencia:", error);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-primaryBlack text-foreground p-8 relative">
        <header className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold mb-4 text-spotify">
            Dashboard de PlayTransfer
          </h2>
          <p className="text-secondaryGray text-lg">
            Selecciona las playlists que deseas transferir a YouTube Music.
          </p>
        </header>
        <main>
          <SpotifyPlaylists
            selectedPlaylists={selectedPlaylists}
            setSelectedPlaylists={setSelectedPlaylists}
          />
        </main>
        {selectedPlaylists.length > 0 && !isProcessing && (
          <button
            onClick={handleProcess}
            className="fixed bottom-8 right-8 bg-spotify text-white py-3 px-6 rounded-full shadow-lg hover:bg-green-700 transition-colors transform hover:scale-105"
          >
            Procesar
          </button>
        )}
        {isProcessing && (
          <ProcessingModal
            selectedPlaylists={selectedPlaylists}
            onClose={() => setIsProcessing(false)}
          />
        )}
      </div>
    </AuthCheck>
  );
}
