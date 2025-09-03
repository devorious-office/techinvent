import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = NextResponse.json({ message: 'Logout successful' });
    
    // Clear the cookie by setting its maxAge to a past date
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expire the cookie
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ message: 'An error occurred during logout.' }, { status: 500 });
  }
}