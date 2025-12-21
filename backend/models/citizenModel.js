const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true
    },

    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    tempId: {
      type: String,
      default: function () {
        return `TMP${Math.floor(100000 + Math.random() * 900000)}`;
      },
    },

    nationalId: {
      type: String,
      default: null,
    },

    dob: {
      type: Date,
      required: true,
    },

    occupation: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
      default: null,
    },

    birthCertificate: {
      type: String,
      required: true,
    },

    proofOfAddress: {
      type: String,
      required: true,
    },

    educationalCert: {
      type: String,
      default: null,
    },

    additionalDocs: [{
      type: String,
    }],


    nidNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true, 
      index: true
    },

    nidDocument: {
      type: String,
      default: null,
    },

    nidIssuedDate: {
      type: Date,
      default: null,
    },

    nidStatus: {
      type: String,
      enum: ['pending', 'issued', 'revoked'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'citizens'
  }
);

module.exports = mongoose.model('Citizen', citizenSchema);
