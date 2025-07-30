const https = require('https');

console.log('Testing connection to guardant.me...');

const options = {
  hostname: 'guardant.me',
  port: 443,
  path: '/api/public/workers/register/test/status',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.error('Error details:', e);
});

req.end();

// Also test with fetch
console.log('\nTesting with fetch...');
fetch('https://guardant.me/api/public/workers/register/test/status')
  .then(res => {
    console.log('Fetch successful:', res.status);
  })
  .catch(err => {
    console.error('Fetch failed:', err);
    console.error('Error type:', err.name);
    console.error('Error code:', err.code);
  });