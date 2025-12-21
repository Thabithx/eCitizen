const mongoose = require("mongoose");

const connectdb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://user:1234@ecitizen.4gsuubs.mongodb.net/ndi_system?appName=ecitizen");
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectdb;
