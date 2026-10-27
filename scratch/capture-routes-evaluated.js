const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3017;

const child = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
  stdio: 'inherit',
  shell: true,
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
      return true;
    } catch (e) {}
  }
  return false;
}

async function run() {
  await waitForServer();

  // Wait 7.5 seconds to ensure OSRM probe / fallback resolves and routes are fully rendered
  await new Promise((r) => setTimeout(r, 7500));

  const scratchDir = path.join(__dirname);
  const outPath = path.join(scratchDir, 'desktop-routes-evaluated.png');
  const cmd = `"${EDGE_PATH}" --headless=new --disable-gpu --force-device-scale-factor=1 --hide-scrollbars --window-size=1440,900 --screenshot="${outPath}" "http://127.0.0.1:${PORT}"`;
  execSync(cmd, { stdio: 'inherit' });

  // Also capture mobile with evaluated routes
  const mobilePath = path.join(scratchDir, 'mobile-routes-evaluated.png');
  const mobileCmd = `"${EDGE_PATH}" --headless=new --disable-gpu --force-device-scale-factor=1 --hide-scrollbars --use-mobile-user-agent --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1" --window-size=390,844 --screenshot="${mobilePath}" "http://127.0.0.1:${PORT}"`;
  execSync(mobileCmd, { stdio: 'inherit' });

  child.kill('SIGTERM');
  console.log('Evaluated routes captured for desktop and mobile.');
  process.exit(0);
}

run();
