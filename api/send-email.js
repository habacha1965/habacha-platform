export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { apiKey, to, subject, html } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing Resend API Key' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'HABACHA Platform <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend API Error');
    return res.status(200).json(data);
  } catch (err) {
    console.error("Vercel Proxy Error:", err);
    return res.status(500).json({ error: err.message });
  }
}