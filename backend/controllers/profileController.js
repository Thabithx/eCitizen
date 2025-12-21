const Citizen = require('../models/citizenModel');
const User = require('../models/userModel');
const { generateApplicationPDF } = require('../utils/applicationGenerator');

const getMyProfile = async (req, res) => {
   try {
      const citizen = await Citizen.findOne({ user: req.user.id }).populate('user');

      if (!citizen) {
         return res.status(404).json({
            success: false,
            message: 'Citizen application not found'
         });
      }

      res.json({
         success: true,
         data: citizen
      });
   } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

const updateProfile = async (req, res) => {
   try {
      const { fullName, dob, occupation, phoneNumber, address } = req.body;

      // Find citizen record
      const citizen = await Citizen.findOne({ user: req.user.id });
      if (!citizen) {
         return res.status(404).json({ success: false, message: 'Citizen application not found' });
      }

      // Update User model if fullName changed
      if (fullName) {
         await User.findByIdAndUpdate(req.user.id, { fullName });
      }

      // Update Citizen model
      if (dob) citizen.dob = dob;
      if (occupation) citizen.occupation = occupation;
      if (phoneNumber) citizen.phoneNumber = phoneNumber;
      if (address) citizen.address = address;

      await citizen.save();
      const updatedCitizen = await Citizen.findOne({ user: req.user.id }).populate('user');

      res.json({
         success: true,
         message: 'Profile updated successfully',
         data: updatedCitizen
      });
   } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
   }
};


const downloadApplication = async (req, res) => {
   try {
      const citizen = await Citizen.findOne({ user: req.user.id }).populate('user');
      if (!citizen) {
         return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const pdfPath = await generateApplicationPDF(citizen);
      res.json({ success: true, downloadUrl: pdfPath });
   } catch (error) {
      console.error('Download application error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate application PDF' });
   }
};

module.exports = {
   getMyProfile,
   updateProfile,
   downloadApplication
};
