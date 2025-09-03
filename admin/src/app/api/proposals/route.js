import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Build a dynamic filter object based on URL parameters
    const filter = {};
    
    // Text and Enum filters
    const status = searchParams.get('status');
    if (status) filter.status = status;
    
    const eventType = searchParams.get('eventType');
    if (eventType) filter.eventType = eventType;

    // Numerical filters (e.g., budget[gte]=10000)
    const budget = searchParams.get('budget');
    const budgetOperator = searchParams.get('budgetOperator'); // 'gte', 'lte', 'eq'
    if (budget && budgetOperator) {
      filter.budget = { [`$${budgetOperator}`]: Number(budget) };
    }

    const participants = searchParams.get('participants');
    const participantsOperator = searchParams.get('participantsOperator');
    if (participants && participantsOperator) {
      filter.expectedParticipants = { [`$${participantsOperator}`]: Number(participants) };
    }
    
    // Build dynamic sort object
    const sortBy = searchParams.get('sortBy') || 'submissionDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const proposals = await Proposal.find(filter)
      .populate('user', 'name email')
      .sort(sort);

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Fetch Proposals Error:", error);
    return NextResponse.json({ message: "Failed to fetch proposals" }, { status: 500 });
  }
}