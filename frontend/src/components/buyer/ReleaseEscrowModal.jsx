import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, DollarSign, Building2, 
  ArrowRight, AlertCircle, Loader2, Landmark, User, Scale
} from 'lucide-react';
import api from '../../services/api';

const DICT = {
  en: {
    modalTitle: 'Escrow Payout Authorization',
    modalSubtitle: 'Direct Farm Gate T+0 Bank Disbursement',
    beneficiaryTitle: 'Farmer Beneficiary Bank Account',
    accountHolder: 'Account Holder',
    bankName: 'Bank Name',
    accountNumber: 'Account Number',
    ifscCode: 'IFSC Code',
    branch: 'Branch',
    dealSummaryTitle: 'Certified Settlement Summary',
    crop: 'Commodity',
    netQuantity: 'Certified Net Weight',
    contractPrice: 'Contract Unit Price',
    qualityGrade: 'Quality Assay Grade',
    netPayable: 'Total Payable Amount',
    quintalUnit: 'Qtl',
    guaranteeTitle: 'Statutory Exemption & Escrow Guarantee',
    guaranteeText: 'Payment will be disbursed directly from AgriMandi Escrow Account to the farmer bank account via RBI RTGS/NEFT. 0% APMC Mandi Cess applied under Section 59 Direct Procurement.',
    authorizedByNote: 'Authorized by Institutional Procurement Desk',
    cancelBtn: 'Cancel',
    confirmBtn: 'Authorize & Release Payout',
    processing: 'Processing RTGS Transfer...',
    successMsg: 'Escrow payout released successfully!'
  },
  hi: {
    modalTitle: 'एस्क्रो भुगतान प्राधिकरण',
    modalSubtitle: 'सीधे किसान बैंक खाते में T+0 तत्काल भुगतान',
    beneficiaryTitle: 'लाभार्थी किसान बैंक खाता विवरण',
    accountHolder: 'खाताधारक का नाम',
    bankName: 'बैंक का नाम',
    accountNumber: 'खाता क्रमांक',
    ifscCode: 'आईएफएससी (IFSC) कोड',
    branch: 'शाखा',
    dealSummaryTitle: 'प्रमाणित व्यापार भुगतान विवरण',
    crop: 'फसल / उपज',
    netQuantity: 'प्रमाणित शुद्ध वजन',
    contractPrice: 'अनुबंधित इकाई दर',
    qualityGrade: 'गुणवत्ता श्रेणी',
    netPayable: 'कुल देय शुद्ध राशि',
    quintalUnit: 'क्विंटल',
    guaranteeTitle: 'वैधानिक छूट एवं एस्क्रो गारंटी',
    guaranteeText: 'भुगतान एग्रीमंडी एस्क्रो खाते से सीधे किसान के खाते में आरटीजीएस/नेफ्ट द्वारा जमा किया जाएगा। धारा 59 प्रत्यक्ष खरीद नियमानुसार 0% मंडी शुल्क लागू।',
    authorizedByNote: 'संस्थागत खरीद डेस्क द्वारा अधिकृत',
    cancelBtn: 'रद्द करें',
    confirmBtn: 'भुगतान अधिकृत करें एवं जारी करें',
    processing: 'आरटीजीएस भुगतान प्रक्रिया जारी...',
    successMsg: 'एस्क्रो भुगतान सफलतापूर्वक किसान के खाते में भेज दिया गया!'
  },
  mr: {
    modalTitle: 'एस्क्रो रक्कम वितरण अधिकृतता',
    modalSubtitle: 'शेतकऱ्याच्या बँक खात्यात थेट T+0 तात्काळ वर्ग',
    beneficiaryTitle: 'लाभार्थी शेतकरी बँक खाते तपशील',
    accountHolder: 'खातेदाराचे नाव',
    bankName: 'बँकेचे नाव',
    accountNumber: 'खाते क्रमांक',
    ifscCode: 'आयएफएससी (IFSC) कोड',
    branch: 'शाखा',
    dealSummaryTitle: 'प्रमाणित देयक सारांश',
    crop: 'शेतमाल / पीक',
    netQuantity: 'प्रमाणित निव्वळ वजन',
    contractPrice: 'करार प्रति क्विंटल दर',
    qualityGrade: 'गुणवत्ता श्रेणी',
    netPayable: 'एकूण देय निव्वळ रक्कम',
    quintalUnit: 'क्विंटल',
    guaranteeTitle: 'वैधानिक सूट व एस्क्रो हमी',
    guaranteeText: 'रक्कम एग्रीमंडी एस्क्रो खात्यातून थेट शेतकऱ्याच्या बँक खात्यात आरटीजीएस/नेफ्टद्वारे जमा केली जाईल. कलम ५९ थेट खरेदी नियमानुसार ०% मंडी सेस सूट.',
    authorizedByNote: 'संस्थागत खरेदी विभागाकडून अधिकृत',
    cancelBtn: 'रद्द करा',
    confirmBtn: 'रक्कम वर्ग करण्यास मंजुरी द्या',
    processing: 'आरटीजीएस व्यवहार प्रक्रिया सुरू आहे...',
    successMsg: 'एस्क्रो रक्कम शेतकऱ्याच्या खात्यात यशस्वीपणे वर्ग केली!'
  }
};

