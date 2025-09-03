'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, File, Download, CheckCircle, XCircle, Edit, Save, ArrowLeft,
  Calendar, Clock, MapPin, User, Mail, Phone, DollarSign, Award, Users,
  Target, FileText, Building, Tag, Globe, Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Helper Components (Self-contained in this file) ---

const DetailField = ({ label, value, icon: Icon }) => (
  <div className="py-2">
    <div className="flex items-center gap-2 mb-1 text-gray-400">
      {Icon && <Icon size={14} className="flex-shrink-0" />}
      <p className="text-sm font-medium">{label}</p>
    </div>
    <p className="text-base text-white break-words">{value || 'N/A'}</p>
  </div>
);

const EditField = ({ label, name, value, onChange, type = 'text', as = 'input', options = [] }) => {
    const commonProps = {
        id: name,
        name: name,
        className: "w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
    };
    
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            {as === 'textarea' ? (
                <textarea {...commonProps} value={value || ''} onChange={onChange} rows={4} />
            ) : as === 'select' ? (
                <select {...commonProps} value={value || ''} onChange={onChange}>
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : as === 'checkbox' ? (
                 <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                     {options.map(opt => (
                         <label key={opt.value} className="flex items-center gap-2">
                             <input type="checkbox" name={name} value={opt.value} checked={value?.includes(opt.value) || false} onChange={onChange} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                             <span className="text-white">{opt.label}</span>
                         </label>
                     ))}
                 </div>
            ) : (
                <input {...commonProps} type={type} value={value || ''} onChange={onChange} />
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'under_review': { color: 'bg-yellow-500/20 text-yellow-400', label: 'Under Review' },
    'revision': { color: 'bg-blue-500/20 text-blue-400', label: 'Revision Required' },
    'accepted': { color: 'bg-green-500/20 text-green-400', label: 'Accepted' },
    'rejected': { color: 'bg-red-500/20 text-red-400', label: 'Rejected' }
  };
  const config = statusConfig[status] || statusConfig['under_review'];
  return (<span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>{config.label}</span>);
};

// --- PDF Template Component (High-Fidelity) ---
const ProposalPDF = React.forwardRef(({ data }, ref) => (
  <div ref={ref} className="p-12 bg-white text-black" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Times New Roman, serif' }}>
    <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">CHANDIGARH UNIVERSITY</h1>
        <h2 className="text-xl font-semibold">OFFICE OF ACADEMIC AFFAIRS</h2>
        <h3 className="text-lg font-bold mt-2">CU TECH INVENT 2025 EVENT PROPOSAL</h3>
    </div>
    <div className="space-y-4 text-sm">
        {[
            { label: 'Event Name:', value: data.eventName }, { label: 'Organized by (Dept./Inst.):', value: data.organizedBy },
            { label: 'Event Coordinator (Faculty):', value: data.facultyCoordinator }, { label: 'Ecode:', value: data.ecode, inline: true },
            { label: 'Email:', value: data.email, inline: true }, { label: 'Contact Number:', value: data.contactNumber, inline: true },
            { label: 'Event Date:', value: data.eventDate }, { label: 'Venue:', value: data.venue },
            { label: 'Time:', value: `${data.timeFrom} - ${data.timeTo}` }, { label: 'Expected Participants:', value: data.expectedParticipants },
            { label: 'Budget (INR):', value: data.budget?.toLocaleString() }, { label: 'Registration Fees:', value: `${data.registrationFees}${data.registrationFees === 'Yes' ? ` (₹${data.feeAmount})` : ''}` },
            { label: 'Prize Pool:', value: `${data.prizePool}${data.prizePool === 'Yes' ? ` (₹${data.prizeAmount})` : ''}` },
            { label: 'Sponsorship:', value: `${data.sponsorship}${data.sponsorship === 'Yes' ? ` (${data.sponsorshipType?.join(', ')})` : ''}` },
        ].map((field, i) => (
            <div key={i} className={`flex ${field.inline ? 'inline-flex mr-4' : ''}`}>
                <p className="font-bold w-48 flex-shrink-0">{field.label}</p>
                <p className="flex-1 border-b border-dotted border-gray-400 text-blue-800 font-semibold">{field.value || 'N/A'}</p>
            </div>
        ))}
        <div className="pt-4"><p className="font-bold">Description:</p><p className="border p-2 mt-1 text-blue-800 min-h-[40px]">{data.description}</p></div>
        <div className="pt-4"><p className="font-bold">Outcome:</p><p className="border p-2 mt-1 text-blue-800 min-h-[40px]">{data.outcome}</p></div>
    </div>
  </div>
));
ProposalPDF.displayName = 'ProposalPDF';

// --- Main Page Component ---
export default function ProposalDetailPage({ params }) {
  const router = useRouter();
  const [proposal, setProposal] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newRemarks, setNewRemarks] = useState('');
  const [hasBeenReviewed, setHasBeenReviewed] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    if (params.id) {
      setIsLoading(true);
      fetch(`/api/proposals/${params.id}`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error('Proposal not found')))
        .then(data => {
          setProposal(data);
          setEditableData(data);
          setNewStatus(data.status);
          // If remarks exist and are not just whitespace, it means an admin has already taken action
          if (data.remarks && data.remarks.trim() !== '') {
            setHasBeenReviewed(true);
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    // Frontend validation: Remarks are mandatory for status updates
    if (!newRemarks || newRemarks.trim() === '') {
        alert('Remarks are mandatory to update the status.');
        return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/proposals/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_status', 
          status: newStatus, 
          remarks: newRemarks,
          // notifyUser is implicitly true now, backend will handle it
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProposal(data);
      setNewRemarks('');
      alert('Status updated & user notified.');
      // After a successful update, lock the form
      if (data.remarks && data.remarks.trim() !== '') {
          setHasBeenReviewed(true);
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContentUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/proposals/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_content', 
          ...editableData,
          notifyUser: false // Explicitly tell the backend NOT to send an email for content edits
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProposal(data);
      setIsEditing(false);
      alert('Proposal content updated.');
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        const currentValues = editableData[name] || [];
        const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
        setEditableData(prev => ({ ...prev, [name]: newValues }));
    } else {
        setEditableData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDownloadPDF = async () => {
    const content = pdfRef.current;
    if (!content) return;
    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgWidth = pdfWidth;
    const imgHeight = imgWidth / ratio;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    pdf.save(`Proposal-${proposal.eventName.replace(/ /g, '_')}.pdf`);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>;
  if (error) return <div className="text-red-400 text-center p-8 bg-red-900/20 rounded-lg">{error}</div>;
  if (!proposal) return null;

  const dataToShow = isEditing ? editableData : proposal;
  const commonOptions = {
    yesNo: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }],
    eventType: [{value: "Competition & Hackathon", label: "Competition & Hackathon"}, {value: "Tech Talks", label: "Tech Talks"}, {value: "Workshop", label: "Workshop"}, {value: "Exhibitions and Stalls", label: "Exhibitions and Stalls"}, {value: "Others", label: "Others"}],
    eventLevel: [{value: "Flagship [Legacy]", label: "Flagship [Legacy]"}, {value: "Star [Attraction Point]", label: "Star [Attraction Point]"}, {value: "Other", label: "Other"}],
    entityType: [{value: "Club", label: "Club"}, {value: "Departmental Society", label: "Departmental Society"}, {value: "Professional Society", label: "Professional Society"}],
    eventDate: [{value: "31st October", label: "31st October"}, {value: "1st November", label: "1st November"}, {value: "Both", label: "Both"}],
    eventMode: [{value: "Online", label: "Online"}, {value: "Offline", label: "Offline"}, {value: "Hybrid", label: "Hybrid"}],
    sponsorshipType: [{value: "Cash", label: "Cash"}, {value: "Kind", label: "Kind"}],
  };

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4"><ArrowLeft size={18} /> Back</button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{dataToShow.eventName}</h1>
          <StatusBadge status={proposal.status} />
        </div>
        <p className="text-gray-400">Submitted by {proposal.user?.name} ({proposal.user?.email})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleContentUpdate} className="lg:col-span-2 space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {isEditing ? <EditField label="Event Name" name="eventName" value={dataToShow.eventName} onChange={handleInputChange} /> : <DetailField label="Event Name" value={dataToShow.eventName} icon={FileText} />}
              {isEditing ? <EditField label="Organized By" name="organizedBy" value={dataToShow.organizedBy} onChange={handleInputChange} /> : <DetailField label="Organized By" value={dataToShow.organizedBy} icon={Building} />}
              {isEditing ? <EditField label="Event Type" name="eventType" value={dataToShow.eventType} as="select" options={commonOptions.eventType} onChange={handleInputChange} /> : <DetailField label="Event Type" value={dataToShow.eventType} icon={Tag} />}
              {isEditing ? <EditField label="Event Level" name="eventLevel" value={dataToShow.eventLevel} as="select" options={commonOptions.eventLevel} onChange={handleInputChange} /> : <DetailField label="Event Level" value={dataToShow.eventLevel} icon={Target} />}
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Entity & Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {isEditing ? <EditField label="Entity Name" name="entityName" value={dataToShow.entityName} onChange={handleInputChange} /> : <DetailField label="Entity Name" value={dataToShow.entityName} icon={Building} />}
                  {isEditing ? <EditField label="Entity Type" name="entityType" value={dataToShow.entityType} as="select" options={commonOptions.entityType} onChange={handleInputChange} /> : <DetailField label="Entity Type" value={dataToShow.entityType} />}
                  {isEditing ? <EditField label="Skill Set" name="skillSet" value={dataToShow.skillSet} onChange={handleInputChange} /> : <DetailField label="Skill Set (Degree Related)" value={dataToShow.skillSet} icon={Sparkles} />}
                  {isEditing ? <EditField label="SDG's Mapped To" name="sdgMapped" value={dataToShow.sdgMapped} onChange={handleInputChange} /> : <DetailField label="SDG's Mapped To" value={dataToShow.sdgMapped} icon={Globe} />}
              </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Logistics & Coordination</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {isEditing ? <EditField label="Event Date" name="eventDate" value={dataToShow.eventDate} as="select" options={commonOptions.eventDate} onChange={handleInputChange} /> : <DetailField label="Event Date" value={dataToShow.eventDate} icon={Calendar} />}
                {isEditing ? <EditField label="Venue" name="venue" value={dataToShow.venue} onChange={handleInputChange} /> : <DetailField label="Venue" value={dataToShow.venue} icon={MapPin} />}
                {isEditing ? <EditField label="Time From" name="timeFrom" type="time" value={dataToShow.timeFrom} onChange={handleInputChange} /> : <DetailField label="Time From" value={dataToShow.timeFrom} icon={Clock} />}
                {isEditing ? <EditField label="Time To" name="timeTo" type="time" value={dataToShow.timeTo} onChange={handleInputChange} /> : <DetailField label="Time To" value={dataToShow.timeTo} icon={Clock} />}
                <div className="md:col-span-2 my-2 border-t border-gray-700"></div>
                {isEditing ? <EditField label="Faculty Coordinator" name="facultyCoordinator" value={dataToShow.facultyCoordinator} onChange={handleInputChange} /> : <DetailField label="Faculty Coordinator" value={dataToShow.facultyCoordinator} icon={User} />}
                {isEditing ? <EditField label="E-code" name="ecode" value={dataToShow.ecode} onChange={handleInputChange} /> : <DetailField label="E-code" value={dataToShow.ecode} />}
                {isEditing ? <EditField label="Email" name="email" type="email" value={dataToShow.email} onChange={handleInputChange} /> : <DetailField label="Email" value={dataToShow.email} icon={Mail} />}
                {isEditing ? <EditField label="Contact Number" name="contactNumber" type="tel" value={dataToShow.contactNumber} onChange={handleInputChange} /> : <DetailField label="Contact Number" value={dataToShow.contactNumber} icon={Phone} />}
              </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Financials & Participation</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {isEditing ? <EditField label="Event Mode" name="eventMode" value={dataToShow.eventMode} as="select" options={commonOptions.eventMode} onChange={handleInputChange} /> : <DetailField label="Event Mode" value={dataToShow.eventMode} />}
                  {isEditing ? <EditField label="Expected Participants" name="expectedParticipants" type="number" value={dataToShow.expectedParticipants} onChange={handleInputChange} /> : <DetailField label="Expected Participants" value={dataToShow.expectedParticipants} icon={Users} />}
                  {isEditing ? <EditField label="Budget (₹)" name="budget" type="number" value={dataToShow.budget} onChange={handleInputChange} /> : <DetailField label="Budget" value={dataToShow.budget ? `₹${dataToShow.budget.toLocaleString()}`: 'N/A'} icon={DollarSign} />}
                  <div className="md:col-span-2 my-2 border-t border-gray-700"></div>
                  {isEditing ? <EditField label="Registration Fees" name="registrationFees" value={dataToShow.registrationFees} as="select" options={commonOptions.yesNo} onChange={handleInputChange} /> : <DetailField label="Registration Fees" value={dataToShow.registrationFees} icon={DollarSign} />}
                  {dataToShow.registrationFees === 'Yes' && (isEditing ? <EditField label="Fee Amount (₹)" name="feeAmount" type="number" value={dataToShow.feeAmount} onChange={handleInputChange} /> : <DetailField label="Fee Amount" value={`₹ ${dataToShow.feeAmount}`} />)}
                  {isEditing ? <EditField label="Prize Pool" name="prizePool" value={dataToShow.prizePool} as="select" options={commonOptions.yesNo} onChange={handleInputChange} /> : <DetailField label="Prize Pool" value={dataToShow.prizePool} icon={Award} />}
                  {dataToShow.prizePool === 'Yes' && (isEditing ? <EditField label="Prize Amount (₹)" name="prizeAmount" type="number" value={dataToShow.prizeAmount} onChange={handleInputChange} /> : <DetailField label="Prize Amount" value={`₹ ${dataToShow.prizeAmount}`} />)}
                  {isEditing ? <EditField label="Sponsorship" name="sponsorship" value={dataToShow.sponsorship} as="select" options={commonOptions.yesNo} onChange={handleInputChange} /> : <DetailField label="Sponsorship" value={dataToShow.sponsorship} />}
                  {dataToShow.sponsorship === 'Yes' && (isEditing ? <EditField label="Sponsorship Type" name="sponsorshipType" value={dataToShow.sponsorshipType} as="checkbox" options={commonOptions.sponsorshipType} onChange={handleInputChange} /> : <DetailField label="Sponsorship Type" value={dataToShow.sponsorshipType?.join(', ')} />)}
              </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Description & Outcomes</h3>
              <div className="space-y-4">
                  {isEditing ? <EditField label="Description" name="description" as="textarea" value={dataToShow.description} onChange={handleInputChange} /> : <DetailField label="Description" value={dataToShow.description} icon={FileText} />}
                  {isEditing ? <EditField label="Outcome" name="outcome" as="textarea" value={dataToShow.outcome} onChange={handleInputChange} /> : <DetailField label="Outcome" value={dataToShow.outcome} icon={Target} />}
              </div>
          </div>
          {isEditing && (
            <div className="flex gap-4 sticky bottom-6 z-10">
                <button type="submit" disabled={isUpdating} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"><Save size={18} />{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => { setIsEditing(false); setEditableData(proposal); }} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Cancel</button>
            </div>
          )}
        </form>

        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 sticky top-28">
            <h3 className="text-xl font-semibold text-white mb-4">Admin Actions</h3>
            
            {hasBeenReviewed ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Final Decision</p>
                  <StatusBadge status={proposal.status} />
                </div>
                {proposal.remarks && (
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Remarks Given</p>
                    <p className="text-base text-gray-200 bg-gray-900/50 p-3 rounded-md border border-gray-700 whitespace-pre-wrap">{proposal.remarks}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Update Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
                    <option value="under_review">Under Review</option>
                    <option value="revision">Revision Required</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Remarks</label>
                  <textarea value={newRemarks} onChange={(e) => setNewRemarks(e.target.value)} rows={4} placeholder="Provide feedback..." className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"></textarea>
                </div>
                <button type="submit" disabled={isUpdating} className="w-full flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">{isUpdating ? <Loader2 className="animate-spin" /> : <Save size={18} />} {isUpdating ? 'Saving...' : 'Save & Notify'}</button>
              </form>
            )}
            
            {proposal.status === 'accepted' && !isEditing && (
              <div className="mt-6 border-t border-gray-700 pt-6 space-y-3">
                  <button onClick={() => setIsEditing(true)} className="w-full flex justify-center items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                    <Edit size={18} /> Edit Proposal Content
                  </button>
                
                  <Link
                    href={`/api/proposals/${proposal._id}/download`}
                    target="_blank"
                    className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    <Download size={18} /> Download as DOCX
                  </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute -z-10 -left-[9999px] top-0"><ProposalPDF ref={pdfRef} data={proposal} /></div>
    </div>
  );
}

