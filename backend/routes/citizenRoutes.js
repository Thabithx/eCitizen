const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  submitApplication,
  getAllCitizens,
  getCitizenById,
  updateApplicationStatus,
  adminSignup,
  approveCitizen,
  searchCitizens,
  updateCitizenNID,
  updateCitizenInfo,
  deleteCitizenByNID,
  getMyNID,
  updateProfile,
  downloadApplication
} = require('../controllers/citizenController');
const { getMyProfile, updateProfile: updateOwnProfile, downloadApplication: downloadOwnApplication } = require('../controllers/profileController');
const { uploadRegistrationFiles, uploadSinglePhoto } = require('../utils/fileUpload');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/admin-signup', uploadSinglePhoto, adminSignup);
router.post('/login', login);

// Protected citizen routes
router.get('/me', protect, getMe);
router.post('/application', protect, uploadRegistrationFiles, submitApplication);
router.get('/my-nid', protect, getMyNID);
router.get('/my-profile', protect, getMyProfile);
router.put('/profile', protect, updateOwnProfile);
router.get('/download-application', protect, downloadOwnApplication);

// Admin routes
router.get('/', protect, getAllCitizens);
router.get('/search', protect, searchCitizens);
router.get('/:id', protect, getCitizenById);
router.patch('/:id/status', protect, updateApplicationStatus);
router.put('/:id/approve', protect, approveCitizen);
router.put('/:id/nid', protect, updateCitizenNID);
router.put('/:id/info', protect, updateCitizenInfo);
router.delete('/nid/:nidNumber', protect, deleteCitizenByNID);

module.exports = router;


