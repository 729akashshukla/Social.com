import twilio from 'twilio';
import  ApiError  from '../helpers/errors/ApiError.js';

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

const smsTemplates = {
  otp: (code) => `Your verification code is: ${code}. Valid for 5 minutes.`,
  streakReminder: (days) => `Don't break your ${days} day streak! Log in today to keep it going!`,
  statusUpdate: (username) => `${username} just posted a new status update!`
};

export const sendSMS = async ({ to, template, data }) => {
  try {
    const message = smsTemplates[template](data);
    
    await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE
    });
    
    return true;
  } catch (error) {
    throw new ApiError(500, 'Failed to send SMS');
  }
};

export const validatePhoneNumber = async (phoneNumber) => {
  try {
    const validatedNumber = await client.lookups.v1
      .phoneNumbers(phoneNumber)
      .fetch();
    return validatedNumber;
  } catch (error) {
    throw new ApiError(400, 'Invalid phone number');
  }
};
