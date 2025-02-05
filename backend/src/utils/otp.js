import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';

// Generate OTP
export const generateOTP = () => {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    digits: 6,
    step: 600 // 10 minutes
  });
};


export const verifyOTP = (otp, secret) => {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otp,
      window: 2
    });
  };