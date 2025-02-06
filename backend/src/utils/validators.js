import { ApiError } from '../helpers/errors/ApiError.js';

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
  PHONE: /^\+[1-9]\d{1,14}$/, // International format
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  URL: /^https?:\/\/.+\..+/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
};

export const validateEmail = (email) => {
  if (!email || !REGEX.EMAIL.test(email)) {
    throw ApiError.BadRequest('Invalid email format');
  }
  return email.toLowerCase();
};

export const validatePassword = (password) => {
  if (!password || !REGEX.PASSWORD.test(password)) {
    throw ApiError.BadRequest(
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
    );
  }
  return true;
};

export const validatePhone = (phone) => {
  if (!phone || !REGEX.PHONE.test(phone)) {
    throw ApiError.BadRequest('Invalid phone number format. Use international format (e.g., +1234567890)');
  }
  return phone;
};

export const validateUsername = (username) => {
  if (!username || !REGEX.USERNAME.test(username)) {
    throw ApiError.BadRequest('Username must be 3-30 characters long and can only contain letters, numbers and underscore');
  }
  return username;
};

export const validateProfile = ({
  displayName,
  bio,
  website,
  themeColor,
  privacySettings
}) => {
  const errors = [];

  if (displayName && (displayName.length < 2 || displayName.length > 50)) {
    errors.push('Display name must be between 2 and 50 characters');
  }

  if (bio && bio.length > 160) {
    errors.push('Bio cannot exceed 160 characters');
  }

  if (website && !REGEX.URL.test(website)) {
    errors.push('Invalid website URL');
  }

  if (themeColor && !REGEX.HEX_COLOR.test(themeColor)) {
    errors.push('Invalid theme color format');
  }

  if (privacySettings) {
    const validSettings = ['public', 'private', 'friends'];
    if (!validSettings.includes(privacySettings.profileVisibility)) {
      errors.push('Invalid privacy setting');
    }
  }

  if (errors.length > 0) {
    throw ApiError.BadRequest('Validation failed', errors);
  }

  return true;
};

export const validateStatus = ({
  content,
  visibility,
  attachments = []
}) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Status content is required');
  }

  if (content && content.length > 500) {
    errors.push('Status content cannot exceed 500 characters');
  }

  if (visibility && !['public', 'private', 'friends'].includes(visibility)) {
    errors.push('Invalid visibility setting');
  }

  if (attachments.length > 4) {
    errors.push('Maximum 4 attachments allowed');
  }

  if (errors.length > 0) {
    throw ApiError.BadRequest('Validation failed', errors);
  }

  return true;
};

export const sanitizeData = (data) => {
  if (typeof data !== 'object' || !data) return data;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim()
        .replace(/[<>]/g, '') // Remove < >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove inline event handlers
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeData(item));
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};