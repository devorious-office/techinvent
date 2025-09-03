import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/lib/models/User';

export async function GET(request) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      facultyCoordinator: user.name,
      ecode: user.employeeId,
      email: user.email,
      contactNumber: user.phoneNumber,
    });

  } catch (error) {
    console.error('Get User Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}