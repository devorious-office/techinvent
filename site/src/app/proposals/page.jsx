'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, PlusCircle, Send, FileText, CheckCircle, XCircle, ChevronDown, History } from 'lucide-react';
import Header from '../components/Header';

// CORRECTED: This sub-component now makes each version a clickable link.
const ProposalHistory = ({ versions }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (versions.length === 0) return null;

  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-700">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <History size={16} />
        <span>{isOpen ? 'Hide' : 'Show'} Submission History ({versions.length} older versions)</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 animate-fade-in-down">
          {versions.map((version, index) => (
            // Each version is now a Link that opens its detail page in a new tab
            <Link
              key={version._id}
              href={`/proposals/${version._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 bg-gray-900/50 rounded-md text-sm hover:bg-gray-900/80 transition-colors"
            >
              <p className="text-gray-400">
                Version {versions.length - index} submitted on {new Date(version.submissionDate).toLocaleDateString()}
              </p>
              {version.remarks && <p className="text-orange-400 text-xs mt-1">Remarks: {version.remarks}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


export default function ProposalsPage() {
  const [proposalThreads, setProposalThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetch('/api/proposals');
        if (!res.ok) throw new Error('Failed to fetch your proposals.');
        const data = await res.json();
        setProposalThreads(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'under_review':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300">Under Review</span>;
      case 'revision':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300">Changes Requested</span>;
      case 'accepted':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 flex items-center gap-1"><CheckCircle size={14} /> Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 flex items-center gap-1"><XCircle size={14} /> Rejected</span>;
      default:
        return null;
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        </div>
      );
    }

    if (error) {
      return <p className="text-red-400 text-center py-20">{error}</p>;
    }

    if (proposalThreads.length > 0) {
      return (
        <div className="space-y-4">
          {proposalThreads.map((thread) => {
            const latestVersion = thread.history.length > 0 ? thread.history[0] : thread;
            const olderVersions = thread.history.length > 0 ? [thread, ...thread.history.slice(1)] : [];

            return (
              <div key={thread._id} className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 transition-all hover:border-cyan-500/50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  
                  {/* CORRECTED: The main content is now its own clickable Link */}
                  <Link 
                    href={`/proposals/${latestVersion._id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-grow group"
                  >
                    <h2 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">{latestVersion.eventName}</h2>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400 mt-2">
                      <StatusBadge status={latestVersion.status} />
                      <span>
                        Last Submitted: {new Date(latestVersion.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                    {(latestVersion.status === 'revision' || latestVersion.status === 'rejected') && latestVersion.remarks && (
                      <p className="text-sm text-orange-300 mt-3 p-2 bg-orange-500/10 border-l-2 border-orange-400">
                        <span className="font-semibold"> Remarks:</span> {latestVersion.remarks}
                      </p>
                    )}
                  </Link>

                  {/* The Resubmit button remains a separate, functional Link */}
                  {latestVersion.status === 'revision' && (
                    <div className="w-full sm:w-auto flex-shrink-0">
                      <Link
                        href={`/?resubmit=${latestVersion._id}`}
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition font-semibold w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send size={16} />
                        Resubmit
                      </Link>
                    </div>
                  )}
                </div>
                
                <ProposalHistory versions={olderVersions} />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
        <FileText size={48} className="mx-auto text-gray-500" />
        <h3 className="mt-4 text-xl font-semibold text-white">No Proposals Found</h3>
        <p className="text-gray-400 mt-2">Get started by submitting your first proposal.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition">
          <PlusCircle size={20} />
          Submit New Proposal
        </Link>
      </div>
    );
  };

  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-white mb-8 border-b-2 border-cyan-500/30 pb-4">My Proposals</h1>
        {renderContent()}
      </div>
    </main>
  );
}