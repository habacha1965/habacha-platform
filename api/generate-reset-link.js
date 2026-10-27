import { createClient } from '@supabase/supabase-js';

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
  const { data: roleRow } = await supabaseAdmin
    .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
  if (!roleRow) return res.status(403).json({ error: 'Admin only' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const siteUrl = process.env.SITE_URL || 'https://habacha-platform.vercel.app';
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: { redirectTo: `${siteUrl}/update-password.html` }
  });

  if (linkErr) return res.status(400).json({ error: 'Link error: ' + linkErr.message });

  res.status(200).json({ success: true, link: linkData.properties.action_link, email });
}
