import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

export const sendSMS = async (to, body) => {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to
  });
};