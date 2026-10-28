
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjgwMDAsImV4cCI6MjA1NTY0NDAwMH0.79V4d8rG1g-A';

async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    alert('FOUT: Geen Resend API Key gevonden! Ga naar admin.html en klik op Save.');
    return null;
  }

  try {
    console.log('Verzenden naar proxy...');
    const resp = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey.trim(),
        to: toEmail,
        subject: subject,
        html: htmlContent
      })
    });
    
    const data = await resp.json();
    console.log('Resend Response:', data);
    return data;
  } catch (err) {
    console.error('Email Proxy Error:', err);
    return null;
  }
}

function getClientEmailHTML(name, cat, details) {
  return `<div style="padding:20px; border:2px solid gold;"><h1>HABACHA</h1><p>Dear ${name}, we received your request for ${cat}.</p><p>${details}</p></div>`;
}
function getAdminEmailHTML(name, email, cat, details) {
  return `<div style="padding:20px; background:#eee;"><h2>NEW ALERT</h2><p>${name} (${email}) wants ${cat}.</p><p>${details}</p></div>`;
}
