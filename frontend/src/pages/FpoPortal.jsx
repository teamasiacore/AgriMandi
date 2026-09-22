import React, { useState, useEffect } from 'react';
import { 
  Users, Layers, TrendingUp, CheckCircle2, AlertCircle, 
  ArrowRight, Scale, ShieldCheck, FileText, Building2, 
  MapPin, RefreshCw, ChevronRight, Plus, ShoppingBag, Landmark
} from 'lucide-react';
import api from '../services/api';
import FpoPayoutSlipModal from '../components/fpo/FpoPayoutSlipModal';
import { DISTRICT_OPTIONS, CROP_OPTIONS } from '../utils/translations';

const FPO_TEXTS = {
  mr: {
    portalTitle: 'शेतकरी उत्पादक संस्था (FPO) संकलन केंद्र',
    portalSub: 'लहान शेतकऱ्यांचा माल एकत्र करा, १००+ क्विंटलचे ट्रकलोड बनवा आणि संस्थात्मक खरेदीदारांकडून जादा भाव मिळवा.',
    verifiedCluster: 'अधिकृत FPO क्लस्टर',
    activeMembers: 'सभासद शेतकरी',
    cinNo: 'CIN / नोंदणी क्र.',
    statTotalPooled: 'एकूण संकलित शेतमाल',
    statMembers: 'सहभागी शेतकरी',
    statBulkLots: 'सक्रिय बल्क लॉट्स',
    statDisbursed: 'सभासदांना वर्ग रक्कम',
    tabEligible: '१. सभासद शेतकरी लॉट्स',
    tabPoolEngine: '२. बल्क लॉट एकत्रीकरण इंजिन',
    tabBulkLots: '३. संस्थात्मक निविदा व सौदे',
    tabLedger: '४. सभासद वाटप खातेवही',
    filterCrop: 'पीक निवडा',
    filterDistrict: 'जिल्हा निवडा',
    noEligibleLots: 'या कार्यक्षेत्रात सध्या कोणतेही लहान लॉट्स उपलब्ध नाहीत. खाली स्वतः सभासदांचा माल जोडा.',
    addCustomMember: '+ नवीन सभासद नोंदणी करा',
    selectedCount: 'निवडलेले लॉट्स',
    totalSelectedQty: 'एकूण निवडलेले वजन',
    targetTruckload: '१० टन (१०० क्विं.) ट्रकलोड क्षमता',
    btnProceedPool: 'बल्क लॉट तयार करा',
    poolTitle: 'संस्थात्मक बल्क लॉट निर्मिती',
    poolSub: 'निवडलेल्या लहान लॉट्सचे वजन आणि सरासरी ओलावा मोजून एकसंध मार्केट लॉट तयार करा.',
    weightedMoisture: 'सरासरी ओलावा (Weighted %)',
    bulkPremiumCallout: 'संस्थात्मक बल्क प्रीमियम: +₹२००/क्विंटल',
    expectedRate: 'अपेक्षित संस्थात्मक दर (₹/क्विंटल)',
    aggregationWarehouse: 'FPO संकलन केंद्र / गोडाऊन पत्ता',
    btnPublishBulk: 'मार्केटमध्ये बल्क लॉट प्रकाशित करा (Publish)',
    publishing: 'बल्क लॉट तयार होत आहे...',
    bulkLotSuccess: 'बल्क लॉट यशस्वीरित्या प्रकाशित झाला!',
    noBulkLots: 'अद्याप कोणतेही बल्क लॉट तयार केलेले नाहीत. "बल्क लॉट एकत्रीकरण" टॅबमधून लॉट बनवा.',
    viewPayoutLedger: 'सभासद वाटप खातेवही पहा',
    dealLocked: 'सौदा पक्का झाला (Deal Locked)',
    inTransit: 'वाहतूक सुरू (In Transit)',
    delivered: 'मिल गेटवर पोहोचले (Delivered)',
    settled: 'खात्यात जमा (Settled)',
    apmcExemptionNotice: 'महाराष्ट्र APMC नियम (कलम ५९) अंतर्गत FPO थेट खरेदीवर ०% मंडी उपकर लागू.'
  },
  hi: {
    portalTitle: 'कृषक उत्पादक कंपनी (FPO) संकलन केंद्र',
    portalSub: 'छोटे किसानों की उपज एकत्र करें, १००+ क्विंटल के ट्रकलोड बनाएं और संस्थागत खरीदारों से बेहतर भाव पाएं।',
    verifiedCluster: 'प्रमाणित FPO क्लस्टर',
    activeMembers: 'सक्रिय किसान सदस्य',
    cinNo: 'CIN / पंजीकरण संख्या',
    statTotalPooled: 'कुल संकलित उपज',
    statMembers: 'सहभागी किसान',
    statBulkLots: 'सक्रिय बल्क लॉट',
    statDisbursed: 'किसानों को भुगतान',
    tabEligible: '१. सदस्य किसान लॉट्स',
    tabPoolEngine: '२. बल्क लॉट एकत्रीकरण इंजन',
    tabBulkLots: '३. संस्थागत बोलियां एवं सौदे',
    tabLedger: '४. सदस्य वितरण खाता',
    filterCrop: 'फसल चुनें',
    filterDistrict: 'जिला चुनें',
    noEligibleLots: 'इस क्षेत्र में वर्तमान में कोई खुले छोटे लॉट उपलब्ध नहीं हैं। नीचे सीधे सदस्य की उपज जोड़ें।',
    addCustomMember: '+ नया किसान सदस्य जोड़ें',
    selectedCount: 'चयनित लॉट्स',
    totalSelectedQty: 'कुल चयनित वजन',
    targetTruckload: '१० टन (१०० क्विं.) ट्रकलोड क्षमता',
    btnProceedPool: 'बल्क लॉट तैयार करें',
    poolTitle: 'संस्थागत बल्क लॉट निर्माण',
    poolSub: 'चयनित छोटे लॉट्स का कुल वजन और भारित औसत नमी मिलाकर एक बड़ा व्यापारिक लॉट बनाएं।',
    weightedMoisture: 'औसत नमी (Weighted %)',
    bulkPremiumCallout: 'संस्थागत बल्क प्रीमियम: +₹२००/क्विंटल',
    expectedRate: 'अपेक्षित संस्थागत भाव (₹/क्विंटल)',
    aggregationWarehouse: 'FPO संकलन केंद्र / गोदाम पता',
    btnPublishBulk: 'बाजार में बल्क लॉट प्रकाशित करें',
    publishing: 'बल्क लॉट प्रकाशित हो रहा है...',
    bulkLotSuccess: 'बल्क लॉट सफलतापूर्वक प्रकाशित किया गया!',
    noBulkLots: 'अभी तक कोई बल्क लॉट नहीं बनाया गया है। "एकत्रीकरण इंजन" से लॉट बनाएं।',
    viewPayoutLedger: 'किसान वितरण खाता देखें',
    dealLocked: 'सौदा पक्का (Deal Locked)',
    inTransit: 'पारगमन में (In Transit)',
    delivered: 'मिल पर प्राप्त (Delivered)',
    settled: 'खाते में भुगतान पूर्ण (Settled)',
    apmcExemptionNotice: 'महाराष्ट्र APMC नियमों (धारा ५९) के तहत FPO प्रत्यक्ष खरीद पर ०% मंडी उपकर।'
  },
  en: {
    portalTitle: 'FPO Collective Aggregation Desk',
    portalSub: 'Pool smallholder produce into 100+ Quintal industrial truckloads and unlock institutional corporate buyer pricing.',
    verifiedCluster: 'Verified FPO Cluster',
    activeMembers: 'Member Farmers',
    cinNo: 'CIN / Reg. No.',
    statTotalPooled: 'Total Pooled Volume',
    statMembers: 'Member Farmers',
    statBulkLots: 'Active Bulk Lots',
    statDisbursed: 'Disbursed to Members',
    tabEligible: '1. Member Harvest Lots',
    tabPoolEngine: '2. Bulk Pooling Engine',
    tabBulkLots: '3. Institutional Bids & Deals',
    tabLedger: '4. Member Payout Ledger',
    filterCrop: 'Select Crop',
    filterDistrict: 'Select District',
    noEligibleLots: 'No unpooled smallholder lots found in this cluster. Add member harvest lots directly below.',
    addCustomMember: '+ Register Member Lot',
    selectedCount: 'Selected Lots',
    totalSelectedQty: 'Total Pooled Weight',
    targetTruckload: '10 MT (100 Qtl) Truckload Target',
    btnProceedPool: 'Assemble Bulk Lot',
    poolTitle: 'Assemble Institutional Bulk Truckload',
    poolSub: 'Calculate combined tonnage, weighted average moisture, and command institutional buyer bulk premiums.',
    weightedMoisture: 'Weighted Moisture %',
    bulkPremiumCallout: 'Institutional Mill Bulk Premium: +₹200/Qtl',
    expectedRate: 'Expected Rate (₹/Qtl)',
    aggregationWarehouse: 'FPO Aggregation Center / Hub Address',
    btnPublishBulk: 'Publish Bulk Lot to Live Marketplace',
    publishing: 'Publishing Bulk Lot...',
    bulkLotSuccess: 'Bulk FPO Lot successfully published to B2B marketplace!',
    noBulkLots: 'No bulk lots created yet. Assemble lots from the "Bulk Pooling Engine" tab.',
    viewPayoutLedger: 'View Member Payout Ledger',
    dealLocked: 'Deal Locked in Escrow',
    inTransit: 'In Transit',
    delivered: 'Delivered at Mill',
    settled: 'Disbursed via RTGS',
    apmcExemptionNotice: 'Section 59 APMC Mandi Cess Exemption (0%) applies to direct FPO farm-gate procurement.'
  }
};

