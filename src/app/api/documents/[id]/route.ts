import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Doc from '@/models/Document';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await Promise.resolve(params);
    
    await Doc.findByIdAndDelete(resolvedParams.id);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}