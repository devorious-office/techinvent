import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/lib/models/User';
import Otp from '@/app/lib/models/Otp';
import { transporter, mailOptions } from '@/app/utils/nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndDelete({ email });
    await new Otp({ email, otp }).save();

    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: 'Verify Your Email for Tech Invent Portal',
      html: `<p>Your verification code is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to send OTP.' }, { status: 500 });
  }
}