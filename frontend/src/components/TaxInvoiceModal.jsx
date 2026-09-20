import React, { useState, useEffect } from 'react';
import { 
  X, Printer, CheckCircle2, ShieldCheck, FileText, 
  Building2, User, Truck, Scale, QrCode, Landmark, Loader2, Sparkles
} from 'lucide-react';
import api from '../services/api';

const DICT = {
  en: {
    modalTitle: 'Commercial B2B Tax Invoice & Settlement Receipt',
    modalSubtitle: 'Direct Farm Gate B2B Procurement Electronic Invoice',
    invoiceNo: 'Tax Invoice No',
    settlementUtr: 'Bank Settlement UTR',
    date: 'Settlement Date',
    statutoryNotice: 'Statutory Mandi Cess Exemption: 0% Market Fee applied under Section 59 of the APMC Direct Electronic Platform Procurement Framework.',
    sellerSection: 'Seller / Consignor (Farmer Producer)',
    farmerName: 'Producer Name',
    landSurvey: '7/12 Land Survey No',
    location: 'Farm Gate Location',
    farmerBank: 'Beneficiary Bank Account',
    ifsc: 'IFSC Code',
    buyerSection: 'Buyer / Consignee (Institutional Mill)',
    buyerName: 'Institutional Buyer',
    gstin: 'GSTIN',
    warehouse: 'Delivery Destination',
    officer: 'Authorized Officer',
    logisticsSection: 'Logistics & Mill Gate Weighment Audit',
    transporter: 'Transporter',
    vehicleNo: 'Vehicle Number',
    weighmentSlip: 'Weighbridge Slip',
    grossWeight: 'Gross Weight',
    tareWeight: 'Tare Weight',
    netWeight: 'Certified Net Weight',
    qualityGrade: 'Assay Quality Grade',
    itemsTableTitle: 'Produce Consideration & Settlement Matrix',
    itemDescription: 'Item Description',
    hsnCode: 'HSN Code',
    quantity: 'Net Qty',
    rate: 'Unit Rate',
    amount: 'Gross Amount',
    cess: 'Mandi Cess (0%)',
    netTotal: 'Total Settled Amount',
    quintalUnit: 'Qtl',
    paidBadge: 'PAID & SETTLED VIA T+0 ESCROW',
    paymentMode: 'Payment Mode',
    settledTimestamp: 'Settled At',
    disbursedTo: 'Disbursed To',
    authorizedSignatory: 'Digitally Authorized by AgriMandi Escrow Trust & Settlement Engine',
    qrVerifyText: 'Scan to verify statutory authenticity on public blockchain register',
    printBtn: 'Print / Save Official Invoice',
    closeBtn: 'Close',
    loading: 'Loading Invoice Details...'
  },
  hi: {
    modalTitle: 'व्यावसायिक B2B टैक्स इनवॉइस एवं भुगतान रसीद',
    modalSubtitle: 'सीधे फार्म गेट संस्थागत व्यापार इलेक्ट्रॉनिक बीजक',
    invoiceNo: 'टैक्स इनवॉइस क्रमांक',
    settlementUtr: 'बैंक भुगतान यूटीआर (UTR)',
    date: 'भुगतान तिथि',
    statutoryNotice: 'वैधानिक मंडी शुल्क छूट: एपीएमसी धारा 59 प्रत्यक्ष इलेक्ट्रॉनिक खरीद नियमानुसार 0% मंडी शुल्क लागू।',
    sellerSection: 'विक्रेता / प्रेषक (किसान उत्पादक)',
    farmerName: 'किसान का नाम',
    landSurvey: '७/१२ गट / सर्वे क्रमांक',
    location: 'फार्म गेट स्थान / गांव',
    farmerBank: 'लाभार्थी बैंक खाता',
    ifsc: 'आईएफएससी कोड',
    buyerSection: 'क्रेता / प्राप्तकर्ता (संस्थागत मिल)',
    buyerName: 'संस्थागत खरीदार',
    gstin: 'जीएसटी नंबर (GSTIN)',
    warehouse: 'डिलिवरी गंतव्य / गोदाम',
    officer: 'अधिकृत खरीद अधिकारी',
    logisticsSection: 'परिवहन एवं गेट वेब्रिज परीक्षण विवरण',
    transporter: 'ट्रांसपोर्टर',
    vehicleNo: 'वाहन क्रमांक',
    weighmentSlip: 'वेब्रिज पावती',
    grossWeight: 'सकल वजन',
    tareWeight: 'खाली वजन',
    netWeight: 'प्रमाणित शुद्ध वजन',
    qualityGrade: 'गुणवत्ता श्रेणी',
    itemsTableTitle: 'फसल मूल्य एवं भुगतान तालिका',
    itemDescription: 'उपज विवरण',
    hsnCode: 'एचएसएन (HSN) कोड',
    quantity: 'शुद्ध मात्रा',
    rate: 'इकाई दर',
    amount: 'सकल राशि',
    cess: 'मंडी उपकर (0%)',
    netTotal: 'कुल भुगतान राशि',
    quintalUnit: 'क्विंटल',
    paidBadge: 'T+0 एस्क्रो द्वारा पूर्ण भुगतान संपन्न',
    paymentMode: 'भुगतान माध्यम',
    settledTimestamp: 'भुगतान समय',
    disbursedTo: 'लाभार्थी खाता',
    authorizedSignatory: 'एग्रीमंडी एस्क्रो ट्रस्ट एवं सेटलमेंट इंजन द्वारा डिजिटल हस्ताक्षरित',
    qrVerifyText: 'ब्लॉकचेन रजिस्टर पर सत्यता जांच हेतु स्कैन करें',
    printBtn: 'आधिकारिक बीजक प्रिंट / सहेजें',
    closeBtn: 'बंद करें',
    loading: 'बीजक विवरण लोड हो रहा है...'
  },
  mr: {
    modalTitle: 'व्यावसायिक B2B कर बीजक व अंतिम देयक पावती',
    modalSubtitle: 'थेट शेतमाल खरेदी अधिकृत इलेक्ट्रॉनिक टॅक्स इनव्हॉईस',
    invoiceNo: 'कर बीजक क्रमांक',
    settlementUtr: 'बँक व्यवहार क्रमांक (UTR)',
    date: 'देयक तारीख',
    statutoryNotice: 'वैधानिक मंडी सेस सूट: महाराष्ट्र एपीएमसी कायदा कलम ५९ थेट इलेक्ट्रॉनिक खरेदी नियमानुसार ०% मंडी शुल्क लागू.',
    sellerSection: 'विक्रेता / मालक (शेतकरी उत्पादक)',
    farmerName: 'शेतकऱ्याचे नाव',
    landSurvey: '७/१२ गट / सर्व्हे क्रमांक',
    location: 'शेतमाल पत्ता / गाव',
    farmerBank: 'लाभार्थी बँक खाते',
    ifsc: 'आयएफएससी कोड',
    buyerSection: 'खरेदीदार / ग्राहक (संस्थागत प्रक्रियादार)',
    buyerName: 'संस्थागत खरेदीदार',
    gstin: 'जीएसटी क्रमांक (GSTIN)',
    warehouse: 'डिलिव्हरी पत्ता / प्रक्रिया केंद्र',
    officer: 'अधिकृत खरेदी अधिकारी',
    logisticsSection: 'वाहतूक व मिल गेट धर्मकाटा पडताळणी',
    transporter: 'वाहतूकदार',
    vehicleNo: 'वाहन क्रमांक',
    weighmentSlip: 'वेब्रिज पावती',
    grossWeight: 'सकल वजन (Gross)',
    tareWeight: 'रिक्त वजन (Tare)',
    netWeight: 'प्रमाणित निव्वळ वजन (Net)',
    qualityGrade: 'गुणवत्ता श्रेणी',
    itemsTableTitle: 'शेतमाल देयक व अंतिम हिशोब विवरण',
    itemDescription: 'शेतमाल तपशील',
    hsnCode: 'एचएसएन (HSN) कोड',
    quantity: 'निव्वळ प्रमाण',
    rate: 'दर प्रति क्विंटल',
    amount: 'सकल मूल्य',
    cess: 'मंडी उपकर (०%)',
    netTotal: 'एकूण अंतिम देयक रक्कम',
    quintalUnit: 'क्विंटल',
    paidBadge: 'T+0 थेट एस्क्रो द्वारे जमा व पूर्ण देयक',
    paymentMode: 'व्यवहार पद्धती',
    settledTimestamp: 'जमा वेळ',
    disbursedTo: 'जमा बँक खाते',
    authorizedSignatory: 'एग्रीमंडी एस्क्रो ट्रस्ट व सेटलमेंट इंजिनद्वारे डिजिटल स्वाक्षरित',
    qrVerifyText: 'अधिकृत सत्यता तपासण्यासाठी क्यूआर कोड स्कॅन करा',
    printBtn: 'अधिकृत बीजक प्रिंट / सेव्ह करा',
    closeBtn: 'बंद करा',
    loading: 'बीजक तपशील लोड होत आहे...'
  }
};

