const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

/**
 * Generate NID PDF Document
 * @param {Object} citizenData - Citizen information
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateNIDDocument = async (citizenData) => {
   return new Promise(async (resolve, reject) => {
      try {
         const uploadsDir = path.join(__dirname, '../uploads/nids');

         // Create directory if it doesn't exist
         if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
         }

         const fileName = `NID_${citizenData.nidNumber}.pdf`;
         const outputPath = path.join(uploadsDir, fileName);

         // Create PDF document
         const doc = new PDFDocument({ size: [400, 250], margin: 0 });
         const stream = fs.createWriteStream(outputPath);
         doc.pipe(stream);

         // Background gradient
         doc.rect(0, 0, 400, 250).fill('#1e3a8a');
         doc.rect(0, 0, 400, 60).fill('#3b82f6');

         // Header
         doc.fontSize(20).fillColor('#ffffff').text('NATIONAL IDENTITY CARD', 20, 20, { align: 'center' });

         // White card area
         doc.roundedRect(20, 70, 360, 160, 10).fill('#ffffff');

         // NID Number 
         doc.fontSize(10).fillColor('#1e3a8a').text('NID NUMBER', 40, 85);
         doc.fontSize(16).fillColor('#000000').text(citizenData.nidNumber, 40, 100);

         // Personal Info
         doc.fontSize(10).fillColor('#1e3a8a').text('FULL NAME', 40, 125);
         doc.fontSize(12).fillColor('#000000').text(citizenData.fullName, 40, 140);

         doc.fontSize(10).fillColor('#1e3a8a').text('DATE OF BIRTH', 40, 160);
         doc.fontSize(11).fillColor('#000000').text(new Date(citizenData.dob).toLocaleDateString(), 40, 175);

         // Right column
         doc.fontSize(10).fillColor('#1e3a8a').text('OCCUPATION', 220, 125);
         doc.fontSize(11).fillColor('#000000').text(citizenData.occupation || 'N/A', 220, 140, { width: 150 });

         doc.fontSize(10).fillColor('#1e3a8a').text('ADDRESS', 220, 160);
         doc.fontSize(9).fillColor('#000000').text(citizenData.address, 220, 175, { width: 150, height: 40 });

         // Issue Date
         doc.fontSize(8).fillColor('#666666').text(`Issued: ${new Date(citizenData.nidIssuedDate).toLocaleDateString()}`, 40, 210);

         // Generate QR Code
         try {
            const qrData = `${citizenData.nidNumber}|${citizenData.fullName}`;
            const qrCodeDataURL = await QRCode.toDataURL(qrData);
            const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
            doc.image(qrBuffer, 330, 180, { width: 40, height: 40 });
         } catch (qrError) {
            console.log('QR code generation skipped:', qrError.message);
         }

         doc.end();

         stream.on('finish', () => {
            resolve(`/uploads/nids/${fileName}`);
         });

         stream.on('error', (err) => {
            reject(err);
         });

      } catch (error) {
         reject(error);
      }
   });
};

module.exports = { generateNIDDocument };
