import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  observationEnabled: boolean;
  retentionDays: number;
  notificationIntensity: 'Minimal' | 'Balanced' | 'Proactive';
  allowedDomains: string[]; // <-- New field
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  observationEnabled: { type: Boolean, default: true },
  retentionDays: { type: Number, default: 30 },
  notificationIntensity: { type: String, enum: ['Minimal', 'Balanced', 'Proactive'], default: 'Balanced' },
  allowedDomains: { type: [String], default: ['github.com', 'leetcode.com', 'youtube.com'] } // <-- Default domains
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);