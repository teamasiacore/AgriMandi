import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const getCleanEnv = (val) => (val && typeof val === 'string' && val.trim().length > 0 ? val.trim() : null);

// Configuration with reliable production fallbacks
const SUPABASE_URL = getCleanEnv(process.env.SUPABASE_URL) || 'https://lqoychozoysmxibhcmuf.supabase.co';
const SUPABASE_KEY = getCleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || 
  getCleanEnv(process.env.SUPABASE_KEY) || 
  getCleanEnv(process.env.SUPABASE_ANON_KEY) || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3ljaG96b3lzbXhpYmhjbXVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxNzU5OSwiZXhwIjoyMTA1MjkzNTk5fQ.utCd2abUEr2GLcmL6Fwd1gkZ7M7Eqv0VGA_wr2rVrK4';

const API_KEY = getCleanEnv(process.env.DATA_GOV_IN_API_KEY) || '579b464db66ec23bdd000001d4d3eb54d4134d624b3aecd686e285a1';
const RESOURCE_ID = getCleanEnv(process.env.DATA_GOV_IN_RESOURCE_ID) || '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Selected 6 Core Agricultural Hub Districts of Maharashtra (AG-009)
const TARGET_DISTRICTS = ['Latur', 'Nashik', 'Solapur', 'Jalna', 'Akola', 'Pune'];

/**
 * Normalizes commodity names across APMCs
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

async function runMandiSync() {
  console.log('====================================================');
  console.log('🌾 AgriMandi Maharashtra — Scheduled Mandi Price Sync');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`📡 Connecting to Supabase: ${SUPABASE_URL}`);
  console.log('====================================================');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let grandTotalFetched = 0;
  let grandTotalUpserted = 0;
  const districtSummary = [];

  for (const district of TARGET_DISTRICTS) {
    try {
      console.log(`\n🔍 Fetching latest APMC feed for: ${district}...`);
      const response = await axios.get(BASE_URL, {
        params: {
          'api-key': API_KEY,
          format: 'json',
          limit: 25,
          'filters[state]': 'Maharashtra',
          'filters[district]': district
        },
        timeout: 15000
      });

      const records = response.data?.records || [];
      grandTotalFetched += records.length;

      if (records.length === 0) {
        console.log(`   ℹ️ No records returned for ${district} (market holiday or delayed feed).`);
        districtSummary.push({ district, fetched: 0, upserted: 0 });
        continue;
      }

      const cleanRecords = records.map(r => ({
        market: (r.market || r.Market || '').trim(),
        district: (r.district || r.District || district).trim(),
        state: 'Maharashtra',
        commodity: normalizeCommodity(r.commodity || r.Commodity || ''),
        variety: (r.variety || r.Variety || 'FAQ').trim(),
        grade: (r.grade || r.Grade || 'Local').trim(),
        arrival_date: (r.arrival_date || r.Arrival_Date || '').trim(),
        min_price: Number(r.min_price || r.Min_Price || 0),
        max_price: Number(r.max_price || r.Max_Price || 0),
        modal_price: Number(r.modal_price || r.Modal_Price || 0)
      })).filter(r => r.market && r.commodity && r.modal_price > 0 && r.arrival_date);

      if (cleanRecords.length === 0) {
        console.log(`   ⚠️ No valid price records after validation for ${district}.`);
        districtSummary.push({ district, fetched: records.length, upserted: 0 });
        continue;
      }

      // Deduplicate within the same batch to prevent Postgres batch conflict
      const dedupedMap = new Map();
      for (const item of cleanRecords) {
        const key = `${item.market.toLowerCase()}_${item.commodity.toLowerCase()}_${item.arrival_date}`;
        dedupedMap.set(key, item);
      }
      const batchToUpsert = Array.from(dedupedMap.values());

      const { data, error } = await supabase
        .from('mandi_prices')
        .upsert(batchToUpsert, { onConflict: 'market,commodity,arrival_date' });

      if (error) {
        console.error(`   ❌ Supabase upsert error for ${district}:`, error.message);
        districtSummary.push({ district, fetched: records.length, upserted: 0, error: error.message });
      } else {
        console.log(`   ✅ Upserted ${batchToUpsert.length} clean records for ${district}.`);
        grandTotalUpserted += batchToUpsert.length;
        districtSummary.push({ district, fetched: records.length, upserted: batchToUpsert.length });
      }
    } catch (err) {
      console.error(`   ❌ Network / API error for ${district}:`, err.message);
      districtSummary.push({ district, fetched: 0, upserted: 0, error: err.message });
    }
  }

  console.log('\n====================================================');
  console.log('📊 SYNC SUMMARY:');
  console.log(`   Total Districts Checked: ${TARGET_DISTRICTS.length}`);
  console.log(`   Total Raw Records Fetched: ${grandTotalFetched}`);
  console.log(`   Total Records Upserted to Supabase: ${grandTotalUpserted}`);
  console.log('====================================================');

  return { grandTotalFetched, grandTotalUpserted, districtSummary };
}

runMandiSync()
  .then(res => {
    console.log('🎉 Mandi Price Sync completed successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Fatal Mandi Price Sync error:', err);
    process.exit(1);
  });
