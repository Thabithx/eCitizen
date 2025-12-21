const Citizen = require('../models/citizenModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getFileUrl, getFileUrls } = require('../utils/fileUpload');
const { generateNID } = require('../utils/nidGenerator');
const { generateNIDDocument } = require('../utils/nidDocumentGenerator');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'citizen'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const adminSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Get photo URL if uploaded
    const photo = getFileUrl(req, req.file);

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      photo
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photo: user.photo,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if citizen application exists
      const citizen = await Citizen.findOne({ user: user._id });

      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        applicationStatus: citizen ? citizen.applicationStatus : 'initial'
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getMe = async (req, res) => {
  res.status(200).json(req.user);
};


const submitApplication = async (req, res) => {
  try {
    const {
      dob,
      occupation,
      phoneNumber,
      address
    } = req.body;

    // Validate required fields
    if (!dob || !occupation || !phoneNumber || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate required files
    if (!req.files || !req.files.birthCertificate || !req.files.proofOfAddress) {
      return res.status(400).json({
        success: false,
        message: 'Birth certificate and proof of address are required'
      });
    }

    // Get file URLs
    const photoUrl = req.files.photo ? getFileUrl(req, req.files.photo[0]) : null;
    const birthCertUrl = getFileUrl(req, req.files.birthCertificate[0]);
    const proofOfAddressUrl = getFileUrl(req, req.files.proofOfAddress[0]);
    const educationalCertUrl = req.files.educationalCert ? getFileUrl(req, req.files.educationalCert[0]) : null;
    const additionalDocsUrls = req.files.additionalDocs ? getFileUrls(req, req.files.additionalDocs) : [];

    // Check if application already exists
    let citizen = await Citizen.findOne({ user: req.user.id });

    if (citizen) {
      // Update existing application
      citizen.dob = new Date(dob);
      citizen.occupation = occupation.trim();
      citizen.phoneNumber = phoneNumber.trim();
      citizen.address = address.trim();
      if (photoUrl) citizen.photo = photoUrl;
      citizen.birthCertificate = birthCertUrl;
      citizen.proofOfAddress = proofOfAddressUrl;
      citizen.educationalCert = educationalCertUrl;
      citizen.additionalDocs = additionalDocsUrls;
      citizen.applicationStatus = 'pending';
      await citizen.save();
    } else {
      // Create new application
      citizen = await Citizen.create({
        user: req.user.id,
        dob: new Date(dob),
        occupation: occupation.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        photo: photoUrl,
        birthCertificate: birthCertUrl,
        proofOfAddress: proofOfAddressUrl,
        educationalCert: educationalCertUrl,
        additionalDocs: additionalDocsUrls,
        applicationStatus: 'pending'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully!',
      data: citizen
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all citizens 
const getAllCitizens = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const citizens = await Citizen.find().populate('user', 'fullName email');
    res.status(200).json({
      success: true,
      count: citizens.length,
      data: citizens
    });
  } catch (error) {
    console.error('Get citizens error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get citizen by ID
const getCitizenById = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id).populate('user', 'fullName email');

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    res.status(200).json({
      success: true,
      data: citizen
    });
  } catch (error) {
    console.error('Get citizen error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update application status 
const updateApplicationStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const citizen = await Citizen.findByIdAndUpdate(
      id,
      {
        applicationStatus: status,
        ...(status === 'approved' && { nationalId: `NIC${Date.now()}` })
      },
      { new: true }
    ).populate('user', 'fullName email');

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    // Create notification for the user
    await Notification.create({
      user: citizen.user._id,
      title: 'Application Status Updated',
      message: `Your citizen application status has been updated to: ${status.toUpperCase()}.`,
      type: 'application',
      relatedId: citizen._id
    });

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: citizen
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


const approveCitizen = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id).populate('user');

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    // Generate unique NID
    const nidNumber = await generateNID();
    const nidIssuedDate = new Date();

    // Generate NID document
    const citizenData = {
      nidNumber,
      fullName: citizen.user.fullName,
      dob: citizen.dob,
      occupation: citizen.occupation,
      address: citizen.address,
      nidIssuedDate
    };

    const nidDocumentPath = await generateNIDDocument(citizenData);

    // Update citizen record
    citizen.applicationStatus = 'approved';
    citizen.nidNumber = nidNumber;
    citizen.nidDocument = nidDocumentPath;
    citizen.nidIssuedDate = nidIssuedDate;
    citizen.nidStatus = 'issued';

    await citizen.save();

    // Create notification for NID issuance
    await Notification.create({
      user: citizen.user._id,
      title: 'National Identity Card Issued',
      message: `Congratulations! Your National Identity Card (${nidNumber}) has been issued. You can now view and download it from your profile.`,
      type: 'nic',
      relatedId: citizen._id
    });

    res.json({
      success: true,
      message: 'Citizen approved and NID generated',
      data: citizen
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const searchCitizens = async (req, res) => {
  try {
    const { nid, firstName, lastName, email, phone, occupation } = req.query;

    // 1. Find matching users
    let userOr = [];
    if (firstName) userOr.push({ fullName: { $regex: firstName, $options: 'i' } });
    if (lastName) userOr.push({ fullName: { $regex: lastName, $options: 'i' } });
    if (email) userOr.push({ email: { $regex: email, $options: 'i' } });

    let matchingUserIds = [];
    if (userOr.length > 0) {
      const users = await User.find({ $or: userOr }).select('_id');
      matchingUserIds = users.map(u => u._id);
    }

    // 2. Citizen search query
    let citizenOr = [];
    if (nid) citizenOr.push({ nidNumber: { $regex: nid, $options: 'i' } });
    if (phone) citizenOr.push({ phoneNumber: { $regex: phone, $options: 'i' } });
    if (occupation) citizenOr.push({ occupation: { $regex: occupation, $options: 'i' } });
    if (matchingUserIds.length > 0) citizenOr.push({ user: { $in: matchingUserIds } });

    // If no search criteria provided, return all
    const query = citizenOr.length > 0 ? { $or: citizenOr } : {};

    const citizens = await Citizen.find(query)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: citizens });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateCitizenNID = async (req, res) => {
  try {
    const { nidNumber } = req.body;

    const citizen = await Citizen.findById(req.params.id);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    citizen.nidNumber = nidNumber;
    await citizen.save();

    res.json({ success: true, data: citizen });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCitizenInfo = async (req, res) => {
  try {
    const updates = req.body;
    const citizen = await Citizen.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    res.json({ success: true, data: citizen });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteCitizenByNID = async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ nidNumber: req.params.nidNumber });

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    await Citizen.findByIdAndDelete(citizen._id);
    res.json({ success: true, message: 'Citizen deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyNID = async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ user: req.user.id }).populate('user');

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen application not found' });
    }

    if (citizen.applicationStatus !== 'approved' || !citizen.nidDocument) {
      return res.status(400).json({ message: 'NID not yet issued' });
    }

    res.json({
      success: true,
      data: {
        nidNumber: citizen.nidNumber,
        nidDocument: citizen.nidDocument,
        nidIssuedDate: citizen.nidIssuedDate,
        fullName: citizen.user.fullName,
        dob: citizen.dob,
        address: citizen.address
      }
    });
  } catch (error) {
    console.error('Get NID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  adminSignup,
  login,
  getMe,
  submitApplication,
  getAllCitizens,
  getCitizenById,
  updateApplicationStatus,
  approveCitizen,
  searchCitizens,
  updateCitizenNID,
  updateCitizenInfo,
  deleteCitizenByNID,
  getMyNID
};
