const mongoose = require("mongoose");

const ChartConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String },
  icon: { type: String }, // Store icon name or URL
  color: { type: String },
  theme: { type: Object }, // Store theme as an object
});

module.exports = mongoose.model("ChartConfig", ChartConfigSchema);