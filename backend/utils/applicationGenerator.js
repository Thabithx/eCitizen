const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Application PDF Document
 * @param {Object} citizenData - Citizen application information
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateApplicationPDF = async (citizenData) => {
   return new Promise(async (resolve, reject) => {
      try {
         const uploadsDir = path.join(__dirname, '../uploads/applications');

         // Create directory if it doesn't exist
         if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
         }

         const fileName = `Application_${citizenData.user.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
         const outputPath = path.join(uploadsDir, fileName);

         // Create PDF document
         const doc = new PDFDocument({ size: 'A4', margin: 50 });
         const stream = fs.createWriteStream(outputPath);
         doc.pipe(stream);

         // Header
         doc.fontSize(24).fillColor('#1e3a8a').text('eCitizen Application Form', { align: 'center' });
         doc.moveDown();
         doc.fontSize(10).fillColor('#666666').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
         doc.moveDown(2);

         // Horizontal Line
         doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
         doc.moveDown();

         // Section: Personal Information
         doc.fontSize(16).fillColor('#1e3a8a').text('Personal Information', { underline: true });
         doc.moveDown(0.5);

         const infoY = doc.y;
         doc.fontSize(12).fillColor('#333333');

         const drawInfoRow = (label, value) => {
            doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
            doc.font('Helvetica').text(value || 'N/A');
            doc.moveDown(0.5);
         };

         drawInfoRow('Full Name', citizenData.user.fullName);
         drawInfoRow('Email Address', citizenData.user.email);
         drawInfoRow('Date of Birth', new Date(citizenData.dob).toLocaleDateString());
         drawInfoRow('Occupation', citizenData.occupation);
         drawInfoRow('Phone Number', citizenData.phoneNumber);
         drawInfoRow('Residential Address', citizenData.address);

         doc.moveDown();

         // Section: Application Status
         doc.fontSize(16).fillColor('#1e3a8a').text('Application Status', { underline: true });
         doc.moveDown(0.5);
         drawInfoRow('Status', citizenData.applicationStatus.toUpperCase());
         drawInfoRow('Temporary ID', citizenData.tempId);
         if (citizenData.nidNumber) {
            drawInfoRow('NID Number', citizenData.nidNumber);
         }

         doc.moveDown();

         // Footer
         doc.fontSize(10).fillColor('#999999').text('This is an automatically generated document from the eCitizen platform.', 50, 700, { align: 'center' });
         doc.text('Valid only with official digital verification.', { align: 'center' });

         doc.end();

         stream.on('finish', () => {
            resolve(`/uploads/applications/${fileName}`);
         });

         stream.on('error', (err) => {
            reject(err);
         });

      } catch (error) {
         reject(error);
      }
   });
};

module.exports = { generateApplicationPDF };
