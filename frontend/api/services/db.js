import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase Configuration (Fresh project: lqoychozoysmxibhcmuf)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lqoychozoysmxibhcmuf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3ljaG96b3lzbXhpYmhjbXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTc1OTksImV4cCI6MjEwNTI5MzU5OX0.tcdf86elJblU81Y9HvPfImKfsZJxCSDYYoU0kC_O6xk';


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
    },
    {
      id: 'usr-fpo-sahyadri',
      phone: '9822012345',
      role: 'FPO',
      name: 'Kailasrao Shinde',
      full_name: 'Kailasrao Shinde',
      company_name: 'Sahyadri Farmers Producer Co. Ltd.',
      fpo_name: 'Sahyadri Farmers Producer Co. Ltd.',
      registration_no: 'U01409MH2024PTC392811',
      district: 'Latur',
      taluka: 'Ausa',
      village: 'Ausa',
      members_count: 120,
      warehouse_location: 'Plot No. 12, Agro Industrial Park, MIDC Ausa, Latur',
      crops: ['Soybean', 'Cotton', 'Chana'],
      bank_ifsc: 'MAHB0000214',
      bank_account: '60129983412',
      status: 'ACTIVE',
      is_verified: true,
      created_at: '2026-09-15T10:00:00.000Z'
    }
  ],
  fpos: [
    {
      id: 'fpo-sahyadri-01',
      user_id: 'usr-fpo-sahyadri',
      fpo_name: 'Sahyadri Farmers Producer Co. Ltd.',
      company_name: 'Sahyadri Farmers Producer Co. Ltd.',
      registration_no: 'U01409MH2024PTC392811',
      contact_person: 'Kailasrao Shinde',
      phone: '9822012345',
      district: 'Latur',
      taluka: 'Ausa',
      members_count: 120,
      warehouse_location: 'Plot No. 12, Agro Industrial Park, MIDC Ausa, Latur',
      primary_crops: ['Soybean', 'Cotton', 'Chana'],
      bank_ifsc: 'MAHB0000214',
      bank_account: '60129983412',
      is_verified: true,
      created_at: '2026-09-15T10:00:00.000Z'
    }
  ],
  buyers: [],
  lots: [],
  offers: [],
  deals: [],
  transporters: [
    {
      id: 'TRP-MH-201',
      owner_name: 'Pandurang Shinde',
      driver_name: 'Pandurang Shinde',
      phone: '+91 98221 44556',
      truck_type: 'Eicher 17ft (6 MT)',
      vehicle_type: 'Eicher 17ft (6 MT)',
      capacity_mt: 6,
      vehicle_number: 'MH-24-AG-7821',
      base_district: 'Latur',
      rate_per_km: 38,
      rating: 4.9,
      trips_completed: 142,
      is_verified: true,
      is_available: true
    },
    {
      id: 'TRP-MH-202',
      owner_name: 'Balasaheb Patil',
      driver_name: 'Balasaheb Patil',
      phone: '+91 98224 88712',
      truck_type: 'Bolero Maxi Truck (1.5 MT)',
      vehicle_type: 'Bolero Maxi Truck (1.5 MT)',
      capacity_mt: 2,
      vehicle_number: 'MH-24-F-3312',
      base_district: 'Latur',
      rate_per_km: 26,
      rating: 4.8,
      trips_completed: 88,
      is_verified: true,
      is_available: true
    },
    {
      id: 'TRP-MH-203',
      owner_name: 'Rameshwar Solapure',
      driver_name: 'Rameshwar Solapure',
      phone: '+91 94220 55123',
      truck_type: 'Tata 1109 (8 MT)',
      vehicle_type: 'Tata 1109 (8 MT)',
      capacity_mt: 8,
      vehicle_number: 'MH-13-CT-9014',
      base_district: 'Solapur',
      rate_per_km: 42,
      rating: 4.9,
      trips_completed: 210,
      is_verified: true,
      is_available: true
    },
    {
      id: 'TRP-MH-204',
      owner_name: 'Dnyaneshwar Jadhav',
      driver_name: 'Dnyaneshwar Jadhav',
      phone: '+91 97654 32190',
      truck_type: 'Ashok Leyland Dost (2 MT)',
      vehicle_type: 'Ashok Leyland Dost (2 MT)',
      capacity_mt: 2,
      vehicle_number: 'MH-20-EQ-6120',
      base_district: 'Jalna',
      rate_per_km: 28,
      rating: 4.7,
      trips_completed: 64,
      is_verified: true,
      is_available: true
    },
    {
      id: 'TRP-MH-205',
      owner_name: 'Kailash Borde',
      driver_name: 'Kailash Borde',
      phone: '+91 98500 12349',
      truck_type: 'Eicher Pro 2049 (4 MT)',
      vehicle_type: 'Eicher Pro 2049 (4 MT)',
      capacity_mt: 4,
      vehicle_number: 'MH-15-GB-4450',
      base_district: 'Nashik',
      rate_per_km: 35,
      rating: 4.9,
      trips_completed: 175,
      is_verified: true,
      is_available: true
    },
    {
      id: 'TRP-MH-206',
      owner_name: 'Vinayak Deshmukh',
      driver_name: 'Vinayak Deshmukh',
      phone: '+91 99220 77412',
      truck_type: '10-Tyre Heavy Truck (16 MT)',
      vehicle_type: '10-Tyre Heavy Truck (16 MT)',
      capacity_mt: 16,
      vehicle_number: 'MH-30-K-8819',
      base_district: 'Akola',
      rate_per_km: 65,
      rating: 4.8,
      trips_completed: 320,
      is_verified: true,
      is_available: true
    },
    {
      id: 'TRP-MH-207',
      owner_name: 'Tanaji More',
      driver_name: 'Tanaji More',
      phone: '+91 98901 23456',
      truck_type: 'Tata Ace Gold (1 MT)',
      vehicle_type: 'Tata Ace Gold (1 MT)',
      capacity_mt: 1.2,
      vehicle_number: 'MH-12-PQ-9981',
      base_district: 'Pune',
      rate_per_km: 24,
      rating: 4.6,
      trips_completed: 45,
      is_verified: true,
      is_available: true
    }
  ]
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
      status: lotData.status || 'LISTED',
      offers_count: 0,
      created_at: new Date().toISOString(),
      ...lotData
    };

    if (supabaseConnected) {
      try {
        // Ensure farmer exists in users table to satisfy foreign key constraint
        if (newLot.farmer_phone || newLot.farmer_id) {
          let existingUser = null;
          if (newLot.farmer_id) {
            const { data } = await supabase.from('users').select('id, phone').eq('id', newLot.farmer_id).single();
            existingUser = data;
          }
          if (!existingUser && newLot.farmer_phone) {
            const { data } = await supabase.from('users').select('id, phone').eq('phone', newLot.farmer_phone).single();
            existingUser = data;
          }

          if (existingUser) {
            newLot.farmer_id = existingUser.id;
          } else {
            const farmerIdToInsert = newLot.farmer_id || `usr-${Date.now()}`;
            try {
              const { data: createdU, error: errU } = await supabase.from('users').insert([{
                id: farmerIdToInsert,
                phone: newLot.farmer_phone || `98${Date.now().toString().slice(-8)}`,
                role: 'FARMER',
                name: newLot.farmer_name || 'Farmer',
                district: newLot.district || 'Latur'
              }]).select('id').single();
              if (createdU) newLot.farmer_id = createdU.id;
              if (errU) console.warn('Supabase fallback farmer insert notice:', errU.message);
            } catch (errUser) {}
          }
        }

        const { data, error } = await supabase.from('produce_lots').insert([newLot]).select().single();
        if (!error && data) {
          memoryCache.lots.unshift(data);
          await db.logAuditEvent({
            actor_id: data.farmer_id || 'farmer',
            actor_role: 'FARMER',
            action: data.status === 'DRAFT' ? 'LOT_DRAFT_CREATED' : 'LOT_CREATED',
            entity: 'PRODUCE_LOT',
            entity_id: data.id,
            details: { crop: data.crop, quantity_qtl: data.quantity_qtl, status: data.status }
          });
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

  updateLot: async (id, updateData) => {
    const payload = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').update(payload).eq('id', id).select().single();
        if (!error && data) {
          const idx = memoryCache.lots.findIndex(l => l.id === id);
          if (idx !== -1) memoryCache.lots[idx] = data;
          await db.logAuditEvent({
            actor_id: data.farmer_id || 'farmer',
            actor_role: 'FARMER',
            action: 'LOT_UPDATED',
            entity: 'PRODUCE_LOT',
            entity_id: id,
            details: payload
          });
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateLot error:', err.message);
      }
    }
    const lot = memoryCache.lots.find(l => l.id === id);
    if (lot) Object.assign(lot, payload);
    return lot;
  },

  publishLot: async (id) => {
    const payload = {
      status: 'LISTED',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').update(payload).eq('id', id).select().single();
        if (!error && data) {
          const idx = memoryCache.lots.findIndex(l => l.id === id);
          if (idx !== -1) memoryCache.lots[idx] = data;
          await db.logAuditEvent({
            actor_id: data.farmer_id || 'farmer',
            actor_role: 'FARMER',
            action: 'LOT_PUBLISHED',
            entity: 'PRODUCE_LOT',
            entity_id: id,
            details: { status: 'LISTED' }
          });
          return data;
        }
      } catch (err) {
        console.warn('Supabase publishLot error:', err.message);
      }
    }
    const lot = memoryCache.lots.find(l => l.id === id);
    if (lot) Object.assign(lot, payload);
    return lot;
  },

  cancelLot: async (id, reason = 'Cancelled by farmer') => {
    const payload = {
      status: 'CANCELLED',
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    };
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').update(payload).eq('id', id).select().single();
        if (!error && data) {
          const idx = memoryCache.lots.findIndex(l => l.id === id);
          if (idx !== -1) memoryCache.lots[idx] = data;
          await db.logAuditEvent({
            actor_id: data.farmer_id || 'farmer',
            actor_role: 'FARMER',
            action: 'LOT_CANCELLED',
            entity: 'PRODUCE_LOT',
            entity_id: id,
            details: { reason }
          });
          return data;
        }
      } catch (err) {
        console.warn('Supabase cancelLot error:', err.message);
      }
    }
    const lot = memoryCache.lots.find(l => l.id === id);
    if (lot) Object.assign(lot, payload);
    return lot;
  },

  deleteLot: async (id) => {
    if (supabaseConnected) {
      try {
        await supabase.from('produce_lots').delete().eq('id', id);
        await db.logAuditEvent({
          actor_id: 'farmer',
          actor_role: 'FARMER',
          action: 'LOT_DELETED',
          entity: 'PRODUCE_LOT',
          entity_id: id,
          details: { id }
        });
      } catch (err) {
        console.warn('Supabase deleteLot error:', err.message);
      }
    }
    const idx = memoryCache.lots.findIndex(l => l.id === id);
    if (idx !== -1) memoryCache.lots.splice(idx, 1);
    return { id, deleted: true };
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
  getOffers: async (filters = {}) => {
    if (supabaseConnected) {
      try {
        let query = supabase.from('offers').select('*').order('created_at', { ascending: false });
        if (filters.lot_id) query = query.eq('lot_id', filters.lot_id);
        if (filters.buyer_id) query = query.eq('buyer_id', filters.buyer_id);
        if (filters.buyer_phone) query = query.eq('buyer_phone', filters.buyer_phone);
        if (filters.status) query = query.eq('status', filters.status);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getOffers error:', err.message);
      }
    }
    let result = [...memoryCache.offers];
    if (filters.lot_id) result = result.filter(o => o.lot_id === filters.lot_id);
    if (filters.buyer_id) result = result.filter(o => o.buyer_id === filters.buyer_id);
    if (filters.buyer_phone) result = result.filter(o => o.buyer_phone === filters.buyer_phone);
    if (filters.status) result = result.filter(o => o.status === filters.status);
    return result;
  },

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
    const qty = Number(offerData.quantity_requested_qtl) || 50;
    const price = Number(offerData.offered_price_per_qtl) || 0;
    const newOffer = {
      id: `off-${Date.now()}`,
      buyer_id: offerData.buyer_id || 'usr-buyer-1',
      buyer_name: offerData.buyer_name || 'Verified Buyer',
      buyer_phone: offerData.buyer_phone || '',
      offered_price_per_qtl: price,
      quantity_requested_qtl: qty,
      total_amount: price * qty,
      delivery_destination: offerData.delivery_destination || 'Processing Mill Gate',
      valid_hours: Number(offerData.valid_hours) || 24,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ...offerData,
      total_amount: price * qty
    };

    if (supabaseConnected) {
      try {
        // Ensure buyer exists in users table to satisfy foreign key constraint
        if (newOffer.buyer_phone || newOffer.buyer_id) {
          let existingBuyer = null;
          if (newOffer.buyer_id) {
            const { data } = await supabase.from('users').select('id, phone').eq('id', newOffer.buyer_id).single();
            existingBuyer = data;
          }
          if (!existingBuyer && newOffer.buyer_phone) {
            const { data } = await supabase.from('users').select('id, phone').eq('phone', newOffer.buyer_phone).single();
            existingBuyer = data;
          }

          if (existingBuyer) {
            newOffer.buyer_id = existingBuyer.id;
          } else {
            const buyerIdToInsert = newOffer.buyer_id || `usr-buyer-${Date.now()}`;
            try {
              const { data: createdB, error: errB } = await supabase.from('users').insert([{
                id: buyerIdToInsert,
                phone: newOffer.buyer_phone || `99${Date.now().toString().slice(-8)}`,
                role: 'BUYER',
                name: newOffer.buyer_name || 'Institutional Buyer',
                district: newOffer.district || 'Latur'
              }]).select('id').single();
              if (createdB) newOffer.buyer_id = createdB.id;
              if (errB) console.warn('Supabase fallback buyer insert notice:', errB.message);
            } catch (errBuyer) {}
          }
        }

        const { data, error } = await supabase.from('offers').insert([newOffer]).select().single();
        if (!error && data) {
          memoryCache.offers.unshift(data);
          // Increment offer count on lot in Supabase
          try {
            await supabase.rpc('increment_lot_offers', { target_lot_id: offerData.lot_id });
          } catch (rpcErr) {}
          return data;
        }
        if (error) console.warn('Supabase createOffer error:', error.message);
      } catch (err) {
        console.warn('Supabase createOffer exception:', err.message);
      }
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
        // Reject all other competing offers for this lot in Supabase
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

    const dbDeal = {
      id: `deal-${Date.now()}`,
      lot_id: offer.lot_id,
      offer_id: offer.id,
      crop: lot ? lot.crop : 'Agricultural Produce',
      quantity_qtl: Number(offer.quantity_requested_qtl),
      price_per_qtl: Number(offer.offered_price_per_qtl),
      total_deal_value: Number(offer.offered_price_per_qtl) * Number(offer.quantity_requested_qtl),
      buyer_name: offer.buyer_name || 'Buyer Partner',
      farmer_name: lot ? (lot.farmer_name || 'Farmer') : 'Farmer',
      delivery_destination: offer.delivery_destination || 'Buyer Processing Facility',
      delivery_status: 'PENDING_PICKUP',
      escrow_status: 'SECURED_IN_ESCROW'
    };

    const enrichedDeal = {
      ...dbDeal,
      variety: lot ? lot.variety : 'FAQ',
      buyer_id: offer.buyer_id || '',
      buyer_phone: offer.buyer_phone || '',
      farmer_id: lot ? (lot.farmer_id || '') : '',
      farmer_phone: lot ? (lot.farmer_phone || '') : '',
      created_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data: insertedDeal, error: dealErr } = await supabase.from('deals').insert([dbDeal]).select().single();
        if (insertedDeal) {
          const finalDeal = { ...enrichedDeal, ...insertedDeal };
          memoryCache.deals.unshift(finalDeal);
          return { offer, lot, deal: finalDeal };
        }
        if (dealErr) console.warn('Supabase insert deal error:', dealErr.message);
      } catch (err) {
        console.warn('Supabase insert deal exception:', err.message);
      }
    }

    memoryCache.deals.unshift(enrichedDeal);
    return { offer, lot, deal: enrichedDeal };
  },

  // ===================== DEALS =====================
  getDeals: async (filters = {}) => {
    if (supabaseConnected) {
      try {
        let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (filters.buyer_id) query = query.eq('buyer_id', filters.buyer_id);
        if (filters.lot_id) query = query.eq('lot_id', filters.lot_id);
        if (filters.farmer_phone) query = query.eq('farmer_phone', filters.farmer_phone);
        if (filters.delivery_status) query = query.eq('delivery_status', filters.delivery_status);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getDeals error:', err.message);
      }
    }
    let result = [...memoryCache.deals];
    if (filters.buyer_id) result = result.filter(d => d.buyer_id === filters.buyer_id);
    if (filters.lot_id) result = result.filter(d => d.lot_id === filters.lot_id);
    if (filters.farmer_phone) result = result.filter(d => d.farmer_phone === filters.farmer_phone);
    if (filters.delivery_status) result = result.filter(d => d.delivery_status === filters.delivery_status);
    return result;
  },

  getDealById: async (id) => {
    let deal = null;
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').select('*').eq('id', id).single();
        if (!error && data) deal = data;
      } catch (err) {
        console.warn('Supabase getDealById error:', err.message);
      }
    }
    if (!deal) deal = memoryCache.deals.find(d => d.id === id);
    if (!deal) return null;

    // Enrich with lot and buyer metadata if available
    try {
      if (deal.lot_id) {
        const lot = await db.getLotById(deal.lot_id);
        if (lot) {
          deal = {
            ...deal,
            farm_address: lot.farm_address || `${lot.village || ''}, ${lot.taluka || ''}, ${lot.district}`,
            moisture_percentage: lot.moisture_percentage || 10,
            quality_grade: lot.quality_grade || 'FAQ (Grade A)',
            variety: lot.variety || deal.variety || 'FAQ',
            district: lot.district || deal.district || 'Maharashtra',
            taluka: lot.taluka || '',
            village: lot.village || ''
          };
        }
      }
    } catch (enrichErr) {}

    return deal;
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
          if (data.user_id) {
            await supabase.from('users').update({
              is_verified: verified,
              status: verified ? 'ACTIVE' : 'PENDING_VERIFICATION'
            }).eq('id', data.user_id);
          }
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
  getDeals: async (filters = {}) => {
    if (supabaseConnected) {
      try {
        let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (filters.buyer_id) query = query.eq('buyer_id', filters.buyer_id);
        if (filters.farmer_phone) query = query.eq('farmer_phone', filters.farmer_phone);
        if (filters.lot_id) query = query.eq('lot_id', filters.lot_id);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {}
    }
    let result = [...memoryCache.deals];
    if (filters.buyer_id) result = result.filter(d => d.buyer_id === filters.buyer_id);
    if (filters.farmer_phone) result = result.filter(d => d.farmer_phone === filters.farmer_phone);
    if (filters.lot_id) result = result.filter(d => d.lot_id === filters.lot_id);
    return result;
  },

  // ===================== USERS & FARMERS =====================
  getUserByPhone: async (phone) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
        if (!error && data) {
          if (data.role === 'FARMER') {
            try {
              const { data: fp } = await supabase
                .from('farmer_profiles')
                .select('*')
                .or(`user_id.eq.${data.id},phone.eq.${phone}`)
                .limit(1)
                .maybeSingle();
              if (fp) {
                return {
                  ...data,
                  farmer_profile_id: fp.id,
                  land_size_acres: fp.land_size_acres,
                  saat_bara_number: fp.saat_bara_number,
                  taluka: fp.taluka || '',
                  village: fp.village || data.village || '',
                  crops: fp.primary_crops || ['Soybean'],
                  primary_crops: fp.primary_crops || ['Soybean'],
                  bank_ifsc: fp.bank_ifsc || '',
                  is_verified: Boolean(data.is_verified || fp.is_verified)
                };
              }
            } catch (errFp) {}
          } else if (data.role === 'FPO') {
            try {
              const { data: fpo } = await supabase
                .from('fpo_profiles')
                .select('*')
                .or(`user_id.eq.${data.id},phone.eq.${phone}`)
                .limit(1)
                .maybeSingle();
              if (fpo) {
                return {
                  ...data,
                  fpo_profile_id: fpo.id,
                  fpo_name: fpo.fpo_name,
                  company_name: fpo.fpo_name,
                  registration_no: fpo.registration_no,
                  contact_person: fpo.contact_person,
                  members_count: fpo.members_count,
                  warehouse_location: fpo.warehouse_location,
                  taluka: fpo.taluka || '',
                  crops: fpo.primary_crops || ['Soybean'],
                  primary_crops: fpo.primary_crops || ['Soybean'],
                  bank_ifsc: fpo.bank_ifsc || '',
                  bank_account: fpo.bank_account || '',
                  is_verified: Boolean(data.is_verified || fpo.is_verified)
                };
              }
            } catch (errFpo) {}
          }
          return data;
        }
      } catch (err) {}
    }
    const memUser = memoryCache.users.find(u => u.phone === phone);
    if (memUser && memUser.role === 'FPO') {
      const fpo = memoryCache.fpos.find(f => f.phone === phone || f.user_id === memUser.id);
      if (fpo) return { ...memUser, ...fpo };
    }
    return memUser;
  },

  getFarmerProfile: async (identifier) => {
    if (supabaseConnected) {
      try {
        const { data: fp, error } = await supabase
          .from('farmer_profiles')
          .select('*')
          .or(`user_id.eq.${identifier},phone.eq.${identifier},id.eq.${identifier}`)
          .limit(1)
          .maybeSingle();
        if (!error && fp) {
          return {
            id: fp.id,
            user_id: fp.user_id,
            name: fp.full_name,
            full_name: fp.full_name,
            phone: fp.phone,
            district: fp.district,
            taluka: fp.taluka || '',
            village: fp.village || '',
            land_size_acres: fp.land_size_acres,
            saat_bara_number: fp.saat_bara_number,
            crops: fp.primary_crops || ['Soybean'],
            primary_crops: fp.primary_crops || ['Soybean'],
            bank_ifsc: fp.bank_ifsc || '',
            bank_account: fp.bank_account || '',
            verification_status: fp.verification_status || (fp.saat_bara_number ? (fp.is_verified ? 'VERIFIED' : 'SUBMITTED') : 'NOT_SUBMITTED'),
            is_verified: Boolean(fp.is_verified),
            created_at: fp.created_at
          };
        }
      } catch (err) {}
    }
    const memUser = memoryCache.users.find(u => u.phone === identifier || u.id === identifier || u.user_id === identifier);
    return memUser || null;
  },

  updateFarmerProfile: async (identifier, profileData) => {
    if (supabaseConnected) {
      try {
        const fpPayload = {};
        if (profileData.name || profileData.full_name) fpPayload.full_name = (profileData.name || profileData.full_name).trim();
        if (profileData.district) fpPayload.district = profileData.district.trim();
        if (profileData.taluka !== undefined) fpPayload.taluka = profileData.taluka.trim();
        if (profileData.village !== undefined) fpPayload.village = profileData.village.trim();
        if (profileData.land_size_acres !== undefined) fpPayload.land_size_acres = profileData.land_size_acres ? Number(profileData.land_size_acres) : null;
        if (profileData.saat_bara_number !== undefined) {
          fpPayload.saat_bara_number = profileData.saat_bara_number.trim();
          fpPayload.verification_status = fpPayload.saat_bara_number ? 'SUBMITTED' : 'NOT_SUBMITTED';
          if (profileData.is_verified !== undefined) {
            fpPayload.is_verified = Boolean(profileData.is_verified);
          }
        }
        if (profileData.verification_status) {
          fpPayload.verification_status = profileData.verification_status;
        }
        if (profileData.crops || profileData.primary_crops) {
          const crops = profileData.crops || profileData.primary_crops;
          fpPayload.primary_crops = Array.isArray(crops) ? crops : [crops];
        }
        if (profileData.bank_ifsc !== undefined) fpPayload.bank_ifsc = profileData.bank_ifsc.trim();
        if (profileData.bank_account !== undefined) fpPayload.bank_account = profileData.bank_account.trim();

        // Update farmer_profiles table
        const { data: updatedFp, error: fpErr } = await supabase
          .from('farmer_profiles')
          .update(fpPayload)
          .or(`user_id.eq.${identifier},phone.eq.${identifier},id.eq.${identifier}`)
          .select()
          .maybeSingle();

        // Also sync users table
        const userUpdate = {};
        if (fpPayload.full_name) userUpdate.name = fpPayload.full_name;
        if (fpPayload.district) userUpdate.district = fpPayload.district;
        if (fpPayload.village) userUpdate.village = fpPayload.village;

        if (Object.keys(userUpdate).length > 0) {
          await supabase
            .from('users')
            .update(userUpdate)
            .or(`id.eq.${identifier},phone.eq.${identifier}`);
        }

        if (!fpErr && updatedFp) {
          // Log immutable audit event for profile updates
          await db.logAuditEvent({
            actor_id: updatedFp.user_id || identifier,
            actor_role: 'FARMER',
            action: 'FARMER_PROFILE_UPDATED',
            entity: 'FARMER_PROFILE',
            entity_id: updatedFp.id || identifier,
            new_state: fpPayload
          });

          return {
            id: updatedFp.id,
            user_id: updatedFp.user_id,
            name: updatedFp.full_name,
            full_name: updatedFp.full_name,
            phone: updatedFp.phone,
            district: updatedFp.district,
            taluka: updatedFp.taluka || '',
            village: updatedFp.village || '',
            land_size_acres: updatedFp.land_size_acres,
            saat_bara_number: updatedFp.saat_bara_number,
            crops: updatedFp.primary_crops || ['Soybean'],
            primary_crops: updatedFp.primary_crops || ['Soybean'],
            bank_ifsc: updatedFp.bank_ifsc || '',
            bank_account: updatedFp.bank_account || '',
            verification_status: updatedFp.verification_status || (updatedFp.saat_bara_number ? 'SUBMITTED' : 'NOT_SUBMITTED'),
            is_verified: Boolean(updatedFp.is_verified),
            created_at: updatedFp.created_at
          };
        }
      } catch (err) {}
    }

    // In-memory fallback
    const memUser = memoryCache.users.find(u => u.phone === identifier || u.id === identifier || u.user_id === identifier);
    if (memUser) {
      if (profileData.name) memUser.name = profileData.name;
      if (profileData.full_name) memUser.full_name = profileData.full_name;
      if (profileData.district) memUser.district = profileData.district;
      if (profileData.taluka !== undefined) memUser.taluka = profileData.taluka;
      if (profileData.village !== undefined) memUser.village = profileData.village;
      if (profileData.land_size_acres !== undefined) memUser.land_size_acres = Number(profileData.land_size_acres);
      if (profileData.saat_bara_number !== undefined) {
        memUser.saat_bara_number = profileData.saat_bara_number;
        if (profileData.is_verified !== undefined) {
          memUser.is_verified = Boolean(profileData.is_verified);
        }
      }
      if (profileData.crops) memUser.crops = profileData.crops;
      if (profileData.primary_crops) memUser.primary_crops = profileData.primary_crops;
      if (profileData.bank_ifsc !== undefined) memUser.bank_ifsc = profileData.bank_ifsc;
      return memUser;
    }
    return null;
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
            taluka: f.taluka || '',
            village: f.village || f.taluka,
            land_size_acres: f.land_size_acres,
            saat_bara_number: f.saat_bara_number,
            crops: f.primary_crops || f.crops || ['Soybean'],
            primary_crops: f.primary_crops || f.crops || ['Soybean'],
            bank_ifsc: f.bank_ifsc || '',
            is_verified: Boolean(f.is_verified),
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
    const validRoles = ['FARMER', 'BUYER', 'TRANSPORTER', 'ADMIN', 'SUPERADMIN'];
    const dbRole = validRoles.includes(userData.role) ? userData.role : 'FARMER';

    const userTablePayload = {
      id: userData.id || `usr-${Date.now()}`,
      phone: userData.phone,
      role: dbRole,
      name: userData.name || userData.full_name || 'Agri User',
      district: userData.district || 'Maharashtra',
      village: userData.village || '',
      preferred_lang: userData.preferred_lang || 'mr'
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('users').upsert([userTablePayload], { onConflict: 'phone' }).select().single();
        if (!error && data) {
          // If Farmer, create in farmer_profiles, consents, verification_cases & audit log (AG-006)
          if (userData.role === 'FARMER') {
            try {
              const hasSaatBara = Boolean(userData.saat_bara_number && userData.saat_bara_number.trim().length > 0);
              const verificationStatus = userData.verification_status || (hasSaatBara ? 'SUBMITTED' : 'NOT_SUBMITTED');

              await supabase.from('farmer_profiles').upsert([{
                user_id: data.id,
                full_name: data.name,
                phone: data.phone,
                district: data.district,
                taluka: userData.taluka || '',
                village: data.village || '',
                land_size_acres: userData.land_size_acres ? Number(userData.land_size_acres) : null,
                saat_bara_number: userData.saat_bara_number || '',
                primary_crops: Array.isArray(userData.crops) ? userData.crops : [userData.crops || 'Soybean'],
                bank_ifsc: userData.bank_ifsc || '',
                bank_account: userData.bank_account || '',
                verification_status: verificationStatus,
                is_verified: false // Land record verification requires administrative review
              }], { onConflict: 'user_id' });

              // Record DPDP explicit onboarding consent (AG-006)
              if (userData.consent_accepted) {
                await supabase.from('consents').insert([{
                  id: `cns-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  user_id: data.id,
                  consent_type: 'ONBOARDING_DATA_CONSENT',
                  purpose: 'Explicit consent for agricultural marketplace discovery and trade coordination under DPDP Act',
                  is_granted: true,
                  ip_address: userData.ip_address || null,
                  user_agent: userData.user_agent || null,
                  granted_at: new Date().toISOString()
                }]);
              }

              // Create review case if 7/12 land record was submitted
              if (hasSaatBara) {
                await supabase.from('verification_cases').insert([{
                  id: `vc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  entity_type: 'FARMER_LAND',
                  entity_id: data.id,
                  case_type: 'SAAT_BARA_7_12',
                  status: 'SUBMITTED',
                  decision_notes: `7/12 Land record survey #${userData.saat_bara_number} submitted for verification.`,
                  submitted_at: new Date().toISOString()
                }]);
              }

              // Immutable Audit Event
              await db.logAuditEvent({
                actor_id: data.id,
                actor_role: 'FARMER',
                action: 'FARMER_ONBOARDING_COMPLETED',
                entity: 'USER',
                entity_id: data.id,
                new_state: {
                  name: data.name,
                  district: data.district,
                  taluka: userData.taluka,
                  crops: userData.crops,
                  has_saat_bara: hasSaatBara,
                  verification_status: verificationStatus
                }
              });
            } catch (errProfile) {
              console.warn('farmer_profiles upsert notice:', errProfile?.message);
            }
          } else if (userData.role === 'TRANSPORTER') {
            try {
              const tpId = `tp-${Date.now()}`;
              const vehicleNumberUpper = (userData.vehicle_number || `MH-${Date.now().toString().slice(-4)}`).toUpperCase().trim();
              const tpData = {
                id: tpId,
                user_id: data.id,
                driver_name: data.name,
                phone: data.phone,
                vehicle_number: vehicleNumberUpper,
                vehicle_type: userData.vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
                capacity_mt: Number(userData.capacity_mt) || 2.0,
                base_district: data.district || 'Latur',
                base_taluka: userData.taluka || userData.village || '',
                service_area: userData.service_area || `${data.district || 'Latur'} Hub & Surrounding Districts`,
                per_km_rate: Number(userData.per_km_rate) || 4.20,
                is_available: true,
                rating: 5.0,
                trips_completed: 0,
                is_verified: false, // Strict review-based verification
                status: 'PROFILE_SUBMITTED',
                created_at: new Date().toISOString()
              };
              await supabase.from('transporter_profiles').upsert([tpData], { onConflict: 'vehicle_number' });
              const existingTpIdx = memoryCache.transporters.findIndex(t => t.phone === data.phone || t.vehicle_number === tpData.vehicle_number);
              if (existingTpIdx !== -1) memoryCache.transporters[existingTpIdx] = tpData;
              else memoryCache.transporters.unshift(tpData);

              // DPDP Explicit Logistics Consent (AG-008)
              await supabase.from('consents').insert([{
                id: `cns-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                user_id: data.id,
                consent_type: 'TRANSPORTER_LOGISTICS_CONSENT',
                purpose: 'Explicit consent for agricultural logistics discovery, GPS location tracking during trip, and farm-gate dispatch under DPDP Act',
                is_granted: true,
                ip_address: userData.ip_address || null,
                user_agent: userData.user_agent || null,
                granted_at: new Date().toISOString()
              }]);

              // RTO & Fleet Verification Case (AG-008)
              await supabase.from('verification_cases').insert([{
                id: `vc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                entity_type: 'TRANSPORTER',
                entity_id: data.id,
                case_type: 'VEHICLE_AND_PERMIT',
                status: 'UNDER_REVIEW',
                decision_notes: `Vehicle: ${vehicleNumberUpper} (${tpData.vehicle_type}, ${tpData.capacity_mt} MT) in ${tpData.base_district} submitted for verification.`,
                submitted_at: new Date().toISOString()
              }]);

              // Immutable Audit Event (AG-008)
              await db.logAuditEvent({
                actor_id: data.id,
                actor_role: 'TRANSPORTER',
                action: 'TRANSPORTER_REGISTERED',
                entity: 'TRANSPORTER_PROFILE',
                entity_id: tpId,
                new_state: {
                  vehicle_number: tpData.vehicle_number,
                  vehicle_type: tpData.vehicle_type,
                  capacity_mt: tpData.capacity_mt,
                  base_district: tpData.base_district,
                  status: 'PROFILE_SUBMITTED'
                }
              });
            } catch (errTp) {
              console.warn('Transporter onboarding notice:', errTp?.message);
            }
          } else if (userData.role === 'FPO') {
            try {
              const orgId = `org-fpo-${Date.now()}`;
              const regNo = userData.registration_no || `MH-FPO-${Date.now()}`;
              const fpoName = userData.fpo_name || userData.company_name || data.name;

              // 1. Create entry in organisations table
              await supabase.from('organisations').upsert([{
                id: orgId,
                legal_name: fpoName,
                trade_name: fpoName,
                org_type: 'FPO',
                registration_no: regNo,
                district: data.district || 'Latur',
                taluka: userData.taluka || '',
                address: userData.warehouse_location || userData.address || '',
                verification_status: 'DOCUMENTS_PENDING'
              }], { onConflict: 'registration_no' });

              // 2. Create membership
              await supabase.from('memberships').upsert([{
                id: `mem-${Date.now()}`,
                user_id: data.id,
                organisation_id: orgId,
                role_in_org: 'MANAGER',
                status: 'ACTIVE'
              }], { onConflict: 'user_id,organisation_id' });

              // 3. Persist DPDP consent
              await supabase.from('consents').insert([{
                id: `cns-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                user_id: data.id,
                consent_type: 'FPO_AGGREGATION_CONSENT',
                purpose: 'FPO farm pooling, member aggregation, and direct trade coordination consent under DPDP Act',
                is_granted: true,
                granted_at: new Date().toISOString()
              }]);

              // 4. Record audit event
              await db.logAuditEvent({
                actor_id: data.id,
                actor_role: 'FPO',
                action: 'FPO_ONBOARDING_COMPLETED',
                entity: 'ORGANISATION',
                entity_id: orgId,
                new_state: { fpo_name: fpoName, registration_no: regNo, district: data.district }
              });
            } catch (errFpo) {
              console.warn('FPO onboarding notice:', errFpo?.message);
            }
          } else if (userData.role === 'BUYER') {
            try {
              const buyerId = `byr-${Date.now()}`;
              const companyName = userData.company_name || data.name;
              const gstinUpper = userData.gstin ? userData.gstin.toUpperCase().trim() : null;
              const panUpper = userData.pan ? userData.pan.toUpperCase().trim() : (gstinUpper ? gstinUpper.substring(2, 12) : null);
              const buyerCategory = userData.buyer_category || 'Processor or mill';
              const targetCrops = Array.isArray(userData.target_crops || userData.crops) 
                ? (userData.target_crops || userData.crops) 
                : [userData.crops || 'Soybean'];

              const buyerPayload = {
                id: buyerId,
                user_id: data.id,
                company_name: companyName,
                legal_name: companyName,
                representative_name: userData.representative_name || data.name,
                phone: data.phone,
                gstin: gstinUpper,
                pan: panUpper,
                buyer_category: buyerCategory,
                license_type: userData.license_type || 'APMC Direct Purchase License',
                license_number: userData.license_number || '',
                daily_capacity_mt: userData.daily_capacity_mt ? Number(userData.daily_capacity_mt) : 0,
                district: data.district || 'Latur',
                city: `${data.district || 'Latur'} Industrial Area`,
                address: userData.address || '',
                target_crops: targetCrops,
                operating_districts: [data.district || 'Latur'],
                status: 'UNDER_REVIEW',
                is_verified: false,
                rating: 5.0,
                reviews_count: 0,
                created_at: new Date().toISOString()
              };

              await supabase.from('buyer_profiles').upsert([buyerPayload], { onConflict: 'gstin' });

              const existingBIdx = memoryCache.buyers.findIndex(b => b.phone === data.phone || (gstinUpper && b.gstin === gstinUpper));
              if (existingBIdx !== -1) memoryCache.buyers[existingBIdx] = buyerPayload;
              else memoryCache.buyers.unshift(buyerPayload);

              // DPDP Consent for Buyer (AG-007)
              await supabase.from('consents').insert([{
                id: `cns-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                user_id: data.id,
                consent_type: 'BUYER_TRADE_CONSENT',
                purpose: 'Explicit consent for commercial buyer onboarding, statutory document verification (GSTIN/APMC), and market trade execution under DPDP Act',
                is_granted: true,
                ip_address: userData.ip_address || null,
                user_agent: userData.user_agent || null,
                granted_at: new Date().toISOString()
              }]);

              // Commercial Verification Case (AG-007)
              await supabase.from('verification_cases').insert([{
                id: `vc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                entity_type: 'BUYER',
                entity_id: data.id,
                case_type: 'COMMERCIAL_CREDENTIALS',
                status: 'UNDER_REVIEW',
                decision_notes: `GSTIN: ${gstinUpper || 'N/A'} | License: ${userData.license_number || 'N/A'} submitted for verification. Category: ${buyerCategory}`,
                submitted_at: new Date().toISOString()
              }]);

              // Immutable Audit Event (AG-007)
              await db.logAuditEvent({
                actor_id: data.id,
                actor_role: 'BUYER',
                action: 'BUYER_ONBOARDING_COMPLETED',
                entity: 'BUYER_PROFILE',
                entity_id: buyerId,
                new_state: {
                  company_name: companyName,
                  gstin: gstinUpper,
                  buyer_category: buyerCategory,
                  district: data.district,
                  status: 'UNDER_REVIEW'
                }
              });
            } catch (errBuyer) {
              console.warn('Buyer onboarding notice:', errBuyer?.message);
            }
          }

          const existingIdx = memoryCache.users.findIndex(u => u.phone === userData.phone);
          const fullUser = { ...data, ...userData };
          if (existingIdx !== -1) memoryCache.users[existingIdx] = fullUser;
          else memoryCache.users.unshift(fullUser);
          return fullUser;
        }
        if (error) console.warn('Supabase createUser error:', error.message);
      } catch (err) {}
    }

    const existingIndex = memoryCache.users.findIndex(u => u.phone === userData.phone);
    if (existingIndex !== -1) {
      memoryCache.users[existingIndex] = { ...memoryCache.users[existingIndex], ...userData, updated_at: new Date().toISOString() };
      return memoryCache.users[existingIndex];
    }

    const newUser = { ...userTablePayload, ...userData };
    memoryCache.users.unshift(newUser);

    if (userData.role === 'TRANSPORTER') {
      const tpData = {
        id: `tp-${Date.now()}`,
        user_id: newUser.id,
        driver_name: newUser.name,
        phone: newUser.phone,
        vehicle_number: userData.vehicle_number || `MH-${Date.now().toString().slice(-4)}`,
        vehicle_type: userData.vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
        capacity_mt: Number(userData.capacity_mt) || 2.0,
        base_district: newUser.district || 'Latur',
        base_taluka: userData.taluka || userData.village || '',
        per_km_rate: Number(userData.per_km_rate) || 4.20,
        is_available: true,
        rating: 5.0,
        trips_completed: 0,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      const existingTpIdx = memoryCache.transporters.findIndex(t => t.phone === newUser.phone || t.vehicle_number === tpData.vehicle_number);
      if (existingTpIdx !== -1) memoryCache.transporters[existingTpIdx] = tpData;
      else memoryCache.transporters.unshift(tpData);
    } else if (userData.role === 'FPO') {
      const fpoData = {
        id: `fpo-${Date.now()}`,
        user_id: newUser.id,
        fpo_name: userData.fpo_name || userData.company_name || newUser.name,
        registration_no: userData.registration_no || `MH-FPO-${Date.now()}`,
        contact_person: userData.contact_person || newUser.name,
        phone: newUser.phone,
        district: newUser.district || 'Latur',
        taluka: userData.taluka || '',
        members_count: Number(userData.members_count) || 50,
        warehouse_location: userData.warehouse_location || userData.address || '',
        primary_crops: Array.isArray(userData.crops) ? userData.crops : [userData.crops || 'Soybean'],
        bank_ifsc: userData.bank_ifsc || '',
        bank_account: userData.bank_account || '',
        is_verified: true,
        created_at: new Date().toISOString()
      };
      const existingFpoIdx = memoryCache.fpos.findIndex(f => f.phone === newUser.phone || f.registration_no === fpoData.registration_no);
      if (existingFpoIdx !== -1) memoryCache.fpos[existingFpoIdx] = fpoData;
      else memoryCache.fpos.unshift(fpoData);
    }
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
  },

  // ===================== TRANSPORTERS (LOGISTICS) =====================
  createTransporterProfile: async (tpData) => {
    const vehicleNumberUpper = (tpData.vehicle_number || `MH-${Date.now().toString().slice(-4)}`).toUpperCase().trim();
    const tpId = tpData.id || `tp-${Date.now()}`;
    const newTp = {
      id: tpId,
      user_id: tpData.user_id || null,
      driver_name: tpData.driver_name || tpData.name || 'Agri Transporter',
      phone: tpData.phone,
      vehicle_number: vehicleNumberUpper,
      vehicle_type: tpData.vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
      capacity_mt: Number(tpData.capacity_mt) || 2.0,
      base_district: tpData.district || tpData.base_district || 'Latur',
      base_taluka: tpData.taluka || tpData.base_taluka || '',
      service_area: tpData.service_area || `${tpData.district || 'Latur'} Hub & Region`,
      per_km_rate: Number(tpData.per_km_rate) || 4.20,
      rating: 5.0,
      trips_completed: 0,
      is_available: true,
      is_verified: Boolean(tpData.is_verified || false),
      status: tpData.status || (tpData.is_verified ? 'ACTIVE_FOR_BOOKINGS' : 'PROFILE_SUBMITTED'),
      created_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('transporter_profiles').upsert([newTp], { onConflict: 'vehicle_number' }).select().single();
        if (!error && data) {
          const idx = memoryCache.transporters.findIndex(t => t.vehicle_number === newTp.vehicle_number);
          if (idx !== -1) memoryCache.transporters[idx] = data;
          else memoryCache.transporters.unshift(data);

          if (data.user_id) {
            await supabase.from('consents').insert([{
              id: `cns-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              user_id: data.user_id,
              consent_type: 'TRANSPORTER_LOGISTICS_CONSENT',
              purpose: 'Explicit consent for agricultural logistics discovery, GPS location tracking during trip, and farm-gate dispatch under DPDP Act',
              is_granted: true,
              granted_at: new Date().toISOString()
            }]).catch(() => {});

            await supabase.from('verification_cases').insert([{
              id: `vc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              entity_type: 'TRANSPORTER',
              entity_id: data.user_id,
              case_type: 'VEHICLE_AND_PERMIT',
              status: 'UNDER_REVIEW',
              decision_notes: `Vehicle: ${vehicleNumberUpper} (${newTp.vehicle_type}, ${newTp.capacity_mt} MT) in ${newTp.base_district} submitted for verification.`,
              submitted_at: new Date().toISOString()
            }]).catch(() => {});
          }

          await db.logAuditEvent({
            actor_id: data.user_id || data.id,
            actor_role: 'TRANSPORTER',
            action: 'TRANSPORTER_REGISTERED',
            entity: 'TRANSPORTER_PROFILE',
            entity_id: data.id,
            new_state: {
              vehicle_number: newTp.vehicle_number,
              vehicle_type: newTp.vehicle_type,
              status: newTp.status
            }
          });

          return data;
        }
      } catch (err) {
        console.warn('createTransporterProfile notice:', err.message);
      }
    }
    const idx = memoryCache.transporters.findIndex(t => t.vehicle_number === newTp.vehicle_number);
    if (idx !== -1) memoryCache.transporters[idx] = newTp;
    else memoryCache.transporters.unshift(newTp);
    return newTp;
  },

  getAllTransporters: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('transporter_profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.transporters;
  },

  verifyTransporter: async (transporterId, verified = true, adminNotes = '') => {
    let isVerified = true;
    let notes = '';
    if (typeof verified === 'object' && verified !== null) {
      isVerified = verified.verified !== false;
      notes = verified.admin_notes || verified.notes || '';
    } else {
      isVerified = Boolean(verified);
      notes = adminNotes || '';
    }
    const statusVal = isVerified ? 'ACTIVE_FOR_BOOKINGS' : 'PROFILE_SUBMITTED';
    const updatePayload = {
      is_verified: isVerified,
      status: statusVal,
      verified_at: isVerified ? new Date().toISOString() : null,
      verified_by: isVerified ? 'ASIACore' : null,
      admin_notes: notes || (isVerified ? 'Approved by ASIACore Administration' : 'Review status updated')
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('transporter_profiles').update(updatePayload).or(`id.eq.${transporterId},user_id.eq.${transporterId}`).select().maybeSingle();
        if (!error && data) {
          if (data.user_id) {
            await supabase.from('users').update({ is_verified: isVerified }).eq('id', data.user_id).catch(() => {});
            await supabase.from('verification_cases').update({
              status: isVerified ? 'APPROVED' : 'UNDER_REVIEW',
              decision_notes: updatePayload.admin_notes,
              reviewed_at: new Date().toISOString()
            }).eq('entity_id', data.user_id).catch(() => {});
          }

          const idx = memoryCache.transporters.findIndex(t => t.id === transporterId || t.user_id === transporterId);
          if (idx !== -1) memoryCache.transporters[idx] = data;

          await db.logAuditEvent({
            actor_id: 'superadmin-01',
            actor_role: 'SUPERADMIN',
            action: isVerified ? 'TRANSPORTER_VERIFIED' : 'TRANSPORTER_REVOKED',
            entity: 'TRANSPORTER_PROFILE',
            entity_id: transporterId,
            details: { admin_notes: updatePayload.admin_notes, status: statusVal }
          });

          return data;
        }
      } catch (err) {
        console.warn('verifyTransporter error:', err.message);
      }
    }

    const tp = memoryCache.transporters.find(t => t.id === transporterId || t.user_id === transporterId);
    if (tp) {
      Object.assign(tp, updatePayload);
    }
    return tp;
  },

  rejectTransporter: async (transporterId, rejectionReason = '') => {
    const reasonText = (typeof rejectionReason === 'object' && rejectionReason !== null)
      ? (rejectionReason.reason || rejectionReason.admin_notes || '')
      : (rejectionReason || '');
    const updatePayload = {
      is_verified: false,
      status: 'REJECTED',
      admin_notes: reasonText || 'Vehicle RTO documentation mismatch or invalid permit.',
      verified_by: 'ASIACore',
      verified_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('transporter_profiles').update(updatePayload).or(`id.eq.${transporterId},user_id.eq.${transporterId}`).select().maybeSingle();
        if (!error && data) {
          if (data.user_id) {
            await supabase.from('users').update({ is_verified: false }).eq('id', data.user_id).catch(() => {});
            await supabase.from('verification_cases').update({
              status: 'REJECTED',
              decision_notes: updatePayload.admin_notes,
              reviewed_at: new Date().toISOString()
            }).eq('entity_id', data.user_id).catch(() => {});
          }

          const idx = memoryCache.transporters.findIndex(t => t.id === transporterId || t.user_id === transporterId);
          if (idx !== -1) memoryCache.transporters[idx] = data;

          await db.logAuditEvent({
            actor_id: 'superadmin-01',
            actor_role: 'SUPERADMIN',
            action: 'TRANSPORTER_REJECTED',
            entity: 'TRANSPORTER_PROFILE',
            entity_id: transporterId,
            new_state: updatePayload
          });

          return data;
        }
      } catch (err) {}
    }

    const tp = memoryCache.transporters.find(t => t.id === transporterId || t.user_id === transporterId);
    if (tp) {
      Object.assign(tp, updatePayload);
    }
    return tp;
  },

  getTransporters: async (filters = {}) => {
    if (supabaseConnected) {
      try {
        let query = supabase.from('transporter_profiles').select('*').order('created_at', { ascending: false });
        if (filters.district && filters.district !== 'all') query = query.eq('base_district', filters.district);
        if (filters.available !== undefined) query = query.eq('is_available', filters.available === 'true' || filters.available === true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {}
    }
    let result = [...memoryCache.transporters];
    if (filters.district && filters.district !== 'all') {
      result = result.filter(t => t.base_district?.toLowerCase() === filters.district.toLowerCase());
    }
    if (filters.available !== undefined) {
      const isAvail = filters.available === 'true' || filters.available === true;
      result = result.filter(t => t.is_available === isAvail);
    }
    return result;
  },

  getTransporterById: async (id) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('transporter_profiles')
          .select('*')
          .or(`id.eq.${id},user_id.eq.${id},phone.eq.${id}`)
          .limit(1);
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {}
    }
    return memoryCache.transporters.find(t => t.id === id || t.user_id === id || t.phone === id);
  },

  getTransporterByPhone: async (phone) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('transporter_profiles').select('*').eq('phone', phone).single();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.transporters.find(t => t.phone === phone);
  },

  updateTransporterStatus: async (id, is_available) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('transporter_profiles').update({ is_available }).eq('id', id).select().single();
        if (!error && data) {
          const idx = memoryCache.transporters.findIndex(t => t.id === id || t.user_id === id);
          if (idx !== -1) memoryCache.transporters[idx] = data;
          return data;
        }
      } catch (err) {}
    }
    const tp = memoryCache.transporters.find(t => t.id === id || t.user_id === id);
    if (tp) tp.is_available = is_available;
    return tp;
  },

  acceptTrip: async ({ deal_id, transporter_id, driver_name, driver_phone, vehicle_number, agreed_freight, vehicle_type }) => {
    const updatePayload = {
      delivery_status: 'DISPATCHED',
      transporter_id,
      transporter_name: driver_name,
      transporter_phone: driver_phone,
      vehicle_number,
      vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
      freight_amount: Number(agreed_freight) || 0,
      dispatched_at: new Date().toISOString()
    };
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').update(updatePayload).eq('id', deal_id).select().single();
        if (!error && data) {
          const idx = memoryCache.deals.findIndex(d => d.id === deal_id);
          if (idx !== -1) memoryCache.deals[idx] = data;
          return data;
        }
      } catch (err) {}
    }
    const deal = memoryCache.deals.find(d => d.id === deal_id);
    if (deal) {
      Object.assign(deal, updatePayload);
    }
    return deal;
  },

  assignTransporterToDeal: async ({ deal_id, transporter_id, driver_name, driver_phone, vehicle_number, freight_amount, vehicle_type }) => {
    const supabasePayload = {
      delivery_status: 'DISPATCHED',
      transporter_id,
      transporter_name: driver_name,
      transporter_phone: driver_phone,
      vehicle_number,
      freight_amount: Number(freight_amount) || 0
    };
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').update(supabasePayload).eq('id', deal_id).select().single();
        if (!error && data) {
          const combined = { ...data, vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)' };
          const idx = memoryCache.deals.findIndex(d => d.id === deal_id);
          if (idx !== -1) memoryCache.deals[idx] = combined;
          else memoryCache.deals.push(combined);
          return combined;
        }
        if (error) {
          console.warn('Supabase assignTransporterToDeal warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase assignTransporterToDeal exception:', err.message);
      }
    }
    const deal = memoryCache.deals.find(d => d.id === deal_id);
    if (deal) {
      Object.assign(deal, supabasePayload, { vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)' });
      return deal;
    }
    return { id: deal_id, ...supabasePayload, vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)' };
  },

  updateTripMilestone: async ({ deal_id, milestone, notes, weighment_data }) => {
    const supabasePayload = {
      delivery_status: milestone
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').update(supabasePayload).eq('id', deal_id).select().single();
        if (!error && data) {
          const combined = { ...data, notes, weighment_data, delivery_status: milestone };
          const idx = memoryCache.deals.findIndex(d => d.id === deal_id);
          if (idx !== -1) memoryCache.deals[idx] = combined;
          else memoryCache.deals.push(combined);
          return combined;
        }
        if (error) {
          console.warn('Supabase updateTripMilestone warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase updateTripMilestone exception:', err.message);
      }
    }
    const deal = memoryCache.deals.find(d => d.id === deal_id);
    if (deal) {
      deal.delivery_status = milestone;
      if (notes) deal.transit_notes = notes;
      return deal;
    }
    return { id: deal_id, delivery_status: milestone, notes };
  },

  getTransporterTrips: async (transporter_id) => {
    let tp = null;
    try {
      tp = await db.getTransporterById(transporter_id);
    } catch (e) {}

    const idsToMatch = [transporter_id];
    let phoneToMatch = null;
    let vehicleToMatch = null;
    if (tp) {
      if (tp.id && !idsToMatch.includes(tp.id)) idsToMatch.push(tp.id);
      if (tp.user_id && !idsToMatch.includes(tp.user_id)) idsToMatch.push(tp.user_id);
      if (tp.phone) phoneToMatch = tp.phone;
      if (tp.vehicle_number) vehicleToMatch = tp.vehicle_number;
    }

    if (supabaseConnected) {
      try {
        let orConditions = idsToMatch.map(id => `transporter_id.eq.${id}`);
        if (phoneToMatch) orConditions.push(`transporter_phone.eq.${phoneToMatch}`);
        if (vehicleToMatch) orConditions.push(`vehicle_number.eq.${vehicleToMatch}`);
        
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .or(orConditions.join(','))
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('getTransporterTrips supabase error:', err.message);
      }
    }
    return memoryCache.deals.filter(d => 
      idsToMatch.includes(d.transporter_id) || 
      (phoneToMatch && d.transporter_phone === phoneToMatch) ||
      (vehicleToMatch && d.vehicle_number === vehicleToMatch)
    );
  },

  recordGateWeighmentAndAssay: async ({
    deal_id,
    operator_name = 'Authorized Mill Assayer',
    gross_kg,
    tare_kg,
    moisture_tested,
    foreign_matter = 1.0,
    damage_percentage = 1.0,
    quality_grade = 'FAQ (Grade A)',
    notes = ''
  }) => {
    const gross = Number(gross_kg) || 0;
    const tare = Number(tare_kg) || 0;
    const net_kg = Math.max(0, gross - tare);
    const net_qtl = Number((net_kg / 100).toFixed(2));

    // Fetch existing deal
    let deal = null;
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').select('*').eq('id', deal_id).single();
        if (!error && data) deal = data;
      } catch (err) {}
    }
    if (!deal) {
      deal = memoryCache.deals.find(d => d.id === deal_id);
    }
    if (!deal) {
      throw new Error(`Deal ${deal_id} not found.`);
    }

    const price_per_qtl = Number(deal.price_per_qtl) || 0;
    const baseValue = Number((net_qtl * price_per_qtl).toFixed(2));

    // Quality Deduction Math:
    // Standard moisture threshold: 12.0%. 1% deduction for each % over 12%
    const baseMoistureLimit = 12.0;
    const testedMoist = Number(moisture_tested) || 10.0;
    let moistureDeduction = 0;
    if (testedMoist > baseMoistureLimit) {
      const excessRatio = (testedMoist - baseMoistureLimit) / 100;
      moistureDeduction = Number((baseValue * excessRatio).toFixed(2));
    }

    // Foreign matter deduction if > 2%
    let foreignMatterDeduction = 0;
    const fm = Number(foreign_matter) || 0;
    if (fm > 2.0) {
      const excessFmRatio = (fm - 2.0) / 100;
      foreignMatterDeduction = Number((baseValue * excessFmRatio).toFixed(2));
    }

    const totalDeductions = Number((moistureDeduction + foreignMatterDeduction).toFixed(2));
    const final_payable_amount = Math.max(0, Number((baseValue - totalDeductions).toFixed(2)));

    const slip_no = `WB-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const weighmentRecord = {
      deal_id,
      slip_no,
      operator_name,
      gross_kg: gross,
      tare_kg: tare,
      net_kg,
      net_qtl,
      contract_quantity_qtl: deal.quantity_qtl,
      price_per_qtl,
      base_amount: baseValue,
      moisture_tested: testedMoist,
      moisture_deduction: moistureDeduction,
      foreign_matter: fm,
      foreign_matter_deduction: foreignMatterDeduction,
      damage_percentage: Number(damage_percentage) || 0,
      total_deductions: totalDeductions,
      final_payable_amount,
      quality_grade,
      notes,
      verified_at: new Date().toISOString()
    };

    // Update Supabase deals record with valid columns
    const supabasePayload = {
      delivery_status: 'DELIVERED',
      escrow_status: 'READY_FOR_SETTLEMENT',
      total_deal_value: final_payable_amount
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').update(supabasePayload).eq('id', deal_id).select().single();
        if (!error && data) {
          deal = { ...data, weighment: weighmentRecord };
        }
      } catch (err) {
        console.warn('Supabase recordGateWeighmentAndAssay exception:', err.message);
      }
    }

    const idx = memoryCache.deals.findIndex(d => d.id === deal_id);
    const enrichedDeal = {
      ...(deal || {}),
      delivery_status: 'DELIVERED',
      escrow_status: 'READY_FOR_SETTLEMENT',
      total_deal_value: final_payable_amount,
      weighment: weighmentRecord
    };

    if (idx !== -1) {
      memoryCache.deals[idx] = enrichedDeal;
    } else {
      memoryCache.deals.push(enrichedDeal);
    }

    return {
      deal: enrichedDeal,
      weighment: weighmentRecord
    };
  },

  getWeighmentAssay: async (deal_id) => {
    let deal = memoryCache.deals.find(d => d.id === deal_id);
    if (deal && deal.weighment) {
      return deal.weighment;
    }
    if (!deal && supabaseConnected) {
      try {
        const { data } = await supabase.from('deals').select('*').eq('id', deal_id).single();
        if (data) deal = data;
      } catch (e) {}
    }
    if (deal) {
      const net_qtl = Number(deal.quantity_qtl) || 50;
      const net_kg = net_qtl * 100;
      return {
        deal_id,
        slip_no: `WB-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-DEF01`,
        operator_name: 'Certified Plant Assayer',
        gross_kg: net_kg + 6500,
        tare_kg: 6500,
        net_kg,
        net_qtl,
        contract_quantity_qtl: deal.quantity_qtl,
        price_per_qtl: deal.price_per_qtl,
        base_amount: deal.total_deal_value,
        moisture_tested: 10.5,
        moisture_deduction: 0,
        foreign_matter: 1.2,
        foreign_matter_deduction: 0,
        damage_percentage: 0.8,
        total_deductions: 0,
        final_payable_amount: deal.total_deal_value,
        quality_grade: 'FAQ (Grade A)',
        verified_at: deal.created_at || new Date().toISOString()
      };
    }
    return null;
  },

  settleDealEscrow: async ({ deal_id, authorized_by = 'Procurement Officer', payment_mode = 'T+0_DIRECT_ESCROW_RTGS' }) => {
    let deal = null;
    if (supabaseConnected) {
      try {
        const { data } = await supabase.from('deals').select('*').eq('id', deal_id).single();
        if (data) deal = data;
      } catch (err) {}
    }
    if (!deal) {
      deal = memoryCache.deals.find(d => d.id === deal_id);
    }
    if (!deal) {
      throw new Error(`Deal ${deal_id} not found.`);
    }

    let farmerProfile = null;
    if (deal.farmer_phone || deal.farmer_id) {
      try {
        farmerProfile = await db.getFarmerProfile(deal.farmer_phone || deal.farmer_id);
      } catch (e) {}
    }

    const timestamp = Date.now();
    const settlement_utr = `UTR-AGRI-2026-${timestamp.toString().slice(-6)}`;
    const invoice_no = `INV-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-${timestamp.toString().slice(-6)}`;
    const settled_at = new Date().toISOString();
    const settled_amount = Number(deal.total_deal_value) || (Number(deal.price_per_qtl || 0) * Number(deal.quantity_qtl || 0));

    const settlementRecord = {
      deal_id,
      invoice_no,
      settlement_utr,
      settled_at,
      settled_amount,
      authorized_by,
      payment_mode,
      clearing_bank: 'State Bank of India (RBI Authorized Escrow Payout Partner)',
      beneficiary_name: farmerProfile?.name || deal.farmer_name || 'Farmer Beneficiary',
      beneficiary_ifsc: farmerProfile?.bank_ifsc || 'SBIN0001423',
      beneficiary_account: 'XXXXXX' + (deal.farmer_phone ? String(deal.farmer_phone).slice(-4) : '4421'),
      status: 'SETTLED'
    };

    // Update Supabase deals record with valid columns
    const supabasePayload = {
      escrow_status: 'SETTLED',
      delivery_status: 'DELIVERED'
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('deals').update(supabasePayload).eq('id', deal_id).select().single();
        if (!error && data) {
          deal = { ...data, settlement: settlementRecord, weighment: deal.weighment };
        }
      } catch (err) {
        console.warn('Supabase settleDealEscrow exception:', err.message);
      }
    }

    const idx = memoryCache.deals.findIndex(d => d.id === deal_id);
    const enrichedDeal = {
      ...(deal || {}),
      escrow_status: 'SETTLED',
      delivery_status: 'DELIVERED',
      settlement: settlementRecord,
      weighment: deal?.weighment
    };

    if (idx !== -1) {
      memoryCache.deals[idx] = enrichedDeal;
    } else {
      memoryCache.deals.push(enrichedDeal);
    }

    return {
      deal: enrichedDeal,
      settlement: settlementRecord
    };
  },

  getSettlementInvoice: async (deal_id) => {
    let deal = memoryCache.deals.find(d => d.id === deal_id);
    if (!deal && supabaseConnected) {
      try {
        const { data } = await supabase.from('deals').select('*').eq('id', deal_id).single();
        if (data) deal = data;
      } catch (e) {}
    }
    if (!deal) return null;

    let farmerProfile = null;
    if (deal.farmer_phone || deal.farmer_id) {
      try {
        farmerProfile = await db.getFarmerProfile(deal.farmer_phone || deal.farmer_id);
      } catch (e) {}
    }

    const weighment = deal.weighment || await db.getWeighmentAssay(deal_id);
    const net_qtl = weighment?.net_qtl || Number(deal.quantity_qtl) || 50;
    const price_per_qtl = Number(deal.price_per_qtl) || 4500;
    const gross_amount = Number(weighment?.base_amount) || (net_qtl * price_per_qtl);
    const deductions = Number(weighment?.total_deductions) || 0;
    const final_amount = Number(deal.total_deal_value) || (gross_amount - deductions);

    const settlement = deal.settlement || {
      invoice_no: `INV-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-99281`,
      settlement_utr: `UTR-AGRI-2026-88192`,
      settled_at: new Date().toISOString(),
      settled_amount: final_amount,
      authorized_by: 'Head of Procurement',
      payment_mode: 'T+0 Direct Escrow Clearing',
      clearing_bank: 'State Bank of India (RBI Authorized Escrow Payout Partner)',
      beneficiary_name: farmerProfile?.name || deal.farmer_name,
      beneficiary_ifsc: farmerProfile?.bank_ifsc || 'SBIN0001423',
      beneficiary_account: 'XXXXXX' + (deal.farmer_phone ? String(deal.farmer_phone).slice(-4) : '4421'),
      status: 'SETTLED'
    };

    return {
      invoice_no: settlement.invoice_no,
      invoice_date: settlement.settled_at,
      deal_id: deal.id,
      crop: deal.crop,
      variety: deal.variety || 'FAQ Standard',
      seller: {
        name: deal.farmer_name,
        phone: deal.farmer_phone,
        district: deal.farmer_district || farmerProfile?.district || 'Latur',
        taluka: farmerProfile?.taluka || 'Ausa',
        village: farmerProfile?.village || 'Kandhar',
        saat_bara_number: farmerProfile?.saat_bara_number || '88',
        bank_ifsc: farmerProfile?.bank_ifsc || 'SBIN0001423',
        bank_account: settlement.beneficiary_account
      },
      buyer: {
        company_name: deal.buyer_name || 'Verified Agro Processing Mill',
        gstin: '27AAACG0821M1Z5',
        license: 'Maharashtra APMC Direct Purchase License #MH-APMC-DIR-2026/89',
        plant_address: deal.delivery_destination || 'MIDC Industrial Area, Latur'
      },
      transporter: {
        carrier_name: deal.driver_name || deal.transporter_name || 'Pandurang Shinde',
        vehicle_number: deal.vehicle_number || 'MH-24-AG-7821',
        driver_phone: deal.driver_phone || deal.transporter_phone || '+91 98221 44556',
        freight_amount: deal.freight_amount || 3200
      },
      weighment: {
        slip_no: weighment?.slip_no || 'WB-LTR-2026-001',
        gross_kg: weighment?.gross_kg || (net_qtl * 100 + 6800),
        tare_kg: weighment?.tare_kg || 6800,
        net_kg: weighment?.net_kg || (net_qtl * 100),
        net_qtl: net_qtl,
        moisture_tested: weighment?.moisture_tested || 10.8,
        quality_grade: weighment?.quality_grade || 'FAQ (Grade A)'
      },
      line_items: [
        {
          description: `${deal.crop} (${deal.variety || 'FAQ'}) Farm-Gate Direct Harvest`,
          net_qtl: net_qtl,
          rate_per_qtl: price_per_qtl,
          gross_total: gross_amount,
          deductions: deductions,
          taxable_value: final_amount,
          cess_rate: '0.00%',
          cess_amount: 0.00,
          net_payable: final_amount
        }
      ],
      settlement: settlement,
      statutory_citation: 'Direct Farm-Gate Procurement under Maharashtra APMC Rules (Section 59 Exemption): 0% Mandi Cess levied.'
    };
  },

  // ===================== FPO (FARMER PRODUCER ORGANIZATIONS) =====================
  getFpoProfile: async (identifier) => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('fpo_profiles')
          .select('*')
          .or(`id.eq.${identifier},user_id.eq.${identifier},phone.eq.${identifier}`)
          .limit(1)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.fpos.find(f => f.id === identifier || f.user_id === identifier || f.phone === identifier) || null;
  },

  getEligibleSmallholderLots: async (district = 'all', crop = 'all') => {
    let lots = [];
    if (supabaseConnected) {
      try {
        let query = supabase.from('produce_lots').select('*').eq('status', 'LISTED').order('created_at', { ascending: false });
        if (district && district !== 'all') {
          query = query.ilike('district', `%${district}%`);
        }
        if (crop && crop !== 'all') {
          query = query.ilike('crop', `%${crop}%`);
        }
        const { data, error } = await query;
        if (!error && data) {
          lots = data.filter(l => !l.is_fpo_bulk);
        }
      } catch (err) {}
    }
    if (lots.length === 0) {
      lots = memoryCache.lots.filter(l => l.status === 'LISTED' && !l.is_fpo_bulk);
      if (district && district !== 'all') {
        lots = lots.filter(l => l.district.toLowerCase().includes(district.toLowerCase()));
      }
      if (crop && crop !== 'all') {
        lots = lots.filter(l => l.crop.toLowerCase().includes(crop.toLowerCase()));
      }
    }
    return lots;
  },

  createFpoBulkLot: async (bulkPayload, sourceLotIds = []) => {
    const bulkLotId = `lot-fpo-${Date.now()}`;
    const newBulkLot = {
      id: bulkLotId,
      farmer_id: bulkPayload.fpo_id,
      farmer_name: `${bulkPayload.fpo_name} (FPO Cluster)`,
      farmer_phone: bulkPayload.fpo_phone,
      crop: bulkPayload.crop,
      variety: bulkPayload.variety || 'FAQ Standard',
      quantity_qtl: Number(bulkPayload.quantity_qtl),
      expected_price_per_qtl: Number(bulkPayload.expected_price_per_qtl),
      moisture_percentage: Number(bulkPayload.moisture_percentage) || 10.0,
      quality_grade: bulkPayload.quality_grade || 'FAQ (Grade A)',
      district: bulkPayload.district,
      farm_address: bulkPayload.warehouse_location || `${bulkPayload.taluka || ''}, ${bulkPayload.district}`,
      status: 'LISTED',
      offers_count: 0,
      is_fpo_bulk: true,
      fpo_id: bulkPayload.fpo_id,
      fpo_name: bulkPayload.fpo_name,
      pooled_members: bulkPayload.pooled_members || [],
      created_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('produce_lots').insert([newBulkLot]).select().single();
        if (!error && data) {
          memoryCache.lots.unshift(data);
          // Mark source lots as POOLED_BY_FPO
          if (Array.isArray(sourceLotIds) && sourceLotIds.length > 0) {
            try {
              await supabase.from('produce_lots').update({ status: 'POOLED_BY_FPO' }).in('id', sourceLotIds);
            } catch (srcErr) {}
            sourceLotIds.forEach(sid => {
              const src = memoryCache.lots.find(l => l.id === sid);
              if (src) src.status = 'POOLED_BY_FPO';
            });
          }
          return data;
        }
      } catch (err) {}
    }

    // Fallback to memoryCache
    memoryCache.lots.unshift(newBulkLot);
    if (Array.isArray(sourceLotIds) && sourceLotIds.length > 0) {
      sourceLotIds.forEach(sid => {
        const src = memoryCache.lots.find(l => l.id === sid);
        if (src) src.status = 'POOLED_BY_FPO';
      });
    }
    return newBulkLot;
  },

  getFpoLots: async (fpoId) => {
    let lots = [];
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('produce_lots')
          .select('*')
          .or(`fpo_id.eq.${fpoId},farmer_id.eq.${fpoId}`)
          .order('created_at', { ascending: false });
        if (!error && data) lots = data;
      } catch (err) {}
    }
    if (lots.length === 0) {
      lots = memoryCache.lots.filter(l => l.fpo_id === fpoId || l.farmer_id === fpoId);
    }
    return lots;
  },

  getFpoDeals: async (fpoId) => {
    const fpoLots = await db.getFpoLots(fpoId);
    const lotIds = fpoLots.map(l => l.id);
    let deals = [];
    if (supabaseConnected) {
      try {
        let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (lotIds.length > 0) {
          query = query.or(`fpo_id.eq.${fpoId},lot_id.in.(${lotIds.join(',')})`);
        } else {
          query = query.eq('fpo_id', fpoId);
        }
        const { data, error } = await query;
        if (!error && data) deals = data;
      } catch (err) {}
    }
    if (deals.length === 0) {
      deals = memoryCache.deals.filter(d => d.fpo_id === fpoId || lotIds.includes(d.lot_id));
    }
    return deals;
  },

  calculateFpoMemberPayouts: async (dealId) => {
    const deal = await db.getDealById(dealId);
    if (!deal) return null;
    const lot = await db.getLotById(deal.lot_id);
    const pooledMembers = lot?.pooled_members || [];

    const totalDealValue = Number(deal.total_deal_value) || (Number(deal.quantity_qtl) * Number(deal.price_per_qtl));
    const totalQtl = Number(deal.quantity_qtl) || 1;
    const unitPrice = Number(deal.price_per_qtl);
    const fpoHandlingPct = 1.5; // 1.5% FPO cooperative aggregation fee
    const fpoTotalFee = Math.round(totalDealValue * (fpoHandlingPct / 100));
    const netFarmerPoolValue = totalDealValue - fpoTotalFee;

    const memberPayouts = pooledMembers.map(m => {
      const mQty = Number(m.quantity_qtl);
      const sharePct = Number(((mQty / totalQtl) * 100).toFixed(2));
      const mGross = Math.round(mQty * unitPrice);
      const mFee = Math.round(mGross * (fpoHandlingPct / 100));
      const mNet = mGross - mFee;
      return {
        farmer_id: m.farmer_id || `usr-member-${Date.now()}`,
        farmer_name: m.farmer_name || 'Member Farmer',
        phone: m.farmer_phone || m.phone || '98XXXXXXXX',
        saat_bara_number: m.saat_bara_number || m.saat_bara || '7/12 Verified',
        village: m.village || lot?.village || 'Local Village',
        quantity_qtl: mQty,
        share_pct: sharePct,
        gross_amount: mGross,
        fpo_service_fee: mFee,
        net_payable: mNet,
        bank_payout_status: deal.escrow_status === 'SETTLED' ? 'CREDITED_VIA_RTGS' : 'ESCROW_ALLOCATED'
      };
    });

    return {
      deal_id: deal.id,
      lot_id: deal.lot_id,
      fpo_name: lot?.fpo_name || deal.farmer_name,
      crop: deal.crop,
      total_quantity_qtl: totalQtl,
      price_per_qtl: unitPrice,
      total_deal_value: totalDealValue,
      fpo_handling_rate_pct: fpoHandlingPct,
      fpo_cooperative_fee: fpoTotalFee,
      net_members_disbursement: netFarmerPoolValue,
      escrow_status: deal.escrow_status || 'SECURED_IN_ESCROW',
      delivery_status: deal.delivery_status || 'PENDING_PICKUP',
      member_payouts: memberPayouts,
      statutory_citation: 'Maharashtra APMC Direct Farm-Gate Procurement Rules (Section 59): 0% APMC Mandi Cess levied on FPO Farmer Bulk Aggregations.'
    };
  },

  // ===================== BUYER PROFILES & VERIFICATION (AG-007) =====================
  createBuyerProfile: async (buyerData) => {
    const buyerId = buyerData.id || `byr-${Date.now()}`;
    const gstinUpper = buyerData.gstin ? buyerData.gstin.toUpperCase().trim() : null;
    const panUpper = buyerData.pan ? buyerData.pan.toUpperCase().trim() : (gstinUpper ? gstinUpper.substring(2, 12) : null);
    const companyName = buyerData.company_name || buyerData.legal_name || 'Agro Buyer';
    const buyerCategory = buyerData.buyer_category || 'Processor or mill';
    const targetCrops = Array.isArray(buyerData.target_crops || buyerData.crops) 
      ? (buyerData.target_crops || buyerData.crops) 
      : [buyerData.crops || 'Soybean'];

    const newBuyer = {
      id: buyerId,
      user_id: buyerData.user_id || null,
      company_name: companyName,
      legal_name: buyerData.legal_name || companyName,
      representative_name: buyerData.representative_name || companyName,
      phone: buyerData.phone,
      gstin: gstinUpper,
      pan: panUpper,
      buyer_category: buyerCategory,
      license_type: buyerData.license_type || 'APMC Direct Purchase License',
      license_number: buyerData.license_number || '',
      daily_capacity_mt: Number(buyerData.daily_capacity_mt) || 0,
      district: buyerData.district || 'Latur',
      city: buyerData.city || `${buyerData.district || 'Latur'} Industrial Area`,
      address: buyerData.address || '',
      target_crops: targetCrops,
      operating_districts: buyerData.operating_districts || [buyerData.district || 'Latur'],
      status: buyerData.status || 'UNDER_REVIEW',
      is_verified: Boolean(buyerData.is_verified),
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').upsert([newBuyer], { onConflict: 'gstin' }).select().single();
        if (!error && data) {
          const idx = memoryCache.buyers.findIndex(b => b.id === buyerId || (gstinUpper && b.gstin === gstinUpper));
          if (idx !== -1) memoryCache.buyers[idx] = data;
          else memoryCache.buyers.unshift(data);

          if (data.user_id) {
            await supabase.from('consents').insert([{
              id: `cns-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              user_id: data.user_id,
              consent_type: 'BUYER_TRADE_CONSENT',
              purpose: 'Explicit consent for commercial buyer onboarding and verification under DPDP Act',
              is_granted: true,
              granted_at: new Date().toISOString()
            }]).catch(() => {});

            await supabase.from('verification_cases').insert([{
              id: `vc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              entity_type: 'BUYER',
              entity_id: data.user_id,
              case_type: 'COMMERCIAL_CREDENTIALS',
              status: 'UNDER_REVIEW',
              decision_notes: `GSTIN: ${gstinUpper || 'N/A'} | License: ${buyerData.license_number || 'N/A'} submitted for verification.`,
              submitted_at: new Date().toISOString()
            }]).catch(() => {});
          }

          await db.logAuditEvent({
            actor_id: data.user_id || data.id,
            actor_role: 'BUYER',
            action: 'BUYER_ONBOARDING_COMPLETED',
            entity: 'BUYER_PROFILE',
            entity_id: data.id,
            new_state: { company_name: companyName, gstin: gstinUpper, status: data.status }
          });

          return data;
        }
      } catch (err) {
        console.warn('Supabase createBuyerProfile error:', err.message);
      }
    }

    const idx = memoryCache.buyers.findIndex(b => b.id === buyerId || (gstinUpper && b.gstin === gstinUpper));
    if (idx !== -1) memoryCache.buyers[idx] = newBuyer;
    else memoryCache.buyers.unshift(newBuyer);
    return newBuyer;
  },

  getBuyers: async () => {
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').select('*').or('is_verified.eq.true,status.eq.VERIFIED').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.buyers.filter(b => b.is_verified || b.status === 'VERIFIED');
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
        const { data, error } = await supabase.from('buyer_profiles').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.buyers.find(b => b.id === id);
  },

  getBuyerProfile: async (identifier) => {
    if (!identifier) return null;
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles')
          .select('*')
          .or(`id.eq.${identifier},user_id.eq.${identifier},phone.eq.${identifier}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryCache.buyers.find(b => b.id === identifier || b.user_id === identifier || b.phone === identifier) || null;
  },

  verifyBuyer: async (buyerId, verified = true, adminNotes = '') => {
    const statusVal = verified ? 'VERIFIED' : 'UNDER_REVIEW';
    const updatePayload = {
      is_verified: verified,
      status: statusVal,
      verified_at: verified ? new Date().toISOString() : null,
      verified_by: verified ? 'ASIACore' : null,
      admin_notes: adminNotes || (verified ? 'Approved by ASIACore Administration' : 'Review status updated')
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').update(updatePayload).eq('id', buyerId).select().maybeSingle();
        if (!error && data) {
          if (data.user_id) {
            await supabase.from('users').update({ is_verified: verified }).eq('id', data.user_id).catch(() => {});
            await supabase.from('verification_cases').update({
              status: verified ? 'APPROVED' : 'UNDER_REVIEW',
              decision_notes: updatePayload.admin_notes,
              reviewed_at: new Date().toISOString()
            }).eq('entity_id', data.user_id).catch(() => {});
          }

          const idx = memoryCache.buyers.findIndex(b => b.id === buyerId);
          if (idx !== -1) memoryCache.buyers[idx] = data;

          await db.logAuditEvent({
            actor_id: 'superadmin-01',
            actor_role: 'SUPERADMIN',
            action: verified ? 'BUYER_VERIFIED' : 'BUYER_REVOKED',
            entity: 'BUYER_PROFILE',
            entity_id: buyerId,
            new_state: updatePayload
          });

          return data;
        }
      } catch (err) {
        console.warn('verifyBuyer error:', err.message);
      }
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
      verified_by: 'ASIACore',
      verified_at: new Date().toISOString()
    };

    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.from('buyer_profiles').update(updatePayload).eq('id', buyerId).select().maybeSingle();
        if (!error && data) {
          if (data.user_id) {
            await supabase.from('users').update({ is_verified: false }).eq('id', data.user_id).catch(() => {});
            await supabase.from('verification_cases').update({
              status: 'REJECTED',
              decision_notes: updatePayload.admin_notes,
              reviewed_at: new Date().toISOString()
            }).eq('entity_id', data.user_id).catch(() => {});
          }

          const idx = memoryCache.buyers.findIndex(b => b.id === buyerId);
          if (idx !== -1) memoryCache.buyers[idx] = data;

          await db.logAuditEvent({
            actor_id: 'superadmin-01',
            actor_role: 'SUPERADMIN',
            action: 'BUYER_REJECTED',
            entity: 'BUYER_PROFILE',
            entity_id: buyerId,
            new_state: updatePayload
          });

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

  verifyFarmer: async (farmerId, verified = true) => {
    const updatePayload = {
      is_verified: verified,
      verification_status: verified ? 'VERIFIED' : 'REJECTED',
      verified_by: verified ? 'ASIACore' : null,
      verified_at: verified ? new Date().toISOString() : null
    };

    if (supabaseConnected) {
      try {
        await supabase.from('farmer_profiles').update(updatePayload).or(`user_id.eq.${farmerId},id.eq.${farmerId}`);
        await supabase.from('users').update({ is_verified: verified }).eq('id', farmerId);
        await supabase.from('verification_cases').update({
          status: verified ? 'APPROVED' : 'REJECTED',
          reviewed_at: new Date().toISOString()
        }).eq('entity_id', farmerId).catch(() => {});

        await db.logAuditEvent({
          actor_id: 'superadmin-01',
          actor_role: 'SUPERADMIN',
          action: verified ? 'FARMER_LAND_VERIFIED' : 'FARMER_LAND_UNVERIFIED',
          entity: 'FARMER_PROFILE',
          entity_id: farmerId,
          new_state: updatePayload
        });
      } catch (err) {}
    }

    const farmer = memoryCache.users.find(u => (u.id === farmerId || u.user_id === farmerId));
    if (farmer) {
      Object.assign(farmer, updatePayload);
    }
    return farmer;
  },

  deleteUser: async (id) => {
    if (supabaseConnected) {
      try {
        await supabase.from('users').delete().eq('id', id);
        await supabase.from('farmer_profiles').delete().or(`user_id.eq.${id},id.eq.${id}`);
        await supabase.from('buyer_profiles').delete().or(`user_id.eq.${id},id.eq.${id}`);
      } catch (err) {}
    }
    memoryCache.users = memoryCache.users.filter(u => u.id !== id && u.user_id !== id);
    memoryCache.buyers = memoryCache.buyers.filter(b => b.id !== id && b.user_id !== id);
    return true;
  },

  getSupabaseStatus: () => ({
    connected: supabaseConnected,
    url: SUPABASE_URL
  }),

  getAdminStats: async () => {
    let farmersCount = memoryCache.users.filter(u => u.role === 'FARMER').length;
    let verifiedFarmersCount = memoryCache.users.filter(u => u.role === 'FARMER' && u.is_verified).length;
    let buyersCount = memoryCache.buyers.length;
    let verifiedBuyersCount = memoryCache.buyers.filter(b => b.is_verified || b.status === 'VERIFIED').length;
    let pendingBuyersCount = memoryCache.buyers.filter(b => b.status === 'PENDING_VERIFICATION' || b.status === 'UNDER_REVIEW' || b.status === 'DOCUMENTS_SUBMITTED').length;
    let lotsCount = memoryCache.lots.length;
    let activeLotsCount = memoryCache.lots.filter(l => l.status === 'LISTED').length;
    let totalVolumeQtl = memoryCache.lots.reduce((acc, l) => acc + (Number(l.quantity_qtl) || 0), 0);
    let dealsCount = memoryCache.deals.length;
    let totalEscrowVal = memoryCache.deals.reduce((acc, d) => acc + (Number(d.total_deal_value) || 0), 0);

    if (supabaseConnected) {
      try {
        const [farmersRes, buyersRes, lotsRes, dealsRes] = await Promise.all([
          supabase.from('farmer_profiles').select('id, is_verified'),
          supabase.from('buyer_profiles').select('id, status, is_verified'),
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
          pendingBuyersCount = buyersRes.data.filter(b => b.status === 'PENDING_VERIFICATION' || b.status === 'UNDER_REVIEW' || b.status === 'DOCUMENTS_SUBMITTED' || (!b.is_verified && b.status !== 'REJECTED')).length;
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
        console.warn('Supabase getAdminStats notice:', err.message);
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
      supabaseStatus: { connected: supabaseConnected, url: SUPABASE_URL }
    };
  },

  // Log Immutable Audit Event (Canonical Architecture AG-004 & Page 19)
  logAuditEvent: async ({ actor_id, actor_role, action, entity, entity_id, previous_state, new_state, metadata, request_id, ip_address, user_agent }) => {
    try {
      const event = {
        actor_id: actor_id || null,
        action,
        entity,
        entity_id,
        previous_state: previous_state ? (typeof previous_state === 'object' ? JSON.stringify(previous_state) : String(previous_state)) : null,
        new_state: new_state ? (typeof new_state === 'object' ? JSON.stringify(new_state) : String(new_state)) : null,
        request_id: request_id || `req-${Date.now()}`
      };

      if (supabaseConnected) {
        const { error } = await supabase.from('audit_events').insert([event]);
        if (error) {
          console.warn('⚠️ Supabase audit_events write warning:', error.message);
        }
      }
      return event;
    } catch (err) {
      console.warn('⚠️ Audit event logging failure:', err.message);
      return null;
    }
  },

  // Retrieve Audit Trail for an Entity (Canonical Section 7 & AG-004)
  getAuditEvents: async ({ entity, entity_id, limit = 50 }) => {
    try {
      if (supabaseConnected) {
        let query = supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(limit);
        if (entity) query = query.eq('entity', entity);
        if (entity_id) query = query.eq('entity_id', entity_id);
        const { data, error } = await query;
        if (!error && data) return data;
      }
      return [];
    } catch (err) {
      console.warn('⚠️ getAuditEvents error:', err.message);
      return [];
    }
  }
};

export default db;
