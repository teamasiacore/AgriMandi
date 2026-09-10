import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, ShoppingBag, MapPin, Filter, 
  Clock, Plus, X 
} from 'lucide-react';
import api from '../services/api';
import { translations } from '../utils/translations';

export default function BuyerPortal({ currentLang = 'mr' }) {
  const t = translations[currentLang] || translations.mr;

  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'mybids' | 'registry'
  const [lots, setLots] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [maxMoisture, setMaxMoisture] = useState(14);

  // Bid Modal
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [bidForm, setBidForm] = useState({
    offered_price_per_qtl: '',
    quantity_requested_qtl: '',
    delivery_destination: '',
    valid_hours: 24
  });

  // Buyer Profile from session
  const [buyerProfile, setBuyerProfile] = useState({
    name: 'Institutional Buyer',
    company: 'Agro Processing Mill',
    gstin: '',
    city: 'Latur',
    district: 'Latur',
    license: 'APMC Direct Procurement'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setBuyerProfile({
          id: u.id,
          name: u.name || 'Buyer Partner',
          company: u.company_name || u.company || u.name || 'Agro Processing Unit',
          gstin: u.gstin || '',
          city: u.district ? `MIDC ${u.district}` : 'MIDC Area',
          district: u.district || 'Latur',
          license: u.license_type || 'Direct Purchase License',
          status: u.status || 'VERIFIED',
          is_verified: Boolean(u.is_verified)
        });
      } catch (e) {}
    }

    loadMarketData();
  }, []);

  const loadMarketData = () => {
    setLoading(true);
    Promise.all([
      api.getLots(),
      api.getBuyers(),
      api.getOffers()
    ]).then(([lotsRes, buyersRes, offersRes]) => {
      setLots(lotsRes.lots || []);
      setBuyers(buyersRes.buyers || []);
      setMyOffers(offersRes.offers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const filteredLots = lots.filter(lot => {
    if (filterCrop !== 'all' && lot.crop.toLowerCase() !== filterCrop.toLowerCase()) return false;
    if (filterDistrict !== 'all' && lot.district.toLowerCase() !== filterDistrict.toLowerCase()) return false;
    if (lot.moisture_percentage > maxMoisture) return false;
    return true;
  });

  const handleOpenBidModal = (lot) => {
    if (buyerProfile.status === 'PENDING_VERIFICATION') {
      alert('आपले खाते पडताळणी प्रलंबित आहे (Status: PENDING_VERIFICATION). SuperAdmin (ASIACore) मंजुरीनंतरच बोली लावता येईल.');
      return;
    }
    setSelectedLotForBid(lot);
    setBidForm({
      offered_price_per_qtl: lot.expected_price_per_qtl,
      quantity_requested_qtl: lot.quantity_qtl,
      delivery_destination: `${buyerProfile.city} Factory Gate`,
      valid_hours: 24
    });
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!selectedLotForBid) return;

    try {
      await api.createOffer({
        lot_id: selectedLotForBid.id,
        buyer_name: buyerProfile.company,
        buyer_phone: '+91 98220 54321',
        offered_price_per_qtl: Number(bidForm.offered_price_per_qtl),
        quantity_requested_qtl: Number(bidForm.quantity_requested_qtl),
        delivery_destination: bidForm.delivery_destination,
        valid_hours: Number(bidForm.valid_hours)
      });

      setSelectedLotForBid(null);
      loadMarketData();
      setActiveTab('mybids');
      alert(currentLang === 'en' ? 'Digital bid submitted successfully to farmer!' :
            currentLang === 'hi' ? 'डिजिटल बोली किसान के पास सफलतापूर्वक प्रस्तुत कर दी गई है!' :
            'आपली डिजिटल बोली शेतकर्‍याकडे यशस्वीरित्या सादर करण्यात आली आहे!');
    } catch (err) {
      alert('Error: ' + err.message);
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
                  <ShieldCheck className="w-3.5 h-3.5" /> {t.buyerVerified}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading mt-1">
                {buyerProfile.company}
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                {buyerProfile.name} {buyerProfile.gstin ? `| GSTIN: ${buyerProfile.gstin}` : ''} | {buyerProfile.district}
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
              <span className="text-[10px] text-stone-300 block mt-0.5">Farm-Gate</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statMyPlacedBids}</span>
              <span className="text-lg font-bold font-mono text-[#DE7C4A]">{myOffers.length}</span>
              <span className="text-[10px] text-stone-300 block mt-0.5">{t.tabMyBids}</span>
            </div>

            <div className="bg-[#0F261C]/50 p-3 rounded-xl border border-[#2D6A4F]">
              <span className="text-[11px] text-stone-300 block">{t.statVerifiedMills}</span>
              <span className="text-lg font-bold font-mono text-white">{buyers.length}</span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">GSTIN ✓</span>
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
                खाते पडताळणी प्रलंबित (Account Verification in Progress)
              </p>
              <p className="text-amber-800 leading-relaxed">
                आपले GSTIN ({buyerProfile.gstin || 'Pending'}) आणि APMC थेट खरेदी परवाना SuperAdmin (ASIACore) च्या पुनरावलोकनाखाली आहे. मंजुरी मिळाल्यानंतर आपणास शेतमाल लॉट्सवर थेट कायदेशीर बोली लावता येईल.
              </p>
            </div>
          </div>
        )}

        {/* Module Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5DFD4] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
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
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
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
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t.tabBuyersDir}
          </button>
        </div>

        {/* TAB 1: FARM-GATE LOTS MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="mt-6 space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-[#1B4332] uppercase flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filters:
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
                </select>

                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                >
                  <option value="all">{t.allDistricts}</option>
                  <option value="Latur">Latur</option>
                  <option value="Jalna">Jalna</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Akola">Akola</option>
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

              <span className="text-xs text-stone-500 font-medium">
                {filteredLots.length} {t.statMarketLots}
              </span>
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
                {filteredLots.map((lot) => (
                  <div 
                    key={lot.id} 
                    className="bg-white rounded-2xl p-5 border border-[#E5DFD4] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5DFD4]">
                        <div>
                          <span className="text-[11px] font-bold text-[#C86432] uppercase tracking-wider">
                            ID: {lot.id}
                          </span>
                          <h4 className="text-xl font-bold font-heading text-[#1B4332] mt-0.5">
                            {lot.crop}
                          </h4>
                          <p className="text-xs text-stone-600 font-medium">
                            {lot.variety}
                          </p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          lot.status === 'DEAL_LOCKED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {lot.status === 'DEAL_LOCKED' ? t.statusLocked : t.statusListed}
                        </span>
                      </div>

                      {/* Lot Details */}
                      <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                        <div>
                          <span className="text-stone-400 block">{t.fieldQty}</span>
                          <span className="font-bold font-mono text-stone-800 text-base">
                            {lot.quantity_qtl} Qtl
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            ({(lot.quantity_qtl / 10).toFixed(1)} MT)
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-400 block">{t.fieldPrice}</span>
                          <span className="font-bold font-mono text-[#1B4332] text-base">
                            ₹{lot.expected_price_per_qtl}
                          </span>
                          <span className="text-[10px] text-stone-500 block">/ Quintal</span>
                        </div>

                        <div>
                          <span className="text-stone-400 block">{t.fieldMoisture}</span>
                          <span className="font-bold font-mono text-stone-700 text-sm">
                            {lot.moisture_percentage}%
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-400 block">{t.fieldVariety}</span>
                          <span className="font-bold text-stone-700 text-sm">
                            {lot.quality_grade || 'FAQ'}
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-stone-600 border border-[#E5DFD4] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C86432] shrink-0" />
                        <span className="truncate">{lot.farm_address}, {lot.district}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-[#E5DFD4] flex items-center justify-between">
                      <div className="text-[11px] text-stone-500">
                        {lot.farmer_name}
                      </div>

                      {lot.status !== 'DEAL_LOCKED' ? (
                        <button
                          onClick={() => handleOpenBidModal(lot)}
                          className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          {t.placeBidBtn}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800">
                          {t.statusLocked}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: MY BIDS & DEALS */}
        {activeTab === 'mybids' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
              <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                {t.tabMyBids}
              </h3>

              {myOffers.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  {t.noBidsYetBuyer}
                </div>
              ) : (
                <div className="overflow-x-auto mt-5">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF7F2] text-xs font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
                      <tr>
                        <th className="py-3 px-4">Offer ID</th>
                        <th className="py-3 px-4">Lot ID</th>
                        <th className="py-3 px-4 text-right">{t.labelReqQty}</th>
                        <th className="py-3 px-4 text-right">{t.labelOfferedPrice}</th>
                        <th className="py-3 px-4 text-right">{t.totalBidValue}</th>
                        <th className="py-3 px-4">{t.labelDeliveryDest}</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD4]">
                      {myOffers.map((off) => (
                        <tr key={off.id} className="hover:bg-[#FCFAF6]">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1B4332]">{off.id}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-stone-600">{off.lot_id}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold">{off.quantity_requested_qtl}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-[#C86432]">
                            ₹{off.offered_price_per_qtl}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                            ₹{(off.offered_price_per_qtl * off.quantity_requested_qtl).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-stone-600">{off.delivery_destination}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                              off.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : off.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {off.status === 'ACCEPTED' ? '✓ Accepted' : off.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VERIFIED BUYERS REGISTRY */}
        {activeTab === 'registry' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
              <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                {t.tabBuyersDir}
              </h3>

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
                        <p className="text-xs text-stone-500 mt-0.5">{b.legal_name}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-600">★ {b.rating}</span>
                        <span className="text-[10px] text-stone-400 block">({b.reviews_count} Trades)</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                      <div className="flex justify-between">
                        <span>GSTIN:</span>
                        <span className="font-mono font-bold text-stone-800">{b.gstin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>License:</span>
                        <span className="font-medium text-stone-800">{b.license_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium text-stone-800">{b.city} (Radius: {b.procurement_radius_km} km)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Crops:</span>
                        <span className="font-semibold text-[#1B4332]">{b.target_crops.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: PLACE DIGITAL BID */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E5DFD4] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4]">
              <div>
                <span className="text-xs font-bold text-[#C86432] uppercase">{t.modalPlaceBidTitle}</span>
                <h3 className="text-lg font-bold font-heading text-[#1B4332]">
                  {selectedLotForBid.crop} ({selectedLotForBid.variety})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLotForBid(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Lot Summary Box */}
            <div className="mt-4 p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD4] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Farmer:</span>
                <span className="font-bold text-stone-800">{selectedLotForBid.farmer_name} ({selectedLotForBid.district})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.fieldQty}:</span>
                <span className="font-mono font-bold text-stone-800">{selectedLotForBid.quantity_qtl} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.fieldPrice}:</span>
                <span className="font-mono font-bold text-[#1B4332]">₹{selectedLotForBid.expected_price_per_qtl}/Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.fieldMoisture}:</span>
                <span className="font-mono font-bold text-stone-800">{selectedLotForBid.moisture_percentage}%</span>
              </div>
            </div>

            <form onSubmit={handlePlaceBid} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.labelOfferedPrice}
                </label>
                <input
                  type="number"
                  min="500"
                  value={bidForm.offered_price_per_qtl}
                  onChange={(e) => setBidForm({ ...bidForm, offered_price_per_qtl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.labelReqQty}
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedLotForBid.quantity_qtl}
                  value={bidForm.quantity_requested_qtl}
                  onChange={(e) => setBidForm({ ...bidForm, quantity_requested_qtl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.labelDeliveryDest}
                </label>
                <input
                  type="text"
                  value={bidForm.delivery_destination}
                  onChange={(e) => setBidForm({ ...bidForm, delivery_destination: e.target.value })}
                  placeholder="e.g. MIDC Plant Gate"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  required
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900">{t.totalBidValue}</span>
                <span className="font-mono font-bold text-emerald-800 text-base">
                  ₹{(Number(bidForm.offered_price_per_qtl || 0) * Number(bidForm.quantity_requested_qtl || 0)).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLotForBid(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-[#FAF7F2]"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-sm"
                >
                  {t.submitBidBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
