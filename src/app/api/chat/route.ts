import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// DEBUGGING: Log environment status
console.log('--- API INIT (RAW FETCH) ---');
console.log('API Key configured:', !!process.env.GEMINI_API_KEY);

// Load Knowledge Base
let knowledgeContext = '';
try {
    const filePath = path.join(process.cwd(), 'src/data/knowledge.json');
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(rawData);
        knowledgeContext = json.map((item: any) => `Source: ${item.url}\n${item.content}\n---\n`).join('\n');
        console.log(`Knowledge Base Loaded: ${json.length} documents.`);
    } else {
        console.error('CRITICAL: knowledge.json NOT FOUND at', filePath);
        knowledgeContext = "Warning: Knowledge base is empty. System could not load data.";
    }
} catch (error) {
    console.error('CRITICAL: Error loading knowledge base:', error);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
            return NextResponse.json({ error: "Configuration Error: API Key is missing or invalid." }, { status: 500 });
        }

        const prompt = `
      You are an expert assistant for the National Stock Exchange (NSE) of India.
      Answer the user's question based strictly on the context below.
      
      CONTEXT:
      ${knowledgeContext}
      
      USER QUESTION:
      ${message}
      
      GUIDELINES:
      - Be polite, professional, and concise.
      - If the answer is not in the context, state that clearly.
      - Use markdown for formatting (bold, lists).
    `;

        // Switch to Raw Fetch to bypass SDK 404 issues
        console.log('Sending RAW FETCH request to Gemini 1.5 Flash...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error (Raw):', response.status, errorText);

            // Fallback strategies for known error codes
            if (response.status === 404) {
                return NextResponse.json({ error: "Model Not Found (404). The API Key or Model region might be restricted." }, { status: 500 });
            }
            if (response.status === 429) {
                return NextResponse.json({ error: "Rate Limited (429). The system is busy." }, { status: 500 });
            }

            throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('Unexpected API Response format:', JSON.stringify(data));
            throw new Error('No text in response');
        }

        return NextResponse.json({ response: text });

    } catch (error: any) {
        console.error('API Handler Failed:', error);
        return NextResponse.json({
            error: error.message || "Failed to communicate with AI service."
        }, { status: 500 });
    }
}
