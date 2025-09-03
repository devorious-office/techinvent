'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import { Loader2, File, Download, CheckCircle, XCircle } from 'lucide-react';
import Card from '@/app/components/ui/Card';

// Helper component to display data fields cleanly
const DetailField = ({ label, value }) => (
  <div className="mb-4">
    <p className="text-sm font-semibold text-gray-400">{label}</p>
    <p className="text-lg text-white break-words">{value || 'N/A'}</p>
  </div>
);

// Helper component for the downloadable file links
const DownloadLink = ({ label, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 text-white p-2 rounded-md transition-colors hover:bg-cyan-500/10"
  >
    <File size={18} className="text-cyan-400 flex-shrink-0" />
    <span className="flex-grow">{label}</span>
    <Download size={16} className="text-gray-400" />
  </a>
);

// Status badge for the history table
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

export default function ProposalDetailPage({ params }) {
  const router = useRouter();
  // We only need state for the thread, loading, and error.
  // The "selected version" is now determined by the URL.
  const [thread, setThread] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This effect re-runs whenever params.id (the URL) changes
    if (params.id) {
      const fetchProposalThread = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/proposal-threads/${params.id}`);
          if (!res.ok) throw new Error('Could not load proposal details.');
          const data = await res.json();
          setThread(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProposalThread();
    }
  }, [params.id]);

  // CORRECTED: This function now properly uses the router to navigate
  const handleVersionClick = (versionId) => {
    // This will change the URL and trigger the useEffect to refetch data
    router.push(`/proposals/${versionId}`);
  };

  if (isLoading) {
    return (
      <main><Header /><div className="flex h-96 w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-cyan-400" /></div></main>
    );
  }
  
  // CORRECTED: Find the version to display based on the ID in the URL params
  const displayedVersion = thread.find(v => v._id === params.id);

  if (error || !displayedVersion) {
    return (<main><Header /><div className="max-w-5xl mx-auto py-12 px-4"><p className="text-red-400 text-center py-20 text-lg">{error || 'Could not load proposal.'}</p></div></main>);
  }
  
  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-white mb-2">{displayedVersion.eventName}</h1>
        <p className="text-gray-400 mb-8">Full Submission Details & History</p>
        
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4 border-b-2 border-cyan-500/30 pb-2">
          Displaying Version {thread.length - thread.findIndex(v => v._id === displayedVersion._id)}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Event Details">
            <DetailField label="Event Name" value={displayedVersion.eventName} />
            <DetailField label="Organized By" value={displayedVersion.organizedBy} />
            <DetailField label="Event Type" value={displayedVersion.eventType} />
            <DetailField label="Event Level" value={displayedVersion.eventLevel} />
          </Card>
          <Card title="Logistics & Coordination">
            <DetailField label="Event Date" value={displayedVersion.eventDate} />
            <DetailField label="Venue" value={displayedVersion.venue} />
            <DetailField label="Time" value={`${displayedVersion.timeFrom} - ${displayedVersion.timeTo}`} />
            <hr className="my-4 border-gray-700"/>
            <DetailField label="Faculty Coordinator" value={displayedVersion.facultyCoordinator} />
            <DetailField label="Ecode" value={displayedVersion.ecode} />
            <DetailField label="Email" value={displayedVersion.email} />
            <DetailField label="Contact" value={displayedVersion.contactNumber} />
          </Card>
          <Card title="Entity & Skills">
            <DetailField label="Entity Name" value={displayedVersion.entityName} />
            <DetailField label="Entity Type" value={displayedVersion.entityType} />
            <DetailField label="Skill Set" value={displayedVersion.skillSet} />
            <DetailField label="SDG's Mapped To" value={displayedVersion.sdgMapped} />
          </Card>
          <Card title="Financials & Participation">
            <DetailField label="Event Mode" value={displayedVersion.eventMode} />
            <DetailField label="Expected Participants" value={displayedVersion.expectedParticipants} />
            <hr className="my-4 border-gray-700"/>
            <DetailField label="Registration Fees" value={displayedVersion.registrationFees} />
            {displayedVersion.registrationFees === 'Yes' && <DetailField label="Fee Amount" value={`₹ ${displayedVersion.feeAmount}`} />}
            <DetailField label="Prize Pool" value={displayedVersion.prizePool} />
            {displayedVersion.prizePool === 'Yes' && <DetailField label="Prize Amount" value={`₹ ${displayedVersion.prizeAmount}`} />}
            <DetailField label="Sponsorship" value={displayedVersion.sponsorship} />
            {displayedVersion.sponsorship === 'Yes' && <DetailField label="Sponsorship Type" value={displayedVersion.sponsorshipType.join(', ')} />}
          </Card>
          <Card title="Description, Budget & Outcomes">
            <p className="text-sm font-semibold text-gray-400">Description</p>
            <p className="text-white mb-4 whitespace-pre-wrap">{displayedVersion.description}</p>
            <p className="text-sm font-semibold text-gray-400">Outcome</p>
            <p className="text-white whitespace-pre-wrap">{displayedVersion.outcome}</p>
            <p className="text-sm font-semibold text-gray-400">Budget</p>
            <p className="text-white whitespace-pre-wrap">{displayedVersion.budget}</p>

          </Card>
           <Card title="Submitted Documents">
            <div className="space-y-1">
              <DownloadLink label="Event Details" url={displayedVersion.eventDetailsUrl} />
              <DownloadLink label="Budget Summary" url={displayedVersion.budgetSummaryUrl} />
              <DownloadLink label="Guest List & Profile" url={displayedVersion.guestListUrl} />
              <DownloadLink label="Minute-2-Minute" url={displayedVersion.minuteByMinuteUrl} />
            </div>
           </Card>
        </div>
        
        <h2 className="text-2xl font-semibold text-cyan-400 mt-12 mb-4 border-b-2 border-cyan-500/30 pb-2">Submission History</h2>
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-300">Version</th>
                <th className="p-3 text-sm font-semibold text-gray-300">Submission Date</th>
                <th className="p-3 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-300">Admin Remarks</th>
              </tr>
            </thead>
            <tbody>
              {thread.map((version, index) => (
                <tr
                  key={version._id}
                  onClick={() => handleVersionClick(version._id)}
                  className={`border-t border-gray-700 cursor-pointer transition-colors ${
                    displayedVersion._id === version._id
                      ? 'bg-cyan-500/20' // Highlight the currently viewed version
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <td className="p-3 font-medium text-white">Version {thread.length - index}</td>
                  <td className="p-3 text-gray-300">{new Date(version.submissionDate).toLocaleString()}</td>
                  <td className="p-3"><StatusBadge status={version.status} /></td>
                  <td className="p-3 text-gray-400 text-sm">{version.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}