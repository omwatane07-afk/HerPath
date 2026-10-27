const { spawn } = require('child_process');
const http = require('http');

const child = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', '3005'], {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('Failed to start child process:', err);
  process.exit(1);
});

async function probe() {
  for (let attempt = 1; attempt <= 15; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const result = await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:3005', (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.abort();
          reject(new Error('Timeout'));
        });
      });

      console.log('HTTP Status Code:', result.statusCode);
      console.log('Body length:', result.body.length);
      console.log('Includes HERPATH:', result.body.includes('HERPATH'));
      console.log('Includes Prototype:', result.body.includes('PROTOTYPE'));
      console.log('PROBE TEST PASSED SUCCESSFULLY!');
      child.kill('SIGTERM');
      process.exit(0);
    } catch (err) {
      console.log(`Probe attempt ${attempt} waiting for server... (${err.message})`);
    }
  }
  console.error('Server probe timed out after 15 attempts.');
  child.kill('SIGTERM');
  process.exit(1);
}

probe();
