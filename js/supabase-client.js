// HABACHA Platform - Supabase Client Engine
const SUPABASE_URL = 'https://fwiyrtchfbjpwrbvzynb.supabase.co';
let SUPABASE_KEY = localStorage.getItem('HABACHA_SUPABASE_KEY') || '';

window.habachaDB = {
  url: SUPABASE_URL,
  
  getKey() {
    return localStorage.getItem('HABACHA_SUPABASE_KEY') || SUPABASE_KEY;
  },

  setKey(key) {
    if(key) {
      const cleanKey = key.trim();
      localStorage.setItem('HABACHA_SUPABASE_KEY', cleanKey);
      SUPABASE_KEY = cleanKey;
      return true;
    }
    return false;
  },

  async submitInquiry(data) {
    const key = this.getKey();
    if (!key) return { success: false, message: 'API Key not configured' };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      return { success: res.ok };
    } catch (e) {
      console.error('Inquiry submission error:', e);
      return { success: false, error: e.message };
    }
  },

  async submitSupplier(data) {
    const key = this.getKey();
    if (!key) return { success: false, message: 'API Key not configured' };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      return { success: res.ok };
    } catch (e) {
      console.error('Supplier submission error:', e);
      return { success: false, error: e.message };
    }
  },

  async fetchSuppliers() {
    const key = this.getKey();
    if (!key) return [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?select=*&order=created_at.desc`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
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
    const key = this.getKey();
    if (!key) return [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=*&order=created_at.desc`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Fetch inquiries error:', e);
      return [];
    }
  },

  async fetchAssets() {
    const key = this.getKey();
    if (!key) return [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/assets?select=*&order=created_at.desc`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Fetch assets error:', e);
      return [];
    }
  },

  async updateSupplierStatus(id, status) {
    const key = this.getKey();
    if (!key) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status, updated_at: new Date().toISOString() })
      });
      return res.ok;
    } catch (e) {
      console.error('Update supplier error:', e);
      return false;
    }
  }
};
