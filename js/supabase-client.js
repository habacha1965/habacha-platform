const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjgwMDAsImV4cCI6MjA1NTY0NDAwMH0.79V4d8rG1g';

async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    console.error('❌ Resend API Key missing in localStorage');
    return null;
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey.trim(),
        to: toEmail,
        subject: subject,
        html: htmlContent
      })
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error('❌ Proxy Error:', err);
    return null;
  }
}

function getClientEmailHTML(name, cat, details) {
  return `<div style="font-family:sans-serif;border:2px solid #c5a059;padding:20px;background:#0b132b;color:white;">
    <h1 style="color:#c5a059;">HABACHA</h1>
    <p>Dear ${name}, we have received your request for ${cat}.</p>
    <p>Details: ${details}</p>
  </div>`;
}

function getAdminEmailHTML(name, email, cat, details) {
  return `<div style="font-family:sans-serif;padding:20px;background:#1c2541;color:white;">
    <h2 style="color:#c5a059;">🚨 NEW BOOKING</h2>
    <p>Client: ${name} (${email})</p>
    <p>Category: ${cat}</p>
    <p>${details}</p>
  </div>`;
}