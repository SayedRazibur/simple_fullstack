// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables - ADD THIS LINE
dotenv.config();

console.log('🔧 Cloudinary Configuration Check:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  'API Key:',
  process.env.CLOUDINARY_API_KEY
    ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4)
    : 'Missing'
);
console.log(
  'API Secret:',
  process.env.CLOUDINARY_API_SECRET
    ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4)
    : 'Missing'
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
console.log('✅ Cloudinary Config Status:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? 'Configured' : 'Missing',
  api_secret: cloudinary.config().api_secret ? 'Configured' : 'Missing',
});

export default cloudinary;
