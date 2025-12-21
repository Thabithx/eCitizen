const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
   question: {
      type: String,
      required: true,
      trim: true
   },
   answer: {
      type: String,
      required: true,
      trim: true
   },
   order: {
      type: Number,
      default: 0
   },
   active: {
      type: Boolean,
      default: true
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   updatedAt: {
      type: Date,
      default: Date.now
   }
}, { collection: 'faqs' });

module.exports = mongoose.model('FAQ', faqSchema);
