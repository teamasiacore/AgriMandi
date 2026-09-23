import React, { useState } from 'react';
import { 
  X, AlertTriangle, ShieldAlert, Scale, FileText, 
  DollarSign, CheckCircle2, Loader2, Info, ArrowRight, Gavel
} from 'lucide-react';
import api from '../../services/api';

const DICT = {
  en: {
    modalTitle: 'File APMC Dispute / Grievance',
    modalSubtitle: 'Direct Farm-Gate Procurement Arbitral Authority',
    disputeTypeLabel: 'Dispute Category',
    types: {
      QUALITY_MISMATCH: 'Quality / Assay Mismatch (Moisture, Foreign Matter, Grade)',
      WEIGHMENT_DISCREPANCY: 'Weighbridge Net Weight Discrepancy',
      PAYMENT_DELAY: 'Escrow Settlement / Payment Delay Dispute',
      TRANSIT_DAMAGE: 'Produce Damage in Transit / Logistics Fault'
    },
    claimAmountLabel: 'Disputed Claim Amount (₹)',
    reasonLabel: 'Detailed Grounds for Dispute (Under APMC Direct Trade Rules)',
    reasonPlaceholder: 'State the exact discrepancy, gate observation, or contract violation...',
    evidenceLabel: 'Supporting Evidence / Document Link (Optional)',
    evidencePlaceholder: 'URL to photo, weigh slip scan, or external lab assay...',
    freezeNoticeTitle: 'Statutory Escrow Freeze Notice',
    freezeNoticeText: 'Under Maharashtra APMC Direct Purchase Rules, filing this official grievance immediately freezes 100% of the deal escrow funds. Funds cannot be released until an Arbitral Award or mutual settlement is certified.',
    cancelBtn: 'Cancel',
    submitBtn: 'File Official APMC Dispute',
    submitting: 'Filing Case & Freezing Escrow...',
    successTitle: 'Dispute Case Registered Successfully!',
    closeBtn: 'Close'
  },
  hi: {
    modalTitle: 'एपीएमसी विवाद / शिकायत दर्ज करें',
    modalSubtitle: 'प्रत्यक्ष कृषि-द्वार खरीद मध्यस्थता प्राधिकरण',
    disputeTypeLabel: 'विवाद की श्रेणी',
    types: {
      QUALITY_MISMATCH: 'गुणवत्ता / परख बेमेल (नमी, बाहरी पदार्थ, ग्रेड)',
      WEIGHMENT_DISCREPANCY: 'धर्मकांटा शुद्ध वजन विसंगति',
      PAYMENT_DELAY: 'एस्क्रो भुगतान / निपटान विलंब विवाद',
      TRANSIT_DAMAGE: 'परिवहन के दौरान उपज क्षति / लॉजिस्टिक्स त्रुटि'
    },
    claimAmountLabel: 'विवादित दावा राशि (₹)',
    reasonLabel: 'विवाद के विस्तृत आधार (एपीएमसी प्रत्यक्ष व्यापार नियमानुसार)',
    reasonPlaceholder: 'सटीक विसंगति, गेट निरीक्षण या अनुबंध उल्लंघन का विवरण दें...',
    evidenceLabel: 'समर्थन साक्ष्य / दस्तावेज़ लिंक (वैकल्पिक)',
    evidencePlaceholder: 'तस्वीर, धर्मकांटा पर्ची या स्वतंत्र प्रयोगशाला परख का लिंक...',
    freezeNoticeTitle: 'वैधानिक एस्क्रो रोक सूचना',
    freezeNoticeText: 'महाराष्ट्र एपीएमसी प्रत्यक्ष खरीद नियमों के तहत, यह शिकायत दर्ज होते ही सौदे की 100% एस्क्रो राशि तुरंत रोक दी जाएगी। मध्यस्थता निर्णय होने तक भुगतान जारी नहीं होगा।',
    cancelBtn: 'रद्द करें',
    submitBtn: 'आधिकारिक एपीएमसी विवाद दर्ज करें',
    submitting: 'केस दर्ज और एस्क्रो फ्रीज हो रहा है...',
    successTitle: 'विवाद केस सफलतापूर्वक दर्ज हो गया!',
    closeBtn: 'बंद करें'
  },
  mr: {
    modalTitle: 'एपीएमसी वाद / तक्रार दाखल करा',
    modalSubtitle: 'थेट शेतमाल खरेदी लवाद व तक्रार निवारण कक्ष',
    disputeTypeLabel: 'वादाचा प्रकार / प्रवर्ग',
    types: {
      QUALITY_MISMATCH: 'गुणवत्ता / प्रतवारी विसंगती (ओलावा, कचरा, ग्रेड)',
      WEIGHMENT_DISCREPANCY: 'वजनकाटा निव्वळ वजन विसंगती',
      PAYMENT_DELAY: 'एस्क्रो रक्कम वर्ग करण्यास विलंब वाद',
      TRANSIT_DAMAGE: 'वाहतुकीदरम्यान शेतमालाचे नुकसान / वाहतूकदार चूक'
    },
    claimAmountLabel: 'दावा केलेली वादग्रस्त रक्कम (₹)',
    reasonLabel: 'वादाचे सविस्तर कारण (एपीएमसी थेट खरेदी नियमांनुसार)',
    reasonPlaceholder: 'नेमकी तफावत, गेट तपासणी किंवा कराराचे उल्लंघन नमूद करा...',
    evidenceLabel: 'पुरावा / दस्तऐवज लिंक (पर्यायी)',
    evidencePlaceholder: 'फोटो, वजनकाटा पावती किंवा प्रयोगशाळा तपासणी अहवाल लिंक...',
    freezeNoticeTitle: 'वैधानिक एस्क्रो रक्कम गोठवण्याची सूचना',
    freezeNoticeText: 'महाराष्ट्र एपीएमसी थेट खरेदी नियमांनुसार, ही तक्रार दाखल होताच कराराची १००% एस्क्रो रक्कम तात्काळ गोठवली जाईल. अधिकृत लवाद निवाडा किंवा समझोता होईपर्यंत रक्कम वर्ग होणार नाही.',
    cancelBtn: 'रद्द करा',
    submitBtn: 'अधिकृत एपीएमसी वाद दाखल करा',
    submitting: 'वाद नोंदणी व रक्कम गोठवण्याची प्रक्रिया सुरू...',
    successTitle: 'तक्रार निवारण केस यशस्वीपणे नोंदवली गेली!',
    closeBtn: 'बंद करा'
  }
};