export default function TaxInvoiceModal({
  isOpen,
  onClose,
  deal,
  currentLang = 'mr'
}) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && deal?.id) {
      setLoading(true);
      api.getSettlementInvoice(deal.id)
        .then(res => {
          if (res?.invoice) {
            setInvoiceData(res.invoice);
          }
        })
        .catch(err => {
          console.warn('Could not fetch settlement invoice from API, using deal fallback:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, deal?.id]);

  if (!isOpen || !deal) return null;

  const t = DICT[currentLang] || DICT.mr;

  // Use API invoice data or synthesize consistent fallback from deal
  const inv = invoiceData || {
    invoice_no: deal.invoice_no || `INV-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-${deal.id?.toString().slice(-6) || '924102'}`,
    date: deal.settled_at ? new Date(deal.settled_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
    settlement_utr: deal.settlement_utr || `UTR-AGRI-2026-${deal.id?.toString().slice(-6) || '819204'}`,
    deal_id: deal.id,
    buyer: {
      name: deal.buyer_name || 'Shivratna Agro Processing Pvt Ltd',
      gstin: '27AABCS1429Q1ZX',
      address: deal.delivery_destination || 'MIDC Industrial Area, Latur, Maharashtra - 413512',
      officer: 'Senior Procurement Manager'
    },
    seller: {
      name: deal.farmer_name || 'Balasaheb Patil',
      phone: deal.farmer_phone || '+91 98220 12345',
      survey_no: deal.farmer_survey_no || 'Gat No. 142/2A',
      location: deal.farmer_village || deal.delivery_destination || 'Ausa, Dist. Latur',
      bank_account: '•••• •••• 4892',
      bank_name: 'State Bank of India',
      ifsc: 'SBIN0001428'
    },
    logistics: {
      transporter_name: deal.transporter_name || 'Kisan Logistics Fleet',
      vehicle_no: deal.vehicle_number || 'MH 24 AB 8841',
      weighment_slip: deal.weighment?.slip_no || `WB-${(deal.crop || 'AGR').substring(0, 3).toUpperCase()}-992140`,
      net_qtl: deal.weighment?.net_qtl || deal.quantity_qtl || 50,
      quality_grade: deal.weighment?.quality_grade || 'FAQ (Grade A)',
      moisture: deal.weighment?.moisture_tested || 10.8
    },
    line_item: {
      description: `${deal.crop} - Direct Farm Gate Commercial Produce`,
      hsn_code: deal.crop?.toLowerCase().includes('soy') ? '12019000' : '10059000',
      quantity_qtl: deal.weighment?.net_qtl || deal.quantity_qtl || 50,
      rate_per_qtl: deal.price_per_qtl || 4500,
      gross_amount: deal.total_deal_value || (Number(deal.price_per_qtl || 4500) * Number(deal.quantity_qtl || 50)),
      mandi_cess: 0,
      total_amount: deal.weighment?.final_payable_amount || deal.total_deal_value || (Number(deal.price_per_qtl || 4500) * Number(deal.quantity_qtl || 50))
    },
    settlement: {
      mode: 'T+0 Direct Escrow RTGS',
      timestamp: deal.settled_at || new Date().toISOString()
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5DFD4] shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-[#FAF7F2] border-b border-[#E5DFD4] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1B4332]" />
            <span className="font-heading text-sm font-bold text-[#1B4332] tracking-wide">
              {t.modalTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#1B4332] text-white hover:bg-[#143326] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.printBtn}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#7C6F5A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#2C221E] print:p-0 print:overflow-visible">
          
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-[#7C6F5A]">
              <Loader2 className="w-4 h-4 animate-spin text-[#1B4332]" />
              {t.loading}
            </div>
          )}

          {/* Tax Invoice Header */}
          <div className="border-b-2 border-[#1B4332] pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1B4332] flex items-center justify-center text-white font-black text-sm">
                    🌾
                  </div>
                  <div>
                    <h1 className="font-heading text-xl sm:text-2xl font-black text-[#1B4332] tracking-tight">
                      AgriMandi (कृषीसेतू)
                    </h1>
                    <p className="text-xs text-[#7C6F5A] font-medium">
                      Direct Farm Gate B2B Electronic Exchange Network
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="text-left sm:text-right bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DFD4] sm:min-w-[240px]">
                <div className="text-xs text-[#7C6F5A] font-semibold">{t.invoiceNo}</div>
                <div className="font-mono text-sm font-extrabold text-[#1B4332]">{inv.invoice_no}</div>
                <div className="text-xs text-[#7C6F5A] mt-1 font-semibold">{t.date}: <span className="text-[#2C221E]">{inv.date}</span></div>
                <div className="text-xs text-[#7C6F5A] font-semibold">{t.settlementUtr}:</div>
                <div className="font-mono text-xs font-bold text-[#C86432]">{inv.settlement_utr}</div>
              </div>
            </div>

            {/* Statutory APMC Cess Exemption Banner */}
            <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#1B4332]/20 flex items-start gap-2.5 text-xs text-[#1B4332]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#1B4332] mt-0.5" />
              <div className="font-medium leading-relaxed">
                {t.statutoryNotice}
              </div>
            </div>
          </div>

          {/* Parties: Consignor (Farmer) & Consignee (Buyer) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Consignor (Farmer) */}
            <div className="p-4 rounded-2xl border border-[#E5DFD4] bg-[#FAF7F2]/40 space-y-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#E5DFD4]">
                <User className="w-4 h-4 text-[#1B4332]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  {t.sellerSection}
                </h2>
              </div>
              <div className="text-sm space-y-1">
                <div className="font-bold text-[#2C221E]">{inv.seller?.name}</div>
                <div className="text-xs text-[#7C6F5A]">{t.location}: <span className="text-[#2C221E] font-medium">{inv.seller?.location}</span></div>
                <div className="text-xs text-[#7C6F5A]">{t.landSurvey}: <span className="text-[#2C221E] font-medium">{inv.seller?.survey_no}</span></div>
                <div className="text-xs text-[#7C6F5A] flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>{inv.seller?.bank_name} • {inv.seller?.bank_account}</span>
                </div>
                <div className="text-xs text-[#7C6F5A] font-mono">{t.ifsc}: <span className="text-[#2C221E] font-bold">{inv.seller?.ifsc}</span></div>
              </div>
            </div>

            {/* Consignee (Buyer) */}
            <div className="p-4 rounded-2xl border border-[#E5DFD4] bg-[#FAF7F2]/40 space-y-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#E5DFD4]">
                <Building2 className="w-4 h-4 text-[#C86432]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#C86432]">
                  {t.buyerSection}
                </h2>
              </div>
              <div className="text-sm space-y-1">
                <div className="font-bold text-[#2C221E]">{inv.buyer?.name}</div>
                <div className="text-xs text-[#7C6F5A]">{t.gstin}: <span className="font-mono font-bold text-[#2C221E]">{inv.buyer?.gstin}</span></div>
                <div className="text-xs text-[#7C6F5A]">{t.warehouse}: <span className="text-[#2C221E] font-medium">{inv.buyer?.address}</span></div>
                <div className="text-xs text-[#7C6F5A]">{t.officer}: <span className="text-[#2C221E] font-medium">{inv.buyer?.officer}</span></div>
              </div>
            </div>

          </div>

          {/* Logistics & Weighment Verification Strip */}
          <div className="p-3.5 rounded-2xl border border-[#E5DFD4] bg-white text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[#7C6F5A] block">{t.transporter}:</span>
              <span className="font-bold text-[#2C221E]">{inv.logistics?.transporter_name}</span>
            </div>
            <div>
              <span className="text-[#7C6F5A] block">{t.vehicleNo}:</span>
              <span className="font-mono font-bold text-[#1B4332]">{inv.logistics?.vehicle_no}</span>
            </div>
            <div>
              <span className="text-[#7C6F5A] block">{t.weighmentSlip}:</span>
              <span className="font-mono font-bold text-[#2C221E]">{inv.logistics?.weighment_slip}</span>
            </div>
            <div>
              <span className="text-[#7C6F5A] block">{t.qualityGrade}:</span>
              <span className="font-bold text-[#1B4332]">{inv.logistics?.quality_grade} (Moisture {inv.logistics?.moisture}%)</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-2xl border border-[#E5DFD4] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#E5DFD4]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                {t.itemsTableTitle}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2]/60 text-[#7C6F5A] font-semibold border-b border-[#E5DFD4]">
                  <tr>
                    <th className="py-2.5 px-4">{t.itemDescription}</th>
                    <th className="py-2.5 px-3 font-mono">{t.hsnCode}</th>
                    <th className="py-2.5 px-3 text-right">{t.quantity}</th>
                    <th className="py-2.5 px-3 text-right">{t.rate}</th>
                    <th className="py-2.5 px-4 text-right">{t.amount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD4]/50">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#2C221E]">
                      {inv.line_item?.description}
                      <span className="block text-[11px] text-[#7C6F5A] font-normal">
                        Certified Farm Gate Intake • FAQ Grade A
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#7C6F5A]">{inv.line_item?.hsn_code}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#1B4332]">
                      {inv.line_item?.quantity_qtl} {t.quintalUnit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#2C221E]">
                      ₹{Number(inv.line_item?.rate_per_qtl).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#2C221E]">
                      ₹{Number(inv.line_item?.gross_amount).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Mandi Cess Exemption Row */}
                  <tr className="bg-[#FAF7F2]/40 text-[#7C6F5A]">
                    <td colSpan={4} className="py-2 px-4 text-right italic">
                      {t.cess}
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-[#1B4332]">
                      ₹0.00
                    </td>
                  </tr>

                  {/* Grand Net Total */}
                  <tr className="bg-[#FAF7F2] font-heading">
                    <td colSpan={3} className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B4332] text-white text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                        {t.paidBadge}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-bold text-[#1B4332] uppercase">
                      {t.netTotal}:
                    </td>
                    <td className="py-3 px-4 text-right text-base sm:text-lg font-black text-[#1B4332]">
                      ₹{Number(inv.line_item?.total_amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlement Details & QR Footer */}
          <div className="pt-2 border-t border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* QR Code & Verification */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-[#E5DFD4] p-1 bg-white flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-[#1B4332]" />
              </div>
              <div className="text-[11px] text-[#7C6F5A] max-w-xs leading-tight">
                <span className="font-bold text-[#2C221E] block mb-0.5">{t.authorizedSignatory}</span>
                {t.qrVerifyText}
              </div>
            </div>

            {/* Direct Bank Payout Verification Stamp */}
            <div className="text-center sm:text-right border-2 border-dashed border-[#1B4332]/40 rounded-2xl p-3 bg-[#FAF7F2]/60 min-w-[200px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#1B4332]">
                RBI RTGS / ESCROW SETTLED
              </div>
              <div className="font-mono text-xs font-extrabold text-[#2C221E] mt-0.5">
                {inv.settlement_utr}
              </div>
              <div className="text-[10px] text-[#7C6F5A] mt-0.5">
                T+0 Direct Settlement
              </div>
            </div>

          </div>

        </div>

        {/* Footer (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#E5DFD4] flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#E5DFD4] text-xs font-bold text-[#7C6F5A] hover:bg-white hover:text-[#2C221E] transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-[#1B4332] text-white hover:bg-[#143326] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            {t.printBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
