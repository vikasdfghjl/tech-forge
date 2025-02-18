import mongoose, { Document } from 'mongoose';

// Interfaces
interface ITool {
    name: string;
    type: 'want' | 'fund';
    addedAt: Date;
}

interface IProject extends Document {
    name: string;
    title: string;
    description: string;
    wantCount: number;
    fundCount: number;
    tools: ITool[];
    createdAt: Date;
    addTool(toolName: string, type: 'want' | 'fund'): Promise<IProject>;
}

// Schema Definition
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    wantCount: { type: Number, default: 0 },
    fundCount: { type: Number, default: 0 },
    tools: [{
        name: String,
        type: { type: String, enum: ['want', 'fund'] },
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Simplified method - controller handles the main logic
ProjectSchema.methods.addTool = async function(
    this: IProject,
    toolName: string,
    type: 'want' | 'fund'
): Promise<IProject> {
    this.tools.push({ name: toolName, type, addedAt: new Date() });
    this[`${type}Count`] += 1;
    return this.save();
};

// Export Model
export default mongoose.model<IProject>('Project', ProjectSchema);
