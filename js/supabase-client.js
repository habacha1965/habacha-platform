// HABACHA MASTER ENGINE
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjgwMDAsImV4cCI6MjA1NTY0NDAwMH0.79V4d8rG1g';

async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    console.warn("⚠️ API Key missing. Skipping email dispatch.");
    return { error: 'No API Key' };
  }
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, to: toEmail, subject, html: htmlContent })
    });
    const result = await response.json();
    console.log("📧 Email Engine Response:", result);
    return result;
  } catch (err) {
    console.error("❌ Email Engine Error:", err);
    return null;
  }
}

function generateClientEmail(name, cat, details) {
  return `<div style="font-family:Arial,sans-serif;padding:30px;background-color:#0b132b;color:#ffffff;border-radius:10px;border:1px solid #c5a059;">
    <h1 style="color:#c5a059;letter-spacing:2px;">HABACHA</h1>
    <p style="font-size:16px;">Dear <strong>${name}</strong>,</p>
    <p>Thank you for submitting your manifest for <strong>${cat}</strong>.</p>
    <div style="background-color:#1c2541;padding:20px;border-left:4px solid #c5a059;margin:20px 0;">
      <pre style="color:#e0e0e0;font-family:inherit;margin:0;white-space:pre-wrap;">${details}</pre>
    </div>
    <p>Our fleet operations team will contact you shortly.</p>
  </div>`;
}

function generateAdminEmail(name, email, cat, details) {
  return `<div style="font-family:Arial,sans-serif;padding:30px;background-color:#1c2541;color:#ffffff;border-radius:10px;">
    <h2 style="color:#c5a059;margin-top:0;">🚨 New System Inquiry</h2>
    <p><strong>Client:</strong> ${name} (${email})</p>
    <p><strong>Category:</strong> ${cat}</p>
    <pre style="background-color:#0b132b;color:#c5a059;padding:15px;border-radius:5px;white-space:pre-wrap;">${details}</pre>
    <hr style="border-color:#0b132b;margin:20px 0;">
    <a href="https://habacha-platform.vercel.app/admin.html" style="background-color:#c5a059;color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;border-radius:5px;">Open Console</a>
  </div>`;
}
