const WorkType = require('../models/worktype.model');

// Create a new work type
exports.createWorkType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workType = new WorkType({ name, description });
    await workType.save();
    res.status(201).json(workType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all work types
exports.getWorkTypes = async (req, res) => {
  try {
    const workTypes = await WorkType.find();
    res.json(workTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single work type
exports.getWorkType = async (req, res) => {
  try {
    const workType = await WorkType.findById(req.params.id);
    if (!workType) return res.status(404).json({ message: 'Work type not found' });
    res.json(workType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a work type
exports.updateWorkType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workType = await WorkType.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!workType) return res.status(404).json({ message: 'Work type not found' });
    res.json(workType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a work type
exports.deleteWorkType = async (req, res) => {
  try {
    const workType = await WorkType.findByIdAndDelete(req.params.id);
    if (!workType) return res.status(404).json({ message: 'Work type not found' });
    res.json({ message: 'Work type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};