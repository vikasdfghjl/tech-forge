const mongoose = require("mongoose");

const ToolIdeaSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 50 },
  description: { type: String, required: true, maxLength: 200 },
  upvotes: { type: Number, default: 0 },
  wants: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  creator: { type: String, default: "Anonymous" },
});

module.exports = mongoose.model("ToolIdea", ToolIdeaSchema);
