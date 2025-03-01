// app/api/spotify/playlists/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import axios from "axios";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Validamos session.spotifyAccessToken en lugar de session.accessToken
  if (!session?.spotifyAccessToken) {
    return NextResponse.json(
      { error: "No tienes token de Spotify" },
      { status: 401 }
    );
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${session.spotifyAccessToken}` },
      params: { limit: 50 },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error al obtener playlists:", error);
    return NextResponse.json(
      { error: "Error al obtener las playlists" },
      { status: 500 }
    );
  }
}
