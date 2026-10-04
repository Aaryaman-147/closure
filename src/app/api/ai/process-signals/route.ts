import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Signal from '@/models/Signal';
import Loop from '@/models/Loop';
import Evidence from '@/models/Evidence';
import { GoogleGenAI } from '@google/genai';
import Notification from '@/models/Notification';

export async function POST() {
  try {
    await connectToDatabase();
    const userId = 'demo-user-123';

    const unprocessedSignals = await Signal.find({ userId, loopId: { $exists: false } }).limit(10);
    if (unprocessedSignals.length === 0) {
      return NextResponse.json({ message: 'No new signals to process' }, { status: 200 });
    }

    const activeLoops = await Loop.find({ userId, state: { $in: ['inbox', 'active'] } });
    
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'No API Key' }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are the relevance engine for Closure. 
      Analyze these recent activity signals. 
      
      Existing Open Loops:
      ${JSON.stringify(activeLoops.map(l => ({ id: l._id, title: l.title }))) || '[]'}
      
      Recent Signals:
      ${JSON.stringify(unprocessedSignals.map(s => ({ id: s._id, source: s.sourceType, description: s.metadata.description })))}
      
      1. mappings: If a signal strongly relates to an existing loop, map them.
      2. newLoops: If a signal clearly indicates a NEW project, learning goal, or task not on the desk (e.g., studying a new language on LeetCode, or a new GitHub repo), extract a short title for it.

      Return ONLY a JSON object matching this schema without markdown:
      {
        "mappings": [
          { "signalId": "String", "loopId": "String", "confidence": Number, "reason": "String" }
        ],
        "newLoops": [
          { "signalId": "String", "title": "String", "type": "project|learning|task" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: prompt
    });

    const rawText = response.text || "{}";
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(cleanJson);

    let evidenceCreated = 0;
    let newLoopsCreated = 0;

    // Process mappings for existing loops
    if (aiData.mappings) {
      for (const match of aiData.mappings) {
        if (match.confidence > 0.6) { 
          await Signal.findByIdAndUpdate(match.signalId, { loopId: match.loopId, relevance: match.confidence });
          await Evidence.create({ userId, loopId: match.loopId, type: 'activity', description: match.reason, signalIds: [match.signalId], confidence: match.confidence });
          await Loop.findByIdAndUpdate(match.loopId, { attention: 'high' });
          evidenceCreated++;
        }
      }
    }

    // Process completely new loops into the Inbox
    if (aiData.newLoops && aiData.newLoops.length > 0) {
      for (const newLoop of aiData.newLoops) {
        let existingLoop = await Loop.findOne({ userId, title: newLoop.title });
        
        if (!existingLoop) {
          existingLoop = await Loop.create({
            userId,
            title: newLoop.title,
            type: newLoop.type || 'project',
            state: 'inbox',
            attention: 'medium'
          });
          newLoopsCreated++;
        }
        
        await Signal.findByIdAndUpdate(newLoop.signalId, { loopId: existingLoop._id, relevance: 0.9 });
        await Evidence.create({ userId, loopId: existingLoop._id, type: 'activity', description: 'Discovered from recent activity', signalIds: [newLoop.signalId], confidence: 0.9 });
      }

      // Trigger the FR-15 Discovery Notification
      if (newLoopsCreated > 0) {
        await Notification.create({
          userId,
          title: 'New Inbox Items',
          message: `Closure observed your recent activity and added ${newLoopsCreated} new item(s) to your Inbox.`,
          type: 'discovery'
        });
      }
    }

    return NextResponse.json({ success: true, evidenceCreated, newLoopsCreated }, { status: 200 });

  } catch (error) {
    console.error("Signal processing error:", error);
    return NextResponse.json({ error: 'Failed to process signals' }, { status: 500 });
  }
}