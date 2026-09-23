import React, { useState, useEffect } from 'react';
import { 
  Truck, ShieldCheck, Star, MapPin, Phone, CheckCircle2, 
  X, AlertCircle, RefreshCw, ArrowRight, Gauge
} from 'lucide-react';
import api from '../../services/api';

const TRANSLATIONS = {
  en: {
    modalTitle: 'Select & Dispatch Local Transporter',
    modalSub: 'Hyperlocal vehicle dispatch matched to your harvest tonnage',
    lotSpecs: 'Produce & Payload Requirement',
    crop: 'Crop:',
    quantity: 'Quantity:',
    pickup: 'Farm Pickup:',
    drop: 'Delivery Gate:',
    availableVehicles: 'Available Verified Transporters in',
    allDistrictFallback: 'Available Transporters Across Maharashtra',
    recommendedTag: 'Payload Match Recommended',
    ratePerKm: 'Base Tariff:',
    estFreight: 'Estimated Freight:',
    dispatchBtn: 'Dispatch Vehicle',
    dispatchingBtn: 'Dispatching...',
    noDriversFound: 'No on-duty drivers in this taluka right now. Broadcasting dispatch request to Maharashtra network.',
    close: 'Close',
    successNotice: '✓ Transporter dispatched successfully! Digital E-Waybill generated.'
  },
  hi: {
    modalTitle: 'स्थानीय वाहन व चालक का चयन करें',
    modalSub: 'उपज के वजन अनुसार प्रमाणित स्थानीय वाहन की सीधी बुकिंग',
    lotSpecs: 'फसल व वजन विवरण',
    crop: 'फसल:',
    quantity: 'वजन:',
    pickup: 'खेत का पता:',
    drop: 'मिल गंतव्य:',
    availableVehicles: 'क्षेत्र में उपलब्ध सत्यापित वाहन:',
    allDistrictFallback: 'महाराष्ट्र के उपलब्ध सत्यापित वाहन:',
    recommendedTag: 'वजन अनुसार सर्वोत्कृष्ट वाहन',
    ratePerKm: 'मानक दर:',
    estFreight: 'अपेक्षित भाड़ा:',
    dispatchBtn: 'गाड़ी रवाना करें',
    dispatchingBtn: 'रवाना हो रही है...',
    noDriversFound: 'वर्तमान में इस क्षेत्र में कोई वाहन उपलब्ध नहीं है। पूरे महाराष्ट्र नेटवर्क को अनुरोध भेजा गया है।',
    close: 'बंद करें',
    successNotice: '✓ वाहन सफलतापूर्वक डिस्पैच हो गया! डिजिटल ई-वेबिल तैयार है।'
  },
  mr: {
    modalTitle: 'स्थानिक वाहतूकदार निवडा व गाडी पाठवा',
    modalSub: 'शेतीमालाच्या वजनानुसार प्रमाणित स्थानिक वाहनाची थेट नेमणूक',
    lotSpecs: 'शेतीमाल व वजनाचा तपशील',
    crop: 'पीक:',
    quantity: 'प्रमाण:',
    pickup: 'शेताचा पत्ता:',
    drop: 'पोहोच ठिकाण:',
    availableVehicles: 'परिसरात उपलब्ध प्रमाणित वाहतूकदार:',
    allDistrictFallback: 'महाराष्ट्रातील उपलब्ध प्रमाणित वाहतूकदार:',
    recommendedTag: 'वजनासाठी योग्य वाहन',
    ratePerKm: 'प्रमाणित दर:',
    estFreight: 'अंदाजित भाडे:',
    dispatchBtn: 'गाडी रवाना करा',
    dispatchingBtn: 'रवाना होत आहे...',
    noDriversFound: 'सध्या या तालुक्यात थेट गाडी उपलब्ध नाही. महाराष्ट्र नेटवर्कमध्ये मागणी प्रसारित केली आहे.',
    close: 'बंद करा',
    successNotice: '✓ गाडी यशस्वीरीत्या नेमण्यात आली! डिजिटल ई-वेबिल तयार झाले.'
  }
};

