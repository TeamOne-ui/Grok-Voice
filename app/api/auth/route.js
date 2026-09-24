import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth) {
    const = atob(auth.split(" ")[1]).split(":");
    if (user === process.env.AUTH_USER && pwd === process.env.AUTH_PASS) {
      return NextResponse.next();
    }
  }
  return new Response("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GrokVoice"' },
  });
}