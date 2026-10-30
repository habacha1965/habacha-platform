import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { companyName, contactEmail, status, reason } = req.body;
  const resend = new Resend(process.env.RESEND_API_KEY);

  let subject, htmlContent;

  if (status === 'Rejected') {
    subject = `Update on your HABACHA Supplier Application: ${companyName}`;
    htmlContent = `<h2>Hello ${companyName} Team,</h2>
                   <p>Thank you for your interest in joining the HABACHA founding supplier network.</p>
                   <p>After careful review, we are unable to approve your application at this time.</p>
                   <p><strong>Reason for rejection:</strong></p>
                   <p style="padding: 12px; background-color: #f8fafc; border-left: 4px solid #ef4444; margin: 16px 0;">${reason}</p>
                   <p>You are welcome to re-apply in the future once these points have been addressed.</p>
                   <p>Best regards,<br>The HABACHA Partnerships Team</p>`;
  } else if (status === 'Deleted') {
    subject = `HABACHA Supplier Network: Partnership Ended`;
    htmlContent = `<h2>Hello ${companyName} Team,</h2>
                   <p>We are writing to inform you that your supplier account on the HABACHA platform has been closed.</p>
                   <p><strong>Reason for termination:</strong></p>
                   <p style="padding: 12px; background-color: #f8fafc; border-left: 4px solid #ef4444; margin: 16px 0;">${reason}</p>
                   <p>If you believe this is a mistake, please contact us immediately. Otherwise, we wish you all the best.</p>
                   <p>Best regards,<br>The HABACHA Partnerships Team</p>`;
  } else {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await resend.emails.send({
      from: 'HABACHA Partnerships <onboarding@resend.dev>',
      to: contactEmail,
      subject: subject,
      html: htmlContent
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
