'use client';

import { useState, useEffect } from 'react';
import { UploadCloud, Send, Loader2, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import RadioGroup from './ui/RadioGroup';

const initialFormData = {
  eventName: '', eventType: '', eventLevel: '', entityName: '', entityType: '',
  organizedBy: '', eventDate: '', venue: '', timeFrom: '', timeTo: '',
  facultyCoordinator: '', ecode: '', email: '', contactNumber: '',
  registrationFees: 'No', feeAmount: '', prizePool: 'No', prizeAmount: '',
  eventMode: '', expectedParticipants: '', sponsorship: 'No', sponsorshipType: [],
  skillSet: '', sdgMapped: '', description: '', outcome: '',budget: 0,
};

const initialFilesState = {
  eventDetails: { status: 'idle', url: '', name: '' },
  budgetSummary: { status: 'idle', url: '', name: '' },
  guestList: { status: 'idle', url: '', name: '' },
  minuteByMinute: { status: 'idle', url: '', name: '' },
};

const FileInput = ({ label, id, fileState, onChange }) => {
  const getStatusIndicator = () => {
    switch (fileState.status) {
      case 'uploading': return <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />;
      case 'success': return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'error': return <AlertCircle className="h-6 w-6 text-red-400" />;
      default: return <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />;
    }
  };
  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center transition hover:border-cyan-500 hover:bg-gray-700/50">
      <label htmlFor={id} className={`cursor-pointer flex flex-col items-center ${fileState.status === 'uploading' ? 'cursor-not-allowed' : ''}`}>
        {getStatusIndicator()}
        <span className="text-cyan-400 font-semibold mt-2">{label}</span>
        <p className="text-xs text-gray-500 mt-1">PDF, DOCX, PNG, JPG</p>
        {fileState.name && <p className="text-sm text-green-400 mt-2 truncate max-w-full px-2">{fileState.name}</p>}
        {fileState.status === 'error' && <p className="text-sm text-red-400 mt-2">Upload failed.</p>}
        <input type="file" id={id} name={id} className="hidden" onChange={onChange} disabled={fileState.status === 'uploading'} />
      </label>
    </div>
  );
};

