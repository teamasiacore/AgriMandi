import { useState, useEffect } from 'react';
import { MarketObservationDTO } from '@agrimandi/shared-types';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface MarketLiveFeedProps {
  lang: 'mr' | 'hi' | 'en';
}

export function MarketLiveFeed({ lang }: MarketLiveFeedProps) {
  const [observations, setObservations] = useState<MarketObservationDTO[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceTag, setSourceTag] = useState<string>('AGMARKNET');

  useEffect(() => {
    setLoading(true);
    const query = selectedCrop !== 'all' ? `?commodity=${selectedCrop}` : '';
    fetch(`/api/v1/market-observations${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setObservations(data.data);
          if (data.meta?.source) setSourceTag(data.meta.source);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch market observations:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCrop]);

  const labels = {
    mr: {
      heading: 'अधिकृत मंडी संदर्भ भाव (Maharashtra APMC)',
      subheading: 'data.gov.in AGMARKNET थेट दैनिक आवक व भाव संदर्भ',
      commodity: 'शेतमाल',
      market: 'बाजार समिती (APMC)',
      modalPrice: 'सरासरी भाव (Modal)',
      priceRange: 'किमान - कमाल भाव',
      arrivals: 'दैनिक आवक',
      disclaimer: 'टीप: हे भाव केवळ संदर्भ माहितीसाठी आहेत. थेट खरेदीदार दर करारानुसार निश्चित होतात.',
      allCrops: 'सर्व पिके',
    },
    hi: {
      heading: 'आधिकारिक मंडी संदर्भ भाव (Maharashtra APMC)',
      subheading: 'data.gov.in AGMARKNET दैनिक आवक व मूल्य संदर्भ',
      commodity: 'फसल',
      market: 'कृषि उपज मंडी',
      modalPrice: 'मॉडल भाव (Modal)',
      priceRange: 'न्यूनतम - अधिकतम',
      arrivals: 'दैनिक आवक',
      disclaimer: 'नोट: यह मूल्य केवल संदर्भ हेतु है। सीधे खरीदार भाव अनुबंध के अनुसार तय होते हैं।',
      allCrops: 'सभी फसलें',
    },
    en: {
      heading: 'Official Mandi Benchmark Prices (Maharashtra APMC)',
      subheading: 'Official daily arrivals and prices via data.gov.in / AGMARKNET',
      commodity: 'Commodity',
      market: 'APMC Market',
      modalPrice: 'Modal Price',
      priceRange: 'Min - Max Range',
      arrivals: 'Daily Arrivals',
      disclaimer: 'Note: Mandi prices are indicative references. Direct mill contracts are established transparently upon buyer offer acceptance.',
      allCrops: 'All Crops',
    },
  }[lang];

  const crops = [
    { id: 'all', label: labels.allCrops },
    { id: 'Soyabean', label: lang === 'mr' ? 'सोयाबीन' : lang === 'hi' ? 'सोयाबीन' : 'Soybean' },
    { id: 'Cotton', label: lang === 'mr' ? 'कापूस' : lang === 'hi' ? 'कपास' : 'Cotton' },
    { id: 'Onion', label: lang === 'mr' ? 'कांदा' : lang === 'hi' ? 'प्याज' : 'Onion' },
    { id: 'Tur', label: lang === 'mr' ? 'तूर' : lang === 'hi' ? 'अरहर (तूर)' : 'Tur / Arhar' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-agri-sandBorder p-5 md:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-agri-primary" />
            <h2 className="text-lg font-extrabold text-agri-dark tracking-tight">
              {labels.heading}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{labels.subheading}</p>
        </div>

        {/* Source Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{sourceTag}</span>
        </div>
      </div>

      {/* Crop Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {crops.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCrop(c.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCrop === c.id
                ? 'bg-agri-dark text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Live Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-agri-primary" />
          लोड होत आहे...
        </div>
      ) : observations.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">माहिती उपलब्ध नाही.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-2.5 px-3">{labels.commodity}</th>
                <th className="py-2.5 px-3">{labels.market}</th>
                <th className="py-2.5 px-3">{labels.priceRange}</th>
                <th className="py-2.5 px-3 text-right">{labels.modalPrice}</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">{labels.arrivals}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {observations.map((obs, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div>{obs.commodity}</div>
                    {obs.variety && (
                      <span className="text-[11px] text-slate-400 font-normal">{obs.variety}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <span className="font-medium">{obs.market}</span>
                    <span className="text-xs text-slate-400 ml-1">({obs.district})</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                    ₹{obs.minPrice.toLocaleString('en-IN')} - ₹{obs.maxPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-agri-dark font-mono text-base">
                    ₹{obs.modalPrice.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal"> /क्विंटल</span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs hidden sm:table-cell">
                    {obs.arrivals ? `${obs.arrivals.toLocaleString('en-IN')} qtl` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reference Notice */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span>{labels.disclaimer}</span>
      </div>
    </div>
  );
}