export default function FileDisputeModal({
  isOpen,
  onClose,
  deal,
  role = 'FARMER',
  userName = '',
  currentLang = 'mr',
  onSuccess
}) {
  const [disputeType, setDisputeType] = useState('QUALITY_MISMATCH');
  const [claimAmount, setClaimAmount] = useState(deal?.total_deal_value || 0);
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen || !deal) return null;

  const t = DICT[currentLang] || DICT.mr;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(currentLang === 'en' ? 'Please provide detailed grounds for the dispute.' : 'कृपया वादाचे सविस्तर कारण नमूद करा.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.fileDispute({
        deal_id: deal.id,
        raised_by: userName || (role === 'BUYER' ? deal.buyer_name : deal.farmer_name),
        raised_by_role: role,
        dispute_type: disputeType,
        claim_amount: Number(claimAmount) || deal.total_deal_value,
        reason: reason.trim(),
        evidence_urls: evidenceUrl.trim() ? [evidenceUrl.trim()] : []
      });

      setSuccessResult(res.dispute);
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      console.error('Error filing dispute:', err);
      setError(err.response?.data?.message || err.message || 'Failed to file dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E5DFD4] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#C86432] text-white flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              APMC Statutory Arbitration Desk
            </span>
          </div>
          
          <h2 className="text-xl font-heading font-black tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            {t.modalTitle}
          </h2>
          <p className="text-stone-300 text-xs mt-1">
            {t.modalSubtitle} • Deal #{deal.id} ({deal.crop})
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {successResult ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">{t.successTitle}</h3>
                <p className="text-xs text-stone-600 mt-1 font-mono">
                  Case Number: <strong className="text-[#1B4332] text-sm">{successResult.case_number}</strong>
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs space-y-2 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Escrow Freeze Activated</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  ₹{Number(successResult.claim_amount).toLocaleString('en-IN')} escrow funds have been frozen. Both parties have been formally summoned before the APMC Arbitral Authority.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-xs"
              >
                {t.closeBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Deal Snapshot */}
              <div className="p-3.5 bg-white border border-[#E5DFD4] rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-stone-500 block">Commodity & Quantity</span>
                  <span className="font-bold text-stone-900">{deal.crop} ({deal.variety || 'FAQ'}) • {deal.quantity_qtl} Qtl</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">Total Contract Value</span>
                  <span className="font-mono font-bold text-[#1B4332] text-sm">₹{Number(deal.total_deal_value).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  {t.disputeTypeLabel}
                </label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD4] rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-[#1B4332] cursor-pointer"
                >
                  <option value="QUALITY_MISMATCH">{t.types.QUALITY_MISMATCH}</option>
                  <option value="WEIGHMENT_DISCREPANCY">{t.types.WEIGHMENT_DISCREPANCY}</option>
                  <option value="PAYMENT_DELAY">{t.types.PAYMENT_DELAY}</option>
                  <option value="TRANSIT_DAMAGE">{t.types.TRANSIT_DAMAGE}</option>
                </select>
              </div>

              {/* Claim Amount */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  {t.claimAmountLabel}
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5DFD4] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                    placeholder="Enter disputed claim amount"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  {t.reasonLabel}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  className="w-full p-3 bg-white border border-[#E5DFD4] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#1B4332] resize-none"
                  placeholder={t.reasonPlaceholder}
                  required
                />
              </div>

              {/* Evidence URL */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  {t.evidenceLabel}
                </label>
                <input
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD4] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#1B4332]"
                  placeholder={t.evidencePlaceholder}
                />
              </div>

              {/* Freeze Statutory Warning */}
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-bold mb-0.5">{t.freezeNoticeTitle}</strong>
                  <p className="text-[11px] leading-relaxed text-amber-800">{t.freezeNoticeText}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#C86432] hover:bg-[#b05528] disabled:bg-stone-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4" />
                      <span>{t.submitBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