export default function ProposalForm({ resubmitId }) {
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState(initialFilesState);
  const [isCoordinatorLoading, setIsCoordinatorLoading] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetches the logged-in user's data for a new proposal
  useEffect(() => {
    const fetchCoordinatorData = async () => {
      if (resubmitId) {
        setIsCoordinatorLoading(false);
        return;
      }

      setIsCoordinatorLoading(true);
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) throw new Error('Could not load your user profile.');
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          facultyCoordinator: data.facultyCoordinator,
          ecode: data.ecode,
          email: data.email,
          contactNumber: data.contactNumber,
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsCoordinatorLoading(false);
      }
    };

    fetchCoordinatorData();
  }, [resubmitId]);

  // Fetches an old proposal's data if resubmitting
  useEffect(() => {
    if (resubmitId) {
      const fetchProposalForResubmit = async () => {
        setIsCoordinatorLoading(true);
        try {
          const res = await fetch(`/api/proposals/${resubmitId}`);
          if (!res.ok) throw new Error('Failed to load proposal data for resubmission.');
          const oldData = await res.json();
          
          setFormData(oldData);

          setFiles({
            eventDetails: { status: 'success', url: oldData.eventDetailsUrl, name: 'Uploaded - re-upload to change' },
            budgetSummary: { status: 'success', url: oldData.budgetSummaryUrl, name: 'Uploaded - re-upload to change' },
            guestList: { status: 'success', url: oldData.guestListUrl, name: 'Uploaded - re-upload to change' },
            minuteByMinute: { status: 'success', url: oldData.minuteByMinuteUrl, name: 'Uploaded - re-upload to change' },
          });

        } catch (err) {
          setError(err.message);
        } finally {
          setIsCoordinatorLoading(false);
        }
      };
      fetchProposalForResubmit();
    }
  }, [resubmitId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked ? [...prev[name], value] : prev[name].filter((v) => v !== value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const fileId = e.target.name;
    if (!file) return;

    setFiles(prev => ({ ...prev, [fileId]: { ...prev[fileId], status: 'uploading', name: file.name } }));
    
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = { timestamp, folder: 'techinvent2025' };
      
      const signRes = await fetch('/api/sign-cloudinary-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      });
      if (!signRes.ok) throw new Error('Failed to get upload signature.');
      const { signature } = await signRes.json();

      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      cloudFormData.append('timestamp', timestamp);
      cloudFormData.append('signature', signature);
      cloudFormData.append('folder', 'techinvent2025');

      const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
      
      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: cloudFormData });
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed.');
      
      const uploadData = await uploadRes.json();
      
      setFiles(prev => ({ ...prev, [fileId]: { status: 'success', url: uploadData.secure_url, name: file.name } }));
    } catch (err) {
      console.error(err);
      setFiles(prev => ({ ...prev, [fileId]: { status: 'error', url: '', name: file.name } }));
    }
  };

  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.eventName) return setError('Please fill out the Event Name field.');
    if (Object.values(files).some(f => f.status !== 'success')) return setError('Please upload all mandatory documents.');

    setShowConfirmationModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    const submissionData = {
      ...formData,
       resubmittedFromId: resubmitId, 
      eventDetailsUrl: files.eventDetails.url,
      budgetSummaryUrl: files.budgetSummary.url,
      guestListUrl: files.guestList.url,
      minuteByMinuteUrl: files.minuteByMinute.url,
    };

    try {
      const res = await fetch('/api/submit-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setSuccess('Proposal submitted successfully!');
      setShowConfirmationModal(false);
      // Reset form only if it's not a resubmission, otherwise user might want to see it
      if (!resubmitId) {
        setFormData(initialFormData);
        setFiles(initialFilesState);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleInitiateSubmit}>
        <Card title="1. Event / Activity Details">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Event Name" id="eventName" name="eventName" value={formData.eventName} onChange={handleChange} required />
            <Input label="Organized by (Dept./Inst.)" id="organizedBy" name="organizedBy" value={formData.organizedBy} onChange={handleChange} required />
          </div>
          <RadioGroup label="Type of Event" name="eventType" options={[ { value: 'Competition & Hackathon', label: 'Competition & Hackathon' }, { value: 'Tech Talks', label: 'Tech Talks' }, { value: 'Workshop', label: 'Workshop' }, { value: 'Exhibitions and Stalls', label: 'Exhibitions and Stalls' }, { value: 'Others', label: 'Others' } ]} selectedValue={formData.eventType} onChange={handleChange} />
          <RadioGroup label="Level of Event" name="eventLevel" options={[ { value: 'Flagship', label: 'Flagship [Legacy]' }, { value: 'Star', label: 'Star [Attraction Point]' }, { value: 'Other', label: 'Other' } ]} selectedValue={formData.eventLevel} onChange={handleChange} />
        </Card>

        <Card title="2. Entity Details">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Entity Name" id="entityName" name="entityName" value={formData.entityName} onChange={handleChange} />
            <RadioGroup label="Entity Type" name="entityType" options={[ { value: 'Club', label: 'Club' }, { value: 'Departmental Society', label: 'Departmental Society' }, { value: 'Professional Society', label: 'Professional Society' } ]} selectedValue={formData.entityType} onChange={handleChange} />
          </div>
        </Card>

        <Card title="3. Logistics & Coordination">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
              <RadioGroup name="eventDate" options={[ { value: '31st October', label: '31st October' }, { value: '1st November', label: '1st November' }, { value: 'Both', label: 'Both' } ]} selectedValue={formData.eventDate} onChange={handleChange} />
            </div>
            <Input label="Venue" id="venue" name="venue" value={formData.venue} onChange={handleChange} />
            <Input label="Time (From)" id="timeFrom" name="timeFrom" type="time" value={formData.timeFrom} onChange={handleChange} />
            <Input label="Time (To)" id="timeTo" name="timeTo" type="time" value={formData.timeTo} onChange={handleChange} />
          </div>
          <hr className="my-6 border-gray-700"/>
          <p className="text-sm text-cyan-300 mb-4">Your coordinator details are auto-filled from your profile.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Event Coordinator (Faculty)" value={formData.facultyCoordinator} disabled placeholder={isCoordinatorLoading ? 'Loading...' : 'N/A'} />
            <Input label="Ecode" value={formData.ecode} disabled placeholder={isCoordinatorLoading ? 'Loading...' : 'N/A'} />
            <Input label="Email" value={formData.email} disabled placeholder={isCoordinatorLoading ? 'Loading...' : 'N/A'} />
            <Input label="Contact Number" value={formData.contactNumber} disabled placeholder={isCoordinatorLoading ? 'Loading...' : 'N/A'} />
          </div>
        </Card>
        
        <Card title="4. Financials & Participation">
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                    <RadioGroup label="Registration Fees" name="registrationFees" options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} selectedValue={formData.registrationFees} onChange={handleChange} />
                    {formData.registrationFees === 'Yes' && <Input label="Amount" id="feeAmount" name="feeAmount" type="number" value={formData.feeAmount} onChange={handleChange} placeholder="Enter amount in INR" />}
                </div>
                 <div>
                    <RadioGroup label="Prize-Pool" name="prizePool" options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} selectedValue={formData.prizePool} onChange={handleChange} />
                    {formData.prizePool === 'Yes' && <Input label="Prize Amount" id="prizeAmount" name="prizeAmount" type="number" value={formData.prizeAmount} onChange={handleChange} placeholder="Enter total prize pool" />}
                </div>
                <div>
                    <RadioGroup label="Sponsorship" name="sponsorship" options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} selectedValue={formData.sponsorship} onChange={handleChange} />
                    {formData.sponsorship === 'Yes' && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Sponsorship Type</label>
                            <div className="flex gap-4">
                               <div className="flex items-center"><input type="checkbox" name="sponsorshipType" value="Cash" checked={formData.sponsorshipType.includes('Cash')} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2">Cash</label></div>
                               <div className="flex items-center"><input type="checkbox" name="sponsorshipType" value="Kind" checked={formData.sponsorshipType.includes('Kind')} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2">Kind</label></div>
                            </div>
                        </div>
                    )}
                </div>
                 <RadioGroup label="Mode of Event" name="eventMode" options={[{ value: 'Online', label: 'Online' }, { value: 'Offline', label: 'Offline' }, { value: 'Hybrid', label: 'Hybrid' }]} selectedValue={formData.eventMode} onChange={handleChange} />
                 <Input label="No. of Expected Participants" id="expectedParticipants" name="expectedParticipants" type="number" value={formData.expectedParticipants} onChange={handleChange} />
            </div>
        </Card>

        <Card title="5. Description & Outcomes">
          <Input label="Skill Set (Degree related)" id="skillSet" name="skillSet" value={formData.skillSet} onChange={handleChange} />
          <Input label="SDG's Mapped to" id="sdgMapped" name="sdgMapped" value={formData.sdgMapped} onChange={handleChange} />
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">A Brief Description of Event</label>
            <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Describe the event..."></textarea>
          </div>
          <div className="mt-6">
            <label htmlFor="outcome" className="block text-sm font-medium text-gray-300 mb-2">Outcome</label>
            <textarea id="outcome" name="outcome" rows="4" value={formData.outcome} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Must align with Academic & Skills..."></textarea>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
              Budget (in ₹)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter budget in Rupees"
            />
          </div>

        </Card>

        <Card title="6. Mandatory Documents">
          <p className="text-sm text-yellow-400 mb-4">All documents must be uploaded and show a green checkmark before you can submit.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <FileInput label="Event Details" id="eventDetails" fileState={files.eventDetails} onChange={handleFileChange} />
            <FileInput label="Budget Summary" id="budgetSummary" fileState={files.budgetSummary} onChange={handleFileChange} />
            <FileInput label="Guest list & Profile" id="guestList" fileState={files.guestList} onChange={handleFileChange} />
            <FileInput label="Minute-2-Minute" id="minuteByMinute" fileState={files.minuteByMinute} onChange={handleFileChange} />
          </div>
        </Card>

        {error && !showConfirmationModal && <p className="text-center text-red-400 mt-4">{error}</p>}
        {success && <p className="text-center text-green-400 mt-4">{success}</p>}

        <div className="text-center mt-8">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto">
            <Send className="mr-2 h-5 w-5" />
            Submit Proposal
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg p-8 shadow-2xl w-full max-w-lg m-4 border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6">Confirm Your Details</h2>
            <div className="space-y-3 text-left bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <p><strong className="font-semibold text-white w-36 inline-block">Faculty Name:</strong> {formData.facultyCoordinator}</p>
              <p><strong className="font-semibold text-white w-36 inline-block">Employee ID:</strong> {formData.ecode}</p>
              <p><strong className="font-semibold text-white w-36 inline-block">Email:</strong> {formData.email}</p>
              <p><strong className="font-semibold text-white w-36 inline-block">Contact Number:</strong> {formData.contactNumber}</p>
            </div>
            {error && <p className="text-red-400 text-sm text-center my-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowConfirmationModal(false)} className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-6 rounded-md transition" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleFinalSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md transition flex items-center" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <UserCheck className="mr-2 h-5 w-5"/>}
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}