export default function FpoPortal({ currentLang = 'mr' }) {
  const t = FPO_TEXTS[currentLang] || FPO_TEXTS.mr;

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('eligible');
  const [profile, setProfile] = useState(null);
  const [eligibleLots, setEligibleLots] = useState([]);
  const [bulkLots, setBulkLots] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState('Soybean');
  const [selectedDistrict, setSelectedDistrict] = useState(currentUser?.district || 'Latur');

  // Pooling selection
  const [selectedLotIds, setSelectedLotIds] = useState([]);
  const [customMembers, setCustomMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Custom Member Form
  const [memName, setMemName] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memSaatBara, setMemSaatBara] = useState('');
  const [memQty, setMemQty] = useState('20');
  const [memMoisture, setMemMoisture] = useState('10.5');

  // Bulk Lot Publishing Form
  const [expectedRate, setExpectedRate] = useState(4700);
  const [bulkPremium, setBulkPremium] = useState(200);
  const [warehouseAddr, setWarehouseAddr] = useState(
    currentUser?.warehouse_location || currentUser?.address || 'Plot No. 12, Agro Industrial Park, MIDC Ausa, Latur'
  );
  const [submittingPool, setSubmittingPool] = useState(false);
  const [poolSuccessMsg, setPoolSuccessMsg] = useState('');

  // Payout Modal & Commission Ledger
  const [selectedDealForPayout, setSelectedDealForPayout] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [commissionLedger, setCommissionLedger] = useState(null);

  // Fetch initial FPO data
  useEffect(() => {
    fetchFpoData();
  }, [currentUser, selectedCrop, selectedDistrict]);

  const fetchFpoData = async () => {
    setLoading(true);
    try {
      const fpoId = currentUser?.id || currentUser?.user_id || 'fpo-sahyadri-01';
      const phone = currentUser?.phone || '9822012345';

      // 1. Profile
      try {
        const pRes = await api.getFpoProfile(phone);
        if (pRes?.profile) setProfile(pRes.profile);
      } catch (e) {}

      // 2. Eligible Lots in District
      const lotsRes = await api.getFpoEligibleLots({ district: selectedDistrict, crop: selectedCrop });
      if (lotsRes?.lots) setEligibleLots(lotsRes.lots);

      // 3. FPO's created bulk lots
      const bulkRes = await api.getFpoBulkLots(fpoId);
      if (bulkRes?.lots) setBulkLots(bulkRes.lots);

      // 4. FPO deals
      const dealsRes = await api.getFpoDeals(fpoId);
      if (dealsRes?.deals) setDeals(dealsRes.deals);

      // 5. Commission Ledger (AG-015)
      try {
        const ledgerRes = await api.getFpoCommissionLedger(fpoId);
        if (ledgerRes?.ledger) setCommissionLedger(ledgerRes.ledger);
      } catch (lErr) {}

    } catch (err) {
      console.error('Error loading FPO portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection of smallholder lots
  const toggleLotSelect = (lotId) => {
    if (selectedLotIds.includes(lotId)) {
      setSelectedLotIds(selectedLotIds.filter(id => id !== lotId));
    } else {
      setSelectedLotIds([...selectedLotIds, lotId]);
    }
  };

  // Calculate combined quantity and weighted moisture
  const selectedLotsObjects = eligibleLots.filter(l => selectedLotIds.includes(l.id));
  const pooledAllItems = [
    ...selectedLotsObjects.map(l => ({
      lot_id: l.id,
      farmer_id: l.farmer_id,
      farmer_name: l.farmer_name,
      farmer_phone: l.farmer_phone,
      saat_bara_number: l.saat_bara_number || '7/12 Verified',
      village: l.village || l.farm_address || 'Local Village',
      quantity_qtl: Number(l.quantity_qtl) || 0,
      moisture_percentage: Number(l.moisture_percentage) || 10.0
    })),
    ...customMembers
  ];

  const totalPooledQty = pooledAllItems.reduce((acc, item) => acc + item.quantity_qtl, 0);
  const weightedMoistureSum = pooledAllItems.reduce((acc, item) => acc + (item.quantity_qtl * item.moisture_percentage), 0);
  const weightedAvgMoisture = totalPooledQty > 0 ? (weightedMoistureSum / totalPooledQty).toFixed(1) : '10.0';

  // Handle adding custom manual member
  const handleAddCustomMember = (e) => {
    e.preventDefault();
    if (!memName.trim()) return;
    const newMem = {
      lot_id: `mem-${Date.now()}`,
      farmer_id: `usr-fpo-${Date.now()}`,
      farmer_name: memName.trim(),
      farmer_phone: memPhone.trim() || currentUser?.phone || '98XXXXXXXX',
      saat_bara_number: memSaatBara.trim() || '88/2',
      village: `${selectedDistrict} Cluster`,
      quantity_qtl: Number(memQty) || 15,
      moisture_percentage: Number(memMoisture) || 10.2
    };
    setCustomMembers([...customMembers, newMem]);
    setMemName('');
    setMemPhone('');
    setMemSaatBara('');
    setShowAddMemberModal(false);
  };

  // Handle publishing bulk FPO lot
  const handlePublishBulkLot = async () => {
    if (totalPooledQty <= 0) return;
    setSubmittingPool(true);
    setPoolSuccessMsg('');

    try {
      const fpoId = profile?.id || currentUser?.id || 'fpo-sahyadri-01';
      const fpoOrgName = profile?.fpo_name || currentUser?.fpo_name || currentUser?.company_name || 'Sahyadri Farmers Producer Co. Ltd.';
      const fpoPhone = profile?.phone || currentUser?.phone || '9822012345';

      const payload = {
        fpo_id: fpoId,
        fpo_name: fpoOrgName,
        fpo_phone: fpoPhone,
        crop: selectedCrop,
        variety: 'FAQ Grade A Standard',
        district: selectedDistrict,
        taluka: currentUser?.taluka || 'Ausa',
        warehouse_location: warehouseAddr,
        selected_lot_ids: selectedLotIds,
        member_contributions: customMembers,
        expected_price_per_qtl: Number(expectedRate),
        bulk_premium_per_qtl: Number(bulkPremium)
      };

      const res = await api.poolFpoLots(payload);
      if (res?.status === 'success') {
        setPoolSuccessMsg(t.bulkLotSuccess);
        setSelectedLotIds([]);
        setCustomMembers([]);
        await fetchFpoData();
        setActiveTab('bulk-lots');
      }
    } catch (err) {
      console.error('Error creating bulk FPO lot:', err);
    } finally {
      setSubmittingPool(false);
    }
  };

  // Open Payout Ledger Modal
  const handleOpenPayoutModal = async (dealId) => {
    setPayoutLoading(true);
    try {
      const res = await api.getFpoPayoutSplit(dealId);
      if (res?.payoutData) {
        setSelectedDealForPayout(res.payoutData);
      }
    } catch (err) {
      console.error('Error fetching payout split:', err);
    } finally {
      setPayoutLoading(false);
    }
  };

  const fpoDisplayName = profile?.fpo_name || currentUser?.fpo_name || currentUser?.company_name || 'Sahyadri Farmers Producer Co. Ltd.';
  const fpoRegNo = profile?.registration_no || currentUser?.registration_no || 'U01409MH2024PTC392811';
  const fpoMembers = profile?.members_count || currentUser?.members_count || 120;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white border-b border-[#E5DFD4] pt-8 pb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.verifiedCluster}
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  {t.cinNo}: <strong>{fpoRegNo}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white">
                {fpoDisplayName}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                {t.portalSub}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-black/20 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] text-emerald-200 block uppercase font-medium">{t.statMembers}</span>
                <strong className="text-lg font-mono font-bold text-white">{fpoMembers}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] text-emerald-200 block uppercase font-medium">{t.statBulkLots}</span>
                <strong className="text-lg font-mono font-bold text-white">{bulkLots.length}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-200 block uppercase font-medium">{t.statTotalPooled}</span>
                <strong className="text-lg font-mono font-bold text-amber-300">
                  {bulkLots.reduce((acc, l) => acc + (Number(l.quantity_qtl) || 0), 0)} Qtl
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Navigation Tabs */}
      <div className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DFD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'eligible', label: t.tabEligible, icon: Users },
              { id: 'pool-engine', label: `${t.tabPoolEngine} (${selectedLotIds.length + customMembers.length})`, icon: Layers },
              { id: 'bulk-lots', label: `${t.tabBulkLots} (${bulkLots.length})`, icon: ShoppingBag },
              { id: 'payout-ledger', label: `${t.tabLedger} (${deals.length})`, icon: Landmark }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-white text-stone-600 border border-[#E5DFD4] hover:bg-[#F3EDE2]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* TAB 1: ELIGIBLE SMALLHOLDER LOTS */}
        {activeTab === 'eligible' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD4] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{t.filterCrop}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Soybean', 'Cotton', 'Chana', 'Tur'].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrop(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCrop === c ? 'bg-[#1B4332] text-white' : 'bg-[#FAF7F2] text-stone-600 border border-[#E5DFD4]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-3 py-1.5 bg-[#C86432] hover:bg-[#B25528] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addCustomMember}</span>
                </button>
                <button
                  onClick={fetchFpoData}
                  className="p-2 text-stone-400 hover:text-[#1B4332] rounded-lg transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sticky Pooling Selection Bar */}
            {(selectedLotIds.length > 0 || customMembers.length > 0) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Scale className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200 uppercase font-medium">{t.selectedCount}: <strong>{selectedLotIds.length + customMembers.length} Farmers</strong></p>
                    <h3 className="text-lg font-bold font-mono text-white">
                      {totalPooledQty} Quintals <span className="text-xs text-amber-300 font-sans">({weightedAvgMoisture}% avg. moisture)</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-200 hidden sm:inline">
                    {t.targetTruckload}
                  </span>
                  <button
                    onClick={() => setActiveTab('pool-engine')}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-[#1B4332] text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t.btnProceedPool}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Smallholder Lots Grid */}
            {eligibleLots.length === 0 && customMembers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E5DFD4] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-[#1B4332]">
                  <Users className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-[#1B4332]">
                    {currentLang === 'en' ? 'No Open Smallholder Lots in District' : currentLang === 'hi' ? 'जिले में कोई खुला लॉट नहीं' : 'या जिल्ह्यात सध्या खुले लॉट्स उपलब्ध नाहीत'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t.noEligibleLots}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addCustomMember}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eligibleLots.map(lot => {
                  const isSelected = selectedLotIds.includes(lot.id);
                  return (
                    <div 
                      key={lot.id}
                      onClick={() => toggleLotSelect(lot.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                        isSelected 
                          ? 'bg-[#FAF7F2] border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-md' 
                          : 'bg-white border-[#E5DFD4] hover:border-[#1B4332] shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 font-mono block">LOT: {lot.id?.slice(-8)}</span>
                          <h4 className="text-base font-bold text-[#1B4332]">{lot.crop}</h4>
                          <span className="text-xs text-stone-500">{lot.variety || 'FAQ'}</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 text-[#1B4332] rounded-md focus:ring-[#1B4332] cursor-pointer"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E5DFD4] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 block uppercase">वजन / Weight</span>
                          <strong className="text-sm font-mono text-stone-900">{lot.quantity_qtl} Qtl</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block uppercase">ओलावा / Moisture</span>
                          <strong className="text-sm font-mono text-stone-700">{lot.moisture_percentage || 10}%</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E5DFD4] flex items-center justify-between text-xs text-stone-600">
                        <span className="font-semibold text-stone-800 truncate max-w-[150px]">{lot.farmer_name}</span>
                        <span className="font-mono text-emerald-800 font-bold">₹{lot.expected_price_per_qtl}/Qtl</span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom manual members added by FPO */}
                {customMembers.map(m => (
                  <div key={m.lot_id} className="p-5 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-3 relative shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">FPO Registered Member</span>
                        <h4 className="text-base font-bold text-[#1B4332]">{selectedCrop}</h4>
                        <span className="text-xs text-stone-600">{m.farmer_name} (7/12: {m.saat_bara_number})</span>
                      </div>
                      <button 
                        onClick={() => setCustomMembers(customMembers.filter(item => item.lot_id !== m.lot_id))}
                        className="text-stone-400 hover:text-red-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-amber-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase">वजन / Weight</span>
                        <strong className="text-sm font-mono text-stone-900">{m.quantity_qtl} Qtl</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase">ओलावा / Moisture</span>
                        <strong className="text-sm font-mono text-stone-700">{m.moisture_percentage}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BULK TRUCKLOAD AGGREGATION ENGINE */}
        {activeTab === 'pool-engine' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Aggregation Parameters */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD4] shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-heading text-[#1B4332]">{t.poolTitle}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{t.poolSub}</p>
                </div>

                {/* Truckload Gauge Progress Bar */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-700">10 MT (100 Qtl) Truckload Gauge</span>
                    <span className="font-bold font-mono text-[#1B4332]">{totalPooledQty} / 100 Qtl ({Math.min(100, Math.round((totalPooledQty/100)*100))}%)</span>
                  </div>
                  <div className="w-full h-3.5 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        totalPooledQty >= 100 ? 'bg-emerald-600' : 'bg-gradient-to-r from-amber-500 to-[#1B4332]'
                      }`}
                      style={{ width: `${Math.min(100, (totalPooledQty/100)*100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {totalPooledQty >= 100 
                      ? '✓ Full truckload payload achieved! Eligible for top-tier institutional direct mill bids.' 
                      : `Add ${Math.max(0, 100 - totalPooledQty)} more quintals to reach minimum optimal truckload capacity.`}
                  </p>
                </div>

                {/* Pricing & Quality Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t.expectedRate}
                    </label>
                    <input
                      type="number"
                      value={expectedRate}
                      onChange={(e) => setExpectedRate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-mono font-bold text-[#1B4332]"
                    />
                    <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                      ✓ {t.bulkPremiumCallout}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t.weightedMoisture}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${weightedAvgMoisture}% (Grade A Tested)`}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD4] bg-stone-100 text-sm font-mono font-bold text-stone-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Warehouse Location */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.aggregationWarehouse}
                  </label>
                  <input
                    type="text"
                    value={warehouseAddr}
                    onChange={(e) => setWarehouseAddr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>

                {/* APMC Section 59 Exemption Banner */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>0% APMC Cess Exemption (Section 59)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {t.apmcExemptionNotice}
                  </p>
                </div>

                {poolSuccessMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{poolSuccessMsg}</span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handlePublishBulkLot}
                  disabled={submittingPool || totalPooledQty <= 0}
                  className="w-full py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {submittingPool ? (
                    <span>{t.publishing}</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-amber-300" />
                      <span>{t.btnPublishBulk}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right 1 Col: Contributing Farmers Summary */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD4] shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                  {currentLang === 'en' ? 'Pooled Member Farmers' : currentLang === 'hi' ? 'शामिल किसान सदस्य' : 'समाविष्ट शेतकरी सभासद'} ({pooledAllItems.length})
                </h4>

                {pooledAllItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    {currentLang === 'en' ? 'No lots selected yet. Go back to Tab 1 to select member lots.' : 'अद्याप कोणतेही लॉट निवडलेले नाहीत.'}
                  </p>
                ) : (
                  <div className="divide-y divide-[#E5DFD4] max-h-96 overflow-y-auto pr-1">
                    {pooledAllItems.map((item, i) => {
                      const sharePct = totalPooledQty > 0 ? ((item.quantity_qtl / totalPooledQty) * 100).toFixed(1) : 0;
                      return (
                        <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-800 block">{item.farmer_name}</span>
                            <span className="text-[10px] text-stone-500 font-mono">7/12: {item.saat_bara_number}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-[#1B4332] block">{item.quantity_qtl} Qtl</span>
                            <span className="text-[10px] text-stone-500 font-mono">{sharePct}% share</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: INSTITUTIONAL BIDS & DEALS */}
        {activeTab === 'bulk-lots' && (
          <div className="space-y-6">
            {bulkLots.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E5DFD4] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-[#1B4332]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-[#1B4332]">
                    {currentLang === 'en' ? 'No Bulk Lots Created Yet' : currentLang === 'hi' ? 'कोई बल्क लॉट नहीं' : 'अद्याप कोणतेही बल्क लॉट नाही'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t.noBulkLots}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pool-engine')}
                  className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.tabPoolEngine}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bulkLots.map(lot => {
                  const pooledList = lot.pooled_members || [];
                  return (
                    <div key={lot.id} className="p-6 rounded-3xl bg-white border border-[#E5DFD4] shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD4] pb-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            FPO Verified Cluster
                          </span>
                          <span className="text-xs font-mono font-bold text-stone-500">
                            ID: {lot.id}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          lot.status === 'DEAL_LOCKED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {lot.status === 'DEAL_LOCKED' ? t.dealLocked : 'LIVE ON B2B MARKETPLACE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">Commodity</span>
                          <strong className="text-base text-[#1B4332]">{lot.crop}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">Total Volume</span>
                          <strong className="text-base font-mono text-stone-900">{lot.quantity_qtl} Qtl</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">Asking Rate</span>
                          <strong className="text-base font-mono text-emerald-800">₹{lot.expected_price_per_qtl}/Qtl</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block">Member Farmers</span>
                          <strong className="text-base font-mono text-stone-700">{pooledList.length} Farmers</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD4] text-xs text-stone-600 flex items-center justify-between">
                        <span>Pickup Location: <strong>{lot.farm_address}</strong></span>
                        <span className="text-stone-400 font-mono text-[11px]">{new Date(lot.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MEMBER PAYOUT & FPO COMMISSION LEDGER (AG-015) */}
        {activeTab === 'payout-ledger' && (
          <div className="space-y-6">
            
            {/* KPI Summary Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {currentLang === 'en' ? 'Gross Trade Turnover' : currentLang === 'hi' ? 'कुल व्यापार टर्नओवर' : 'एकूण शेतमाल उलाढाल'}
                </span>
                <span className="text-2xl font-bold font-mono text-[#1B4332] mt-1 block">
                  ₹{(commissionLedger?.gross_turnover || deals.reduce((a, d) => a + Number(d.total_deal_value || 0), 0)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  {deals.length} {currentLang === 'en' ? 'Institutional Deals' : 'संस्थागत सौदे'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86432] block">
                  {currentLang === 'en' ? 'FPO Service Commission' : currentLang === 'hi' ? 'FPO सेवा कमीशन' : 'FPO सेवा कमिशन (१.५%)'}
                </span>
                <span className="text-2xl font-bold font-mono text-[#C86432] mt-1 block">
                  ₹{(commissionLedger?.total_commission_earned || Math.round(deals.reduce((a, d) => a + Number(d.total_deal_value || 0), 0) * 0.015)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  1.5% Cooperative Fund
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  {currentLang === 'en' ? 'Net Disbursed to Members' : currentLang === 'hi' ? 'किसानों को शुद्ध भुगतान' : 'सभासदांना प्रत्यक्ष वर्ग'}
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                  ₹{(commissionLedger?.total_disbursed_to_members || Math.round(deals.reduce((a, d) => a + Number(d.total_deal_value || 0), 0) * 0.985)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  98.5% Direct to Bank
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD4] shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {currentLang === 'en' ? 'Total Pooled Volume' : currentLang === 'hi' ? 'कुल संकलित मात्रा' : 'एकूण संकलित वजन'}
                </span>
                <span className="text-2xl font-bold font-mono text-stone-900 mt-1 block">
                  {commissionLedger?.total_pooled_qtl || bulkLots.reduce((a, l) => a + Number(l.quantity_qtl || 0), 0)} <span className="text-sm font-sans font-normal">Qtl</span>
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  {fpoMembers} Member Base
                </span>
              </div>
            </div>

            {/* Master Commission & Deal Ledger */}
            {deals.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E5DFD4] space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-[#1B4332]">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#1B4332]">
                  {currentLang === 'en' ? 'No Executed Deals Yet' : 'अद्याप कोणतेही सौदे पूर्ण झालेले नाहीत'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {currentLang === 'en' 
                    ? 'When buyers accept bids and complete escrow payments, the automated member payout ledger will generate here.' 
                    : 'खरेदीदारांनी बोली मंजूर करून पेमेंट जमा केल्यावर सभासद वाटप खातेवही येथे दिसेल.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E5DFD4] overflow-hidden shadow-xs">
                <div className="p-5 border-b border-[#E5DFD4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold font-heading text-[#1B4332]">
                      {currentLang === 'en' ? 'Master Commission & Member Payout Ledger' : 'FPO कमिशन व सभासद शेतकरी वाटप खातेवही'}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Automated 1.5% cooperative service fee calculation with transparent member disbursement records
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                    Section 59 APMC Exempt ✓
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-[11px] font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
                      <tr>
                        <th className="py-3.5 px-4">Deal Ref & Date</th>
                        <th className="py-3.5 px-4">Commodity & Volume</th>
                        <th className="py-3.5 px-4">Buyer Entity</th>
                        <th className="py-3.5 px-4 text-right">Unit Rate</th>
                        <th className="py-3.5 px-4 text-right">Gross Turnover</th>
                        <th className="py-3.5 px-4 text-right text-[#C86432]">FPO Fee (1.5%)</th>
                        <th className="py-3.5 px-4 text-right text-emerald-800 font-bold">Net to Members</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD4]">
                      {deals.map((deal) => {
                        const dealVal = Number(deal.total_deal_value) || (Number(deal.quantity_qtl) * Number(deal.price_per_qtl));
                        const fpoFee = Math.round(dealVal * 0.015);
                        const netDisbursed = dealVal - fpoFee;

                        return (
                          <tr key={deal.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-[#1B4332] block">{deal.id}</span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'Active Deal'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-stone-900 block">{deal.crop}</span>
                              <span className="text-[10px] text-stone-500 font-mono">{deal.quantity_qtl} Quintals</span>
                            </td>
                            <td className="py-3.5 px-4 text-stone-700 font-medium">
                              {deal.buyer_name || 'Verified Agro Processor'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-stone-700 font-semibold">
                              ₹{deal.price_per_qtl}/Qtl
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                              ₹{dealVal.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-[#C86432]">
                              +₹{fpoFee.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 text-sm">
                              ₹{netDisbursed.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                deal.escrow_status === 'SETTLED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {deal.escrow_status === 'SETTLED' ? 'SETTLED (T+0)' : 'LOCKED IN ESCROW'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleOpenPayoutModal(deal.id)}
                                className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1 mx-auto cursor-pointer transition-all"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-300" />
                                <span>{currentLang === 'en' ? 'Payout Slip' : 'वाटप पत्रक'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Statutory Section 59 Exemption Notice */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wide text-[11px] text-emerald-800">
                  Statutory Mandate: Maharashtra APMC Act (Section 59 Direct Farmer Aggregation Exemption)
                </span>
                <p className="mt-0.5 leading-relaxed text-emerald-800 text-[11px]">
                  All bulk pooled lots aggregated by registered Farmer Producer Companies (FPOs) and dispatched directly to institutional millers are 100% exempt from APMC market committee cess, middlemen commissions, and unauthorized yard deductions. 100% of escrow-cleared proceeds are directly distributed to member farmers with full transparency.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Manual Member Registration Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E5DFD4] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD4] pb-3">
              <h3 className="text-base font-bold text-[#1B4332]">
                {currentLang === 'en' ? 'Register Member Harvest Lot' : 'सभासद शेतकरी लॉट नोंदणी'}
              </h3>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  placeholder="उदा. ज्ञानेश्वर कदम"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={memPhone}
                    onChange={(e) => setMemPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">7/12 Survey No.</label>
                  <input
                    type="text"
                    value={memSaatBara}
                    onChange={(e) => setMemSaatBara(e.target.value)}
                    placeholder="८८/१"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quantity (Quintals) *</label>
                  <input
                    type="number"
                    value={memQty}
                    onChange={(e) => setMemQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Moisture %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={memMoisture}
                    onChange={(e) => setMemMoisture(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] font-bold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl shadow-xs mt-2 cursor-pointer transition-all"
              >
                Add Member to Pool
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payout Slip Printable Modal */}
      {selectedDealForPayout && (
        <FpoPayoutSlipModal
          payoutData={selectedDealForPayout}
          onClose={() => setSelectedDealForPayout(null)}
          currentLang={currentLang}
        />
      )}

    </div>
  );
}
