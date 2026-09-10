import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, PlusCircle, ShieldCheck, CheckCircle2, 
  MapPin, RefreshCw, BarChart3, Truck, UserCheck, X, AlertCircle,
  Calculator, Sparkles, ArrowRight, ArrowUpRight, Check, Info, ShieldAlert, Award
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

  // Calculator State (Net Realization Engine)
  const [calcCrop, setCalcCrop] = useState('Soybean');
  const [calcQty, setCalcQty] = useState(60);
  const [calcDistrict, setCalcDistrict] = useState('Latur');
  const [calcVehicle, setCalcVehicle] = useState('standard_truck');
  const [calcStorageDays, setCalcStorageDays] = useState(0);
  const [calculating, setCalculating] = useState(false);
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
    let u = user;
    if (savedUser) {
      try {
        u = JSON.parse(savedUser);
        setUser(u);
        if (u.district) setCalcDistrict(u.district);
        setLotForm(prev => ({
          ...prev,
          district: u.district || 'Latur',
          farm_address: u.village ? `${u.village}, ${u.district || ''}` : ''
        }));
      } catch (e) {}
    }

    loadMandiRates();
    loadMandiHistory('Soyabean');
    loadLotsAndOffers(u);
    runCalculator({ district: u.district || 'Latur' });
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

  // Strictly filter lots so a farmer ONLY sees their own created lots (Never someone else's dummy lot)
  const loadLotsAndOffers = (currentUser = user) => {
    const filter = currentUser?.phone ? { farmer_phone: currentUser.phone } : {};
    api.getLots(filter).then(res => {
      const allFetched = res.lots || [];
      const userLots = currentUser?.phone 
        ? allFetched.filter(l => l.farmer_phone === currentUser.phone || (currentUser.id && l.farmer_id === currentUser.id))
        : allFetched;
      setMyLots(userLots);
    }).catch(() => setMyLots([]));

    api.getOffers().then(res => setOffers(res.offers || [])).catch(() => setOffers([]));
  };

  // Run Net Realization Calculator
  const runCalculator = async (overrideParams = {}) => {
    setCalculating(true);
    try {
      const payload = {
        crop: overrideParams.crop || calcCrop,
        quantityQtl: Number(overrideParams.qty !== undefined ? overrideParams.qty : calcQty) || 50,
        farmerDistrict: overrideParams.district || calcDistrict,
        vehicleType: overrideParams.vehicle || calcVehicle,
        storageDays: Number(overrideParams.storage !== undefined ? overrideParams.storage : calcStorageDays) || 0
      };
      const res = await api.calculateRealization(payload);
      if (res && res.apmcRoute) {
        setRealizationData(res);
      }
    } catch (err) {
      console.error('Realization calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    runCalculator();
  }, [calcCrop, calcQty, calcDistrict, calcVehicle, calcStorageDays]);

  const handleSelectBuyerForLot = (buyer) => {
    setLotForm(prev => ({
      ...prev,
      crop: calcCrop,
      quantity_qtl: calcQty,
      expected_price_per_qtl: buyer.offeredRate,
      district: user.district || calcDistrict,
      farm_address: user.village ? `${user.village}, ${user.district || calcDistrict}` : (prev.farm_address || '')
    }));
    setIsListingModalOpen(true);
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      await api.createLot({
        ...lotForm,
        farmer_id: user.id || `usr-${user.phone || Date.now()}`,
        farmer_name: user.name || user.full_name || 'Farmer',
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
      loadLotsAndOffers(user);
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
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DFD4] shadow-xs">
              
              {/* Header & Engine Status Badge */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5DFD4]">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C86432] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#C86432]" />
                    {t.calcTag} • DYNAMIC REALIZATION ENGINE
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#1B4332] mt-1">
                    {t.calcTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    {t.calcSub}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-2 rounded-xl border border-[#E5DFD4] self-start lg:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-[#1B4332]">
                    {currentLang === 'en' ? 'Live Agmarknet + Haversine Engine Active' : currentLang === 'hi' ? 'लाइव एगमार्कनेट + हावरसाइन इंजन सक्रिय' : 'लाइव्ह ॲगमार्कनेट + हॅवरसाइन इंजिन सक्रिय'}
                  </span>
                </div>
              </div>

              {/* Calculator Input Controls */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Commodity Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">{t.labelCommodity}</label>
                  <select
                    value={calcCrop}
                    onChange={(e) => setCalcCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  >
                    <option value="Soybean">{t.soybean}</option>
                    <option value="Cotton">{t.cotton}</option>
                    <option value="Onion">{t.onion}</option>
                    <option value="Arhar (Tur)">{t.tur}</option>
                    <option value="Gram (Chana)">{t.chana}</option>
                    <option value="Wheat">{t.wheat}</option>
                  </select>
                </div>

                {/* 2. Total Quantity with Quick Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">{t.labelQuantity}</label>
                    <div className="flex items-center gap-1">
                      {[25, 50, 100].map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setCalcQty(q)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-all ${
                            Number(calcQty) === q ? 'bg-[#1B4332] text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={calcQty}
                    onChange={(e) => setCalcQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs sm:text-sm font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                {/* 3. Farmer's District */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">{t.labelDistrict}</label>
                  <select
                    value={calcDistrict}
                    onChange={(e) => setCalcDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  >
                    <option value="Latur">{currentLang === 'en' ? 'Latur' : 'लातूर'}</option>
                    <option value="Solapur">{currentLang === 'en' ? 'Solapur' : currentLang === 'hi' ? 'सोलापुर' : 'सोलापूर'}</option>
                    <option value="Jalna">{currentLang === 'en' ? 'Jalna' : 'जालना'}</option>
                    <option value="Nashik">{currentLang === 'en' ? 'Nashik' : currentLang === 'hi' ? 'नासिक' : 'नाशिक'}</option>
                    <option value="Akola">{currentLang === 'en' ? 'Akola' : 'अकोला'}</option>
                    <option value="Pune">{currentLang === 'en' ? 'Pune' : 'पुणे'}</option>
                    <option value="Nanded">{currentLang === 'en' ? 'Nanded' : 'नांदेड'}</option>
                    <option value="Nagpur">{currentLang === 'en' ? 'Nagpur' : 'नागपूर'}</option>
                    <option value="Ahmednagar">{currentLang === 'en' ? 'Ahmednagar' : 'अहिल्यानगर'}</option>
                    <option value="Yavatmal">{currentLang === 'en' ? 'Yavatmal' : 'यवतमाळ'}</option>
                    <option value="Amravati">{currentLang === 'en' ? 'Amravati' : 'अमरावती'}</option>
                    <option value="Chhatrapati Sambhajinagar">{currentLang === 'en' ? 'Sambhajinagar' : 'छ. संभाजीनगर'}</option>
                  </select>
                </div>

                {/* 4. Vehicle / Freight Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {currentLang === 'en' ? 'Transport Vehicle' : currentLang === 'hi' ? 'वाहन प्रकार' : 'वाहतूक साधन'}
                  </label>
                  <select
                    value={calcVehicle}
                    onChange={(e) => setCalcVehicle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  >
                    <option value="standard_truck">
                      {currentLang === 'en' ? 'Eicher / Medium Truck (₹4.20/km)' : currentLang === 'hi' ? 'आयशर मीडियम ट्रक (₹४.२०/किमी)' : 'आयशर मध्यम ट्रक (₹४.२०/किमी)'}
                    </option>
                    <option value="pickup">
                      {currentLang === 'en' ? 'Bolero Maxi Truck (₹4.80/km)' : currentLang === 'hi' ? 'बोलेरो पिकअप (₹४.८०/किमी)' : 'बोलेरो पिकअप (₹४.८०/किमी)'}
                    </option>
                    <option value="tractor">
                      {currentLang === 'en' ? 'Tractor Trolley Rural (₹5.20/km)' : currentLang === 'hi' ? 'ट्रैक्टर ट्रॉली ग्रामीण (₹५.२०/किमी)' : 'ट्रॅक्टर ट्रॉली ग्रामीण (₹५.२०/किमी)'}
                    </option>
                  </select>
                </div>

              </div>

              {/* Second Row: Storage Days & Prominent Action Button */}
              <div className="mt-4 pt-4 border-t border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
                    {currentLang === 'en' ? 'Holding Period:' : currentLang === 'hi' ? 'साठवणूक अवधि:' : 'साठवणूक कालावधी:'}
                  </label>
                  <select
                    value={calcStorageDays}
                    onChange={(e) => setCalcStorageDays(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold text-stone-800"
                  >
                    <option value="0">{currentLang === 'en' ? '0 Days (Immediate Sell)' : currentLang === 'hi' ? '० दिन (तुरंत बिक्री)' : '० दिवस (तात्काळ शेतातून विक्री)'}</option>
                    <option value="7">{currentLang === 'en' ? '7 Days Hold (₹3.50/qtl)' : currentLang === 'hi' ? '७ दिन रोकें (₹३.५०/क्विंटल)' : '७ दिवस साठवणूक (₹३.५०/क्विंटल)'}</option>
                    <option value="15">{currentLang === 'en' ? '15 Days Hold (₹7.50/qtl)' : currentLang === 'hi' ? '१५ दिन रोकें (₹७.५०/क्विंटल)' : '१५ दिवस साठवणूक (₹७.५०/क्विंटल)'}</option>
                    <option value="30">{currentLang === 'en' ? '30 Days Hold (₹15.00/qtl)' : currentLang === 'hi' ? '३० दिन रोकें (₹१५.००/क्विंटल)' : '३० दिवस साठवणूक (₹१५.००/क्विंटल)'}</option>
                  </select>
                </div>

                {/* Big Calculate Realization Button */}
                <button
                  type="button"
                  onClick={() => runCalculator()}
                  disabled={calculating}
                  className="w-full sm:w-auto px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-[#DE7C4A]" />
                  <span>
                    {currentLang === 'en' ? 'Calculate Net Realization' : currentLang === 'hi' ? 'खरा नफा मोजें' : 'खरा नफा मोजा'}
                  </span>
                  {calculating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-emerald-300" />
                  )}
                </button>
              </div>

              {/* Dynamic Results Display */}
              {calculating && !realizationData && (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#1B4332] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-500">
                    {currentLang === 'en' ? 'Computing Haversine freight & Agmarknet net realization...' : 'हॅवरसाइन भाडे व प्रत्यक्ष नफा मोजत आहे...'}
                  </p>
                </div>
              )}

              {realizationData && realizationData.apmcRoute && (
                <div className="mt-8 space-y-6">
                  
                  {/* Hero Extra Profit Callout Banner */}
                  <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#DE7C4A] bg-[#0F261C] px-2.5 py-0.5 rounded">
                          {currentLang === 'en' ? 'Farmer Net Advantage' : currentLang === 'hi' ? 'किसान अतिरिक्त लाभ' : 'शेतकरी थेट फायदा'}
                        </span>
                        <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> +{realizationData.directRoute.percentageProfitGain}% {currentLang === 'en' ? 'More Cash' : 'जास्त रोख रक्कम'}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold font-heading mt-1">
                        {currentLang === 'en' ? 'Direct Sale Extra Profit:' : currentLang === 'hi' ? 'सीधी बिक्री से अतिरिक्त लाभ:' : 'थेट विक्रीतून मिळणारा निव्वळ जास्तीचा नफा:'}
                      </h4>
                      <p className="text-xs text-stone-300 mt-0.5">
                        {currentLang === 'en' 
                          ? `On ${calcQty} Qtl ${calcCrop}, you save ₹0 APMC cess, ₹0 freight, and zero middleman cuts.`
                          : `${calcQty} क्विंटल ${calcCrop} वर ०% अडत, ०% सेस आणि मोफत शेतातून वाहतुकीमुळे होणारी थेट बचत.`}
                      </p>
                    </div>

                    <div className="bg-[#C86432] text-white px-6 py-4 rounded-xl text-center shadow-md min-w-[200px]">
                      <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">
                        {t.directExtraProfit}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono block mt-0.5">
                        +₹{realizationData.directRoute.netExtraEarning.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Side-by-Side Detailed Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* ROUTE A: TRADITIONAL APMC MANDI */}
                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-red-200">
                          <div>
                            <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                              {t.apmcRouteTitle}
                            </span>
                            <span className="text-xs text-stone-600 font-medium">
                              {realizationData.apmcRoute.marketName} (~{realizationData.apmcRoute.distanceKm} km)
                            </span>
                          </div>
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                            {currentLang === 'en' ? 'High Deductions' : 'मोठ्या कपाती'}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5 text-xs text-stone-700">
                          <div className="flex justify-between items-center">
                            <span>{t.apmcSticker}</span>
                            <span className="font-mono font-bold text-stone-900 text-sm">₹{realizationData.apmcRoute.stickerPrice} / Qtl</span>
                          </div>

                          <div className="flex justify-between items-center text-red-700">
                            <span className="flex items-center gap-1">
                              • {t.apmcFreight} ({calcVehicle})
                            </span>
                            <span className="font-mono font-bold">-₹{realizationData.apmcRoute.freightPerQtl} / Qtl</span>
                          </div>

                          <div className="flex justify-between items-center text-red-700">
                            <span className="flex items-center gap-1">
                              • {currentLang === 'en' ? 'APMC Mandi Cess & Market Fee (1.05%)' : 'APMC सेस व कर (१.०५%)'}
                            </span>
                            <span className="font-mono font-bold">-₹{realizationData.apmcRoute.mandiCessPerQtl} / Qtl</span>
                          </div>

                          <div className="flex justify-between items-center text-red-700">
                            <span className="flex items-center gap-1">
                              • {currentLang === 'en' ? 'Loading, Unloading & Weighing (Hamali)' : 'हमाली, वाराई व तोलाई (Hamali)'}
                            </span>
                            <span className="font-mono font-bold">-₹{realizationData.apmcRoute.handlingPerQtl} / Qtl</span>
                          </div>

                          {realizationData.apmcRoute.storagePerQtl > 0 && (
                            <div className="flex justify-between items-center text-red-700">
                              <span className="flex items-center gap-1">
                                • {currentLang === 'en' ? `Warehouse Storage (${calcStorageDays} Days)` : `गोदाम भाडे (${calcStorageDays} दिवस)`}
                              </span>
                              <span className="font-mono font-bold">-₹{realizationData.apmcRoute.storagePerQtl} / Qtl</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-red-200/60 flex justify-between items-center text-stone-600 text-[11px]">
                            <span>{currentLang === 'en' ? 'Total Deductions per Qtl:' : 'एकूण कपात प्रति क्विंटल:'}</span>
                            <span className="font-mono font-bold text-red-700">-₹{realizationData.apmcRoute.totalDeductionPerQtl} / Qtl</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-red-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-stone-700">{t.apmcNetReturn}</span>
                          <span className="font-mono font-bold text-stone-900 text-lg">
                            ₹{realizationData.apmcRoute.netInHandPerQtl} <span className="text-xs font-normal">/ Qtl</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-stone-600 text-xs">
                          <span>{t.apmcTotal} ({calcQty} Qtl):</span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            ₹{realizationData.apmcRoute.totalPayout.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-2 italic">
                          ⏱ {currentLang === 'en' ? 'Payment timeline: 3-7 days cheque/rtgs via commission agent' : 'पेमेंट: ३ ते ७ दिवस चेक/कमीशन अडत्याची उधारी'}
                        </p>
                      </div>
                    </div>

                    {/* ROUTE B: AGRIMANDI DIRECT MILL PROCUREMENT */}
                    <div className="bg-[#1B4332] text-white p-6 rounded-2xl border border-[#2D6A4F] shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#2D6A4F]">
                          <div>
                            <span className="text-xs font-bold text-[#DE7C4A] uppercase tracking-wider block">
                              {t.directRouteTitle}
                            </span>
                            <span className="text-xs text-stone-300 font-medium">
                              {realizationData.directRoute.recommendedBuyer 
                                ? realizationData.directRoute.recommendedBuyer.company_name 
                                : (currentLang === 'en' ? 'Direct Farm-Gate Mill Procurement' : currentLang === 'hi' ? 'सीधी मिल खरीद दर' : 'थेट मिल खरेदीदार दर')}
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold px-2 py-0.5 rounded">
                            {currentLang === 'en' ? '0% Middleman Cut' : '०% आडत व दलाली'}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5 text-xs text-stone-200">
                          <div className="flex justify-between items-center">
                            <span>{t.directGateRate}</span>
                            <span className="font-mono font-bold text-white text-sm">₹{realizationData.directRoute.netInHandPerQtl} / Qtl</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {currentLang === 'en' ? 'Farm-Gate Transport Pickup' : 'थेट शेतातून खरेदीदार वाहतूक (उचल)'}
                            </span>
                            <span className="font-mono font-bold text-white">₹0 / मोफत</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {currentLang === 'en' ? 'APMC Mandi Cess (Central FAP Compliant)' : 'मंडी सेस: ०% (Central FAP Act नुसार कायदेशीर)'}
                            </span>
                            <span className="font-mono font-bold text-white">₹0 / मोफत</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {currentLang === 'en' ? 'Loading & Middleman Commission' : 'हमाली व मध्यस्थ दलाली कपात'}
                            </span>
                            <span className="font-mono font-bold text-white">₹0 / मोफत</span>
                          </div>

                          <div className="pt-2 border-t border-[#2D6A4F] flex justify-between items-center text-stone-300 text-[11px]">
                            <span>{currentLang === 'en' ? 'Total Deductions per Qtl:' : 'एकूण कपात प्रति क्विंटल:'}</span>
                            <span className="font-mono font-bold text-emerald-300">₹0.00 / Qtl</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#2D6A4F]">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-300">{t.directNetReturn}</span>
                          <span className="font-mono font-bold text-white text-2xl">
                            ₹{realizationData.directRoute.netInHandPerQtl} <span className="text-xs font-normal">/ Qtl</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-stone-300 text-xs">
                          <span>{t.directTotal} ({calcQty} Qtl):</span>
                          <span className="font-mono font-bold text-emerald-300 text-base">
                            ₹{realizationData.directRoute.totalPayout.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-200 mt-2 flex items-center gap-1 font-medium">
                          ⚡ {currentLang === 'en' ? 'Instant T+0 Escrow Bank Transfer within 2 hours of weighment' : 'वजन होताच २ तासांत बँक खात्यात थेट T+0 RTGS/UPI ट्रान्सफर'}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Top Matching Verified Buyers Nearby (Only display real registered buyers) */}
                  {realizationData.directRoute.matchingBuyers && realizationData.directRoute.matchingBuyers.length > 0 ? (
                    <div className="mt-8 pt-6 border-t border-[#E5DFD4]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                          <h4 className="text-base font-bold font-heading text-[#1B4332]">
                            {t.verifiedBuyersNearby}
                          </h4>
                          <p className="text-xs text-stone-500">
                            {currentLang === 'en' ? 'Direct mills ready to purchase your harvest at calculated farm-gate rates' : 'आपल्या शेताजवळ थेट खरेदी करणारे पडताळणीकृत कारखाने'}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-stone-600 bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E5DFD4] self-start sm:self-auto">
                          {realizationData.directRoute.matchingBuyers.length} {currentLang === 'en' ? 'Verified Buyers' : 'सत्यापित खरेदीदार'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {realizationData.directRoute.matchingBuyers.map((b) => (
                          <div key={b.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] hover:border-[#1B4332] transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#1B4332] line-clamp-1">{b.company_name}</span>
                                {b.gstin && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold shrink-0">GSTIN ✓</span>}
                              </div>
                              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#C86432]" /> {b.city || b.district} ({b.distanceKm} km अंतर)
                              </p>
                              
                              <div className="mt-3 p-2 bg-white rounded-lg border border-[#E5DFD4] flex items-center justify-between text-xs">
                                <span className="text-stone-600">{currentLang === 'en' ? 'Offered Rate:' : 'थेट खरेदी दर:'}</span>
                                <span className="font-mono font-bold text-[#1B4332] text-sm">₹{b.offeredRate} / Qtl</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectBuyerForLot(b)}
                              className="mt-4 w-full py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                            >
                              <span>{currentLang === 'en' ? 'List Harvest for this Buyer' : currentLang === 'hi' ? 'इस खरीदार को बेचें' : 'या खरेदीदाराला थेट माल विका'}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-6 border-t border-[#E5DFD4]">
                      <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                              {currentLang === 'en' ? 'Direct Procurement Network' : currentLang === 'hi' ? 'सीधी खरीद नेटवर्क' : 'थेट खरेदीदार नेटवर्क'}
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                              {currentLang === 'en' ? 'Registration Active' : 'नोंदणी सुरू'}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold font-heading text-[#1B4332] mt-1">
                            {currentLang === 'en' 
                              ? `No registered direct mills in ${calcDistrict} yet` 
                              : currentLang === 'hi' 
                              ? `${calcDistrict} में फिलहाल कोई पंजीकृत मिल नहीं है` 
                              : `${calcDistrict} मध्ये सध्या थेट परवानाधारक खरेदीदार नोंदणी झालेली नाही`}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1 max-w-xl">
                            {currentLang === 'en'
                              ? 'List your harvest lot on the marketplace. Verified buyers across Maharashtra will place competitive digital bids for your produce.'
                              : 'शेतकरी आपला शेतीमाल बाजारात लिस्ट करू शकतात; नोंदणीकृत खरेदीदार थेट डिजिटल बोली (Bids) सादर करू शकतील.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLotForm(prev => ({
                              ...prev,
                              crop: calcCrop,
                              quantity_qtl: calcQty,
                              expected_price_per_qtl: realizationData.directRoute.netInHandPerQtl,
                              district: user.district || calcDistrict,
                              farm_address: user.village ? `${user.village}, ${user.district || calcDistrict}` : (prev.farm_address || '')
                            }));
                            setIsListingModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-300" />
                          <span>{currentLang === 'en' ? 'List Harvest Lot' : 'शेतीमाल बाजारात नोंदवा'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mathematical Transparency Accordion Card */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Info className="w-4 h-4 text-[#C86432]" />
                      <span>{currentLang === 'en' ? 'Net Realization Engineering Formula (TRD Model 1):' : 'खरा नफा मोजणीचे वैज्ञानिक सूत्र व नियम:'}</span>
                    </div>
                    <p className="leading-relaxed">
                      <strong>Net Realization (₹/Qtl)</strong> = APMC Modal Rate - Freight [₹500/Qty + (Distance × ₹{calcVehicle === 'pickup' ? '4.80' : calcVehicle === 'tractor' ? '5.20' : '4.20'})] - Mandi Cess (1.05%) - Handling (₹25) - Storage ({calcStorageDays} Days × ₹0.50).
                    </p>
                    <p className="text-stone-600 text-[11px]">
                      AgriMandi platform directly connects verified farmers with licensed processing mills under Maharashtra Agricultural Produce Marketing (Regulation) Amendment, securing 0% middlemen loss.
                    </p>
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
