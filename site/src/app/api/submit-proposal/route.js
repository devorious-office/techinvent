import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    // 1. Get User ID from token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2. Get proposal data from request body
    const proposalData = await request.json();
    
    // Destructure the original ID if it's a resubmission
    const { resubmittedFromId, ...restOfProposalData } = proposalData;

    // Remove old _id to ensure a new document is created
    delete restOfProposalData._id;
    delete restOfProposalData.submissionDate;

    // 3. Create and save the new proposal
    const newProposal = new Proposal({
        ...restOfProposalData,
        user: userId, // Link the proposal to the current user
        // If resubmittedFromId exists, set it as the originalProposal to create a thread
        originalProposal: resubmittedFromId || null,
        verifiedEmail: proposalData.email,
        status: 'under_review', // Always reset status to 'admin' for review
        remarks: '', // Always clear old remarks
    });

    await newProposal.save();

    return NextResponse.json({ message: 'Proposal submitted successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ message: 'An error occurred.', error: error.message }, { status: 500 });
  }
}
