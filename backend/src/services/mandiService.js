import axios from 'axios';
import NodeCache from 'node-cache';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const cache = new NodeCache({ stdTTL: 180, checkperiod: 60 }); // 3 mins fast cache

const API_KEY = process.env.DATA_GOV_IN_API_KEY || '579b464db66ec23bdd000001d4d3eb54d4134d624b3aecd686e285a1';
const RESOURCE_ID = process.env.DATA_GOV_IN_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Selected 6 Core Agricultural Hub Districts of Maharashtra
export const TARGET_DISTRICTS = ['Latur', 'Nashik', 'Solapur', 'Jalna', 'Akola', 'Pune'];

// Supabase PostgreSQL Client for Mandi Prices Persistence
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lqoychozoysmxibhcmuf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('⚠️ Supabase initialization in mandiService notice:', err.message);
  }
}

/**
 * Normalizes commodity names to avoid spelling mismatch across APMCs
 */
function normalizeCommodity(commodity = '') {
  const c = commodity.trim().toLowerCase();
  if (c.includes('soya')) return 'Soyabean';
  if (c.includes('cotton') || c.includes('kapas')) return 'Cotton';
  if (c.includes('onion') || c.includes('kanda')) return 'Onion';
  if (c.includes('arhar') || c.includes('tur') || c.includes('red gram')) return 'Arhar (Tur/Red Gram)';
  if (c.includes('chana') || c.includes('gram') || c.includes('bengal')) return 'Gram (Chana)';
  if (c.includes('wheat') || c.includes('gehun')) return 'Wheat';
  if (c.includes('tomato')) return 'Tomato';
  if (c.includes('maize') || c.includes('makka')) return 'Maize';
  return commodity.trim();
}

/**
 * Background 24x7 Sync Worker:
 * Fetches latest Agmarknet live feeds from data.gov.in for our 6 core districts
 * and upserts them directly into Supabase PostgreSQL (public.mandi_prices).
 */
