import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const userId = 'demo-user-123';
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
      
    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const userId = 'demo-user-123';
    const { notificationId, markAll } = await request.json();

    if (markAll) {
      await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    } else if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}