import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IDoc extends MongoDocument {
  userId: string;
  name: string;
  type: string;
  size: number;
  relatedLoopId?: mongoose.Types.ObjectId;
  status: 'processing' | 'ready' | 'failed';
  extractedFacts?: string;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDoc>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  relatedLoopId: { type: Schema.Types.ObjectId, ref: 'Loop' },
  status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'ready' },
  extractedFacts: { type: String }
}, { timestamps: true });

export default mongoose.models.Document || mongoose.model<IDoc>('Document', DocumentSchema);