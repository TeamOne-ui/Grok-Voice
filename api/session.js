export async function POST(request) { 
const r = await fetch("https://api.x.ai/v1/realtime/client_secrets", { 
method: "POST", 
headers: { 
Authorization: "Bearer " + process.env.XAI_API_KEY, 
"Content-Type": "application/json", 
}, 
body: JSON.stringify({ expires_after: { seconds: 300 } }), 
}); 
return new Response(await r.text(), { 
status: r.status, 
headers: { "Content-Type": "application/json" }, 
}); 
}