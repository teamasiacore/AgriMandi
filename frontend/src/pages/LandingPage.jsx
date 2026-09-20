import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, ShieldCheck, Truck, ArrowRight, CheckCircle2, 
  MapPin, RefreshCw, BarChart3, Building2, ChevronRight,
  Info, Phone, Mail
} from 'lucide-react';
import api from '../services/api';
import { translations } from '../utils/translations';

export default function LandingPage({ currentLang = 'mr' }) {
  const [ticker, setTicker] = useState([]);
  const [liveRates, setLiveRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showAboutData, setShowAboutData] = useState(false);
  const [ratesError, setRatesError] = useState(false);

  // Interactive Realization Quick Calculator state
  const [calcCrop, setCalcCrop] = useState('Soybean');
  const [calcQty, setCalcQty] = useState(50);
  const [calcDistrict, setCalcDistrict] = useState('Latur');
  const [realizationResult, setRealizationResult] = useState(null);

  const t = translations[currentLang] || translations.mr;

  useEffect(() => {
    // Fetch live marquee ticker
    api.getTicker()
      .then(res => setTicker(res.trades || []))
      .catch(() => {});

    // Fetch live mandi rates
    fetchRates();

    // Trigger initial calculation
    calculateNetRealization();
  }, []);

  const fetchRates = () => {
    setLoadingRates(true);
    setRatesError(false);
    api.getLiveRates({ commodity: selectedCrop, district: selectedDistrict })
      .then(res => {
        setLiveRates(res.records || []);
        setLoadingRates(false);
      })
      .catch(() => {
        setRatesError(true);
        setLoadingRates(false);
      });
  };

  useEffect(() => {
    fetchRates();
  }, [selectedCrop, selectedDistrict]);

  const calculateNetRealization = () => {
    api.calculateRealization({
      crop: calcCrop,
      quantityQtl: calcQty,
      farmerDistrict: calcDistrict
    }).then(res => setRealizationResult(res))
      .catch(() => {});
  };

  const isLiveToday = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const today = new Date();
      const d = String(today.getDate()).padStart(2, '0');
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const y = String(today.getFullYear());
      return parts[0] === d && parts[1] === m && parts[2] === y;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      
      {/* Live Continuous Marquee Ticker */}
      <div className="bg-[#1B4332] text-[#FAF7F2] py-2.5 overflow-hidden border-b border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider bg-[#C86432] text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {t.liveTickerTitle}
          </span>
          <div className="overflow-hidden relative w-full">
            <div className="animate-ticker flex gap-8 whitespace-nowrap text-xs font-medium">
              {ticker.length > 0 ? (
                ticker.concat(ticker).map((item, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span>{currentLang === 'en' ? item.textEn : item.text}</span>
                    <span className="text-emerald-300">●</span>
                  </span>
                ))
              ) : (
                <span>Latur: Soybean ₹4,850/Qtl | Lasalgaon: Onion ₹2,450/Qtl | Jalna: Cotton ₹7,250/Qtl | Akola: Tur ₹10,100/Qtl</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[#FCFAF6] to-[#FAF7F2] border-b border-[#E5DFD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EDE2] border border-[#E5DFD4] text-[#1B4332] text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#C86432]" />
                {t.heroTag}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#1B4332] leading-[1.15]">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  to="/farmer"
                  className="px-5 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {t.farmerBtn}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/buyer"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#F3EDE2] text-[#1B4332] border-2 border-[#1B4332] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {t.buyerBtn}
                  <Building2 className="w-4 h-4 text-[#C86432]" />
                </Link>
                <Link
                  to="/transporter"
                  className="px-5 py-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1B4332] border-2 border-[#E5DFD4] hover:border-[#1B4332] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {t.transporterBtn || (currentLang === 'en' ? 'I provide Logistics or Storage' : currentLang === 'hi' ? 'मैं ट्रांसपोर्टर / भंडारण प्रदाता हूँ' : 'मी वाहतूकदार / साठवणूकदार आहे')}
                  <Truck className="w-4 h-4 text-[#C86432]" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E5DFD4] grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-semibold text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.trust1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.trust2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.trust3}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.trust4}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Quick Highlight Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-[#E5DFD4] relative">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD4]">
                  <div>
                    <span className="text-xs font-bold text-[#C86432] uppercase tracking-wider">{t.benchTag}</span>
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-[#1B4332]">{t.benchTitle}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md shrink-0">
                    {t.benchActive}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Traditional APMC Route */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-500 font-medium">{t.benchApmcTitle}</p>
                      <p className="text-lg font-bold text-stone-800">
                        ₹{realizationResult?.apmcRoute?.stickerPrice || 4850} <span className="text-xs font-normal">{t.benchPerQtl}</span>
                      </p>
                      <p className="text-[11px] text-red-600 font-medium">{t.benchApmcDeductions}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500 font-medium">{t.benchNetInHand}</p>
                      <p className="text-lg font-bold text-stone-700">
                        ₹{realizationResult?.apmcRoute?.netInHandPerQtl || 4600} / Qtl
                      </p>
                    </div>
                  </div>

                  {/* AgriMandi Direct Purchase */}
                  <div className="p-4 rounded-xl bg-[#1B4332] text-white shadow-md flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#DE7C4A] uppercase">{t.benchDirectTitle}</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        ₹{realizationResult?.directRoute?.netInHandPerQtl || 4820} <span className="text-xs font-normal">{t.benchPerQtl}</span>
                      </p>
                      <p className="text-[11px] text-emerald-300 font-medium">{t.benchDirectAdvantage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-300 font-medium">{t.benchNetInHand}</p>
                      <p className="text-xl font-bold text-emerald-400">
                        ₹{realizationResult?.directRoute?.netInHandPerQtl || 4820} / Qtl
                      </p>
                      <span className="inline-block mt-1 text-[10px] bg-[#C86432] px-2 py-0.5 rounded font-bold">
                        {t.benchExtraBenefit}: +₹{(realizationResult?.directRoute?.netExtraEarning || 11000).toLocaleString()}*
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footnote Disclaimer */}
                <div className="mt-3 text-[10px] text-stone-500 leading-tight">
                  * {t.benchDisclaimer}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5DFD4] flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-[#1B4332]" />
                    {t.benchTruckNote}
                  </span>
                  <Link to="/farmer" className="text-[#1B4332] font-bold hover:underline flex items-center gap-1">
                    {t.benchCalcLink} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Mandi Rates Explorer Section */}
      <section className="py-16 bg-[#FAF7F2] border-b border-[#E5DFD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C86432] mb-1">
                <BarChart3 className="w-4 h-4" />
                data.gov.in / AGMARKNET
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1B4332]">
                {t.mandiTitle}
              </h2>
              <p className="text-sm text-stone-600 mt-1 max-w-2xl">
                {t.mandiSub}
              </p>
            </div>

            {/* Filters & About Data Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E5DFD4] bg-white text-xs font-bold text-stone-700 focus:outline-hidden focus:border-[#1B4332]"
              >
                <option value="all">{t.allCrops}</option>
                <option value="Soyabean">{t.soybean}</option>
                <option value="Cotton">{t.cotton}</option>
                <option value="Onion">{t.onion}</option>
                <option value="Arhar (Tur/Red Gram)">{t.tur}</option>
                <option value="Gram (Chana)">{t.chana}</option>
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E5DFD4] bg-white text-xs font-bold text-stone-700 focus:outline-hidden focus:border-[#1B4332]"
              >
                <option value="all">{t.allDistricts}</option>
                <option value="Latur">Latur</option>
                <option value="Nashik">Nashik</option>
                <option value="Jalna">Jalna</option>
                <option value="Solapur">Solapur</option>
                <option value="Akola">Akola</option>
                <option value="Pune">Pune</option>
              </select>

              <button
                onClick={() => setShowAboutData(!showAboutData)}
                className="px-3 py-2 rounded-lg border border-[#E5DFD4] bg-white hover:bg-[#F3EDE2] text-xs font-bold text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="About AGMARKNET Data"
              >
                <Info className="w-4 h-4 text-[#C86432]" />
                <span>{t.aboutData}</span>
              </button>

              <button
                onClick={fetchRates}
                className="p-2 rounded-lg border border-[#E5DFD4] bg-white hover:bg-[#F3EDE2] text-stone-600 transition-colors cursor-pointer"
                title="Refresh Rates"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRates ? 'animate-spin text-[#1B4332]' : ''}`} />
              </button>
            </div>
          </div>

          {/* About Data Drawer / Callout */}
          {showAboutData && (
            <div className="mb-6 p-5 bg-[#FCFAF6] border border-[#E5DFD4] rounded-2xl text-xs text-stone-700 space-y-2 shadow-xs transition-all">
              <div className="flex items-center justify-between font-bold text-[#1B4332] text-sm border-b border-[#E5DFD4] pb-2">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C86432]" />
                  {t.aboutData} • data.gov.in / AGMARKNET
                </span>
                <button 
                  onClick={() => setShowAboutData(false)}
                  className="text-stone-400 hover:text-stone-700 font-bold px-2 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="leading-relaxed">
                <strong className="text-[#1B4332]">{t.aboutDataSourceLabel || 'Data Source:'}</strong> {t.aboutDataSourceText}
              </p>
              <p className="leading-relaxed">
                <strong className="text-[#1B4332]">{t.aboutModalPriceLabel || 'Modal Price:'}</strong> {t.aboutModalPriceText}
              </p>
              <p className="leading-relaxed text-stone-600 bg-white/60 p-2.5 rounded-lg border border-[#E5DFD4]">
                <strong className="text-[#C86432]">{t.aboutNoticeLabel || 'Notice:'}</strong> {t.aboutNoticeText}
              </p>
            </div>
          )}

          {/* Rates Table */}
          <div className="bg-white rounded-2xl border border-[#E5DFD4] shadow-xs overflow-hidden">
            {/* Mobile swipe hint */}
            <div className="sm:hidden px-4 py-2 bg-[#FCFAF6] border-b border-[#E5DFD4] text-[11px] text-stone-500 flex items-center justify-between">
              <span>👉 {currentLang === 'en' ? 'Swipe horizontally for full rates' : currentLang === 'hi' ? 'पूरे भाव देखने हेतु दायें-बायें स्वाइप करें' : 'संपूर्ण भाव पाहण्यासाठी डावीकडे/उजवीकडे स्वाइप करा'}</span>
              <span className="font-bold text-[#1B4332]">data.gov.in</span>
            </div>

            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
                <thead className="bg-[#FCFAF6] border-b border-[#E5DFD4] text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">{t.colApmc}</th>
                    <th className="py-3.5 px-4">{t.colDistrict}</th>
                    <th className="py-3.5 px-4">{t.colCommodity}</th>
                    <th className="py-3.5 px-4">{t.colVariety}</th>
                    <th className="py-3.5 px-4 text-right">{t.colMin}</th>
                    <th className="py-3.5 px-4 text-right">{t.colMax}</th>
                    <th className="py-3.5 px-4 text-right">{t.colModal}</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD4] text-stone-700 font-medium">
                  {loadingRates ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-stone-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1B4332]" />
                        {t.loadingRates}
                      </td>
                    </tr>
                  ) : ratesError ? (
                    <tr>
                      <td colSpan="8" className="py-12 px-4 text-center text-stone-600">
                        <div className="max-w-md mx-auto space-y-2">
                          <p className="font-bold text-amber-800 text-sm">⚠️ {t.apiErrorText || 'Unable to load market reference rates.'}</p>
                          <p className="text-xs text-stone-500">Official data.gov.in / AGMARKNET feed temporarily delayed or offline.</p>
                          <div className="pt-3 flex items-center justify-center gap-3">
                            <button
                              onClick={fetchRates}
                              className="px-4 py-2 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                            >
                              {t.retryBtn || 'Retry Search'}
                            </button>
                            <button
                              onClick={() => { setSelectedCrop('all'); setSelectedDistrict('all'); }}
                              className="px-4 py-2 bg-white border border-[#E5DFD4] text-stone-700 text-xs font-bold rounded-lg hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                            >
                              {t.resetBtn || 'Reset Filters'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : liveRates.length > 0 ? (
                    liveRates.map((r, i) => (
                      <tr key={i} className="hover:bg-[#FCFAF6] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#1B4332] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C86432] shrink-0" />
                          {r.market}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">{r.district}</td>
                        <td className="py-3.5 px-4 font-semibold text-stone-900">{r.commodity}</td>
                        <td className="py-3.5 px-4 text-stone-500 text-xs">{r.variety || 'FAQ'}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-stone-600">₹{r.min_price}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-stone-600">₹{r.max_price}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-lg text-[#1B4332]">
                          ₹{r.modal_price}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isLiveToday(r.arrival_date) ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                {currentLang === 'mr' ? 'थेट आजचे' : currentLang === 'hi' ? 'आज का भाव' : 'Live Today'}
                              </span>
                              <span className="text-[9px] text-stone-500 font-mono mt-0.5">{r.arrival_date}</span>
                            </div>
                          ) : (
                            <div 
                              className="inline-flex flex-col items-center" 
                              title={currentLang === 'en' ? 'Reference price from previous trading day or mandi holiday' : currentLang === 'hi' ? '२४ घंटे से पुराना संदर्भ भाव (मंडी अवकाश)' : '२४ तासांपेक्षा जुना संदर्भ भाव (बाजार सुट्टी)'}
                            >
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {currentLang === 'mr' ? 'संदर्भ भाव' : currentLang === 'hi' ? 'संदर्भ भाव' : 'Past Ref'}
                              </span>
                              <span className="text-[9px] text-amber-700 font-mono font-medium mt-0.5">{r.arrival_date || 'Previous'}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-12 px-4 text-center text-stone-600">
                        <div className="max-w-md mx-auto space-y-2">
                          <p className="font-bold text-stone-800 text-sm">{t.noRatesFound}</p>
                          <p className="text-xs text-stone-500">Source: data.gov.in / AGMARKNET • Official daily feed</p>
                          <div className="pt-3 flex items-center justify-center gap-3">
                            <button
                              onClick={() => { setSelectedCrop('all'); setSelectedDistrict('all'); }}
                              className="px-4 py-2 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                            >
                              {t.resetBtn || 'Reset Filters'}
                            </button>
                            <button
                              onClick={fetchRates}
                              className="px-4 py-2 bg-white border border-[#E5DFD4] text-stone-700 text-xs font-bold rounded-lg hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                            >
                              {t.retryBtn || 'Retry Search'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* Net Realization Interactive Calculator Section */}
      <section className="py-16 bg-[#FCFAF6] border-b border-[#E5DFD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C86432]">
              {t.calcTag}
            </span>
            <h2 className="text-3xl font-bold font-heading text-[#1B4332] mt-1">
              {t.calcTitle}
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              {t.calcSub}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Parameters */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5DFD4] shadow-sm space-y-4">
              <h4 className="font-bold text-[#1B4332] text-base border-b border-[#E5DFD4] pb-3">
                {t.calcStep1}
              </h4>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.labelCommodity}</label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-semibold text-stone-800"
                >
                  <option value="Soybean">{t.soybean}</option>
                  <option value="Cotton">{t.cotton}</option>
                  <option value="Onion">{t.onion}</option>
                  <option value="Arhar (Tur)">{t.tur}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.labelQuantity}</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={calcQty}
                  onChange={(e) => setCalcQty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-semibold text-stone-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.labelDistrict}</label>
                <select
                  value={calcDistrict}
                  onChange={(e) => setCalcDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-semibold text-stone-800"
                >
                  <option value="Latur">Latur</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Jalna">Jalna</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Akola">Akola</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-stone-600 leading-relaxed border border-[#E5DFD4]">
                💡 {t.calcHowItWorks}
              </div>
            </div>

            {/* Output Calculation Result */}
            <div className="lg:col-span-7">
              {realizationResult && realizationResult.apmcRoute && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Traditional APMC Route */}
                  <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-red-100">
                        <span className="text-xs font-bold text-red-700 uppercase">{t.apmcRouteTitle}</span>
                        <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">APMC</span>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-stone-600">
                          <span>{t.apmcSticker}</span>
                          <span className="font-mono font-bold">₹{realizationResult.apmcRoute.stickerPrice}/Qtl</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>{t.apmcFreight}</span>
                          <span className="font-mono">-₹{realizationResult.apmcRoute.freightPerQtl}/Qtl</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>{t.apmcCess}</span>
                          <span className="font-mono">-₹{realizationResult.apmcRoute.mandiCessPerQtl + realizationResult.apmcRoute.handlingPerQtl}/Qtl</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-red-100">
                      <p className="text-xs text-stone-500 font-medium">{t.apmcNetReturn}</p>
                      <p className="text-2xl font-bold font-mono text-stone-800">
                        ₹{realizationResult.apmcRoute.netInHandPerQtl} <span className="text-xs font-normal">/ Qtl</span>
                      </p>
                      <p className="text-xs font-bold text-stone-600 mt-1">
                        {t.apmcTotal} ₹{realizationResult.apmcRoute.totalPayout.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* AgriMandi Direct Route */}
                  <div className="bg-[#1B4332] text-white p-5 rounded-2xl border border-[#2D6A4F] shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#2D6A4F]">
                        <span className="text-xs font-bold text-[#DE7C4A] uppercase">{t.directRouteTitle}</span>
                        <span className="text-[10px] bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded font-bold">Farm-Gate</span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-stone-200">
                        <div className="flex justify-between">
                          <span>{t.directGateRate}</span>
                          <span className="font-mono font-bold text-white">₹{realizationResult.directRoute.netInHandPerQtl}/Qtl</span>
                        </div>
                        <div className="flex justify-between text-emerald-300">
                          <span>{t.directFreightFree}</span>
                        </div>
                        <div className="flex justify-between text-emerald-300">
                          <span>{t.directCessFree}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#2D6A4F]">
                      <p className="text-xs text-stone-300 font-medium">{t.directNetReturn}</p>
                      <p className="text-2xl font-bold font-mono text-emerald-400">
                        ₹{realizationResult.directRoute.netInHandPerQtl} <span className="text-xs font-normal text-white">/ Qtl</span>
                      </p>
                      <p className="text-xs font-bold text-stone-200 mt-1">
                        {t.directTotal} ₹{realizationResult.directRoute.totalPayout.toLocaleString()}
                      </p>

                      <div className="mt-3 p-2.5 bg-[#C86432] rounded-lg text-center font-bold text-xs shadow-xs text-white">
                        {t.directExtraProfit} +₹{realizationResult.directRoute.netExtraEarning.toLocaleString()}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Assumptions & Accuracy Disclaimer */}
              <div className="mt-4 p-4 bg-white rounded-xl border border-[#E5DFD4] text-xs text-stone-600 leading-relaxed shadow-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C86432] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1B4332]">{t.calcTag}: </span>
                  {t.calcDisclaimer}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section (5 Concrete Steps) */}
      <section className="py-16 bg-[#FAF7F2] border-b border-[#E5DFD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C86432]">{t.howItWorksTag}</span>
            <h2 className="text-3xl font-bold font-heading text-[#1B4332] mt-1">
              {t.howItWorksTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#1B4332] border border-[#E5DFD4] flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h4 className="text-sm font-bold font-heading text-[#1B4332]">{t.step1Title}</h4>
                <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#1B4332] border border-[#E5DFD4] flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h4 className="text-sm font-bold font-heading text-[#1B4332]">{t.step2Title}</h4>
                <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#1B4332] border border-[#E5DFD4] flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h4 className="text-sm font-bold font-heading text-[#1B4332]">{t.step3Title}</h4>
                <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#1B4332] border border-[#E5DFD4] flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h4 className="text-sm font-bold font-heading text-[#1B4332]">{t.step4Title}</h4>
                <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                  {t.step4Desc}
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#1B4332] border border-[#E5DFD4] flex items-center justify-center font-bold text-sm mb-3">
                  5
                </div>
                <h4 className="text-sm font-bold font-heading text-[#1B4332]">{t.step5Title}</h4>
                <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                  {t.step5Desc}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Assisted Digital Support Callout */}
      <section className="py-10 bg-[#FCFAF6] border-b border-[#E5DFD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1B4332] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-2.5 py-1 rounded bg-[#C86432] text-white text-[11px] font-bold uppercase tracking-wider">
                {currentLang === 'en' ? 'Assisted Digital Support' : currentLang === 'hi' ? 'सहायता केंद्र' : 'सहाय्यता केंद्र'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading">
                {currentLang === 'en' ? 'Need help selling or checking prices?' : currentLang === 'hi' ? 'फसल बिक्री या भाव जांचने में सहायता चाहिए?' : 'शेतमाल विक्री किंवा भाव तपासणीसाठी मदत हवी आहे?'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 max-w-xl">
                {currentLang === 'en' 
                  ? 'Our Maharashtra support team assists farmers and FPOs with lot listing, quality documentation, and buyer coordination in Marathi, Hindi, and English.' 
                  : currentLang === 'hi'
                  ? 'हमारी टीम किसानों और FPOs को लॉट पंजीकरण, गुणवत्ता कागजात और खरीदार समन्वय में सीधे सहायता प्रदान करती है।'
                  : 'आमची सहाय्यता टीम शेतकरी आणि FPO संस्थांना लॉट नोंदणी, गुणवत्ता पडताळणी व खरेदीदार समन्वयासाठी मार्गदर्शन करते.'}
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <a 
                href="tel:+918605168653"
                className="px-5 py-3 rounded-xl bg-white text-[#1B4332] font-bold text-xs hover:bg-[#FAF7F2] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4 text-[#C86432]" />
                +91 8605168653
              </a>
              <a 
                href="mailto:asiacore.tech@gmail.com"
                className="px-5 py-3 rounded-xl bg-[#C86432] text-white font-bold text-xs hover:bg-[#DE7C4A] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Mail className="w-4 h-4" />
                asiacore.tech@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B4332] text-[#FAF7F2] py-12 border-t border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/AgriMandi Logo without background.png" 
                  alt="AgriMandi" 
                  className="h-10 w-auto brightness-200"
                />
                <span className="text-xl font-bold font-heading text-white">{t.brandTitle}</span>
              </div>
              <p className="text-xs text-stone-300 max-w-sm leading-relaxed">
                {t.footerDesc}
              </p>
              <p className="text-[11px] text-emerald-300">
                {t.footerDataSource}
              </p>
              <div className="p-3.5 rounded-xl bg-[#234e3b] border border-[#2D6A4F] text-[11px] text-stone-300 leading-relaxed max-w-lg">
                {t.footerDisclaimer}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#DE7C4A] mb-3">{t.quickLinks}</h5>
              <ul className="space-y-2 text-xs text-stone-300 font-medium">
                <li><Link to="/farmer" className="hover:text-white transition-colors">{t.navFarmer}</Link></li>
                <li><Link to="/buyer" className="hover:text-white transition-colors">{t.navBuyer}</Link></li>
                <li><Link to="/transporter" className="hover:text-white transition-colors">{t.navTransporter || (currentLang === 'en' ? 'Logistics / Storage' : currentLang === 'hi' ? 'परिवहन / भंडारण' : 'वाहतूक / साठवणूक')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">{t.signIn}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">{t.register}</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#DE7C4A] mb-3">{t.safetyLegal}</h5>
              <p className="text-xs text-stone-300 leading-relaxed">
                {t.footerCompliance}
              </p>
              <div className="mt-3 pt-3 border-t border-[#2D6A4F] text-[11px] text-stone-300 space-y-1">
                <div><span className="text-[#DE7C4A] font-bold">Assistance:</span> +91 8605168653</div>
                <div><span className="text-[#DE7C4A] font-bold">Email:</span> asiacore.tech@gmail.com</div>
              </div>
              <div className="mt-4 text-[11px] text-emerald-400 font-medium">
                {t.footerRights}
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
