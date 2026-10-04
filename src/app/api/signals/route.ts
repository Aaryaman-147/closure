import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Signal from '@/models/Signal';

export async function GET() {
  try {
    await connectToDatabase();
    const userId = 'demo-user-123';
    
    const signals = await Signal.find({ userId }).sort({ timestamp: -1 }).limit(20);
    return NextResponse.json({ signals }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch signals:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const userId = 'demo-user-123';

    // Prevent duplicates (e.g., refreshing the same YouTube video multiple times in a row)
    const recentDuplicate = await Signal.findOne({
      userId,
      sourceType: 'browser',
      'metadata.url': body.url,
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 mins
    });

    if (recentDuplicate) {
      return NextResponse.json({ message: 'Skipped duplicate signal' }, { status: 200 });
    }

    const newSignal = await Signal.create({
      userId,
      sourceId: `browser-${Date.now()}`,
      sourceType: 'browser',
      timestamp: new Date(),
      metadata: {
        description: `Read "${body.title}"`,
        url: body.url,
        domain: body.domain
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // TTL: 30 days
    });

    return NextResponse.json({ success: true, signal: newSignal }, { status: 201 });
  } catch (error) {
    console.error('Failed to save browser signal:', error);
    return NextResponse.json({ error: 'Failed to save signal' }, { status: 500 });
  }
}