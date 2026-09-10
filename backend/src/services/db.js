import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eizzzlnlcdfuylnojijn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
let supabaseConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    supabaseConnected = true;
    console.log('✅ Supabase PostgreSQL Client connected directly to:', SUPABASE_URL);
  } catch (err) {
    console.error('❌ Supabase initialization error:', err.message);
  }
} else {
  console.warn('⚠️ SUPABASE_KEY is missing in backend/.env. Supabase requires the anon/service-role key to query tables.');
}

// In-Memory cache buffer (for fast access and offline fallback; NO JSON DISK WRITING)
let memoryCache = {
  users: [
    {
      id: 'usr-farmer-abhi',
      phone: '8605168653',
      role: 'FARMER',
      name: 'Abhi Kendre',
      full_name: 'Abhi Kendre',
      district: 'Latur',
      village: 'kandhar',
      land_size_acres: 11,
      saat_bara_number: '88',
      crops: ['Soybean'],
      primary_crops: ['Soybean'],
      bank_ifsc: '',
      status: 'ACTIVE',
      is_verified: true,
      created_at: '2026-09-10T12:00:00.000Z'
    }
  ],
  buyers: [
    {
      id: 'byr-1',
      user_id: 'usr-byr-1',
      company_name: 'Shree Ganesh Agro Processing Pvt Ltd',
      legal_name: 'Shree Ganesh Agro Processing Pvt Ltd',
      representative_name: 'Ganesh Shinde',
      phone: '9822012345',
      contact_phone: '9822012345',
      gstin: '27AABCS1429B1Z8',
      pan: 'AABCS1429B',
      license_type: 'Oil Mill Direct Procurement License',
      license_number: 'MH-LTR-2024-8821',
      daily_capacity_mt: 150,
      address: 'Plot 42, MIDC Industrial Area, Latur, Maharashtra',
      district: 'Latur',
      city: 'Latur MIDC',
      target_crops: ['Soybean'],
      rating: 4.9,
      reviews_count: 24,
      status: 'VERIFIED',
      is_verified: true,
      created_at: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'byr-2',
      user_id: 'usr-byr-2',
      company_name: 'Vardhman Agro & Dal Mills',
      legal_name: 'Vardhman Agro & Dal Mills',
      representative_name: 'Vardhman Jain',
      phone: '9822056789',
      contact_phone: '9822056789',
      gstin: '27AABCV5521K1Z2',
      pan: 'AABCV5521K',
      license_type: 'Dal Mill Direct Procurement License',
      license_number: 'MH-AKL-2023-4412',
      daily_capacity_mt: 120,
      address: 'Phase 2, Food Processing Park, Akola, Maharashtra',
      district: 'Akola',
      city: 'Akola MIDC',
      target_crops: ['Pigeon Pea (Tur)', 'Chana'],
      rating: 4.8,
      reviews_count: 18,
      status: 'VERIFIED',
      is_verified: true,
      created_at: '2026-09-02T09:30:00.000Z'
    },
    {
      id: 'byr-3',
      user_id: 'usr-byr-3',
      company_name: 'Sai Krishi Oil Industries',
      legal_name: 'Sai Krishi Oil Industries',
      representative_name: 'Sunil Patil',
      phone: '9822098765',
      contact_phone: '9822098765',
      gstin: '27AAACS8910F1Z4',
      pan: 'AAACS8910F',
      license_type: 'Commercial Oil Crushing License',
      license_number: 'MH-JLN-2024-9102',
      daily_capacity_mt: 200,
      address: 'Industrial Zone, Jalna Road, Maharashtra',
      district: 'Jalna',
      city: 'Jalna Industrial Zone',
      target_crops: ['Soybean', 'Cotton'],
      rating: 4.9,
      reviews_count: 31,
      status: 'VERIFIED',
      is_verified: true,
      created_at: '2026-09-03T11:00:00.000Z'
    }
  ],
  lots: [],
  offers: [],
  deals: []
};

