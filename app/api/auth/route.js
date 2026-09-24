import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  if (password === process.env.APP_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "1", { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}