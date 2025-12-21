const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
   submitMessage,
   getAllMessages,
   replyToMessage,
   deleteMessage,
   getPublicFAQs,
   getAllFAQs,
   createFAQ,
   updateFAQ,
   deleteFAQ
} = require('../controllers/supportController');

// Public Routes
router.post('/messages', submitMessage);
router.get('/faqs', getAllFAQs);
// Admin Routes (Protected)
router.get('/messages', protect, getAllMessages); 
router.put('/messages/:id/reply', protect, replyToMessage);
router.delete('/messages/:id', protect, deleteMessage);

// FAQ Admin
router.post('/faqs', protect, createFAQ);
router.put('/faqs/:id', protect, updateFAQ);
router.delete('/faqs/:id', protect, deleteFAQ);

module.exports = router;
