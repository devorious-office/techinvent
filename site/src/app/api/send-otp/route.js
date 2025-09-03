
// app/api/send-otp/route.js

import { NextResponse } from 'next/server';
import { transporter, mailOptions } from '@/app/utils/nodemailer';
import dbConnect from '@/app/lib/dbConnect';
import Otp from '@/app/lib/models/Otp';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.endsWith('@gmail.com')) {
      return NextResponse.json({ message: 'A valid Gmail address is required.' }, { status: 400 });
    }

    await dbConnect();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any old OTPs for this email and save the new one
    await Otp.findOneAndDelete({ email });
    await new Otp({ email, otp }).save();

    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: 'Your OTP for Tech Invent Proposal',
      text: `Your One-Time Password is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Tech Invent 2025 Proposal Verification</h2>
          <p>Here is your One-Time Password (OTP) to complete your submission:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px; border-radius: 5px;">${otp}</p>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to send OTP.' }, { status: 500 });
  }
}