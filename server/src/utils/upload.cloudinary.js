import { Readable } from 'stream';
import cloudinary from '../cloudinary/index.js';

export const uploadToCloudinary = (buffer, fileType, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: fileType.startsWith('video') ? 'video' : 'image',
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};
