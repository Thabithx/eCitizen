const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Citizen = require('../models/citizenModel');


const getAboutData = async (req, res) => {
   try {
      const aboutData = {
         hero: {
            title: "Building a Digital Nation",
            subtitle: "Secure, efficient, and inclusive digital identity for every citizen"
         },
         features: [
            {
               icon: "fa-shield-alt",
               title: "Secure Identity",
               text: "Bank-grade encryption protects your personal information"
            },
            {
               icon: "fa-mobile-alt",
               title: "Mobile Access",
               text: "Access your digital ID anytime, anywhere from any device"
            },
            {
               icon: "fa-bolt",
               title: "Instant Verification",
               text: "Quick verification for government and private services"
            },
            {
               icon: "fa-globe",
               title: "Universal Recognition",
               text: "Accepted across all government departments and services"
            }
         ],
         team: []
      };

      // Fetch admins from database
      const admins = await User.find({ role: 'admin' }).select('fullName email photo').limit(3);

      // Convert admins to team format with proper null checks
      if (admins && admins.length > 0) {
         aboutData.team = admins.map((admin, index) => ({
            name: admin.fullName || 'Administrator',
            role: index === 0 ? 'Lead Administrator' : 'System Administrator',
            description: `Managing digital identity operations and ensuring platform security for all citizens.`,
            email: admin.email || 'admin@ecitizen.gov',
            photo: admin.photo || null
         }));
      }

      // If no admins exist or less than 3, add realistic fallback team members
      if (aboutData.team.length === 0) {
         aboutData.team = [
            {
               name: "Anura Kumara Dissanayake",
               role: "Chief Technology Officer",
               description: "Leading the technical vision and architecture of the eCitizen platform with over 15 years of experience in digital government services."
            },
            {
               name: "Chamod Ekanayake",
               role: "Director of Digital Identity",
               description: "Overseeing the national identity verification system and ensuring compliance with international security standards."
            },
            {
               name: "Ranil Wickramasinghe",
               role: "Head of Citizen Services",
               description: "Managing citizen support operations and driving user experience improvements across all digital touchpoints."
            }
         ];
      } else if (aboutData.team.length < 3) {
         // Fill up to 3 members with fallback data
         const fallbackMembers = [
            {
               name: "Anura Kumara",
               role: "Director of Digital Identity",
               description: "Overseeing the national identity verification system and ensuring compliance with international security standards."
            },
            {
               name: "Rohit Sharma",
               role: "Head of Citizen Services",
               description: "Managing citizen support operations and driving user experience improvements across all digital touchpoints."
            }
         ];

         const needed = 3 - aboutData.team.length;
         aboutData.team = aboutData.team.concat(fallbackMembers.slice(0, needed));
      }

      res.json(aboutData);
   } catch (error) {
      console.error('About data error:', error);
      res.status(500).json({ message: 'Server error' });
   }
};

const getStats = async (req, res) => {
   try {
      // Count only citizens 
      const citizenCount = await User.countDocuments({ role: 'citizen' });
      const approvedCount = await Citizen.countDocuments({ applicationStatus: 'approved' });

      const stats = {
         citizensRegistered: citizenCount,
         regionalOffices: 12,
         satisfactionRate: 98,
         supportHours: 24
      };

      res.json(stats);
   } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
};

router.get('/about', getAboutData);
router.get('/stats', getStats);

module.exports = router;