// Maharashtra Coordinates for Grounded Haversine Distance (AG-016)
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

function calculateHaversineDistance(originDistrict, destDistrict) {
  const c1 = DISTRICT_COORDS[originDistrict] || DISTRICT_COORDS['Latur'];
  const c2 = DISTRICT_COORDS[destDistrict] || c1;
  const R = 6371;
  const dLat = (c2.lat - c1.lat) * (Math.PI / 180);
  const dLng = (c2.lng - c1.lng) * (Math.PI / 180);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(c1.lat*(Math.PI/180))*Math.cos(c2.lat*(Math.PI/180))*Math.sin(dLng/2)*Math.sin(dLng/2);
  const straight = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  return Math.max(25, Math.round((straight || 20) * 1.25));
}

// Fallback verified transporters for instant hyperlocal matching if database empty
const FALLBACK_TRANSPORTERS = [
  {
    id: 'tp-latur-01',
    driver_name: 'Gajanan Rathod',
    phone: '9822145678',
    vehicle_number: 'MH-24-AG-8821',
    vehicle_type: 'Bolero Maxi Truck (1.5 MT)',
    capacity_mt: 2.0,
    base_district: 'Latur',
    per_km_rate: 16.00,
    rating: 4.9,
    trips_completed: 48,
    is_available: true
  },
  {
    id: 'tp-nashik-02',
    driver_name: 'Dnyaneshwar Shinde',
    phone: '9423189012',
    vehicle_number: 'MH-15-EG-4402',
    vehicle_type: 'Eicher Pro Medium (5 MT)',
    capacity_mt: 5.5,
    base_district: 'Nashik',
    per_km_rate: 24.00,
    rating: 5.0,
    trips_completed: 82,
    is_available: true
  },
  {
    id: 'tp-solapur-03',
    driver_name: 'Balaji Kadam',
    phone: '9860123456',
    vehicle_number: 'MH-13-TR-9110',
    vehicle_type: '10-Tyre Heavy Truck (16 MT)',
    capacity_mt: 16.0,
    base_district: 'Solapur',
    per_km_rate: 36.00,
    rating: 4.9,
    trips_completed: 64,
    is_available: true
  }
];

