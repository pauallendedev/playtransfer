import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import axios from "axios";
import { setTransferStatus } from "@/lib/transferStatus";

// Fuerza la ruta a ser dinámica
export const dynamic = "force-dynamic";

// Helper: Buscar un video en YouTube para un query dado
async function searchYouTubeVideo(query: string, youtubeAccessToken: string): Promise<string | null> {
  try {
    console.log("[searchYouTubeVideo] Buscando en YouTube para query:", query);
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        maxResults: 1,
        type: "video",
      },
      headers: { Authorization: `Bearer ${youtubeAccessToken}` },
    });
    console.log("[searchYouTubeVideo] Respuesta:", res.data);
    const videoId = res.data.items?.[0]?.id?.videoId;
    return videoId || null;
  } catch (error: any) {
    console.error("[searchYouTubeVideo] Error:", error.response?.data || error.message);
    return null;
  }
}

// Helper: Agregar un video a la playlist de YouTube (petición individual)
async function addVideoIndividually(
  youtubeAccessToken: string,
  playlistId: string,
  videoId: string
): Promise<void> {
  try {
    const res = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        snippet: {
          playlistId,
          resourceId: { kind: "youtube#video", videoId },
        },
      },
      {
        params: { part: "snippet" },
        headers: {
          Authorization: `Bearer ${youtubeAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`[addVideoIndividually] Video ${videoId} agregado:`, res.data);
  } catch (error: any) {
    console.error(
      `[addVideoIndividually] Error agregando video ${videoId}:`,
      error.response?.data || error.message
    );
  }
}

// Helper: Agregar videos individualmente a la playlist
async function addVideosIndividuallyToPlaylist(
  youtubeAccessToken: string,
  playlistId: string,
  videoIds: string[]
): Promise<void> {
  console.log("[addVideosIndividuallyToPlaylist] Iniciando agregación individual de videos...");
  for (const videoId of videoIds) {
    await addVideoIndividually(youtubeAccessToken, playlistId, videoId);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.spotifyAccessToken || !session?.googleAccessToken) {
    return NextResponse.json(
      { error: "Credenciales insuficientes. Conecta Spotify y Google." },
      { status: 401 }
    );
  }
  if (!playlistId) {
    return NextResponse.json({ error: "Falta playlistId" }, { status: 400 });
  }

  try {
    setTransferStatus(playlistId, { progress: 10, status: "Procesando..." });
    console.log("[transfer] Obteniendo datos de la playlist de Spotify:", playlistId);
    const spotifyPlaylistRes = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: { Authorization: `Bearer ${session.spotifyAccessToken}` },
      }
    );
    const playlistData = spotifyPlaylistRes.data;
    if (!playlistData) {
      throw new Error("No se obtuvieron datos de la playlist de Spotify");
    }
    setTransferStatus(playlistId, { progress: 30, status: "Obteniendo tracks..." });

    // Obtener todos los tracks (con paginación)
    const allTracks: any[] = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    while (nextUrl) {
      console.log("[transfer] Obteniendo tracks desde:", nextUrl);
      const res = await axios.get(nextUrl, {
        headers: { Authorization: `Bearer ${session.spotifyAccessToken}` },
      });
      const data = res.data;
      allTracks.push(...data.items);
      nextUrl = data.next;
    }
    console.log("[transfer] Total de tracks obtenidos:", allTracks.length);
    if (!allTracks.length) {
      throw new Error("No se obtuvieron tracks de la playlist");
    }

    setTransferStatus(playlistId, { progress: 50, status: "Creando playlist en YouTube..." });
    console.log("[transfer] Creando playlist en YouTube Music");
    const youtubePlaylistRes = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlists",
      {
        snippet: {
          title: playlistData.name,
          description: playlistData.description || "Playlist transferida desde Spotify",
        },
        status: { privacyStatus: "private" },
      },
      {
        params: { part: "snippet,status" },
        headers: {
          Authorization: `Bearer ${session.googleAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const youtubePlaylistId = youtubePlaylistRes.data.id;
    if (!youtubePlaylistId) {
      throw new Error("No se pudo crear la playlist en YouTube");
    }
    console.log("[transfer] Playlist de YouTube creada con ID:", youtubePlaylistId);

    setTransferStatus(playlistId, { progress: 60, status: "Buscando videos en YouTube..." });
    const searchPromises = allTracks.map((item: any) => {
      const track = item.track;
      if (!track) return Promise.resolve(null);
      const query = `${track.name} ${track.artists?.[0]?.name || ""}`.trim();
      return searchYouTubeVideo(query, session.googleAccessToken!);
    });
    const searchResults = await Promise.allSettled(searchPromises);

    const videoIds: string[] = [];
    const missingTracks: string[] = [];
    allTracks.forEach((item: any, index: number) => {
      const track = item.track;
      if (!track) return;
      const result = searchResults[index];
      if (result.status === "fulfilled" && result.value) {
        videoIds.push(result.value);
      } else {
        missingTracks.push(track.name);
      }
    });
    console.log("[transfer] Video IDs encontrados:", videoIds);
    console.log("[transfer] Tracks sin video:", missingTracks);

    setTransferStatus(playlistId, { progress: 80, status: "Agregando videos a YouTube..." });
    // Enviar las peticiones individualmente
    await addVideosIndividuallyToPlaylist(session.googleAccessToken, youtubePlaylistId, videoIds);

    setTransferStatus(playlistId, {
      progress: 100,
      status: "Completado",
      missingTracks,
    });

    return NextResponse.json({
      message: "Transferencia completada",
      youtubePlaylistId,
      missingTracks,
    });
  } catch (error: any) {
    console.error("[transfer] Error durante la transferencia:", error.response?.data || error.message);
    setTransferStatus(playlistId, { progress: 0, status: "Error" });
    return NextResponse.json({ error: "Error al transferir la playlist" }, { status: 500 });
  }
}
