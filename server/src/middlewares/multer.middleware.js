// middlewares/multer.middleware.js
import multer from 'multer';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      'Invalid file type. Only image and video files are allowed.'
    );
    error.status = 400;
    cb(error, false);
  }
};

// Base upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// Avatar upload
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed for avatars.'
      );
      error.status = 400;
      cb(error, false);
    }
  },
});

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for resumes
  fileFilter: (req, file, cb) => {
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];

    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        'Invalid file type. Only PDF and Word documents are allowed for resumes.'
      );
      error.status = 400;
      cb(error, false);
    }
  },
});

// DocumentUpload — accepts ALL file types
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedDocTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',

      // Videos
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/webm',
      'video/ogg',

      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain',
      'text/csv',

      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',

      // Others
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        'Invalid file type. Please upload a supported document format.'
      );
      error.status = 400;
      cb(error, false);
    }
  },
});

export default upload;
