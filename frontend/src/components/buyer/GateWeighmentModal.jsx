import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertCircle, X, Sparkles, FileText, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const DICT = {
  en: {
    title: 'Mill Gate Weighbridge & Quality Assay',
    subtitle: 'Record certified gross & tare weight and laboratory moisture test',
    dealInfo: 'Deal Reference',
    crop: 'Crop',
    contractQty: 'Agreed Quantity',
    pricePerQtl: 'Agreed Rate',
    grossWeight: 'Gross Weight (Loaded Truck + Driver)',
    tareWeight: 'Tare Weight (Empty Truck after Unloading)',
    netWeightResult: 'Certified Net Harvest Weight',
    quintals: 'Qtl',
    kg: 'kg',
    moistureTested: 'Tested Moisture Content (%)',
    foreignMatter: 'Foreign Matter / Admixture (%)',
    damagePercentage: 'Damaged / Discolored Grain (%)',
    qualityGrade: 'Assayer Quality Grade',
    gradeA: 'FAQ Grade A (Clean & Dry)',
    gradeB: 'FAQ Grade B (Acceptable with Tolerance)',
    operatorName: 'Gate Operator / Assayer Name',
    notes: 'Inspection Remarks / Silo Batch No.',
    summaryTitle: 'Settlement Summary Callout',
    grossMinusTare: 'Gross - Tare Math',
    baseAmount: 'Gross Base Value',
    deductions: 'Quality Moisture / Admixture Deduction',
    finalPayable: 'Final Approved Payable Amount',
    submitBtn: 'Certify Weighment & Issue Slip',
    submitting: 'Certifying...',
    cancel: 'Cancel',
    errGrossTare: 'Gross weight must be strictly greater than Tare weight.',
    moistureWarning: 'Tested moisture exceeds 12.0% baseline limit. Pro-rata mill deduction applied.'
  },
  hi: {
    title: 'मिल गेट वे-ब्रिज एवं गुणवत्ता परीक्षण',
    subtitle: 'प्रमाणित सकल (Gross) एवं खाली (Tare) वजन तथा नमी परीक्षण दर्ज करें',
    dealInfo: 'अनुबंध संदर्भ',
    crop: 'फसल',
    contractQty: 'स्वीकृत मात्रा',
    pricePerQtl: 'स्वीकृत भाव',
    grossWeight: 'सकल वजन / Gross Weight (भरा हुआ ट्रक)',
    tareWeight: 'खाली वजन / Tare Weight (खाली ट्रक वजन)',
    netWeightResult: 'प्रमाणित शुद्ध फसल वजन (Net Weight)',
    quintals: 'क्विंटल',
    kg: 'किग्रा',
    moistureTested: 'परीक्षित नमी प्रतिशत / Moisture (%)',
    foreignMatter: 'कचरा / बाहरी तत्व / Foreign Matter (%)',
    damagePercentage: 'क्षतिग्रस्त / दागी दाना (%)',
    qualityGrade: 'गुणवत्ता श्रेणी (Quality Grade)',
    gradeA: 'FAQ ग्रेड A (उत्कृष्ट एवं सूखा)',
    gradeB: 'FAQ ग्रेड B (स्वीकार्य)',
    operatorName: 'वेब्रिज ऑपरेटर / परीक्षक का नाम',
    notes: 'निरीक्षण विवरण / साइलो बैच नंबर',
    summaryTitle: 'अंतिम भुगतान सारांश',
    grossMinusTare: 'सकल - खाली वजन गणित',
    baseAmount: 'सकल आधार मूल्य',
    deductions: 'नमी / कचरा कटौती',
    finalPayable: 'अंतिम स्वीकृत भुगतान राशि',
    submitBtn: 'वजन प्रमाणित करें एवं पावती जारी करें',
    submitting: 'प्रमाणित हो रहा है...',
    cancel: 'रद्द करें',
    errGrossTare: 'सकल वजन (Gross) खाली वजन (Tare) से अधिक होना अनिवार्य है।',
    moistureWarning: 'परीक्षित नमी 12.0% मानक सीमा से अधिक है। मानक मिल कटौती लागू की गई।'
  },
  mr: {
    title: 'मिल गेट वेब्रिज व गुणवत्ता तपासणी',
    subtitle: 'प्रमाणित एकूण (Gross) व रिकामे (Tare) वजन व प्रयोगशाळा ओलावा नोंदवा',
    dealInfo: 'करार संदर्भ',
    crop: 'शेतमाल',
    contractQty: 'मंजूर प्रमाण',
    pricePerQtl: 'मंजूर दर',
    grossWeight: 'एकूण वजन / Gross Weight (माल भरलेला ट्रक)',
    tareWeight: 'रिकामे वजन / Tare Weight (रिकाम्या वाहनाचे वजन)',
    netWeightResult: 'प्रमाणित निव्वळ शेतमाल वजन (Net Weight)',
    quintals: 'क्विंटल',
    kg: 'किलो',
    moistureTested: 'तपासलेला ओलावा / Moisture (%)',
    foreignMatter: 'कचरा / काडीकचरा / Foreign Matter (%)',
    damagePercentage: 'डागी / नुकसानग्रस्त दाणे (%)',
    qualityGrade: 'गुणवत्ता श्रेणी (Quality Grade)',
    gradeA: 'FAQ ग्रेड A (स्वच्छ व कोरडा)',
    gradeB: 'FAQ ग्रेड B (मानक स्वीकार्य)',
    operatorName: 'वेब्रिज ऑपरेटर / तपासणी अधिकाऱ्याचे नाव',
    notes: 'नोंद / सायलो बॅच क्रमांक',
    summaryTitle: 'अंतिम देयक सारांश',
    grossMinusTare: 'एकूण - रिकामे वजन गणित',
    baseAmount: 'एकूण आधार मूल्य',
    deductions: 'ओलावा / कचरा वजावट',
    finalPayable: 'अंतिम मंजूर शेतकरी देयक रक्कम',
    submitBtn: 'वजन प्रमाणित करा व पावती द्या',
    submitting: 'प्रमाणित करत आहे...',
    cancel: 'रद्द करा',
    errGrossTare: 'एकूण वजन (Gross) रिकाम्या वजनापेक्षा (Tare) जास्त असणे आवश्यक आहे.',
    moistureWarning: 'तपासलेला ओलावा १२.०% मानक मर्यादेपेक्षा जास्त आहे. नियमानुसार वजावट लागू केली.'
  }
};

