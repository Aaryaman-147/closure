import mongoose, { Schema, Document } from 'mongoose';

export interface ILoop extends Document {
  userId: string; // Will tie into authentication later
  title: string;
  description?: string;
  type: 'project' | 'goal' | 'recurring' | 'learning' | 'task' | 'other';
  state: 'inbox' | 'active' | 'parked' | 'closed';
  attention: 'low' | 'medium' | 'high';
  confidence?: number;
  deadline?: Date;
  lastActivityAt?: Date;
  parkedAt?: Date;
  closedAt?: Date;
  metadata?: Record<string, any>;
}

const LoopSchema = new Schema<ILoop>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['project', 'goal', 'recurring', 'learning', 'task', 'other'],
      default: 'project',
    },
    state: {
      type: String,
      enum: ['inbox', 'active', 'parked', 'closed'],
      default: 'inbox',
    },
    attention: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    confidence: { type: Number },
    deadline: { type: Date },
    lastActivityAt: { type: Date },
    parkedAt: { type: Date },
    closedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt[cite: 1]
  }
);

export default mongoose.models.Loop || mongoose.model<ILoop>('Loop', LoopSchema);