import { NextResponse } from "next/server";

export async function POST() {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "XAI_API_KEY not set" }, { status: 500 });
  }

  const r = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expires_after: { seconds: 300 } }),
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: "xAI rejected the request", details: text }, { status: r.status });
  }

  const data = await r.json();
  return NextResponse.json({
    client_secret: { value: data.value, expires_at: data.expires_at },
    voice: "Eve",
    instructions: "You are a helpful voice assistant. Keep responses short and conversational.",
  });
}