import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, ShoppingBag, MapPin, Filter, 
  Clock, Plus, X, FileText, CheckCircle2, AlertCircle, 
  Printer, ArrowRight, Lock, Scale, Truck, Search, Eye,
  DollarSign, Users, AlertTriangle, Gavel
} from 'lucide-react';
import api from '../services/api';
import { translations, DISTRICT_OPTIONS } from '../utils/translations';
import DealContractModal from '../components/DealContractModal';
import SelectTransporterModal from '../components/farmer/SelectTransporterModal';
import GateWeighmentModal from '../components/buyer/GateWeighmentModal';
import WeighmentAssaySlipModal from '../components/WeighmentAssaySlipModal';
import ReleaseEscrowModal from '../components/buyer/ReleaseEscrowModal';
import TaxInvoiceModal from '../components/TaxInvoiceModal';
import FileDisputeModal from '../components/dispute/FileDisputeModal';

const LOGISTICS_LABELS = {
  en: {
    logisticsTracker: 'Logistics & Dispatch Tracking',
    unassignedTitle: 'No Transporter Assigned Yet',
    unassignedDesc: 'Assign a verified local transporter to dispatch to farm gate',
    assignTransporterBtn: 'Book / Assign Transporter',
    stageDispatched: 'Transporter Assigned',
    stageAtFarmGate: 'At Farm Gate',
    stageInTransit: 'In Transit',
    stageDelivered: 'Delivered at Mill',
    driver: 'Driver:',
    vehicle: 'Vehicle:',
    freight: 'Freight:',
    callDriver: 'Call Driver',
    recordWeighmentBtn: 'Record Gate Weighment & Quality Assay',
    viewWeighmentBtn: 'View Weighment & Assay Certificate',
    weighmentCertifiedBadge: 'Gate Weighment Certified'
  },
  hi: {
    logisticsTracker: 'लॉजिस्टिक्स एवं वाहन ट्रैकिंग',
    unassignedTitle: 'कोई ट्रांसपोर्टर असाइन नहीं है',
    unassignedDesc: 'खेत पर वाहन भेजने के लिए सत्यापित स्थानीय ट्रांसपोर्टर चुनें',
    assignTransporterBtn: 'ट्रांसपोर्टर बुक / असाइन करें',
    stageDispatched: 'ट्रांसपोर्टर असाइन किया',
    stageAtFarmGate: 'खेत पर वाहन मौजूद',
    stageInTransit: 'रास्ते में (ट्रांजिट)',
    stageDelivered: 'मिल गेट पर पहुंच गया',
    driver: 'चालक:',
    vehicle: 'वाहन:',
    freight: 'भाड़ा:',
    callDriver: 'चालक से संपर्क करें',
    recordWeighmentBtn: 'गेट वे-ब्रिज एवं गुणवत्ता परीक्षण दर्ज करें',
    viewWeighmentBtn: 'प्रमाणित वे-ब्रिज एवं गुणवत्ता पावती देखें',
    weighmentCertifiedBadge: 'वेब्रिज वजन प्रमाणित'
  },
  mr: {
    logisticsTracker: 'वाहतूक व वाहन ट्रॅकिंग',
    unassignedTitle: 'अद्याप वाहतूकदार नियुक्त नाही',
    unassignedDesc: 'शेतकऱ्याच्या शेतावर वाहन पाठवण्यासाठी सत्यापित स्थानिक वाहतूकदार निवडा',
    assignTransporterBtn: 'वाहतूकदार बुक / नियुक्त करा',
    stageDispatched: 'वाहतूकदार नियुक्त',
    stageAtFarmGate: 'शेतावर पोहोचले',
    stageInTransit: 'वाहतुकीत (प्रवासात)',
    stageDelivered: 'कारखान्यावर पोहोचले',
    driver: 'चालक:',
    vehicle: 'वाहन क्रमांक:',
    freight: 'भाडे रक्कम:',
    callDriver: 'चालकाशी संपर्क',
    recordWeighmentBtn: 'गेट वेब्रिज व गुणवत्ता तपासणी नोंदवा',
    viewWeighmentBtn: 'प्रमाणित वेब्रिज व गुणवत्ता पावती पहा',
    weighmentCertifiedBadge: 'वेब्रिज वजन प्रमाणित'
  }
};

