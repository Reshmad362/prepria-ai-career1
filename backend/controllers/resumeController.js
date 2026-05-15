const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure dir exists to avoid interruption
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique id to prevent duplicate file collision
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume_${uniqueSuffix}${ext}`);
  }
});

// File type validation middleware
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new Error("Empty transfer"), false);
  }

  const allowedExtensions = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const mimetypeMap = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  // Validate extension and mime type
  if (allowedExtensions.includes(ext) && file.mimetype === mimetypeMap[ext]) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Only .pdf and .docx are allowed."), false);
  }
};

// Multer upload integration instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB Limit
  },
  fileFilter: fileFilter
}).single('file');

// Middleware to handle Multer process and its errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, detail: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ success: false, detail: err.message });
    } else if (err) {
      if (err.message === 'Empty transfer') {
          return res.status(400).json({ success: false, detail: 'No file provided' });
      }
      return res.status(400).json({ success: false, detail: err.message });
    }
    
    // Check if req.file successfully parsed
    if (!req.file) {
      return res.status(400).json({ success: false, detail: 'Empty upload or no valid file provided' });
    }
    
    next();
  });
};

// Upload Route Logic
const uploadResume = (req, res) => {
  try {
    const file = req.file;

    // Reject natively empty buffers (0 bytes length)
    if (file.size === 0) {
      fs.unlinkSync(file.path); // remove physical file
      return res.status(400).json({ success: false, detail: 'Empty file uploaded' });
    }

    // Process valid storage and format response payload matches request requirement exactly
    const normalizedPath = `/uploads/${file.filename}`;

    return res.status(200).json({
      success: true,
      filename: file.filename,
      path: normalizedPath
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ 
      success: false, 
      detail: 'Upload interrupted or internal error occurred.' 
    });
  }
};

module.exports = {
  uploadMiddleware,
  uploadResume
};
