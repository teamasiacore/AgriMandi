import axios from 'axios';
import supabase from './supabaseClient';

// In production (Vercel) or when accessing via domain, use relative '/api'
// In local dev, Vite proxies '/api' directly to http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

export const api = {
  // Mandi Data
  getLiveRates: (params) => client.get('/mandi/live', { params }).then(res => res.data),
  getMandiHistory: (commodity, market) => client.get('/mandi/history', { params: { commodity, market } }).then(res => res.data),
  getTicker: () => client.get('/mandi/ticker').then(res => res.data),
  getSummary: () => client.get('/mandi/summary').then(res => res.data),

  // Net Realization
  calculateRealization: (payload) => client.post('/realization/discover', payload).then(res => res.data),

  // Lots Marketplace
  getLots: (params) => client.get('/lots', { params }).then(res => res.data),
  getLotById: (id) => client.get(`/lots/${id}`).then(res => res.data),
  createLot: (data) => client.post('/lots', data).then(res => res.data),

  // Bids & Offers
  getOffers: (params) => client.get('/offers', { params }).then(res => res.data),
  createOffer: (data) => client.post('/offers', data).then(res => res.data),
  acceptOffer: (id) => client.post(`/offers/${id}/accept`).then(res => res.data),

  // Buyers & Deals
  getBuyers: () => client.get('/buyers').then(res => res.data),
  getDeals: (params) => client.get('/deals', { params }).then(res => res.data),

  // Transporters & Logistics
  getTransporters: (params) => client.get('/transporters', { params }).then(res => res.data),
  getAvailableTrips: (params) => client.get('/transporters/available-trips', { params }).then(res => res.data),
  getTransporterById: (id) => client.get(`/transporters/${id}`).then(res => res.data),
  updateTransporterStatus: (id, is_available) => client.patch(`/transporters/${id}/status`, { is_available }).then(res => res.data),
  acceptTrip: (data) => client.post('/transporters/accept-trip', data).then(res => res.data),
  getTransporterTrips: (id) => client.get(`/transporters/${id}/trips`).then(res => res.data),

  // Auth
  login: (data) => client.post('/auth/login', data).then(res => res.data),
  register: (data) => client.post('/auth/register', data).then(res => res.data),

  // SuperAdmin Desk (ASIACore / Satya123)
  adminLogin: (data) => client.post('/admin/login', data).then(res => res.data),
  getAdminStats: () => client.get('/admin/stats').then(res => res.data),
  getAdminBuyers: () => client.get('/admin/buyers').then(res => res.data),
  verifyBuyer: (id, data = {}) => client.post(`/admin/buyers/${id}/verify`, data).then(res => res.data),
  rejectBuyer: (id, data = {}) => client.post(`/admin/buyers/${id}/reject`, data).then(res => res.data),
  deleteBuyer: (id) => client.delete(`/admin/buyers/${id}`).then(res => res.data),
  getAdminFarmers: () => client.get('/admin/farmers').then(res => res.data),
  verifyFarmer: (id, data = {}) => client.post(`/admin/farmers/${id}/verify`, data).then(res => res.data),
  deleteFarmer: (id) => client.delete(`/admin/farmers/${id}`).then(res => res.data),
  getAdminLots: () => client.get('/admin/lots').then(res => res.data),
  getAdminDeals: () => client.get('/admin/deals').then(res => res.data),
  getSupabaseStatus: () => client.get('/admin/supabase-status').then(res => res.data)
};

export default api;

