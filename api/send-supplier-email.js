import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { companyName, contactEmail } = req.body;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'service4companys@gmail.com';

  try {
    await resend.emails.send({
      from: 'HABACHA Partnerships <onboarding@resend.dev>',
      to: contactEmail,
      subject: `Application Received: Welcome to HABACHA, ${companyName}`,
      html: `<h2>Hello ${companyName} Team,</h2>
             <p>Thank you for applying to join the HABACHA founding supplier network.</p>
             <p>We have successfully received your application. Our team is currently reviewing your details to ensure quality and alignment with our 8 global divisions.</p>
             <p><strong>Your Founding Supplier 50% Discount is reserved.</strong> Once approved, this will be applied to your first year.</p>
             <p>We aim to review all applications within 24-48 hours. You will receive a separate email with your login credentials and onboarding steps once approved.</p>
             <br>
             <p>Best regards,</p>
             <p><strong>The HABACHA Partnerships Team</strong></p>`
    });

    await resend.emails.send({
      from: 'HABACHA System <onboarding@resend.dev>',
      to: adminEmail,
      subject: `New Supplier Application: ${companyName}`,
      html: `<p>New supplier application received from <strong>${companyName}</strong> (${contactEmail}).</p>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
