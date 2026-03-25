const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Image processing middleware
const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  req.body.images = [];

  await Promise.all(
    req.files.map(async (file, i) => {
      const filename = `product-${Date.now()}-${i + 1}.jpeg`;
      const filepath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .resize(800, 800)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(filepath);

      req.body.images.push(`/uploads/products/${filename}`);
    })
  );

  next();
};

module.exports = {
  uploadProductImages: upload.array('images', 5),
  processImages,
};