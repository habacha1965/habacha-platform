export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { apiKey, from, to, subject, html } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'Missing Resend API Key' });

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from || 'HABACHA Platform <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html
      })
    });
    const data = await resendResp.json();
    return res.status(resendResp.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}