import nodemailer from 'nodemailer';
import  ApiError  from '../helpers/errors/ApiError.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emailTemplates = {
  welcome: (username) => ({
    subject: 'Welcome to Our Platform',
    html: `
      <h1>Welcome ${username}!</h1>
      <p>Thank you for joining our platform. We're excited to have you here!</p>
    `
  }),
  resetPassword: (resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
    `
  }),
  streakUpdate: (username, streakCount) => ({
    subject: 'Streak Update!',
    html: `
      <h1>Keep Going ${username}!</h1>
      <p>You're on a ${streakCount} day streak! Keep up the great work!</p>
    `
  })
};

export const sendEmailOTP = async ({ to, template, data }) => {
  try {
    const { subject, html } = emailTemplates[template](data);
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
    
    return true;
  } catch (error) {
    throw new ApiError(500, 'Failed to send email');
  }
};