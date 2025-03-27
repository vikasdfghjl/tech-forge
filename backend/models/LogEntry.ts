import mongoose, { Schema, Document } from 'mongoose';

export interface ILogEntry extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  details: any;
  createdAt: Date;
}

const LogEntrySchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Index for faster querying of logs by user
LogEntrySchema.index({ user: 1, createdAt: -1 });
// Index for querying logs by target
LogEntrySchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default mongoose.model<ILogEntry>('LogEntry', LogEntrySchema);
