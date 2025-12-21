const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User'
      },
      title: {
         type: String,
         required: true,
         trim: true
      },
      message: {
         type: String,
         required: true,
         trim: true
      },
      type: {
         type: String,
         enum: ['application', 'nic', 'support', 'system'],
         default: 'system'
      },
      isRead: {
         type: Boolean,
         default: false
      },
      relatedId: {
         type: mongoose.Schema.Types.ObjectId,
         default: null
      }
   },
   {
      timestamps: true,
      collection: 'notifications'
   }
);

module.exports = mongoose.model('Notification', notificationSchema);
