'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from "framer-motion";


export default function RecentProposals() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/proposals?status=admin&limit=5')
      .then(res => res.json())
      .then(data => {
        setProposals(data);
        setIsLoading(false);
      });
  }, []);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
    <motion.div
      variants={itemVariants}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">New Submissions for Review</h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {proposals.length > 0 ? proposals.map(p => (
            <Link key={p._id} href={`/proposals/${p._id}`} className="block p-3 rounded-md hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white truncate">{p.eventName}</p>
                  <p className="text-xs text-gray-400">by {p.user?.name || 'N/A'}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{new Date(p.submissionDate).toLocaleDateString()}</span>
              </div>
            </Link>
          )) : <p className="text-gray-500 text-center py-8">No new proposals to review.</p>}
        </div>
      )}
    </motion.div>
    </>
  );
}