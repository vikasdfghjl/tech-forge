import mongoose, { Schema, Document } from 'mongoose';

export interface ITool extends Document {
  name: string;
  description: string;
  upvotes: number;
  wants: number;
  createdAt: Date;
  updatedAt: Date;
}

const ToolSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tool name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Tool description is required'],
      trim: true,
    },
    upvotes: {
      type: Number,
      default: 0, // Initialize with 0
    },
    wants: {
      type: Number,
      default: 0, // Initialize with 0
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model<ITool>('Tool', ToolSchema);
