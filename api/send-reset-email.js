import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { companyName, contactEmail, resetLink } = req.body;
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'HABACHA Security <onboarding@resend.dev>',
      to: contactEmail,
      subject: `Password Reset Request - HABACHA`,
      html: `<h2>Hello ${companyName},</h2>
             <p>We received a request to reset the password for your HABACHA Supplier Portal account.</p>
             <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
             <a href="${resetLink}" style="display:inline-block; padding:12px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold; margin-top:16px;">Reset My Password</a>
             <p style="margin-top:24px; font-size:12px; color:#64748b;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
