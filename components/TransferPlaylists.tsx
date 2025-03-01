// components/TransferPlaylists.tsx
"use client";

import React, { useState } from "react";
import TransferProgress from "./TransferProgress";

interface TransferResult {
  progress: number;
  status: string;
  missingTracks?: string[];
}

interface TransferPlaylistsProps {
  selectedPlaylists: string[];
}

export default function TransferPlaylists({ selectedPlaylists }: TransferPlaylistsProps) {
  const [results, setResults] = useState<Record<string, TransferResult>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = async () => {
    if (selectedPlaylists.length === 0) return;
    setIsProcessing(true);
    const updatedResults: Record<string, TransferResult> = {};
    try {
      await Promise.all(
        selectedPlaylists.map(async (playlistId) => {
          updatedResults[playlistId] = { progress: 0, status: "Procesando...", missingTracks: [] };
          setResults((prev) => ({ ...prev, [playlistId]: updatedResults[playlistId] }));
          try {
            const res = await fetch(`/api/transfer/${playlistId}`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
              updatedResults[playlistId] = {
                progress: 100,
                status: `Completado (ID YouTube: ${data.youtubePlaylistId})`,
                missingTracks: data.missingTracks || [],
              };
            } else {
              updatedResults[playlistId] = {
                progress: 0,
                status: data.error || "Error durante la transferencia",
                missingTracks: [],
              };
            }
          } catch (error: any) {
            updatedResults[playlistId] = {
              progress: 0,
              status: error.message || "Error desconocido",
              missingTracks: [],
            };
          }
          setResults((prev) => ({ ...prev, [playlistId]: updatedResults[playlistId] }));
        })
      );
    } catch (e) {
      console.error("Error en la transferencia:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-6">
      {!isProcessing && (
        <button
          onClick={handleTransfer}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-transform transform hover:scale-105"
        >
          Procesar {selectedPlaylists.length} playlist{selectedPlaylists.length > 1 ? "s" : ""}
        </button>
      )}
      <TransferProgress results={results} selectedPlaylists={selectedPlaylists} />
    </div>
  );
}
