const mongoose = require('mongoose');

const statusEnum = ['Awaiting Approval', 'Pending', 'In Progress', 'Completed'];

const historySchema = new mongoose.Schema({
  status: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  remarks: String
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  workType: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkType', required: true },
  area: String,
  status: { type: String, enum: statusEnum, default: 'Pending' },
  assignedTo: { type: String }, // Changed from ObjectId to String for text input
  materials: [String],
  manpower: String,
  estimatedTime: String,
  actualTime: String,
  images: [String], // S3 URLs
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  history: [historySchema],
  submittedByName: { type: String }, // NEW FIELD
  workNature: { type: String, enum: ['Repair Work', 'New Work'] }, // NEW FIELD
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;