const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    apiKey = match[1].trim();
  }
} catch (error) {
  console.error('Error reading .env.local:', error.message);
  process.exit(1);
}

if (!apiKey) {
  console.error('GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('Testing API Key...');
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error('API Error:', JSON.stringify(json.error, null, 2));
      } else {
      if (json.error) {
        console.error('API Error:', JSON.stringify(json.error, null, 2));
      } else {
        const testModel = 'gemini-flash-latest';
        console.log(`Testing generation with ${testModel}...`);
        
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey}`;
        const req = https.request(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                if (res.statusCode === 200) {
                    console.log('Success! Response length:', body.length);
                    // console.log(body); 
                } else {
                    console.error('Failed:', body);
                }
            });
        });
        
        req.write(JSON.stringify({
            contents: [{ parts: [{ text: "Hello, answer in 5 words." }] }]
        }));
        req.end();
      }
      }
    } catch (e) {
      console.error('Failed to parse response:', data);
    }
  });
}).on('error', (e) => {
  console.error('Request failing:', e);
});
