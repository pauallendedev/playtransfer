import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization:
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        "scope=openid%20email%20profile%20https://www.googleapis.com/auth/youtube%20https://www.googleapis.com/auth/youtube.force-ssl&" +
        "access_type=offline&" +
        "prompt=consent",
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization:
        "https://accounts.spotify.com/authorize?" +
        "scope=playlist-read-private%20user-read-email",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("[signIn callback] user:", user);
      console.log("[signIn callback] account:", account);
      if (!user?.email) {
        console.log("[signIn callback] No user.email => returning false");
        return false;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (!existingUser) {
        console.log("[signIn callback] No existingUser => returning true (se creará user nuevo)");
        return true;
      }

      console.log("[signIn callback] existingUser found =>", existingUser.id);
      const hasProvider = existingUser.accounts.some(
        (acc) => acc.provider === account?.provider
      );

      if (hasProvider) {
        console.log("[signIn callback] existingUser ya tiene este provider => returning true");
        return true;
      }

      console.log("[signIn callback] existingUser sin este provider => redirigiendo a link-account");
      return `/link-account?provider=${account?.provider}&tempUserId=${existingUser.id}`;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        console.log("[jwt callback] Setting token.userId =", user.id);
      }
      if (account?.provider === "spotify" && account.access_token) {
        token.spotifyAccessToken = account.access_token;
        console.log("[jwt callback] Setting token.spotifyAccessToken from account");
      }
      if (account?.provider === "google" && account.access_token) {
        token.googleAccessToken = account.access_token;
        console.log("[jwt callback] Setting token.googleAccessToken from account");
      }
      if (token.userId) {
        const accounts = await prisma.account.findMany({
          where: { userId: token.userId as string },
        });
        for (const acc of accounts) {
          if (acc.provider === "spotify" && acc.access_token) {
            token.spotifyAccessToken = acc.access_token;
          }
          if (acc.provider === "google" && acc.access_token) {
            token.googleAccessToken = acc.access_token;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      console.log("[session callback] token =", token);
      session.userId = token.userId as string;
      const accounts = await prisma.account.findMany({
        where: { userId: token.userId as string },
      });
      let finalSpotify = token.spotifyAccessToken;
      let finalGoogle = token.googleAccessToken;
      for (const acc of accounts) {
        if (acc.provider === "spotify" && acc.access_token) {
          finalSpotify = acc.access_token;
        }
        if (acc.provider === "google" && acc.access_token) {
          finalGoogle = acc.access_token;
        }
      }
      session.spotifyAccessToken = finalSpotify;
      session.googleAccessToken = finalGoogle;
      if (!finalSpotify || !finalGoogle) {
        (session as any).error = "MISSING_TOKENS";
        console.log("[session callback] MISSING_TOKENS => finalSpotify or finalGoogle is null");
      } else {
        console.log("[session callback] Session has BOTH tokens => OK");
      }
      return session;
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
