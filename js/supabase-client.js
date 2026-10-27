// HABACHA Platform - Supabase & Resend Email Integration Engine
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';

let ACTIVE_KEY = localStorage.getItem('HABACHA_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5MDQsImV4cCI6MjA1NTkzMDkwNH0.0-placeholder';

window.habachaDB = {
  url: SUPABASE_URL,
  
  getKey() {
    return localStorage.getItem('HABACHA_SUPABASE_KEY') || ACTIVE_KEY;
  },

  setApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('HABACHA_SUPABASE_KEY', key.trim());
      ACTIVE_KEY = key.trim();
      return true;
    }
    return false;
  },

  // Resend API Helpers
  getResendKey() {
    return localStorage.getItem('HABACHA_RESEND_KEY') || '';
  },

  setResendKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('HABACHA_RESEND_KEY', key.trim());
      return true;
    }
    return false;
  },

  getAdminEmail() {
    return localStorage.getItem('HABACHA_ADMIN_EMAIL') || '';
  },

  setAdminEmail(email) {
    if (email && email.trim()) {
      localStorage.setItem('HABACHA_ADMIN_EMAIL', email.trim());
      return true;
    }
    return false;
  },

  // Direct Resend API Dispatcher
  async sendResendEmail(toEmail, subject, htmlContent) {
    const resendKey = this.getResendKey();
    if (!resendKey) {
      console.warn('Resend API key not set. Email dispatch skipped.');
      return false;
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'HABACHA Platform <onboarding@resend.dev>',
          to: [toEmail],
          subject: subject,
          html: htmlContent
        })
      });
      return res.ok;
    } catch (err) {
      console.error('Resend Email Dispatch Error:', err);
      return false;
    }
  },

  // Supabase Storage Upload
  async uploadFile(bucket, file) {
    const key = this.getKey();
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${cleanFileName}`;

    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (res.ok) {
        return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  },

  async submitInquiry(payload) {
    const key = this.getKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      
      let data = null;
      try { data = await res.json(); } catch(e) {}
      
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: (data && (data.message || data.hint || data.details)) || res.statusText
        };
      }

      // Dispatch Emails via Resend if Key is Present
      this.dispatchInquiryEmails(payload);

      return { success: true, data: data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async submitSupplier(payload) {
    const key = this.getKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      
      let data = null;
      try { data = await res.json(); } catch(e) {}
      
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: (data && (data.message || data.hint || data.details)) || res.statusText
        };
      }

      // Dispatch Supplier Emails via Resend if Key is Present
      this.dispatchSupplierEmails(payload);

      return { success: true, data: data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Automatic HTML Email Generators
  async dispatchInquiryEmails(p) {
    const adminEmail = this.getAdminEmail();

    // 1. Client Confirmation HTML
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0F172A; padding: 40px 20px; color: #fff;">
        <div style="max-width: 600px; margin: 0 auto; background: #1E293B; border: 1px solid #C5A880; border-radius: 12px; padding: 30px;">
          <h1 style="color: #C5A880; text-align: center; margin-top: 0; letter-spacing: 2px;">HABACHA</h1>
          <hr style="border: 0; border-top: 1px solid rgba(197,168,128,0.3); margin: 20px 0;">
          <h2 style="color: #22C55E;">Booking Request Received</h2>
          <p style="color: #94A3B8; font-size: 16px;">Dear ${p.client_name},</p>
          <p style="color: #CBD5E1; line-height: 1.6;">Thank you for submitting your booking request on the HABACHA exchange. Our fleet management team is currently reviewing your schedule and manifest.</p>
          <div style="background: #0F172A; padding: 20px; border-radius: 8px; border-left: 4px solid #C5A880; margin: 20px 0;">
            <p style="margin: 5px 0; color: #fff;"><strong>Client:</strong> ${p.client_name}</p>
            <p style="margin: 5px 0; color: #fff;"><strong>Email:</strong> ${p.client_email}</p>
            <p style="margin: 5px 0; color: #fff;"><strong>Details & Total:</strong> ${p.message}</p>
            ${p.start_date ? `<p style="margin: 5px 0; color: #94A3B8;"><strong>Start Date:</strong> ${p.start_date}</p>` : ''}
            ${p.end_date ? `<p style="margin: 5px 0; color: #94A3B8;"><strong>End Date:</strong> ${p.end_date}</p>` : ''}
          </div>
          <p style="color: #94A3B8; font-size: 14px;">An account manager will contact you via email or phone shortly to finalize confirmation.</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
          <p style="text-align: center; color: #64748B; font-size: 12px;">&copy; 2026 HABACHA Platform. Universal Exchange for Asset Charters, Rentals & Leasing.</p>
        </div>
      </div>
    `;
    await this.sendResendEmail(p.client_email, 'Booking Request Received - HABACHA Platform', clientHtml);

    // 2. Admin Notification Email
    if (adminEmail) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #020617; padding: 30px; color: #fff;">
          <div style="max-width: 600px; margin: 0 auto; background: #0F172A; border: 1px solid #22C55E; border-radius: 12px; padding: 25px;">
            <h2 style="color: #22C55E; margin-top: 0;">🚨 NEW CLIENT INQUIRY RECEIVED</h2>
            <p><strong>Client Name:</strong> ${p.client_name}</p>
            <p><strong>Email:</strong> ${p.client_email}</p>
            <p><strong>Phone:</strong> ${p.client_phone}</p>
            <p><strong>Company:</strong> ${p.company_name || 'Individual'}</p>
            <p><strong>Details / Price:</strong> ${p.message}</p>
            <p><a href="https://habacha-platform.vercel.app/admin.html" style="color: #38BDF8; font-weight: bold;">Open Admin Console</a></p>
          </div>
        </div>
      `;
      await this.sendResendEmail(adminEmail, `🚨 NEW INQUIRY: ${p.client_name}`, adminHtml);
    }
  },

  async dispatchSupplierEmails(p) {
    const adminEmail = this.getAdminEmail();

    // 1. Supplier Confirmation
    const supplierHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0F172A; padding: 40px 20px; color: #fff;">
        <div style="max-width: 600px; margin: 0 auto; background: #1E293B; border: 1px solid #C5A880; border-radius: 12px; padding: 30px;">
          <h1 style="color: #C5A880; text-align: center; margin-top: 0;">HABACHA</h1>
          <h2 style="color: #38BDF8;">Supplier Registration Received</h2>
          <p style="color: #CBD5E1;">Dear ${p.contact_name} (${p.company_name}),</p>
          <p style="color: #94A3B8;">Thank you for registering your asset/fleet on the HABACHA exchange. Our compliance team is verifying your registration and documentation.</p>
          <p style="color: #94A3B8;">Status: <strong>Under Verification</strong></p>
        </div>
      </div>
    `;
    await this.sendResendEmail(p.email, 'Supplier Application Received - HABACHA Platform', supplierHtml);

    // 2. Admin Notification
    if (adminEmail) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #020617; padding: 30px; color: #fff;">
          <div style="max-width: 600px; margin: 0 auto; background: #0F172A; border: 1px solid #38BDF8; border-radius: 12px; padding: 25px;">
            <h2 style="color: #38BDF8; margin-top: 0;">🏢 NEW SUPPLIER APPLICATION</h2>
            <p><strong>Company:</strong> ${p.company_name}</p>
            <p><strong>Contact:</strong> ${p.contact_name}</p>
            <p><strong>Email:</strong> ${p.email}</p>
            <p><strong>Phone:</strong> ${p.phone}</p>
            <p><a href="https://habacha-platform.vercel.app/admin.html" style="color: #C5A880; font-weight: bold;">Review in Admin Console</a></p>
          </div>
        </div>
      `;
      await this.sendResendEmail(adminEmail, `🏢 NEW SUPPLIER: ${p.company_name}`, adminHtml);
    }
  },

  async fetchSuppliers() {
    const key = this.getKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?select=*&order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async fetchInquiries() {
    const key = this.getKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=*&order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async updateSupplierStatus(id, newStatus) {
    const key = this.getKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
};
