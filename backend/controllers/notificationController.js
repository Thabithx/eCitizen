const Notification = require('../models/notificationModel');


const getNotifications = async (req, res) => {
   try {
      const notifications = await Notification.find({ user: req.user._id })
         .sort({ createdAt: -1 })
         .limit(20);

      res.status(200).json({
         success: true,
         count: notifications.length,
         data: notifications
      });
   } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, message: 'Server error' });
   }
};


const markAsRead = async (req, res) => {
   try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
         return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      // Check ownership
      if (notification.user.toString() !== req.user._id.toString()) {
         return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      notification.isRead = true;
      await notification.save();

      res.status(200).json({ success: true, data: notification });
   } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: 'Server error' });
   }
};


const markAllAsRead = async (req, res) => {
   try {
      await Notification.updateMany(
         { user: req.user._id, isRead: false },
         { isRead: true }
      );

      res.status(200).json({ success: true, message: 'All notifications marked as read' });
   } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ success: false, message: 'Server error' });
   }
};

module.exports = {
   getNotifications,
   markAsRead,
   markAllAsRead
};
