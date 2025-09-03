import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 1. Find the specific proposal to identify the thread
    const aProposalInThread = await Proposal.findOne({ _id: id, user: userId });
    if (!aProposalInThread) {
      return NextResponse.json({ message: 'Proposal not found.' }, { status: 404 });
    }

    // 2. Find the root/original proposal of the thread
    const originalId = aProposalInThread.originalProposal || aProposalInThread._id;
    const originalProposal = await Proposal.findById(originalId);

    // 3. Find all resubmissions linked to the original proposal
    const resubmissions = await Proposal.find({ originalProposal: originalId }).sort({ submissionDate: -1 });

    // 4. Combine them into a single thread, with the most recent first
    const fullThread = [originalProposal, ...resubmissions].sort(
      (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)
    );
    
    return NextResponse.json(fullThread);

  } catch (error) {
    console.error('Fetch Proposal Thread Error:', error);
    return NextResponse.json({ message: 'Failed to fetch proposal thread.' }, { status: 500 });
  }
}