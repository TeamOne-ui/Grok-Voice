import { NextResponse } from "next/server";

export function middleware(request) {
  const auth = request.headers.get("authorization");
  if (auth) {
    const = atob(auth.split(" ")[1]).split(":");
    if (user === process.env.AUTH_USER && pass === process.env.AUTH_PASS) {
      return NextResponse.next();
    }
  }
  return new Response("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GrokVoice"' },
  });
}

export const config = { matcher: "/:path*" };