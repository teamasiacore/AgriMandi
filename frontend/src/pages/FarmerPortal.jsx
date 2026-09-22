import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, PlusCircle, ShieldCheck, CheckCircle2, 
  MapPin, RefreshCw, BarChart3, Truck, UserCheck, X, AlertCircle,
  Calculator, Sparkles, ArrowRight, ArrowUpRight, Check, Info, ShieldAlert, Award, User, FileText, Printer, Scale,
  Edit, Trash2, Send, Filter, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { translations, DISTRICT_OPTIONS } from '../utils/translations';
import FarmerProfileDesk from '../components/farmer/FarmerProfileDesk';
import DealContractModal from '../components/DealContractModal';
import SelectTransporterModal from '../components/farmer/SelectTransporterModal';
import WeighmentAssaySlipModal from '../components/WeighmentAssaySlipModal';
import TaxInvoiceModal from '../components/TaxInvoiceModal';
import MarketReferenceDesk from '../components/market/MarketReferenceDesk';

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
    callDriver: 'Call Driver'
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
    callDriver: 'चालक से संपर्क करें'
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
    callDriver: 'चालकाशी संपर्क'
  }
};

const SETTLEMENT_LABELS = {
  en: {
    payoutReceived: 'Payout Received via T+0 Escrow',
    bankCredited: 'Disbursed directly to your registered bank account',
    bankUtr: 'Bank UTR:',
    viewTaxInvoice: 'B2B Tax Invoice',
    viewWeighmentSlip: 'Weighment Slip',
    viewContract: 'Contract Slip'
  },
  hi: {
    payoutReceived: 'T+0 एस्क्रो द्वारा भुगतान प्राप्त',
    bankCredited: 'सीधे आपके पंजीकृत बैंक खाते में राशि जमा',
    bankUtr: 'बैंक यूटीआर:',
    viewTaxInvoice: 'टैक्स इनवॉइस',
    viewWeighmentSlip: 'वेब्रिज पावती',
    viewContract: 'अनुबंध पावती'
  },
  mr: {
    payoutReceived: 'T+0 थेट एस्क्रो द्वारे रक्कम जमा',
    bankCredited: 'आपल्या नोंदणीकृत बँक खात्यात थेट रक्कम वर्ग झाली आहे',
    bankUtr: 'बँक यूटीआर:',
    viewTaxInvoice: 'टॅक्स इनव्हॉईस',
    viewWeighmentSlip: 'वेब्रिज पावती',
    viewContract: 'करार पावती'
  }
};