export default function GateWeighmentModal({
  isOpen,
  onClose,
  deal,
  currentLang = 'mr',
  onSuccess
}) {
  if (!isOpen || !deal) return null;

  const t = DICT[currentLang] || DICT.mr;

  const targetQtyQtl = Number(deal.quantity_qtl) || 50;
  const estimatedNetKg = targetQtyQtl * 100;
  const estimatedTareKg = 6800; // Standard empty multi-axle truck
  const initialGross = estimatedTareKg + estimatedNetKg;

  const [grossKg, setGrossKg] = useState(deal.weighment?.gross_kg || initialGross);
  const [tareKg, setTareKg] = useState(deal.weighment?.tare_kg || estimatedTareKg);
  const [moisture, setMoisture] = useState(deal.weighment?.moisture_tested || 10.8);
  const [foreignMatter, setForeignMatter] = useState(deal.weighment?.foreign_matter || 1.0);
  const [damage, setDamage] = useState(deal.weighment?.damage_percentage || 0.8);
  const [grade, setGrade] = useState(deal.weighment?.quality_grade || 'FAQ (Grade A)');
  const [operatorName, setOperatorName] = useState(deal.weighment?.operator_name || 'Authorized Mill Assayer');
  const [notes, setNotes] = useState(deal.weighment?.notes || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Math calculations
  const gross = Number(grossKg) || 0;
  const tare = Number(tareKg) || 0;
  const netKg = Math.max(0, gross - tare);
  const netQtl = Number((netKg / 100).toFixed(2));

  const pricePerQtl = Number(deal.price_per_qtl) || 0;
  const baseValue = Number((netQtl * pricePerQtl).toFixed(2));

  // Moisture deduction if > 12.0%
  const baseMoistLimit = 12.0;
  const testedMoist = Number(moisture) || 10.0;
  const moistureDeduction = testedMoist > baseMoistLimit
    ? Number((baseValue * ((testedMoist - baseMoistLimit) / 100)).toFixed(2))
    : 0;

  // Foreign matter deduction if > 2.0%
  const fm = Number(foreignMatter) || 0;
  const fmDeduction = fm > 2.0
    ? Number((baseValue * ((fm - 2.0) / 100)).toFixed(2))
    : 0;

  const totalDeductions = Number((moistureDeduction + fmDeduction).toFixed(2));
  const finalPayable = Math.max(0, Number((baseValue - totalDeductions).toFixed(2)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (gross <= tare) {
      setErrorMsg(t.errGrossTare);
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.recordWeighmentAssay(deal.id, {
        operator_name: operatorName,
        gross_kg: gross,
        tare_kg: tare,
        moisture_tested: testedMoist,
        foreign_matter: fm,
        damage_percentage: Number(damage) || 0,
        quality_grade: grade,
        notes
      });
      setLoading(false);
      if (onSuccess) {
        onSuccess(res.deal, res.weighment);
      }
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || err.message || 'Weighment certification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E5DFD4] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#DE7C4A]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">{t.title}</h3>
              <p className="text-[11px] text-emerald-100/80">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Reference Deal Strip */}
          <div className="p-3 bg-white rounded-xl border border-[#E5DFD4] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-stone-400 uppercase block">{t.dealInfo}</span>
              <span className="font-mono font-bold text-[#1B4332]">{deal.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase block">{t.crop}</span>
              <span className="font-bold text-stone-800">{deal.crop}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase block">{t.contractQty}</span>
              <span className="font-bold font-mono text-stone-800">{deal.quantity_qtl} {t.quintals}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase block">{t.pricePerQtl}</span>
              <span className="font-bold font-mono text-[#C86432]">₹{deal.price_per_qtl} / {t.quintals}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Weighbridge Math */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>1. {t.grossMinusTare}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.grossWeight} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={grossKg}
                    onChange={(e) => setGrossKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-stone-400 font-bold">{t.kg}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.tareWeight} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tareKg}
                    onChange={(e) => setTareKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-stone-400 font-bold">{t.kg}</span>
                </div>
              </div>
            </div>

            {/* Calculated Net Result Card */}
            <div className="mt-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">{t.netWeightResult}</span>
                <span className="text-[11px] text-emerald-700 font-mono">
                  {gross} {t.kg} - {tare} {t.kg} = {netKg.toLocaleString()} {t.kg}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-[#1B4332]">
                  {netQtl} <span className="text-xs font-normal">{t.quintals}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Laboratory Assay Testing */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C86432]" />
              <span>2. Laboratory Quality Assay</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.moistureTested} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.foreignMatter}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foreignMatter}
                  onChange={(e) => setForeignMatter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {t.damagePercentage}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>

            {testedMoist > baseMoistLimit && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg mt-2">
                ⚠️ {t.moistureWarning}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">{t.qualityGrade}</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="FAQ (Grade A)">{t.gradeA}</option>
                  <option value="FAQ (Grade B)">{t.gradeB}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">{t.operatorName}</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-white text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Settlement Callout */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5DFD4] space-y-2 text-xs">
            <div className="flex justify-between items-center text-stone-600">
              <span>{t.baseAmount} ({netQtl} Qtl × ₹{pricePerQtl}):</span>
              <span className="font-mono font-bold text-stone-900">₹{baseValue.toLocaleString()}</span>
            </div>
            {totalDeductions > 0 && (
              <div className="flex justify-between items-center text-red-600 font-medium">
                <span>{t.deductions}:</span>
                <span className="font-mono font-bold">-₹{totalDeductions.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#E5DFD4] flex justify-between items-center text-base">
              <span className="font-bold text-[#1B4332]">{t.finalPayable}:</span>
              <span className="font-mono font-bold text-[#C86432] text-lg">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || gross <= tare}
              className="w-2/3 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#DE7C4A]" />
              <span>{loading ? t.submitting : t.submitBtn}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
