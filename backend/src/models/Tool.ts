import mongoose, { Document } from 'mongoose';

interface ITool extends Document {
    name: string;
    wantCount: number;
    fundCount: number;
    incrementWant(): Promise<ITool>;
    incrementFund(): Promise<ITool>;
}

const ToolSchema = new mongoose.Schema({
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
    }
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
