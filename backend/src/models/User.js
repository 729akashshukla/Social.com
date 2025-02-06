import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 13 },
  sex: { type: String, enum: ['Male', 'Female', 'Other'] },
  avatar: {
    url: String,
    public_id: String
  },
  loginOTP: String,

  phone: {
    type: String,
    validate: {
      validator: v => validator.isMobilePhone(v),
      message: 'Invalid phone number'
    }
  },
  otpExpires: Date,
  otpMethod: String, // 'email' or 'sms'
  failedLoginAttempts: { type: Number, default: 0 },
  accountLockedUntil: Date,
  dateOfBirth: Date,
  googleId: String,
  otp: String,
  otpExpires: Date,
  registrationComplete: { 
    type: Boolean, 
    default: false 
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  resetMethod: String,
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    required: true
  },
  streak: { type: Number, default: 0 },
  lastActive: Date,
  badges: [{
    type: String,
    enum: ['7-day-streak', 'monthly-champ', 'trendsetter']
  }],
  isPublic: { type: Boolean, default: true },
  isAnonymous: { type: Boolean, default: false },
  themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
  verified: { type: Boolean, default: false },

}, { timestamps: true });

const  User = mongoose.model('User', userSchema);
export default User;
