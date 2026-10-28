// HABACHA DYNAMIC LOGISTICS ENGINE
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjgwMDAsImV4cCI6MjA1NTY0NDAwMH0.79V4d8rG1g';

async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    console.warn("⚠️ API Key missing in LocalStorage.");
    return { error: 'No API Key' };
  }
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: apiKey.trim(), to: toEmail, subject, html: htmlContent })
    });
    return await response.json();
  } catch (err) {
    console.error("❌ Email Engine Error:", err);
    return null;
  }
}

function generateClientEmail(name, cat, detailsHtml) {
  return `<div style="font-family:Arial,sans-serif;padding:30px;background-color:#0b132b;color:#ffffff;border-radius:10px;border:1px solid #c5a059;">
    <h1 style="color:#c5a059;letter-spacing:2px;margin-top:0;">HABACHA PLATFORM</h1>
    <p style="font-size:16px;">Dear <strong>${name}</strong>,</p>
    <p>Thank you for submitting your custom charter & booking manifest for <strong>${cat}</strong>.</p>
    <div style="background-color:#1c2541;padding:20px;border-left:4px solid #c5a059;margin:20px 0;color:#e0e0e0;">
      <h3 style="color:#c5a059;margin-top:0;">Logistics & Service Manifest:</h3>
      ${detailsHtml}
    </div>
    <p>Our dedicated fleet operations desk is reviewing your requirements and will contact you shortly with formal flight/vessel/property clearance.</p>
    <hr style="border-color:#1c2541;margin:20px 0;">
    <p style="font-size:12px;color:#8d99ae;">HABACHA Executive Fleet Exchange</p>
  </div>`;
}

function generateAdminEmail(name, email, phone, cat, assetTitle, detailsHtml) {
  return `<div style="font-family:Arial,sans-serif;padding:30px;background-color:#1c2541;color:#ffffff;border-radius:10px;">
    <h2 style="color:#c5a059;margin-top:0;">🚨 New Specific Booking Inquiry</h2>
    <p><strong>Asset Requested:</strong> ${assetTitle} (${cat})</p>
    <p><strong>Client Name:</strong> ${name}</p>
    <p><strong>Client Email:</strong> ${email}</p>
    <p><strong>Client Phone/WhatsApp:</strong> ${phone}</p>
    <hr style="border-color:#0b132b;margin:15px 0;">
    <h3 style="color:#c5a059;">Detailed Manifest & Requirements:</h3>
    <div style="background-color:#0b132b;padding:15px;border-radius:5px;color:#fff;">
      ${detailsHtml}
    </div>
    <hr style="border-color:#0b132b;margin:20px 0;">
    <a href="https://habacha-platform.vercel.app/admin.html" style="background-color:#c5a059;color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;border-radius:5px;display:inline-block;">Open Admin Console</a>
  </div>`;
}