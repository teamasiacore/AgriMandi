import React from 'react';
import { Truck, MapPin, Navigation, Calendar, DollarSign, CheckCircle2, QrCode, Phone, ArrowRight } from 'lucide-react';

export default function TripCard({ trip, onAccept, onViewWaybill, isAvailable = true, currentLang = 'mr' }) {
  const isAssigned = Boolean(trip.transporter_id);
  const isInTransit = trip.delivery_status === 'IN_TRANSIT';

  // Calculate dynamic estimated freight if not already set:
  // e.g. base ₹500 + 38km * ₹180/qtl or approx ₹9,000 for 50 qtl
  const estDistanceKm = trip.distance_km || 38;
  const quantityQtl = Number(trip.quantity_qtl || trip.agreed_quantity_qtl) || 50;
  const estFreight = trip.freight_amount || Math.round((quantityQtl * 180));

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

        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          isInTransit
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : isAssigned
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-amber-100 text-amber-900 border border-amber-200'
        }`}>
          {isInTransit 
            ? (currentLang === 'en' ? '🚚 In Transit' : currentLang === 'hi' ? '🚚 रास्ते में' : '🚚 प्रवासात आहे')
            : isAssigned 
            ? (currentLang === 'en' ? 'Assigned' : currentLang === 'hi' ? 'वाहन नियुक्त' : 'गाडी नियुक्त')
            : (currentLang === 'en' ? 'Awaiting Vehicle' : currentLang === 'hi' ? 'वाहन की प्रतीक्षा' : 'वाहतूक मागणी')}
        </span>
      </div>

      {/* Commodity & Quantity */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-heading text-[#1B4332]">
            {trip.crop || 'Agricultural Produce'}
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            {trip.variety || 'FAQ Quality'} • {quantityQtl} {currentLang === 'en' ? 'Quintals' : 'क्विंटल'}
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
              {trip.farmer_name || 'Farmer'}, {trip.farm_address || trip.district || 'Latur'}
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
              {trip.buyer_name || 'Processing Mill'}, {trip.delivery_destination || 'MIDC Industrial Area'}
            </p>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-stone-500 font-medium">
          ~{estDistanceKm} km {currentLang === 'en' ? 'Transit Distance' : 'अंतर'}
        </span>

        {isInTransit || isAssigned ? (
          <button
            onClick={() => onViewWaybill(trip)}
            className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <QrCode className="w-4 h-4 text-[#DE7C4A]" />
            {currentLang === 'en' ? 'View E-Waybill & Pass' : currentLang === 'hi' ? 'ई-वेबिल व QR पास' : 'ई-वेबिल व QR पास पहा'}
          </button>
        ) : (
          <button
            onClick={() => onAccept(trip, estFreight)}
            disabled={!isAvailable}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all ${
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
