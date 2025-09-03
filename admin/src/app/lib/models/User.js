import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+@.+\..+/, 'Please provide a valid email.'],
  },
  employeeId: {
    type: String,
    required: [true, 'Please provide an Employee ID.'],
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);