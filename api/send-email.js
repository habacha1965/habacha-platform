import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return res.status(500).json({ error: 'Server misconfigured' });

  // Valideer de sessie van de klant
  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

  const { inquiryId } = req.body;
  if (!inquiryId) return res.status(400).json({ error: 'Missing inquiryId' });

  // Haal de inquiry op via RLS (de klant kan alleen zijn eigen inquiry zien)
  const { data: inquiry, error: dbError } = await supabaseUser
    .from('inquiries')
    .select(`
      id, message, requested_dates, total_price,
      client_name, client_email,
      assets (title, category, location, price_rate)
    `)
    .eq('id', inquiryId)
    .single();

  if (dbError || !inquiry) return res.status(404).json({ error: 'Inquiry not found' });

  const clientEmail = inquiry.client_email;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'service4companys@gmail.com';
  const asset = inquiry.assets || {};
  const assetTitle = asset.title || 'Unknown Asset';
  const assetCategory = asset.category || '';
  const assetLocation = asset.location || '';
  const assetPrice = asset.price_rate ? `$${asset.price_rate.toLocaleString()}` : 'On Request';
  const totalPrice = inquiry.total_price ? `$${inquiry.total_price.toLocaleString()}` : 'On Request';
  const dates = inquiry.requested_dates || 'Not specified';
  const message = inquiry.message || 'No message provided';
  const siteUrl = process.env.SITE_URL || 'https://habacha-platform.vercel.app';
  const adminLink = `${siteUrl}/admin.html`;

  // 1. Bevestigingsmail naar de klant
  let clientMailOk = false;
  try {
    await resend.emails.send({
      from: 'HABACHA Private Desk <onboarding@resend.dev>',
      to: [clientEmail],
      subject: `Inquiry Registered - ${assetTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F172A;">
          <h2 style="color: #070D1A;">HABACHA.</h2>
          <hr style="border: 1px solid #C5C6C8; margin: 20px 0;">
          <p>Dear ${inquiry.client_name || 'Client'},</p>
          <p>Your private dossier request for the <strong>${assetTitle}</strong> has been securely received.</p>
          <p>An Asset Specialist will contact your office <strong>within 1 business day</strong>.</p>
          <br>
          <p style="font-size: 12px; color: #64748B;">This is an automated message. Please do not reply directly.</p>
          <p style="font-size: 12px; color: #64748B;">&copy; 2026 HABACHA Global. All rights reserved.</p>
        </div>
      `,
    });
    clientMailOk = true;
  } catch (e) { console.warn('Client mail error:', e.message); }

  // 2. Notificatiemail naar de admin
  let adminMailOk = false;
  try {
    await resend.emails.send({
      from: 'HABACHA System <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Inquiry: ${assetTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F172A;">
          <h2 style="color: #070D1A;">HABACHA.</h2>
          <p style="font-size: 11px; color: #C5C6C8; text-transform: uppercase; letter-spacing: 1px; margin-top: -10px;">Internal Notification</p>
          <hr style="border: 1px solid #C5C6C8; margin: 20px 0;">
          <h3 style="color: #070D1A;">New Inquiry Received</h3>
          <table style="width: 100%; font-size: 14px; margin-top: 15px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 130px;">Client:</td><td style="padding: 6px 0; font-weight: 600;">${inquiry.client_name} (${clientEmail})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Asset:</td><td style="padding: 6px 0; font-weight: 600;">${assetTitle}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Category:</td><td style="padding: 6px 0;">${assetCategory}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Location:</td><td style="padding: 6px 0;">${assetLocation}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Dates:</td><td style="padding: 6px 0;">${dates}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Rate:</td><td style="padding: 6px 0;">${assetPrice}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">Est. Total:</td><td style="padding: 6px 0; font-weight: 600;">${totalPrice}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #F7F6F3; border-left: 3px solid #C5C6C8;">
            <p style="font-size: 12px; color: #64748B; margin-bottom: 5px; text-transform: uppercase;">Client Message</p>
            <p style="font-size: 14px; font-style: italic; margin: 0;">"${message}"</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${adminLink}" style="display: inline-block; background: #070D1A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Open Admin Desk</a>
          </div>
          <hr style="border: 1px solid #E2E0D9; margin: 30px 0 20px 0;">
          <p style="font-size: 13px; color: #ef4444; font-weight: bold;">ACTION REQUIRED: Respond within 1 business day.</p>
          <p style="font-size: 12px; color: #64748B;">&copy; 2026 HABACHA Global. All rights reserved.</p>
        </div>
      `,
    });
    adminMailOk = true;
  } catch (e) { console.warn('Admin mail error:', e.message); }

  res.status(200).json({ success: true, clientMailOk, adminMailOk });
}
