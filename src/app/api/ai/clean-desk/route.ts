import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { loops } = await request.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'No API Key' }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are the desk cleanup assistant for a productivity app. 
      Evaluate the provided list of open loops. 
      Suggest which ones to 'park' (inactive, no clear deadline) and which to 'keepActive' (upcoming deadlines, highly relevant).
      Return ONLY a JSON object matching this schema without any markdown formatting:
      {
        "park": [{"id": "String", "title": "String", "reason": "String"}],
        "keepActive": [{"id": "String", "title": "String", "reason": "String"}]
      }
    `;

    // Removed the unsupported config block for Gemma models
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `${systemInstruction}\n\nLoops: ${JSON.stringify(loops)}`
    });
    
    const rawText = response.text || "{}";
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const suggestions = JSON.parse(cleanJson);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Google AI Clean Desk error:", error);
    return NextResponse.json({ error: 'AI Clean Desk failed' }, { status: 500 });
  }
}