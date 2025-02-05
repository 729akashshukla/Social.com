import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import ApiError from '../errors/ApiError.js';
import { validateFileType } from './fileValidation.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  }
});

const upload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      try {
        // Double-check extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
          throw new Error('Invalid file extension');
        }
        
        validateFileType(file);
        cb(null, true);
      } catch (error) {
        cb(new ApiError(400, error.message), false);
      }
    }
  });

export const uploadAvatar = upload.single('avatar');

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return next(new ApiError(400, `File upload error: ${err.message}`));
  }
  next(err);
};