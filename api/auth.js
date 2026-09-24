export default function handler(req, res) { 
const user = process.env.AUTH_USER || 'admin'; 
const pass = process.env.AUTH_PASS || 'changeme'; 
const auth = req.headers.authorization || ''; 
const =