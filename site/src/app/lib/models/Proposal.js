import { number } from 'framer-motion';
import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
 
   // Link to the user who created the proposal
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

    // NEW: A field to link a resubmission back to its original proposal
  originalProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    default: null,
  },
  // ... (all existing fields from the previous answer)
  eventName: { type: String, required: true },
  eventType: { type: String },
  eventLevel: { type: String },
  entityName: { type: String },
  entityType: { type: String },
  organizedBy: { type: String },
  eventDate: { type: String },
  venue: { type: String },
  timeFrom: { type: String },
  timeTo: { type: String },
  facultyCoordinator: { type: String, required: true },
  ecode: { type: String },
  email: { type: String },
  contactNumber: { type: String },
  registrationFees: { type: String },
  feeAmount: { type: String },
  prizePool: { type: String },
  prizeAmount: { type: String },
  eventMode: { type: String },
  expectedParticipants: { type: String },
  sponsorship: { type: String },
  sponsorshipType: { type: [String] },
  skillSet: { type: String },
  sdgMapped: { type: String },
  description: { type: String },
  outcome: { type: String },
  budget: {type: Number},
  submissionDate: { type: Date, default: Date.now },
  verifiedEmail: { type: String, required: true },

    // New fields for admin review
  status: {
    type: String,
    enum: ['under_review', 'revision', 'accepted', 'rejected'],
    default: 'under_review',
  },
  remarks: {
    type: String,
    default: '',
  },


  // Add fields for Cloudinary URLs
  eventDetailsUrl: { type: String, required: true },
  budgetSummaryUrl: { type: String, required: true },
  guestListUrl: { type: String, required: true },
  minuteByMinuteUrl: { type: String, required: true },
});

export default mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);