import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';
import { validateFile } from './fileValidation.js';
import  ApiError  from '../errors/ApiError.js';
import path from 'path';

const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'png'], transformation = []) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: allowedFormats,
      transformation
    }
  });
};

const createFileFilter = (type) => {
  return (req, file, cb) => {
    try {
      validateFile(file, type);
      cb(null, true);
    } catch (error) {
      cb(new ApiError(400, error.message));
    }
  };
};

// Avatar upload configuration
const avatarStorage = createCloudinaryStorage(
  'avatars',
  ['jpg', 'png'],
  [{ width: 500, height: 500, crop: 'fill' }]
);

const avatarUploadMiddleware = multer({
  storage: avatarStorage,
  fileFilter: createFileFilter('avatar')
});

// Image upload configuration
const imageStorage = createCloudinaryStorage(
  'images',
  ['jpg', 'png', 'webp']
);

const imageUploadMiddleware = multer({
  storage: imageStorage,
  fileFilter: createFileFilter('image')
});

// Document upload configuration
const documentStorage = createCloudinaryStorage(
  'documents',
  ['pdf', 'doc', 'docx']
);

const documentUploadMiddleware = multer({
  storage: documentStorage,
  fileFilter: createFileFilter('document')
});

// Generic file upload helper
const createUploader = (type, customConfig = {}) => {
  const storage = createCloudinaryStorage(
    customConfig.folder || type,
    customConfig.allowedFormats,
    customConfig.transformation
  );

  return multer({
    storage,
    fileFilter: createFileFilter(type)
  });
};

export {
  avatarUploadMiddleware as avatarUpload,
  imageUploadMiddleware as imageUpload,
  documentUploadMiddleware as documentUpload,
  createUploader
};