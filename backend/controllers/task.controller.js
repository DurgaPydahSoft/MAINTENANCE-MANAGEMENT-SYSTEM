const Task = require('../models/task.model');
const User = require('../models/user.model');
const WorkType = require('../models/worktype.model');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    let { title, description, workType, area, materials, manpower, estimatedTime, tags, submittedByName, workNature } = req.body;
    // Handle arrays possibly sent as JSON strings via multipart/form-data
    if (typeof materials === 'string') {
      try { materials = JSON.parse(materials); } catch (_) { materials = materials.split(',').map(m => m.trim()).filter(Boolean); }
    }
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (_) { tags = tags.split(',').map(t => t.trim()).filter(Boolean); }
    }
    const images = req.files ? req.files.map(file => file.location) : [];
    const createdBy = req.user?._id; // For public, may be undefined
    const task = new Task({
      title,
      description,
      workType,
      area,
      materials,
      manpower,
      estimatedTime,
      tags,
      images,
      createdBy,
      submittedByName, // NEW FIELD
      workNature,      // NEW FIELD
      history: [{ status: 'Pending', changedBy: createdBy }]
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all tasks (with filters)
exports.getTasks = async (req, res) => {
  try {
    const { status, workType, area, dateFrom, dateTo, tags } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (workType) filter.workType = workType;
    if (area) filter.area = area;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    const tasks = await Task.find(filter).populate('workType assignedTo createdBy');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('workType assignedTo createdBy');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    let { title, description, workType, area, materials, manpower, estimatedTime, tags, existingImages, submittedByName, workNature } = req.body;
    
    // Handle arrays possibly sent as JSON strings via multipart/form-data
    if (typeof materials === 'string') {
      try { materials = JSON.parse(materials); } catch (_) { materials = materials.split(',').map(m => m.trim()).filter(Boolean); }
    }
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (_) { tags = tags.split(',').map(t => t.trim()).filter(Boolean); }
    }
    if (typeof existingImages === 'string') {
      try { existingImages = JSON.parse(existingImages); } catch (_) { existingImages = []; }
    }
    
    // Handle new images
    const newImages = req.files ? req.files.map(file => file.location) : [];
    
    // Combine existing and new images
    const allImages = [...(existingImages || []), ...newImages];
    
    const update = {
      title,
      description,
      workType,
      area,
      materials,
      manpower,
      estimatedTime,
      tags,
      submittedByName, // NEW FIELD
      workNature,      // NEW FIELD
      images: allImages.length > 0 ? allImages : undefined
    };
    
    // Only update images if there are any
    if (allImages.length === 0) {
      delete update.images;
    }
    
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true }).populate('workType assignedTo createdBy');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    // First find the task to get the image URLs
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // If task has images, delete them from S3
    if (task.images && task.images.length > 0) {
      const { s3 } = require('../config/s3.config');
      
      // Delete each image from S3
      const deletePromises = task.images.map(imageUrl => {
        // Extract the key from the URL (everything after tasks/ in the URL)
        const key = imageUrl.split('.com/').pop();
        return s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key
        }).promise();
      });

      try {
        await Promise.all(deletePromises);
        console.log(`Successfully deleted ${task.images.length} images from S3`);
      } catch (s3Error) {
        console.error('Error deleting images from S3:', s3Error);
        // Continue with task deletion even if image deletion fails
      }
    }

    // Now delete the task
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task and associated images deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({ message: error.message });
  }
};

// Assign a task to a technician
exports.assignTask = async (req, res) => {
  try {
    const { assignedTo, materials, manpower, estimatedTime } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.assignedTo = assignedTo;
    if (materials) task.materials = materials;
    if (manpower) task.manpower = manpower;
    if (estimatedTime) task.estimatedTime = estimatedTime;
    task.status = 'Assigned';
    task.history.push({ status: 'Assigned', changedBy: req.user._id });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update task status
exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks, actualTime, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (status) task.status = status;
    if (actualTime) task.actualTime = actualTime;
    if (assignedTo !== undefined && assignedTo !== null && assignedTo !== '') task.assignedTo = assignedTo;
    task.history.push({ status, changedBy: req.user._id, remarks });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve task (change from Awaiting Approval to Pending)
exports.approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'Awaiting Approval') {
      return res.status(400).json({ message: 'Task is not awaiting approval' });
    }
    
    task.status = 'Pending';
    task.history.push({ 
      status: 'Pending', 
      changedBy: req.user._id, 
      remarks: 'Approved by admin' 
    });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Reject task (delete or mark as rejected)
exports.rejectTask = async (req, res) => {
  try {
    const { remarks } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'Awaiting Approval') {
      return res.status(400).json({ message: 'Task is not awaiting approval' });
    }
    
    // Delete the task for now (you can change this to mark as rejected if you want to keep records)
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task rejected and deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};