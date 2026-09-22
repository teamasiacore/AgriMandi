import React, { useState } from 'react';
import { Truck, ShieldCheck, MapPin, Gauge, Power, Star, Phone, FileCheck, Clock } from 'lucide-react';

export default function DriverHeader({ transporter, onStatusChange, currentLang = 'mr' }) {
  const [updating, setUpdating] = useState(false);
  const isAvailable = transporter?.is_available !== false;
  const isVerified = Boolean(transporter?.is_verified && (transporter?.status === 'ACTIVE_FOR_BOOKINGS' || transporter?.status === 'ACTIVE'));

  const handleToggle = async () => {
    setUpdating(true);
    await onStatusChange(!isAvailable);
    setUpdating(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD4] shadow-sm relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#FAF7F2] -z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Driver & Vehicle Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shrink-0 shadow-md">
            <Truck className="w-8 h-8 text-[#DE7C4A]" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1B4332]">
                {transporter?.name || transporter?.driver_name || 'Agri Transporter'}
              </h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {currentLang === 'en' ? 'Verified Logistics Partner' : currentLang === 'hi' ? 'सत्यापित वाहन चालक' : 'सत्यापित कृषी वाहतूकदार'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {currentLang === 'en' ? 'Vehicle Under Review' : currentLang === 'hi' ? 'समीक्षाधीन वाहन प्रोफाइल' : 'वाहन पुनरावलोकनाधीन'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E5DFD4] font-mono font-bold text-stone-800 tracking-wider">
                {transporter?.vehicle_number || 'MH-24-VEHICLE'}
              </span>
              <span className="text-stone-700 font-bold">
                {transporter?.vehicle_type || 'Bolero Maxi Truck (1.5 MT)'}
              </span>
              <span className="flex items-center gap-1 text-stone-500">
                <MapPin className="w-3.5 h-3.5 text-[#C86432]" />
                {transporter?.district || transporter?.base_district || 'Latur'}
                {transporter?.taluka || transporter?.base_taluka ? `, ${transporter.taluka || transporter.base_taluka}` : ''}
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {transporter?.rating || '5.0'} / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Live Duty Switch & Tariff Card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          
          {/* Rate Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] text-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">
              {currentLang === 'en' ? 'Standard Tariff' : currentLang === 'hi' ? 'मानक दर' : 'प्रमाणित दर'}
            </p>
            <p className="text-base font-bold font-mono text-[#1B4332]">
              ₹{transporter?.per_km_rate || 4.20} <span className="text-xs font-normal text-stone-500">/ km</span>
            </p>
          </div>

          {/* Interactive Duty Toggle Button */}
          <button
            onClick={handleToggle}
            disabled={updating}
            className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
            }`}
          >
            <Power className={`w-4 h-4 ${isAvailable ? 'text-white' : 'text-stone-500'} ${updating ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <span className="block leading-none">
                {isAvailable 
                  ? (currentLang === 'en' ? '🟢 On-Duty (Active)' : currentLang === 'hi' ? '🟢 ड्यूटी पर (सक्रिय)' : '🟢 ऑन-ड्युटी (हजर)')
                  : (currentLang === 'en' ? '🔴 Off-Duty (Offline)' : currentLang === 'hi' ? '🔴 ऑफ-ड्यूटी (बंद)' : '🔴 ऑफ-ड्युटी (बंद)')}
              </span>
              <span className="text-[10px] opacity-85 block mt-0.5 font-normal">
                {isAvailable
                  ? (currentLang === 'en' ? 'Receiving trip requests' : currentLang === 'hi' ? 'ट्रिप्स के लिए उपलब्ध' : 'नवीन ट्रिप स्वीकारण्यास तयार')
                  : (currentLang === 'en' ? 'Tap to go online' : currentLang === 'hi' ? 'ऑनलाइन होने के लिए दबाएँ' : 'ऑनलाइन होण्यासाठी टॅप करा')}
              </span>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
}
