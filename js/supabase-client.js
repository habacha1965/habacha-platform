
async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  const adminEmail = localStorage.getItem('admin_email_address');
  
  if (!apiKey) {
    console.error('❌ Resend API Key missing in LocalStorage');
    return;
  }

  try {
    const response = await fetch('/api/send-email', {
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
    
    const result = await response.json();
    console.log('📧 Email Sent:', result);
    return result;
  } catch (err) {
    console.error('❌ Email dispatch failed:', err);
  }
}

function getClientEmailHTML(name, category, details) {
  return `<div style="font-family:sans-serif; padding:20px; border:1px solid #c5a059;">
    <h2 style="color:#c5a059;">HABACHA CONFIRMATION</h2>
    <p>Dear ${name},</p>
    <p>We have received your request for <strong>${category}</strong>.</p>
    <p>Details: ${details}</p>
    <p>Our team will contact you shortly.</p>
  </div>`;
}

function getAdminEmailHTML(name, email, category, details) {
  return `<div style="font-family:sans-serif; padding:20px; background:#f4f4f4;">
    <h2>🚨 NEW INQUIRY</h2>
    <p><strong>Client:</strong> ${name} (${email})</p>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Details:</strong> ${details}</p>
    <a href="https://habacha-platform.vercel.app/admin.html">View in Admin Console</a>
  </div>`;
}
