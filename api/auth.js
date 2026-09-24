export default function handler(req, res) {
  const user = process.env.AUTH_USER || "admin";
  const pass = process.env.AUTH_PASS || "changeme";
  const auth = req.headers.authorization || "";
  const = auth.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = Buffer.from(encoded, "base64").toString();
    const = decoded.split(":");
    if (u === user && p === pass) {
      res.status(200).send("ok");
      return;
    }
  }
  res.setHeader("WWW-Authenticate", 'Basic realm="GrokVoice"');
  res.status(401).send("Unauthorized");
}