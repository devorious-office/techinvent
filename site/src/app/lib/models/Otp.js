// app/lib/models/Otp.js

import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // This tells MongoDB to automatically delete the document after 10 minutes
    expires: 6000, // 600 seconds = 10 minutes
  },
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);