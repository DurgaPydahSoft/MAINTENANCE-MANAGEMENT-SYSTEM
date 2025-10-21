const mongoose = require('mongoose');

const workTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WorkType = mongoose.model('WorkType', workTypeSchema);

module.exports = WorkType;