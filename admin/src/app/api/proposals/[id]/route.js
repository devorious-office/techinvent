import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import { createStatusUpdateEmail, sendEmail } from '@/app/utils/emailTemplates';

// GET a single proposal by its ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const proposal = await Proposal.findById(params.id).populate('user', 'name email employeeId phoneNumber');
    if (!proposal) {
      return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
    }
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch proposal" }, { status: 500 });
  }
}
// UPGRADED PATCH function to handle both status updates and full content edits
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    await dbConnect();

    // The 'action' flag tells us if this is a status update or a content edit
    const { action, status, remarks, ...proposalData } = body;

    let updatedProposal;

    if (action === 'update_status') {
      updatedProposal = await Proposal.findByIdAndUpdate(
        id,
        { status, remarks },
        { new: true }
      ).populate('user', 'name email');

      if (updatedProposal) {
        // Send a formal email notification to the user about the status change
        const emailHtml = createStatusUpdateEmail({
          name: updatedProposal.user.name,
          eventName: updatedProposal.eventName,
          status: updatedProposal.status,
          remarks: updatedProposal.remarks,
        });
        await sendEmail({
          to: updatedProposal.user.email,
          subject: `Update on your Tech Invent 2025 Proposal: ${updatedProposal.eventName}`,
          html: emailHtml,
        });
      }
    } else {
      // This handles the full content edit
      updatedProposal = await Proposal.findByIdAndUpdate(
        id,
        proposalData, // Update with the new proposal data
        { new: true }
      ).populate('user', 'name email employeeId phoneNumber');
    }

    if (!updatedProposal) {
      return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Update Proposal Error:", error);
    return NextResponse.json({ message: "Failed to update proposal" }, { status: 500 });
  }
}