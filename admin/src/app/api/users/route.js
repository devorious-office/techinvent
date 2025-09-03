import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/lib/models/User';
import Proposal from '@/app/lib/models/Proposal';

export async function GET(request) {
  try {
    await dbConnect();

    // Use an aggregation pipeline to join user data with their proposal counts
    const usersWithProposalCounts = await User.aggregate([
      {
        // Join with the proposals collection
        $lookup: {
          from: 'proposals', // The name of the proposals collection in MongoDB
          localField: '_id',
          foreignField: 'user',
          as: 'proposals'
        }
      },
      {
        // Add a new field for the total number of proposals
        $addFields: {
          proposalCount: { $size: '$proposals' }
        }
      },
      {
        // Remove the large proposals array and the password from the final output
        $project: {
          proposals: 0,
          password: 0
        }
      },
      {
        // Sort by creation date by default
        $sort: {
            createdAt: -1
        }
      }
    ]);
    
    // Additional analytics: User signups over time
    const signupsByDate = await User.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // Sort by date ascending
        }
    ]);

    return NextResponse.json({
        users: usersWithProposalCounts,
        analytics: {
            signupsByDate
        }
    });

  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ message: "Failed to fetch users and analytics" }, { status: 500 });
  }
}