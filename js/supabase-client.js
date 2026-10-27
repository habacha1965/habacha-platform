// HABACHA Platform - Enterprise Supabase Live Client & Storage Engine
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';

let ACTIVE_KEY = localStorage.getItem('HABACHA_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5MDQsImV4cCI6MjA1NTkzMDkwNH0.0-placeholder';

window.habachaDB = {
  url: SUPABASE_URL,
  
  getKey() {
    return localStorage.getItem('HABACHA_SUPABASE_KEY') || ACTIVE_KEY;
  },

  setApiKey(key) {
    if (key && key.trim()) {
      const cleanKey = key.trim();
      localStorage.setItem('HABACHA_SUPABASE_KEY', cleanKey);
      ACTIVE_KEY = cleanKey;
      return true;
    }
    return false;
  },

  // Upload file directly to Supabase Storage Bucket
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
        console.error('Upload HTTP Error:', res.status);
        return null;
      }
    } catch (err) {
      console.error('File Upload Exception:', err);
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
          message: (data && (data.message || data.hint || data.details)) || res.statusText || 'Server HTTP ' + res.status
        };
      }
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
          message: (data && (data.message || data.hint || data.details)) || res.statusText || 'Server HTTP ' + res.status
        };
      }
      return { success: true, data: data };
    } catch (err) {
      return { success: false, message: err.message };
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
