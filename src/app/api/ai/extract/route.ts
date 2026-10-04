import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("No Google API key found, falling back to heuristics.");
      return NextResponse.json({ candidates: [{ title: 'Add API Key', type: 'task' }] }, { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are the extraction layer for a productivity app called Closure.
      Extract active projects, goals, or tasks from the user's brain dump.
      Classify each into one of these types: "project", "goal", "recurring", "learning", "task", "other".
      Respond ONLY with a JSON array of objects following this schema:
      [{"title": "String", "type": "String"}]
    `;

    // Removed the unsupported config block
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `${systemInstruction}\n\nUser Input: ${prompt}`
    });

    const rawText = response.text || "[]";
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const candidates = JSON.parse(cleanJson);

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    console.error("Google AI Extraction error:", error);
    return NextResponse.json({ error: 'AI Extraction failed' }, { status: 500 });
  }
}