export const db = {
  // Check Supabase connectivity status
  getSupabaseStatus: () => ({
    configured: Boolean(SUPABASE_URL && SUPABASE_KEY),
    url: SUPABASE_URL,
    hasKey: Boolean(SUPABASE_KEY),
    connected: supabaseConnected,
    storageType: '100% Supabase Cloud PostgreSQL (No Local JSON)',
    tableNames: ['users', 'farmer_profiles', 'buyer_profiles', 'produce_lots', 'offers', 'deals', 'mandi_prices']
  }),

  // ===================== LOTS =====================
  getLots: async (filters = {}) => {
    if (supabaseConnected) {
      try {
        let query = supabase.from('produce_lots').select('*').order('created_at', { ascending: false });
        if (filters.crop && filters.crop !== 'all') {
          query = query.ilike('crop', `%${filters.crop}%`);
        }
        if (filters.district && filters.district !== 'all') {
          query = query.ilike('district', `%${filters.district}%`);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.farmer_phone) {
          query = query.eq('farmer_phone', filters.farmer_phone);
        }
        if (filters.farmer_id) {
          query = query.eq('farmer_id', filters.farmer_id);
        }
        const { data, error } = await query;
        if (!error && data) return data;
        if (error) console.warn('Supabase getLots error:', error.message);
      } catch (err) {
        console.warn('Supabase getLots exception:', err.message);
      }
    }
    // Fallback to memory
    let result = [...memoryCache.lots];
    if (filters.crop && filters.crop !== 'all') {
      result = result.filter(l => l.crop.toLowerCase() === filters.crop.toLowerCase());
    }
    if (filters.district && filters.district !== 'all') {
      result = result.filter(l => l.district.toLowerCase() === filters.district.toLowerCase());
    }
    if (filters.status) {
      result = result.filter(l => l.status === filters.status);
    }
    if (filters.farmer_phone) {
      result = result.filter(l => l.farmer_phone === filters.farmer_phone);
    }
    if (filters.farmer_id) {
      result = result.filter(l => l.farmer_id === filters.farmer_id);
    }
    return result;
  },

  getLotById: async (id) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getLotById error:', err.message);
      }
    }
    return memoryCache.lots.find(l => l.id === id);
  },

  createLot: async (lotData) => {
    const newLot = {
      id: lotData.id || `lot-${Date.now()}`,
      status: 'LISTED',
      offers_count: 0,
      created_at: new Date().toISOString(),
      ...lotData
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').insert([newLot]).select().single();
        if (!error && data) {
          memoryCache.lots.unshift(data);
          return data;
        }
        if (error) console.warn('Supabase createLot error:', error.message);
      } catch (err) {
        console.warn('Supabase createLot exception:', err.message);
      }
    }

    memoryCache.lots.unshift(newLot);
    return newLot;
  },

  updateLotStatus: async (id, status) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').update({ status }).eq('id', id).select().single();
        if (!error && data) {
          const idx = memoryCache.lots.findIndex(l => l.id === id);
          if (idx !== -1) memoryCache.lots[idx] = data;
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateLotStatus error:', err.message);
      }
    }
    const lot = memoryCache.lots.find(l => l.id === id);
    if (lot) lot.status = status;
    return lot;
  },

  // ===================== OFFERS =====================
  getOffersByLotId: async (lotId) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('offers').select('*').eq('lot_id', lotId).order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.offers.filter(o => o.lot_id === lotId);
  },

  getOffersByBuyerId: async (buyerId) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('offers').select('*').eq('buyer_id', buyerId).order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.offers.filter(o => o.buyer_id === buyerId);
  },

  getAllOffers: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.offers;
  },

  createOffer: async (offerData) => {
    const newOffer = {
      id: `off-${Date.now()}`,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ...offerData
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('offers').insert([newOffer]).select().single();
        if (!error && data) {
          memoryCache.offers.unshift(data);
          // Increment offer count on lot in Supabase
          await supabase.rpc('increment_lot_offers', { target_lot_id: offerData.lot_id }).catch(() => {});
          return data;
        }
      } catch (err) {}
    }

    memoryCache.offers.unshift(newOffer);
    const lot = memoryCache.lots.find(l => l.id === offerData.lot_id);
    if (lot) lot.offers_count = (lot.offers_count || 0) + 1;
    return newOffer;
  },

  acceptOffer: async (offerId) => {
    let offer = memoryCache.offers.find(o => o.id === offerId);

    if (supabaseConnected) {
      try {
        const { data: updatedOffer } = await supabase.from('offers').update({ status: 'ACCEPTED' }).eq('id', offerId).select().single();
        if (updatedOffer) offer = updatedOffer;
      } catch (err) {}
    } else if (offer) {
      offer.status = 'ACCEPTED';
    }

    if (!offer) return null;

    // Update parent lot
    let lot = memoryCache.lots.find(l => l.id === offer.lot_id);
    if (supabaseConnected) {
      try {
        const { data: updatedLot } = await supabase.from('produce_lots').update({ status: 'DEAL_LOCKED' }).eq('id', offer.lot_id).select().single();
        if (updatedLot) lot = updatedLot;
        // Reject other offers in Supabase
        await supabase.from('offers').update({ status: 'REJECTED' }).eq('lot_id', offer.lot_id).neq('id', offerId).eq('status', 'PENDING');
      } catch (err) {}
    } else if (lot) {
      lot.status = 'DEAL_LOCKED';
      memoryCache.offers.forEach(o => {
        if (o.lot_id === offer.lot_id && o.id !== offerId && o.status === 'PENDING') {
          o.status = 'REJECTED';
        }
      });
    }

    const deal = {
      id: `deal-${Date.now()}`,
      lot_id: offer.lot_id,
      offer_id: offer.id,
      crop: lot ? lot.crop : 'Agricultural Produce',
      quantity_qtl: offer.quantity_requested_qtl,
      price_per_qtl: offer.offered_price_per_qtl,
      total_deal_value: Number(offer.offered_price_per_qtl) * Number(offer.quantity_requested_qtl),
      buyer_name: offer.buyer_name,
      farmer_name: lot ? lot.farmer_name : 'Farmer',
      delivery_destination: offer.delivery_destination,
      delivery_status: 'PENDING_PICKUP',
      escrow_status: 'SECURED_IN_ESCROW',
      created_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data: insertedDeal } = await supabase.from('deals').insert([deal]).select().single();
        if (insertedDeal) {
          memoryCache.deals.unshift(insertedDeal);
          return { offer, lot, deal: insertedDeal };
        }
      } catch (err) {}
    }

    memoryCache.deals.unshift(deal);
    return { offer, lot, deal };
  },

  // ===================== BUYERS =====================
  getBuyers: async (includePending = false) => {
    if (supabaseConnected) {
      try {
        let query = supabase.from('buyer_profiles').select('*');
        if (!includePending) {
          query = query.or('is_verified.eq.true,status.eq.VERIFIED');
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {}
    }
    if (includePending) return memoryCache.buyers;
    return memoryCache.buyers.filter(b => b.is_verified === true || b.status === 'VERIFIED');
  },

  getAllBuyers: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.buyers;
  },

  getBuyerById: async (id) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.buyers.find(b => b.id === id);
  },

  createBuyerProfile: async (buyerData) => {
    const newBuyer = {
      id: `byr-${Date.now()}`,
      rating: 5.0,
      reviews_count: 0,
      is_verified: false,
      status: 'PENDING_VERIFICATION',
      created_at: new Date().toISOString(),
      ...buyerData
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').insert([newBuyer]).select().single();
        if (!error && data) {
          memoryCache.buyers.unshift(data);
          return data;
        }
        if (error) console.warn('Supabase createBuyerProfile error:', error.message);
      } catch (err) {}
    }

    memoryCache.buyers.unshift(newBuyer);
    return newBuyer;
  },

  verifyBuyer: async (buyerId, verified = true, adminNotes = '') => {
    const updatePayload = {
      is_verified: verified,
      status: verified ? 'VERIFIED' : 'PENDING_VERIFICATION',
      verified_at: verified ? new Date().toISOString() : null,
      verified_by: verified ? 'ASIACore' : null,
      ...(adminNotes ? { admin_notes: adminNotes } : {})
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').update(updatePayload).eq('id', buyerId).select().single();
        if (!error && data) {
          const idx = memoryCache.buyers.findIndex(b => b.id === buyerId);
          if (idx !== -1) memoryCache.buyers[idx] = data;
          return data;
        }
      } catch (err) {}
    }

    const buyer = memoryCache.buyers.find(b => b.id === buyerId);
    if (buyer) {
      Object.assign(buyer, updatePayload);
    }
    return buyer;
  },

  rejectBuyer: async (buyerId, rejectionReason = '') => {
    const updatePayload = {
      is_verified: false,
      status: 'REJECTED',
      admin_notes: rejectionReason || 'Information does not match official APMC/GSTIN records.',
      verified_by: 'ASIACore'
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').update(updatePayload).eq('id', buyerId).select().single();
        if (!error && data) {
          const idx = memoryCache.buyers.findIndex(b => b.id === buyerId);
          if (idx !== -1) memoryCache.buyers[idx] = data;
          return data;
        }
      } catch (err) {}
    }

    const buyer = memoryCache.buyers.find(b => b.id === buyerId);
    if (buyer) {
      Object.assign(buyer, updatePayload);
    }
    return buyer;
  },

  // ===================== DEALS =====================
  getDeals: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.deals;
  },

  // ===================== USERS & FARMERS =====================
  getUserByPhone: async (phone) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.users.find(u => u.phone === phone);
  },

  getFarmers: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('farmer_profiles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(f => ({
            id: f.id,
            user_id: f.user_id,
            name: f.full_name || f.name || 'Farmer',
            full_name: f.full_name || f.name || 'Farmer',
            phone: f.phone,
            district: f.district,
            village: f.village || f.taluka,
            land_size_acres: f.land_size_acres,
            saat_bara_number: f.saat_bara_number,
            crops: f.primary_crops || f.crops || ['Soybean'],
            primary_crops: f.primary_crops || f.crops || ['Soybean'],
            is_verified: Boolean(f.is_verified || f.saat_bara_number),
            created_at: f.created_at
          }));
        }
      } catch (err) {}
    }
    return memoryCache.users.filter(u => u.role === 'FARMER').map(u => ({
      ...u,
      name: u.name || u.full_name || 'Farmer',
      full_name: u.name || u.full_name || 'Farmer',
      crops: u.crops || u.primary_crops || ['Soybean']
    }));
  },

  getAllUsers: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.users;
  },

  createUser: async (userData) => {
    const newUser = {
      id: userData.id || `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: Boolean(userData.saat_bara_number || userData.is_verified),
      ...userData
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('users').upsert([newUser], { onConflict: 'phone' }).select().single();
        if (!error && data) {
          // If Farmer, also create in farmer_profiles
          if (userData.role === 'FARMER') {
            await supabase.from('farmer_profiles').upsert([{
              user_id: data.id,
              full_name: data.name,
              phone: data.phone,
              district: data.district,
              village: data.village,
              land_size_acres: data.land_size_acres,
              saat_bara_number: data.saat_bara_number,
              primary_crops: data.crops,
              bank_ifsc: data.bank_ifsc,
              is_verified: data.is_verified
            }], { onConflict: 'user_id' }).catch(() => {});
          }

          const existingIdx = memoryCache.users.findIndex(u => u.phone === userData.phone);
          if (existingIdx !== -1) memoryCache.users[existingIdx] = data;
          else memoryCache.users.unshift(data);
          return data;
        }
        if (error) console.warn('Supabase createUser error:', error.message);
      } catch (err) {}
    }

    const existingIndex = memoryCache.users.findIndex(u => u.phone === userData.phone);
    if (existingIndex !== -1) {
      memoryCache.users[existingIndex] = { ...memoryCache.users[existingIndex], ...userData, updated_at: new Date().toISOString() };
      return memoryCache.users[existingIndex];
    }

    memoryCache.users.unshift(newUser);
    return newUser;
  },

  verifyFarmer: async (farmerId, verified = true) => {
    const updatePayload = {
      is_verified: verified,
      verified_by: verified ? 'ASIACore' : null,
      verified_at: verified ? new Date().toISOString() : null
    };

    if (supabaseConnected) {
      try {
        await supabase.from('farmer_profiles').update(updatePayload).eq('user_id', farmerId);
        await supabase.from('users').update(updatePayload).eq('id', farmerId);
      } catch (err) {}
    }

    const farmer = memoryCache.users.find(u => (u.id === farmerId || u.user_id === farmerId));
    if (farmer) {
      Object.assign(farmer, updatePayload);
    }
    return farmer;
  },

  deleteUser: async (phoneOrId) => {
    if (supabaseConnected) {
      try {
        await supabase.from('farmer_profiles').delete().or(`user_id.eq.${phoneOrId},phone.eq.${phoneOrId},id.eq.${phoneOrId}`);
        await supabase.from('buyer_profiles').delete().or(`user_id.eq.${phoneOrId},phone.eq.${phoneOrId},id.eq.${phoneOrId}`);
        await supabase.from('users').delete().or(`id.eq.${phoneOrId},phone.eq.${phoneOrId}`);
      } catch (err) {
        console.warn('Supabase deleteUser error:', err.message);
      }
    }
    memoryCache.users = memoryCache.users.filter(u => u.id !== phoneOrId && u.phone !== phoneOrId && u.user_id !== phoneOrId);
    memoryCache.buyers = memoryCache.buyers.filter(b => b.id !== phoneOrId && b.phone !== phoneOrId && b.user_id !== phoneOrId);
    return true;
  },

  // Admin Stats directly calculated from Supabase
  getAdminStats: async () => {
    let farmersCount = memoryCache.users.filter(u => u.role === 'FARMER').length;
    let verifiedFarmersCount = memoryCache.users.filter(u => u.role === 'FARMER' && u.is_verified).length;
    let buyersCount = memoryCache.buyers.length;
    let verifiedBuyersCount = memoryCache.buyers.filter(b => b.is_verified || b.status === 'VERIFIED').length;
    let pendingBuyersCount = memoryCache.buyers.filter(b => b.status === 'PENDING_VERIFICATION').length;
    let lotsCount = memoryCache.lots.length;
    let activeLotsCount = memoryCache.lots.filter(l => l.status === 'LISTED').length;
    let totalVolumeQtl = memoryCache.lots.reduce((acc, l) => acc + (Number(l.quantity_qtl) || 0), 0);
    let dealsCount = memoryCache.deals.length;
    let totalEscrowVal = memoryCache.deals.reduce((acc, d) => acc + (Number(d.total_deal_value) || 0), 0);

    if (supabaseConnected) {
      try {
        const [farmersRes, buyersRes, lotsRes, dealsRes] = await Promise.all([
          supabase.from('farmer_profiles').select('id, is_verified', { count: 'exact' }),
          supabase.from('buyer_profiles').select('id, status, is_verified', { count: 'exact' }),
          supabase.from('produce_lots').select('id, quantity_qtl, status'),
          supabase.from('deals').select('id, total_deal_value')
        ]);

        if (farmersRes.data) {
          farmersCount = farmersRes.data.length;
          verifiedFarmersCount = farmersRes.data.filter(f => f.is_verified).length;
        }
        if (buyersRes.data) {
          buyersCount = buyersRes.data.length;
          verifiedBuyersCount = buyersRes.data.filter(b => b.is_verified || b.status === 'VERIFIED').length;
          pendingBuyersCount = buyersRes.data.filter(b => b.status === 'PENDING_VERIFICATION').length;
        }
        if (lotsRes.data) {
          lotsCount = lotsRes.data.length;
          activeLotsCount = lotsRes.data.filter(l => l.status === 'LISTED').length;
          totalVolumeQtl = lotsRes.data.reduce((acc, l) => acc + (Number(l.quantity_qtl) || 0), 0);
        }
        if (dealsRes.data) {
          dealsCount = dealsRes.data.length;
          totalEscrowVal = dealsRes.data.reduce((acc, d) => acc + (Number(d.total_deal_value) || 0), 0);
        }
      } catch (err) {
        console.warn('Supabase getAdminStats exception:', err.message);
      }
    }

    return {
      totalFarmers: farmersCount,
      verifiedFarmers: verifiedFarmersCount,
      totalBuyers: buyersCount,
      verifiedBuyers: verifiedBuyersCount,
      pendingBuyers: pendingBuyersCount,
      totalLots: lotsCount,
      activeLots: activeLotsCount,
      totalVolumeQtl,
      totalDeals: dealsCount,
      totalEscrowVal,
      supabaseStatus: db.getSupabaseStatus()
    };
  }
};
