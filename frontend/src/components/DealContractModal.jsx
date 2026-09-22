import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, Printer, Share2, ShieldCheck, CheckCircle2, 
  MapPin, Building2, User, Scale, Truck, FileText, 
  Calendar, Check 
} from 'lucide-react';

const CONTRACT_TRANSLATIONS = {
  en: {
    modalTopTitle: "Digital Farm-Gate Trade Contract & Waybill",
    printBtn: "Print / PDF",
    shareWhatsApp: "WhatsApp",
    brandTitle: "AgriMandi",
    subTitle: "Maharashtra Direct Farm-Gate Trade Agreement (Sec 32A APMC Act)",
    tagLegal: "Legally Bound Contract",
    cessTitle: "0% APMC Market Cess Exemption",
    cessTag: "Section 32A Certified",
    cessDesc: "As this transaction is executed directly at the farm gate, it is fully exempt from APMC market fees/cess under Section 32A of the Maharashtra Agricultural Produce Marketing (Development and Regulation) Act.",
    sellerTitle: "Seller (Farmer)",
    tagVerified: "7/12 Verified",
    lblFarmerName: "Name:",
    lblContact: "Contact:",
    lblAddress: "Address:",
    lblSurvey: "7/12 Survey No.:",
    buyerTitle: "Purchaser (Buyer Entity)",
    tagBuyerLicense: "GST / APMC Licensed",
    lblBuyerName: "Company / Name:",
    lblDestination: "Destination Gate:",
    lblPaymentStatus: "Payment Status:",
    valEscrow: "Secured in Escrow (100% Escrow Protection)",
    lblConfirmation: "Confirmation:",
    valDigitalSign: "Digital Signature & OTP Verified",
    commercialsTitle: "Produce Specifications & Commercial Consideration",
    thCrop: "Crop & Variety",
    thGrade: "Grade & Moisture",
    thQty: "Quantity",
    thPrice: "Price / Qtl",
    thTotal: "Total Value",
    lblMoisture: "Moisture:",
    lblTotalConsideration: "Total Contract Consideration:",
    unitQtl: "Quintals (Qtl)",
    waybillTitle: "Waybill & Transit Delivery Terms",
    lblPickup: "Pickup Origin:",
    lblDest: "Destination:",
    lblWeighment: "Weighment Protocol:",
    valWeighment: "Electronic weighbridge slip mandatory at buyer gate.",
    lblSettlement: "Settlement Release:",
    valSettlement: "Direct bank transfer released within 48 hours of weighbridge and quality verification.",
    qrTitle: "Digital QR Code Verification",
    qrSub: "Scan this QR code with any camera to verify trade authenticity on the AgriMandi cloud ledger.",
    lblSellerSign: "Seller Signature (Farmer)",
    lblBuyerSign: "Buyer Signature (Purchaser)",
    footerLegal: "AgriMandi B2B Platform | Team ASIA Core | Maharashtra Agricultural Marketing Compliance | Support: +91 8605168653",
    modalStoredNotice: "A verified copy of this contract is permanently recorded in both Farmer and Buyer accounts.",
    btnClose: "Close",
    defaultFarmerName: "Farmer Partner",
    defaultBuyerName: "Processing Mill / Buyer",
    defaultLocation: "Farm-Gate Origin, Maharashtra",
    defaultContact: "Registered Mobile"
  },
  hi: {
    modalTopTitle: "डिजिटल कृषि उपज क्रय-विक्रय अनुबंध एवं पावती",
    printBtn: "प्रिंट / PDF",
    shareWhatsApp: "व्हाट्सएप",
    brandTitle: "AgriMandi (कृषीसेतू)",
    subTitle: "महाराष्ट्र प्रत्यक्ष फार्म-गेट कृषि उपज क्रय-विक्रय अनुबंध (धारा ३२-ए)",
    tagLegal: "विधिमान्य बाध्यकारी सौदा",
    cessTitle: "०% APMC मंडी शुल्क छूट",
    cessTag: "धारा ३२-ए प्रमाणित",
    cessDesc: "यह सौदा सीधे किसान के खेत (फार्म-गेट) से होने के कारण महाराष्ट्र कृषि उपज विपणन (विकास एवं विनियमन) अधिनियम की धारा ३२-ए के तहत मंडी सेस/शुल्क से पूर्णतः मुक्त है।",
    sellerTitle: "विक्रेता (किसान)",
    tagVerified: "७/१२ सत्यापित",
    lblFarmerName: "नाम:",
    lblContact: "संपर्क:",
    lblAddress: "पता:",
    lblSurvey: "७/१२ खसरा/सर्वे क्र.:",
    buyerTitle: "क्रेता (खरीदार इकाई)",
    tagBuyerLicense: "GST / APMC लाइसेंसधारी",
    lblBuyerName: "कंपनी / नाम:",
    lblDestination: "गंतव्य गेट:",
    lblPaymentStatus: "भुगतान स्थिति:",
    valEscrow: "एस्क्रो में सुरक्षित (१००% एस्क्रो सुरक्षा)",
    lblConfirmation: "पुष्टि:",
    valDigitalSign: "डिजिटल हस्ताक्षर एवं OTP सत्यापित",
    commercialsTitle: "उपज विवरण एवं वित्तीय अनुबंध मूल्य",
    thCrop: "फसल एवं किस्म",
    thGrade: "गुणवत्ता एवं नमी",
    thQty: "मात्रा",
    thPrice: "भाव / क्विंटल",
    thTotal: "कुल मूल्य",
    lblMoisture: "नमी:",
    lblTotalConsideration: "अंतिम कुल अनुबंध राशि:",
    unitQtl: "क्विंटल",
    waybillTitle: "वेबिल एवं परिवहन नियम व शर्तें",
    lblPickup: "उठाव स्थान (फार्म-गेट):",
    lblDest: "डिलिव्हरी गंतव्य:",
    lblWeighment: "वजन नियम:",
    valWeighment: "फैक्ट्री गेट पर इलेक्ट्रॉनिक धर्मकांटा पावती अनिवार्य।",
    lblSettlement: "भुगतान विमुक्ति:",
    valSettlement: "गेट वजन एवं गुणवत्ता परीक्षण के ४८ घंटे के भीतर सीधे बैंक खाते में भुगतान।",
    qrTitle: "डिजिटल क्यूआर कोड सत्यापन",
    qrSub: "इस QR कोड को स्कैन करके सौदे की सत्यता सीधे एग्रीमंडी लेजर पर जांचें।",
    lblSellerSign: "विक्रेता हस्ताक्षर (किसान)",
    lblBuyerSign: "क्रेता हस्ताक्षर (खरीदार)",
    footerLegal: "एग्रीमंडी B2B प्लेटफॉर्म | टीम ASIA Core | महाराष्ट्र कृषि विपणन अनुपालन | सहायता: +91 8605168653",
    modalStoredNotice: "इस अनुबंध की सत्यापित प्रति किसान और खरीदार दोनों के खातों में सुरक्षित दर्ज है।",
    btnClose: "बंद करें",
    defaultFarmerName: "किसान साथी",
    defaultBuyerName: "प्रसंस्करण मिल / खरीदार",
    defaultLocation: "फार्म-गेट, महाराष्ट्र",
    defaultContact: "पंजीकृत मोबाइल"
  },
  mr: {
    modalTopTitle: "डिजिटल शेतीमाल खरेदी-विक्री करार व पावती",
    printBtn: "प्रिंट / PDF",
    shareWhatsApp: "व्हॉट्सॲप",
    brandTitle: "AgriMandi (कृषीसेतू)",
    subTitle: "महाराष्ट्र थेट शेतमाल खरेदी-विक्री ई-करार पावती (कलम ३२-अ)",
    tagLegal: "कायदेशीर सुरक्षित सौदा",
    cessTitle: "०% APMC बाजार उपकर सूट",
    cessTag: "कलम ३२-अ प्रमाणित",
    cessDesc: "हा व्यवहार थेट शेतकरी बांधवांच्या शेतातून (Farm-Gate) होत असल्याने महाराष्ट्र कृषी उत्पन्न पणन (विकास व विनियमन) कायदा, कलम ३२-अ अन्वये मंडी सेस/उपकर पूर्णपणे माफ आहे.",
    sellerTitle: "विक्रेता (शेतकरी)",
    tagVerified: "७/१२ सत्यापित",
    lblFarmerName: "नाव:",
    lblContact: "संपर्क:",
    lblAddress: "पत्ता:",
    lblSurvey: "सातबारा गट/सर्व्हे क्र.:",
    buyerTitle: "खरेदीदार कंपनी / मिल",
    tagBuyerLicense: "GST / APMC परवानाधारक",
    lblBuyerName: "कंपनी / नाव:",
    lblDestination: "गंतव्य गेट:",
    lblPaymentStatus: "पेमेंट स्थिती:",
    valEscrow: "एस्क्रो मध्ये सुरक्षित (१००% एस्क्रो हमी)",
    lblConfirmation: "कन्फर्मेशन:",
    valDigitalSign: "डिजिटल स्वाक्षरी व स्वीकृती पूर्ण",
    commercialsTitle: "शेतीमाल तपशील व सौदा मूल्य",
    thCrop: "पिक व वाण",
    thGrade: "गुणवत्ता / आर्द्रता",
    thQty: "प्रमाण",
    thPrice: "दर / क्विंटल",
    thTotal: "एकूण मूल्य",
    lblMoisture: "आर्द्रता:",
    lblTotalConsideration: "अंतिम सौदा मूल्य:",
    unitQtl: "क्विंटल",
    waybillTitle: "वाहतूक व गेट डिलिव्हरी अटी",
    lblPickup: "पिकअप उगमस्थान:",
    lblDest: "पोहोच ठिकाण:",
    lblWeighment: "वजन पडताळणी:",
    valWeighment: "अधिकृत धर्मकाटा (Electronic Weighbridge) पावती बंधनकारक.",
    lblSettlement: "पेमेंट वितरण:",
    valSettlement: "गेट वजन व गुणवत्ता तपासणीनंतर ४८ तासांत थेट बँक जमा.",
    qrTitle: "डिजिटल क्यूआर कोड पडताळणी",
    qrSub: "हा QR कोड स्कॅन करून सौद्याची सत्यता AgriMandi क्लाउड लेजरवर थेट तपासा.",
    lblSellerSign: "विक्रेता स्वाक्षरी (शेतकरी)",
    lblBuyerSign: "खरेदीदार स्वाक्षरी (खरेदीदार)",
    footerLegal: "AgriMandi B2B Platform | Team ASIA Core | महाराष्ट्र कृषी पणन मार्गदर्शक तत्त्वे | सहाय्य: +91 8605168653",
    modalStoredNotice: "सौद्याची पावती शेतकरी व खरेदीदार दोघांच्याही खात्यात सुरक्षित साठवली गेली आहे.",
    btnClose: "बंद करा",
    defaultFarmerName: "शेतकरी बांधव",
    defaultBuyerName: "प्रक्रिया उद्योग / खरेदीदार",
    defaultLocation: "शेत-शिवार, महाराष्ट्र",
    defaultContact: "नोंदणीकृत मोबाईल"
  }
};

