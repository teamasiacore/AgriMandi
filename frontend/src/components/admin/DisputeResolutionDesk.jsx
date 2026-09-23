import React, { useState, useEffect } from 'react';
import { 
  Gavel, Scale, AlertTriangle, CheckCircle2, ShieldAlert, 
  FileText, ExternalLink, RefreshCw, DollarSign, Clock, 
  ChevronRight, Building2, User, Search, Filter, Loader2, ArrowRight
} from 'lucide-react';
import api from '../../services/api';

export default function DisputeResolutionDesk({ currentLang = 'en' }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    ruling: 'MUTUAL_SETTLEMENT',
    resolution_notes: '',
    refund_buyer_amount: 0,
    release_farmer_amount: 0,
    arbitrated_by: 'Maharashtra APMC Direct Trade Arbitral Authority (Latur Bench)'
  });
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.getDisputes();
      if (res && res.disputes) {
        setDisputes(res.disputes);
      }
    } catch (err) {
      console.warn('Error loading disputes from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleOpenResolve = (dispute) => {
    setSelectedDispute(dispute);
    setActionSuccess(null);
    setActionError(null);
    setResolveForm({
      ruling: 'MUTUAL_SETTLEMENT',
      resolution_notes: `Arbitral award pursuant to APMC Section 59 direct purchase inquiry. Disputed sum of ₹${Number(dispute.claim_amount).toLocaleString('en-IN')} reviewed under standard commercial rules.`,
      refund_buyer_amount: 0,
      release_farmer_amount: Number(dispute.claim_amount) || 0,
      arbitrated_by: 'Maharashtra APMC Direct Trade Arbitral Authority (Latur Bench)'
    });
  };

  const handleExecuteRuling = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setIsResolving(true);
    setActionError(null);

    try {
      const res = await api.resolveDispute(selectedDispute.id, {
        ruling: resolveForm.ruling,
        resolution_notes: resolveForm.resolution_notes,
        refund_buyer_amount: Number(resolveForm.refund_buyer_amount) || 0,
        release_farmer_amount: Number(resolveForm.release_farmer_amount) || 0,
        arbitrated_by: resolveForm.arbitrated_by
      });

      setActionSuccess(res.message || 'Arbitral ruling executed successfully!');
      loadDisputes();
      setSelectedDispute(res.dispute || { ...selectedDispute, status: 'RESOLVED_BY_ARBITRATION' });
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to execute arbitral award');
    } finally {
      setIsResolving(false);
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (filterStatus === 'ACTIVE' && d.status !== 'UNDER_ARBITRATION') return false;
    if (filterStatus === 'RESOLVED' && d.status !== 'RESOLVED_BY_ARBITRATION') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCase = d.case_number?.toLowerCase().includes(q);
      const matchCrop = d.crop?.toLowerCase().includes(q);
      const matchFarmer = d.farmer_name?.toLowerCase().includes(q);
      const matchBuyer = d.buyer_name?.toLowerCase().includes(q);
      return matchCase || matchCrop || matchFarmer || matchBuyer;
    }
    return true;
  });

  const totalDisputes = disputes.length;
  const activeDisputes = disputes.filter(d => d.status === 'UNDER_ARBITRATION').length;
  const resolvedDisputes = disputes.filter(d => d.status === 'RESOLVED_BY_ARBITRATION').length;
  const totalFrozenFunds = disputes
    .filter(d => d.status === 'UNDER_ARBITRATION')
    .reduce((acc, curr) => acc + (Number(curr.claim_amount) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#FAF7F2] border border-[#E5DFD4] rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4332] text-[#A3E635] flex items-center gap-1">
                <Gavel className="w-3 h-3" />
                Statutory Arbitral Tribunal
              </span>
              <span className="text-xs text-stone-500 font-mono">APMC Direct Trade Rules (Sec 59)</span>
            </div>
            <h2 className="text-2xl font-heading font-black text-stone-900 tracking-tight flex items-center gap-2">
              APMC Dispute Resolution & Arbitral Authority Desk
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Official dispute adjudication portal for direct farm-to-mill contracts. Review grounds, inspect certified weighbridge & assay telemetry, freeze/unfreeze escrow, and issue statutory arbitral orders.
            </p>
          </div>

          <button
            onClick={loadDisputes}
            className="px-4 py-2 bg-white border border-[#E5DFD4] hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Cases</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-4 bg-white border border-[#E5DFD4] rounded-2xl">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Cases Filed</span>
            <span className="text-2xl font-mono font-black text-stone-900 mt-1 block">{totalDisputes}</span>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Under Arbitration</span>
            <span className="text-2xl font-mono font-black text-amber-950 mt-1 block">{activeDisputes}</span>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Resolved by Award</span>
            <span className="text-2xl font-mono font-black text-emerald-950 mt-1 block">{resolvedDisputes}</span>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">Escrow Funds Frozen</span>
            <span className="text-2xl font-mono font-black text-red-950 mt-1 block">₹{totalFrozenFunds.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Case List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search case #, crop, farmer, buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#E5DFD4] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div className="flex bg-[#E5DFD4]/50 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${filterStatus === 'ALL' ? 'bg-white shadow-2xs text-[#1B4332]' : 'text-stone-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${filterStatus === 'ACTIVE' ? 'bg-amber-600 text-white shadow-2xs' : 'text-stone-600'}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('RESOLVED')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${filterStatus === 'RESOLVED' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-600'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Cases Container */}
          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-[#E5DFD4]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1B4332] mb-2" />
                Loading arbitral disputes...
              </div>
            ) : filteredDisputes.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-[#E5DFD4]">
                <Gavel className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                No dispute cases found matching current filter.
              </div>
            ) : (
              filteredDisputes.map(d => {
                const isSelected = selectedDispute?.id === d.id;
                const isResolved = d.status === 'RESOLVED_BY_ARBITRATION';

                return (
                  <div
                    key={d.id}
                    onClick={() => handleOpenResolve(d)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-emerald-50/50 border-[#1B4332] shadow-sm' 
                        : 'bg-white border-[#E5DFD4] hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-stone-900">{d.case_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isResolved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {isResolved ? 'RESOLVED' : 'IN ARBITRATION'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-stone-900 mb-1 flex items-center justify-between">
                      <span>{d.crop} ({d.variety || 'FAQ'})</span>
                      <span className="font-mono text-[#C86432]">₹{Number(d.claim_amount).toLocaleString('en-IN')}</span>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 mb-2 leading-relaxed">
                      "{d.reason}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-100">
                      <span>Raised by: <strong>{d.raised_by}</strong> ({d.raised_by_role})</span>
                      <span className="font-mono">{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Adjudication Workspace (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDispute ? (
            <div className="bg-white border border-[#E5DFD4] rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#E5DFD4] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4332] text-white">
                      Case #{selectedDispute.case_number}
                    </span>
                    <span className="text-xs text-stone-500">Deal: {selectedDispute.deal_id}</span>
                  </div>
                  <h3 className="text-lg font-heading font-black text-stone-900">
                    {selectedDispute.dispute_type?.replace(/_/g, ' ')}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block uppercase font-bold">Disputed Claim</span>
                  <span className="font-mono font-black text-xl text-[#C86432]">
                    ₹{Number(selectedDispute.claim_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Litigant Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Complainant / Raised By</span>
                  <strong className="text-stone-900 block">{selectedDispute.raised_by}</strong>
                  <span className="text-stone-600 text-[11px]">{selectedDispute.raised_by_role} • {selectedDispute.farmer_phone || selectedDispute.buyer_phone}</span>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Contract Counterparty</span>
                  <strong className="text-stone-900 block">
                    {selectedDispute.raised_by_role === 'FARMER' ? selectedDispute.buyer_name : selectedDispute.farmer_name}
                  </strong>
                  <span className="text-stone-600 text-[11px]">
                    {selectedDispute.raised_by_role === 'FARMER' ? 'BUYER PARTNER' : 'FARMER SELLER'}
                  </span>
                </div>
              </div>

              {/* Statement of Grounds */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">Statement of Dispute Grounds</span>
                <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD4] rounded-2xl text-stone-800 leading-relaxed text-xs">
                  "{selectedDispute.reason}"
                </div>
              </div>

              {/* Evidence Link if any */}
              {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span className="text-stone-800 font-bold">Supporting Evidence / External Lab Link:</span>
                  </div>
                  <a
                    href={selectedDispute.evidence_urls[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1B4332] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Inspect Evidence</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Status or Ruling Form */}
              {selectedDispute.status === 'RESOLVED_BY_ARBITRATION' ? (
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span className="text-sm">Statutory Arbitral Award Enacted</span>
                  </div>
                  <div className="space-y-1 text-emerald-900">
                    <p><strong>Ruling Decree:</strong> {selectedDispute.ruling}</p>
                    <p><strong>Resolution Order:</strong> {selectedDispute.resolution_notes}</p>
                    <p><strong>Refund to Buyer:</strong> ₹{Number(selectedDispute.refund_buyer_amount || 0).toLocaleString('en-IN')}</p>
                    <p><strong>Released to Farmer:</strong> ₹{Number(selectedDispute.release_farmer_amount || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-emerald-800 pt-1">
                      Arbitrated by: <em>{selectedDispute.arbitrated_by}</em> on {new Date(selectedDispute.resolved_at || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleExecuteRuling} className="space-y-4 pt-2 border-t border-[#E5DFD4]">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                    <Gavel className="w-4 h-4 text-[#C86432]" />
                    <span>Issue Official APMC Arbitral Ruling & Release Escrow</span>
                  </div>

                  {actionSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  {actionError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {/* Ruling Choice */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Arbitral Decision / Award
                    </label>
                    <select
                      value={resolveForm.ruling}
                      onChange={(e) => {
                        const r = e.target.value;
                        const claim = Number(selectedDispute.claim_amount) || 0;
                        let ref = 0;
                        let rel = claim;
                        if (r === 'REFUND_TO_BUYER') {
                          ref = claim;
                          rel = 0;
                        } else if (r === 'MUTUAL_SETTLEMENT') {
                          ref = Math.round(claim * 0.1);
                          rel = claim - ref;
                        }
                        setResolveForm({
                          ...resolveForm,
                          ruling: r,
                          refund_buyer_amount: ref,
                          release_farmer_amount: rel
                        });
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-[#E5DFD4] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#1B4332] cursor-pointer"
                    >
                      <option value="MUTUAL_SETTLEMENT">Mutual Settlement (Compromise Resolution)</option>
                      <option value="RELEASE_TO_FARMER">Full Release to Farmer (Claim Dismissed / Produce Accepted)</option>
                      <option value="REFUND_TO_BUYER">Full Refund to Buyer (Produce Rejected / Breach Proven)</option>
                      <option value="SPLIT_SETTLEMENT">Custom Pro-Rata Split Settlement</option>
                    </select>
                  </div>

                  {/* Fund Split Inputs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Refund to Buyer (₹)
                      </label>
                      <input
                        type="number"
                        value={resolveForm.refund_buyer_amount}
                        onChange={(e) => setResolveForm({ ...resolveForm, refund_buyer_amount: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-[#E5DFD4] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                        min="0"
                        max={selectedDispute.claim_amount}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Disburse to Farmer (₹)
                      </label>
                      <input
                        type="number"
                        value={resolveForm.release_farmer_amount}
                        onChange={(e) => setResolveForm({ ...resolveForm, release_farmer_amount: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-[#E5DFD4] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1B4332]"
                        min="0"
                        max={selectedDispute.claim_amount}
                        required
                      />
                    </div>
                  </div>

                  {/* Official Resolution Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Official APMC Arbitral Decree & Order Text
                    </label>
                    <textarea
                      rows="3"
                      value={resolveForm.resolution_notes}
                      onChange={(e) => setResolveForm({ ...resolveForm, resolution_notes: e.target.value })}
                      className="w-full p-3 bg-stone-50 border border-[#E5DFD4] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#1B4332] resize-none"
                      required
                    />
                  </div>

                  {/* Signatory */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Presiding Arbitral Officer / Authority Signature
                    </label>
                    <input
                      type="text"
                      value={resolveForm.arbitrated_by}
                      onChange={(e) => setResolveForm({ ...resolveForm, arbitrated_by: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-[#E5DFD4] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResolving}
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143326] disabled:bg-stone-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    {isResolving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enacting Binding Arbitral Ruling...</span>
                      </>
                    ) : (
                      <>
                        <Gavel className="w-4 h-4 text-[#A3E635]" />
                        <span>Execute Binding Arbitral Award & Settle Escrow</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="h-[450px] bg-white border border-[#E5DFD4] rounded-3xl p-8 flex flex-col items-center justify-center text-center text-stone-500">
              <Scale className="w-12 h-12 text-stone-300 mb-3" />
              <h4 className="font-heading font-bold text-stone-700 text-base">Select a Dispute Case</h4>
              <p className="text-xs text-stone-500 max-w-sm mt-1">
                Choose a case from the tribunal docket on the left to inspect evidence, review grounds, and enact binding legal resolution.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
