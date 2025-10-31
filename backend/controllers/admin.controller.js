const Admin = require('../models/admin.model');

// Create a new admin credential
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, campus } = req.body;
    const admin = new Admin({ name, email, phoneNumber, campus });
    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Get all admin credentials
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single admin credential
exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin credential not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an admin credential
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, campus } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, campus },
      { new: true, runValidators: true }
    );
    if (!admin) return res.status(404).json({ message: 'Admin credential not found' });
    res.json(admin);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Delete an admin credential
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin credential not found' });
    res.json({ message: 'Admin credential deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
