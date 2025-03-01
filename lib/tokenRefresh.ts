// lib/tokenRefresh.ts
import axios from "axios";
import { prisma } from "./prisma";

/**
 * Refresca el token de Spotify si es necesario.
 * Guarda el nuevo access_token en la base de datos y lo devuelve.
 */
export async function refreshSpotifyToken(
  userId: string
): Promise<string | null> {
  // Busca la cuenta de Spotify
  const spotifyAccount = await prisma.account.findFirst({
    where: { userId, provider: "spotify" },
  });

  if (!spotifyAccount?.refresh_token) {
    return null;
  }

  // Llamada al endpoint de refresh de Spotify
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", spotifyAccount.refresh_token);
  const credentials = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  const authHeader = Buffer.from(credentials).toString("base64");

  try {
    const res = await axios.post("https://accounts.spotify.com/api/token", params, {
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, expires_in, refresh_token } = res.data;
    // Actualiza en DB
    await prisma.account.updateMany({
      where: { userId, provider: "spotify" },
      data: {
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
        ...(refresh_token && { refresh_token }), // solo si viene un nuevo refresh_token
      },
    });

    return access_token;
  } catch (error) {
    console.error("Error refrescando token de Spotify:", error);
    return null;
  }
}

/**
 * Refresca el token de Google si es necesario.
 * Similar lógica, usando la refresh_token guardada.
 */
export async function refreshGoogleToken(
  userId: string
): Promise<string | null> {
  const googleAccount = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!googleAccount?.refresh_token) {
    return null;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", googleAccount.refresh_token);
  params.append("client_id", process.env.GOOGLE_CLIENT_ID || "");
  params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET || "");

  try {
    const res = await axios.post("https://oauth2.googleapis.com/token", params);
    const { access_token, expires_in, refresh_token } = res.data;
    // Actualiza en DB
    await prisma.account.updateMany({
      where: { userId, provider: "google" },
      data: {
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
        ...(refresh_token && { refresh_token }),
      },
    });
    return access_token;
  } catch (error) {
    console.error("Error refrescando token de Google:", error);
    return null;
  }
}
