import { next } from "@vercel/edge";

export const config = { 
matcher: "/:path*", 
};

export default function middleware(request) { 
const auth = request.headers.get("authorization");

if (auth) { 
const = atob(auth.split(" ")[1]).split(":"); 
if (user = process.env.AUTH_USER && pass = process.env.AUTH_PASS) { 
return next(); 
} 
}

return new Response("Auth required", { 
status: 401, 
headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' }, 
}); 
}