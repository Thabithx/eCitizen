const User = require('../models/userModel');
const Citizen = require('../models/citizenModel');

const getAllUsers = async (req, res) => {
   try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.status(200).json({
         success: true,
         count: users.length,
         data: users
      });
   } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
   }
};

const deleteUser = async (req, res) => {
   try {
      const user = await User.findById(req.params.id);

      if (!user) {
         return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Prevent deleting self or other admins 
      if (user._id.toString() === req.user.id) {
         return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
      }

      // Delete associated citizen application if exists
      await Citizen.findOneAndDelete({ user: user._id });

      // Delete user
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({ success: true, message: 'User and associated data deleted' });
   } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
   }
};

module.exports = {
   getAllUsers,
   deleteUser
};
