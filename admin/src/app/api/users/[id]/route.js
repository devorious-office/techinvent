import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/lib/models/User';
import Proposal from '@/app/lib/models/Proposal';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();

    // 1. Fetch the user's details, excluding the password
    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Fetch all proposals submitted by this user
    const allProposals = await Proposal.find({ user: id }).sort({ submissionDate: -1 });

    // 3. Group the proposals into threads (same logic as the main proposals API)
    const proposalThreads = {};
    const originals = [];

    allProposals.forEach(p => {
      if (!p.originalProposal) {
        const proposalObject = p.toObject();
        proposalObject.history = [];
        proposalThreads[p._id.toString()] = proposalObject;
        originals.push(proposalObject);
      }
    });

    allProposals.forEach(p => {
      if (p.originalProposal && proposalThreads[p.originalProposal.toString()]) {
        proposalThreads[p.originalProposal.toString()].history.push(p.toObject());
      }
    });
    
    // 4. Sort the threads by the most recent activity
    originals.sort((a, b) => {
        const a_latest_date = a.history.length > 0 ? a.history[0].submissionDate : a.submissionDate;
        const b_latest_date = b.history.length > 0 ? b.history[0].submissionDate : b.submissionDate;
        return new Date(b_latest_date) - new Date(a_latest_date);
    });

    // 5. Return both the user details and their structured proposals
    return NextResponse.json({ user, proposalThreads: originals });

  } catch (error)
 {
    console.error("Fetch User Detail Error:", error);
    return NextResponse.json({ message: "Failed to fetch user details" }, { status: 500 });
  }
}