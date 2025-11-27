/* eslint-disable no-undef */
import dotenvFlow from 'dotenv-flow';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  try {
    dotenvFlow.config({
      path: path.resolve(process.cwd()),
      silent: true,
    });
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Dotenv flow config failed, using process.env directly');
  }
}

const config = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',').map((o) =>
    o.trim()
  ) || [
    'http://localhost:3000',
    'https://lms-super-admin-dashboard.netlify.app',
  ],

  SOCKET_ALLOWED_ORIGINS:
    process.env.SOCKET_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [],

  BCRYPT_SALT: Number(process.env.BCRYPT_JS_SALT_ROUNDS) || 5,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '7d',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_EXPIRES_IN:
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '30d',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  ACCESS_TOKEN_COOKIE_EXPIRE_DAYS:
    Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRE_DAYS) || 7,
  REFRESH_TOKEN_COOKIE_EXPIRE_DAYS:
    Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS) || 15,

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM:
    process.env.EMAIL_FROM || `"No Reply" <${process.env.EMAIL_USER}>`,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  API_VERSION: process.env.API_VERSION,
};

export default config;
