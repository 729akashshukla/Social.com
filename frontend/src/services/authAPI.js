export const loginWithPassword = async (identifier, password) => {
    return api.post('/auth/login/password', { identifier, password });
  };
  
  export const requestLoginOTP = async (type, identifier) => {
    const endpoint = type === 'phone' ? '/auth/login/sms-otp' : '/auth/login/email-otp';
    return api.post(endpoint, { [type]: identifier });
  };
  
  export const verifyLoginOTP = async (type, identifier, otp) => {
    return api.post('/auth/verify-otp', {
      [type]: identifier,
      otp
    });
  };

  export const requestPasswordReset = (method, identifier) => {
    return api.post('/auth/forgot-password', 
      method === 'email' ? { email: identifier } : { phone: identifier }
    );
  };
  
  export const resetPassword = (method, identifier, otp, newPassword) => {
    return api.post('/auth/reset-password', {
      [method === 'email' ? 'email' : 'phone']: identifier,
      otp,
      newPassword
    });
  };