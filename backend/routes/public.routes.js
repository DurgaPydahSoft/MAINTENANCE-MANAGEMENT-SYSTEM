const express = require('express');
const router = express.Router();
const Task = require('../models/task.model');
const WorkType = require('../models/worktype.model');
const { s3 } = require('../config/s3.config.js');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure multer for public uploads with higher limits
const uploadPublic = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  }),
  // Set very high limits as per requirement (effectively no practical limit here)
  limits: {
    fileSize: 1000 * 1024 * 1024 // ~1GB per file
  },
  fileFilter: function (req, file, cb) {
    // Accept images; loosen restrictions compared to admin flow
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get work types for public form
router.get('/worktypes', async (req, res) => {
  try {
    const workTypes = await WorkType.find();
    res.json(workTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create public task submission
router.post('/submit', uploadPublic.array('images', 20), async (req, res) => {
  try {
    let { title, description, workType, area, materials, manpower, estimatedTime, tags } = req.body;
    
    // Handle arrays possibly sent as JSON strings via multipart/form-data
    if (typeof materials === 'string') {
      try { materials = JSON.parse(materials); } catch (_) { materials = materials.split(',').map(m => m.trim()).filter(Boolean); }
    }
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (_) { tags = tags.split(',').map(t => t.trim()).filter(Boolean); }
    }
    
    const images = req.files ? req.files.map(file => file.location) : [];
    
    const task = new Task({
      title,
      description,
      workType,
      area,
      status: 'Awaiting Approval',
      materials,
      manpower,
      estimatedTime,
      tags,
      images,
      createdBy: null, // Anonymous submission
      history: [{ status: 'Awaiting Approval', changedBy: null, remarks: 'Public submission' }]
    });
    
    await task.save();
    res.status(201).json({ 
      message: 'Task submitted successfully. It will be reviewed by admin.',
      taskId: task._id 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
