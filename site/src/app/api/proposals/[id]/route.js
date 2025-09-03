import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    const { id } = params; // Get proposal ID from the URL
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the proposal, ensuring it belongs to the logged-in user
    const proposal = await Proposal.findOne({ _id: id, user: userId });

    if (!proposal) {
      return NextResponse.json({ message: 'Proposal not found or you do not have permission to view it.' }, { status: 404 });
    }

    return NextResponse.json(proposal);

  } catch (error) {
    console.error('Fetch Single Proposal Error:', error);
    return NextResponse.json({ message: 'Failed to fetch proposal.' }, { status: 500 });
  }
}