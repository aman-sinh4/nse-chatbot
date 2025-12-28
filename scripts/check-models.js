const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    console.log("Fetching available models...");
    // For listing models, we might need to access the model list endpoint directly 
    // or just try a simple generation to see what works if list is not exposed easily in this SDK version.
    // Actually, SDK has reasonable defaults. Let's try to just instantiate gemini-1.5-flash and run a hello world.
    
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} works!`);
            console.log(`Response: ${response.text()}`);
            return; // Found one that works
        } catch (e) {
            console.log(`FAILED: ${modelName} - ${e.message}`);
        }
    }
    console.log("No working models found in standard list.");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
