// components/TransferProgress.tsx
"use client";

import React from "react";

interface TransferResult {
  progress: number;
  status: string;
  missingTracks?: string[];
}

interface TransferProgressProps {
  results: Record<string, TransferResult>;
  selectedPlaylists: string[];
}

export default function TransferProgress({ results, selectedPlaylists }: TransferProgressProps) {
  return (
    <div className="mt-4 space-y-6">
      {selectedPlaylists.map((playlistId) => {
        const { progress = 0, status = "", missingTracks = [] } = results[playlistId] || {};
        return (
          <div key={playlistId} className="p-4 bg-gray-800 rounded-lg shadow">
            <p className="font-bold text-white mb-2">Playlist ID: {playlistId}</p>
            <div className="w-full bg-gray-600 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-secondaryGray">{status}</p>
            {missingTracks.length > 0 && (
              <p className="text-red-400 text-xs mt-2">
                Canciones no encontradas: {missingTracks.join(", ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
