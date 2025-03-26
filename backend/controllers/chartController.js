const ChartConfig = require("../models/ChartConfig");

// Get all chart configurations
exports.getChartConfigs = async (req, res) => {
  try {
    const configs = await ChartConfig.find();
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new chart configuration
exports.addChartConfig = async (req, res) => {
  try {
    const newConfig = new ChartConfig(req.body);
    const savedConfig = await newConfig.save();
    res.status(201).json(savedConfig);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a chart configuration
exports.updateChartConfig = async (req, res) => {
  try {
    const updatedConfig = await ChartConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedConfig);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a chart configuration
exports.deleteChartConfig = async (req, res) => {
  try {
    await ChartConfig.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Configuration deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};