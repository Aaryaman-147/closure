import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Loop from '@/models/Loop';

// GET: Fetch all loops for the Desk
export async function GET() {
  try {
    await connectToDatabase();
    
    // For V1, we'll hardcode a dummy userId until you add real authentication
    const userId = 'demo-user-123';
    
    const loops = await Loop.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ loops }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch loops:', error);
    return NextResponse.json({ error: 'Failed to fetch loops' }, { status: 500 });
  }
}

// POST: Create a new loop (e.g., from the Brain Dump)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const userId = 'demo-user-123'; // Hardcoded for now
    
    // Create a new loop with the provided data
    const newLoop = await Loop.create({
      userId,
      title: body.title,
      type: body.type || 'project',
      state: body.state || 'inbox',
      attention: body.attention || 'medium',
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    });
    
    return NextResponse.json({ loop: newLoop }, { status: 201 });
  } catch (error) {
    console.error('Failed to create loop:', error);
    return NextResponse.json({ error: 'Failed to create loop' }, { status: 500 });
  }
}