const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const path = require('path');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'eCitizen/uploads';

    // Organize files by type
    if (file.fieldname === 'photo') {
      folderName = 'eCitizen/user_images';
    } else if (['birthCertificate', 'proofOfAddress', 'educationalCert', 'additionalDocs'].includes(file.fieldname)) {
      folderName = 'eCitizen/documents';
    }

    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: folderName,
      resource_type: isPdf ? 'raw' : 'image', 
      access_mode: 'public', 
      public_id: file.fieldname + '-' + Date.now() + (isPdf ? '.pdf' : ''),
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for registration form
const uploadRegistrationFiles = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'educationalCert', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 10 }
]);

// Middleware for single photo upload 
const uploadSinglePhoto = upload.single('photo');

// Helper function to get file URL
const getFileUrl = (req, file) => {
  if (!file) return null;
  // Cloudinary storage returns the URL in file.path
  return file.path;
};

// Helper function to get multiple file URLs
const getFileUrls = (req, files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => getFileUrl(req, file));
};

module.exports = {
  uploadRegistrationFiles,
  uploadSinglePhoto,
  getFileUrl,
  getFileUrls
};
