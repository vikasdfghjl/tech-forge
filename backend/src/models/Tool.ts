import mongoose, { Schema, Document } from 'mongoose';

interface Comment extends Document {
    text: string;
    likes: number;
}

interface ITool extends Document {
    name: string;
    wantCount: number;
    fundCount: number;
    incrementWant(): Promise<ITool>;
    incrementFund(): Promise<ITool>;
    createdAt: Date;
    comments: Comment[];
}

const CommentSchema: Schema = new Schema({
    text: { type: String, required: true },
    likes: { type: Number, default: 0 }
});

const ToolSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    wantCount: {
        type: Number,
        default: 0
    },
    fundCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [CommentSchema]
}, {
    timestamps: true  // This will add createdAt and updatedAt fields
});

ToolSchema.methods.incrementWant = async function(this: ITool): Promise<ITool> {
    this.wantCount += 1;
    return this.save();
};

ToolSchema.methods.incrementFund = async function(this: ITool): Promise<ITool> {
    this.fundCount += 1;
    return this.save();
};

export default mongoose.model<ITool>('Tool', ToolSchema);
