const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_PORT = 3010;
const DEBUG_PORT = 9223;

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  // 1. Spawn Next.js server
  const server = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', String(APP_PORT), '-H', '127.0.0.1'], {
    shell: true,
    stdio: 'ignore'
  });

  // Wait for server
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      await fetchJson(`http://127.0.0.1:${APP_PORT}`);
      break;
    } catch (e) {}
  }

  // 2. Spawn Edge with remote debugging
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${DEBUG_PORT}`,
    'about:blank'
  ]);

  // Wait for Edge debug port
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const tabs = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
      if (tabs && tabs.length > 0 && tabs[0].webSocketDebuggerUrl) {
        wsUrl = tabs[0].webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Could not connect to Edge debugger');
    server.kill();
    edge.kill();
    process.exit(1);
  }

  console.log('Connected to Edge DevTools WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r));

  await sendCDP(ws, 'Page.enable');

  const viewports = [
    { name: 'mobile-390x844.png', width: 390, height: 844, mobile: true },
    { name: 'mobile-360x800.png', width: 360, height: 800, mobile: true },
    { name: 'desktop-1280x800.png', width: 1280, height: 800, mobile: false }
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height}) mobile=${vp.mobile}`);
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    if (vp.mobile) {
      await sendCDP(ws, 'Emulation.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
      });
    }

    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${APP_PORT}` });
    await new Promise(r => setTimeout(r, 2000)); // wait for hydration and map load

    const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const outPath = path.join(__dirname, vp.name);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved screenshot ${vp.name} (${buf.length} bytes)`);
  }

  ws.close();
  edge.kill();
  server.kill();
  console.log('Finished capturing all viewports.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
