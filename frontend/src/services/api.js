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
  // Mandi Data & Market Reference (AG-009)
  getLiveRates: (params) => client.get('/mandi/live', { params }).then(res => res.data),
  getReferencePrices: (params) => client.get('/mandi/reference-prices', { params }).then(res => res.data),
  getCommodities: () => client.get('/mandi/commodities').then(res => res.data),
  getMarkets: () => client.get('/mandi/markets').then(res => res.data),
  getMandiHistory: (commodity, market) => client.get('/mandi/history', { params: { commodity, market } }).then(res => res.data),
  getTicker: () => client.get('/mandi/ticker').then(res => res.data),
  getSummary: () => client.get('/mandi/summary').then(res => res.data),

  // Net Realization
  calculateRealization: (payload) => client.post('/realization/discover', payload).then(res => res.data),

  // Lots Marketplace
  // Lots Marketplace & Lifecycle (AG-010)
  getLots: (params) => client.get('/lots', { params }).then(res => res.data),
  getLotById: (id) => client.get(`/lots/${id}`).then(res => res.data),
  createLot: (data) => client.post('/lots', data).then(res => res.data),
  updateLot: (id, data) => client.put(`/lots/${id}`, data).then(res => res.data),
  publishLot: (id) => client.post(`/lots/${id}/publish`).then(res => res.data),
  cancelLot: (id, data = {}) => client.post(`/lots/${id}/cancel`, data).then(res => res.data),
  deleteLot: (id) => client.delete(`/lots/${id}`).then(res => res.data),

  // Bids & Offers
  getOffers: (params) => client.get('/offers', { params }).then(res => res.data),
  createOffer: (data) => client.post('/offers', data).then(res => res.data),
  acceptOffer: (id) => client.post(`/offers/${id}/accept`).then(res => res.data),

  // Buyers & Deals
  getBuyers: () => client.get('/buyers').then(res => res.data),
  getDeals: (params) => client.get('/deals', { params }).then(res => res.data),
  getDealById: (id) => client.get(`/deals/${id}`).then(res => res.data),
  recordWeighmentAssay: (dealId, data) => client.post(`/deals/${dealId}/weighment-assay`, data).then(res => res.data),
  getWeighmentAssay: (dealId) => client.get(`/deals/${dealId}/weighment-assay`).then(res => res.data),
  settleDealEscrow: (dealId, data = {}) => client.post(`/deals/${dealId}/settle`, data).then(res => res.data),
  getSettlementInvoice: (dealId) => client.get(`/deals/${dealId}/settlement-invoice`).then(res => res.data),

  // Transporters & Logistics
  getTransporters: (params) => client.get('/transporters', { params }).then(res => res.data),
  getAvailableTrips: (params) => client.get('/transporters/available-trips', { params }).then(res => res.data),
  getTransporterById: (id) => client.get(`/transporters/${id}`).then(res => res.data),
  updateTransporterStatus: (id, is_available) => client.patch(`/transporters/${id}/status`, { is_available }).then(res => res.data),
  acceptTrip: (data) => client.post('/transporters/accept-trip', data).then(res => res.data),
  dispatchDeal: (data) => client.post('/transporters/dispatch-deal', data).then(res => res.data),
  updateTripMilestone: (dealId, data) => client.patch(`/transporters/trips/${dealId}/milestone`, data).then(res => res.data),
  getTransporterTrips: (id) => client.get(`/transporters/${id}/trips`).then(res => res.data),

  // Auth & Profile
  sendOtp: (data) => client.post('/auth/send-otp', data).then(res => res.data),
  login: (data) => client.post('/auth/login', data).then(res => res.data),
  register: (data) => client.post('/auth/register', data).then(res => res.data),
  getFarmerProfile: (id) => client.get(`/auth/farmer/profile/${id}`).then(res => res.data),
  updateFarmerProfile: (id, data) => client.put(`/auth/farmer/profile/${id}`, data).then(res => res.data),

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
  getAdminTransporters: () => client.get('/admin/transporters').then(res => res.data),
  verifyTransporter: (id, data = {}) => client.post(`/admin/transporters/${id}/verify`, data).then(res => res.data),
  rejectTransporter: (id, data = {}) => client.post(`/admin/transporters/${id}/reject`, data).then(res => res.data),
  getSupabaseStatus: () => client.get('/admin/supabase-status').then(res => res.data),

  // FPO Aggregation Desk
  getFpoProfile: (identifier) => client.get(`/fpo/profile/${identifier}`).then(res => res.data),
  getFpoEligibleLots: (params) => client.get('/fpo/eligible-lots', { params }).then(res => res.data),
  poolFpoLots: (data) => client.post('/fpo/pool', data).then(res => res.data),
  getFpoBulkLots: (fpoId) => client.get('/fpo/bulk-lots', { params: { fpo_id: fpoId } }).then(res => res.data),
  getFpoDeals: (fpoId) => client.get('/fpo/deals', { params: { fpo_id: fpoId } }).then(res => res.data),
  getFpoPayoutSplit: (dealId) => client.get(`/fpo/deals/${dealId}/payout-split`).then(res => res.data)
};

export default api;

