export default function handler(req, res) {
  const user = process.env.AUTH_USER || "admin";
  const pass = process.env.AUTH_PASS || "changeme";
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");
  if (parts[0 1 1], "base64").toString();
    const creds = decoded.split(":");
    if (creds[0 1] === pass) {
      res.status(200).send("ok");
      return;
    }
  }
  res.setHeader("WWW-Authenticate", 'Basic realm="GrokVoice"');
  res.status(401).send("Unauthorized");
}