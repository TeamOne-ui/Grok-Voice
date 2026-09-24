import { NextResponse } from "next/server";

export function middleware(req) {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Basic ")) {
    try {
      const = atob(auth.slice(6)).split(":");
      if (user === process.env.AUTH_USER && pwd === process.env.AUTH_PASS) {
        return NextResponse.next();
      }
    } catch (e)
  }
  return new Response("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GrokVoice"' },
  });
}

export const config = { matcher: "/:path*" };