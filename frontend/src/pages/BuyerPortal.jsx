import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, ShoppingBag, MapPin, Filter, 
  Clock, Plus, X, FileText, CheckCircle2, AlertCircle, 
  Printer, ArrowRight, Lock, Scale, Truck, Search, Eye
} from 'lucide-react';
import api from '../services/api';
import { translations } from '../utils/translations';

// Maharashtra District Coordinates for Haversine Distance Math
const DISTRICT_COORDS = {
  'Latur': { lat: 18.4088, lng: 76.5604 },
  'Solapur': { lat: 17.6599, lng: 75.9064 },
  'Jalna': { lat: 19.8410, lng: 75.8863 },
  'Nashik': { lat: 20.0059, lng: 73.7898 },
  'Akola': { lat: 20.7002, lng: 77.0082 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Nanded': { lat: 19.1383, lng: 77.3210 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Ahmednagar': { lat: 19.0952, lng: 74.7496 },
  'Yavatmal': { lat: 20.3888, lng: 78.1204 },
  'Amravati': { lat: 20.9374, lng: 77.7796 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433 },
  'Chhatrapati Sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Beed': { lat: 18.9894, lng: 75.7601 },
  'Parbhani': { lat: 19.2686, lng: 76.7708 },
  'Hingoli': { lat: 19.7196, lng: 77.1478 },
  'Washim': { lat: 20.1110, lng: 77.1352 },
  'Buldhana': { lat: 20.5312, lng: 76.1843 },
  'Wardha': { lat: 20.7453, lng: 78.6022 }
};

function calculateHaversineDistance(buyerDistrict, lotDistrict, lotLat, lotLng) {
  const buyerCoord = DISTRICT_COORDS[buyerDistrict] || DISTRICT_COORDS['Latur'];
  let lat2 = Number(lotLat);
  let lng2 = Number(lotLng);
  if (!lat2 || !lng2) {
    const lotCoord = DISTRICT_COORDS[lotDistrict] || DISTRICT_COORDS['Latur'];
    lat2 = lotCoord.lat;
    lng2 = lotCoord.lng;
  }
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - buyerCoord.lat) * (Math.PI / 180);
  const dLng = (lng2 - buyerCoord.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(buyerCoord.lat * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function BuyerPortal({ currentLang = 'mr' }) {
  const t = translations[currentLang] || translations.mr;

  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'mybids' | 'registry'
  const [lots, setLots] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [maxMoisture, setMaxMoisture] = useState(14);
  const [searchQuery, setSearchQuery] = useState('');

  // Bid Modal State
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [bidForm, setBidForm] = useState({
    offered_price_per_qtl: '',
    quantity_requested_qtl: '',
    delivery_destination: '',
    valid_hours: 24
  });

  // Deal Contract Modal State
  const [selectedDealForContract, setSelectedDealForContract] = useState(null);

  // Buyer Profile loaded dynamically from session
  const [buyerProfile, setBuyerProfile] = useState({
    id: 'usr-buyer-1',
    phone: '',
    name: 'Institutional Buyer',
    company: 'Agro Processing Mill',
    gstin: '',
    city: 'MIDC Latur',
    district: 'Latur',
    license: 'APMC Direct Procurement',
    status: 'ACTIVE',
    is_verified: true
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    let uProfile = buyerProfile;
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        uProfile = {
          id: u.id || `byr-${u.phone || Date.now()}`,
          phone: u.phone || '',
          name: u.representative_name || u.name || 'Procurement Officer',
          company: u.company_name || u.company || u.name || 'Agro Processing Mill',
          gstin: u.gstin || '',
          city: u.district ? `MIDC ${u.district}` : 'MIDC Industrial Area',
          district: u.district || 'Latur',
          license: u.license_type || 'APMC Direct Purchase License',
          status: u.status || 'ACTIVE',
          is_verified: Boolean(u.is_verified || u.status === 'VERIFIED' || u.status === 'ACTIVE')
        };
        setBuyerProfile(uProfile);
      } catch (e) {}
    }

    loadMarketData(uProfile);
  }, []);

  const loadMarketData = (currentBuyer = buyerProfile) => {
    setLoading(true);
    const buyerId = currentBuyer?.id;
    const buyerPhone = currentBuyer?.phone;

    Promise.all([
      api.getLots(),
      api.getBuyers(),
      api.getOffers(buyerId ? { buyer_id: buyerId } : (buyerPhone ? { buyer_phone: buyerPhone } : {})),
      api.getDeals(buyerId ? { buyer_id: buyerId } : {})
    ]).then(([lotsRes, buyersRes, offersRes, dealsRes]) => {
      setLots(lotsRes.lots || []);
      setBuyers(buyersRes.buyers || []);
      setMyOffers(offersRes.offers || []);
      setMyDeals(dealsRes.deals || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // Filtered lots calculation
  const filteredLots = lots.filter(lot => {
    if (filterCrop !== 'all' && lot.crop.toLowerCase() !== filterCrop.toLowerCase()) return false;
    if (filterDistrict !== 'all' && lot.district.toLowerCase() !== filterDistrict.toLowerCase()) return false;
    if (lot.moisture_percentage && Number(lot.moisture_percentage) > maxMoisture) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCrop = (lot.crop || '').toLowerCase().includes(q);
      const matchVariety = (lot.variety || '').toLowerCase().includes(q);
      const matchFarmer = (lot.farmer_name || '').toLowerCase().includes(q);
      const matchAddress = (lot.farm_address || '').toLowerCase().includes(q);
      if (!matchCrop && !matchVariety && !matchFarmer && !matchAddress) return false;
    }
    return true;
  });

  const handleOpenBidModal = (lot) => {
    if (buyerProfile.status === 'PENDING_VERIFICATION') {
      alert(
        currentLang === 'en'
          ? 'Your account verification is pending review by SuperAdmin (ASIACore). Bidding will be activated upon approval.'
          : currentLang === 'hi'
          ? 'आपका खाता सत्यापन सुपरएडमिन (ASIACore) के पास समीक्षाधीन है। सत्यापन के बाद ही बोली लगाई जा सकती है।'
          : 'आपले खाते पडताळणी प्रलंबित आहे. SuperAdmin (ASIACore) मंजुरीनंतरच बोली लावता येईल.'
      );
      return;
    }
    setSelectedLotForBid(lot);
    setBidForm({
      offered_price_per_qtl: lot.expected_price_per_qtl,
      quantity_requested_qtl: lot.quantity_qtl,
      delivery_destination: `${buyerProfile.company}, ${buyerProfile.city} Gate`,
      valid_hours: 24
    });
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!selectedLotForBid) return;

    const requestedQty = Number(bidForm.quantity_requested_qtl);
    const availableQty = Number(selectedLotForBid.quantity_qtl);

    if (requestedQty <= 0 || requestedQty > availableQty) {
      alert(
        currentLang === 'en'
          ? `Requested quantity must be between 1 and ${availableQty} quintals.`
          : currentLang === 'hi'
          ? `मात्रा १ से ${availableQty} क्विंटल के बीच होनी चाहिए।`
          : `मागणी केलेले प्रमाण १ ते ${availableQty} क्विंटल दरम्यान असावे.`
      );
      return;
    }

    try {
      await api.createOffer({
        lot_id: selectedLotForBid.id,
        buyer_id: buyerProfile.id || `byr-${buyerProfile.phone || Date.now()}`,
        buyer_name: buyerProfile.company,
        buyer_phone: buyerProfile.phone || '',
        offered_price_per_qtl: Number(bidForm.offered_price_per_qtl),
        quantity_requested_qtl: requestedQty,
        delivery_destination: bidForm.delivery_destination,
        valid_hours: Number(bidForm.valid_hours)
      });

      setSelectedLotForBid(null);
      loadMarketData(buyerProfile);
      setActiveTab('mybids');
      alert(
        currentLang === 'en'
          ? '✓ Digital binding offer submitted to farmer successfully! You can track acceptance in My Bids tab.'
          : currentLang === 'hi'
          ? '✓ डिजिटल बोली किसान को सफलतापूर्वक प्रेषित कर दी गई है! स्थिति माय बिड्स में देखें।'
          : '✓ आपली कायदेशीर डिजिटल बोली शेतकर्‍याकडे सादर झाली आहे! स्थिती माय बिड्स टॅबमध्ये पहा.'
      );
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Find deal details for an accepted offer
  const handleViewDealContract = (offer) => {
    const matchedDeal = myDeals.find(d => d.offer_id === offer.id || d.lot_id === offer.lot_id);
    if (matchedDeal) {
      setSelectedDealForContract(matchedDeal);
    } else {
      // Create a transient contract view from the accepted offer metadata
      setSelectedDealForContract({
        id: `DEAL-${offer.lot_id.replace('lot-', '')}-${Date.now().toString().slice(-4)}`,
        lot_id: offer.lot_id,
        offer_id: offer.id,
        crop: offer.crop || 'Soybean (FAQ)',
        variety: offer.variety || 'Standard Grade A',
        quantity_qtl: offer.quantity_requested_qtl,
        price_per_qtl: offer.offered_price_per_qtl,
        total_deal_value: Number(offer.offered_price_per_qtl) * Number(offer.quantity_requested_qtl),
        buyer_name: offer.buyer_name || buyerProfile.company,
        buyer_phone: buyerProfile.phone,
        farmer_name: offer.farmer_name || 'Farmer Partner',
        delivery_destination: offer.delivery_destination,
        delivery_status: 'PENDING_PICKUP',
        escrow_status: 'SECURED_IN_ESCROW',
        created_at: offer.created_at || new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* Top Buyer Identity Banner */}
      <div className="bg-[#1B4332] text-white py-6 border-b border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#DE7C4A] bg-[#0F261C] px-2.5 py-0.5 rounded">
                  {t.buyerWelcome}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> {buyerProfile.is_verified ? t.buyerVerified : (currentLang === 'en' ? 'GSTIN Registered' : 'नोंदणीकृत व्यापारी')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading mt-1">
                {buyerProfile.company}
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                {buyerProfile.name} {buyerProfile.gstin ? `| GSTIN: ${buyerProfile.gstin}` : ''} | {buyerProfile.district} ({buyerProfile.city})
              </p>
            </div>

            {/* License Tag */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0F261C] rounded-xl border border-[#2D6A4F] text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{buyerProfile.license}</span>
            </div>
          </div>

          {/* Quick Procurement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#2D6A4F]">
            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statMarketLots}</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{lots.length}</span>
              <span className="text-[10px] text-stone-300 block mt-0.5">{t.tabMarketplace}</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statTotalTonnage}</span>
              <span className="text-lg font-bold font-mono text-white">
                {(lots.reduce((acc, l) => acc + Number(l.quantity_qtl || 0), 0) / 10).toFixed(1)} MT
              </span>
              <span className="text-[10px] text-stone-300 block mt-0.5">{currentLang === 'en' ? 'Farm-Gate Harvest' : currentLang === 'hi' ? 'फार्म-गेट' : 'शेतातून थेट'}</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statMyPlacedBids}</span>
              <span className="text-lg font-bold font-mono text-[#DE7C4A]">{myOffers.length}</span>
              <span className="text-[10px] text-stone-300 block mt-0.5">{t.tabMyBids}</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{currentLang === 'en' ? 'Locked Deals' : currentLang === 'hi' ? 'पक्के सौदे' : 'पक्के सौदे करार'}</span>
              <span className="text-lg font-bold font-mono text-white">
                {myOffers.filter(o => o.status === 'ACCEPTED').length + myDeals.length}
              </span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">Escrow Secured ✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Pending Verification Notice Banner */}
        {buyerProfile.status === 'PENDING_VERIFICATION' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-amber-950">
                {currentLang === 'en' ? 'Account Verification in Progress' : currentLang === 'hi' ? 'खाता सत्यापन प्रक्रियाधीन' : 'खाते पडताळणी प्रलंबित'}
              </p>
              <p className="text-amber-800 leading-relaxed">
                {currentLang === 'en'
                  ? `Your GSTIN (${buyerProfile.gstin || 'Under Review'}) and APMC Direct Procurement License are currently undergoing verification by SuperAdmin (ASIACore). Direct bidding will be unlocked upon approval.`
                  : currentLang === 'hi'
                  ? `आपका GSTIN (${buyerProfile.gstin || 'समीक्षाधीन'}) और APMC खरीद लाइसेंस सुपरएडमिन (ASIACore) द्वारा सत्यापन प्रक्रिया में है। स्वीकृति के बाद बोली सक्रिय होगी।`
                  : `आपले GSTIN (${buyerProfile.gstin || 'पुनरावलोकनाखाली'}) आणि APMC परवाना SuperAdmin (ASIACore) पडताळणीत आहे. मंजुरीनंतर थेट बोली लावता येईल.`}
              </p>
            </div>
          </div>
        )}

        {/* Module Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5DFD4] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {t.tabMarketplace} ({filteredLots.length})
          </button>

          <button
            onClick={() => setActiveTab('mybids')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mybids'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t.tabMyBids} ({myOffers.length})
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t.tabBuyersDir}
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: FARM-GATE LOTS MARKETPLACE */}
        {/* ============================================================ */}
        {activeTab === 'marketplace' && (
          <div className="mt-6 space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-[#1B4332] uppercase flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> {currentLang === 'en' ? 'Filters:' : currentLang === 'hi' ? 'फिल्टर:' : 'फिल्टर्स:'}
                </span>

                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                >
                  <option value="all">{t.allCrops}</option>
                  <option value="Soybean">{t.soybean}</option>
                  <option value="Cotton">{t.cotton}</option>
                  <option value="Onion">{t.onion}</option>
                  <option value="Arhar (Tur)">{t.tur}</option>
                  <option value="Gram (Chana)">{t.chana}</option>
                  <option value="Wheat">{t.wheat}</option>
                </select>

                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                >
                  <option value="all">{t.allDistricts}</option>
                  <option value="Latur">Latur / लातूर</option>
                  <option value="Jalna">Jalna / जालना</option>
                  <option value="Nashik">Nashik / नाशिक</option>
                  <option value="Solapur">Solapur / सोलापूर</option>
                  <option value="Akola">Akola / अकोला</option>
                  <option value="Nanded">Nanded / नांदेड</option>
                  <option value="Pune">Pune / पुणे</option>
                  <option value="Nagpur">Nagpur / नागपूर</option>
                  <option value="Ahmednagar">Ahmednagar / अहिल्यानगर</option>
                </select>

                <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                  <span>{t.filterMoisture}</span>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    value={maxMoisture}
                    onChange={(e) => setMaxMoisture(Number(e.target.value))}
                    className="w-24 accent-[#1B4332]"
                  />
                  <span className="font-bold text-[#1B4332] font-mono">{maxMoisture}%</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder={currentLang === 'en' ? 'Search crop, farmer, village...' : currentLang === 'hi' ? 'खोजें...' : 'पीक, शेतकरी, गाव शोधा...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>

            {/* Lots Grid / Empty State */}
            {filteredLots.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-[#E5DFD4] text-center max-w-lg mx-auto shadow-xs">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-[#1B4332]">
                  {currentLang === 'en' ? 'No Active Lots Found' : currentLang === 'hi' ? 'कोई लॉट उपलब्ध नहीं है' : 'कोणताही लॉट उपलब्ध नाही'}
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t.noLotsFoundBuyer}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLots.map((lot) => {
                  const distanceKm = calculateHaversineDistance(
                    buyerProfile.district, 
                    lot.district, 
                    lot.farm_lat, 
                    lot.farm_lng
                  );
                  const isLocked = lot.status === 'DEAL_LOCKED';
                  const moistureNum = Number(lot.moisture_percentage || 10);

                  return (
                    <div 
                      key={lot.id} 
                      className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isLocked ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#E5DFD4] hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5DFD4]">
                          <div>
                            <span className="text-[10px] font-bold text-[#C86432] uppercase tracking-wider font-mono">
                              ID: {lot.id}
                            </span>
                            <h4 className="text-xl font-bold font-heading text-[#1B4332] mt-0.5">
                              {lot.crop}
                            </h4>
                            <p className="text-xs text-stone-600 font-medium">
                              {lot.variety || 'FAQ Standard'}
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${
                            isLocked 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isLocked ? (
                              <>
                                <Lock className="w-3 h-3" /> {t.statusLocked}
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t.statusListed}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Lot Details Grid */}
                        <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                          <div>
                            <span className="text-stone-400 block">{t.fieldQty}</span>
                            <span className="font-bold font-mono text-stone-800 text-base">
                              {lot.quantity_qtl} {currentLang === 'en' ? 'Qtl' : 'क्विंटल'}
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              ({(Number(lot.quantity_qtl) / 10).toFixed(1)} MT)
                            </span>
                          </div>

                          <div>
                            <span className="text-stone-400 block">{t.fieldPrice}</span>
                            <span className="font-bold font-mono text-[#1B4332] text-base">
                              ₹{lot.expected_price_per_qtl}
                            </span>
                            <span className="text-[10px] text-stone-500 block">{currentLang === 'en' ? '/ Quintal' : '/ क्विंटल'}</span>
                          </div>

                          <div>
                            <span className="text-stone-400 block">{t.fieldMoisture}</span>
                            <span className={`font-bold font-mono text-sm inline-flex items-center gap-1 ${
                              moistureNum <= 10 ? 'text-emerald-700' : moistureNum <= 13 ? 'text-amber-700' : 'text-red-700'
                            }`}>
                              {lot.moisture_percentage}%
                              <span className="text-[10px] font-normal font-sans">
                                {moistureNum <= 10 ? '(FAQ Dry)' : moistureNum <= 13 ? '(Standard)' : '(High)'}
                              </span>
                            </span>
                          </div>

                          <div>
                            <span className="text-stone-400 block">{t.fieldVariety}</span>
                            <span className="font-bold text-stone-700 text-sm">
                              {lot.quality_grade || 'Grade A'}
                            </span>
                          </div>
                        </div>

                        {/* Haversine Distance & Farm Location */}
                        <div className="space-y-2">
                          <div className="p-2.5 bg-[#FAF7F2] rounded-xl text-xs text-stone-700 border border-[#E5DFD4] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-4 h-4 text-[#C86432] shrink-0" />
                              <span className="truncate">{lot.farm_address || lot.district}, {lot.district}</span>
                            </div>
                            <span className="text-[11px] font-bold font-mono text-[#1B4332] bg-white px-2 py-0.5 rounded border border-[#E5DFD4] shrink-0">
                              ~{distanceKm} km
                            </span>
                          </div>

                          {/* Zero Cess & Middleman Benefit Note */}
                          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{currentLang === 'en' ? 'Direct Farm-Gate Procurement (Saves ₹45/Qtl APMC Cess)' : 'थेट शेतातून खरेदी (मंडी सेस व दलाली ०%)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 pt-4 border-t border-[#E5DFD4] flex items-center justify-between">
                        <div className="text-[11px] text-stone-500">
                          <span className="text-stone-400 block">{currentLang === 'en' ? 'Farmer:' : 'शेतकरी:'}</span>
                          <strong className="text-stone-700">{lot.farmer_name || 'Verified Farmer'}</strong>
                        </div>

                        {!isLocked ? (
                          <button
                            onClick={() => handleOpenBidModal(lot)}
                            className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{t.placeBidBtn}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{currentLang === 'en' ? 'Contract Executed' : 'करार पक्का झाला'}</span>
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

        {/* ============================================================ */}
        {/* TAB 2: MY BIDS & EXECUTED CONTRACTS */}
        {/* ============================================================ */}
        {activeTab === 'mybids' && (
          <div className="mt-6 space-y-6">
            
            {/* Active / Submitted Bids Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5DFD4]">
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                    {t.tabMyBids}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {currentLang === 'en' ? 'Track digital offers placed on farmer harvest lots' : 'शेतकरी लॉट्सवर लावलेल्या आपल्या बोलींची स्थिती'}
                  </p>
                </div>
                <span className="text-xs font-bold font-mono text-stone-700 bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E5DFD4]">
                  {myOffers.length} {currentLang === 'en' ? 'Offers' : 'बोली'}
                </span>
              </div>

              {myOffers.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700">{t.noBidsYetBuyer}</p>
                  <p className="mt-1">{currentLang === 'en' ? 'Explore the marketplace and place your first binding offer.' : 'बाजारातील लॉट्स पहा आणि शेतकर्‍याला पहिली थेट बोली लावा.'}</p>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="mt-4 px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold"
                  >
                    {t.tabMarketplace}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF7F2] text-xs font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
                      <tr>
                        <th className="py-3 px-4">{currentLang === 'en' ? 'Offer ID' : 'ऑफर ID'}</th>
                        <th className="py-3 px-4">{currentLang === 'en' ? 'Lot ID' : 'लॉट ID'}</th>
                        <th className="py-3 px-4 text-right">{t.labelReqQty}</th>
                        <th className="py-3 px-4 text-right">{t.labelOfferedPrice}</th>
                        <th className="py-3 px-4 text-right">{t.totalBidValue}</th>
                        <th className="py-3 px-4">{t.labelDeliveryDest}</th>
                        <th className="py-3 px-4">{currentLang === 'en' ? 'Status' : 'स्थिती'}</th>
                        <th className="py-3 px-4 text-center">{currentLang === 'en' ? 'Action' : 'कृती'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD4]">
                      {myOffers.map((off) => {
                        const isAccepted = off.status === 'ACCEPTED';
                        const isRejected = off.status === 'REJECTED';

                        return (
                          <tr key={off.id} className="hover:bg-[#FCFAF6] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1B4332]">{off.id}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-stone-600">{off.lot_id}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold">
                              {off.quantity_requested_qtl} <span className="text-xs text-stone-400 font-normal">Qtl</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-[#C86432]">
                              ₹{off.offered_price_per_qtl}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                              ₹{(Number(off.offered_price_per_qtl) * Number(off.quantity_requested_qtl)).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-stone-600 max-w-[180px] truncate">{off.delivery_destination}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase inline-flex items-center gap-1 ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isRejected
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {isAccepted ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    {currentLang === 'en' ? 'Accepted' : currentLang === 'hi' ? 'स्वीकृत' : 'मंजूर'}
                                  </>
                                ) : isRejected ? (
                                  <>
                                    <X className="w-3 h-3 text-red-600" />
                                    {currentLang === 'en' ? 'Rejected' : currentLang === 'hi' ? 'अस्वीकृत' : 'नाकारले'}
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    {currentLang === 'en' ? 'Pending' : currentLang === 'hi' ? 'प्रलंबित' : 'प्रलंबित'}
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isAccepted ? (
                                <button
                                  onClick={() => handleViewDealContract(off)}
                                  className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>{currentLang === 'en' ? 'Deal Contract' : 'करार पहा'}</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-stone-400 italic">
                                  {isRejected 
                                    ? (currentLang === 'en' ? 'Lot Closed' : 'लॉट पूर्ण झाला') 
                                    : (currentLang === 'en' ? 'Awaiting Farmer' : 'शेतकरी प्रतिसादाची प्रतीक्षा')}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Executed B2B Trade Contracts */}
            {myDeals.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD4]">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-[#1B4332]">
                      📄 {currentLang === 'en' ? 'Executed B2B Trade Contracts & Escrow' : 'कायदेशीर खरेदी करार व एस्क्रो हमी'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {currentLang === 'en' ? 'Legally binding contracts locked upon farmer acceptance' : 'शेतकर्‍याने बोली स्वीकारल्यानंतर तयार झालेले डिजिटल करार'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    {myDeals.length} {currentLang === 'en' ? 'Contracts' : 'करार'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {myDeals.map((deal) => (
                    <div key={deal.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4]">
                          <span className="font-mono font-bold text-xs text-[#1B4332]">{deal.id}</span>
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {deal.escrow_status || 'SECURED_IN_ESCROW'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Farmer:' : 'शेतकरी:'}</span>
                            <span className="font-bold text-stone-800">{deal.farmer_name}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Crop:' : 'पीक:'}</span>
                            <span className="font-bold text-stone-800">{deal.crop}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Quantity:' : 'प्रमाण:'}</span>
                            <span className="font-bold font-mono text-stone-800">{deal.quantity_qtl} Qtl</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Agreed Rate:' : 'मंजूर दर:'}</span>
                            <span className="font-bold font-mono text-[#C86432]">₹{deal.price_per_qtl} / Qtl</span>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-white rounded-lg border border-[#E5DFD4] flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium">{currentLang === 'en' ? 'Total Consideration:' : 'एकूण करार रक्कम:'}</span>
                          <span className="font-bold font-mono text-base text-[#1B4332]">₹{deal.total_deal_value.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDealForContract(deal)}
                        className="mt-4 w-full py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{currentLang === 'en' ? 'View Full Contract & Invoice' : 'सविस्तर करार व पावती पहा'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: VERIFIED BUYERS REGISTRY */}
        {/* ============================================================ */}
        {activeTab === 'registry' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5DFD4]">
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                    {t.tabBuyersDir}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {currentLang === 'en' ? 'Licensed Agro-Processing Mills and Institutional Buyers' : 'महाराष्ट्र शासन परवानाधारक व GSTIN नोंदणीकृत खरेदीदार'}
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E5DFD4]">
                  {buyers.length} {currentLang === 'en' ? 'Verified Units' : 'सत्यापित कारखाने'}
                </span>
              </div>

              {buyers.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700">
                    {currentLang === 'en' ? 'No other verified buyers registered in this district yet' : 'या भागात अद्याप इतर कोणत्याही कारखान्याची नोंदणी झालेली नाही'}
                  </p>
                  <p className="mt-1">
                    {currentLang === 'en' ? 'Only genuine GSTIN-verified buyers appear here.' : 'केवळ GSTIN व परवाना तपासणी पूर्ण झालेले खरेदीदार येथे दिसतात.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {buyers.map((b) => (
                    <div key={b.id} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold font-heading text-base text-[#1B4332]">{b.company_name}</h4>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              GSTIN ✓
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{b.legal_name || b.company_name}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-600">★ {b.rating || '5.0'}</span>
                          <span className="text-[10px] text-stone-400 block">({b.reviews_count || 0} {currentLang === 'en' ? 'Trades' : 'सौदे'})</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span>GSTIN:</span>
                          <span className="font-mono font-bold text-stone-800">{b.gstin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{currentLang === 'en' ? 'License:' : 'परवाना:'}</span>
                          <span className="font-medium text-stone-800">{b.license_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{currentLang === 'en' ? 'Location:' : 'स्थान:'}</span>
                          <span className="font-medium text-stone-800">{b.city || b.district} ({b.district})</span>
                        </div>
                        {b.target_crops && (
                          <div className="flex justify-between">
                            <span>{currentLang === 'en' ? 'Target Crops:' : 'उद्दिष्ट पिके:'}</span>
                            <span className="font-semibold text-[#1B4332]">
                              {Array.isArray(b.target_crops) ? b.target_crops.join(', ') : b.target_crops}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* MODAL 1: PLACE DIGITAL BINDING OFFER */}
      {/* ============================================================ */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E5DFD4] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4]">
              <div>
                <span className="text-[11px] font-bold text-[#C86432] uppercase tracking-wider">{t.modalPlaceBidTitle}</span>
                <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                  {selectedLotForBid.crop} ({selectedLotForBid.variety || 'Standard'})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLotForBid(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Lot Summary Box */}
            <div className="mt-4 p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD4] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">{currentLang === 'en' ? 'Farmer:' : 'शेतकरी:'}</span>
                <span className="font-bold text-stone-800">{selectedLotForBid.farmer_name} ({selectedLotForBid.district})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.fieldQty}:</span>
                <span className="font-mono font-bold text-stone-800">{selectedLotForBid.quantity_qtl} {currentLang === 'en' ? 'Qtl' : 'क्विंटल'} ({(Number(selectedLotForBid.quantity_qtl) / 10).toFixed(1)} MT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.fieldPrice}:</span>
                <span className="font-mono font-bold text-[#1B4332]">₹{selectedLotForBid.expected_price_per_qtl} {currentLang === 'en' ? '/Qtl' : '/क्विंटल'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.fieldMoisture}:</span>
                <span className="font-mono font-bold text-stone-800">{selectedLotForBid.moisture_percentage}%</span>
              </div>
            </div>

            <form onSubmit={handlePlaceBid} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.labelOfferedPrice} (₹ / Quintal) *
                </label>
                <input
                  type="number"
                  min="500"
                  value={bidForm.offered_price_per_qtl}
                  onChange={(e) => setBidForm({ ...bidForm, offered_price_per_qtl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-base font-bold font-mono text-[#1B4332] focus:outline-none focus:border-[#1B4332]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    {t.labelReqQty} (Max: {selectedLotForBid.quantity_qtl} Qtl) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setBidForm({ ...bidForm, quantity_requested_qtl: selectedLotForBid.quantity_qtl })}
                    className="text-[11px] font-bold text-[#C86432] hover:underline cursor-pointer"
                  >
                    {currentLang === 'en' ? 'Select 100% Full Lot' : 'पूर्ण लॉट निवडा'}
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedLotForBid.quantity_qtl}
                  value={bidForm.quantity_requested_qtl}
                  onChange={(e) => setBidForm({ ...bidForm, quantity_requested_qtl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-base font-bold font-mono text-stone-800 focus:outline-none focus:border-[#1B4332]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.labelDeliveryDest} *
                </label>
                <input
                  type="text"
                  value={bidForm.delivery_destination}
                  onChange={(e) => setBidForm({ ...bidForm, delivery_destination: e.target.value })}
                  placeholder="e.g. MIDC Plant Weighbridge Gate, Latur"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  required
                />
              </div>

              {/* Total Calculation Callout */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">{t.totalBidValue}</span>
                  <span className="text-[10px] text-emerald-700">0% APMC Cess / T+0 Escrow Bank Payout</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-lg">
                  ₹{(Number(bidForm.offered_price_per_qtl || 0) * Number(bidForm.quantity_requested_qtl || 0)).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLotForBid(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-[#FAF7F2] cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {t.submitBidBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: B2B DEAL CONTRACT & ESCROW INSPECTOR */}
      {/* ============================================================ */}
      {selectedDealForContract && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#E5DFD4] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Contract Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-[#1B4332]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C86432] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                    B2B Agricultural Sale Agreement
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    LEGAL CONTRACT
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332] mt-1.5">
                  AgriMandi Digital Trade Contract
                </h3>
                <p className="text-xs font-mono text-stone-500 mt-0.5">
                  Contract ID: {selectedDealForContract.id} | Date: {new Date(selectedDealForContract.created_at || Date.now()).toLocaleDateString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedDealForContract(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contract Content */}
            <div className="mt-6 space-y-5 text-xs text-stone-800">
              
              {/* Parties Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] block">
                    SELLER (विक्रेता / शेतकरी)
                  </span>
                  <h5 className="font-bold text-sm text-stone-900 mt-1">
                    {selectedDealForContract.farmer_name}
                  </h5>
                  <p className="text-stone-600 mt-0.5">
                    {selectedDealForContract.farmer_phone ? `Mobile: ${selectedDealForContract.farmer_phone}` : '7/12 Verified Landholder'}
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Farm-Gate Origin, Maharashtra
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] block">
                    PURCHASER (खरेदीदार / मिल)
                  </span>
                  <h5 className="font-bold text-sm text-stone-900 mt-1">
                    {selectedDealForContract.buyer_name}
                  </h5>
                  <p className="text-stone-600 mt-0.5">
                    GSTIN: {buyerProfile.gstin || 'Registered Institutional Unit'}
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Destination: {selectedDealForContract.delivery_destination}
                  </p>
                </div>
              </div>

              {/* Commodity & Financial Consideration Table */}
              <div className="border border-[#E5DFD4] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF7F2] text-[11px] font-bold text-[#1B4332] uppercase border-b border-[#E5DFD4]">
                    <tr>
                      <th className="py-2.5 px-3">Commodity Specification</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Contract Price</th>
                      <th className="py-2.5 px-3 text-right">Total Consideration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD4] font-medium">
                    <tr>
                      <td className="py-3 px-3">
                        <strong className="block text-stone-900">{selectedDealForContract.crop}</strong>
                        <span className="text-[11px] text-stone-500">{selectedDealForContract.variety || 'FAQ Quality Standard'}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {selectedDealForContract.quantity_qtl} Qtl
                        <span className="block text-[10px] text-stone-400">({(Number(selectedDealForContract.quantity_qtl) / 10).toFixed(1)} MT)</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#C86432]">
                        ₹{selectedDealForContract.price_per_qtl} / Qtl
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 text-sm">
                        ₹{Number(selectedDealForContract.total_deal_value).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Escrow & Payout Guarantee Badge */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-emerald-950 text-sm">
                    100% Escrow Protection Guarantee (RBI Trustee Compliant)
                  </span>
                </div>
                <p className="text-emerald-900 text-[11px] leading-relaxed">
                  Status: <strong>{selectedDealForContract.escrow_status || 'SECURED_IN_ESCROW'}</strong>. The purchaser's purchase consideration is held securely. Funds are automatically disbursed directly to the farmer's registered bank account within 2 hours of factory gate weighbridge receipt and moisture verification.
                </p>
              </div>

              {/* Legal Note */}
              <p className="text-[10px] text-stone-400 italic leading-normal">
                This electronic contract is generated and authenticated via AgriMandi (कृषीसेतू) platform in compliance with the Information Technology Act, 2000 and Section 31 of the Maharashtra Agricultural Produce Marketing (Regulation) Act for direct farm-gate procurement.
              </p>

            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-[#E5DFD4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] hover:bg-[#F3EDE2] text-xs font-bold text-stone-700 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{currentLang === 'en' ? 'Print / Download Contract' : 'करार प्रिंट / डाउनलोड करा'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDealForContract(null)}
                className="px-6 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {currentLang === 'en' ? 'Close Contract' : 'करार बंद करा'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
