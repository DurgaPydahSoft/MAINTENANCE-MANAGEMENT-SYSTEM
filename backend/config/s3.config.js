const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Validate AWS configuration
const validateAWSConfig = () => {
  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_BUCKET_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing AWS environment variables:', missingVars);
    throw new Error(`Missing AWS configuration: ${missingVars.join(', ')}`);
  }
};

// Validate AWS configuration on startup
try {
  validateAWSConfig();
} catch (error) {
  console.error('AWS Configuration Error:', error.message);
  console.error('Please check your .env file for AWS credentials');
}

// Create S3 v3 client compatible with multer-s3 v3 internals (expects client.send)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Test S3 connection using HeadBucketCommand
const testS3Connection = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: process.env.AWS_BUCKET_NAME }));
    console.log('\u2705 S3 connection successful');
  } catch (error) {
    console.error('\u274c S3 connection failed:', error.message);
    console.error('Please check your AWS credentials and bucket permissions');
  }
};

// Test connection on startup
testS3Connection();

// Configure multer for S3 upload with enhanced error handling
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read', // Make uploaded files publicly readable
    metadata: function (req, file, cb) {
      cb(null, { 
        fieldName: file.fieldname,
        uploadedAt: new Date().toISOString(),
        originalName: file.originalname
      });
    },
    key: function (req, file, cb) {
      // Generate unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split('.').pop();
      const filename = `tasks/${timestamp}-${randomString}.${extension}`;
      cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Check file type by MIME type and extension
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const allowedExtensions = /\.(jpg|jpeg|png|gif)$/i;

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and GIF images are allowed.`), false);
    }

    if (!allowedExtensions.test(file.originalname)) {
      return cb(new Error(`Invalid file extension. Only .jpg, .jpeg, .png, and .gif files are allowed.`), false);
    }

    cb(null, true);
  }
});

// Add error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size allowed is 10MB per file.',
        error: 'FILE_TOO_LARGE',
        maxSize: '10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 5 files allowed.',
        error: 'TOO_MANY_FILES',
        maxFiles: 5
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field name for file upload.',
        error: 'UNEXPECTED_FIELD'
      });
    }
  }

  if (err.message) {
    return res.status(400).json({
      message: err.message,
      error: 'UPLOAD_ERROR'
    });
  }

  next(err);
};

module.exports = { upload, handleUploadError };