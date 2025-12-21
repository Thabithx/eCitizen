const Citizen = require('../models/citizenModel');

const generateNID = async () => {
   const currentYear = new Date().getFullYear();
   const prefix = `NID-${currentYear}-`;

   try {
      // Find the highest NID number for the current year
      const lastCitizen = await Citizen.findOne({
         nidNumber: { $regex: `^${prefix}` }
      })
         .sort({ nidNumber: -1 })
         .select('nidNumber')
         .lean();

      let sequentialNumber = 1;

      if (lastCitizen && lastCitizen.nidNumber) {
         // Extract the sequential part (last 6 digits)
         const lastSequence = parseInt(lastCitizen.nidNumber.split('-')[2]);
         sequentialNumber = lastSequence + 1;
      }

      // Format with leading zeros (6 digits)
      const formattedSequence = String(sequentialNumber).padStart(6, '0');
      const newNID = `${prefix}${formattedSequence}`;

      // Verify uniqueness 
      const exists = await Citizen.findOne({ nidNumber: newNID });
      if (exists) {
         // If somehow exists, recursively try next number
         console.warn(`NID ${newNID} already exists, generating next number...`);
         return generateNID();
      }

      return newNID;
   } catch (error) {
      console.error('Error generating NID:', error);
      throw new Error('Failed to generate NID number');
   }
};

/**
 * @param {string} nid - NID to validate
 * @returns {boolean} - True if valid format
 */
const validateNID = (nid) => {
   const nidPattern = /^NID-\d{4}-\d{6}$/;
   return nidPattern.test(nid);
};

/**
 * @param {string} nid - NID to parse
 * @returns {object} - { year, sequence }
 */
const parseNID = (nid) => {
   if (!validateNID(nid)) {
      return null;
   }

   const parts = nid.split('-');
   return {
      year: parseInt(parts[1]),
      sequence: parseInt(parts[2])
   };
};

module.exports = {
   generateNID,
   validateNID,
   parseNID
};
