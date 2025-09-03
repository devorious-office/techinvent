import { transporter } from './nodemailer';

// Main function to send the email
export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Tech Invent 2025 - Academic Affairs" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

// Function to generate the formal HTML for the email
export const createStatusUpdateEmail = ({ name, eventName, status, remarks }) => {
  const statusInfo = {
    accepted: {
      title: "Proposal Accepted",
      color: "#22c55e", // Green
      message: "We are pleased to inform you that your proposal has been accepted. Our team will be in touch with the next steps. Congratulations!",
    },
    revision: {
      title: "Revision Required",
      color: "#3b82f6", // Blue
      message: "Your proposal has been reviewed and requires some modifications. Please review the remarks from the committee and resubmit accordingly.",
    },
    rejected: {
      title: "Proposal Not Accepted",
      color: "#ef4444", // Red
      message: "After careful consideration, we regret to inform you that your proposal has not been accepted at this time. We appreciate your effort and encourage you to submit again for future events.",
    },
     under_review: { // Renamed from 'pending' to match your schema
      title: "Proposal Under Review",
      color: "#eab308", // Yellow
      message: "This is to confirm that we have received your proposal. It is now under review by the committee. We will notify you once a decision has been made.",
    },
  };

  const currentStatus = statusInfo[status] || statusInfo.admin;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* CSS styles for the email */
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: #0F172A; color: #ffffff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header img { max-width: 150px; margin-bottom: 10px; }
        .content { padding: 30px; line-height: 1.6; color: #333333; }
        .status-box { padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; border-left: 5px solid ${currentStatus.color}; background-color: #f0f3f8; }
        .status-box h2 { margin: 0; font-size: 20px; color: ${currentStatus.color}; }
        .remarks { background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Tech Invent 2025</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>This email is regarding your event proposal submitted for Tech Invent 2025.</p>
          <p><strong>Event Name:</strong> ${eventName}</p>
          
          <div class="status-box">
            <h2>${currentStatus.title}</h2>
          </div>
          
          <p>${currentStatus.message}</p>
          
          ${remarks ? `
          <div class="remarks">
            <strong>Committee Remarks:</strong>
            <p style="margin-top: 5px;"><em>${remarks}</em></p>
          </div>
          ` : ''}

          <p>Thank you for your contribution to Tech Invent 2025.</p>
          <br>
          <p>Sincerely,</p>
          <p><strong>Office of Academic Affairs</strong><br>Chandigarh University</p>
        </div>
        <div class="footer">
          This is an automated notification. Please do not reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;
};