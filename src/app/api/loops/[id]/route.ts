import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Loop from '@/models/Loop';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();

    if (body.state === 'parked') body.parkedAt = new Date();
    if (body.state === 'closed') body.closedAt = new Date();

    const updatedLoop = await Loop.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedLoop) {
      return NextResponse.json({ error: 'Loop not found' }, { status: 404 });
    }

    return NextResponse.json({ loop: updatedLoop }, { status: 200 });
  } catch (error) {
    console.error('Failed to update loop:', error);
    return NextResponse.json({ error: 'Failed to update loop' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Missing loop ID' }, { status: 400 });
    }

    const deletedLoop = await Loop.findByIdAndDelete(id);

    if (!deletedLoop) {
      return NextResponse.json({ error: 'Loop not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Loop deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete loop:', error);
    return NextResponse.json({ error: 'Failed to delete loop' }, { status: 500 });
  }
}