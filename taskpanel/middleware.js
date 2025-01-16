// middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "./agixt/lib/auth-service";

export async function middleware(req) {
  const token = req.cookies.token;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Attach user information to the request for downstream handlers
    req.user = payload;
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// The matcher tells Next.js which routes to apply the middleware to
export const config = {
  matcher: "/api/:path*",
};