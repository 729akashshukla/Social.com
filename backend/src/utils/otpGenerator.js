import crypto from 'crypto';
import ApiError  from '../helpers/errors/ApiError.js';
import { logger } from '../helpers/logger.js';

export class OTPManager {
  static #otpStore = new Map();
  static #maxAttempts = 3;
  static #otpLength = 6;
  static #otpExpiry = 5 * 60 * 1000; // 5 minutes

  static generateOTP(identifier) {
    try {
      const otp = crypto
        .randomInt(Math.pow(10, this.#otpLength - 1), Math.pow(10, this.#otpLength))
        .toString()
        .padStart(this.#otpLength, '0');

      const otpData = {
        code: otp,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.#otpExpiry
      };

      this.#otpStore.set(identifier, otpData);

      this.#cleanupExpiredOTPs();
      logger.info(`OTP generated for ${identifier}`);
      return otp;
    } catch (error) {
      logger.error(`OTP generation failed: ${error.message}`);
      throw ApiError.Internal('Failed to generate OTP');
    }
  }

  static verifyOTP(identifier, code) {
    const otpData = this.#otpStore.get(identifier);

    if (!otpData) {
      throw ApiError.BadRequest('No OTP found. Please request a new one');
    }

    if (Date.now() > otpData.expiresAt) {
      this.#otpStore.delete(identifier);
      throw ApiError.BadRequest('OTP has expired. Please request a new one');
    }

    if (otpData.attempts >= this.#maxAttempts) {
      this.#otpStore.delete(identifier);
      throw ApiError.TooManyRequests('Too many failed attempts. Please request a new OTP');
    }

    otpData.attempts++;

    if (otpData.code !== code) {
      if (otpData.attempts >= this.#maxAttempts) {
        this.#otpStore.delete(identifier);
      } else {
        this.#otpStore.set(identifier, otpData);
      }
      throw ApiError.BadRequest(`Invalid OTP. ${this.#maxAttempts - otpData.attempts} attempts remaining`);
    }

    this.#otpStore.delete(identifier);
    return true;
  }

  static invalidateOTP(identifier) {
    this.#otpStore.delete(identifier);
  }

  static #cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [identifier, otpData] of this.#otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.#otpStore.delete(identifier);
      }
    }
  }

  static getOTPStatus(identifier) {
    const otpData = this.#otpStore.get(identifier);
    if (!otpData) return null;

    return {
      remainingAttempts: this.#maxAttempts - otpData.attempts,
      expiresIn: Math.max(0, Math.floor((otpData.expiresAt - Date.now()) / 1000)),
      isExpired: Date.now() > otpData.expiresAt
    };
  }
}

