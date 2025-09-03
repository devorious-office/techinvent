import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // 1. Check credentials against environment variables
    const isAdminUser = username === process.env.ADMIN_USERNAME;
    const isAdminPass = password === process.env.ADMIN_PASSWORD;

    if (isAdminUser && isAdminPass) {
      // 2. Create a token if credentials are valid
      const token = jwt.sign(
        { isAdmin: true, username: username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' } // Token is valid for 8 hours
      );

      // 3. Set the token in a secure, httpOnly cookie
      const response = NextResponse.json({ message: 'Login successful!' });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 hours in seconds
        path: '/',
      });
      return response;
    }

    // 4. Return error if credentials are wrong
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}