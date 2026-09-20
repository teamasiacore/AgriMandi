import React, { useRef } from 'react';
import { 
  X, Printer, CheckCircle2, Scale, ShieldCheck, 
  Sparkles, Building2, User, Truck, FileText, QrCode
} from 'lucide-react';

const DICT = {
  en: {
    title: 'Certified Mill Gate Weighment & Quality Certificate',
    subtitle: 'Official B2B Trade Intake & Settlement Waybill',
    slipNo: 'Weighbridge Slip No',
    date: 'Certified Date & Time',
    buyerMill: 'Processing Mill Intake Point',
    farmerSeller: 'Farmer / Producer Seller',
    transporterInfo: 'Logistics Carrier & Vehicle',
    weightMatrixTitle: 'Certified Weighbridge Readings (Standard Test Scale)',
    grossWeight: 'Gross Weight (Loaded Vehicle)',
    tareWeight: 'Tare Weight (Empty Vehicle)',
    netWeight: 'Certified Net Harvest Weight',
    quintals: 'Quintals (Qtl)',
    assayReportTitle: 'Laboratory Quality Assay Analysis',
    moisture: 'Tested Moisture',
    foreignMatter: 'Foreign Matter / Admixture',
    damage: 'Damaged / Discolored Grains',
    qualityGrade: 'Assayer Certified Grade',
    toleranceNote: 'Moisture tolerance baseline: 12.0% standard. Pro-rata quality deduction applied if exceeded.',
    commercialSettlementTitle: 'Approved Commercial Settlement Calculation',
    agreedRate: 'Contracted Unit Price',
    baseConsideration: 'Gross Consideration',
    qualityDeductions: 'Total Quality / Moisture Deduction',
    netPayable: 'Final Approved Payout to Farmer',
    escrowNote: 'Approved for T+0 settlement via authorized bank partner. 0% APMC Cess applied under Direct Procurement Rules.',
    authorizedSign: 'Authorized Mill Assayer',
    driverSign: 'Transporter / Driver Acknowledgment',
    printBtn: 'Print / Download Official Certificate',
    closeBtn: 'Close'
  },
  hi: {
    title: 'प्रमाणित मिल गेट वे-ब्रिज एवं गुणवत्ता प्रमाणपत्र',
    subtitle: 'आधिकारिक B2B व्यापार आवक एवं अंतिम भुगतान पावती',
    slipNo: 'वेब्रिज पावती क्रमांक',
    date: 'प्रमाणीकरण दिनांक एवं समय',
    buyerMill: 'प्रसंस्करण मिल / प्राप्ति केंद्र',
    farmerSeller: 'किसान / उत्पादक विक्रेता',
    transporterInfo: 'वाहन एवं चालक विवरण',
    weightMatrixTitle: 'प्रमाणित वे-ब्रिज मापन (मानक इलेक्ट्रॉनिक कांटा)',
    grossWeight: 'सकल वजन / Gross Weight (भरा वाहन)',
    tareWeight: 'खाली वजन / Tare Weight (खाली वाहन)',
    netWeight: 'प्रमाणित शुद्ध फसल वजन (Net Weight)',
    quintals: 'क्विंटल',
    assayReportTitle: 'प्रयोगशाला गुणवत्ता परीक्षण रिपोर्ट',
    moisture: 'परीक्षित नमी (Moisture)',
    foreignMatter: 'कचरा / बाहरी तत्व',
    damage: 'क्षतिग्रस्त / दागी दाना',
    qualityGrade: 'प्रमाणित गुणवत्ता श्रेणी',
    toleranceNote: 'मानक नमी सीमा: 12.0%। इससे अधिक होने पर मानक मिल कटौती लागू की जाती है।',
    commercialSettlementTitle: 'स्वीकृत व्यावसायिक भुगतान गणना',
    agreedRate: 'अनुबंधित इकाई दर',
    baseConsideration: 'सकल अनुबंध मूल्य',
    qualityDeductions: 'कुल गुणवत्ता / नमी कटौती',
    netPayable: 'किसान को देय अंतिम शुद्ध राशि',
    escrowNote: 'अधिकृत बैंक पार्टनर द्वारा तत्काल भुगतान हेतु स्वीकृत। मंडी सेस छूट लागू।',
    authorizedSign: 'अधिकृत मिल परीक्षक हस्ताक्षर',
    driverSign: 'चालक / ट्रांसपोर्टर पावती हस्ताक्षर',
    printBtn: 'प्रमाणपत्र प्रिंट / डाउनलोड करें',
    closeBtn: 'बंद करें'
  },
  mr: {
    title: 'प्रमाणित मिल गेट वेब्रिज व गुणवत्ता प्रमाणपत्र',
    subtitle: 'अधिकृत B2B थेट खरेदी आवक व अंतिम देयक पावती',
    slipNo: 'वेब्रिज पावती क्रमांक',
    date: 'प्रमाणीकरण तारीख व वेळ',
    buyerMill: 'खरेदीदार प्रक्रिया कारखाना',
    farmerSeller: 'शेतकरी / मालक विक्रेता',
    transporterInfo: 'वाहतूकदार व वाहन क्रमांक',
    weightMatrixTitle: 'प्रमाणित वेब्रिज मोजमाप (इलेक्ट्रॉनिक धर्मकाटा)',
    grossWeight: 'एकूण वजन / Gross Weight (भरलेले वाहन)',
    tareWeight: 'रिकामे वजन / Tare Weight (रिकामे वाहन)',
    netWeight: 'प्रमाणित निव्वळ शेतमाल वजन (Net Weight)',
    quintals: 'क्विंटल',
    assayReportTitle: 'प्रयोगशाळा गुणवत्ता तपासणी अहवाल',
    moisture: 'तपासलेला ओलावा (Moisture)',
    foreignMatter: 'कचरा / काडीकचरा',
    damage: 'नुकसानग्रस्त / डागी दाणे',
    qualityGrade: 'प्रमाणित गुणवत्ता श्रेणी',
    toleranceNote: 'मानक ओलावा मर्यादा: १२.०%। जास्त ओलावा असल्यास नियमानुसार वजावट लागू.',
    commercialSettlementTitle: 'मंजूर अंतिम शेतकरी देयक हिशोब',
    agreedRate: 'मंजूर प्रति क्विंटल दर',
    baseConsideration: 'एकूण देयक रक्कम',
    qualityDeductions: 'एकूण गुणवत्ता / ओलावा वजावट',
    netPayable: 'शेतकऱ्यास देय अंतिम निव्वळ रक्कम',
    escrowNote: 'अधिकृत बँक खात्यात T+0 थेट वर्ग करण्यासाठी मंजूर. थेट खरेदी नियमानुसार ०% मंडी उपकर सूट.',
    authorizedSign: 'अधिकृत मिल तपासणी अधिकारी स्वाक्षरी',
    driverSign: 'चालक / वाहतूकदार पोच स्वाक्षरी',
    printBtn: 'अधिकृत पावती प्रिंट / डाउनलोड करा',
    closeBtn: 'बंद करा'
  }
};

