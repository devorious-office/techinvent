'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export default function EventTypeChart({ data }) {
  // Convert { "Workshop": 5, "Tech Talks": 3 } to [{ name: "Workshop", count: 5 }, ...]
  const chartData = Object.entries(data).map(([name, count]) => ({ name, count }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Proposals by Event Type</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
            <YAxis stroke="#A0AEC0" fontSize={12} />
            <Tooltip
              cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#4A5568',
                color: '#FFFFFF'
              }}
            />
            <Bar dataKey="count" fill="#2DD4BF" name="Proposals" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}