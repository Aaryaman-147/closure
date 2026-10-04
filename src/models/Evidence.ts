import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  userId: string;
  loopId: string;
  type: string;
  description: string;
  sourceIds?: string[];
  signalIds?: string[];
  confidence: number;
  expiresAt?: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    userId: { type: String, required: true },
    loopId: { type: Schema.Types.ObjectId, ref: 'Loop', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    sourceIds: [{ type: String }],
    signalIds: [{ type: Schema.Types.ObjectId, ref: 'Signal' }],
    confidence: { type: Number, required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);