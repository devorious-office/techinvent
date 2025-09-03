'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#2DD4BF', '#3B82F6', '#9333EA', '#F59E0B'];

export default function AnalyticsChart({ title, type, data, icon: Icon }) {
  const chartData = Array.isArray(data) 
  ? data // already an array
  : data 
    ? Object.entries(data).map(([name, count]) => ({ name, value: count }))
    : [];


  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} tick={{ angle: -25, textAnchor: 'end' }} interval={0} />
              <YAxis stroke="#A0AEC0" fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4A5568' }}/>
              <Bar dataKey="value" fill="#2DD4BF" name="Proposals" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4A5568' }}/>
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'leaderboard':
        return (
            <div className="space-y-2">
                {chartData.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                        <span className="text-white font-medium">{user.name}</span>
                        <span className="text-cyan-400 font-bold">{user.count} proposals</span>
                    </div>
                ))}
            </div>
        );
      default: return null;
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="w-full">
        {renderChart()}
      </div>
    </motion.div>
  );
}