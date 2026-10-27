// HABACHA Platform - Supabase Live Engine & Diagnostics
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';

function getApiKey() {
  return localStorage.getItem('HABACHA_SUPABASE_KEY') || '';
}

window.habachaDB = {
  url: SUPABASE_URL,
  
  setApiKey(key) {
    if (key && key.trim()) {
      const cleanKey = key.trim();
      localStorage.setItem('HABACHA_SUPABASE_KEY', cleanKey);
      return true;
    }
    return false;
  },

  async submitInquiry(payload) {
    const key = getApiKey();
    if (!key) {
      return { success: false, message: 'Geen API Key ingesteld. Vul de key in op /admin.html' };
    }
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
      
      const responseData = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { 
          success: false, 
          status: res.status, 
          message: responseData.message || responseData.hint || responseData.details || res.statusText 
        };
      }
      return { success: true, data: responseData };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async submitSupplier(payload) {
    const key = getApiKey();
    if (!key) {
      return { success: false, message: 'Geen API Key ingesteld. Vul de key in op /admin.html' };
    }
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
      
      const responseData = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { 
          success: false, 
          status: res.status, 
          message: responseData.message || responseData.hint || responseData.details || res.statusText 
        };
      }
      return { success: true, data: responseData };
    } catch (err) {
      return { success: false, message: err.message };
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
