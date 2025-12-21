# Guide to Adding a Healthcare Service

## 1. The Database Model (`medicalModel.js`)
First, we define what information is needed for a medical benefit request.

```javascript
const mongoose = require('mongoose');

const medicalBenefitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  benefitType: { type: String, enum: ['General', 'Chronic', 'Disability'], required: true },
  medicalCenter: { type: String, required: true },
  status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected'], default: 'pending' },
  documents: {
    medicalReport: String, // Cloudinary URL
    incomeProof: String    // Cloudinary URL
  },
  benefitCardNumber: String, // Generated on approval
  expiryDate: Date
}, { timestamps: true });

module.exports = mongoose.model('MedicalBenefit', medicalBenefitSchema);
```

---

## 2. The Logic Layer (`medicalController.js`)
Here we handle the business logic.

- **`applyForBenefit`**: Handles the file upload (using Multer) and saves the application.
- **`reviewApplication`**: Admin updates status to "under_review".
- **`finalizeBenefit`**: On approval, generates a unique Health Card Number.

```javascript
const MedicalBenefit = require('../models/medicalModel');

exports.applyForBenefit = async (req, res) => {
   try {
      const { benefitType, medicalCenter } = req.body;
      
      // Assume files were uploaded via Multer to req.files
      const newBenefit = await MedicalBenefit.create({
         user: req.user.id,
         benefitType,
         medicalCenter,
         documents: {
            medicalReport: req.files['medicalReport'][0].path,
            incomeProof: req.files['incomeProof'][0].path
         }
      });
      
      res.status(201).json({ success: true, data: newBenefit });
   } catch (err) {
      res.status(500).json({ success: false, message: err.message });
   }
};
```

---

## 3. The API Routes (`medicalRoutes.js`)
Define how the frontend talks to the backend.

```javascript
const express = require('express');
const router = express.Router();
const { applyForBenefit } = require('../controllers/medicalController');
const { protect } = require('../middleware/authMiddleware');

// Citizen applies for medical benefit
router.post('/apply', protect, applyForBenefit);

module.exports = router;
```

---

## 4. Frontend Integration
1.  **HTML**: Create `frontend/pages/medical_apply.html` with a form asking for "Benefit Type" and "Hospital Name".
2.  **JS**: Create `frontend/js/medical.js`.
    - Use `FormData` to collect the files.
    - Use **AJAX/Fetch** to send data:
    ```javascript
    const response = await fetch('/api/medical/apply', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${token}` },
       body: formData
    });
    ```

---

## 5. Admin Integration
In the admin panel, create a view to list all medical applications.
- **Visual**: Use a **Bootstrap Table** with a filter for "Benefit Type".
- **Action**: Add an "Approve" button that calls the backend to generate the **Medical Benefit Card**.


