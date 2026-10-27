// HABACHA Platform Client & Resend Email Engine

async function dispatchResendEmail(toEmail, subject, htmlContent) {
  const apiKey = localStorage.getItem('resend_api_key');
  if (!apiKey) {
    console.warn('⚠️ No Resend API key found in localStorage. Admin needs to set it in admin.html');
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
    const result = await resp.json();
    console.log('📧 Resend Email Result:', result);
    return result;
  } catch (err) {
    console.error('❌ Failed to dispatch email:', err);
    return null;
  }
}

// Client Confirmation HTML Template Generator
function getClientEmailHTML(clientName, category, details) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0b132b; color: #ffffff; padding: 40px; border-radius: 8px;">
      <h1 style="color: #c5a059; text-transform: uppercase; letter-spacing: 2px;">HABACHA PLATFORM</h1>
      <p style="font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
      <p>Thank you for submitting your booking / charter manifest for <strong>${category}</strong>.</p>
      <div style="background-color: #1c2541; padding: 20px; border-left: 4px solid #c5a059; margin: 20px 0;">
        <p style="margin: 0; color: #c5a059; font-weight: bold;">Request Summary:</p>
        <p style="margin: 5px 0 0 0; color: #e0e0e0;">${details}</p>
      </div>
      <p>Our fleet management team is evaluating your specifications. You will receive official confirmation shortly.</p>
      <hr style="border-color: #1c2541; margin: 30px 0;">
      <p style="font-size: 12px; color: #8d99ae;">HABACHA Private Fleet & Executive Charter Exchange</p>
    </div>
  `;
}

// Admin Alert HTML Template Generator
function getAdminEmailHTML(clientName, clientEmail, category, details, docUrl) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #1c2541; color: #ffffff; padding: 40px; border-radius: 8px;">
      <h2 style="color: #c5a059;">🚨 New Inquiry Received</h2>
      <p><strong>Client:</strong> ${clientName} (${clientEmail})</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Details:</strong> ${details}</p>
      ${docUrl ? `<p><strong>Uploaded ID Document:</strong> <a href="${docUrl}" style="color: #c5a059;" target="_blank">View Document</a></p>` : ''}
      <hr style="border-color: #0b132b; margin: 20px 0;">
      <a href="https://habacha-platform.vercel.app/admin.html" style="background-color: #c5a059; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Open Admin Console</a>
    </div>
  `;
}