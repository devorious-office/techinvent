'use client';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, applyFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleReset = () => {
    setFilters({});
    applyFilters({}); // Immediately apply the reset
  };

  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full lg:w-80 flex-shrink-0 bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Filter size={20} /> Filters</h2>
        <button onClick={handleReset} className="text-sm text-cyan-400 hover:underline flex items-center gap-1"><X size={14}/> Reset</button>
      </div>
      
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
        <select value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value)} className={selectClass}>
          <option value="">All</option>
          <option value="under_review">Pending Review</option>
          <option value="revision">Revision</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Event Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
        <select value={filters.eventType || ''} onChange={(e) => handleFilterChange('eventType', e.target.value)} className={selectClass}>
           <option value="">All</option>
           <option value="Competition & Hackathon">Competition & Hackathon</option>
           <option value="Tech Talks">Tech Talks</option>
           <option value="Workshop">Workshop</option>
           <option value="Exhibitions and Stalls">Exhibitions and Stalls</option>
           <option value="Others">Others</option>
        </select>
      </div>

      {/* Budget Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Budget (₹)</label>
        <div className="flex gap-2">
            <select value={filters.budgetOperator || 'gte'} onChange={(e) => handleFilterChange('budgetOperator', e.target.value)} className={selectClass}>
                <option value="gte">≥ (More than)</option>
                <option value="lte">≤ (Less than)</option>
                <option value="eq">= (Equal to)</option>
            </select>
            <input type="number" placeholder="e.g., 50000" value={filters.budget || ''} onChange={(e) => handleFilterChange('budget', e.target.value)} className={inputClass}/>
        </div>
      </div>
      
      {/* Participants Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Expected Participants</label>
        <div className="flex gap-2">
            <select value={filters.participantsOperator || 'gte'} onChange={(e) => handleFilterChange('participantsOperator', e.target.value)} className={selectClass}>
                <option value="gte">≥ (More than)</option>
                <option value="lte">≤ (Less than)</option>
                <option value="eq">= (Equal to)</option>
            </select>
            <input type="number" placeholder="e.g., 100" value={filters.participants || ''} onChange={(e) => handleFilterChange('participants', e.target.value)} className={inputClass}/>
        </div>
      </div>

      {/* Apply Button */}
      <button onClick={() => applyFilters(filters)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-all duration-300">
        Apply Filters
      </button>
    </motion.aside>
  );
}