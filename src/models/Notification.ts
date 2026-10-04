import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'deadline' | 'inactivity' | 'attention' | 'discovery' | 'system';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['deadline', 'inactivity', 'attention', 'discovery', 'system'], required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);