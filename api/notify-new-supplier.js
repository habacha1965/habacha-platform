import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Server misconfigured' });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: sup, error: supErr } = await supabaseAdmin
    .from('suppliers').select('*').eq('email', email).order('created_at', { ascending: false }).limit(1).maybeSingle();

  if (supErr || !sup) return res.status(404).json({ error: 'Supplier not found' });
  if (sup.status !== 'pending') return res.status(400).json({ error: 'Already processed' });
  if (sup.notified) return res.status(200).json({ success: true, skipped: 'already_notified' });

  const createdAt = new Date(sup.created_at).getTime();
  if (Date.now() - createdAt > 5 * 60 * 1000) {
    return res.status(400).json({ error: 'Too old to notify' });
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'service4companys@gmail.com';
  const siteUrl = process.env.SITE_URL || 'https://habacha-platform.vercel.app';

  try {
    await resend.emails.send({
      from: 'HABACHA System <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Supplier Application: ${sup.company_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F172A;">
          <h2 style="color: #070D1A;">HABACHA.</h2>
          <p style="font-size: 11px; color: #C5C6C8; text-transform: uppercase; letter-spacing: 1px; margin-top: -10px;">Institutional Onboarding</p>
          <hr style="border: 1px solid #C5C6C8; margin: 20px 0;">
          <h3 style="color: #070D1A;">New Supplier Application</h3>
          <table style="width: 100%; font-size: 14px; margin-top: 15px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 140px;">Company:</td><td style="padding: 6px 0; font-weight: 600;">${sup.company_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Applicant:</td><td style="padding: 6px 0;">${sup.applicant_name || 'N/A'} (${sup.corporate_title || ''})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Email:</td><td style="padding: 6px 0;">${sup.email}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Phone:</td><td style="padding: 6px 0;">${sup.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Category:</td><td style="padding: 6px 0;">${sup.category}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Portfolio:</td><td style="padding: 6px 0; font-weight: 600;">${sup.portfolio_value}</td></tr>
          </table>
          <div style="margin-top: 30px;">
            <a href="${siteUrl}/admin.html" style="display: inline-block; background: #070D1A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Review Application</a>
          </div>
          <hr style="border: 1px solid #E2E0D9; margin: 30px 0 20px 0;">
          <p style="font-size: 13px; color: #ef4444; font-weight: bold;">ACTION REQUIRED: Approve or reject within 1 business day.</p>
        </div>
      `,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Mail error: ' + e.message });
  }

  await supabaseAdmin.from('suppliers').update({ notified: true }).eq('id', supplierId);

  res.status(200).json({ success: true });
}
