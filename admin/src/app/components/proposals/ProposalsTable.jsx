'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
      case 'under_review': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300">Pending</span>;
      case 'revision': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300">Revision</span>;
      case 'accepted': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 flex items-center gap-1"><CheckCircle size={14} /> Accepted</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 flex items-center gap-1"><XCircle size={14} /> Rejected</span>;
      default: return null;
    }
};

export default function ProposalsTable({ proposals, isLoading }) {
  const router = useRouter();

  if (isLoading) return <div>Loading proposals...</div>;
  if (proposals.length === 0) return <div className="text-center py-16 text-gray-400">No proposals found matching your criteria.</div>;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
    >
      <table className="w-full text-left">
        <thead className="bg-gray-900/50">
          <tr>
            <th className="p-4 text-sm font-semibold text-gray-300">Event Name</th>
            <th className="p-4 text-sm font-semibold text-gray-300">Submitted By</th>
            <th className="p-4 text-sm font-semibold text-gray-300">Date</th>
            <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map(proposal => (
            <motion.tr
              key={proposal._id}
              variants={itemVariants}
              onClick={() => router.push(`/proposals/${proposal._id}`)}
              className="border-t border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
            >
              <td className="p-4 font-medium text-white">{proposal.eventName}</td>
              <td className="p-4 text-gray-300">{proposal.user.name}</td>
              <td className="p-4 text-gray-400">{new Date(proposal.submissionDate).toLocaleDateString()}</td>
              <td className="p-4"><StatusBadge status={proposal.status} /></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}