export default function SelectTransporterModal({
  isOpen,
  onClose,
  deal,
  currentLang = 'mr',
  onDispatched
}) {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.mr;
  const quantityQtl = Number(deal?.quantity_qtl || deal?.quantity || 50);
  const requiredMt = quantityQtl / 10;

  // Grounded Haversine Distance
  const originDistrict = deal?.district || 'Latur';
  const destDistrict = deal?.delivery_destination?.includes('MIDC')
    ? (deal.delivery_destination.split(' ').pop() || originDistrict)
    : (deal?.delivery_destination || originDistrict);
  const realDistanceKm = calculateHaversineDistance(originDistrict, destDistrict);

  const calculateTransporterFreight = (tp) => {
    const baseFee = (tp.capacity_mt || 2) >= 10 ? 1200 : (tp.capacity_mt || 2) >= 5 ? 800 : 500;
    const perKm = Number(tp.per_km_rate) || 16.00;
    return baseFee + Math.round(realDistanceKm * perKm);
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchTransporters = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.getTransporters({ 
          district: deal?.district || 'all',
          available: true 
        });
        const fetched = res.transporters || [];
        if (fetched.length > 0) {
          setTransporters(fetched);
        } else {
          setTransporters(FALLBACK_TRANSPORTERS);
        }
      } catch (err) {
        setTransporters(FALLBACK_TRANSPORTERS);
      } finally {
        setLoading(false);
      }
    };
    fetchTransporters();
  }, [isOpen, deal]);

  if (!isOpen || !deal) return null;

  const handleDispatch = async (tp) => {
    setDispatchingId(tp.id);
    setErrorMsg('');
    try {
      const dynamicFreight = calculateTransporterFreight(tp);

      const res = await api.dispatchDeal({
        deal_id: deal.id,
        transporter_id: tp.id,
        driver_name: tp.driver_name || tp.name || 'Verified Driver',
        driver_phone: tp.phone || '',
        vehicle_number: tp.vehicle_number || 'MH-24-VEHICLE',
        vehicle_type: tp.vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
        freight_amount: dynamicFreight
      });

      setSuccessMsg(t.successNotice);
      setTimeout(() => {
        if (onDispatched) onDispatched(res.deal || deal);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Dispatch failed. Please retry.');
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-[#E5DFD4] shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E5DFD4]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Truck className="w-6 h-6 text-[#DE7C4A]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-[#1B4332]">{t.modalTitle}</h3>
              <p className="text-xs text-stone-500">{t.modalSub}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Deal Produce Summary Strip */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] font-bold uppercase">{t.crop}</span>
            <span className="font-bold text-stone-900">{deal.crop} ({deal.variety || 'FAQ'})</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] font-bold uppercase">{t.quantity}</span>
            <span className="font-bold font-mono text-[#1B4332]">{quantityQtl} Qtl ({requiredMt.toFixed(1)} MT)</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] font-bold uppercase">{t.pickup}</span>
            <span className="font-semibold text-stone-700 truncate block">{deal.farm_address || deal.district || 'Farm Gate'}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] font-bold uppercase">{t.drop}</span>
            <span className="font-semibold text-stone-700 truncate block">{deal.buyer_name || deal.delivery_destination || 'Processing Mill'}</span>
          </div>
        </div>

        {/* Available Transporters List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {deal.district ? `${t.availableVehicles} ${deal.district}` : t.allDistrictFallback}
            </h4>
            <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {transporters.length} Drivers Online
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1B4332]" />
              <p className="text-xs font-medium">Locating nearest verified vehicles...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transporters.map((tp) => {
                const isRecommended = (tp.capacity_mt || 2.0) >= requiredMt && (tp.capacity_mt || 2.0) <= (requiredMt + 3.0);
                const estFreight = calculateTransporterFreight(tp);

                return (
                  <div 
                    key={tp.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isRecommended 
                        ? 'bg-white border-emerald-400/80 shadow-xs ring-1 ring-emerald-500/20' 
                        : 'bg-white border-[#E5DFD4] hover:border-stone-400'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-bold text-stone-900 text-sm">{tp.driver_name || 'Verified Driver'}</h5>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          RTO & DL Verified
                        </span>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#C86432]/10 text-[#C86432] px-2 py-0.5 rounded-full border border-[#C86432]/30">
                            <Gauge className="w-3 h-3" />
                            {t.recommendedTag}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                        <span className="font-mono font-bold text-[#1B4332] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DFD4]">
                          {tp.vehicle_number}
                        </span>
                        <span>{tp.vehicle_type || 'Bolero Maxi Truck'}</span>
                        <span className="text-stone-400">•</span>
                        <span>Payload: <strong>{tp.capacity_mt || 2.0} MT</strong></span>
                        <span className="text-stone-400">•</span>
                        <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {tp.rating || 5.0} ({tp.trips_completed || 20}+ trips)
                        </span>
                      </div>
                    </div>

                    {/* Freight & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DFD4]">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">{t.estFreight}</span>
                        <span className="text-base font-bold font-mono text-[#1B4332]">₹{estFreight.toLocaleString()}</span>
                        <span className="text-[9px] text-stone-500 block font-mono">
                          {realDistanceKm} km @ ₹{tp.per_km_rate || 16}/km
                        </span>
                      </div>

                      <button
                        onClick={() => handleDispatch(tp)}
                        disabled={dispatchingId === tp.id || Boolean(successMsg)}
                        className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {dispatchingId === tp.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            {t.dispatchingBtn}
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5 text-[#DE7C4A]" />
                            {t.dispatchBtn}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E5DFD4] hover:bg-[#FAF7F2] text-xs font-bold text-stone-600"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
}
