const multer = require('multer');

// Store file in memory as Buffer (no permanent file storage on disk)
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

// Multer upload configuration with 5MB limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max file size
  },
  fileFilter
});

// Middleware wrapper for single image upload with error handling
const uploadSingleImage = (req, res, next) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 5MB limit. Please upload a smaller image.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

module.exports = uploadSingleImage;
