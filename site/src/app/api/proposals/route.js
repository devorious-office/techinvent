import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await dbConnect();

    // 1. Authenticate user
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2. Fetch all proposals for the user, sorted by most recent first
    const allProposals = await Proposal.find({ user: userId }).sort({ submissionDate: -1 });

    // 3. Group proposals into threads
    const proposalThreads = {};
    const originalProposals = [];

    // First pass: identify all original proposals (those without a parent)
    allProposals.forEach(proposal => {
      if (!proposal.originalProposal) {
        const proposalObject = proposal.toObject();
        proposalObject.history = []; // Add a history array to hold resubmissions
        proposalThreads[proposal._id] = proposalObject;
        originalProposals.push(proposalObject);
      }
    });

    // Second pass: place resubmissions into the history of their original proposal
    allProposals.forEach(proposal => {
      if (proposal.originalProposal && proposalThreads[proposal.originalProposal]) {
        proposalThreads[proposal.originalProposal].history.push(proposal.toObject());
      }
    });

    // Sort the originals by the submission date of their latest version
    originalProposals.sort((a, b) => {
        const a_latest_date = a.history.length > 0 ? a.history[0].submissionDate : a.submissionDate;
        const b_latest_date = b.history.length > 0 ? b.history[0].submissionDate : b.submissionDate;
        return new Date(b_latest_date) - new Date(a_latest_date);
    });


    return NextResponse.json(originalProposals);

  } catch (error) {
    console.error('Fetch Proposals Error:', error);
    return NextResponse.json({ message: 'Failed to fetch proposals.' }, { status: 500 });
  }
}