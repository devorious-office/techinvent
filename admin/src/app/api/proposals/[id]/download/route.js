import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Proposal from '@/app/lib/models/Proposal';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
    }

    const templatePath = path.join(process.cwd(), 'src', 'templates', 'format.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // --- DATA PREPARATION FOR TEMPLATE ---
    // Here we create all the boolean flags for our checkboxes
    const p = proposal;
    const dataForTemplate = {
      ...p.toObject(),

      // Event Type Booleans
      eventType_is_hackathon: p.eventType === 'Competition & Hackathon',
      eventType_is_techtalks: p.eventType === 'Tech Talks',
      eventType_is_workshop: p.eventType === 'Workshop',
      eventType_is_exhibitions: p.eventType === 'Exhibitions and Stalls',
      eventType_is_others: p.eventType === 'Others',

      // Event Level Booleans
      eventLevel_is_flagship: p.eventLevel === 'Flagship [Legacy]',
      eventLevel_is_star: p.eventLevel === 'Star [Attraction Point]',
      eventLevel_is_other: p.eventLevel === 'Other',
      
      // Entity Type Booleans
      entityType_is_club: p.entityType === 'Club',
      entityType_is_dept: p.entityType === 'Departmental Society',
      entityType_is_prof: p.entityType === 'Professional Society',

      // Yes/No Booleans
      fees_yes: p.registrationFees === 'Yes',
      fees_no: p.registrationFees === 'No',
      prize_yes: p.prizePool === 'Yes',
      prize_no: p.prizePool === 'No',
      sponsorship_yes: p.sponsorship === 'Yes',
      sponsorship_no: p.sponsorship === 'No',
      
      // Sponsorship Type (multi-select checkbox)
      sponsorshipType_is_cash: p.sponsorshipType?.includes('Cash'),
      sponsorshipType_is_kind: p.sponsorshipType?.includes('Kind'),
      
      // Date Booleans
      date_is_31: p.eventDate === '31st October',
      date_is_1: p.eventDate === '1st November',
      date_is_both: p.eventDate === 'Both',
      
      // Mode Booleans
      mode_is_online: p.eventMode === 'Online',
      mode_is_offline: p.eventMode === 'Offline',
      mode_is_hybrid: p.eventMode === 'Hybrid',
      
      // Formatted Date
      submissionDate: new Date(p.submissionDate).toLocaleDateString(),
    };

    doc.render(dataForTemplate);

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    const headers = new Headers();
    const fileName = `Proposal_${p.eventName.replace(/[^a-z0-9]/gi, '_')}.docx`;
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    return new NextResponse(buf, { status: 200, headers });

  } catch (error) {
    console.error('Download Generation Error:', error);
    return NextResponse.json({ message: "Failed to generate document.", error: error.message }, { status: 500 });
  }
}
