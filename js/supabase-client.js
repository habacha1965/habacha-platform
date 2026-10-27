// HABACHA Platform - Live Supabase Client Engine
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
// Publieke Anon Key (geschikt voor frontend client-side REST calls)
let SUPABASE_ANON_KEY = window.localStorage.getItem('HABACHA_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXlydGNoZmJqcHdyYnZ6eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5MDQsImV4cCI6MjA1NTkzMDkwNH0.0-placeholder';

window.habachaDB = {
  setKey(key) {
    SUPABASE_ANON_KEY = key;
    window.localStorage.setItem('HABACHA_SUPABASE_KEY', key);
  },
  
  async submitInquiry(data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Inquiry submission error:', e);
      return false;
    }
  },

  async submitSupplier(data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.error('Supplier submission error:', e);
      return false;
    }
  },

  async fetchSuppliers() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Fetch suppliers error:', e);
      return [];
    }
  },

  async fetchInquiries() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Fetch inquiries error:', e);
      return [];
    }
  },

  async updateSupplierStatus(id, newStatus) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
      });
      return res.ok;
    } catch (e) {
      console.error('Update supplier status error:', e);
      return false;
    }
  }
};
