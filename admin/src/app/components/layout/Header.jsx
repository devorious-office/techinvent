'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut } from 'lucide-react';

export default function Header() {
  const [newProposalsCount, setNewProposalsCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  // Fetch the number of new proposals periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard-stats');
        const data = await res.json();
        // The 'admin' status now correctly maps to 'Under Review'
        setNewProposalsCount(data.statusCounts.admin || 0);
      } catch (error) {
        console.error("Failed to fetch notification stats:", error);
      }
    };

    fetchStats(); // Fetch immediately on load
    const interval = setInterval(fetchStats, 30000); // And then every 30 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-20 flex items-center justify-end px-6 lg:px-8">
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative">
          <Bell className="h-6 w-6 text-gray-400" />
          {newProposalsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-xs text-white">
                {newProposalsCount}
              </span>
            </span>
          )}
        </div>

        {/* User Profile & Logout Dropdown */}
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}