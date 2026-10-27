const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3000;

const outDir = path.join(__dirname, 'atelier');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const modules = ['route', 'map', 'facilities', 'reports', 'family', 'civic'];

const viewports = [
  { prefix: 'desktop-1440', width: 1440, height: 900, mobile: false },
  { prefix: 'mobile-390', width: 390, height: 844, mobile: true },
];

async function capture() {
  console.log('Capturing Bordeaux Atelier verification screenshots...');
  for (const vp of viewports) {
    for (const mod of modules) {
      const fileName = `${vp.prefix}-${mod}.png`;
      const outPath = path.join(outDir, fileName);
      const url = `http://127.0.0.1:${PORT}/?tab=${mod}`;
      console.log(`Capturing ${fileName}...`);
      try {
        const uaFlag = vp.mobile
          ? '--use-mobile-user-agent --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"'
          : '';
        const cmd = `"${EDGE_PATH}" --headless=new --disable-gpu --virtual-time-budget=5000 --force-device-scale-factor=1 --hide-scrollbars ${uaFlag} --window-size=${vp.width},${vp.height} --screenshot="${outPath}" "${url}"`;
        execSync(cmd, { stdio: 'inherit' });
        if (fs.existsSync(outPath)) {
          const stats = fs.statSync(outPath);
          console.log(`Saved ${fileName} (${stats.size} bytes)`);
        }
      } catch (err) {
        console.error(`Error capturing ${fileName}:`, err.message);
      }
    }
  }
  console.log('Bordeaux Atelier screenshots captured.');
}

capture();
