export default async function handler(req, res) { 
const r = await fetch("https://api.x.ai/v1/realtime/client_secrets", { 
method: "POST", 
headers: { 
Authorization: Bearer ${process.env.XAI_API_KEY}, 
"Content-Type": "application/json", 
}, 
body: JSON.stringify({ expires_after: { seconds: 300 } }), 
}); 
res.status(r.status).json(await r.json()); 
}
