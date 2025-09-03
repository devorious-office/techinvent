import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import User from '@/app/lib/models/User';

export async function GET() {
  try {
    await dbConnect();

    const totalUsers = await User.countDocuments();
    const newProposalsCount = await Proposal.countDocuments({ status: 'admin' });

    const proposalStats = await Proposal.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byEventType: [{ $group: { _id: '$eventType', count: { $sum: 1 } } }],
          byEventLevel: [{ $group: { _id: '$eventLevel', count: { $sum: 1 } } }],
          byEventMode: [{ $group: { _id: '$eventMode', count: { $sum: 1 } } }],
          bySponsorship: [{ $group: { _id: '$sponsorship', count: { $sum: 1 } } }], // NEW
          byPrizePool: [{ $group: { _id: '$prizePool', count: { $sum: 1 } } }], // NEW
          byRegFees: [{ $group: { _id: '$registrationFees', count: { $sum: 1 } } }], // NEW
          financials: [
            {
              $group: {
                _id: null,
                totalBudget: { $sum: '$budget' },
                totalPrizePool: { $sum: { $cond: [{ $eq: ['$prizePool', 'Yes'] }, { $toDouble: '$prizeAmount' }, 0] } },
                avgParticipants: { $avg: { $toDouble: '$expectedParticipants' } }
              }
            }
          ],
          byUser: [
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
              }
            },
            { $unwind: '$userDetails' },
            { $project: { name: '$userDetails.name', count: 1 } }
          ]
        }
      }
    ]);

    const formatCounts = (arr) => arr.reduce((acc, item) => {
      if (item._id) acc[item._id] = item.count;
      return acc;
    }, {});

    const stats = {
      totalUsers,
      newProposalsCount,
      statusCounts: formatCounts(proposalStats[0].byStatus),
      eventTypeCounts: formatCounts(proposalStats[0].byEventType),
      eventLevelCounts: formatCounts(proposalStats[0].byEventLevel),
      eventModeCounts: formatCounts(proposalStats[0].byEventMode),
      sponsorshipCounts: formatCounts(proposalStats[0].bySponsorship),
      prizePoolCounts: formatCounts(proposalStats[0].byPrizePool),
      regFeesCounts: formatCounts(proposalStats[0].byRegFees),
      financials: proposalStats[0].financials[0] || {},
      topUsers: proposalStats[0].byUser,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ message: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}