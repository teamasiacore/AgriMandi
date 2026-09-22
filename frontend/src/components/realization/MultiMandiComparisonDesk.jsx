import React from 'react';
import { 
  Trophy, AlertTriangle, ArrowRight, ShieldCheck, 
  MapPin, Truck, ChevronRight, Sparkles, Scale, Info
} from 'lucide-react';

export default function MultiMandiComparisonDesk({
  comparisonData,
  loading = false,
  currentLang = 'mr',
  onSelectMarket
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#E5DFD4] shadow-xs text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-stone-800 font-heading">
          {currentLang === 'en' ? 'Evaluating Multi-Mandi Haversine Freight & In-Hand Realizations...' 
            : currentLang === 'hi' ? 'सभी मंडियों का हावरसाइन भाड़ा व शुद्ध भाव आंका जा रहा है...' 
            : 'सर्व बाजार समित्यांचे अंतर, वाहतूक खर्च व प्रत्यक्ष हातात येणारा नफा तपासत आहे...'}
        </p>
        <p className="text-xs text-stone-500">
          Comparing real Agmarknet modal rates against vehicle distance tariffs
        </p>
      </div>
    );
  }

  if (!comparisonData || !comparisonData.rankedMarkets || comparisonData.rankedMarkets.length === 0) {
    return null;
  }

  const { optimalMarket, stickerPriceTrap, rankedMarkets, crop, quantityQtl } = comparisonData;

  return (
    <div className="space-y-5">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B4332]/10 border border-[#1B4332]/20 text-[11px] font-bold text-[#1B4332] uppercase tracking-wider mb-1.5">
            <Scale className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>AG-014 • Multi-Mandi In-Hand Comparison</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
            {currentLang === 'en' ? `Multi-Mandi Net Realization Ranking (${crop})`
              : currentLang === 'hi' ? `विभिन्न मंडियों की शुद्ध आय तुलना (${crop})`
              : `विविध बाजार समित्यांची प्रत्यक्ष नफा तुलना (${crop})`}
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            {currentLang === 'en' 
              ? `Distance-adjusted net payout calculated for ${quantityQtl} Quintals (Gross Modal Price minus Freight & Mandi Cess)`
              : currentLang === 'hi'
              ? `${quantityQtl} क्विंटल माल हेतु दूरी अनुसार भाड़ा व मंडी सेस काटकर शुद्ध आमदनी का तुलनात्मक विवरण`
              : `${quantityQtl} क्विंटल मालासाठी अंतरनिहाय वाहतूक व बाजार सेस वजा जाता निव्वळ हातात मिळणाऱ्या रकमेची क्रमवारी`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{rankedMarkets.length} {currentLang === 'en' ? 'Exchanges Evaluated' : 'बाजारपेठा तपासल्या'}</span>
        </div>
      </div>

      {/* 2. Optimal Champion Banner */}
      {optimalMarket && (
        <div className="bg-gradient-to-r from-emerald-800 to-[#1B4332] text-white p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black tracking-wide uppercase shadow-2xs">
                <Trophy className="w-3.5 h-3.5 fill-current" />
                <span>Rank #1 • Best In-Hand Net Realization</span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-bold font-heading">
                {optimalMarket.marketName}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                {currentLang === 'en' 
                  ? `Delivers the highest net take-home earnings of ₹${optimalMarket.netInHandPerQtl}/Qtl. Total payout: ₹${optimalMarket.totalInHand.toLocaleString('en-IN')}`
                  : currentLang === 'hi'
                  ? `सबसे अधिक शुद्ध ₹${optimalMarket.netInHandPerQtl}/क्विंटल किसान के हाथ में पहुंचेगा। कुल भुगतान: ₹${optimalMarket.totalInHand.toLocaleString('en-IN')}`
                  : `शेतकऱ्याच्या हातात सर्वाधिक निव्वळ ₹${optimalMarket.netInHandPerQtl}/क्विंटल मिळतील. एकूण रक्कम: ₹${optimalMarket.totalInHand.toLocaleString('en-IN')}`}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 shrink-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                  {currentLang === 'en' ? 'Net In-Hand Rate' : 'प्रत्यक्ष निव्वळ भाव'}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  ₹{optimalMarket.netInHandPerQtl}
                </span>
                <span className="text-xs text-emerald-200 font-bold ml-1">/Qtl</span>
              </div>

              {onSelectMarket && (
                <button
                  onClick={() => onSelectMarket(optimalMarket)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentLang === 'en' ? 'Select Market' : 'हा पर्याय निवडा'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Sticker Price Trap Alert */}
      {stickerPriceTrap && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-3xl p-5 shadow-2xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-200/60 text-amber-900 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-800 mb-0.5">
                <span>⚠️ Distant Mandi Sticker Price Trap</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-amber-900">
                {currentLang === 'en' ? stickerPriceTrap.explanationEn
                  : currentLang === 'hi' ? stickerPriceTrap.explanationHi
                  : stickerPriceTrap.explanationMr}
              </p>
            </div>
          </div>

          <div className="bg-white/80 px-3.5 py-2 rounded-xl border border-amber-200 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Avoidable Loss</span>
            <span className="text-sm font-mono font-bold text-rose-700">
              -₹{stickerPriceTrap.netLossPerQtl}/Qtl (-₹{stickerPriceTrap.totalLossCash.toLocaleString('en-IN')})
            </span>
          </div>
        </div>
      )}

      {/* 4. Ranked Multi-Mandi Comparison Table */}
      <div className="bg-white rounded-3xl border border-[#E5DFD4] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#E5DFD4] flex items-center justify-between">
          <h4 className="text-sm sm:text-base font-bold font-heading text-[#1B4332]">
            {currentLang === 'en' ? 'Side-by-Side Market Realization Ranking' : 'सर्व बाजार समित्यांची तुलनात्मक क्रमवारी'}
          </h4>
          <span className="text-xs text-stone-500">
            Sorted by Highest Net Realization (₹/Qtl)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[11px] font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
              <tr>
                <th className="py-3 px-4">Rank & Market</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4 text-right">Gross Sticker Rate</th>
                <th className="py-3 px-4 text-right">Freight / Qtl</th>
                <th className="py-3 px-4 text-right">Cess & Hamali</th>
                <th className="py-3 px-4 text-right">Net In-Hand Rate</th>
                <th className="py-3 px-4 text-right font-bold">Total In-Hand Cash</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD4]">
              {rankedMarkets.map((m) => {
                const isRank1 = m.rank === 1;
                return (
                  <tr 
                    key={m.id} 
                    className={`transition-colors ${
                      isRank1 
                        ? 'bg-emerald-50/50 hover:bg-emerald-50' 
                        : 'hover:bg-[#FAF7F2]/60'
                    }`}
                  >
                    {/* Rank & Market */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isRank1 
                            ? 'bg-amber-400 text-stone-900 shadow-2xs' 
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {m.rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-stone-900">
                            <span>{m.marketName}</span>
                            {m.type === 'DIRECT_MILL' && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                Farm Gate
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500">{m.district} District</span>
                        </div>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-stone-600 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-[#C86432] shrink-0" />
                        <span>{m.distanceKm} km</span>
                      </div>
                    </td>

                    {/* Gross Sticker Rate */}
                    <td className="py-3.5 px-4 text-right font-mono text-stone-700 font-semibold">
                      ₹{m.stickerPrice}
                    </td>

                    {/* Freight / Qtl */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {m.breakdown.freightPerQtl > 0 ? (
                        <span className="text-rose-700">-₹{m.breakdown.freightPerQtl}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">₹0</span>
                      )}
                    </td>

                    {/* Cess & Hamali */}
                    <td className="py-3.5 px-4 text-right font-mono text-stone-500">
                      {m.breakdown.mandiCessPerQtl + m.breakdown.handlingPerQtl > 0 ? (
                        <span>-₹{m.breakdown.mandiCessPerQtl + m.breakdown.handlingPerQtl}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">₹0</span>
                      )}
                    </td>

                    {/* Net In-Hand Rate */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-bold text-sm ${
                        isRank1 ? 'text-emerald-800 text-base font-black' : 'text-stone-900'
                      }`}>
                        ₹{m.netInHandPerQtl}
                      </span>
                      <span className="text-[10px] text-stone-500 block">/Qtl</span>
                    </td>

                    {/* Total In-Hand Cash */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-bold text-sm ${
                        isRank1 ? 'text-emerald-800 font-black' : 'text-stone-900'
                      }`}>
                        ₹{m.totalInHand.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      {onSelectMarket && (
                        <button
                          onClick={() => onSelectMarket(m)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isRank1
                              ? 'bg-[#1B4332] text-white hover:bg-[#143427] shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {isRank1 ? 'Optimal' : 'Select'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
