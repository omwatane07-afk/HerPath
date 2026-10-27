const { execSync } = require('child_process');
const http = require('http');

const PORT = 3010;

// Probe to make sure server is up
http.get(`http://127.0.0.1:${PORT}`, (res) => {
  console.log('Server is alive, status:', res.statusCode);
}).on('error', (err) => {
  console.error('Server is not running on 3010:', err.message);
  process.exit(1);
});
