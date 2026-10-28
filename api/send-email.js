
export default async function handler(req, res) {
  const { apiKey, to, subject, html } = req.body;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HABACHA <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });
    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
