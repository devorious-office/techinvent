import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/lib/models/User';
import Otp from '@/app/lib/models/Otp';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, employeeId, phoneNumber, password, otp } = await request.json();
    await dbConnect();

    // 1. Verify OTP
    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp || storedOtp.otp !== otp) {
      return NextResponse.json({ message: 'Invalid or expired OTP.' }, { status: 400 });
    }

    // 2. Check for existing user (double-check)
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email or Employee ID already exists.' }, { status: 400 });
    }
    
    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new user
    await new User({
      name,
      email,
      employeeId,
      phoneNumber,
      password: hashedPassword,
    }).save();

    // 5. Clean up OTP
    await Otp.deleteOne({ email });

    return NextResponse.json({ message: 'Account Created Successfully!' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred during signup.' }, { status: 500 });
  }
}