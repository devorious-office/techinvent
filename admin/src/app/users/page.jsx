'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Users, Search, FileText, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

// --- Reusable Helper Components (Self-contained in this file) ---

const StatCard = ({ title, value, icon: Icon }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800 p-6 rounded-lg border border-gray-700"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <Icon className="h-6 w-6 text-gray-500" />
    </div>
    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
  </motion.div>
);

const ChartWrapper = ({ title, children, icon: Icon }) => (
    <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 p-6 rounded-lg border border-gray-700"
    >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon className="text-cyan-400" />
            {title}
        </h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </motion.div>
);

// --- Main Users Page Component ---
export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUsers(data.users);
        setAnalytics(data.analytics);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  if (isLoading || !analytics) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>;
  }
  
  const totalProposals = users.reduce((sum, user) => sum + user.proposalCount, 0);
  const avgProposalsPerUser = users.length > 0 ? (totalProposals / users.length).toFixed(1) : 0;
  
  const signupsChartData = analytics.signupsByDate.map(item => ({ date: item._id, signups: item.count }));

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="space-y-8"
    >
      <h1 className="text-3xl font-bold text-white">User Management & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Registered Users" value={users.length} icon={Users} />
        <StatCard title="Total Proposals Submitted" value={totalProposals} icon={FileText} />
        <StatCard title="Avg. Proposals Per User" value={avgProposalsPerUser} icon={TrendingUp} />
      </div>

      <ChartWrapper title="User Registrations Over Time" icon={Calendar}>
        <ResponsiveContainer>
            <LineChart data={signupsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
                <YAxis stroke="#A0AEC0" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4A5568' }}/>
                <Line type="monotone" dataKey="signups" stroke="#2DD4BF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="New Users"/>
            </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">All Users</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white w-64"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900/50">
                <tr>
                  <th onClick={() => handleSort('name')} className="p-4 text-sm font-semibold text-gray-300 cursor-pointer">Name</th>
                  <th onClick={() => handleSort('employeeId')} className="p-4 text-sm font-semibold text-gray-300 cursor-pointer">Employee ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 hidden md:table-cell">Email</th>
                  <th onClick={() => handleSort('proposalCount')} className="p-4 text-sm font-semibold text-gray-300 cursor-pointer">Proposals</th>
                  <th onClick={() => handleSort('createdAt')} className="p-4 text-sm font-semibold text-gray-300 cursor-pointer hidden lg:table-cell">Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredUsers.map(user => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => router.push(`/users/${user._id}`)}
                    className="border-t border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-white">{user.name}</td>
                    <td className="p-4 text-gray-300">{user.employeeId}</td>
                    <td className="p-4 text-gray-400 hidden md:table-cell">{user.email}</td>
                    <td className="p-4 text-cyan-400 font-bold text-center">{user.proposalCount}</td>
                    <td className="p-4 text-gray-400 hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </motion.div>
  );
}