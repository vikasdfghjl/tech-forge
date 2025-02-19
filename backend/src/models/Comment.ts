import { Schema, model, Document } from 'mongoose';

interface Comment extends Document {
    text: string;
    likes: number;
}

const commentSchema = new Schema<Comment>({
    text: { type: String, required: true },
    likes: { type: Number, default: 0 }
});

const Comment = model<Comment>('Comment', commentSchema);

export default Comment;