export default function WeighmentAssaySlipModal({
  isOpen,
  onClose,
  deal,
  weighmentData,
  currentLang = 'mr'
}) {
  if (!isOpen || !deal) return null;

  const t = DICT[currentLang] || DICT.mr;
  const printRef = useRef();

  const w = weighmentData || deal.weighment || {
    slip_no: `WB-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-992140`,
    operator_name: 'Authorized Mill Assayer',
    gross_kg: (Number(deal.quantity_qtl || 50) * 100) + 6800,
    tare_kg: 6800,
    net_kg: Number(deal.quantity_qtl || 50) * 100,
    net_qtl: Number(deal.quantity_qtl || 50),
    moisture_tested: 10.8,
    foreign_matter: 1.0,
    damage_percentage: 0.8,
    quality_grade: 'FAQ (Grade A)',
    base_amount: deal.total_deal_value || (Number(deal.price_per_qtl || 4500) * Number(deal.quantity_qtl || 50)),
    total_deductions: 0,
    final_payable_amount: deal.total_deal_value || (Number(deal.price_per_qtl || 4500) * Number(deal.quantity_qtl || 50)),
    verified_at: new Date().toISOString()
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5DFD4] shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Controls Header */}
        <div className="px-6 py-3.5 bg-[#FAF7F2] border-b border-[#E5DFD4] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#1B4332]" />
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              {t.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#E5DFD4] hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printRef} className="p-8 overflow-y-auto font-sans text-stone-900 bg-white">
          
          {/* Certificate Header Banner */}
          <div className="border-b-2 border-[#1B4332] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-heading text-[#1B4332] tracking-tight">
                  AgriMandi (कृषीसेतू)
                </span>
                <span className="text-[11px] font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                  OFFICIAL GATE PASS & WEIGHMENT SLIP
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                {t.title} — {t.subtitle}
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-[#E5DFD4] sm:pl-4">
              <span className="text-[10px] text-stone-400 block uppercase font-mono">{t.slipNo}</span>
              <span className="text-sm font-bold font-mono text-[#C86432]">{w.slip_no}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {new Date(w.verified_at || Date.now()).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Parties Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5 p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] text-xs">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                <User className="w-3 h-3 text-[#1B4332]" /> {t.farmerSeller}
              </span>
              <span className="font-bold text-stone-900 block mt-1">{deal.farmer_name}</span>
              <span className="text-[11px] text-stone-500 block">{deal.farmer_phone}</span>
              <span className="text-[11px] text-stone-500 block">{deal.farmer_district || 'Latur'}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#1B4332]" /> {t.buyerMill}
              </span>
              <span className="font-bold text-stone-900 block mt-1">{deal.buyer_name}</span>
              <span className="text-[11px] text-stone-500 block">{deal.delivery_destination}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#C86432]" /> {t.transporterInfo}
              </span>
              <span className="font-bold text-stone-900 block mt-1">{deal.driver_name || deal.transporter_name || 'Verified Carrier'}</span>
              <span className="font-mono font-bold text-[#1B4332] block">{deal.vehicle_number || 'MH-24-AG-7821'}</span>
            </div>
          </div>

          {/* Certified Weighbridge Scale Readings */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>{t.weightMatrixTitle}</span>
            </h4>
            
            <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <div>
                <span className="text-[11px] text-stone-500 block font-medium">{t.grossWeight}</span>
                <span className="text-base font-bold font-mono text-stone-800 mt-1 block">
                  {Number(w.gross_kg).toLocaleString()} kg
                </span>
              </div>
              <div className="border-x border-stone-200">
                <span className="text-[11px] text-stone-500 block font-medium">{t.tareWeight}</span>
                <span className="text-base font-bold font-mono text-stone-600 mt-1 block">
                  {Number(w.tare_kg).toLocaleString()} kg
                </span>
              </div>
              <div className="bg-emerald-50 rounded-lg py-1 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 block">{t.netWeight}</span>
                <span className="text-lg font-bold font-mono text-[#1B4332] mt-0.5 block">
                  {w.net_qtl} {t.quintals}
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">({Number(w.net_kg).toLocaleString()} kg)</span>
              </div>
            </div>
          </div>

          {/* Certified Quality Assay Laboratory Analysis */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C86432]" />
              <span>{t.assayReportTitle}</span>
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center text-xs p-3 rounded-xl border border-[#E5DFD4] bg-white">
              <div className="p-2 bg-[#FAF7F2] rounded-lg">
                <span className="text-[10px] text-stone-500 block">{t.moisture}</span>
                <span className="font-bold font-mono text-stone-900 text-sm mt-0.5 block">
                  {w.moisture_tested}%
                </span>
              </div>
              <div className="p-2 bg-[#FAF7F2] rounded-lg">
                <span className="text-[10px] text-stone-500 block">{t.foreignMatter}</span>
                <span className="font-bold font-mono text-stone-900 text-sm mt-0.5 block">
                  {w.foreign_matter}%
                </span>
              </div>
              <div className="p-2 bg-[#FAF7F2] rounded-lg">
                <span className="text-[10px] text-stone-500 block">{t.damage}</span>
                <span className="font-bold font-mono text-stone-900 text-sm mt-0.5 block">
                  {w.damage_percentage}%
                </span>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] text-emerald-800 block">{t.qualityGrade}</span>
                <span className="font-bold text-emerald-950 text-xs mt-0.5 block truncate">
                  {w.quality_grade || 'FAQ (Grade A)'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5 italic">
              ℹ️ {t.toleranceNote}
            </p>
          </div>

          {/* Approved Commercial Settlement Breakdown */}
          <div className="mb-6 p-4 rounded-xl border-2 border-[#1B4332] bg-[#FCFAF6] text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD4]">
              <span className="font-bold text-[#1B4332] uppercase tracking-wide">
                {t.commercialSettlementTitle}
              </span>
              <span className="font-mono text-stone-600">
                {w.net_qtl} Qtl × ₹{deal.price_per_qtl}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 text-stone-700">
              <div className="flex justify-between">
                <span>{t.baseConsideration}:</span>
                <span className="font-mono font-bold">₹{Number(w.base_amount || (w.net_qtl * deal.price_per_qtl)).toLocaleString()}</span>
              </div>
              {Number(w.total_deductions) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{t.qualityDeductions}:</span>
                  <span className="font-mono font-bold">-₹{Number(w.total_deductions).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5DFD4] flex justify-between items-center text-sm">
                <span className="font-bold text-[#1B4332]">{t.netPayable}:</span>
                <span className="text-xl font-bold font-mono text-[#1B4332]">
                  ₹{Number(w.final_payable_amount || deal.total_deal_value).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#E5DFD4] flex items-center gap-2 text-[10px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{t.escrowNote}</span>
            </div>
          </div>

          {/* Signatures & QR Verification Block */}
          <div className="pt-4 border-t border-stone-300 grid grid-cols-3 items-end text-xs">
            <div className="text-center border-t border-dashed border-stone-400 pt-2 mx-4">
              <span className="block font-bold text-stone-800">{w.operator_name || 'Authorized Assayer'}</span>
              <span className="text-[10px] text-stone-500 block">{t.authorizedSign}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border border-stone-300 rounded-lg p-1 bg-white flex items-center justify-center">
                <QrCode className="w-12 h-12 text-stone-800" />
              </div>
              <span className="text-[9px] font-mono text-stone-400 mt-1 uppercase">VERIFIED WB ID</span>
            </div>

            <div className="text-center border-t border-dashed border-stone-400 pt-2 mx-4">
              <span className="block font-bold text-stone-800">{deal.driver_name || 'Vehicle Operator'}</span>
              <span className="text-[10px] text-stone-500 block">{t.driverSign}</span>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#E5DFD4] flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
