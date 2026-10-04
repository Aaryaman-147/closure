import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  let user = await User.findOne({ userId: 'demo-user-123' });
  if (!user) user = await User.create({ userId: 'demo-user-123' });
  return NextResponse.json({ settings: user });
}

export async function PATCH(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const updated = await User.findOneAndUpdate(
    { userId: 'demo-user-123' }, 
    { $set: body }, 
    { new: true, upsert: true }
  );
  return NextResponse.json({ settings: updated });
}