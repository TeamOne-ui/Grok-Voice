export default function Home() {
  return (
    <main style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0a',color:'#fff',fontFamily:'-apple-system,sans-serif'}}>
      <div id="gate" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}}>
        <h1 style={{fontSize:'24px',fontWeight:'600'}}>Grok Voice</h1>
        <input id="pw" type="password" placeholder="Password" style={{padding:'12px 16px',borderRadius:'8px',border:'1px solid #333',background:'#1a1a1a',color:'#fff',fontSize:'16px',width:'220px'}} />
        <button id="unlock" style={{padding:'12px 28px',border:'none',borderRadius:'24px',background:'#4a9eff',color:'#fff',fontSize:'16px',cursor:'pointer'}}>Unlock</button>
        <div id="err" style={{color:'#e55',fontSize:'14px',minHeight:'18px'}}></div>
      </div>

      <div id="app" style={{display:'none',flexDirection:'column',alignItems:'center'}}>
        <div id="orb" style={{width:'120px',height:'120px',borderRadius:'50%',background:'radial-gradient(circle,#4a9eff,#1a3a6e)',boxShadow:'0 0 40px #4a9eff',transition:'transform .2s'}}></div>
        <button id="btn" style={{marginTop:'32px',padding:'14px 32px',fontSize:'18px',border:'none',borderRadius:'30px',background:'#4a9eff',color:'#fff',cursor:'pointer'}}>Start</button>
        <div id="status" style={{marginTop:'16px',color:'#888',fontSize:'14px'}}>Tap to talk</div>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        const GATE = document.getElementById('gate');
        const APP = document.getElementById('app');
        const ERR = document.getElementById('err');
        const ORB = document.getElementById('orb');
        const BTN = document.getElementById('btn');
        const STATUS = document.getElementById('status');
        let ws, audioCtx, micStream, processor, nextPlayTime = 0;

        document.getElementById('unlock').onclick = async () => {
          const pw = document.getElementById('pw').value;
          const r = await fetch('/api/auth', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password: pw }) });
          if (r.ok) { GATE.style.display = 'none'; APP.style.display = 'flex'; }
          else { ERR.textContent = 'Wrong password'; }
        };

        function toBase64(bytes) {
          let bin = '';
          const chunk = 0x8000;
          for (let i = 0; i < bytes.length; i += chunk) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
          }
          return btoa(bin);
        }

        async function start() {
          STATUS.textContent = 'Connecting...';
          const r = await fetch('/api/session', { method: 'POST' });
          const data = await r.json();
          if (data.error) { STATUS.textContent = data.error; return; }
          const token = data.client_secret && data.client_secret.value;
          if (!token) { STATUS.textContent = 'No token'; return; }
          ws = new WebSocket('wss://api.x.ai/v1/realtime?model=grok-voice-latest', );
          ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'session.update', session: {
              voice: 'Eve',
              instructions: 'You are a helpful voice assistant. Keep responses short and conversational.',
              turn_detection: { type: 'server_vad' },
              audio: { input: { format: { type: 'audio/pcm', rate: 24000 } }, output: { format: { type: 'audio/pcm', rate: 24000 } } }
            }}));
            startMic();
            STATUS.textContent = 'Listening';
            BTN.textContent = 'Stop';
          };
          ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'response.output_audio.delta' && msg.delta) playChunk(msg.delta);
            if (msg.type === 'error') STATUS.textContent = 'Error: ' + (msg.message || JSON.stringify(msg));
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
            for (let i = 0; i < input.length; i++) {
              const s = Math.max(-1, Math.min(1, input ));
              pcm = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: toBase64(new Uint8Array(pcm.buffer)) }));
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
          for (let i = 0; i < pcm.length; i++) ch = pcm / 32768;
          const src = audioCtx.createBufferSource();
          src.buffer = buf;
          src.connect(audioCtx.destination);
          const now = audioCtx.currentTime;
          if (nextPlayTime < now) nextPlayTime = now;
          src.start(nextPlayTime);
          nextPlayTime += buf.duration;
        }

        function stopMic() {
          if (processor) processor.disconnect();
          if (micStream) micStream.getTracks().forEach(t => t.stop());
          if (audioCtx) audioCtx.close();
        }

        BTN.onclick = () => {
          if (ws && ws.readyState === 1) ws.close();
          else start();
        };
      `}} />
    </main>
  );
}