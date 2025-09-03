'use client';

import { useState, useEffect, useCallback } from 'react';
import FilterSidebar from '@/app/components/proposals/FilterSidebar';
import ProposalsTable from '@/app/components/proposals/ProposalsTable';

export default function ProposalsListPage() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchProposals = useCallback(async (activeFilters) => {
    setIsLoading(true);
    // Construct query parameters from the filter state
    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) { // Only add filter if it has a value
        params.append(key, value);
      }
    });
    
    try {
      const res = await fetch(`/api/proposals?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch proposals');
      const data = await res.json();
      setProposals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial data on page load
  useEffect(() => {
    fetchProposals({});
  }, [fetchProposals]);

  const applyFilters = (newFilters) => {
    fetchProposals(newFilters);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Proposals</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
        />
        <div className="flex-1">
          <ProposalsTable proposals={proposals} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}