export default function ReleaseEscrowModal({
  isOpen,
  onClose,
  deal,
  currentLang = 'mr',
  onSuccess
}) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !deal) return null;

  const t = DICT[currentLang] || DICT.mr;

  const payableAmount = Number(
    deal.weighment?.final_payable_amount || 
    deal.total_deal_value || 
    (Number(deal.price_per_qtl || 0) * Number(deal.quantity_qtl || 0))
  );

  const netQuantity = deal.weighment?.net_qtl || deal.quantity_qtl || 0;
  const qualityGrade = deal.weighment?.quality_grade || 'FAQ (Grade A)';

  // Beneficiary bank details
  const bankDetails = deal.farmer_bank || {
    account_holder: deal.farmer_name || 'Balasaheb Patil',
    bank_name: 'State Bank of India',
    account_no: '•••• •••• •••• 4892',
    ifsc: 'SBIN0001428',
    branch: 'Latur Main Agri Branch'
  };

  const handleAuthorizeAndRelease = async () => {
    setIsReleasing(true);
    setError(null);
    try {
      const res = await api.settleDealEscrow(deal.id, {
        authorized_by: deal.buyer_name || 'Institutional Procurement Officer',
        payment_mode: 'T+0_DIRECT_ESCROW_RTGS'
      });

      if (onSuccess) {
        onSuccess(res.deal || res);
      }
      onClose();
    } catch (err) {
      console.error('Failed to release escrow payout:', err);
      setError(err.response?.data?.message || err.message || 'Failed to release escrow payout');
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5DFD4] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-[#A3E635]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-wide">
                {t.modalTitle}
              </h2>
              <p className="text-xs text-white/80">
                {t.modalSubtitle} • Deal #{deal.id?.toString().slice(-6)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isReleasing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Amount Highlight Card */}
          <div className="bg-[#FAF7F2] border-2 border-[#1B4332]/20 rounded-2xl p-5 text-center shadow-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6F5A] mb-1">
              {t.netPayable}
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
              ₹{payableAmount.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B4332]/10 text-xs font-bold text-[#1B4332]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
              {t.guaranteeTitle}
            </div>
          </div>

          {/* Certified Settlement Matrix */}
          <div className="bg-white rounded-2xl border border-[#E5DFD4] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C86432]" />
              {t.dealSummaryTitle}
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2.5 rounded-xl bg-[#FAF7F2]/60 border border-[#E5DFD4]/60">
                <span className="text-xs text-[#7C6F5A] block">{t.crop}</span>
                <span className="font-bold text-[#2C221E]">{deal.crop}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2]/60 border border-[#E5DFD4]/60">
                <span className="text-xs text-[#7C6F5A] block">{t.netQuantity}</span>
                <span className="font-bold text-[#1B4332]">{netQuantity} {t.quintalUnit}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2]/60 border border-[#E5DFD4]/60">
                <span className="text-xs text-[#7C6F5A] block">{t.contractPrice}</span>
                <span className="font-bold text-[#2C221E]">₹{Number(deal.price_per_qtl).toLocaleString('en-IN')} / {t.quintalUnit}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2]/60 border border-[#E5DFD4]/60">
                <span className="text-xs text-[#7C6F5A] block">{t.qualityGrade}</span>
                <span className="font-bold text-[#1B4332]">{qualityGrade}</span>
              </div>
            </div>
          </div>

          {/* Beneficiary Farmer Bank Details */}
          <div className="bg-white rounded-2xl border border-[#E5DFD4] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#1B4332]" />
              {t.beneficiaryTitle}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-[#E5DFD4]/40">
                <span className="text-xs text-[#7C6F5A] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#7C6F5A]" />
                  {t.accountHolder}:
                </span>
                <span className="font-bold text-[#2C221E]">{bankDetails.account_holder}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5DFD4]/40">
                <span className="text-xs text-[#7C6F5A]">{t.bankName}:</span>
                <span className="font-bold text-[#2C221E]">{bankDetails.bank_name}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5DFD4]/40">
                <span className="text-xs text-[#7C6F5A]">{t.accountNumber}:</span>
                <span className="font-mono font-bold text-[#1B4332]">{bankDetails.account_no}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5DFD4]/40">
                <span className="text-xs text-[#7C6F5A]">{t.ifscCode}:</span>
                <span className="font-mono font-bold text-[#2C221E]">{bankDetails.ifsc}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-[#7C6F5A]">{t.branch}:</span>
                <span className="text-xs text-[#2C221E] font-medium">{bankDetails.branch}</span>
              </div>
            </div>
          </div>

          {/* Statutory Note */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] text-xs text-[#7C6F5A] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#1B4332] mt-0.5" />
            <div>
              <strong className="text-[#1B4332]">{t.authorizedByNote}:</strong> {t.guaranteeText}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E5DFD4] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isReleasing}
            className="px-4 py-2.5 rounded-xl border border-[#E5DFD4] text-sm font-semibold text-[#7C6F5A] hover:bg-white hover:text-[#2C221E] transition-colors"
          >
            {t.cancelBtn}
          </button>
          
          <button
            type="button"
            onClick={handleAuthorizeAndRelease}
            disabled={isReleasing}
            className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isReleasing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                {t.processing}
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 text-[#A3E635]" />
                {t.confirmBtn}
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
