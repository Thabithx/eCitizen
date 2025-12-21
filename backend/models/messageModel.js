const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true
   },
   email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
   },
   message: {
      type: String,
      required: true,
      trim: true
   },
   status: {
      type: String,
      enum: ['pending', 'answered'],
      default: 'pending'
   },
   adminReply: {
      type: String,
      default: ''
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   answeredAt: {
      type: Date,
      default: null
   }
}, { collection: 'messages' });

module.exports = mongoose.model('Message', messageSchema);
