import { Readable } from 'stream';
import cloudinary from '../cloudinary/index.js';
import path from 'path';

/**
 * Upload any file to Cloudinary with original filename and unique ID
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename with extension
 * @param {string} folder - Cloudinary folder path (default: 'uploads')
 */
export const uploadToCloudinary = (
  buffer,
  originalName,
  folder = 'uploads'
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      buildUploadOptions(originalName, folder),
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    Readable.from(buffer)
      .on('error', reject)
      .pipe(uploadStream)
      .on('error', reject);
  });
};

const buildUploadOptions = (originalName, folder) => {
  const sanitizedName = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  const ext = path.extname(originalName).toLowerCase();
  const public_id = `${folder}/${sanitizedName}_${Date.now()}${ext}`;

  return {
    resource_type: 'raw',
    public_id: public_id.replace(/^\/+/, ''),
    use_filename: false,
    unique_filename: false,
    overwrite: true,
  };
};

/**
 * Delete a file from Cloudinary by its URL
 * @param {string} url - Cloudinary URL of the file to delete
 * @returns {Promise} Deletion result
 */
export const deleteFileFromCloudinary = async (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided for deletion.');
  }

  try {
    // Extract public_id and resource_type from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }

    // Get resource_type (image, raw, video, etc.)
    const resourceType = parts[uploadIndex - 1] || 'raw';

    // Get the part after 'upload' which includes version and public_id
    const afterUpload = parts.slice(uploadIndex + 1);

    if (afterUpload.length < 2) {
      throw new Error('Invalid Cloudinary URL format');
    }

    // Remove version (first part after 'upload') and join the rest as public_id
    const publicId = afterUpload.slice(1).join('/');

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn('Unexpected result from Cloudinary destroy:', result);
    }

    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error.message || error);
    throw error;
  }
};
