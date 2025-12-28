const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local manually to get key
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    console.error("Could not find GEMINI_API_KEY in .env.local");
    process.exit(1);
}

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
];

function testModel(model) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS: ${model} is working!`);
                } else {
                    console.log(`❌ FAILED: ${model} (Status: ${res.statusCode})`);
                    try {
                        const err = JSON.parse(body);
                        console.log(`   Reason: ${err.error?.message || body.substring(0, 100)}`);
                    } catch {
                        console.log(`   Raw: ${body.substring(0, 100)}`);
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`❌ ERROR: ${model} - ${e.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log(`Testing models with API Key ending in ...${apiKey.slice(-5)}`);
    for (const model of models) {
        await testModel(model);
    }
}

runTests();
