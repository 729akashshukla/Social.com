import  ApiError  from '../errors/ApiError.js';

const MB = 1024 * 1024;

export const fileConfig = {
  image: {
    maxSize: 5 * MB,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 4
  },
  avatar: {
    maxSize: 2 * MB,
    allowedTypes: ['image/jpeg', 'image/png'],
    maxFiles: 1
  },
  document: {
    maxSize: 10 * MB,
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 2
  }
};

export const validateFile = (file, type = 'image') => {
  const config = fileConfig[type];
  
  if (!config) {
    throw new ApiError(400, 'Invalid file type configuration');
  }

  if (!file) {
    throw new ApiError(400, 'No file provided');
  }

  if (!config.allowedTypes.includes(file.mimetype)) {
    throw new ApiError(400, `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`);
  }

  if (file.size > config.maxSize) {
    throw new ApiError(400, `File too large. Maximum size: ${config.maxSize / MB}MB`);
  }

  return true;
};

export const validateFiles = (files, type = 'image') => {
  const config = fileConfig[type];

  if (!Array.isArray(files)) {
    throw new ApiError(400, 'Files must be an array');
  }

  if (files.length > config.maxFiles) {
    throw new ApiError(400, `Too many files. Maximum allowed: ${config.maxFiles}`);
  }

  files.forEach(file => validateFile(file, type));
  return true;
};

