
// HABACHA Platform - Integrated Client Engine
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // We target the global window object for this

// Resend Email Dispatcher via Vercel Proxy
async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    console.warn('⚠️ Resend API key missing');
    return null;
  }

  try {
    const resp = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey,
        from: 'HABACHA Platform <onboarding@resend.dev>',
        to: toEmail,
        subject: subject,
        html: htmlContent
      })
    });
    return await resp.json();
  } catch (err) {
    console.error('❌ Email failed:', err);
    return null;
  }
}

// Helper for Email Templates
function getClientEmailHTML(name, category, details) {
  return `<div style="font-family:sans-serif;padding:20px;border:2px solid #c5a059;background:#0b132b;color:white;">
    <h2 style="color:#c5a059;">HABACHA CONFIRMATION</h2>
    <p>Dear ${name}, your request for <strong>${category}</strong> has been received.</p>
    <p>Details: ${details}</p>
  </div>`;
}

function getAdminEmailHTML(name, email, category, details) {
  return `<div style="font-family:sans-serif;padding:20px;background:#1c2541;color:white;">
    <h2 style="color:#c5a059;">🚨 NEW BOOKING ALERT</h2>
    <p><strong>Client:</strong> ${name} (${email})</p>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Details:</strong> ${details}</p>
    <a href="https://habacha-platform.vercel.app/admin.html" style="color:#c5a059;">Open Admin Dashboard</a>
  </div>`;
}
