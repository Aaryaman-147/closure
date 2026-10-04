import mongoose, { Schema, Document } from 'mongoose';

export interface ISignal extends Document {
  userId: string;
  sourceId?: string;
  sourceType: 'github' | 'browser' | 'youtube' | 'leetcode' | 'calendar' | 'document';
  timestamp: Date;
  loopId?: string; // If associated with a specific loop
  metadata: Record<string, any>;
  relevance?: number;
  expiresAt: Date; // TTL index
}

const SignalSchema = new Schema<ISignal>(
  {
    userId: { type: String, required: true },
    sourceId: { type: String },
    sourceType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    loopId: { type: Schema.Types.ObjectId, ref: 'Loop' },
    metadata: { type: Schema.Types.Mixed },
    relevance: { type: Number },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete raw signals when they expire to save space and respect privacy
SignalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Signal || mongoose.model<ISignal>('Signal', SignalSchema);