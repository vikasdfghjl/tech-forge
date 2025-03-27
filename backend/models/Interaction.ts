import mongoose, { Schema, Document } from 'mongoose';
import LogEntry from './LogEntry';

export interface IInteraction extends Document {
  user: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: 'product' | 'project' | 'post' | 'tool'; 
  interactionType: 'upvote' | 'want';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasUpvoted?: boolean;
  hasWanted?: boolean; 
}

const InteractionSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    itemType: {
      type: String, 
      enum: ['product', 'project', 'post', 'tool'], 
      required: true
    },
    interactionType: {
      type: String,
      enum: ['upvote', 'want'],
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Create compound index to ensure a user can only have one interaction per item/type
InteractionSchema.index(
  { user: 1, itemId: 1, interactionType: 1 },
  { unique: true }
);

// Add middleware for logging upvote actions
InteractionSchema.post('save', async function(doc) {
  try {
    if (doc.interactionType === 'upvote') {
      const action = doc.active ? 'added upvote' : 'removed upvote';
      console.log(`[DEBUG] User ${doc.user} ${action} for ${doc.itemType} ${doc.itemId}`);
      
      await LogEntry.create({
        user: doc.user,
        action: action,
        targetType: doc.itemType,
        targetId: doc.itemId,
        details: {
          interactionId: doc._id,
          status: doc.active ? 'active' : 'inactive'
        }
      });
    } else if (doc.interactionType === 'want') {
      const action = doc.active ? 'added to wants' : 'removed from wants';
      console.log(`[DEBUG] User ${doc.user} ${action} for ${doc.itemType} ${doc.itemId}`);
    }
  } catch (error) {
    console.error('[ERROR] Failed to process post-save hook for interaction:', error);
  }
});

// Add a pre-save hook for debugging
InteractionSchema.pre('save', function(next) {
  console.log(`[DEBUG] Processing ${this.interactionType} interaction for ${this.itemType} ${this.itemId}`);
  console.log(`[DEBUG] Interaction status: ${this.active ? 'active' : 'inactive'}`);
  next();
});

export default mongoose.model<IInteraction>('Interaction', InteractionSchema);
