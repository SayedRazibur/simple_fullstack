/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';

class AuthHelper {
  // JWT Token Methods
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: config.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: config.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.JWT_REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Password Methods
  static async hashPassword(password) {
    return await bcrypt.hash(password, config.BCRYPT_SALT);
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Reset Token Methods
  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // OTP Methods
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default AuthHelper;
