import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, PlusCircle, ShieldCheck, CheckCircle2, 
  MapPin, RefreshCw, BarChart3, Truck, UserCheck, X, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { translations } from '../utils/translations';

export default function FarmerPortal({ currentLang = 'mr' }) {
  const t = translations[currentLang] || translations.mr;

  const [activeTab, setActiveTab] = useState('mandi'); // 'mandi' | 'calculator' | 'lots'
  const [liveRates, setLiveRates] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Soyabean');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [loadingRates, setLoadingRates] = useState(false);

  // History & AI Advisory
  const [historyData, setHistoryData] = useState(null);
  const [historyCrop, setHistoryCrop] = useState('Soyabean');

  // Calculator
  const [calcQty, setCalcQty] = useState(60);
  const [calcDistrict, setCalcDistrict] = useState('Latur');
  const [realizationData, setRealizationData] = useState(null);

  // Lots & Offers
  const [myLots, setMyLots] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [dealNotification, setDealNotification] = useState(null);

  // User Profile loaded dynamically from authenticated session
  const [user, setUser] = useState({
    name: 'Farmer User',
    phone: '',
    district: 'Latur',
    village: ''
  });

  // New Lot Form State
  const [lotForm, setLotForm] = useState({
    crop: 'Soybean',
    variety: '',
    quantity_qtl: '',
    expected_price_per_qtl: '',
    moisture_percentage: '',
    district: 'Latur',
    farm_address: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        setLotForm(prev => ({
          ...prev,
          district: u.district || 'Latur',
          farm_address: u.village ? `${u.village}, ${u.district || ''}` : ''
        }));
      } catch (e) {}
    }

    loadMandiRates();
    loadMandiHistory('Soyabean');
    loadLotsAndOffers();
    runCalculator();
  }, []);

  const loadMandiRates = () => {
    setLoadingRates(true);
    api.getLiveRates({ commodity: selectedCrop, district: selectedDistrict })
      .then(res => {
        setLiveRates(res.records || []);
        setLoadingRates(false);
      })
      .catch(() => setLoadingRates(false));
  };

  useEffect(() => {
    loadMandiRates();
  }, [selectedCrop, selectedDistrict]);

  const loadMandiHistory = (crop) => {
    api.getMandiHistory(crop, 'Latur')
      .then(res => setHistoryData(res))
      .catch(() => {});
  };

  const loadLotsAndOffers = () => {
    api.getLots().then(res => setMyLots(res.lots || [])).catch(() => {});
    api.getOffers().then(res => setOffers(res.offers || [])).catch(() => {});
  };

  const runCalculator = () => {
    api.calculateRealization({
      crop: selectedCrop,
      quantityQtl: calcQty,
      farmerDistrict: calcDistrict
    }).then(res => setRealizationData(res)).catch(() => {});
  };

  useEffect(() => {
    runCalculator();
  }, [selectedCrop, calcQty, calcDistrict]);

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      await api.createLot({
        ...lotForm,
        farmer_name: user.name,
        farmer_phone: user.phone
      });
      setIsListingModalOpen(false);
      // Reset form
      setLotForm({
        crop: 'Soybean',
        variety: '',
        quantity_qtl: '',
        expected_price_per_qtl: '',
        moisture_percentage: '',
        district: user.district || 'Latur',
        farm_address: user.village || ''
      });
      loadLotsAndOffers();
      setActiveTab('lots');
      alert(currentLang === 'en' ? 'Harvest lot published to marketplace successfully!' : 
            currentLang === 'hi' ? 'फसल लॉट सफलतापूर्वक मंडी में प्रकाशित हो गया है!' :
            'आपला शेतीमाल लॉट यशस्वीरित्या बाजारात लिस्ट झाला आहे!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    const confirmMsg = currentLang === 'en' ? 'Accept this digital bid and lock the contract?' :
                       currentLang === 'hi' ? 'क्या आप यह बोली स्वीकार कर सौदा तय करना चाहते हैं?' :
                       'आपण ही बोली स्वीकारून सौदा पक्का करू इच्छिता का?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.acceptOffer(offerId);
      setDealNotification(res.deal);
      loadLotsAndOffers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* Top Farmer Identity Banner */}
      <div className="bg-[#1B4332] text-white py-6 border-b border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#DE7C4A] bg-[#0F261C] px-2.5 py-0.5 rounded">
                  {t.navFarmer}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> {user.is_verified || user.saat_bara_number ? (currentLang === 'en' ? '7/12 Verified Landholder' : currentLang === 'hi' ? '७/१२ सत्यापित किसान' : '७/१२ सत्यापित शेतकरी') : t.farmerVerified}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading mt-1">
                {t.farmerWelcome} {user.name}!
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                {user.village ? `${user.village}, ` : ''}{user.district || 'Latur'} {user.phone ? `| ${user.phone}` : ''}
              </p>
            </div>

            {/* Quick Action: List New Produce */}
            <button
              onClick={() => setIsListingModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#C86432] hover:bg-[#A74D20] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              {t.listProduceBtn}
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#2D6A4F]">
            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statTodayRate}</span>
              <span className="text-lg font-bold font-mono text-emerald-400">₹4,850 <span className="text-xs font-normal text-white">/ Qtl</span></span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">▲ +₹40</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statAiAdvice}</span>
              <span className="text-lg font-bold text-[#F4B236]">
                {historyData ? (
                  historyData.recommendation === 'HOLD'
                    ? (currentLang === 'en' ? 'HOLD' : currentLang === 'hi' ? 'रोके रखें (HOLD)' : 'थांबा (HOLD)')
                    : historyData.recommendation === 'SELL'
                    ? (currentLang === 'en' ? 'SELL NOW' : currentLang === 'hi' ? 'तुरंत बेचें (SELL)' : 'विक्री करा (SELL)')
                    : (currentLang === 'en' ? 'MONITOR' : currentLang === 'hi' ? 'निगरानी रखें (MONITOR)' : 'निरीक्षण करा (MONITOR)')
                ) : (currentLang === 'en' ? 'HOLD' : currentLang === 'hi' ? 'रोके रखें (HOLD)' : 'थांबा (HOLD)')}
              </span>
              <span className="text-[10px] text-stone-300 block mt-0.5">{t.statHoldingProfitable}</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statMyLots}</span>
              <span className="text-lg font-bold font-mono text-white">{myLots.length}</span>
              <span className="text-[10px] text-stone-300 block mt-0.5">{t.statusListed}</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statOffersReceived}</span>
              <span className="text-lg font-bold font-mono text-[#DE7C4A]">{offers.length}</span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">{t.acceptBidBtn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Confirmation Notification Banner (if accepted) */}
      {dealNotification && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-base">
                  {t.dealLockedBannerTitle}
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  ID: <strong>{dealNotification.id}</strong> | {currentLang === 'en' ? 'Buyer:' : currentLang === 'hi' ? 'खरीदार:' : 'खरेदीदार:'} <strong>{dealNotification.buyer_name}</strong> | 
                  {currentLang === 'en' ? ' Price:' : currentLang === 'hi' ? ' भाव:' : ' दर:'} <strong>₹{dealNotification.price_per_qtl}/Qtl</strong> | {currentLang === 'en' ? ' Total:' : currentLang === 'hi' ? ' कुल:' : ' एकूण:'} <strong>₹{dealNotification.total_deal_value.toLocaleString()}</strong>
                </p>
                <p className="text-[11px] text-stone-600 mt-1">
                  {t.dealLockedBannerSub}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDealNotification(null)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Module Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5DFD4] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mandi')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'mandi'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {t.tabRatesAndAi}
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <Truck className="w-4 h-4" />
            {t.tabNetCalc}
          </button>

          <button
            onClick={() => setActiveTab('lots')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'lots'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {t.tabMyLotsAndOffers} ({myLots.length})
          </button>
        </div>

        {/* TAB 1: LIVE MANDI RATES & AI FORECAST */}
        {activeTab === 'mandi' && (
          <div className="mt-6 space-y-6">
            
            {/* AI Recommendation & 30-Day Trend Chart Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD4]">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C86432] uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    data.gov.in Agmarknet Feed
                  </div>
                  <h3 className="text-xl font-bold font-heading text-[#1B4332] mt-0.5">
                    {historyCrop} — {currentLang === 'en' ? '30-Day Price Trend & AI Advisory' : currentLang === 'hi' ? '३०-दिवसीय मूल्य रुझान और AI सलाह' : '३० दिवसांचा दर कल व AI विक्री सल्ला'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={historyCrop}
                    onChange={(e) => {
                      setHistoryCrop(e.target.value);
                      loadMandiHistory(e.target.value);
                    }}
                    className="px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                  >
                    <option value="Soyabean">{t.soybean}</option>
                    <option value="Cotton">{t.cotton}</option>
                    <option value="Onion">{t.onion}</option>
                    <option value="Arhar (Tur/Red Gram)">{t.tur}</option>
                  </select>
                </div>
              </div>

              {/* AI Recommendation Banner */}
              {historyData && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
                  <div className={`md:col-span-4 p-4 rounded-xl border flex flex-col justify-between ${
                    historyData.recommendation === 'HOLD'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : historyData.recommendation === 'SELL'
                      ? 'bg-red-50 border-red-300 text-red-900'
                      : 'bg-blue-50 border-blue-300 text-blue-900'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider">{t.aiModelAdvice}</span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          historyData.recommendation === 'HOLD' ? 'bg-amber-200 text-amber-900' : 'bg-red-200 text-red-900'
                        }`}>
                          {historyData.recommendation === 'HOLD' 
                            ? (currentLang === 'en' ? 'HOLD' : currentLang === 'hi' ? 'रोके रखें (HOLD)' : 'थांबा (HOLD)')
                            : historyData.recommendation === 'SELL'
                            ? (currentLang === 'en' ? 'SELL NOW' : currentLang === 'hi' ? 'तुरंत बेचें (SELL)' : 'विक्री करा (SELL)')
                            : (currentLang === 'en' ? 'MONITOR' : currentLang === 'hi' ? 'निगरानी रखें (MONITOR)' : 'निरीक्षण करा (MONITOR)')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mt-3 leading-relaxed">
                        {historyData.recommendation === 'HOLD' ? (
                          currentLang === 'en' 
                            ? '7-Day upward momentum exceeds storage cost of ₹3.50/qtl. Favorable window to hold harvest for higher realization.'
                            : currentLang === 'hi'
                              ? '७-दिवसीय मूल्य बढ़त भंडारण लागत (₹३.५०/क्विंटल) से अधिक है। बेहतर मूल्य प्राप्ति हेतु माल रोक कर रखना लाभदायक है।'
                              : '७ दिवसांचा वाढता मोमेंटम साठवणूक खर्चापेक्षा जास्त आहे (₹३.५०/क्विंटल). चांगल्या नफ्यासाठी माल रोखून ठेवणे फायदेशीर ठरेल.'
                        ) : historyData.recommendation === 'SELL' ? (
                          currentLang === 'en'
                            ? 'Incoming district arrivals accelerating; modal rate trending below 30-day SMA. Sell immediately to avoid margin deterioration.'
                            : currentLang === 'hi'
                              ? 'मंडियों में आवक बढ़ रही है और भाव ३०-दिन के औसत से नीचे जा रहा है। नुकसान से बचने के लिए तुरंत बिक्री करें।'
                              : 'बाजार समित्यांमध्ये आवक वेगाने वाढते आहे व दर ३० दिवसांच्या सरासरी खाली घसरतो आहे. घट टाळण्यासाठी तात्काळ विक्री करावी.'
                        ) : (
                          currentLang === 'en'
                            ? 'Market consolidating near equilibrium. Lock firm buyer advance if offered at or above modal rate.'
                            : currentLang === 'hi'
                              ? 'बाजार स्थिर स्तर पर है। यदि खरीदार मॉडल दर पर भुगतान दे रहा हो तो अग्रिम सौदा तय करें।'
                              : 'बाजार स्थिर पातळीवर आहे. खरेदीदार सरासरी भावापेक्षा चांगला दर देत असल्यास ॲडव्हान्स घेऊन सौदा पक्का करावा.'
                        )}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>{t.sma30Label}</span>
                        <span className="font-mono font-bold">₹{historyData.sma30}/Qtl</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.momentum7Label}</span>
                        <span className="font-mono font-bold text-emerald-700">+{historyData.momentum7}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.storageCostLabel}</span>
                        <span className="font-mono font-bold">₹0.50 / Day / Qtl</span>
                      </div>
                    </div>
                  </div>

                  {/* Recharts Price Trajectory */}
                  <div className="md:col-span-8 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData.history}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B4332" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1B4332" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD4" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716C' }} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#78716C' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#FCFAF6', border: '1px solid #E5DFD4', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value) => [`₹${value}/Qtl`, t.chartModalPrice]}
                        />
                        <Area type="monotone" dataKey="modal_price" stroke="#1B4332" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Live Agmarknet Rates Grid */}
            <div className="bg-white rounded-2xl border border-[#E5DFD4] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#FCFAF6] border-b border-[#E5DFD4] flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-bold font-heading text-base text-[#1B4332]">
                  {t.mandiTitle}
                </h4>
                
                <div className="flex gap-2">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-white text-xs font-bold text-stone-700"
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
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-white text-xs font-bold text-stone-700"
                  >
                    <option value="all">{t.allDistricts}</option>
                    <option value="Latur">{currentLang === 'en' ? 'Latur' : 'लातूर'}</option>
                    <option value="Nashik">{currentLang === 'en' ? 'Nashik' : currentLang === 'hi' ? 'नासिक' : 'नाशिक'}</option>
                    <option value="Jalna">{currentLang === 'en' ? 'Jalna' : 'जालना'}</option>
                    <option value="Solapur">{currentLang === 'en' ? 'Solapur' : currentLang === 'hi' ? 'सोलापुर' : 'सोलापूर'}</option>
                    <option value="Akola">{currentLang === 'en' ? 'Akola' : 'अकोला'}</option>
                    <option value="Pune">{currentLang === 'en' ? 'Pune' : 'पुणे'}</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF7F2] text-xs font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
                    <tr>
                      <th className="py-3 px-4">{t.colApmc}</th>
                      <th className="py-3 px-4">{t.colDistrict}</th>
                      <th className="py-3 px-4">{t.colCommodity}</th>
                      <th className="py-3 px-4 text-right">{t.colMin}</th>
                      <th className="py-3 px-4 text-right">{t.colMax}</th>
                      <th className="py-3 px-4 text-right">{t.colModal}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD4]">
                    {liveRates.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#FCFAF6]">
                        <td className="py-3 px-4 font-bold text-[#1B4332]">{r.market}</td>
                        <td className="py-3 px-4 text-stone-600">{r.district}</td>
                        <td className="py-3 px-4 font-semibold text-stone-900">{r.commodity}</td>
                        <td className="py-3 px-4 text-right font-mono text-stone-600">₹{r.min_price}</td>
                        <td className="py-3 px-4 text-right font-mono text-stone-600">₹{r.max_price}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#1B4332] text-base">
                          ₹{r.modal_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: NET REALIZATION CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
              <div className="max-w-xl">
                <span className="text-xs font-bold text-[#C86432] uppercase">{t.calcTag}</span>
                <h3 className="text-2xl font-bold font-heading text-[#1B4332] mt-0.5">
                  {t.calcTitle}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  {t.calcSub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.labelCommodity}</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-semibold"
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
                    value={calcQty}
                    onChange={(e) => setCalcQty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.labelDistrict}</label>
                  <select
                    value={calcDistrict}
                    onChange={(e) => setCalcDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-semibold"
                  >
                    <option value="Latur">{currentLang === 'en' ? 'Latur' : 'लातूर'}</option>
                    <option value="Solapur">{currentLang === 'en' ? 'Solapur' : currentLang === 'hi' ? 'सोलापुर' : 'सोलापूर'}</option>
                    <option value="Jalna">{currentLang === 'en' ? 'Jalna' : 'जालना'}</option>
                    <option value="Nashik">{currentLang === 'en' ? 'Nashik' : currentLang === 'hi' ? 'नासिक' : 'नाशिक'}</option>
                    <option value="Akola">{currentLang === 'en' ? 'Akola' : 'अकोला'}</option>
                  </select>
                </div>
              </div>

              {/* Comparison Output Cards */}
              {realizationData && realizationData.apmcRoute && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  
                  {/* APMC Route */}
                  <div className="bg-red-50/40 p-5 rounded-xl border border-red-200">
                    <span className="text-xs font-bold text-red-700 uppercase">{t.apmcRouteTitle}</span>
                    <div className="mt-4 space-y-2 text-xs text-stone-700">
                      <div className="flex justify-between">
                        <span>{t.apmcSticker}</span>
                        <span className="font-mono font-bold">₹{realizationData.apmcRoute.stickerPrice}/Qtl</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>{t.apmcFreight}</span>
                        <span className="font-mono">-₹{realizationData.apmcRoute.freightPerQtl}/Qtl</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>{t.apmcCess}</span>
                        <span className="font-mono">-₹{realizationData.apmcRoute.mandiCessPerQtl + realizationData.apmcRoute.handlingPerQtl}/Qtl</span>
                      </div>
                      <div className="pt-3 border-t border-red-200 flex justify-between font-bold text-stone-800 text-sm">
                        <span>{t.apmcNetReturn}</span>
                        <span className="font-mono text-red-700">₹{realizationData.apmcRoute.netInHandPerQtl} / Qtl</span>
                      </div>
                      <div className="flex justify-between text-stone-600 text-xs">
                        <span>{t.apmcTotal}</span>
                        <span className="font-mono font-bold">₹{realizationData.apmcRoute.totalPayout.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* AgriMandi Direct Route */}
                  <div className="bg-[#1B4332] text-white p-5 rounded-xl border border-[#2D6A4F] shadow-md">
                    <span className="text-xs font-bold text-[#DE7C4A] uppercase">{t.directRouteTitle}</span>
                    <div className="mt-4 space-y-2 text-xs text-stone-200">
                      <div className="flex justify-between">
                        <span>{t.directGateRate}</span>
                        <span className="font-mono font-bold text-white">₹{realizationData.directRoute.netInHandPerQtl}/Qtl</span>
                      </div>
                      <div className="flex justify-between text-emerald-300">
                        <span>{t.directFreightFree}</span>
                      </div>
                      <div className="flex justify-between text-emerald-300">
                        <span>{t.directCessFree}</span>
                      </div>
                      <div className="pt-3 border-t border-[#2D6A4F] flex justify-between font-bold text-emerald-400 text-sm">
                        <span>{t.directNetReturn}</span>
                        <span className="font-mono text-xl">₹{realizationData.directRoute.netInHandPerQtl} / Qtl</span>
                      </div>
                      <div className="flex justify-between text-stone-300 text-xs">
                        <span>{t.directTotal}</span>
                        <span className="font-mono font-bold text-white">₹{realizationData.directRoute.totalPayout.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-2.5 bg-[#C86432] rounded-lg text-center font-bold text-xs">
                      🎉 {t.directExtraProfit} +₹{realizationData.directRoute.netExtraEarning.toLocaleString()}
                    </div>
                  </div>

                </div>
              )}

              {/* Nearby Matching Buyers */}
              {realizationData && realizationData.directRoute && realizationData.directRoute.matchingBuyers && (
                <div className="mt-8 pt-6 border-t border-[#E5DFD4]">
                  <h4 className="text-sm font-bold text-[#1B4332] mb-3">
                    {t.verifiedBuyersNearby}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {realizationData.directRoute.matchingBuyers.slice(0, 3).map((b) => (
                      <div key={b.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1B4332]">{b.company_name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">GSTIN ✓</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{b.city} ({b.distanceKm} km)</p>
                        <p className="text-xs font-bold text-stone-700 mt-2">{currentLang === 'en' ? 'Rate:' : currentLang === 'hi' ? 'भाव:' : 'दर:'} ₹{b.offeredRate}/Qtl</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: MY LISTED LOTS & RECEIVED OFFERS */}
        {activeTab === 'lots' && (
          <div className="mt-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                  {t.statMyLots}
                </h3>
                <p className="text-xs text-stone-500">
                  {t.tabMyLotsAndOffers}
                </p>
              </div>

              <button
                onClick={() => setIsListingModalOpen(true)}
                className="px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" /> {t.listProduceBtn}
              </button>
            </div>

            {/* Empty State vs Lots Grid */}
            {myLots.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-[#E5DFD4] text-center max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-[#1B4332] mb-4">
                  <PlusCircle className="w-7 h-7 text-[#C86432]" />
                </div>
                <h4 className="text-lg font-bold font-heading text-[#1B4332]">
                  {currentLang === 'en' ? 'No Harvest Lots Listed' : currentLang === 'hi' ? 'कोई लॉट लिस्ट नहीं है' : 'कोणताही लॉट लिस्ट केलेला नाही'}
                </h4>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {t.noLotsYet}
                </p>
                <button
                  onClick={() => setIsListingModalOpen(true)}
                  className="mt-5 px-5 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F] transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> {t.listProduceBtn}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myLots.map((lot) => {
                  const lotOffers = offers.filter(o => o.lot_id === lot.id);
                  return (
                    <div key={lot.id} className="bg-white rounded-2xl p-5 border border-[#E5DFD4] shadow-xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5DFD4]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold font-heading text-[#1B4332]">
                              {lot.crop} ({lot.variety})
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                              lot.status === 'DEAL_LOCKED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {lot.status === 'DEAL_LOCKED' ? t.statusLocked : t.statusListed}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            ID: {lot.id} | {lot.farm_address}, {lot.district}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-stone-400 block">{t.fieldQty}</span>
                            <span className="font-bold font-mono text-stone-800 text-base">{lot.quantity_qtl} {currentLang === 'en' ? 'Qtl' : 'क्विंटल'}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{t.fieldPrice}</span>
                            <span className="font-bold font-mono text-[#1B4332] text-base">₹{lot.expected_price_per_qtl}{currentLang === 'en' ? '/Qtl' : '/क्विंटल'}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{t.fieldMoisture}</span>
                            <span className="font-bold font-mono text-stone-800 text-base">{lot.moisture_percentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Offers under this lot */}
                      <div className="mt-4">
                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                          {t.statOffersReceived} ({lotOffers.length}):
                        </span>

                        {lotOffers.length > 0 ? (
                          <div className="space-y-2">
                            {lotOffers.map((off) => (
                              <div 
                                key={off.id}
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  off.status === 'ACCEPTED'
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : 'bg-[#FAF7F2] border-[#E5DFD4]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#1B4332]">{off.buyer_name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                      off.status === 'ACCEPTED' ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-200 text-stone-700'
                                    }`}>
                                      {off.status === 'ACCEPTED' 
                                        ? (currentLang === 'en' ? 'ACCEPTED' : currentLang === 'hi' ? 'स्वीकृत' : 'मंजूर') 
                                        : (currentLang === 'en' ? 'PENDING' : currentLang === 'hi' ? 'लंबित' : 'प्रलंबित')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-600 mt-1">
                                    {currentLang === 'en' ? 'Qty:' : currentLang === 'hi' ? 'मात्रा:' : 'प्रमाण:'} <strong>{off.quantity_requested_qtl} {currentLang === 'en' ? 'Qtl' : 'क्विंटल'}</strong> | {currentLang === 'en' ? 'Destination:' : currentLang === 'hi' ? 'गंतव्य:' : 'पोहोच ठिकाण:'} {off.delivery_destination}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <span className="text-[10px] text-stone-400 uppercase block">{t.labelOfferedPrice}</span>
                                    <span className="text-base font-bold font-mono text-[#C86432]">
                                      ₹{off.offered_price_per_qtl} <span className="text-xs text-stone-500 font-normal">{currentLang === 'en' ? '/ Qtl' : '/ क्विंटल'}</span>
                                    </span>
                                    <span className="text-[11px] block font-bold text-stone-600">
                                      {currentLang === 'en' ? 'Total:' : currentLang === 'hi' ? 'कुल:' : 'एकूण:'} ₹{(off.offered_price_per_qtl * off.quantity_requested_qtl).toLocaleString()}
                                    </span>
                                  </div>

                                  {off.status === 'PENDING' && lot.status !== 'DEAL_LOCKED' && (
                                    <button
                                      onClick={() => handleAcceptOffer(off.id)}
                                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                                    >
                                      {t.acceptBidBtn}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-[#FAF7F2] rounded-xl text-center text-xs text-stone-500">
                            {t.noOffersYet}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL: CREATE / LIST PRODUCE LOT */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E5DFD4] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4]">
              <h3 className="text-lg font-bold font-heading text-[#1B4332]">
                🌾 {t.modalAddLotTitle}
              </h3>
              <button
                onClick={() => setIsListingModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldCrop}</label>
                <select
                  value={lotForm.crop}
                  onChange={(e) => setLotForm({ ...lotForm, crop: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                >
                  <option value="Soybean">{t.soybean}</option>
                  <option value="Cotton">{t.cotton}</option>
                  <option value="Onion">{t.onion}</option>
                  <option value="Arhar (Tur)">{t.tur}</option>
                  <option value="Gram (Chana)">{t.chana}</option>
                  <option value="Wheat">{t.wheat}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldVariety}</label>
                <input
                  type="text"
                  value={lotForm.variety}
                  onChange={(e) => setLotForm({ ...lotForm, variety: e.target.value })}
                  placeholder={currentLang === 'en' ? 'e.g. JS-335, FAQ Grade' : currentLang === 'hi' ? 'उदा. जेएस-३३५, एफएक्यू' : 'उदा. जेएस-३३५, एफएक्यू'}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldQty}</label>
                  <input
                    type="number"
                    min="1"
                    value={lotForm.quantity_qtl}
                    onChange={(e) => setLotForm({ ...lotForm, quantity_qtl: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. 50' : 'उदा. ५०'}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldPrice}</label>
                  <input
                    type="number"
                    min="500"
                    value={lotForm.expected_price_per_qtl}
                    onChange={(e) => setLotForm({ ...lotForm, expected_price_per_qtl: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. 4800' : 'उदा. ४८००'}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldMoisture}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lotForm.moisture_percentage}
                    onChange={(e) => setLotForm({ ...lotForm, moisture_percentage: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. 9.5' : 'उदा. ९.५'}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldDistrict}</label>
                  <select
                    value={lotForm.district}
                    onChange={(e) => setLotForm({ ...lotForm, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    <option value="Latur">{currentLang === 'en' ? 'Latur' : 'लातूर'}</option>
                    <option value="Solapur">{currentLang === 'en' ? 'Solapur' : currentLang === 'hi' ? 'सोलापुर' : 'सोलापूर'}</option>
                    <option value="Jalna">{currentLang === 'en' ? 'Jalna' : 'जालना'}</option>
                    <option value="Nashik">{currentLang === 'en' ? 'Nashik' : currentLang === 'hi' ? 'नासिक' : 'नाशिक'}</option>
                    <option value="Akola">{currentLang === 'en' ? 'Akola' : 'अकोला'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldAddress}</label>
                <input
                  type="text"
                  value={lotForm.farm_address}
                  onChange={(e) => setLotForm({ ...lotForm, farm_address: e.target.value })}
                  placeholder={currentLang === 'en' ? 'e.g. Village Ausa, Taluka Ausa' : currentLang === 'hi' ? 'उदा. ग्राम औसा, तहसील औसा' : 'उदा. मौजे औसा, ता. औसा'}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsListingModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-[#FAF7F2]"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-sm"
                >
                  {t.btnPublishLot}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
