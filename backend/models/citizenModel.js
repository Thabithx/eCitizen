const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
   {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["citizen", "admin"],
      default: "citizen",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Citizen', citizenSchema);
