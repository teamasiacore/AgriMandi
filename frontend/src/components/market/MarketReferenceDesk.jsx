import React, { useState, useEffect } from 'react';
import { 
  Sparkles, RefreshCw, Filter, LayoutGrid, List, Search,
  TrendingUp, TrendingDown, MapPin, ShieldCheck, Clock, AlertTriangle 
} from 'lucide-react';
import api from '../../services/api';
import MarketReferenceCard from './MarketReferenceCard';

const CORE_COMMODITIES = [
  { id: 'all', name: 'All Commodities', nameMr: 'सर्व पिके', nameHi: 'सभी फसलें' },
  { id: 'Soyabean', name: 'Soyabean', nameMr: 'सोयाबीन', nameHi: 'सोयाबीन' },
  { id: 'Cotton', name: 'Cotton', nameMr: 'कापूस', nameHi: 'कपास' },
  { id: 'Gram (Chana)', name: 'Gram (Chana)', nameMr: 'हरभरा (चना)', nameHi: 'चना' },
  { id: 'Arhar (Tur/Red Gram)', name: 'Arhar (Tur)', nameMr: 'तूर', nameHi: 'अरहर (तूर)' },
  { id: 'Onion', name: 'Onion', nameMr: 'कांदा', nameHi: 'प्याज' },
  { id: 'Wheat', name: 'Wheat', nameMr: 'गहू', nameHi: 'गेहूं' },
  { id: 'Maize', name: 'Maize', nameMr: 'मका', nameHi: 'मक्का' }
];

const CORE_DISTRICTS = ['all', 'Latur', 'Nashik', 'Solapur', 'Jalna', 'Akola', 'Pune'];

