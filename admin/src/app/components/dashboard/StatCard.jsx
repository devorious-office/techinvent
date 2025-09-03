'use client';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon }) {
  const Icon = icon;
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <Icon className="h-6 w-6 text-gray-500" />
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}