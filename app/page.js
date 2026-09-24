import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Grok Voice</title>
<style>
  body { margin:0; background:#0a0a0a; color:#fff; font-family:-apple-system,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; }
  #orb { width:120px; height:120px; border-radius:50%; background:radial-gradient(circle,#4a9eff,#1a3a6e); box-shadow:0 0 40px #4a9eff; transition:transform .2s; }
  #orb.talking { transform:scale(1.15); }
  button { margin-top:32px; padding:14px 32px; font-size:18px; border:none; border-radius:30px; background:#4a9eff; color:#fff; cursor:pointer; }
  #status { margin-top:16px; color:#888; font-size:14px; }
</style>
</head>
<body>
  <div id="orb"></div>
  <button id="btn">Start</button>
  <div id="status">Tap to talk</div>
<script>
const ORB = document.getElementById('orb');
const BTN = document.getElementById('btn');
const STATUS = document.getElementById('status');
let ws, audioCtx, micStream, processor, playing = false;

async function start() {
  STATUS.textContent = 'Connecting...';
  const r = await fetch('/api/session', { method: 'POST' });
  const data = await r.json();
  const token = data.value || (data.client_secret && data.client_secret.value);
  if (!token) { STATUS.textContent = 'No token: ' + JSON.stringify(data); return; }

  ws = new WebSocket('wss://api.x.ai/v1/realtime', );

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'session.update',
      session: {
        voice: 'Eve',
        instructions: 'You are a helpful voice assistant. Keep responses short and conversational.',
        turn_detection: { type: 'server_vad' },
        audio: {
          input:  { format: { type: 'audio/pcm', rate: 24000 } },
          output: { format: { type: 'audio/pcm', rate: 24000 } }
        }
      }
    }));
    startMic();
    STATUS.textContent = 'Listening';
    BTN.textContent = 'Stop';
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'response.output_audio.delta' && msg.delta) {
      playChunk(msg.delta);
    }
  };

  ws.onerror = () => STATUS.textContent = 'Connection error';
  ws.onclose = () => { STATUS.textContent = 'Disconnected'; BTN.textContent = 'Start'; stopMic(); };
}

async function startMic() {
  audioCtx = new AudioContext({ sampleRate: 24000 });
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const src = audioCtx.createMediaStreamSource(micStream);
  processor = audioCtx.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (e) => {
    if (!ws || ws.readyState !== 1) return;
    const input = e.inputBuffer.getChannelData(0);
    const pcm = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) pcm = Math.max(-1, Math.min(1, input )) * 32767;
    const bytes = new Uint8Array(pcm.buffer);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes );
    ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: btoa(bin) }));
  };
  src.connect(processor);
  processor.connect(audioCtx.destination);
}

function playChunk(b64) {
  if (!audioCtx) return;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes = bin.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer);
  const buf = audioCtx.createBuffer(1, pcm.length, 24000);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < pcm.length; i++) ch = pcm / 32767;
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx.destination);
  src.start();
}

function stopMic() {
  if (processor) processor.disconnect();
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  if (audioCtx) audioCtx.close();
}

BTN.onclick = () => {
  if (ws && ws.readyState === 1) { ws.close(); }
  else { start(); }
};
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}