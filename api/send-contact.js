import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { name, email, type, subject, message } = req.body;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'service4companys@gmail.com';

  try {
    await resend.emails.send({
      from: 'HABACHA Contact <onboarding@resend.dev>',
      to: adminEmail,
      replyTo: email,
      subject: `New Contact Message [${type}]: ${subject}`,
      html: `<h2>New message from HABACHA contact form</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Type:</strong> ${type}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <hr>
             <p><strong>Message:</strong></p>
             <p style="white-space: pre-wrap;">${message}</p>`
    });

    await resend.emails.send({
      from: 'HABACHA <onboarding@resend.dev>',
      to: email,
      subject: `Thank you for contacting HABACHA`,
      html: `<h2>Hello ${name},</h2>
             <p>Thank you for contacting HABACHA. We have received your message and our team will respond within 24-48 hours.</p>
             <p><strong>Your message:</strong></p>
             <p style="padding: 12px; background-color: #f8fafc; border-left: 4px solid #2563eb; margin: 16px 0; white-space: pre-wrap;">${message}</p>
             <p>Best regards,<br>The HABACHA Team</p>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
