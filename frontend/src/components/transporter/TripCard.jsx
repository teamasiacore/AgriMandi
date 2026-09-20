import React, { useState } from 'react';
import { 
  Truck, MapPin, Navigation, Calendar, DollarSign, 
  CheckCircle2, QrCode, Phone, ArrowRight, Clock, Check, Building2
} from 'lucide-react';

export default function TripCard({ 
  trip, 
  onAccept, 
  onViewWaybill, 
  onUpdateMilestone,
  isAvailable = true, 
  currentLang = 'mr' 
}) {
  const [updating, setUpdating] = useState(false);
  const isAssigned = Boolean(trip.transporter_id);
  const status = trip.delivery_status || 'PENDING_PICKUP';

  const estDistanceKm = trip.distance_km || 38;
  const quantityQtl = Number(trip.quantity_qtl || trip.agreed_quantity_qtl) || 50;
  const estFreight = trip.freight_amount || Math.round((quantityQtl * 180));

  const handleMilestoneStep = async (nextMilestone) => {
    if (!onUpdateMilestone) return;
    setUpdating(true);
    try {
      await onUpdateMilestone(trip.deal_id || trip.id, nextMilestone);
    } finally {
      setUpdating(false);
    }
  };

  // Status Badge Configuration
  const getStatusBadge = () => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-700" />
            {currentLang === 'en' ? 'Delivered' : currentLang === 'hi' ? 'वितरित (पहुंच गया)' : 'वितरण पूर्ण'}
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-700 animate-pulse" />
            {currentLang === 'en' ? 'In Transit' : currentLang === 'hi' ? 'रास्ते में' : 'प्रवासात आहे'}
          </span>
        );
      case 'AT_FARM_GATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-700" />
            {currentLang === 'en' ? 'At Farm Gate (Loading)' : currentLang === 'hi' ? 'खेत पर (लोडिंग जारी)' : 'शेतावर हजर (लोडिंग)'}
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-700" />
            {currentLang === 'en' ? 'Dispatched' : currentLang === 'hi' ? 'गाड़ी रवाना' : 'वाहन रवाना'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            {currentLang === 'en' ? 'Awaiting Vehicle' : currentLang === 'hi' ? 'वाहन की प्रतीक्षा' : 'वाहतूक मागणी'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5DFD4] shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden">
      
      {/* Top Status & Deal ID */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD4] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C86432] animate-pulse" />
          <span className="text-xs font-mono font-bold text-stone-600">
            {trip.deal_id || trip.id || 'DEAL-MH-TRIP'}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Commodity & Quantity */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading text-[#1B4332]">
            {trip.crop || 'Agricultural Produce'}
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            {trip.variety || 'FAQ Quality'} • {quantityQtl} {currentLang === 'en' ? 'Quintals' : currentLang === 'hi' ? 'क्विंटल' : 'क्विंटल'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">
            {currentLang === 'en' ? 'Freight Consideration' : currentLang === 'hi' ? 'मालभाड़ा' : 'वाहतूक भाडे'}
          </span>
          <span className="text-xl font-bold font-mono text-[#1B4332]">
            ₹{estFreight.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Route: Pickup ➔ Delivery */}
      <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2.5 text-xs">
        {/* Pickup */}
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-emerald-700" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">
              {currentLang === 'en' ? 'Farm-Gate Pickup (Farmer)' : currentLang === 'hi' ? 'खेत से उठाव (किसान)' : 'शेतातून उचल (शेतकरी)'}
            </span>
            <p className="font-bold text-stone-800">
              {trip.farmer_name || (currentLang === 'en' ? 'Farmer' : currentLang === 'hi' ? 'किसान' : 'शेतकरी')}, {trip.farm_address || trip.district || (currentLang === 'en' ? 'Maharashtra' : 'महाराष्ट्र')}
            </p>
            {trip.farmer_phone && (
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3" /> +91 {trip.farmer_phone}
              </span>
            )}
          </div>
        </div>

        {/* Route Line */}
        <div className="border-l-2 border-dashed border-[#E5DFD4] ml-2.5 h-3" />

        {/* Drop */}
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-3 h-3 text-[#DE7C4A]" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">
              {currentLang === 'en' ? 'Delivery Destination (Mill)' : currentLang === 'hi' ? 'वितरण गंतव्य (मिल)' : 'पोहोच ठिकाण (खरेदीदार मिल)'}
            </span>
            <p className="font-bold text-stone-800">
              {trip.buyer_name || (currentLang === 'en' ? 'Processing Mill' : currentLang === 'hi' ? 'प्रोसेसिंग मिल' : 'प्रक्रिया उद्योग')}, {trip.delivery_destination || 'MIDC Industrial Area'}
            </p>
          </div>
        </div>
      </div>

      {/* Transit Distance & Vehicle */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
        <span>~{estDistanceKm} km {currentLang === 'en' ? 'Transit Distance' : currentLang === 'hi' ? 'दूरी' : 'अंतर'}</span>
        {trip.vehicle_number && (
          <span className="font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
            {trip.vehicle_number}
          </span>
        )}
      </div>

      {/* Action CTA & Milestone Progress Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5DFD4]">
        
        {/* E-Waybill Button */}
        {isAssigned && (
          <button
            onClick={() => onViewWaybill(trip)}
            className="px-3 py-2 rounded-xl border border-[#E5DFD4] hover:bg-[#FAF7F2] text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-[#DE7C4A]" />
            {currentLang === 'en' ? 'Pass' : 'पास'}
          </button>
        )}

        {/* Milestone Advancement Buttons */}
        {isAssigned ? (
          status === 'DISPATCHED' ? (
            <button
              onClick={() => handleMilestoneStep('AT_FARM_GATE')}
              disabled={updating}
              className="flex-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <MapPin className="w-3.5 h-3.5" />
              {currentLang === 'en' ? 'Arrived at Farm Gate' : currentLang === 'hi' ? 'खेत पर पहुँचे' : 'शेतावर पोहोचलो'}
            </button>
          ) : status === 'AT_FARM_GATE' ? (
            <button
              onClick={() => handleMilestoneStep('IN_TRANSIT')}
              disabled={updating}
              className="flex-1 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Truck className="w-3.5 h-3.5 text-[#DE7C4A]" />
              {currentLang === 'en' ? 'Confirm Loaded & Start Transit' : currentLang === 'hi' ? 'लोडिंग पूर्ण, मिल की ओर रवाना' : 'लोडिंग पूर्ण, रवाना व्हा'}
            </button>
          ) : status === 'IN_TRANSIT' ? (
            <button
              onClick={() => handleMilestoneStep('DELIVERED')}
              disabled={updating}
              className="flex-1 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentLang === 'en' ? 'Confirm Mill Gate Delivery' : currentLang === 'hi' ? 'मिल पर डिलीवरी दर्ज करें' : 'मिलवर माल पोहोचवला'}
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {currentLang === 'en' ? 'Delivery Completed' : currentLang === 'hi' ? 'वितरण सम्पन्न' : 'वितरण पूर्ण'}
            </span>
          )
        ) : (
          <button
            onClick={() => onAccept(trip, estFreight)}
            disabled={!isAvailable}
            className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all ${
              isAvailable
                ? 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-emerald-900/10'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Truck className="w-4 h-4 text-[#DE7C4A]" />
            {currentLang === 'en' ? 'Accept Trip' : currentLang === 'hi' ? 'ट्रिप स्वीकारें' : 'ट्रिप स्वीकारा (बुक करा)'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}

