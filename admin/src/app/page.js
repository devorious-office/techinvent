'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, CheckSquare, XSquare, Clock, BarChart3, PieChart, TrendingUp } from 'lucide-react';

// Import the modular components
import StatCard from '@/app/components/dashboard/StatCard';
import RecentProposals from '@/app/components/dashboard/RecentProposals';
import AnalyticsChart from '@/app/components/charts/AnalyticsChart';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      try {
        const res = await fetch('/api/dashboard-stats');
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    getStats();
  }, []);

  if (isLoading || !stats) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading Dashboard Analytics...</div>;
  }
  
  const statusMap = {
    pending: stats.statusCounts.under_review || 0,
    revision: stats.statusCounts.revision || 0,
    accepted: stats.statusCounts.accepted || 0,
    rejected: stats.statusCounts.rejected || 0,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      
      {/* Section 1: Top-Level Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Pending Review" value={statusMap.pending} icon={Clock} />
        <StatCard title="Revisions Sent" value={statusMap.revision} icon={FileText} />
        <StatCard title="Accepted" value={statusMap.accepted} icon={CheckSquare} />
        <StatCard title="Rejected" value={statusMap.rejected} icon={XSquare} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
      </div>

      {/* Section 2: Core Proposal Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnalyticsChart title="Proposals by Event Type" type="bar" data={stats.eventTypeCounts} icon={BarChart3}/>
        </div>
        <div>
          <AnalyticsChart title="Proposals by Status" type="pie" data={stats.statusCounts} icon={PieChart} />
        </div>
      </div>
      
      {/* Section 3: Detailed Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <AnalyticsChart title="Event Level" type="pie" data={stats.eventLevelCounts} icon={TrendingUp} />
         <AnalyticsChart title="Event Mode" type="pie" data={stats.eventModeCounts} icon={TrendingUp} />
         <AnalyticsChart title="Sponsorship Status" type="pie" data={stats.sponsorshipCounts} icon={TrendingUp} />
      </div>
      
      {/* Section 4: Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <RecentProposals />
        </div>
        <div>
            <AnalyticsChart title="Top 5 Proposers" type="leaderboard" data={stats.topUsers} icon={Users} />
        </div>
      </div>

      {/* Financial Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 p-6 rounded-lg border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Financial & Participation Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-gray-700">
          <div className="pt-4 md:pt-0">
            <p className="text-gray-400 text-sm">Total Proposed Budget</p>
            <p className="text-2xl font-bold text-cyan-400">₹{stats.financials.totalBudget?.toLocaleString() || 0}</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-gray-400 text-sm">Total Prize Pool</p>
            <p className="text-2xl font-bold text-cyan-400">₹{stats.financials.totalPrizePool?.toLocaleString() || 0}</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-gray-400 text-sm">Avg. Expected Participants</p>
            <p className="text-2xl font-bold text-cyan-400">{Math.round(stats.financials.avgParticipants) || 0}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}