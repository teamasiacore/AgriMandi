import React from 'react';
import { X, QrCode, ShieldCheck, Printer, CheckCircle2, Truck, FileText, MapPin, Building2, User } from 'lucide-react';

export default function WaybillModal({ trip, transporter, onClose, currentLang = 'mr' }) {
  if (!trip) return null;

  const waybillNo = `EWB-MH-${trip.id ? trip.id.toString().slice(-6) : '8821'}`;
  const quantityQtl = trip.quantity_qtl || trip.agreed_quantity_qtl || 50;
  const freight = trip.freight_amount || (quantityQtl * 180);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E5DFD4] shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Banner */}
        <div className="bg-[#1B4332] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#DE7C4A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#DE7C4A]">
                  Government & APMC Compliant
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Active Transit Pass
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-white">
                {currentLang === 'en' ? 'Digital Agri E-Waybill & Transit Pass' :
                 currentLang === 'hi' ? 'डिजिटल कृषि ई-वेबिल व पारगमन पास' :
                 'डिजिटल कृषी ई-वेबिल व वाहतूक परवाना'}
              </h2>
            </div>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-800">
          
          {/* Header Row: Waybill No & QR Code */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                E-Waybill Pass Number
              </span>
              <p className="text-xl font-bold font-mono text-[#1B4332]">{waybillNo}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentLang === 'en' ? 'Issue Timestamp:' : currentLang === 'hi' ? 'जारी करने का समय:' : 'जारी वेळ:'} {new Date().toLocaleDateString(currentLang === 'en' ? 'en-IN' : currentLang === 'hi' ? 'hi-IN' : 'mr-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {currentLang === 'en' ? 'Valid for 24 Hours' : currentLang === 'hi' ? '२४ घंटे तक मान्य' : '२४ तास वैध'}
              </p>
            </div>

            {/* Official QR Code Box */}
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5DFD4] shrink-0">
              <div className="w-16 h-16 bg-[#FAF7F2] border border-[#E5DFD4] rounded-lg flex flex-col items-center justify-center text-center p-1">
                <QrCode className="w-10 h-10 text-[#1B4332]" />
                <span className="text-[8px] font-mono text-stone-400">RTO VERIFIED</span>
              </div>
              <div className="text-[11px] space-y-0.5">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Valid
                </span>
                <p className="text-stone-500">AgriMandi Verified</p>
                <p className="font-mono text-[10px] text-stone-400">MH-AGRI-PASS</p>
              </div>
            </div>
          </div>

          {/* Consignor vs Consignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Consignor (Farmer) */}
            <div className="p-4 rounded-2xl border border-[#E5DFD4] bg-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86432] flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {currentLang === 'en' ? 'Consignor (Seller Farmer)' : currentLang === 'hi' ? 'प्रेषक / विक्रेता किसान' : 'प्रेषक / शेतकरी'}
              </span>
              <p className="font-bold text-stone-900 text-sm">{trip.farmer_name || (currentLang === 'en' ? 'Farmer' : currentLang === 'hi' ? 'किसान' : 'शेतकरी')}</p>
              <p className="text-stone-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                {trip.farm_address || trip.district || (currentLang === 'en' ? 'Maharashtra' : 'महाराष्ट्र')}
              </p>
              {trip.farmer_phone && (
                <p className="font-mono text-stone-500">
                  {currentLang === 'en' ? 'Mobile:' : currentLang === 'hi' ? 'मोबाइल:' : 'मोबाईल:'} +91 {trip.farmer_phone}
                </p>
              )}
            </div>

            {/* Consignee (Buyer) */}
            <div className="p-4 rounded-2xl border border-[#E5DFD4] bg-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {currentLang === 'en' ? 'Consignee (Buyer Entity)' : currentLang === 'hi' ? 'प्राप्तकर्ता / खरीदार मिल' : 'प्राप्तकर्ता / खरेदीदार'}
              </span>
              <p className="font-bold text-stone-900 text-sm">{trip.buyer_name || (currentLang === 'en' ? 'Processing Mill' : currentLang === 'hi' ? 'प्रोसेसिंग मिल' : 'प्रक्रिया उद्योग')}</p>
              <p className="text-stone-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                {trip.delivery_destination || 'MIDC Industrial Area'}
              </p>
              <p className="font-mono text-stone-500">GSTIN: {trip.buyer_gstin || '27AABCU9603R1ZM'}</p>
            </div>

          </div>

          {/* Vehicle & Cargo Details */}
          <div className="p-4 rounded-2xl border border-[#E5DFD4] bg-white text-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              {currentLang === 'en' ? 'Cargo & Vehicle Specifications' : currentLang === 'hi' ? 'माल व वाहन विवरण' : 'माल व वाहनाचा तपशील'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-medium text-stone-700">
              <div>
                <span className="text-stone-400 block text-[10px]">
                  {currentLang === 'en' ? 'Crop & Variety:' : currentLang === 'hi' ? 'फसल व किस्म:' : 'पीक व जात:'}
                </span>
                <span className="font-bold text-stone-900">{trip.crop || 'Soybean'} ({trip.variety || 'FAQ'})</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">
                  {currentLang === 'en' ? 'Total Quantity:' : currentLang === 'hi' ? 'कुल वजन:' : 'एकूण वजन:'}
                </span>
                <span className="font-bold text-stone-900">{quantityQtl} {currentLang === 'en' ? 'Quintals' : currentLang === 'hi' ? 'क्विंटल' : 'क्विंटल'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">
                  {currentLang === 'en' ? 'Vehicle No:' : currentLang === 'hi' ? 'गाड़ी नंबर:' : 'गाडी नंबर:'}
                </span>
                <span className="font-bold font-mono text-[#1B4332]">{trip.vehicle_number || transporter?.vehicle_number || 'MH-24-VEHICLE'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">
                  {currentLang === 'en' ? 'Freight Consideration:' : currentLang === 'hi' ? 'वाहन भाड़ा:' : 'वाहतूक भाडे:'}
                </span>
                <span className="font-bold font-mono text-[#C86432]">₹{freight.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {currentLang === 'en' 
                ? 'This e-Waybill is issued under direct farm-gate B2B trade agreement. As per Maharashtra APMC Act regulations, produce in direct farm-to-mill transit is exempt from mandi yard interception.' 
                : currentLang === 'hi' 
                ? 'यह ई-वेबिल सीधे खेत-से-मिल B2B व्यापार समझौते पर आधारित है। महाराष्ट्र कृषि उपज मंडी कानून के तहत खेत से सीधे मिल जा रहे माल पर मंडी नाके पर रोक नहीं लगाई जा सकती।' 
                : 'हा ई-वेबिल थेट शेतकरी-खरेदीदार B2B करारावर आधारित आहे. महाराष्ट्र कृषी उत्पन्न पणन (नियमन) कायद्यानुसार शेतावरून थेट कारखान्याकडे जाणार्‍या मालासाठी कोणत्याही मंडई नाक्यावर अडवणूक करता येत नाही.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5DFD4]">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl border border-[#E5DFD4] hover:bg-[#FAF7F2] text-stone-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-stone-500" />
              {currentLang === 'en' ? 'Print Pass' : currentLang === 'hi' ? 'पास प्रिंट करें' : 'पास प्रिंट करा'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
            >
              {currentLang === 'en' ? 'Close' : currentLang === 'hi' ? 'बंद करें' : 'बंद करा'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
