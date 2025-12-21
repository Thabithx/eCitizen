const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/userController');

// Middleware to check if admin
const admin = (req, res, next) => {
   if (req.user && req.user.role === 'admin') {
      next();
   } else {
      res.status(401).json({ message: 'Not authorized as an admin' });
   }
};

router.route('/')
   .get(protect, admin, getAllUsers);

router.route('/:id')
   .delete(protect, admin, deleteUser);

module.exports = router;
