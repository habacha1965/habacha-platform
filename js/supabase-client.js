// HABACHA Platform - Supabase Live Sync Engine
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';

function getApiKey() {
  return localStorage.getItem('HABACHA_SUPABASE_KEY') || '';
}

window.habachaDB = {
  url: SUPABASE_URL,
  
  setApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('HABACHA_SUPABASE_KEY', key.trim());
      return true;
    }
    return false;
  },

  async submitInquiry(payload) {
    const key = getApiKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      return { success: res.ok, status: res.status };
    } catch (err) {
      console.error('Inquiry submission error:', err);
      return { success: false, error: err.message };
    }
  },

  async submitSupplier(payload) {
    const key = getApiKey();
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      return { success: res.ok, status: res.status };
    } catch (err) {
      console.error('Supplier submission error:', err);
      return { success: false, error: err.message };
    }
  },

  async fetchSuppliers() {
    const key = getApiKey();
    if (!key) return [];
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
    const key = getApiKey();
    if (!key) return [];
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
    const key = getApiKey();
    if (!key) return false;
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
