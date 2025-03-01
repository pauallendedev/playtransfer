// components/SpotifyPlaylists.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Playlist {
  id: string;
  name: string;
  tracks: { total: number };
  images: { url: string }[] | null;
}

interface SpotifyPlaylistsProps {
  selectedPlaylists: string[];
  setSelectedPlaylists: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function SpotifyPlaylists({
  selectedPlaylists,
  setSelectedPlaylists,
}: SpotifyPlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("/api/spotify/playlists");
        if (!res.ok) {
          throw new Error("Error al obtener las playlists");
        }
        const data = await res.json();
        setPlaylists(data.items);
      } catch (err: any) {
        setError(err.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedPlaylists((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="text-center text-foreground">
        <p className="text-lg">Cargando playlists...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-spotify">
        Tus Playlists de Spotify
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => {
          const isSelected = selectedPlaylists.includes(playlist.id);
          const imageUrl = playlist.images?.[0]?.url || "/placeholder.jpg";

          return (
            <li
              key={playlist.id}
              onClick={() => handleSelect(playlist.id)}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-xl transition-transform ${
                isSelected ? "bg-gray-800 scale-105" : "bg-gray-900"
              }`}
              role="button"
              aria-pressed={isSelected}
            >
              <div className="w-20 h-20 mb-4 relative">
                <Image
                  src={imageUrl}
                  alt={playlist.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{playlist.name}</h3>
              <p className="text-sm text-secondaryGray mb-2">
                {playlist.tracks.total} canciones
              </p>
              {isSelected ? (
                <span className="text-green-500 font-bold text-sm">Seleccionada</span>
              ) : (
                <span className="text-sm text-gray-400">Haz click para seleccionar</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
