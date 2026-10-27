import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) return res.status(500).json({ error: 'Server misconfigured' });

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: roleRow, error: roleErr } = await supabaseAdmin
    .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
  if (roleErr) return res.status(500).json({ error: 'DB error: ' + roleErr.message });
  if (!roleRow) return res.status(403).json({ error: 'Admin only' });

  const { supplierId } = req.body;
  if (!supplierId) return res.status(400).json({ error: 'Missing supplierId' });

  const { data: sup, error: supErr } = await supabaseAdmin
    .from('suppliers').select('*').eq('id', supplierId).maybeSingle();
  if (supErr || !sup) return res.status(404).json({ error: 'Supplier not found' });
  if (sup.status !== 'pending') return res.status(400).json({ error: 'Supplier is not pending' });

  const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!';
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: sup.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: sup.company_name, role: 'supplier', phone: sup.phone || '' }
  });
  if (createErr) return res.status(400).json({ error: 'Account error: ' + createErr.message });

  const newUserId = created.user.id;

  await supabaseAdmin.from('suppliers').update({ status: 'approved', auth_user_id: newUserId }).eq('id', supplierId);
  await supabaseAdmin.from('user_roles').upsert({ user_id: newUserId, role: 'supplier' }, { onConflict: 'user_id' });

  const siteUrl = process.env.SITE_URL || 'https://habacha-platform.vercel.app';
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: sup.email,
    options: { redirectTo: `${siteUrl}/update-password.html` }
  });

  let mailSent = false;
  if (!linkErr && linkData && linkData.properties && linkData.properties.action_link) {
    try {
      const { error: mailErr } = await resend.emails.send({
        from: 'HABACHA Private Desk <onboarding@resend.dev>',
        to: [sup.email],
        subject: 'Your HABACHA Application is Approved',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F172A;">
          <h2 style="color: #070D1A;">HABACHA.</h2>
          <hr style="border: 1px solid #C5C6C8; margin: 20px 0;">
          <p>Dear ${sup.applicant_name || sup.company_name},</p>
          <p>Your application has been reviewed and approved by our compliance team. You can now set your password and access the HABACHA Supplier Portal.</p>
          <p><a href="${linkData.properties.action_link}" style="display:inline-block;background:#070D1A;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;">Set Your Password</a></p>
          <p style="font-size:12px;color:#64748B;">If the button doesn't work, copy this link:<br>${linkData.properties.action_link}</p>
          <p style="font-size:12px;color:#64748B;">HABACHA Private Desk &copy; 2026</p>
        </div>`
      });
      if (!mailErr) mailSent = true;
    } catch (e) { console.warn('Mail error:', e.message); }
  }

  res.status(200).json({ success: true, userId: newUserId, email: sup.email, mailSent });
}
