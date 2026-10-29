import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { clientName, clientEmail, refCode } = req.body;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'service4companys@gmail.com';

  try {
    // Stuur naar de klant
    await resend.emails.send({
      from: 'HABACHA <onboarding@resend.dev>',
      to: clientEmail,
      subject: `Your HABACHA Tracking Code: ${refCode}`,
      html: `<h2>Thank you, ${clientName}!</h2>
             <p>Your request has been successfully logged.</p>
             <p>Your unique tracking code is: <strong style="font-size:24px; color:#2563eb;">${refCode}</strong></p>
             <p>You are being redirected to the supplier. Keep this code for your records.</p>`
    });

    // Stuur naar jou (Admin)
    await resend.emails.send({
      from: 'HABACHA System <onboarding@resend.dev>',
      to: adminEmail,
      subject: `New Lead: ${refCode}`,
      html: `<p>New request from <strong>${clientName}</strong> (${clientEmail}). Code: ${refCode}</p>`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    res.status(500).json({ error: error.message });
  }
}
