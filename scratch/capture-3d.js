const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3000;
const artifactDir = 'C:\\Users\\shrin\\.gemini\\antigravity-ide\\brain\\42b8ef74-4243-46b9-9af5-be72cbf22aff';
const outPath = path.join(artifactDir, 'nightbloom-desktop-1440-3dcity.png');

async function test3D() {
  console.log('Launching browser to test 3D City toggle...');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist'],
      defaultViewport: { width: 1440, height: 900 },
    });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/?tab=route`, { waitUntil: 'networkidle2' });
    console.log('Page loaded, locating 3D City toggle button...');

    // Find button containing text "3D City"
    const buttons = await page.$$('button');
    let toggleBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && text.includes('3D City')) {
        toggleBtn = btn;
        break;
      }
    }

    if (toggleBtn) {
      console.log('Found 3D City button, clicking...');
      await toggleBtn.click();
      await new Promise(r => setTimeout(r, 4000));
      await page.screenshot({ path: outPath });
      console.log('Saved 3D City screenshot to:', outPath);
    } else {
      console.log('3D City button not found among buttons');
    }
  } catch (err) {
    console.error('3D toggle test error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

test3D();
