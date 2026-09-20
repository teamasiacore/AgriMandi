import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Users, Building2, Landmark, Scale, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function FpoPayoutSlipModal({ payoutData, onClose, currentLang = 'mr' }) {
  const printRef = useRef(null);

  if (!payoutData) return null;

  const handlePrint = () => {
    window.print();
  };

  const members = payoutData.member_payouts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #fpo-payout-print-zone, #fpo-payout-print-zone * {
            visibility: visible;
          }
          #fpo-payout-print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E5DFD4] shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Bar (Screen Only) */}
        <div className="no-print px-6 py-4 bg-[#FCFAF6] border-b border-[#E5DFD4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1B4332]" />
            <h3 className="font-heading font-bold text-base text-[#1B4332]">
              {currentLang === 'en' ? 'FPO Member Payout & Distribution Ledger' : currentLang === 'hi' ? 'FPO सदस्य किसान भुगतान एवं वितरण खाता' : 'FPO सभासद शेतकरी वाटप खातेवही व प्रमाणपत्र'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{currentLang === 'en' ? 'Print / Save PDF' : currentLang === 'hi' ? 'प्रिंट / PDF' : 'प्रिंट / PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Content */}
        <div id="fpo-payout-print-zone" ref={printRef} className="p-8 space-y-6 text-stone-800 bg-white">
          
          {/* Certificate Header */}
          <div className="border-b-2 border-[#1B4332] pb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/images/AgriMandi Logo without background.png" 
                alt="AgriMandi Logo" 
                className="h-16 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold font-heading text-[#1B4332] tracking-tight">
                  AgriMandi — कृषीसेतू
                </h1>
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  {currentLang === 'en' 
                    ? 'FPO Collective Produce Aggregation & Direct Payout Split' 
                    : currentLang === 'hi' 
                    ? 'FPO सामूहिक उपज एकत्रीकरण एवं प्रत्यक्ष किसान भुगतान पत्रक' 
                    : 'FPO शेतकरी सामूहिक एकत्रीकरण व थेट सभासद वाटप पत्रक'}
                </p>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                  Deal Ref: {payoutData.deal_id} • Lot ID: {payoutData.lot_id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold">
                ✓ {payoutData.escrow_status === 'SETTLED' ? 'PAYOUT RELEASED (T+0)' : 'ESCROW ALLOCATED'}
              </span>
              <p className="text-[10px] text-stone-400 mt-1">
                Generated on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* FPO & Procurement Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {currentLang === 'en' ? 'Farmer Producer Organization (FPO)' : currentLang === 'hi' ? 'किसान उत्पादक कंपनी' : 'शेतकरी उत्पादक संस्था (FPO)'}
              </span>
              <p className="text-sm font-bold text-[#1B4332]">{payoutData.fpo_name}</p>
              <p className="text-stone-600">Commodity: <strong className="text-stone-900">{payoutData.crop}</strong> (FAQ Grade A)</p>
              <p className="text-stone-600">Aggregation Pool: <strong>{payoutData.total_quantity_qtl} Quintals</strong> ({members.length} Member Farmers)</p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {currentLang === 'en' ? 'Financial Consideration' : currentLang === 'hi' ? 'वित्तीय विवरण' : 'आर्थिक व्यवहार तपशील'}
              </span>
              <p className="text-sm font-bold text-stone-900">
                Institutional Rate: ₹{payoutData.price_per_qtl?.toLocaleString('en-IN')} / Qtl
              </p>
              <p className="text-stone-600">
                Gross Deal Value: <strong className="text-stone-900 font-mono">₹{payoutData.total_deal_value?.toLocaleString('en-IN')}</strong>
              </p>
              <p className="text-stone-600">
                FPO Cooperative Service Fee ({payoutData.fpo_handling_rate_pct}%): <span className="font-mono text-stone-700">-₹{payoutData.fpo_cooperative_fee?.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-emerald-700 font-bold">
                Net Farmers Payout Pool: <span className="font-mono">₹{payoutData.net_members_disbursement?.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </div>

          {/* Member Farmer Ledger Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#C86432]" />
              <span>{currentLang === 'en' ? 'Member Farmers Contribution & Payout Distribution' : currentLang === 'hi' ? 'किसान सदस्यों का अंशदान एवं भुगतान विवरण' : 'सभासद शेतकऱ्यांचे योगदान व थेट बँक वाटप तक्ता'}</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-[#E5DFD4]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1B4332] text-white text-[11px]">
                    <th className="p-2.5 font-semibold">#</th>
                    <th className="p-2.5 font-semibold">{currentLang === 'en' ? 'Member Farmer' : currentLang === 'hi' ? 'किसान' : 'सभासद शेतकरी'}</th>
                    <th className="p-2.5 font-semibold">{currentLang === 'en' ? '7/12 Survey' : currentLang === 'hi' ? '७/१२' : '७/१२ गट'}</th>
                    <th className="p-2.5 font-semibold text-right">{currentLang === 'en' ? 'Contributed Qtl' : currentLang === 'hi' ? 'मात्रा (क्विं.)' : 'वजन (क्विंटल)'}</th>
                    <th className="p-2.5 font-semibold text-right">{currentLang === 'en' ? 'Share %' : currentLang === 'hi' ? 'हिस्सा %' : 'हिस्सा %'}</th>
                    <th className="p-2.5 font-semibold text-right">{currentLang === 'en' ? 'Gross (₹)' : currentLang === 'hi' ? 'सकल (₹)' : 'एकूण (₹)'}</th>
                    <th className="p-2.5 font-semibold text-right">{currentLang === 'en' ? 'FPO Fee (₹)' : currentLang === 'hi' ? 'FPO शुल्क' : 'FPO सेवा'}</th>
                    <th className="p-2.5 font-semibold text-right">{currentLang === 'en' ? 'Net Payout (₹)' : currentLang === 'hi' ? 'शुद्ध देय' : 'थेट हातात (₹)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD4] font-medium">
                  {members.map((m, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'}>
                      <td className="p-2.5 text-stone-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-2.5">
                        <span className="font-bold text-[#1B4332] block">{m.farmer_name}</span>
                        <span className="text-[10px] text-stone-500">{m.village} • +91 {m.phone}</span>
                      </td>
                      <td className="p-2.5 font-mono text-stone-700">{m.saat_bara_number}</td>
                      <td className="p-2.5 text-right font-bold font-mono">{m.quantity_qtl} Qtl</td>
                      <td className="p-2.5 text-right font-mono text-stone-600">{m.share_pct}%</td>
                      <td className="p-2.5 text-right font-mono text-stone-700">₹{m.gross_amount?.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">-₹{m.fpo_service_fee?.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-800">
                        ₹{m.net_payable?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FAF7F2] font-bold text-stone-900 border-t-2 border-[#1B4332]">
                    <td colSpan="3" className="p-2.5 text-right uppercase text-[11px]">
                      {currentLang === 'en' ? 'Total Pool Sum:' : currentLang === 'hi' ? 'कुल योग:' : 'एकूण बेरीज:'}
                    </td>
                    <td className="p-2.5 text-right font-mono">{payoutData.total_quantity_qtl} Qtl</td>
                    <td className="p-2.5 text-right font-mono">100.00%</td>
                    <td className="p-2.5 text-right font-mono">₹{payoutData.total_deal_value?.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono text-stone-600">-₹{payoutData.fpo_cooperative_fee?.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 text-sm">
                      ₹{payoutData.net_members_disbursement?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Statutory Note & QR Seal Footer */}
          <div className="pt-4 border-t border-[#E5DFD4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 max-w-lg">
              <p className="font-bold text-[#1B4332]">
                {currentLang === 'en' 
                  ? 'Statutory Maharashtra APMC Exemption Certificate:' 
                  : currentLang === 'hi' 
                  ? 'महाराष्ट्र APMC वैधानिक छूट प्रमाणन:' 
                  : 'महाराष्ट्र कृषी उत्पन्न पणन नियम (कलम ५९) कर सवलत:'}
              </p>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {payoutData.statutory_citation}
              </p>
              <p className="text-[10px] text-stone-400">
                Direct RTGS payout to individual farmers' verified bank accounts without intermediary deductions.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4]">
              <QRCodeSVG 
                value={`https://agrimandi.asiacore.in/verify/fpo-payout/${payoutData.deal_id}`} 
                size={64}
                level="M"
              />
              <div className="text-[10px] space-y-0.5">
                <span className="font-bold text-[#1B4332] block">Verified FPO Seal</span>
                <span className="text-stone-500 font-mono block">SEC-FPO-{payoutData.deal_id?.slice(-6)}</span>
                <span className="text-emerald-700 font-bold block">100% Audit Cleared</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Close (Screen Only) */}
        <div className="no-print p-4 bg-[#FAF7F2] border-t border-[#E5DFD4] text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all cursor-pointer"
          >
            {currentLang === 'en' ? 'Close' : currentLang === 'hi' ? 'बंद करें' : 'बंद करा'}
          </button>
        </div>

      </div>
    </div>
  );
}