export default function FarmerPortal({ currentLang = 'mr' }) {
  const t = translations[currentLang] || translations.mr;

  const [activeTab, setActiveTab] = useState('mandi'); // 'mandi' | 'calculator' | 'lots' | 'profile'
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
  const [deals, setDeals] = useState([]);
  const [selectedDealForDispatch, setSelectedDealForDispatch] = useState(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [lotFilter, setLotFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [dealNotification, setDealNotification] = useState(null);
  const [selectedDealForContract, setSelectedDealForContract] = useState(null);
  const [selectedDealForWeighmentSlip, setSelectedDealForWeighmentSlip] = useState(null);
  const [selectedDealForInvoice, setSelectedDealForInvoice] = useState(null);

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
    quality_grade: 'FAQ (Grade A)',
    district: 'Latur',
    taluka: '',
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
          taluka: u.taluka || '',
          farm_address: u.village ? `${u.village}, ${u.district || ''}` : ''
        }));
      } catch (e) {}
    }

    if (u.phone || u.id) {
      api.getFarmerProfile(u.phone || u.id).then(res => {
        if (res && res.profile) {
          const fresh = { ...u, ...res.profile };
          setUser(fresh);
          localStorage.setItem('agri_user', JSON.stringify(fresh));
        }
      }).catch(() => {});
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
    api.getDeals().then(res => setDeals(res.deals || [])).catch(() => setDeals([]));
  };

  const openDealContract = async (lot) => {
    try {
      let dealToOpen = null;
      const res = await api.getDeals({ lot_id: lot.id });
      if (res.deals && res.deals.length > 0) {
        dealToOpen = res.deals[0];
      } else {
        const match = deals.find(d => d.lot_id === lot.id);
        if (match) dealToOpen = match;
      }

      if (dealToOpen) {
        try {
          const contractRes = await api.getDealContract(dealToOpen.id);
          if (contractRes && contractRes.contract) {
            setSelectedDealForContract({
              ...dealToOpen,
              ...contractRes.contract,
              contract_number: contractRes.contract.contract_number,
              escrow_status: contractRes.contract.escrow?.status || dealToOpen.escrow_status
            });
            return;
          }
        } catch (ctrErr) {}
        setSelectedDealForContract(dealToOpen);
      } else {
        // Fallback constructed deal object
        setSelectedDealForContract({
          id: `deal-${lot.id}`,
          contract_number: `AGRI-CTR-2026-${String(lot.id).slice(-6).toUpperCase()}`,
          lot_id: lot.id,
          crop: lot.crop,
          variety: lot.variety || 'FAQ',
          quantity_qtl: lot.quantity_qtl,
          price_per_qtl: lot.expected_price_per_qtl,
          total_deal_value: Number(lot.expected_price_per_qtl) * Number(lot.quantity_qtl),
          farmer_name: lot.farmer_name || user.name,
          farmer_phone: lot.farmer_phone || user.phone,
          buyer_name: 'Verified Agro Processing Mill',
          farm_address: lot.farm_address || `${lot.taluka || ''}, ${lot.district}`,
          delivery_destination: 'Buyer Processing Facility Gate',
          escrow_status: 'SECURED_IN_ESCROW'
        });
      }
    } catch (e) {
      console.error('Error fetching deal contract:', e);
    }
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

  const handleOpenCreateModal = () => {
    setEditingLot(null);
    setLotForm({
      crop: 'Soybean',
      variety: '',
      quantity_qtl: '',
      expected_price_per_qtl: '',
      moisture_percentage: '',
      quality_grade: 'FAQ (Grade A)',
      district: user.district || 'Latur',
      taluka: user.taluka || '',
      farm_address: user.village ? `${user.village}, ${user.district || 'Latur'}` : ''
    });
    setIsListingModalOpen(true);
  };

  const handleOpenEditModal = (lot) => {
    setEditingLot(lot);
    setLotForm({
      crop: lot.crop || 'Soybean',
      variety: lot.variety || '',
      quantity_qtl: lot.quantity_qtl || '',
      expected_price_per_qtl: lot.expected_price_per_qtl || '',
      moisture_percentage: lot.moisture_percentage || '',
      quality_grade: lot.quality_grade || 'FAQ (Grade A)',
      district: lot.district || user.district || 'Latur',
      taluka: lot.taluka || '',
      farm_address: lot.farm_address || ''
    });
    setIsListingModalOpen(true);
  };

  const handleSaveLot = async (targetStatus = 'LISTED') => {
    if (!lotForm.crop || !lotForm.quantity_qtl || !lotForm.expected_price_per_qtl || !lotForm.moisture_percentage || !lotForm.farm_address) {
      alert(currentLang === 'en' ? 'Please fill in all mandatory fields (Crop, Qty, Price, Moisture, Address)' : 'कृपया सर्व आवश्यक रकाने भरा (पीक, प्रमाण, भाव, आर्द्रता, पत्ता)');
      return;
    }

    setActionLoading(true);
    try {
      const fullAddress = lotForm.taluka && !lotForm.farm_address.includes(lotForm.taluka)
        ? `${lotForm.farm_address}, ${currentLang === 'en' ? 'Taluka' : currentLang === 'hi' ? 'तहसील' : 'ता.'} ${lotForm.taluka}`
        : lotForm.farm_address;

      if (editingLot) {
        await api.updateLot(editingLot.id, {
          ...lotForm,
          farm_address: fullAddress,
          status: targetStatus
        });
        alert(currentLang === 'en' ? '✓ Lot details updated successfully!' : currentLang === 'hi' ? '✓ लॉट विवरण सफलतापूर्वक अपडेट हो गया!' : '✓ लॉट तपशील यशस्वीरित्या अपडेट झाला!');
      } else {
        await api.createLot({
          ...lotForm,
          status: targetStatus,
          farm_address: fullAddress,
          farmer_id: user.id || `usr-${user.phone || Date.now()}`,
          farmer_name: user.name || user.full_name || 'Farmer',
          farmer_phone: user.phone
        });
        alert(targetStatus === 'DRAFT'
          ? (currentLang === 'en' ? '✓ Lot saved as Draft (Offline). You can publish it to marketplace anytime.' : currentLang === 'hi' ? '✓ लॉट मसुदा (Draft) के रूप में सुरक्षित हुआ। आप कभी भी प्रकाशित कर सकते हैं।' : '✓ लॉट मसुदा (Draft) म्हणून सुरक्षित झाला आहे. आपण कधीही प्रकाशित करू शकता.')
          : (currentLang === 'en' ? '✓ Harvest lot published to marketplace successfully! Buyers can now place bids.' : currentLang === 'hi' ? '✓ फसल लॉट सफलतापूर्वक प्रकाशित हो गया है! अब खरीदार बोली लगा सकेंगे।' : '✓ शेतीमाल लॉट बाजारात प्रकाशित झाला आहे! खरेदीदार आता बोली लावू शकतील.')
        );
      }

      setIsListingModalOpen(false);
      setEditingLot(null);
      // Reset form
      setLotForm({
        crop: 'Soybean',
        variety: '',
        quantity_qtl: '',
        expected_price_per_qtl: '',
        moisture_percentage: '',
        quality_grade: 'FAQ (Grade A)',
        district: user.district || 'Latur',
        taluka: user.taluka || '',
        farm_address: user.village || ''
      });
      loadLotsAndOffers(user);
      setActiveTab('lots');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert('Error: ' + msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishDraft = async (lotId) => {
    setActionLoading(true);
    try {
      await api.publishLot(lotId);
      alert(currentLang === 'en' ? '✓ Draft lot published to live marketplace!' : currentLang === 'hi' ? '✓ ड्राफ्ट लॉट अब मंडी बाज़ार में प्रकाशित हो गया है!' : '✓ मसुदा लॉट बाजारात थेट प्रकाशित झाला आहे!');
      loadLotsAndOffers(user);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelLot = async (lot) => {
    const defaultReason = currentLang === 'en' ? 'Sold locally at mandi' : 'स्थानिक बाजारात विक्री झाली';
    const reason = window.prompt(
      currentLang === 'en' ? 'Reason for cancelling this listing (e.g., Sold locally, Price changed):' : currentLang === 'hi' ? 'लॉट रद्द करने का कारण दर्ज करें:' : 'हा लॉट रद्द करण्याचे कारण प्रविष्ट करा:',
      defaultReason
    );
    if (reason === null) return; // user cancelled prompt

    setActionLoading(true);
    try {
      await api.cancelLot(lot.id, { reason });
      alert(currentLang === 'en' ? '✓ Listing cancelled.' : currentLang === 'hi' ? '✓ लॉट रद्द कर दिया गया।' : '✓ लॉट रद्द केला गेला आहे.');
      loadLotsAndOffers(user);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async (lot) => {
    const confirmMsg = currentLang === 'en' ? 'Permanently delete this draft lot?' : currentLang === 'hi' ? 'क्या आप इस ड्राफ्ट को हटाना चाहते हैं?' : 'हा ड्राफ्ट कायमचा नष्ट करायचा आहे का?';
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      await api.deleteLot(lot.id);
      alert(currentLang === 'en' ? '✓ Draft deleted.' : currentLang === 'hi' ? '✓ ड्राफ्ट हटा दिया गया।' : '✓ ड्राफ्ट डिलीट केला.');
      loadLotsAndOffers(user);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
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
      setSelectedDealForContract(res.deal);
      loadLotsAndOffers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert('Error: ' + msg);
    }
  };

  const handleRejectOffer = async (offerId) => {
    const reason = window.prompt(
      currentLang === 'en' ? 'Reason for rejecting offer (e.g., Rate below expectation, Transport unavailable):' :
      currentLang === 'hi' ? 'बोली अस्वीकार करने का कारण दर्ज करें:' :
      'बोली नाकारण्याचे कारण प्रविष्ट करा:',
      currentLang === 'en' ? 'Offered rate is below market expectation' : 'दर अपेक्षेपेक्षा कमी आहे'
    );
    if (reason === null) return;

    setActionLoading(true);
    try {
      await api.rejectOffer(offerId, { reason, actor_id: user.id });
      alert(currentLang === 'en' ? '✓ Offer rejected.' : currentLang === 'hi' ? '✓ बोली अस्वीकृत की गई।' : '✓ बोली नाकारण्यात आली.');
      loadLotsAndOffers(user);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterOffer = async (offer) => {
    const counterRateStr = window.prompt(
      currentLang === 'en' ? `Buyer offered ₹${offer.offered_price_per_qtl}/Qtl.\nEnter your Counter Price (₹/Quintal):` :
      currentLang === 'hi' ? `खरीदार ने ₹${offer.offered_price_per_qtl}/क्विंटल की पेशकश की है।\nअपना प्रति-प्रस्ताव दर (₹/क्विंटल) दर्ज करें:` :
      `खरेदीदाराने ₹${offer.offered_price_per_qtl}/क्विंटल दर दिला आहे.\nआपला अपेक्षित प्रति-दर (₹/क्विंटल) प्रविष्ट करा:`,
      String(Number(offer.offered_price_per_qtl) + 100)
    );
    if (!counterRateStr) return;

    const counterRate = Number(counterRateStr);
    if (!counterRate || counterRate <= 0) {
      alert(currentLang === 'en' ? 'Please enter a valid price.' : 'कृपया वैध दर प्रविष्ट करा.');
      return;
    }

    const counterNotes = window.prompt(
      currentLang === 'en' ? 'Optional note to buyer (e.g. Clean FAQ, ready for immediate dispatch):' :
      currentLang === 'hi' ? 'खरीदार हेतु संदेश (वैकल्पिक):' :
      'खरेदीदारास संदेश (ऐच्छिक):',
      currentLang === 'en' ? 'Clean quality produce, ready for immediate loading' : 'उत्कृष्ट प्रत, त्वरित लोडिंगसाठी तयार'
    ) || '';

    setActionLoading(true);
    try {
      await api.counterOffer(offer.id, { 
        counter_price_per_qtl: counterRate,
        counter_notes: counterNotes,
        actor_id: user.id
      });
      alert(currentLang === 'en' ? `✓ Counter offer of ₹${counterRate}/Qtl sent to ${offer.buyer_name}!` :
            currentLang === 'hi' ? `✓ प्रति-प्रस्ताव दर ₹${counterRate}/क्विंटल खरीदार को प्रेषित किया गया!` :
            `✓ प्रति-दर ₹${counterRate}/क्विंटल खरेदीदाराकडे पाठवण्यात आला आहे!`);
      loadLotsAndOffers(user);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* Top Farmer Identity Banner */}
      <div className="bg-[#1B4332] text-white py-6 border-b border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div 
              onClick={() => setActiveTab('profile')} 
              className="cursor-pointer group"
              title={currentLang === 'en' ? 'Click to view/edit profile' : currentLang === 'hi' ? 'प्रोफ़ाइल देखने/संपादित करने हेतु क्लिक करें' : 'प्रोफाईल पाहण्यासाठी क्लिक करा'}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#DE7C4A] bg-[#0F261C] px-2.5 py-0.5 rounded">
                  {t.navFarmer}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-300 font-semibold group-hover:text-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> {user.is_verified || user.saat_bara_number ? (currentLang === 'en' ? '7/12 Verified Landholder' : currentLang === 'hi' ? '७/१२ सत्यापित किसान' : '७/१२ सत्यापित शेतकरी') : t.farmerVerified}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading mt-1 group-hover:text-emerald-200 transition-colors">
                {t.farmerWelcome} {user.name}!
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                {[user.village, user.taluka, user.district].filter(Boolean).join(', ') || (currentLang === 'en' ? 'Maharashtra' : currentLang === 'hi' ? 'महाराष्ट्र' : 'महाराष्ट्र')} {user.phone ? `| +91 ${user.phone}` : ''}
              </p>
            </div>

            {/* Actions: Profile + List New Produce */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-3 rounded-xl border font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-emerald-800 border-emerald-400 text-white'
                    : 'border-emerald-600/70 hover:bg-[#0F261C] text-emerald-200'
                }`}
              >
                <User className="w-4 h-4 text-emerald-300" />
                {currentLang === 'en' ? 'My Profile' : currentLang === 'hi' ? 'मेरी प्रोफ़ाइल' : 'माझी प्रोफाईल'}
              </button>

              <button
                onClick={() => setIsListingModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#C86432] hover:bg-[#A74D20] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.listProduceBtn}
              </button>
            </div>
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
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDealForContract(dealNotification)}
                    className="px-3.5 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#DE7C4A]" />
                    <span>{currentLang === 'en' ? 'View Deal Contract & Waybill' : currentLang === 'hi' ? 'करार व पावती देखें' : 'करार व पावती पहा'}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDealNotification(null)}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
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
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lots'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {t.tabMyLotsAndOffers} ({myLots.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EDE2]'
            }`}
          >
            <User className="w-4 h-4" />
            {t.tabFarmerProfile || (currentLang === 'en' ? '4. Farmer Profile & 7/12' : currentLang === 'hi' ? '४. किसान प्रोफ़ाइल व ७/१२' : '४. शेतकरी प्रोफाईल व ७/१२')}
            {Boolean(user.saat_bara_number || user.is_verified) && (
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
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

            {/* AG-009 Canonical Market Reference & MSP Intelligence Desk */}
            <MarketReferenceDesk currentLang={currentLang} />

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
                    {DISTRICT_OPTIONS.map(d => (
                      <option key={d.id} value={d.id}>
                        {d[currentLang] || d.en}
                      </option>
                    ))}
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
                    {currentLang === 'en' ? 'Computing Haversine freight & Agmarknet net realization...' : currentLang === 'hi' ? 'हॉवरसाइन भाड़ा व वास्तविक लाभ की गणना जारी है...' : 'हॅवरसाइन भाडे व प्रत्यक्ष नफा मोजत आहे...'}
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> +{realizationData.directRoute.percentageProfitGain}% {currentLang === 'en' ? 'More Cash' : currentLang === 'hi' ? 'अधिक शुद्ध लाभ' : 'जास्त रोख रक्कम'}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold font-heading mt-1">
                        {currentLang === 'en' ? 'Direct Sale Extra Profit:' : currentLang === 'hi' ? 'सीधी बिक्री से अतिरिक्त लाभ:' : 'थेट विक्रीतून मिळणारा निव्वळ जास्तीचा नफा:'}
                      </h4>
                      <p className="text-xs text-stone-300 mt-0.5">
                        {currentLang === 'en' 
                          ? `On ${calcQty} Qtl ${calcCrop}, you save ₹0 APMC cess, ₹0 freight, and zero middleman cuts.`
                          : currentLang === 'hi'
                          ? `${calcQty} क्विंटल ${calcCrop} पर ०% आढ़त, ०% सेस और मुफ्त फार्म-गेट परिवहन से सीधी बचत।`
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
                            {currentLang === 'en' ? 'High Deductions' : currentLang === 'hi' ? 'भारी कटौती' : 'मोठ्या कपाती'}
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
                              • {currentLang === 'en' ? 'APMC Mandi Cess & Market Fee (1.05%)' : currentLang === 'hi' ? 'मंडी सेस व बाजार शुल्क (१.०५%)' : 'APMC सेस व कर (१.०५%)'}
                            </span>
                            <span className="font-mono font-bold">-₹{realizationData.apmcRoute.mandiCessPerQtl} / Qtl</span>
                          </div>

                          <div className="flex justify-between items-center text-red-700">
                            <span className="flex items-center gap-1">
                              • {currentLang === 'en' ? 'Loading, Unloading & Weighing (Hamali)' : currentLang === 'hi' ? 'हमाली, तुलाई व वारई' : 'हमाली, वाराई व तोलाई (Hamali)'}
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
                            {currentLang === 'en' ? '0% Middleman Cut' : currentLang === 'hi' ? '०% आढ़त व दलाली' : '०% आडत व दलाली'}
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
                              {currentLang === 'en' ? 'Farm-Gate Transport Pickup' : currentLang === 'hi' ? 'खेत से सीधी उठान' : 'थेट शेतातून खरेदीदार वाहतूक (उचल)'}
                            </span>
                            <span className="font-mono font-bold text-white">₹0 / {currentLang === 'en' ? 'Free' : currentLang === 'hi' ? 'मुफ्त' : 'मोफत'}</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {currentLang === 'en' ? 'APMC Mandi Cess (Sec 32A Exempt)' : currentLang === 'hi' ? 'मंडी सेस: ०% (धारा ३२-ए प्रमाणित)' : 'मंडी सेस: ०% (Central FAP Act नुसार कायदेशीर)'}
                            </span>
                            <span className="font-mono font-bold text-white">₹0 / {currentLang === 'en' ? 'Free' : currentLang === 'hi' ? 'मुफ्त' : 'मोफत'}</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {currentLang === 'en' ? 'Loading & Middleman Commission' : currentLang === 'hi' ? 'हमाली व दलाली कटौती' : 'हमाली व मध्यस्थ दलाली कपात'}
                            </span>
                            <span className="font-mono font-bold text-white">₹0 / {currentLang === 'en' ? 'Free' : currentLang === 'hi' ? 'मुफ्त' : 'मोफत'}</span>
                          </div>

                          <div className="pt-2 border-t border-[#2D6A4F] flex justify-between items-center text-stone-300 text-[11px]">
                            <span>{currentLang === 'en' ? 'Total Deductions per Qtl:' : currentLang === 'hi' ? 'कुल कटौती प्रति क्विंटल:' : 'एकूण कपात प्रति क्विंटल:'}</span>
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
        {activeTab === 'lots' && (() => {
          const filterCounts = {
            ALL: myLots.length,
            LISTED: myLots.filter(l => l.status === 'LISTED').length,
            DRAFT: myLots.filter(l => l.status === 'DRAFT').length,
            DEAL_LOCKED: myLots.filter(l => l.status === 'DEAL_LOCKED').length,
            CANCELLED: myLots.filter(l => l.status === 'CANCELLED').length
          };
          const filteredLots = myLots.filter(l => lotFilter === 'ALL' ? true : l.status === lotFilter);

          return (
            <div className="mt-6 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                    {t.statMyLots}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t.tabMyLotsAndOffers}
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-300" /> {t.listProduceBtn}
                </button>
              </div>

              {/* Status Filter Pills (AG-010) */}
              <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-[#E5DFD4]">
                {[
                  { key: 'ALL', label: currentLang === 'en' ? 'All Lots' : currentLang === 'hi' ? 'सभी लॉट' : 'सर्व लॉट्स', count: filterCounts.ALL },
                  { key: 'LISTED', label: currentLang === 'en' ? 'Active in Market' : currentLang === 'hi' ? 'सक्रिय बाज़ार' : 'बाजारात सक्रिय', count: filterCounts.LISTED, color: 'emerald' },
                  { key: 'DRAFT', label: currentLang === 'en' ? 'Drafts (Offline)' : currentLang === 'hi' ? 'मसुदा (ड्राफ्ट)' : 'मसुदा (ड्राफ्ट)', count: filterCounts.DRAFT, color: 'amber' },
                  { key: 'DEAL_LOCKED', label: currentLang === 'en' ? 'Deal Locked' : currentLang === 'hi' ? 'सौदा पक्का' : 'सौदा पक्का', count: filterCounts.DEAL_LOCKED, color: 'blue' },
                  { key: 'CANCELLED', label: currentLang === 'en' ? 'Cancelled' : currentLang === 'hi' ? 'रद्द' : 'रद्द केलेले', count: filterCounts.CANCELLED, color: 'rose' }
                ].map(tab => {
                  const isActive = lotFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setLotFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1B4332] text-white shadow-2xs'
                          : 'bg-[#FAF7F2] text-stone-600 hover:bg-[#E5DFD4] border border-[#E5DFD4]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Empty State vs Lots Grid */}
              {filteredLots.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-[#E5DFD4] text-center max-w-lg mx-auto shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-[#1B4332] mb-4">
                    <PlusCircle className="w-7 h-7 text-[#C86432]" />
                  </div>
                  <h4 className="text-lg font-bold font-heading text-[#1B4332]">
                    {lotFilter === 'ALL' 
                      ? (currentLang === 'en' ? 'No Harvest Lots Listed' : currentLang === 'hi' ? 'कोई लॉट लिस्ट नहीं है' : 'कोणताही लॉट लिस्ट केलेला नाही')
                      : (currentLang === 'en' ? `No ${lotFilter} lots found` : `या श्रेणीत कोणतेही लॉट आढळले नाहीत`)}
                  </h4>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    {t.noLotsYet}
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-5 px-5 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F] transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> {t.listProduceBtn}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredLots.map((lot) => {
                    const lotOffers = offers.filter(o => o.lot_id === lot.id);
                    return (
                      <div key={lot.id} className="bg-white rounded-2xl p-5 border border-[#E5DFD4] shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5DFD4]">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-lg font-bold font-heading text-[#1B4332]">
                                {lot.crop} ({lot.variety})
                              </span>

                              {/* Status Badges */}
                              {lot.status === 'LISTED' && (
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  {currentLang === 'en' ? 'Market Active' : currentLang === 'hi' ? 'बाज़ार सक्रिय' : 'बाजारात सक्रिय'}
                                </span>
                              )}
                              {lot.status === 'DRAFT' && (
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  {currentLang === 'en' ? 'Draft (Offline)' : currentLang === 'hi' ? 'मसुदा (ऑफलाइन)' : 'मसुदा (ऑफलाइन)'}
                                </span>
                              )}
                              {lot.status === 'DEAL_LOCKED' && (
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-blue-700" />
                                  {t.statusLocked}
                                </span>
                              )}
                              {lot.status === 'CANCELLED' && (
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                  <X className="w-3 h-3 text-rose-700" />
                                  {currentLang === 'en' ? 'Cancelled' : currentLang === 'hi' ? 'रद्द' : 'रद्द केलेला'}
                                </span>
                              )}

                              {/* Action Buttons on Lot Card */}
                              <div className="flex items-center gap-1.5 ml-auto md:ml-2">
                                {lot.status === 'DRAFT' && (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handlePublishDraft(lot.id)}
                                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <Send className="w-3 h-3 text-emerald-200" />
                                      <span>{currentLang === 'en' ? 'Publish Now' : currentLang === 'hi' ? 'प्रकाशित करें' : 'बाजारात पाठवा'}</span>
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleOpenEditModal(lot)}
                                      className="px-2 py-1 bg-white border border-[#E5DFD4] hover:bg-[#FAF7F2] text-stone-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <Edit className="w-3 h-3 text-[#1B4332]" />
                                      <span>{currentLang === 'en' ? 'Edit' : 'संपादित'}</span>
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleDeleteDraft(lot)}
                                      className="px-2 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-600" />
                                      <span>{currentLang === 'en' ? 'Delete' : 'हटवा'}</span>
                                    </button>
                                  </>
                                )}

                                {lot.status === 'LISTED' && (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleOpenEditModal(lot)}
                                      className="px-2 py-1 bg-white border border-[#E5DFD4] hover:bg-[#FAF7F2] text-stone-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <Edit className="w-3 h-3 text-[#1B4332]" />
                                      <span>{currentLang === 'en' ? 'Edit Lot' : 'संपादित'}</span>
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleCancelLot(lot)}
                                      className="px-2 py-1 bg-white border border-stone-300 hover:bg-rose-50 hover:border-rose-300 text-stone-600 hover:text-rose-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <X className="w-3 h-3 text-rose-500" />
                                      <span>{currentLang === 'en' ? 'Cancel Listing' : 'रद्द करा'}</span>
                                    </button>
                                  </>
                                )}

                                {lot.status === 'DEAL_LOCKED' && (
                                  <>
                                    <button
                                      onClick={() => openDealContract(lot)}
                                      className="px-3 py-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <FileText className="w-3 h-3 text-[#DE7C4A]" />
                                      <span>{currentLang === 'en' ? 'Contract Slip' : currentLang === 'hi' ? 'करार पावती' : 'करार पावती पहा'}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const lotDeal = (Array.isArray(deals) ? deals.find(d => d.lot_id === lot.id) : null) || {
                                          id: `deal-${lot.id}`,
                                          lot_id: lot.id,
                                          crop: lot.crop,
                                          quantity_qtl: lot.quantity_qtl,
                                          price_per_qtl: lot.expected_price_per_qtl,
                                          total_deal_value: Number(lot.expected_price_per_qtl) * Number(lot.quantity_qtl),
                                          farmer_name: lot.farmer_name || user.name,
                                          farmer_phone: lot.farmer_phone || user.phone,
                                          farmer_district: lot.district,
                                          buyer_name: 'Verified Agro Processing Mill',
                                          delivery_destination: 'Buyer Processing Facility Gate'
                                        };
                                        setSelectedDealForWeighmentSlip(lotDeal);
                                      }}
                                      className="px-2.5 py-1 bg-white border border-[#E5DFD4] hover:bg-[#FAF7F2] text-stone-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <Scale className="w-3 h-3 text-[#C86432]" />
                                      <span>{currentLang === 'en' ? 'Weighment Slip' : currentLang === 'hi' ? 'वेब्रिज पावती' : 'वेब्रिज पावती'}</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              ID: {lot.id} | {lot.farm_address}, {lot.district}
                              {lot.quality_grade && <span className="ml-2 font-medium text-stone-600">({lot.quality_grade})</span>}
                            </p>
                            {lot.status === 'CANCELLED' && lot.cancellation_reason && (
                              <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                                {currentLang === 'en' ? 'Cancellation Note:' : 'रद्द करण्याचे कारण:'} {lot.cancellation_reason}
                              </p>
                            )}
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

                      {/* B2B Logistics & Transporter Tracker Strip (for DEAL_LOCKED lots) */}
                      {lot.status === 'DEAL_LOCKED' && (() => {
                        const lotDeal = (Array.isArray(deals) ? deals.find(d => d.lot_id === lot.id) : null) || {
                          id: `deal-${lot.id}`,
                          lot_id: lot.id,
                          crop: lot.crop,
                          quantity_qtl: lot.quantity_qtl,
                          price_per_qtl: lot.expected_price_per_qtl,
                          total_deal_value: Number(lot.expected_price_per_qtl) * Number(lot.quantity_qtl),
                          farm_address: lot.farm_address || `${lot.taluka || ''}, ${lot.district}`,
                          farmer_district: lot.district,
                          farmer_name: lot.farmer_name || user.name,
                          farmer_phone: lot.farmer_phone || user.phone,
                          delivery_status: 'PENDING_PICKUP'
                        };

                        const status = lotDeal.delivery_status || 'PENDING_PICKUP';
                        const isAssigned = Boolean(lotDeal.transporter_id || lotDeal.driver_name);
                        const currentStep = 
                          status === 'DELIVERED' ? 4 :
                          status === 'IN_TRANSIT' ? 3 :
                          status === 'AT_FARM_GATE' ? 2 :
                          status === 'DISPATCHED' ? 1 : 0;

                        const labels = LOGISTICS_LABELS[currentLang] || LOGISTICS_LABELS.mr;

                        return (
                          <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5DFD4]">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#1B4332]" />
                                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wide">
                                  {labels.logisticsTracker}
                                </span>
                                {isAssigned && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                    {status === 'DELIVERED' ? labels.stageDelivered :
                                     status === 'IN_TRANSIT' ? labels.stageInTransit :
                                     status === 'AT_FARM_GATE' ? labels.stageAtFarmGate : labels.stageDispatched}
                                  </span>
                                )}
                              </div>

                              {!isAssigned ? (
                                <button
                                  onClick={() => setSelectedDealForDispatch(lotDeal)}
                                  className="px-3.5 py-1.5 bg-[#C86432] hover:bg-[#b05528] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>{labels.assignTransporterBtn}</span>
                                </button>
                              ) : (
                                <div className="text-right text-xs">
                                  <span className="text-stone-400 block text-[10px] uppercase">{labels.freight}</span>
                                  <span className="font-bold font-mono text-[#1B4332]">₹{lotDeal.freight_amount ? Number(lotDeal.freight_amount).toLocaleString() : '---'}</span>
                                </div>
                              )}
                            </div>

                            {/* Progress Milestone Bar */}
                            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
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
                                    <div className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                                      isDone ? 'bg-emerald-600' : 'bg-stone-200'
                                    }`} />
                                    <span className={`text-[11px] font-semibold leading-tight ${
                                      isCurrent ? 'text-emerald-700 font-bold' : isDone ? 'text-stone-800' : 'text-stone-400'
                                    }`}>
                                      {m.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Driver info footer if assigned */}
                            {isAssigned && (
                              <div className="mt-3 pt-2.5 border-t border-[#E5DFD4] flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-3 text-stone-600">
                                  <span>{labels.driver} <strong className="text-stone-900">{lotDeal.driver_name}</strong></span>
                                  <span>{labels.vehicle} <strong className="font-mono text-stone-900">{lotDeal.vehicle_number}</strong></span>
                                  {lotDeal.vehicle_type && <span className="text-[11px] text-stone-400">({lotDeal.vehicle_type})</span>}
                                </div>
                                {lotDeal.driver_phone && (
                                  <a
                                    href={`tel:${lotDeal.driver_phone}`}
                                    className="px-2.5 py-1 bg-white border border-[#E5DFD4] hover:border-stone-400 rounded-md text-[11px] font-bold text-stone-700 inline-flex items-center gap-1"
                                  >
                                    📞 {lotDeal.driver_phone}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Settlement & Payout Release Status Banner */}
                      {lot.status === 'DEAL_LOCKED' && (() => {
                        const lotDeal = Array.isArray(deals) ? deals.find(d => d.lot_id === lot.id) : null;
                        if (!lotDeal || lotDeal.escrow_status !== 'SETTLED') return null;

                        const sLabels = SETTLEMENT_LABELS[currentLang] || SETTLEMENT_LABELS.mr;
                        const settledAmount = Number(lotDeal.total_deal_value || (Number(lotDeal.price_per_qtl || 0) * Number(lotDeal.quantity_qtl || 0)));
                        const utr = lotDeal.settlement_utr || lotDeal.settlement?.utr || 'UTR-AGRI-2026-8192';

                        return (
                          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 space-y-3 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                                  ₹
                                </div>
                                <div>
                                  <h4 className="font-heading text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    {sLabels.payoutReceived}
                                  </h4>
                                  <p className="text-[11px] text-emerald-800">
                                    {sLabels.bankCredited}
                                  </p>
                                </div>
                              </div>

                              <div className="text-left sm:text-right">
                                <span className="font-heading text-lg sm:text-xl font-extrabold text-emerald-900 block">
                                  ₹{settledAmount.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[11px] font-mono text-emerald-700">
                                  {sLabels.bankUtr} <strong>{utr}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => setSelectedDealForContract(lotDeal)}
                                className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{sLabels.viewContract}</span>
                              </button>
                              <button
                                onClick={() => setSelectedDealForWeighmentSlip(lotDeal)}
                                className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{sLabels.viewWeighmentSlip}</span>
                              </button>
                              <button
                                onClick={() => setSelectedDealForInvoice(lotDeal)}
                                className="px-3.5 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#A3E635]" />
                                <span>{sLabels.viewTaxInvoice}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Offers under this lot */}
                      <div className="mt-4">
                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                          {t.statOffersReceived} ({lotOffers.length}):
                        </span>

                        {lotOffers.length > 0 ? (
                          <div className="space-y-2">
                            {lotOffers.map((off) => {
                              const isAccepted = off.status === 'ACCEPTED';
                              const isCountered = off.status === 'COUNTERED';
                              const isRejected = off.status === 'REJECTED';
                              const isWithdrawn = off.status === 'WITHDRAWN';
                              const isPending = off.status === 'PENDING';

                              return (
                                <div 
                                  key={off.id}
                                  className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                                    isAccepted
                                      ? 'bg-emerald-50/70 border-emerald-300'
                                      : isCountered
                                      ? 'bg-amber-50/70 border-amber-300'
                                      : isRejected
                                      ? 'bg-rose-50/50 border-rose-200 opacity-75'
                                      : 'bg-[#FAF7F2] border-[#E5DFD4]'
                                  }`}
                                >
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-bold text-[#1B4332]">{off.buyer_name}</span>

                                      {isAccepted && (
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                                          {currentLang === 'en' ? 'ACCEPTED' : currentLang === 'hi' ? 'स्वीकृत' : 'मंजूर'}
                                        </span>
                                      )}
                                      {isCountered && (
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                                          <Scale className="w-3 h-3 text-amber-800" />
                                          {currentLang === 'en' ? `COUNTER PROPOSED: ₹${off.counter_price_per_qtl}/Qtl` : `प्रति-दर प्रस्तावित: ₹${off.counter_price_per_qtl}/क्विंटल`}
                                        </span>
                                      )}
                                      {isRejected && (
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1">
                                          <X className="w-3 h-3 text-rose-800" />
                                          {currentLang === 'en' ? 'REJECTED' : currentLang === 'hi' ? 'अस्वीकृत' : 'नाकारले'}
                                        </span>
                                      )}
                                      {isWithdrawn && (
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-stone-200 text-stone-700">
                                          {currentLang === 'en' ? 'WITHDRAWN BY BUYER' : 'खरेदीदाराने मागे घेतले'}
                                        </span>
                                      )}
                                      {isPending && (
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                                          {currentLang === 'en' ? 'PENDING DECISION' : 'प्रलंबित'}
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs text-stone-600 mt-1">
                                      {currentLang === 'en' ? 'Qty:' : currentLang === 'hi' ? 'मात्रा:' : 'प्रमाण:'} <strong>{off.quantity_requested_qtl} {currentLang === 'en' ? 'Qtl' : 'क्विंटल'}</strong> | {currentLang === 'en' ? 'Destination:' : currentLang === 'hi' ? 'गंतव्य:' : 'पोहोच ठिकाण:'} {off.delivery_destination}
                                    </p>

                                    {isCountered && (
                                      <p className="text-[11px] text-amber-800 font-medium mt-1 bg-amber-100/60 px-2 py-0.5 rounded inline-block">
                                        ⏳ {currentLang === 'en' ? `Awaiting buyer acceptance for ₹${off.counter_price_per_qtl}/Qtl` : `₹${off.counter_price_per_qtl}/क्विंटल प्रति-दरावर खरेदीदाराच्या निर्णयाची प्रतीक्षा.`}
                                        {off.counter_notes ? ` ("${off.counter_notes}")` : ''}
                                      </p>
                                    )}

                                    {isRejected && off.rejection_reason && (
                                      <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                                        {currentLang === 'en' ? 'Reason:' : 'कारण:'} {off.rejection_reason}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 self-end md:self-auto">
                                    <div className="text-right">
                                      <span className="text-[10px] text-stone-400 uppercase block">{t.labelOfferedPrice}</span>
                                      <span className="text-base font-bold font-mono text-[#C86432]">
                                        ₹{off.offered_price_per_qtl} <span className="text-xs text-stone-500 font-normal">{currentLang === 'en' ? '/ Qtl' : '/ क्विंटल'}</span>
                                      </span>
                                      <span className="text-[11px] block font-bold text-stone-600">
                                        {currentLang === 'en' ? 'Total:' : currentLang === 'hi' ? 'कुल:' : 'एकूण:'} ₹{(off.offered_price_per_qtl * off.quantity_requested_qtl).toLocaleString()}
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    {isPending && lot.status !== 'DEAL_LOCKED' && (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          disabled={actionLoading}
                                          onClick={() => handleAcceptOffer(off.id)}
                                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                                        >
                                          {t.acceptBidBtn}
                                        </button>
                                        <button
                                          disabled={actionLoading}
                                          onClick={() => handleCounterOffer(off)}
                                          className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                          <Scale className="w-3 h-3 text-amber-700" />
                                          <span>{currentLang === 'en' ? 'Counter' : 'प्रति-दर'}</span>
                                        </button>
                                        <button
                                          disabled={actionLoading}
                                          onClick={() => handleRejectOffer(off.id)}
                                          className="px-2.5 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                          <X className="w-3 h-3 text-rose-600" />
                                          <span>{currentLang === 'en' ? 'Reject' : 'नाकारा'}</span>
                                        </button>
                                      </div>
                                    )}

                                    {isAccepted && (() => {
                                      const lotDeal = Array.isArray(deals) ? deals.find(d => d.lot_id === lot.id) : null;
                                      return (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => openDealContract(lot)}
                                            className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-[#DE7C4A]" />
                                            <span>{currentLang === 'en' ? 'Contract' : currentLang === 'hi' ? 'अनुबंध' : 'करार'}</span>
                                          </button>
                                          {lotDeal?.escrow_status === 'SETTLED' && (
                                            <button
                                              onClick={() => setSelectedDealForInvoice(lotDeal)}
                                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                            >
                                              <FileText className="w-3.5 h-3.5 text-[#A3E635]" />
                                              <span>{currentLang === 'en' ? 'Invoice' : currentLang === 'hi' ? 'बीजक' : 'इनव्हॉईस'}</span>
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              );
                            })}
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
          );
        })()}

        {/* TAB 4: FARMER PROFILE & 7/12 DESK */}
        {activeTab === 'profile' && (
          <div className="mt-6">
            <FarmerProfileDesk
              user={user}
              setUser={setUser}
              myLots={myLots}
              currentLang={currentLang}
            />
          </div>
        )}

      </div>

      {/* MODAL: CREATE / LIST PRODUCE LOT */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E5DFD4] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4]">
              <h3 className="text-lg font-bold font-heading text-[#1B4332]">
                {editingLot 
                  ? (currentLang === 'en' ? '✏️ Edit Harvest Lot' : currentLang === 'hi' ? '✏️ लॉट विवरण संपादित करें' : '✏️ शेतीमाल लॉट संपादित करा')
                  : `🌾 ${t.modalAddLotTitle}`}
              </h3>
              <button
                onClick={() => {
                  setIsListingModalOpen(false);
                  setEditingLot(null);
                }}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveLot(editingLot?.status === 'DRAFT' ? 'DRAFT' : 'LISTED'); }} className="mt-4 space-y-3">
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
                    placeholder={currentLang === 'en' ? 'e.g. 50' : currentLang === 'hi' ? 'उदा. ५०' : 'उदा. ५०'}
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
                    placeholder={currentLang === 'en' ? 'e.g. 4800' : currentLang === 'hi' ? 'उदा. ४८००' : 'उदा. ४८००'}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold font-mono"
                    required
                  />
                </div>
              </div>

              {/* Live APMC Reference Helper */}
              {(() => {
                const matchRate = liveRates.find(r => 
                  r.district.toLowerCase() === lotForm.district.toLowerCase() && 
                  r.commodity.toLowerCase().includes(lotForm.crop.toLowerCase())
                );
                if (matchRate) {
                  return (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {currentLang === 'en' ? `Today's ${lotForm.district} Mandi Reference:` : currentLang === 'hi' ? `आज का ${lotForm.district} मंडी संदर्भ भाव:` : `आजचा ${lotForm.district} बाजार संदर्भ दर:`}
                      </span>
                      <span className="font-bold font-mono text-sm text-[#1B4332]">
                        ₹{matchRate.modal_price} {currentLang === 'en' ? '/ Qtl' : '/ क्विंटल'}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldDistrict} <span className="text-red-500">*</span></label>
                  <select
                    value={lotForm.district}
                    onChange={(e) => setLotForm({ ...lotForm, district: e.target.value, taluka: '' })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {DISTRICT_OPTIONS.map(d => (
                      <option key={d.id} value={d.id}>
                        {d[currentLang] || d.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Taluka (Tehsil)' : currentLang === 'hi' ? 'तहसील' : 'तालुका'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lotForm.taluka || ''}
                    onChange={(e) => setLotForm({ ...lotForm, taluka: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                    required
                  >
                    <option value="">{currentLang === 'en' ? '-- Select Taluka --' : currentLang === 'hi' ? '-- तहसील चुनें --' : '-- तालुका निवडा --'}</option>
                    {(DISTRICT_OPTIONS.find(d => d.id === lotForm.district)?.talukas || []).map(tItem => (
                      <option key={tItem.id} value={tItem.id}>
                        {tItem[currentLang] || tItem.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.fieldMoisture} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    value={lotForm.moisture_percentage}
                    onChange={(e) => setLotForm({ ...lotForm, moisture_percentage: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. 9.5%' : currentLang === 'hi' ? 'उदा. ९.५%' : 'उदा. ९.५%'}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Quality Grade' : currentLang === 'hi' ? 'गुणवत्ता श्रेणी' : 'गुणवत्ता प्रत'}
                  </label>
                  <select
                    value={lotForm.quality_grade || 'FAQ (Grade A)'}
                    onChange={(e) => setLotForm({ ...lotForm, quality_grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    <option value="FAQ (Grade A)">FAQ Standard (Grade A)</option>
                    <option value="Premium Export Grade">Premium Export Grade</option>
                    <option value="Medium Grade B">Medium Grade B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {currentLang === 'en' ? 'Village / Farm Pickup Address' : currentLang === 'hi' ? 'गांव / खेत का पता' : 'गाव / शेत पत्ता'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lotForm.farm_address}
                  onChange={(e) => setLotForm({ ...lotForm, farm_address: e.target.value })}
                  placeholder={currentLang === 'en' ? 'e.g. Near Shiv Temple, Post Ausa' : currentLang === 'hi' ? 'उदा. शिव मंदिर के पास, औसा' : 'उदा. शिव मंदिरा जवळ, औसा'}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  required
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsListingModalOpen(false);
                    setEditingLot(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-[#FAF7F2] cursor-pointer"
                >
                  {t.btnCancel}
                </button>

                <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSaveLot('DRAFT')}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{currentLang === 'en' ? 'Save as Draft' : currentLang === 'hi' ? 'ड्राफ्ट सहेजें' : 'मसुदा म्हणून ठेवा'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSaveLot('LISTED')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-300" />
                    <span>
                      {editingLot 
                        ? (currentLang === 'en' ? 'Update & Publish' : currentLang === 'hi' ? 'अपडेट व प्रकाशित' : 'अपडेट व प्रकाशित करा')
                        : (currentLang === 'en' ? 'Publish to Market' : currentLang === 'hi' ? 'बाज़ार में प्रकाशित करें' : 'बाजारात प्रकाशित करा')}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deal Contract & Printable Waybill Modal */}
      <DealContractModal
        deal={selectedDealForContract}
        isOpen={Boolean(selectedDealForContract)}
        onClose={() => setSelectedDealForContract(null)}
        currentLang={currentLang}
      />

      {/* Transporter Dispatch & Milestone Assignment Modal */}
      <SelectTransporterModal
        isOpen={Boolean(selectedDealForDispatch)}
        onClose={() => setSelectedDealForDispatch(null)}
        deal={selectedDealForDispatch}
        currentLang={currentLang}
        onAssigned={() => {
          loadLotsAndOffers(user);
          setSelectedDealForDispatch(null);
        }}
      />

      {/* Printable Weighment & Quality Assay Certificate Modal */}
      <WeighmentAssaySlipModal
        isOpen={Boolean(selectedDealForWeighmentSlip)}
        onClose={() => setSelectedDealForWeighmentSlip(null)}
        deal={selectedDealForWeighmentSlip}
        weighmentData={selectedDealForWeighmentSlip?.weighment}
        currentLang={currentLang}
      />

      {/* Official Commercial B2B Tax Invoice & Settlement Receipt Modal */}
      <TaxInvoiceModal
        isOpen={Boolean(selectedDealForInvoice)}
        onClose={() => setSelectedDealForInvoice(null)}
        deal={selectedDealForInvoice}
        currentLang={currentLang}
      />

    </div>
  );
}
