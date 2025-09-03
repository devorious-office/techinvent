'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, User, Mail, Phone, Fingerprint, FileText, CheckCircle, XCircle, Clock, History, ChevronDown, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// --- Helper Components (Self-contained in this file) ---

const DetailField = ({ label, value, icon: Icon }) => (
  <div>
    <div className="flex items-center gap-2 mb-1 text-gray-400">
      <Icon size={14} />
      <p className="text-sm font-medium">{label}</p>
    </div>
    <p className="text-base text-white break-words">{value || 'N/A'}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'under review': { color: 'bg-yellow-500/20 text-yellow-400', label: 'Under Review' },
    'revision': { color: 'bg-blue-500/20 text-blue-400', label: 'Revision' },
    'accepted': { color: 'bg-green-500/20 text-green-400', label: 'Accepted' },
    'rejected': { color: 'bg-red-500/20 text-red-400', label: 'Rejected' }
  };
  const config = statusConfig[status] || statusConfig['under review'];
  return (<span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>);
};

const ProposalHistory = ({ versions }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (versions.length === 0) return null;
  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-700">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
        <History size={16} /><span>{isOpen ? 'Hide' : 'Show'} History ({versions.length})</span><ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-3 space-y-2">{versions.map((v, i) => (<div key={v._id} className="p-2 bg-gray-900/50 rounded-md text-sm"><p className="text-gray-400">Version {versions.length - i} ({new Date(v.submissionDate).toLocaleDateString()}) - Status was <span className="font-semibold">{v.status}</span>.</p></div>))}</div>}
    </div>
  );
};

// --- Main User Detail Page Component ---
export default function UserDetailPage({ params }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/users/${params.id}`);
          if (!res.ok) throw new Error('Failed to fetch user data');
          const data = await res.json();
          setUserData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [params.id]);

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;
  if (!userData) return null;

  const { user, proposalThreads } = userData;

  // Calculate analytics
  const statusCounts = proposalThreads.reduce((acc, thread) => {
    const latestStatus = thread.history.length > 0 ? thread.history[0].status : thread.status;
    acc[latestStatus] = (acc[latestStatus] || 0) + 1;
    return acc;
  }, {});
  
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#eab308', '#3b82f6', '#22c55e', '#ef4444'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4"><ArrowLeft size={18} /> Back to Users List</button>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{user.name}</h1>
        <p className="text-gray-400">User Profile & Proposal History</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Details & Analytics */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">User Details</h3>
            <div className="space-y-4">
              <DetailField label="Full Name" value={user.name} icon={User} />
              <DetailField label="Employee ID" value={user.employeeId} icon={Fingerprint} />
              <DetailField label="Email Address" value={user.email} icon={Mail} />
              <DetailField label="Phone Number" value={user.phoneNumber} icon={Phone} />
              <DetailField label="Date Joined" value={new Date(user.createdAt).toLocaleDateString()} icon={Calendar} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Proposal Status Breakdown</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" labelLine={false}>
                    {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4A5568' }} />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Proposal History */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Proposals Submitted ({proposalThreads.length})</h2>
          <div className="space-y-4">
            {proposalThreads.length > 0 ? (
              proposalThreads.map((thread) => {
                const latestVersion = thread.history.length > 0 ? thread.history[0] : thread;
                const olderVersions = thread.history.length > 0 ? [thread, ...thread.history.slice(1)] : [];
                return (
                  <div key={thread._id} className="bg-gray-800/60 p-5 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start gap-4">
                      <Link href={`/proposals/${latestVersion._id}`} className="flex-grow group">
                        <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">{latestVersion.eventName}</h3>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400 mt-2">
                          <StatusBadge status={latestVersion.status} />
                          <span>Last Submitted: {new Date(latestVersion.submissionDate).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    </div>
                    <ProposalHistory versions={olderVersions} />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-gray-800/50 rounded-lg border-dashed border-gray-700">
                <FileText size={48} className="mx-auto text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">No proposals submitted by this user.</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}