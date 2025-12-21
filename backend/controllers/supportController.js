const Message = require('../models/messageModel');
const FAQ = require('../models/faqModel');

// ============ MESSAGES ============

// POST: Create a new message
const submitMessage = async (req, res) => {
   try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
         return res.status(400).json({ error: 'All fields are required' });
      }

      const newMessage = await Message.create({
         name,
         email,
         message
      });

      res.status(201).json({
         success: true,
         message: 'Message sent successfully!',
         data: newMessage
      });
   } catch (error) {
      console.error('Error submitting message:', error);
      res.status(500).json({ error: 'Failed to send message' });
   }
};

// GET: Retrieve all messages (Admin)
const getAllMessages = async (req, res) => {
   try {
      const messages = await Message.find().sort({ createdAt: -1 });
      res.status(200).json({
         success: true,
         count: messages.length,
         data: messages
      });
   } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
   }
};

// PUT: Reply to a message (Admin)
const replyToMessage = async (req, res) => {
   try {
      const { adminReply } = req.body;
      if (!adminReply) {
         return res.status(400).json({ error: 'Reply content is required' });
      }

      const message = await Message.findByIdAndUpdate(
         req.params.id,
         {
            status: 'answered',
            adminReply,
            answeredAt: Date.now()
         },
         { new: true }
      );

      if (!message) {
         return res.status(404).json({ error: 'Message not found' });
      }

      // Log email notification
      console.log('📧 Email Notification:');
      console.log(`   To: ${message.email}`);
      console.log(`   Subject: Response to your message`);
      console.log(`   Body: ${adminReply}`);
      console.log('   [Email would be sent via SMTP in production]');

      // Find user by email to send in-app notification
      const User = require('../models/userModel');
      const Notification = require('../models/notificationModel');
      const user = await User.findOne({ email: message.email.toLowerCase() });

      if (user) {
         await Notification.create({
            user: user._id,
            title: 'New Support Reply',
            message: `Admin has replied to your message: "${adminReply.substring(0, 50)}${adminReply.length > 50 ? '...' : ''}"`,
            type: 'support',
            relatedId: message._id
         });
      }

      res.status(200).json({
         success: true,
         message: 'Reply sent successfully',
         data: message
      });
   } catch (error) {
      console.error('Error replying to message:', error);
      res.status(500).json({ error: 'Failed to reply' });
   }
};

// DELETE: Delete a message (Admin)
const deleteMessage = async (req, res) => {
   try {
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) {
         return res.status(404).json({ error: 'Message not found' });
      }
      res.status(200).json({ success: true, message: 'Message deleted' });
   } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Failed to delete message' });
   }
};

// ============ FAQs ============

// GET: Get all active FAQs (Public)
const getPublicFAQs = async (req, res) => {
   try {
      const faqs = await FAQ.find({ active: true }).sort({ createdAt: -1 });
      res.status(200).json({
         success: true,
         data: faqs
      });
   } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
   }
};

// GET: Get all FAQs including inactive (Admin)
const getAllFAQs = async (req, res) => {
   try {
      const faqs = await FAQ.find().sort({ createdAt: -1 });
      res.status(200).json({
         success: true,
         data: faqs
      });
   } catch (error) {
      console.error('Error fetching all FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
   }
};

// POST: Create FAQ (Admin)
const createFAQ = async (req, res) => {
   try {
      const { question, answer, order, active } = req.body;
      if (!question || !answer) {
         return res.status(400).json({ error: 'Question and Answer are required' });
      }

      const newFAQ = await FAQ.create({
         question,
         answer,
         order: order || 0,
         active: active !== undefined ? active : true
      });

      res.status(201).json({
         success: true,
         message: 'FAQ created',
         data: newFAQ
      });
   } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Failed to create FAQ' });
   }
};

// PUT: Update FAQ (Admin)
const updateFAQ = async (req, res) => {
   try {
      const { question, answer, active } = req.body;
      const faq = await FAQ.findByIdAndUpdate(
         req.params.id,
         {
            question,
            answer,
            active,
            updatedAt: Date.now()
         },
         { new: true }
      );

      if (!faq) {
         return res.status(404).json({ error: 'FAQ not found' });
      }

      res.status(200).json({
         success: true,
         message: 'FAQ updated',
         data: faq
      });
   } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Failed to update FAQ' });
   }
};

// DELETE: Delete FAQ (Admin)
const deleteFAQ = async (req, res) => {
   try {
      const faq = await FAQ.findByIdAndDelete(req.params.id);
      if (!faq) {
         return res.status(404).json({ error: 'FAQ not found' });
      }
      res.status(200).json({ success: true, message: 'FAQ deleted' });
   } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Failed to delete FAQ' });
   }
};

module.exports = {
   submitMessage,
   getAllMessages,
   replyToMessage,
   deleteMessage,
   getPublicFAQs,
   getAllFAQs,
   createFAQ,
   updateFAQ,
   deleteFAQ
};