export default function MarketReferenceDesk({ currentLang = 'mr' }) {
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [onlyLiveToday, setOnlyLiveToday] = useState(false);

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReferencePrices = () => {
    setLoading(true);
    setError('');

    const params = {
      commodity: selectedCommodity,
      district: selectedDistrict,
      limit: 60
    };

    api.getLiveRates(params)
      .then(res => {
        setRates(res.records || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Agmarknet price feed: ' + (err.message || ''));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReferencePrices();
  }, [selectedCommodity, selectedDistrict]);

  // Client-side filtering for search & freshness
  const filteredRates = rates.filter(r => {
    if (onlyLiveToday && !r.is_live_today) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchMarket = (r.market || '').toLowerCase().includes(q);
      const matchCrop = (r.commodity || '').toLowerCase().includes(q);
      const matchDistrict = (r.district || '').toLowerCase().includes(q);
      if (!matchMarket && !matchCrop && !matchDistrict) return false;
    }
    return true;
  });

  // Calculate high-level summary KPIs
  const totalObs = filteredRates.length;
  const avgPrice = totalObs > 0 
    ? Math.round(filteredRates.reduce((acc, curr) => acc + Number(curr.modal_price || 0), 0) / totalObs)
    : 0;
  const aboveMspCount = filteredRates.filter(r => r.msp_status === 'ABOVE_MSP').length;
  const liveTodayCount = filteredRates.filter(r => r.is_live_today).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Real Agmarknet Source Status */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5DFD4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B4332]/10 border border-[#1B4332]/20 text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>AG-009 • Canonical Market Reference & MSP Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-[#1B4332]">
            {currentLang === 'mr' ? 'महाराष्ट्र बाजार भाव संदर्भ व हमीभाव' : currentLang === 'hi' ? 'महाराष्ट्र मंडी भाव संदर्भ एवं एमएसपी' : 'Maharashtra APMC Live Reference & MSP Intelligence'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time feed ingested from Agmarknet (<code className="font-mono text-stone-700">data.gov.in</code>) • Zero mock mathematics • 100% Verified APMC arrivals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReferencePrices}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] hover:bg-[#E5DFD4]/50 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1B4332]' : ''}`} />
            <span>{currentLang === 'mr' ? 'ताजे करा' : currentLang === 'hi' ? 'ताज़ा करें' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Active Mandi Feeds</span>
          <span className="text-2xl font-bold font-heading text-[#1B4332] mt-1 block">{totalObs}</span>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Core APMC exchanges</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Avg Modal Price</span>
          <span className="text-2xl font-bold font-heading text-[#1B4332] mt-1 block">₹{avgPrice.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-stone-500 mt-0.5 block">per quintal average</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Trading Above MSP</span>
          <span className="text-2xl font-bold font-heading text-emerald-700 mt-1 block">{aboveMspCount}</span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Premium realized</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86432] block">Live Today Sessions</span>
          <span className="text-2xl font-bold font-heading text-[#C86432] mt-1 block">{liveTodayCount}</span>
          <span className="text-[10px] text-stone-500 mt-0.5 block">{totalObs - liveTodayCount} past ref / holiday</span>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5DFD4] shadow-xs space-y-4">
        
        {/* Commodity Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CORE_COMMODITIES.map(c => {
            const label = currentLang === 'mr' ? c.nameMr : currentLang === 'hi' ? c.nameHi : c.name;
            const isSelected = selectedCommodity === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCommodity(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-stone-700 hover:bg-[#E5DFD4]/60 border border-[#E5DFD4]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar: District, Search, Live Toggle, and View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E5DFD4]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* District dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] text-xs font-bold text-stone-700 cursor-pointer"
            >
              <option value="all">All 6 Core Districts</option>
              {CORE_DISTRICTS.filter(d => d !== 'all').map(d => (
                <option key={d} value={d}>{d} District</option>
              ))}
            </select>

            {/* Live Today Filter Toggle */}
            <button
              onClick={() => setOnlyLiveToday(!onlyLiveToday)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                onlyLiveToday
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-[#FAF7F2] text-stone-600 border-[#E5DFD4] hover:bg-stone-100'
              }`}
            >
              {onlyLiveToday ? '✓ Live Today Only' : 'Show All Days'}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search market or crop..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs text-stone-800 focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-[#E5DFD4] p-0.5 bg-[#FAF7F2]">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Results Display */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E5DFD4] p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1B4332] animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-700">Connecting to Agmarknet & Supabase Cloud...</p>
          <p className="text-xs text-stone-500">Querying real APMC daily price observations</p>
        </div>
      ) : filteredRates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5DFD4] p-12 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="text-base font-bold text-stone-800">No APMC records found matching this filter</h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try resetting commodity or district filters. Prices are sourced directly from Agmarknet reports.
          </p>
          <button
            onClick={() => { setSelectedCommodity('all'); setSelectedDistrict('all'); setSearchQuery(''); setOnlyLiveToday(false); }}
            className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold cursor-pointer hover:bg-[#143427] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRates.map((record, idx) => (
            <MarketReferenceCard
              key={`${record.market}_${record.commodity}_${record.arrival_date}_${idx}`}
              record={record}
              currentLang={currentLang}
            />
          ))}
        </div>
      ) : (
        /* COMPARATIVE TABLE VIEW */
        <div className="bg-white rounded-3xl border border-[#E5DFD4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[11px] font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
                <tr>
                  <th className="py-3.5 px-4">APMC Market</th>
                  <th className="py-3.5 px-4">District</th>
                  <th className="py-3.5 px-4">Commodity & Variety</th>
                  <th className="py-3.5 px-4 text-right">Min Rate</th>
                  <th className="py-3.5 px-4 text-right">Modal Rate</th>
                  <th className="py-3.5 px-4 text-right">Max Rate</th>
                  <th className="py-3.5 px-4 text-center">Govt MSP Status</th>
                  <th className="py-3.5 px-4 text-center">Arrival Freshness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD4]">
                {filteredRates.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1B4332] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C86432] shrink-0" />
                      <span>{r.market}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{r.district}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block">{r.commodity}</span>
                      <span className="text-[10px] text-stone-500">{r.variety || 'FAQ Standard'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-stone-600">₹{Number(r.min_price).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900 text-sm">
                      ₹{Number(r.modal_price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-stone-600">₹{Number(r.max_price).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-center">
                      {r.msp ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.msp_status === 'ABOVE_MSP'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {r.msp_status === 'ABOVE_MSP' ? `▲ +₹${r.msp_delta} Above MSP` : `▼ -₹${Math.abs(r.msp_delta)} Below MSP`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-medium">NAFED PSF</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.is_live_today ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Live Today</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-mono font-medium">
                          {r.arrival_date || 'Past Ref'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
