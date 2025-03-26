import mongoose from "mongoose";

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  wants: { type: Number, default: 0 },
});

const Tool = mongoose.model("Tool", toolSchema);

export default Tool;