export default function DealContractModal({ deal, isOpen, onClose, currentLang = 'mr' }) {
  if (!isOpen || !deal) return null;

  const t = CONTRACT_TRANSLATIONS[currentLang] || CONTRACT_TRANSLATIONS.mr;

  const dealNumber = deal.contract_number || (deal.id?.startsWith('deal-') 
    ? `AGM-${deal.id.replace('deal-', '')}` 
    : (deal.id || 'AGM-DEAL-001'));

  const locale = currentLang === 'en' ? 'en-IN' : currentLang === 'hi' ? 'hi-IN' : 'mr-IN';
  const formattedDate = deal.created_at 
    ? new Date(deal.created_at).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString(locale);

  const totalValue = Number(deal.total_deal_value || (deal.price_per_qtl * deal.quantity_qtl) || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🌾 *AgriMandi B2B Trade Contract*\n` +
      `📄 Deal ID: ${dealNumber}\n` +
      `👨‍🌾 ${t.sellerTitle}: ${deal.farmer_name || t.defaultFarmerName}\n` +
      `🏢 ${t.buyerTitle}: ${deal.buyer_name || t.defaultBuyerName}\n` +
      `🌾 ${t.thCrop}: ${deal.crop} (${deal.variety || 'FAQ'})\n` +
      `⚖️ ${t.thQty}: ${deal.quantity_qtl} ${t.unitQtl}\n` +
      `💰 ${t.thPrice}: ₹${deal.price_per_qtl}/${currentLang === 'en' ? 'Qtl' : 'क्विंटल'}\n` +
      `💵 ${t.thTotal}: ₹${totalValue.toLocaleString()}\n` +
      `📍 ${t.lblDest}: ${deal.delivery_destination || 'Processing Facility'}\n` +
      `✅ ${t.valEscrow}: ₹${totalValue.toLocaleString()}\n` +
      `🔗 https://agrimandi.asiacore.in/verify/deal/${deal.id}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const farmerName = deal.farmer_name || t.defaultFarmerName;
  const buyerName = deal.buyer_name || t.defaultBuyerName;
  const farmerContact = deal.farmer_phone ? `+91 ${deal.farmer_phone}` : t.defaultContact;
  const farmAddress = deal.farm_address || (deal.district ? `${deal.taluka ? deal.taluka + ', ' : ''}${deal.district}` : t.defaultLocation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Printable CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-deal-contract, #printable-deal-contract * {
            visibility: visible !important;
          }
          #printable-deal-contract {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-shadow: none !important;
            border: 1px solid #999 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E5DFD4] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-[#1B4332] px-6 py-4 flex items-center justify-between text-white shrink-0 border-b border-[#2D6A4F]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#DE7C4A]" />
            <h3 className="text-sm sm:text-base font-bold font-heading">
              {t.modalTopTitle}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#C86432] hover:bg-[#A74D20] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={t.printBtn}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={t.shareWhatsApp}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.shareWhatsApp}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Contract Area */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6">
          <div id="printable-deal-contract" className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DFD4] shadow-xs space-y-6">
            
            {/* Header with Logo, Deal ID & Legal Notice */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#1B4332]">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/AgriMandi Logo without background.png" 
                  alt="AgriMandi" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332] leading-tight">
                    {t.brandTitle}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-stone-600 font-medium">
                    {t.subTitle}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t.tagLegal}</span>
                </div>
                <p className="text-xs font-mono font-bold text-stone-900 mt-1">
                  ID: <span className="text-[#C86432]">{dealNumber}</span>
                </p>
                <p className="text-[11px] text-stone-500 flex items-center gap-1 sm:justify-end mt-0.5">
                  <Calendar className="w-3 h-3" /> {formattedDate}
                </p>
              </div>
            </div>

            {/* Statutory Mandi Cess Exemption Banner */}
            <div className="bg-[#FAF7F2] border border-[#E5DFD4] rounded-xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-800 space-y-0.5">
                <div className="font-bold text-[#1B4332] flex items-center gap-2">
                  <span>{t.cessTitle}</span>
                  <span className="text-[10px] px-2 py-0.2 bg-[#DE7C4A]/20 text-[#C86432] rounded font-bold">
                    {t.cessTag}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {t.cessDesc}
                </p>
              </div>
            </div>

            {/* Parties: Farmer (Seller) vs Buyer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seller / Farmer */}
              <div className="p-4 rounded-xl bg-[#FCFAF6] border border-[#E5DFD4] space-y-2">
                <div className="flex items-center justify-between border-b border-[#E5DFD4] pb-2">
                  <span className="text-xs font-bold font-heading text-[#1B4332] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C86432]" />
                    {t.sellerTitle}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {t.tagVerified}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-stone-700">
                  <p><strong className="text-stone-900">{t.lblFarmerName}</strong> {farmerName}</p>
                  <p><strong className="text-stone-900">{t.lblContact}</strong> {farmerContact}</p>
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span><strong>{t.lblAddress}</strong> {farmAddress}</span>
                  </p>
                  {deal.saat_bara_number && (
                    <p><strong className="text-stone-900">{t.lblSurvey}</strong> {deal.saat_bara_number}</p>
                  )}
                </div>
              </div>

              {/* Buyer / Processing Mill */}
              <div className="p-4 rounded-xl bg-[#FCFAF6] border border-[#E5DFD4] space-y-2">
                <div className="flex items-center justify-between border-b border-[#E5DFD4] pb-2">
                  <span className="text-xs font-bold font-heading text-[#1B4332] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    {t.buyerTitle}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                    {t.tagBuyerLicense}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-stone-700">
                  <p><strong className="text-stone-900">{t.lblBuyerName}</strong> {buyerName}</p>
                  <p><strong className="text-stone-900">{t.lblDestination}</strong> {deal.delivery_destination || t.defaultLocation}</p>
                  <p><strong className="text-stone-900">{t.lblPaymentStatus}</strong> <span className="text-emerald-700 font-bold">{t.valEscrow}</span></p>
                  <p><strong className="text-stone-900">{t.lblConfirmation}</strong> {t.valDigitalSign}</p>
                </div>
              </div>
            </div>

            {/* Produce Specifications & Commercials Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#C86432]" />
                {t.commercialsTitle}
              </h4>
              <div className="overflow-x-auto rounded-xl border border-[#E5DFD4]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#1B4332] text-white">
                    <tr>
                      <th className="p-2.5 sm:p-3">{t.thCrop}</th>
                      <th className="p-2.5 sm:p-3">{t.thGrade}</th>
                      <th className="p-2.5 sm:p-3 text-right">{t.thQty}</th>
                      <th className="p-2.5 sm:p-3 text-right">{t.thPrice}</th>
                      <th className="p-2.5 sm:p-3 text-right">{t.thTotal}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD4] bg-white">
                    <tr>
                      <td className="p-3 font-bold text-stone-900">
                        {deal.crop} <span className="text-stone-500 font-normal">({deal.variety || 'FAQ'})</span>
                      </td>
                      <td className="p-3 text-stone-700">
                        <span className="font-semibold text-stone-800">{deal.quality_grade || 'FAQ (Grade A)'}</span>
                        {deal.moisture_percentage !== undefined && (
                          <span className="block text-[11px] text-stone-500">{t.lblMoisture} {deal.moisture_percentage}%</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-stone-900">
                        {deal.quantity_qtl} {t.unitQtl}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#1B4332]">
                        ₹{Number(deal.price_per_qtl).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-base text-[#C86432]">
                        ₹{totalValue.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#FAF7F2] font-bold border-t border-[#E5DFD4]">
                    <tr>
                      <td colSpan="4" className="p-3 text-right text-stone-700 uppercase tracking-wider text-[11px]">
                        {t.lblTotalConsideration}
                      </td>
                      <td className="p-3 text-right font-mono text-lg text-[#1B4332]">
                        ₹{totalValue.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Logistics & Delivery Waybill Section */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
              <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C86432]" />
                {t.waybillTitle}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                <div>
                  <p className="text-[11px] text-stone-500">{t.lblPickup}</p>
                  <p className="font-semibold text-stone-900">{farmAddress}</p>
                </div>
                <div>
                  <p className="text-[11px] text-stone-500">{t.lblDest}</p>
                  <p className="font-semibold text-stone-900">{deal.delivery_destination || t.defaultLocation}</p>
                </div>
                <div>
                  <p className="text-[11px] text-stone-500">{t.lblWeighment}</p>
                  <p className="font-medium text-stone-800">{t.valWeighment}</p>
                </div>
                <div>
                  <p className="text-[11px] text-stone-500">{t.lblSettlement}</p>
                  <p className="font-medium text-emerald-800">{t.valSettlement}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: QR Code & Verification Signatures */}
            <div className="pt-4 border-t border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* QR Code Verification */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-[#E5DFD4] rounded-xl shadow-2xs">
                  <QRCodeSVG 
                    value={`https://agrimandi.asiacore.in/verify/deal/${deal.id}`}
                    size={72}
                    level="M"
                    fgColor="#1B4332"
                  />
                </div>
                <div className="text-left text-xs">
                  <p className="font-bold text-[#1B4332] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {t.qrTitle}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {t.qrSub}
                  </p>
                  <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                    Hash: {deal.id?.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Digital Signatures Box */}
              <div className="flex items-center gap-6 text-center text-xs">
                <div className="space-y-1">
                  <div className="w-28 h-9 border-b border-dashed border-stone-400 flex items-center justify-center">
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> VERIFIED OTP
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 block">{t.lblSellerSign}</span>
                </div>
                <div className="space-y-1">
                  <div className="w-28 h-9 border-b border-dashed border-stone-400 flex items-center justify-center">
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> DIGITAL CONSENT
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 block">{t.lblBuyerSign}</span>
                </div>
              </div>
            </div>

            {/* Official Legal Footer */}
            <div className="text-[10px] text-stone-500 pt-2 border-t border-stone-200 text-center">
              {t.footerLegal}
            </div>

          </div>
        </div>

        {/* Bottom Modal Actions (Hidden in Print) */}
        <div className="no-print p-4 bg-[#FCFAF6] border-t border-[#E5DFD4] flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            {t.modalStoredNotice}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t.btnClose}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
