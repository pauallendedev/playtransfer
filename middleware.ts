import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[middleware] Checking path =", pathname);

  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request });
    console.log("[middleware] token =", token);

    if (!token || !token.spotifyAccessToken || !token.googleAccessToken) {
      console.log("[middleware] Missing tokens => redirecting to /api/auth/signin");
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/api/auth/signin";
      return NextResponse.redirect(loginUrl);
    }
    console.log("[middleware] Has tokens => continuing");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
