import React from 'react';
import { MapPin, TrendingUp, TrendingDown, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function MarketReferenceCard({ record, currentLang = 'mr' }) {
  if (!record) return null;

  const {
    market,
    district,
    commodity,
    commodity_mr,
    commodity_hi,
    variety,
    grade,
    modal_price,
    min_price,
    max_price,
    price_spread,
    msp,
    msp_delta,
    msp_percentage,
    msp_status,
    arrival_date,
    is_live_today,
    is_stale,
    stale_warning,
    source_label
  } = record;

  const commodityDisplay = currentLang === 'mr' ? (commodity_mr || commodity)
    : currentLang === 'hi' ? (commodity_hi || commodity)
    : commodity;

  // Calculate percentage position of modal price between min and max
  const range = (max_price - min_price) || 1;
  const positionPct = Math.max(0, Math.min(100, Math.round(((modal_price - min_price) / range) * 100)));

  return (
    <div className="bg-white rounded-2xl border border-[#E5DFD4] p-5 shadow-2xs hover:shadow-md transition-all hover:border-[#C86432]/40 flex flex-col justify-between space-y-4">
      
      {/* Top Bar: Market Location & Arrival Freshness */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[#1B4332] font-bold text-sm">
            <MapPin className="w-3.5 h-3.5 text-[#C86432] shrink-0" />
            <span className="truncate">{market} APMC</span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium pl-5 block">
            {district} District
          </span>
        </div>

        <div>
          {is_live_today ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{currentLang === 'mr' ? 'थेट आजचे' : currentLang === 'hi' ? 'आज का भाव' : 'Live Today'}</span>
            </span>
          ) : (
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
              title={stale_warning || 'Rollover from previous APMC trading day'}
            >
              <Clock className="w-3 h-3 text-amber-700" />
              <span>{currentLang === 'mr' ? 'संदर्भ भाव' : currentLang === 'hi' ? 'संदर्भ भाव' : 'Past Ref'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Commodity & Price Highlight */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-stone-900 font-heading">
            {commodityDisplay}
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-stone-600 border border-[#E5DFD4] font-medium">
            {variety || 'FAQ'} {grade && grade !== 'Local' ? `• ${grade}` : ''}
          </span>
        </div>

        <div className="pt-2 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1B4332] tracking-tight">
              ₹{Number(modal_price).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500 font-bold ml-1">/ Quintal</span>
          </div>

          <span className="text-[11px] text-stone-500 font-mono">
            Spread: ±₹{price_spread || 0}
          </span>
        </div>
      </div>

      {/* Visual Min - Modal - Max Price Range Gauge */}
      <div className="space-y-1.5 pt-1">
        <div className="relative w-full h-2 rounded-full bg-stone-100 border border-[#E5DFD4] overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-600 rounded-full"
            style={{ width: `${positionPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-stone-500">
          <span>Min: ₹{Number(min_price).toLocaleString('en-IN')}</span>
          <span className="font-bold text-[#1B4332]">Modal: ₹{Number(modal_price).toLocaleString('en-IN')}</span>
          <span>Max: ₹{Number(max_price).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Govt MSP Benchmark Indicator */}
      <div className="pt-1">
        {msp ? (
          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
            msp_status === 'ABOVE_MSP' 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : msp_status === 'BELOW_MSP'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-blue-50/80 border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-center gap-1.5">
              {msp_status === 'ABOVE_MSP' ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-bold">
                {msp_status === 'ABOVE_MSP' ? `+₹${msp_delta} (${msp_percentage}%) Above MSP` : `-₹${Math.abs(msp_delta)} (${Math.abs(msp_percentage)}%) Below MSP`}
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-stone-600">
              Govt MSP: ₹{Number(msp).toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium">Market Equilibrium Rate</span>
            <span className="text-[11px] font-mono">NAFED PSF Benchmark</span>
          </div>
        )}
      </div>

      {/* Stale Data Warning Bar (if older than today) */}
      {is_stale && (
        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{stale_warning || `Reported on ${arrival_date}`}</span>
        </div>
      )}

      {/* Footer Attributions */}
      <div className="pt-2 border-t border-[#E5DFD4] flex items-center justify-between text-[10px] text-stone-500 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Agmarknet (data.gov.in)</span>
        </span>
        <span>Arrival: {arrival_date}</span>
      </div>

    </div>
  );
}
