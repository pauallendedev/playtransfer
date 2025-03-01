// components/ProcessingModal.tsx
"use client";

import React, { useEffect, useState } from "react";

interface ProgressEventData {
  playlistId: string;
  progress: number;
  status: string;
}

interface ProcessingModalProps {
  selectedPlaylists: string[];
  onClose: () => void;
}

export default function ProcessingModal({ selectedPlaylists, onClose }: ProcessingModalProps) {
  const [progressData, setProgressData] = useState<Record<string, ProgressEventData>>({});

  useEffect(() => {
    const query = selectedPlaylists.join(",");
    const eventSource = new EventSource(`/api/transfer/progress?playlists=${query}`);

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressEventData = JSON.parse(event.data);
        setProgressData((prev) => ({
          ...prev,
          [data.playlistId]: data,
        }));
      } catch (err) {
        console.error("Error parseando evento SSE:", err);
      }
    };

    eventSource.onerror = (error) => {
      // Si el error ocurre al final (por ejemplo, stream cerrado), no lo tratamos como crítico.
      console.log("EventSource error, posiblemente cierre del stream", error);
      // Cierra el EventSource para evitar loops de reconexión
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [selectedPlaylists]);

  const allComplete = selectedPlaylists.every(
    (id) => progressData[id]?.progress === 100
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-96 text-center">
        <h3 className="text-xl font-bold text-white mb-4">
          Transferencia en progreso...
        </h3>
        {selectedPlaylists.map((playlistId) => {
          const { progress = 0, status = "En espera..." } = progressData[playlistId] || {};
          return (
            <div key={playlistId} className="mb-4">
              <p className="text-white font-semibold">Playlist: {playlistId}</p>
              <div className="w-full bg-gray-600 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-secondaryGray text-sm mt-2">{status}</p>
            </div>
          );
        })}
        {allComplete && (
          <button
            onClick={onClose}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
