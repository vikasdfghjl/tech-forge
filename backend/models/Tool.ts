import mongoose, { Schema, Document } from 'mongoose';

// Comment interface
export interface IComment extends Document {
  text: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Define the Comment schema as a sub-schema
const CommentSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Tool interface
export interface ITool extends Document {
  name: string;
  description: string;
  creator: mongoose.Types.ObjectId;
  upvotes: number;
  wants: number;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Tool schema
const ToolSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  wants: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema], // Add comments array field
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
ToolSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ITool>('Tool', ToolSchema);
