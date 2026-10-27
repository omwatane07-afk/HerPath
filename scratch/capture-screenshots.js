const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3010;

const child = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('Failed to spawn server:', err);
  process.exit(1);
});

async function waitForServer() {
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${PORT}`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error('Status ' + res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(2500, () => {
          req.abort();
          reject(new Error('Timeout'));
        });
      });
      console.log('Server is responsive on port', PORT);
      return true;
    } catch (e) {
      console.log('Probe error:', e.message || e);
    }
  }
  return false;
}

async function run() {
  const ready = await waitForServer();
  if (!ready) {
    console.error('Server failed to become ready');
    child.kill('SIGTERM');
    process.exit(1);
  }

  // Allow extra 1.5s for initial JS hydration
  await new Promise((r) => setTimeout(r, 1500));

  const viewports = [
    { name: 'mobile-390x844.png', width: 390, height: 844 },
    { name: 'mobile-360x800.png', width: 360, height: 800 },
    { name: 'desktop-1280x800.png', width: 1280, height: 800 },
  ];

  const scratchDir = path.join(__dirname);
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  for (const vp of viewports) {
    const outPath = path.join(scratchDir, vp.name);
    console.log(`Capturing screenshot ${vp.name} (${vp.width}x${vp.height})...`);
    try {
      const isMobile = vp.width < 768;
      const uaFlag = isMobile
        ? '--use-mobile-user-agent --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"'
        : '';
      const cmd = `"${EDGE_PATH}" --headless=new --disable-gpu --force-device-scale-factor=1 --hide-scrollbars ${uaFlag} --window-size=${vp.width},${vp.height} --screenshot="${outPath}" "http://127.0.0.1:${PORT}"`;
      execSync(cmd, { stdio: 'inherit' });
      if (fs.existsSync(outPath)) {
        const stats = fs.statSync(outPath);
        console.log(`Saved ${vp.name} (${stats.size} bytes)`);
      }
    } catch (err) {
      console.error(`Error capturing ${vp.name}:`, err.message);
    }
  }

  child.kill('SIGTERM');
  console.log('All screenshots captured successfully.');
  process.exit(0);
}

run();
