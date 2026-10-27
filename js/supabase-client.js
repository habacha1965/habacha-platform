// HABACHA Engine: Supabase REST + Resend Email Proxy
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjgwMDAsImV4cCI6MjA1NTY0NDAwMH0.79V4d8rG1g';

async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    console.warn('⚠️ Resend API Key missing in LocalStorage.');
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
    const resData = await resp.json();
    console.log('📧 Resend Result:', resData);
    return resData;
  } catch (err) {
    console.error('❌ Email dispatch error:', err);
    return null;
  }
}

function getClientEmailHTML(name, category, details) {
  return `<div style="font-family:Arial,sans-serif;background:#0b132b;color:#fff;padding:30px;border-radius:8px;">
    <h1 style="color:#c5a059;margin-top:0;">HABACHA PLATFORM</h1>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for submitting your charter / rental manifest for <strong>${category}</strong>.</p>
    <div style="background:#1c2541;padding:15px;border-left:4px solid #c5a059;margin:20px 0;">
      <p style="margin:0;color:#c5a059;font-weight:bold;">Logistics Manifest:</p>
      <p style="margin:5px 0 0 0;color:#ddd;white-space:pre-wrap;">${details}</p>
    </div>
    <p>Our fleet operations manager will review your request and confirm availability shortly.</p>
    <hr style="border-color:#1c2541;margin:20px 0;">
    <p style="font-size:12px;color:#8d99ae;">HABACHA Executive Fleet Management</p>
  </div>`;
}

function getAdminEmailHTML(name, email, category, details, docUrl) {
  return `<div style="font-family:Arial,sans-serif;background:#1c2541;color:#fff;padding:30px;border-radius:8px;">
    <h2 style="color:#c5a059;margin-top:0;">🚨 New Client Inquiry Received</h2>
    <p><strong>Client Name:</strong> ${name}</p>
    <p><strong>Client Email:</strong> ${email}</p>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Manifest & Pricing:</strong></p>
    <pre style="background:#0b132b;color:#c5a059;padding:10px;border-radius:4px;">${details}</pre>
    ${docUrl ? `<p><strong>Passport/ID Document:</strong> <a href="${docUrl}" style="color:#c5a059;" target="_blank">View File</a></p>` : ''}
    <hr style="border-color:#0b132b;margin:20px 0;">
    <a href="https://habacha-platform.vercel.app/admin.html" style="background:#c5a059;color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;border-radius:4px;">Open Admin Console</a>
  </div>`;
}
