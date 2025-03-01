// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    password?: string;
  }
  
  interface Session {
    userId?: string;
    googleAccessToken?: string;
    spotifyAccessToken?: string;
    accessTokens?: {
      google?: string;
      spotify?: string;
    };
    accessToken?: {
      google?: string;
      spotify?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    googleAccessToken?: string;
    spotifyAccessToken?: string;
    accessTokens?: {
      google?: string;
      spotify?: string;
    };
    accessToken?: {
      google?: string;
      spotify?: string;
    };
  }
  interface Session {
    userId?: string;
    googleAccessToken?: string;
    spotifyAccessToken?: string;
    accessTokens?: {
      google?: string;
      spotify?: string;
    };
    accessToken?: {
      google?: string;
      spotify?: string;
    };
  }
}
