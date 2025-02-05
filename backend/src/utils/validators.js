// utils/validators.js
export const validatePassword = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };
  
  // In controller
  if (!validatePassword(newPassword)) {
    throw new ApiError(400, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
  }