const ESCROW_LABELS = {
  en: {
    releaseEscrowBtn: 'Release Escrow Payout (T+0)',
    readyForSettlement: 'Weighment Certified — Ready for Payout',
    escrowSettledBadge: 'Escrow Settled & Disbursed',
    viewInvoiceBtn: 'B2B Tax Invoice',
    utrLabel: 'Bank UTR:'
  },
  hi: {
    releaseEscrowBtn: 'किसान को एस्क्रो भुगतान जारी करें (T+0)',
    readyForSettlement: 'वेब्रिज प्रमाणित — भुगतान जारी करने हेतु तैयार',
    escrowSettledBadge: 'एस्क्रो भुगतान सीधे किसान खाते में जमा',
    viewInvoiceBtn: 'टैक्स इनवॉइस',
    utrLabel: 'बैंक यूटीआर:'
  },
  mr: {
    releaseEscrowBtn: 'शेतकऱ्यास एस्क्रो देयक वर्ग करा (T+0)',
    readyForSettlement: 'वेब्रिज प्रमाणित — रक्कम वर्ग करण्यासाठी सज्ज',
    escrowSettledBadge: 'एस्क्रो देयक शेतकऱ्याच्या खात्यात जमा',
    viewInvoiceBtn: 'टॅक्स इनव्हॉईस',
    utrLabel: 'बँक यूटीआर:'
  }
};

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

  // Filters & Search (Demand Discovery AG-011)
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterQuality, setFilterQuality] = useState('all');
  const [filterMaxDistance, setFilterMaxDistance] = useState(0); // 0 = all
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'price_asc' | 'qty_desc'
  const [maxMoisture, setMaxMoisture] = useState(14);
  const [searchQuery, setSearchQuery] = useState('');
  const [bidFilter, setBidFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED'
  const [actionLoading, setActionLoading] = useState(false);

  // Bid Modal State
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [bidForm, setBidForm] = useState({
    offered_price_per_qtl: '',
    quantity_requested_qtl: '',
    delivery_destination: '',
    valid_hours: 24
  });

  // Deal Contract, Logistics & Weighment Modal State
  const [selectedDealForContract, setSelectedDealForContract] = useState(null);
  const [selectedDealForDispatch, setSelectedDealForDispatch] = useState(null);
  const [selectedDealForWeighment, setSelectedDealForWeighment] = useState(null);
  const [selectedDealForWeighmentSlip, setSelectedDealForWeighmentSlip] = useState(null);
  const [selectedDealForPayout, setSelectedDealForPayout] = useState(null);
  const [selectedDealForInvoice, setSelectedDealForInvoice] = useState(null);
  const [selectedDealForDispute, setSelectedDealForDispute] = useState(null);

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
          status: u.status || 'UNDER_REVIEW',
          is_verified: Boolean(u.is_verified && u.status === 'VERIFIED')
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

  // Filtered lots calculation (Demand Discovery with Quality, Distance & Sorting)
  const filteredLots = lots
    .filter(lot => {
      // Only display published / marketplace active lots to buyers (never drafts or cancelled)
      if (lot.status && lot.status !== 'LISTED' && lot.status !== 'DEAL_LOCKED') return false;
      if (filterCrop !== 'all' && lot.crop.toLowerCase() !== filterCrop.toLowerCase()) return false;
      if (filterDistrict !== 'all' && lot.district.toLowerCase() !== filterDistrict.toLowerCase()) return false;
      if (filterQuality !== 'all' && (lot.quality_grade || 'FAQ (Grade A)') !== filterQuality) return false;
      if (lot.moisture_percentage && Number(lot.moisture_percentage) > maxMoisture) return false;
      
      const distance = calculateHaversineDistance(buyerProfile.district, lot.district, lot.farm_lat, lot.farm_lng);
      if (filterMaxDistance > 0 && distance > filterMaxDistance) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCrop = (lot.crop || '').toLowerCase().includes(q);
        const matchVariety = (lot.variety || '').toLowerCase().includes(q);
        const matchFarmer = (lot.farmer_name || '').toLowerCase().includes(q);
        const matchAddress = (lot.farm_address || '').toLowerCase().includes(q);
        if (!matchCrop && !matchVariety && !matchFarmer && !matchAddress) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.expected_price_per_qtl) - Number(b.expected_price_per_qtl);
      if (sortBy === 'qty_desc') return Number(b.quantity_qtl) - Number(a.quantity_qtl);
      // default: nearest first
      const distA = calculateHaversineDistance(buyerProfile.district, a.district, a.farm_lat, a.farm_lng);
      const distB = calculateHaversineDistance(buyerProfile.district, b.district, b.farm_lat, b.farm_lng);
      return distA - distB;
    });

  const handleAcceptCounter = async (offer) => {
    const confirmMsg = currentLang === 'en' 
      ? `Accept farmer's counter offer of ₹${offer.counter_price_per_qtl}/Qtl and lock this deal?`
      : currentLang === 'hi'
      ? `क्या आप किसान के प्रति-प्रस्ताव ₹${offer.counter_price_per_qtl}/क्विंटल को स्वीकार कर सौदा पक्का करना चाहते हैं?`
      : `शेतकर्‍याचा प्रति-दर ₹${offer.counter_price_per_qtl}/क्विंटल स्वीकारून खरेदी करार पक्का करायचा आहे का?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await api.acceptCounterOffer(offer.id, { actor_id: buyerProfile.id });
      alert(currentLang === 'en' ? '🎉 Deal executed at counter rate! Escrow contract locked.' : '🎉 प्रति-दरावर खरेदी करार पक्का झाला!');
      loadMarketData(buyerProfile);
      if (res.deal) setSelectedDealForContract(res.deal);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawBid = async (offer) => {
    const confirmMsg = currentLang === 'en' ? 'Withdraw this digital bid?' : 'आपली ही बोली मागे घ्यायची आहे का?';
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      await api.withdrawOffer(offer.id, { actor_id: buyerProfile.id });
      alert(currentLang === 'en' ? '✓ Bid withdrawn successfully.' : '✓ बोली मागे घेण्यात आली.');
      loadMarketData(buyerProfile);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenContract = async (deal) => {
    try {
      const res = await api.getDealContract(deal.id);
      if (res && res.contract) {
        setSelectedDealForContract({
          ...deal,
          ...res.contract,
          contract_number: res.contract.contract_number,
          escrow_status: res.contract.escrow?.status || deal.escrow_status
        });
        return;
      }
    } catch (e) {}
    setSelectedDealForContract(deal);
  };

  const handleLockEscrow = async (deal) => {
    const confirmMsg = currentLang === 'en'
      ? `Authorize deposit of ₹${Number(deal.total_deal_value).toLocaleString()} into AgriMandi 100% Secure Escrow Vault?`
      : currentLang === 'hi'
      ? `क्या आप ₹${Number(deal.total_deal_value).toLocaleString()} की राशि एस्क्रो वॉल्ट में सुरक्षित जमा करना चाहते हैं?`
      : `आपण ₹${Number(deal.total_deal_value).toLocaleString()} ची रक्कम कृषीसेतू १००% एस्क्रो वॉल्टमध्ये जमा करू इच्छिता का?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.lockEscrowFunds(deal.id, {
        buyer_id: buyerProfile.id,
        escrow_amount: deal.total_deal_value,
        payment_method: 'NET_BANKING_RTGS'
      });
      alert(currentLang === 'en' ? '✓ Funds successfully secured in Escrow Vault!' : '✓ रक्कम एस्क्रो वॉल्टमध्ये यशस्वीरित्या जमा झाली!');
      loadMarketData(buyerProfile);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenBidModal = (lot) => {
    const isVerified = Boolean(buyerProfile.is_verified || buyerProfile.status === 'VERIFIED');
    if (!isVerified || buyerProfile.status === 'PENDING_VERIFICATION' || buyerProfile.status === 'UNDER_REVIEW' || buyerProfile.status === 'DOCUMENTS_SUBMITTED') {
      alert(
        currentLang === 'en'
          ? 'Your account is under administrative review by ASIACore. Live counter-bidding unlocks once your GSTIN and APMC license are verified.'
          : currentLang === 'hi'
          ? 'आपका खाता ASIACore प्रशासन द्वारा समीक्षाधीन है। GSTIN और APMC लाइसेंस के सत्यापन के बाद ही लाइव बोली की सुविधा उपलब्ध होगी।'
          : 'आपले खाते ASIACore प्रशासनाच्या पुनरावलोकनाखाली आहे. GSTIN व APMC परवाना पडताळणी पूर्ण झाल्यावरच थेट बोली लावता येईल.'
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
                  <ShieldCheck className="w-3.5 h-3.5" /> {buyerProfile.is_verified ? t.buyerVerified : (currentLang === 'en' ? 'GSTIN Registered' : currentLang === 'hi' ? 'GSTIN पंजीकृत' : 'नोंदणीकृत व्यापारी')}
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
              <span className="text-[10px] text-stone-300 block mt-0.5">{currentLang === 'en' ? 'Farm-Gate Harvest' : currentLang === 'hi' ? 'फार्म-गेट उपज' : 'शेतातून थेट'}</span>
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
        {(!buyerProfile.is_verified || buyerProfile.status !== 'VERIFIED') && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-amber-950">
                  {currentLang === 'en' ? 'Account Verification in Progress' : currentLang === 'hi' ? 'खाता सत्यापन प्रक्रियाधीन' : 'खाते पडताळणी प्रलंबित'}
                </p>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                  {buyerProfile.status || 'UNDER_REVIEW'}
                </span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                {currentLang === 'en'
                  ? `Your registered GSTIN (${buyerProfile.gstin || 'Under Review'}) and APMC Direct Procurement License are currently undergoing verification by ASIACore Administration. Direct counter-bidding and contract locking will be unlocked upon approval.`
                  : currentLang === 'hi'
                  ? `आपका पंजीकृत GSTIN (${buyerProfile.gstin || 'समीक्षाधीन'}) और APMC खरीद लाइसेंस ASIACore प्रशासन द्वारा सत्यापन प्रक्रिया में है। स्वीकृति के बाद बोली सक्रिय होगी।`
                  : `आपले नोंदणीकृत GSTIN (${buyerProfile.gstin || 'पुनरावलोकनाखाली'}) आणि APMC परवाना ASIACore प्रशासनाच्या पडताळणीत आहे. मंजुरीनंतर थेट बोली लावता येईल.`}
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
            <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-[#1B4332] uppercase flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" /> {currentLang === 'en' ? 'Filters:' : currentLang === 'hi' ? 'फिल्टर:' : 'फिल्टर्स:'}
                  </span>

                  {/* Crop Filter */}
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

                  {/* District Filter */}
                  <select
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                  >
                    <option value="all">{t.allDistricts}</option>
                    {DISTRICT_OPTIONS.map(d => (
                      <option key={d.id} value={d.id}>
                        {d[currentLang] || d.en}
                      </option>
                    ))}
                  </select>

                  {/* Quality Grade Filter (AG-011) */}
                  <select
                    value={filterQuality}
                    onChange={(e) => setFilterQuality(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                  >
                    <option value="all">{currentLang === 'en' ? 'All Quality Grades' : 'सर्व गुणवत्ता प्रती'}</option>
                    <option value="FAQ (Grade A)">FAQ (Grade A)</option>
                    <option value="Premium Export Grade">Premium Export Grade</option>
                    <option value="Medium Grade B">Medium Grade B</option>
                  </select>

                  {/* Distance Radius Filter (AG-011) */}
                  <select
                    value={filterMaxDistance}
                    onChange={(e) => setFilterMaxDistance(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-stone-800"
                  >
                    <option value={0}>{currentLang === 'en' ? 'Any Distance' : 'सर्व अंतर'}</option>
                    <option value={50}>{currentLang === 'en' ? 'Within 50 km' : '५० किमी आत'}</option>
                    <option value={100}>{currentLang === 'en' ? 'Within 100 km' : '१०० किमी आत'}</option>
                    <option value={200}>{currentLang === 'en' ? 'Within 200 km' : '२०० किमी आत'}</option>
                  </select>

                  {/* Sort Order (AG-011) */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold text-[#1B4332]"
                  >
                    <option value="nearest">{currentLang === 'en' ? 'Sort: Nearest First' : 'क्रम: जवळचे पहिले'}</option>
                    <option value="price_asc">{currentLang === 'en' ? 'Sort: Lowest Price' : 'क्रम: कमी दर'}</option>
                    <option value="qty_desc">{currentLang === 'en' ? 'Sort: Highest Qty' : 'क्रम: जास्त प्रमाण'}</option>
                  </select>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[200px]">
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

              {/* Moisture Slider bar */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#E5DFD4]/60 text-xs font-medium text-stone-600">
                <span className="font-bold text-[#1B4332]">{t.filterMoisture}:</span>
                <input
                  type="range"
                  min="6"
                  max="18"
                  value={maxMoisture}
                  onChange={(e) => setMaxMoisture(Number(e.target.value))}
                  className="w-32 accent-[#1B4332]"
                />
                <span className="font-bold text-[#1B4332] font-mono">{maxMoisture}% max</span>
                <span className="text-stone-400 text-[11px]">
                  ({filteredLots.length} {currentLang === 'en' ? 'verified lots available' : 'सत्यापित लॉट उपलब्ध'})
                </span>
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
                            {lot.is_fpo_bulk && (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center gap-1">
                                  <Users className="w-3 h-3 text-amber-700" />
                                  <span>FPO Verified Cluster</span>
                                </span>
                                {Array.isArray(lot.pooled_members) && lot.pooled_members.length > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-mono font-medium">
                                    {lot.pooled_members.length} Farmers Pooled
                                  </span>
                                )}
                              </div>
                            )}
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
                            <span>{currentLang === 'en' ? 'Direct Farm-Gate Procurement (Saves ₹45/Qtl APMC Cess)' : currentLang === 'hi' ? 'खेत से सीधी खरीद (मंडी शुल्क व दलाली ०%)' : 'थेट शेतातून खरेदी (मंडी सेस व दलाली ०%)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 pt-4 border-t border-[#E5DFD4] flex items-center justify-between">
                        <div className="text-[11px] text-stone-500">
                          <span className="text-stone-400 block">{currentLang === 'en' ? 'Farmer:' : currentLang === 'hi' ? 'किसान:' : 'शेतकरी:'}</span>
                          <strong className="text-stone-700">{lot.farmer_name || (currentLang === 'en' ? 'Verified Farmer' : currentLang === 'hi' ? 'सत्यापित किसान' : 'सत्यापित शेतकरी')}</strong>
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
                            <span>{currentLang === 'en' ? 'Contract Executed' : currentLang === 'hi' ? 'सौदा तय' : 'करार पक्का झाला'}</span>
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
                    {currentLang === 'en' ? 'Track and negotiate digital offers placed on farmer harvest lots' : currentLang === 'hi' ? 'किसान फसल लॉट्स पर लगाई गई बोलियों की स्थिति व मोलभाव ट्रैक करें' : 'शेतकरी लॉट्सवर लावलेल्या आपल्या बोलींची स्थिती व वाटाघाटी'}
                  </p>
                </div>

                {/* Offer Status Filter Pills (AG-011) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: 'ALL', label: currentLang === 'en' ? 'All' : 'सर्व' },
                    { key: 'PENDING', label: currentLang === 'en' ? 'Pending' : 'प्रलंबित' },
                    { key: 'COUNTERED', label: currentLang === 'en' ? 'Countered' : 'प्रति-दर' },
                    { key: 'ACCEPTED', label: currentLang === 'en' ? 'Accepted' : 'स्वीकृत' },
                    { key: 'REJECTED', label: currentLang === 'en' ? 'Rejected' : 'नाकारले' }
                  ].map(tab => {
                    const count = tab.key === 'ALL' ? myOffers.length : myOffers.filter(o => o.status === tab.key).length;
                    const isActive = bidFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setBidFilter(tab.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isActive
                            ? 'bg-[#1B4332] text-white shadow-2xs'
                            : 'bg-[#FAF7F2] text-stone-600 hover:bg-[#E5DFD4] border border-[#E5DFD4]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {myOffers.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700">{t.noBidsYetBuyer}</p>
                  <p className="mt-1">{currentLang === 'en' ? 'Explore the marketplace and place your first binding offer.' : currentLang === 'hi' ? 'बाजार में उपलब्ध लॉट्स देखें और किसान को सीधी बोली लगाएं।' : 'बाजारातील लॉट्स पहा आणि शेतकर्‍याला पहिली थेट बोली लावा.'}</p>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="mt-4 px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t.tabMarketplace}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF7F2] text-xs font-bold text-[#1B4332] uppercase tracking-wider border-b border-[#E5DFD4]">
                      <tr>
                        <th className="py-3 px-4">{currentLang === 'en' ? 'Offer ID' : currentLang === 'hi' ? 'बोली ID' : 'ऑफर ID'}</th>
                        <th className="py-3 px-4">{currentLang === 'en' ? 'Lot ID' : currentLang === 'hi' ? 'लॉट ID' : 'लॉट ID'}</th>
                        <th className="py-3 px-4 text-right">{t.labelReqQty}</th>
                        <th className="py-3 px-4 text-right">{t.labelOfferedPrice}</th>
                        <th className="py-3 px-4 text-right">{t.totalBidValue}</th>
                        <th className="py-3 px-4">{t.labelDeliveryDest}</th>
                        <th className="py-3 px-4">{currentLang === 'en' ? 'Status' : currentLang === 'hi' ? 'स्थिति' : 'स्थिती'}</th>
                        <th className="py-3 px-4 text-center">{currentLang === 'en' ? 'Action' : currentLang === 'hi' ? 'कार्रवाई' : 'कृती'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD4]">
                      {myOffers
                        .filter(o => bidFilter === 'ALL' ? true : o.status === bidFilter)
                        .map((off) => {
                          const isAccepted = off.status === 'ACCEPTED';
                          const isCountered = off.status === 'COUNTERED';
                          const isRejected = off.status === 'REJECTED';
                          const isWithdrawn = off.status === 'WITHDRAWN';
                          const isPending = off.status === 'PENDING';

                          return (
                            <tr key={off.id} className={`transition-colors ${isCountered ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-[#FCFAF6]'}`}>
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
                                    : isCountered
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                    : isRejected
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : isWithdrawn
                                    ? 'bg-stone-100 text-stone-600 border border-stone-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {isAccepted ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                      {currentLang === 'en' ? 'Accepted' : currentLang === 'hi' ? 'स्वीकृत' : 'मंजूर'}
                                    </>
                                  ) : isCountered ? (
                                    <>
                                      <Scale className="w-3 h-3 text-amber-700" />
                                      {currentLang === 'en' ? `Counter: ₹${off.counter_price_per_qtl}` : `प्रति-दर: ₹${off.counter_price_per_qtl}`}
                                    </>
                                  ) : isRejected ? (
                                    <>
                                      <X className="w-3 h-3 text-red-600" />
                                      {currentLang === 'en' ? 'Rejected' : currentLang === 'hi' ? 'अस्वीकृत' : 'नाकारले'}
                                    </>
                                  ) : isWithdrawn ? (
                                    <span>{currentLang === 'en' ? 'Withdrawn' : 'मागे घेतले'}</span>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-blue-700" />
                                      {currentLang === 'en' ? 'Pending' : currentLang === 'hi' ? 'प्रलंबित' : 'प्रलंबित'}
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {isAccepted && (
                                  <button
                                    onClick={() => handleViewDealContract(off)}
                                    className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3 text-emerald-200" />
                                    <span>{currentLang === 'en' ? 'Deal Contract' : currentLang === 'hi' ? 'करार देखें' : 'करार पहा'}</span>
                                  </button>
                                )}

                                {isCountered && (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleAcceptCounter(off)}
                                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                      title="Accept farmer counter rate and lock contract"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                                      <span>{currentLang === 'en' ? `Accept ₹${off.counter_price_per_qtl}` : `स्वीकार करा`}</span>
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleWithdrawBid(off)}
                                      className="px-2 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                      title="Decline counter offer"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>{currentLang === 'en' ? 'Decline' : 'नकार'}</span>
                                    </button>
                                  </div>
                                )}

                                {isPending && (
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-[11px] text-stone-400 italic">
                                      {currentLang === 'en' ? 'Awaiting Farmer' : 'शेतकरी निर्णयाची प्रतीक्षा'}
                                    </span>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleWithdrawBid(off)}
                                      className="px-2 py-1 bg-white border border-stone-300 hover:bg-rose-50 hover:border-rose-300 text-stone-600 hover:text-rose-700 rounded text-[11px] font-semibold cursor-pointer"
                                      title="Withdraw this bid before acceptance"
                                    >
                                      {currentLang === 'en' ? 'Withdraw' : 'मागे घ्या'}
                                    </button>
                                  </div>
                                )}

                                {isRejected && (
                                  <span className="text-[11px] text-stone-400 italic block">
                                    {off.rejection_reason || (currentLang === 'en' ? 'Declined by farmer' : 'शेतकर्‍याने नाकारले')}
                                  </span>
                                )}

                                {isWithdrawn && (
                                  <span className="text-[11px] text-stone-400 italic block">
                                    {currentLang === 'en' ? 'Bid withdrawn' : 'बोली मागे घेतली'}
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
                      📄 {currentLang === 'en' ? 'Executed B2B Trade Contracts & Escrow' : currentLang === 'hi' ? 'निष्पादित B2B व्यापार अनुबंध एवं एस्क्रो' : 'कायदेशीर खरेदी करार व एस्क्रो हमी'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {currentLang === 'en' ? 'Legally binding contracts locked upon farmer acceptance' : currentLang === 'hi' ? 'किसान द्वारा बोली स्वीकार किए जाने पर पक्के हुए अनुबंध' : 'शेतकर्‍याने बोली स्वीकारल्यानंतर तयार झालेले डिजिटल करार'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    {myDeals.length} {currentLang === 'en' ? 'Contracts' : currentLang === 'hi' ? 'अनुबंध' : 'करार'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {myDeals.map((deal) => (
                    <div key={deal.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4]">
                          <div>
                            <span className="font-mono font-bold text-xs text-[#1B4332] block">
                              {deal.contract_number || deal.id}
                            </span>
                            {deal.escrow_txn_ref && (
                              <span className="text-[10px] font-mono text-stone-500 block">
                                Ref: {deal.escrow_txn_ref}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {deal.escrow_status === 'PENDING_DEPOSIT' ? (
                              <button
                                onClick={() => handleLockEscrow(deal)}
                                className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3 text-[#A3E635]" />
                                <span>{currentLang === 'en' ? 'Deposit in Escrow' : 'एस्क्रो जमा करा'}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                {deal.escrow_status || 'SECURED_IN_ESCROW'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Farmer:' : currentLang === 'hi' ? 'किसान:' : 'शेतकरी:'}</span>
                            <span className="font-bold text-stone-800">{deal.farmer_name}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Crop:' : currentLang === 'hi' ? 'फसल:' : 'पीक:'}</span>
                            <span className="font-bold text-stone-800">{deal.crop}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Quantity:' : currentLang === 'hi' ? 'मात्रा:' : 'प्रमाण:'}</span>
                            <span className="font-bold font-mono text-stone-800">{deal.quantity_qtl} Qtl</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{currentLang === 'en' ? 'Agreed Rate:' : currentLang === 'hi' ? 'स्वीकृत भाव:' : 'मंजूर दर:'}</span>
                            <span className="font-bold font-mono text-[#C86432]">₹{deal.price_per_qtl} / Qtl</span>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-white rounded-lg border border-[#E5DFD4] flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium">{currentLang === 'en' ? 'Total Consideration:' : currentLang === 'hi' ? 'कुल अनुबंध राशि:' : 'एकूण करार रक्कम:'}</span>
                          <span className="font-bold font-mono text-base text-[#1B4332]">₹{deal.total_deal_value.toLocaleString()}</span>
                        </div>

                        {/* B2B Logistics & Transporter Tracker Strip */}
                        {(() => {
                          const status = deal.delivery_status || 'PENDING_PICKUP';
                          const isAssigned = Boolean(deal.transporter_id || deal.driver_name);
                          const currentStep = 
                            status === 'DELIVERED' ? 4 :
                            status === 'IN_TRANSIT' ? 3 :
                            status === 'AT_FARM_GATE' ? 2 :
                            status === 'DISPATCHED' ? 1 : 0;

                          const labels = LOGISTICS_LABELS[currentLang] || LOGISTICS_LABELS.mr;

                          return (
                            <div className="mt-3 p-3 rounded-xl bg-white border border-[#E5DFD4]">
                              <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4]">
                                <div className="flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
                                  <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wide">
                                    {labels.logisticsTracker}
                                  </span>
                                </div>
                                {isAssigned ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                    {status === 'DELIVERED' ? labels.stageDelivered :
                                     status === 'IN_TRANSIT' ? labels.stageInTransit :
                                     status === 'AT_FARM_GATE' ? labels.stageAtFarmGate : labels.stageDispatched}
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setSelectedDealForDispatch(deal)}
                                    className="px-2.5 py-1 bg-[#C86432] hover:bg-[#b05528] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Truck className="w-3 h-3" />
                                    <span>{labels.assignTransporterBtn}</span>
                                  </button>
                                )}
                              </div>

                              {/* 4-step transit milestones */}
                              <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
                                {[
                                  { step: 1, label: labels.stageDispatched },
                                  { step: 2, label: labels.stageAtFarmGate },
                                  { step: 3, label: labels.stageInTransit },
                                  { step: 4, label: labels.stageDelivered }
                               ].map(m => {
                                  const isDone = currentStep >= m.step;
                                  const isCurrent = currentStep === m.step;
                                  return (
                                    <div key={m.step} className="flex flex-col items-center">
                                      <div className={`w-full h-1 rounded-full mb-1 transition-all ${
                                        isDone ? 'bg-emerald-600' : 'bg-stone-200'
                                      }`} />
                                      <span className={`text-[10px] leading-tight ${
                                        isCurrent ? 'text-emerald-700 font-bold' : isDone ? 'text-stone-800 font-medium' : 'text-stone-400'
                                      }`}>
                                        {m.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Driver info if assigned */}
                              {isAssigned && (
                                <div className="mt-2 pt-2 border-t border-[#E5DFD4] flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-600">
                                  <div className="flex items-center gap-2">
                                    <span>{labels.driver} <strong className="text-stone-900">{deal.driver_name}</strong></span>
                                    <span className="font-mono font-bold text-stone-800">({deal.vehicle_number})</span>
                                  </div>
                                  {deal.driver_phone && (
                                    <a
                                      href={`tel:${deal.driver_phone}`}
                                      className="font-bold text-[#1B4332] hover:underline"
                                    >
                                      📞 {deal.driver_phone}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Weighment, Assay & Escrow Settlement Actions */}
                      {(() => {
                        const escLabels = ESCROW_LABELS[currentLang] || ESCROW_LABELS.mr;
                        const isSettled = deal.escrow_status === 'SETTLED';
                        const isReadyForPayout = deal.escrow_status === 'READY_FOR_SETTLEMENT';
                        const hasWeighment = Boolean(deal.weighment);

                        if (deal.escrow_status === 'DISPUTED_IN_ARBITRATION') {
                          return (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-xs text-amber-950">
                              <div className="flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1.5 text-amber-900">
                                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                                  APMC Dispute in Arbitration
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                                  ESCROW FROZEN
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-800 leading-tight">
                                ₹{Number(deal.total_deal_value).toLocaleString('en-IN')} escrow funds frozen pending APMC arbitral ruling.
                              </p>
                            </div>
                          );
                        }

                        if (isSettled) {
                          return (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-950">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                  {escLabels.escrowSettledBadge}
                                </span>
                                <span className="font-mono font-black text-emerald-900 text-sm">
                                  ₹{Number(deal.total_deal_value).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="text-[11px] text-emerald-800 flex items-center justify-between">
                                <span>{escLabels.utrLabel} <strong className="font-mono">{deal.settlement_utr || deal.settlement?.utr || 'UTR-AGRI-2026-9214'}</strong></span>
                                <button
                                  onClick={() => setSelectedDealForInvoice(deal)}
                                  className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 text-[#A3E635]" />
                                  <span>{escLabels.viewInvoiceBtn}</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        if (isReadyForPayout) {
                          return (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                  {escLabels.readyForSettlement}
                                </span>
                                <span className="font-mono font-bold text-stone-900">
                                  {deal.weighment?.net_qtl || deal.quantity_qtl} Qtl
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedDealForPayout(deal)}
                                className="w-full py-2 bg-[#1B4332] hover:bg-[#143326] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <DollarSign className="w-4 h-4 text-[#A3E635]" />
                                <span>{escLabels.releaseEscrowBtn} (₹{Number(deal.total_deal_value).toLocaleString('en-IN')})</span>
                              </button>
                            </div>
                          );
                        }

                        if (hasWeighment) {
                          return (
                            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                <span className="font-bold text-emerald-950">
                                  {labels.weighmentCertifiedBadge}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-emerald-900">
                                {deal.weighment?.net_qtl || deal.quantity_qtl} Qtl (₹{deal.total_deal_value?.toLocaleString()})
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() => setSelectedDealForWeighment(deal)}
                            className="mt-3 w-full py-2 bg-[#C86432] hover:bg-[#b05528] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{labels.recordWeighmentBtn}</span>
                          </button>
                        );
                      })()}

                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => handleOpenContract(deal)}
                          className="py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{currentLang === 'en' ? 'Contract' : currentLang === 'hi' ? 'अनुबंध' : 'करार'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedDealForWeighmentSlip(deal)}
                          className="py-2 bg-white border border-[#E5DFD4] hover:bg-[#FAF7F2] text-stone-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <Scale className="w-3 h-3 text-[#C86432]" />
                          <span>{currentLang === 'en' ? 'Weigh' : currentLang === 'hi' ? 'वेब्रिज' : 'वेब्रिज'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedDealForInvoice(deal)}
                          className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer ${
                            deal.escrow_status === 'SETTLED'
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-stone-100 border border-[#E5DFD4] text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{currentLang === 'en' ? 'Invoice' : currentLang === 'hi' ? 'बीजक' : 'इनव्हॉईस'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedDealForDispute(deal)}
                          className={`py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer ${
                            deal.escrow_status === 'DISPUTED_IN_ARBITRATION'
                              ? 'bg-amber-100 border border-amber-300 text-amber-900 font-black'
                              : 'bg-stone-50 border border-[#E5DFD4] hover:bg-stone-100 text-stone-600'
                          }`}
                        >
                          <Gavel className="w-3 h-3 text-[#C86432]" />
                          <span>{deal.escrow_status === 'DISPUTED_IN_ARBITRATION' ? 'Disputed' : 'Dispute'}</span>
                        </button>
                      </div>
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
                    {currentLang === 'en' ? 'Licensed Agro-Processing Mills and Institutional Buyers' : currentLang === 'hi' ? 'लाइसेंस प्राप्त कृषि प्रसंस्करण मिलें और संस्थागत खरीदार' : 'महाराष्ट्र शासन परवानाधारक व GSTIN नोंदणीकृत खरेदीदार'}
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E5DFD4]">
                  {buyers.length} {currentLang === 'en' ? 'Verified Units' : currentLang === 'hi' ? 'सत्यापित मिलें' : 'सत्यापित कारखाने'}
                </span>
              </div>

              {buyers.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700">
                    {currentLang === 'en' ? 'No other verified buyers registered in this district yet' : currentLang === 'hi' ? 'इस जिले में अभी तक कोई अन्य सत्यापित खरीदार पंजीकृत नहीं है' : 'या भागात अद्याप इतर कोणत्याही कारखान्याची नोंदणी झालेली नाही'}
                  </p>
                  <p className="mt-1">
                    {currentLang === 'en' ? 'Only genuine GSTIN-verified buyers appear here.' : currentLang === 'hi' ? 'केवल GSTIN-सत्यापित वास्तविक खरीदार यहां दिखाई देते हैं।' : 'केवळ GSTIN व परवाना तपासणी पूर्ण झालेले खरेदीदार येथे दिसतात.'}
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
                          <span className="text-[10px] text-stone-400 block">({b.reviews_count || 0} {currentLang === 'en' ? 'Trades' : currentLang === 'hi' ? 'सौदे' : 'सौदे'})</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span>GSTIN:</span>
                          <span className="font-mono font-bold text-stone-800">{b.gstin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{currentLang === 'en' ? 'License:' : currentLang === 'hi' ? 'लाइसेंस:' : 'परवाना:'}</span>
                          <span className="font-medium text-stone-800">{b.license_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{currentLang === 'en' ? 'Location:' : currentLang === 'hi' ? 'स्थान:' : 'स्थान:'}</span>
                          <span className="font-medium text-stone-800">{b.city || b.district} ({b.district})</span>
                        </div>
                        {b.target_crops && (
                          <div className="flex justify-between">
                            <span>{currentLang === 'en' ? 'Target Crops:' : currentLang === 'hi' ? 'लक्षित फसलें:' : 'उद्दिष्ट पिके:'}</span>
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
                    {currentLang === 'en' ? 'Select 100% Full Lot' : currentLang === 'hi' ? 'पूरा १००% लॉट चुनें' : 'पूर्ण लॉट निवडा'}
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
      <DealContractModal
        deal={selectedDealForContract}
        isOpen={Boolean(selectedDealForContract)}
        onClose={() => setSelectedDealForContract(null)}
        currentLang={currentLang}
      />

      {/* ============================================================ */}
      {/* MODAL 3: TRANSPORTER DISPATCH & MILESTONE ASSIGNMENT */}
      {/* ============================================================ */}
      <SelectTransporterModal
        isOpen={Boolean(selectedDealForDispatch)}
        onClose={() => setSelectedDealForDispatch(null)}
        deal={selectedDealForDispatch}
        currentLang={currentLang}
        onAssigned={() => {
          loadMarketData(buyerProfile);
          setSelectedDealForDispatch(null);
        }}
      />

      {/* ============================================================ */}
      {/* MODAL 4: MILL GATE WEIGHBRIDGE & QUALITY ASSAY RECORDING */}
      {/* ============================================================ */}
      <GateWeighmentModal
        isOpen={Boolean(selectedDealForWeighment)}
        onClose={() => setSelectedDealForWeighment(null)}
        deal={selectedDealForWeighment}
        currentLang={currentLang}
        onSuccess={(updatedDeal, weighment) => {
          loadMarketData(buyerProfile);
          setSelectedDealForWeighment(null);
          setSelectedDealForWeighmentSlip({ ...updatedDeal, weighment });
        }}
      />

      {/* ============================================================ */}
      {/* MODAL 5: PRINTABLE WEIGHMENT & QUALITY ASSAY CERTIFICATE */}
      {/* ============================================================ */}
      <WeighmentAssaySlipModal
        isOpen={Boolean(selectedDealForWeighmentSlip)}
        onClose={() => setSelectedDealForWeighmentSlip(null)}
        deal={selectedDealForWeighmentSlip}
        weighmentData={selectedDealForWeighmentSlip?.weighment}
        currentLang={currentLang}
      />

      {/* ============================================================ */}
      {/* MODAL 6: BUYER ESCROW PAYOUT AUTHORIZATION & DISBURSEMENT */}
      {/* ============================================================ */}
      <ReleaseEscrowModal
        isOpen={Boolean(selectedDealForPayout)}
        onClose={() => setSelectedDealForPayout(null)}
        deal={selectedDealForPayout}
        currentLang={currentLang}
        onSuccess={(updatedDeal) => {
          loadMarketData(buyerProfile);
          setSelectedDealForPayout(null);
          setSelectedDealForInvoice(updatedDeal);
        }}
      />

      {/* ============================================================ */}
      {/* MODAL 7: OFFICIAL COMMERCIAL B2B TAX INVOICE & RECEIPT */}
      {/* ============================================================ */}
      <TaxInvoiceModal
        isOpen={Boolean(selectedDealForInvoice)}
        onClose={() => setSelectedDealForInvoice(null)}
        deal={selectedDealForInvoice}
        currentLang={currentLang}
      />

      {/* ============================================================ */}
      {/* MODAL 8: APMC STATUTORY DISPUTE & GRIEVANCE FILING */}
      {/* ============================================================ */}
      <FileDisputeModal
        isOpen={Boolean(selectedDealForDispute)}
        onClose={() => setSelectedDealForDispute(null)}
        deal={selectedDealForDispute}
        role="BUYER"
        userName={buyerProfile?.company || buyerProfile?.name || 'Buyer Partner'}
        currentLang={currentLang}
        onSuccess={() => {
          loadMarketData(buyerProfile);
        }}
      />

    </div>
  );
}