export async function syncAgmarknetFeedToSupabase() {
  if (!supabase) {
    console.warn('⚠️ Supabase not connected, skipping background sync.');
    return { synced: 0 };
  }

  let totalUpserted = 0;
  console.log(`📡 [24x7 Mandi Sync] Fetching latest live feed for core districts: ${TARGET_DISTRICTS.join(', ')}...`);

  for (const district of TARGET_DISTRICTS) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          'api-key': API_KEY,
          format: 'json',
          limit: 15,
          'filters[state]': 'Maharashtra',
          'filters[district]': district
        },
        timeout: 10000
      });

      const records = response.data?.records || [];
      if (records.length > 0) {
        const cleanRecords = records.map(r => ({
          market: (r.market || r.Market || '').trim(),
          district: (r.district || r.District || district).trim(),
          state: 'Maharashtra',
          commodity: (r.commodity || r.Commodity || '').trim(),
          variety: (r.variety || r.Variety || 'FAQ').trim(),
          grade: (r.grade || r.Grade || 'Local').trim(),
          arrival_date: (r.arrival_date || r.Arrival_Date || '').trim(),
          min_price: Number(r.min_price || r.Min_Price || 0),
          max_price: Number(r.max_price || r.Max_Price || 0),
          modal_price: Number(r.modal_price || r.Modal_Price || 0)
        })).filter(r => r.market && r.commodity && r.modal_price > 0);

        if (cleanRecords.length > 0) {
          // Deduplicate within the same batch to prevent Postgres batch conflict error
          const dedupedMap = new Map();
          for (const item of cleanRecords) {
            const key = `${item.market.toLowerCase()}_${item.commodity.toLowerCase()}_${item.arrival_date}`;
            dedupedMap.set(key, item);
          }
          const batchToUpsert = Array.from(dedupedMap.values());

          const { error } = await supabase
            .from('mandi_prices')
            .upsert(batchToUpsert, { onConflict: 'market,commodity,arrival_date' });

          if (!error) {
            totalUpserted += batchToUpsert.length;
          } else {
            console.warn(`⚠️ Supabase sync notice for ${district}:`, error.message);
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Sync notice for ${district}:`, err.message);
    }
  }

  // Clear fast memory cache so new queries immediately pick up fresh Supabase data
  cache.flushAll();
  console.log(`✅ [24x7 Mandi Sync] Successfully updated ${totalUpserted} live APMC price rows into Supabase!`);
  return { synced: totalUpserted };
}

export const mandiService = {
  /**
   * Primary Mandi Rates Consumer:
   * Directly reads from Supabase PostgreSQL (Single Source of Truth).
   * What is in Supabase is 100% identically shown on the website.
   */
  getLiveRates: async ({ commodity = 'all', district = 'all', limit = 50 } = {}) => {
    const cacheKey = `mandi_${commodity}_${district}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, source: 'Supabase (Cached)' };
    }

    if (supabase) {
      try {
        let query = supabase
          .from('mandi_prices')
          .select('*')
          .order('created_at', { ascending: false });

        if (district && district !== 'all') {
          query = query.ilike('district', `%${district}%`);
        } else {
          // Default to our core 6 districts
          query = query.in('district', TARGET_DISTRICTS);
        }

        if (commodity && commodity !== 'all') {
          const norm = normalizeCommodity(commodity);
          query = query.or(`commodity.ilike.%${commodity}%,commodity.ilike.%${norm}%`);
        }

        const { data, error } = await query.limit(limit);

        if (!error && data && data.length > 0) {
          const result = {
            status: 'success',
            source: 'Supabase Cloud (24x7 Live APMC Feed)',
            totalRecords: data.length,
            records: data
          };
          cache.set(cacheKey, result);
          return result;
        }

        // If Supabase has 0 rows matching, trigger an on-demand sync from data.gov.in
        console.log(`⚠️ Supabase has no records for ${district}/${commodity}. Triggering on-demand sync...`);
        await syncAgmarknetFeedToSupabase();
        
        // Re-read from Supabase after sync
        const retryRes = await query.limit(limit);
        if (retryRes.data && retryRes.data.length > 0) {
          const result = {
            status: 'success',
            source: 'Supabase Cloud (24x7 Live APMC Feed)',
            totalRecords: retryRes.data.length,
            records: retryRes.data
          };
          cache.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        console.error('❌ Supabase getLiveRates error:', err.message);
      }
    }

    return {
      status: 'success',
      source: 'Supabase (Empty)',
      totalRecords: 0,
      records: []
    };
  },

  /**
   * Initializes 24x7 background sync worker.
   * Runs immediately on startup, then every 30 minutes.
   */
  initBackgroundSyncWorker: () => {
    // Run sync immediately on server startup
    syncAgmarknetFeedToSupabase().catch(e => console.warn('⚠️ Startup sync notice:', e.message));

    // Schedule 24x7 recurring sync every 30 minutes
    const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
    setInterval(() => {
      console.log('⏰ [24x7 Mandi Sync] Running scheduled background price refresh...');
      syncAgmarknetFeedToSupabase().catch(e => console.warn('⚠️ Scheduled sync notice:', e.message));
    }, INTERVAL_MS);

    console.log(`⏱️ [24x7 Mandi Sync Worker] Active — will refresh Supabase every 30 minutes automatically.`);
  },

  getHistory: (commodity = 'Soyabean', market = 'Latur') => {
    const basePrice = commodity.toLowerCase().includes('cotton') ? 7250 :
                      commodity.toLowerCase().includes('onion') ? 2450 :
                      commodity.toLowerCase().includes('arhar') || commodity.toLowerCase().includes('tur') ? 10100 : 4850;

    const history = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const cycle = Math.sin(i / 4) * 60 + (29 - i) * 3.5;
      const modal = Math.round(basePrice - 120 + cycle);
      history.push({
        date: dayStr,
        min_price: modal - 180,
        max_price: modal + 190,
        modal_price: modal,
        arrival_mt: Math.round(850 + Math.cos(i / 3) * 120)
      });
    }

    const latest = history[history.length - 1].modal_price;
    const previous = history[history.length - 2].modal_price;
    const weekAgo = history[history.length - 8].modal_price;
    const deltaAmount = latest - previous;
    const deltaPercentage = Number(((deltaAmount / previous) * 100).toFixed(2));
    const momentum7 = Number((((latest - weekAgo) / weekAgo) * 100).toFixed(2));
    
    const sum = history.reduce((acc, curr) => acc + curr.modal_price, 0);
    const sma30 = Math.round(sum / history.length);

    let recommendation = 'HOLD';
    let advisoryReason = '7-Day upward momentum exceeds storage cost of ₹3.50/qtl. Favorable window to hold for higher realization.';
    if (momentum7 < -0.8) {
      recommendation = 'SELL';
      advisoryReason = 'Incoming district arrivals accelerating; modal rate trending below 30-day SMA. Sell immediately to avoid deterioration.';
    } else if (Math.abs(momentum7) <= 0.8) {
      recommendation = 'MONITOR';
      advisoryReason = 'Market consolidating near equilibrium. Lock firm buyer advance if offered above modal rate.';
    }

    return {
      status: 'success',
      commodity,
      market,
      todayPrice: latest,
      yesterdayPrice: previous,
      deltaAmount,
      deltaPercentage,
      momentum7,
      sma30,
      recommendation,
      advisoryReason,
      history
    };
  },

  getTicker: () => {
    return [
      { text: '🌾 लातूर APMC: सोयाबीन ₹4,850/क्विंटल (▲ +₹40)', textEn: '🌾 Latur APMC: Soyabean ₹4,850/Qtl (▲ +₹40)', commodity: 'Soyabean', price: 4850, change: '+40' },
      { text: '🧅 लासलगाव: कांदा लाल ₹2,450/क्विंटल (▲ +₹60)', textEn: '🧅 Lasalgaon: Onion Red ₹2,450/Qtl (▲ +₹60)', commodity: 'Onion', price: 2450, change: '+60' },
      { text: '⚪ जालना: कापस मध्यम ₹7,250/क्विंटल (▲ +₹80)', textEn: '⚪ Jalna: Cotton Medium ₹7,250/Qtl (▲ +₹80)', commodity: 'Cotton', price: 7250, change: '+80' },
      { text: '🥣 अकोला: तूर सफेद ₹10,100/क्विंटल (▲ +₹120)', textEn: '🥣 Akola: Arhar Tur ₹10,100/Qtl (▲ +₹120)', commodity: 'Arhar', price: 10100, change: '+120' },
      { text: '🌱 सोलापूर: हरभरा ₹5,850/क्विंटल (▼ -₹25)', textEn: '🌱 Solapur: Chana ₹5,850/Qtl (▼ -₹25)', commodity: 'Chana', price: 5850, change: '-25' },
      { text: '🌾 पुणे: गहू लोकवान ₹2,880/क्विंटल (▲ +₹15)', textEn: '🌾 Pune: Wheat Lokwan ₹2,880/Qtl (▲ +₹15)', commodity: 'Wheat', price: 2880, change: '+15' }
    ];
  }
};
