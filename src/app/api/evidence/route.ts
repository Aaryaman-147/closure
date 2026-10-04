import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Evidence from '@/models/Evidence';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loopId = searchParams.get('loopId');

    if (!loopId) {
      return NextResponse.json({ error: 'Missing loopId parameter' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch evidence for this specific loop, newest first
    const evidence = await Evidence.find({ loopId }).sort({ createdAt: -1 }).limit(10);
    
    return NextResponse.json({ evidence }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch evidence:', error);
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 });
  }
}