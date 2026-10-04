import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Doc from '@/models/Document';
import Loop from '@/models/Loop';
import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';

// Safely instantiate Node's CommonJS require for strict ESM environments

export async function GET() {
  try {
    await connectToDatabase();
    const userId = 'demo-user-123';
    
    const documents = await Doc.find({ userId })
      .populate('relatedLoopId', 'title')
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const loopId = formData.get('loopId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let extractedText = "";

    // Use our custom strict-mode compatible require
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
const data = await parser.getText();
extractedText = data.text;
await parser.destroy();
    } else {
      extractedText = buffer.toString('utf-8');
    }

    await connectToDatabase();
    const userId = 'demo-user-123';
    
    const kbSize = (extractedText.length / 1024).toFixed(1);
    const factSnippet = `Extracted ${kbSize}kb of context`;

    const newDoc = await Doc.create({
      userId,
      name: file.name,
      type: file.type || 'unknown',
      size: file.size,
      relatedLoopId: loopId && loopId !== 'none' ? loopId : undefined,
      status: 'ready',
      extractedFacts: factSnippet
    });

    let extractedDeadline = null;
    
    if (loopId && loopId !== 'none' && extractedText) {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          
          const prompt = `
            You are a deadline extraction assistant.
            Read the following document text and find the most critical deadline, due date, or target date mentioned.
            The current date is October 3, 2026.
            
            Return ONLY a JSON object matching this schema without markdown:
            {
              "hasDeadline": boolean,
              "deadlineDate": "ISO 8601 date string (e.g., 2026-10-15T23:59:00Z) or null"
            }
            
            Document Text:
            ${extractedText.substring(0, 15000)} 
          `;

          const response = await ai.models.generateContent({
            model: 'gemma-4-31b-it',
            contents: prompt
          });

          const rawText = response.text || "{}";
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          const cleanJson = jsonMatch ? jsonMatch[0] : "{}";
          const aiData = JSON.parse(cleanJson);

          if (aiData.hasDeadline && aiData.deadlineDate) {
            extractedDeadline = new Date(aiData.deadlineDate);
            
            await Loop.findByIdAndUpdate(loopId, { 
              deadline: extractedDeadline,
              attention: 'high' 
            });
          }
        } catch (aiError) {
          console.error("AI Deadline Extraction Failed:", aiError);
        }
      }
    }

    const populatedDoc = await Doc.findById(newDoc._id).populate('relatedLoopId', 'title');

    return NextResponse.json({ 
      document: populatedDoc,
      deadlineFound: !!extractedDeadline,
      deadline: extractedDeadline 
    }, { status: 201 });
  } catch (error) {
    console.error("Document processing failed:", error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}