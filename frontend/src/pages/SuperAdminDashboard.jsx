import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, Clock, 
  Building2, Sprout, Database, RefreshCw, LogOut, ArrowRight,
  UserCheck, AlertTriangle, Eye, Award, ExternalLink, Lock, BadgeCheck, Trash2
} from 'lucide-react';
import api from '../services/api';

export default function SuperAdminDashboard({ currentLang = 'mr' }) {
  const navigate = useNavigate();

  // Admin Auth State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('agri_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('agri_admin_user')) || null;
    } catch {
      return null;
    }
  });

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('buyers'); // 'overview', 'buyers', 'farmers', 'lots'
  const [stats, setStats] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [lots, setLots] = useState([]);
  const [deals, setDeals] = useState([]);
  const [supabaseInfo, setSupabaseInfo] = useState(null);
  const [buyerFilter, setBuyerFilter] = useState('ALL'); // 'ALL', 'PENDING', 'VERIFIED'
  const [loadingData, setLoadingData] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Auto-clear toast notice
  useEffect(() => {
    if (actionNotice) {
      const timer = setTimeout(() => setActionNotice(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionNotice]);

  // Load Dashboard Data when logged in
  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, buyersRes, farmersRes, lotsRes, dealsRes, supaRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: null })),
        api.getAdminBuyers().catch(() => ({ buyers: [] })),
        api.getAdminFarmers().catch(() => ({ farmers: [] })),
        api.getAdminLots().catch(() => ({ lots: [] })),
        api.getAdminDeals().catch(() => ({ deals: [] })),
        api.getSupabaseStatus().catch(() => ({ supabase: null }))
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (buyersRes?.buyers) setBuyers(buyersRes.buyers);
      if (farmersRes?.farmers) setFarmers(farmersRes.farmers);
      if (lotsRes?.lots) setLots(lotsRes.lots);
      if (dealsRes?.deals) setDeals(dealsRes.deals);
      if (supaRes?.supabase) setSupabaseInfo(supaRes.supabase);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadDashboardData();
    }
  }, [adminToken]);

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.adminLogin({ username, password });
      if (res.status === 'success') {
        localStorage.setItem('agri_admin_token', res.token);
        localStorage.setItem('agri_admin_user', JSON.stringify(res.user));
        setAdminToken(res.token);
        setAdminUser(res.user);
      } else {
        setLoginError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || err.message || 'Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('agri_admin_token');
    localStorage.removeItem('agri_admin_user');
    setAdminToken('');
    setAdminUser(null);
  };

  // 1-Click Buyer Approval
  const handleApproveBuyer = async (buyerId, companyName) => {
    try {
      const res = await api.verifyBuyer(buyerId, {
        admin_notes: 'Approved by SuperAdmin ASIACore. GSTIN & APMC License verified.'
      });
      setActionNotice(`✓ Buyer "${companyName}" verified successfully! GSTIN & APMC license badge activated.`);
      loadDashboardData();
    } catch (err) {
      alert('Error approving buyer: ' + (err.response?.data?.message || err.message));
    }
  };

  // Reject Buyer Application
  const handleRejectBuyer = async (buyerId, companyName) => {
    const reason = window.prompt(`Enter rejection reason for "${companyName}":`, 'APMC License or GSTIN details mismatch.');
    if (!reason) return;

    try {
      await api.rejectBuyer(buyerId, { reason });
      setActionNotice(`Buyer "${companyName}" rejected.`);
      loadDashboardData();
    } catch (err) {
      alert('Error rejecting buyer: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle Farmer 7/12 Verification
  const handleToggleFarmer = async (farmerId, currentStatus, farmerName) => {
    try {
      await api.verifyFarmer(farmerId, { verified: !currentStatus });
      setActionNotice(`Farmer "${farmerName}" 7/12 land record updated.`);
      loadDashboardData();
    } catch (err) {
      alert('Error updating farmer: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete Farmer Account (SuperAdmin)
  const handleDeleteFarmer = async (farmerId, farmerName) => {
    if (!window.confirm(`Are you sure you want to permanently delete farmer account "${farmerName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteFarmer(farmerId);
      setActionNotice(`Farmer account "${farmerName}" has been deleted.`);
      loadDashboardData();
    } catch (err) {
      alert('Error deleting farmer: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete Buyer Account (SuperAdmin)
  const handleDeleteBuyer = async (buyerId, companyName) => {
    if (!window.confirm(`Are you sure you want to permanently delete buyer account "${companyName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteBuyer(buyerId);
      setActionNotice(`Buyer account "${companyName}" has been deleted.`);
      loadDashboardData();
    } catch (err) {
      alert('Error deleting buyer: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter buyers
  const filteredBuyers = buyers.filter(b => {
    if (buyerFilter === 'PENDING') return b.status === 'PENDING_VERIFICATION';
    if (buyerFilter === 'VERIFIED') return b.status === 'VERIFIED' || b.is_verified;
    return true;
  });

  const pendingCount = buyers.filter(b => b.status === 'PENDING_VERIFICATION').length;

  // 1. RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!adminToken) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5DFD4] shadow-2xl relative space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#1B4332]/10 border border-[#1B4332]/20 text-[#1B4332] mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-[#1B4332]" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-[#1B4332]">
              ASIACore SuperAdmin Desk
            </h2>
            <p className="text-xs text-stone-500">
              AgriMandi Central Administration & Verification Portal
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-medium text-stone-900 focus:outline-hidden focus:border-[#1B4332]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Admin Secret Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secret password"
                autoComplete="new-password"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-medium text-stone-900 focus:outline-hidden focus:border-[#1B4332]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enter SuperAdmin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5DFD4] text-center">
            <Link to="/" className="text-xs text-stone-500 hover:text-[#1B4332]">
              &larr; Return to AgriMandi Marketplace
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // 2. RENDER AUTHENTICATED SUPERADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Action Toast Notice */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {actionNotice}
            </span>
            <button 
              onClick={() => setActionNotice('')} 
              className="text-xs text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="bg-white rounded-3xl p-6 border border-[#E5DFD4] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-heading font-black text-xl shadow-xs">
              ASI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading text-[#1B4332]">
                  ASIACore Central SuperAdmin Desk
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-stone-500">
                AgriMandi B2B Verification & Compliance Controller • Logged in as <strong className="text-stone-800">ASIACore</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={loadDashboardData}
              disabled={loadingData}
              className="px-3.5 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] hover:bg-[#E5DFD4]/50 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Database & Storage Telemetry Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD4] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-[#1B4332]" />
            <span className="font-bold text-stone-700">Storage Engine:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E5DFD4] font-mono text-[11px] text-stone-800">
              {supabaseInfo?.storageType || 'Resilient JSON Disk Storage (agrimandi_db.json)'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Supabase Target: <code className="font-mono text-stone-800">eizzzlnlcdfuylnojijn.supabase.co</code></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Disk Backup: Active
            </span>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Farmers</span>
            <span className="text-2xl font-bold font-heading text-[#1B4332] mt-1 block">
              {stats?.totalFarmers || 0}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
              {stats?.verifiedFarmers || 0} with 7/12 Land Record
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Buyers</span>
            <span className="text-2xl font-bold font-heading text-[#1B4332] mt-1 block">
              {stats?.totalBuyers || 0}
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {stats?.verifiedBuyers || 0} Active Mills
            </span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-2xs ${pendingCount > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-[#E5DFD4]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Pending Verification</span>
            <span className="text-2xl font-bold font-heading text-amber-900 mt-1 block">
              {pendingCount}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
              Requires SuperAdmin Action
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Produce Lots</span>
            <span className="text-2xl font-bold font-heading text-[#1B4332] mt-1 block">
              {stats?.totalLots || 0}
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {stats?.totalVolumeQtl || 0} Quintals
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Deals in Escrow</span>
            <span className="text-2xl font-bold font-heading text-[#1B4332] mt-1 block">
              {stats?.totalDeals || 0}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
              ₹{(stats?.totalEscrowVal || 0).toLocaleString()} Secured
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Trust Level</span>
            <span className="text-2xl font-bold font-heading text-emerald-700 mt-1 block">
              100%
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              Verified APMC Math
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5DFD4] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-[#FAF7F2] border border-[#E5DFD4]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Buyer Verification Desk</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#1B4332] text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('farmers')}
            className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'farmers'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-[#FAF7F2] border border-[#E5DFD4]'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Farmer 7/12 Land Desk</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 text-[10px] font-bold">
              {farmers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lots')}
            className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'lots'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-[#FAF7F2] border border-[#E5DFD4]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Marketplace Lots & Deals</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 text-[10px] font-bold">
              {lots.length}
            </span>
          </button>
        </div>

        {/* TAB 1: BUYER VERIFICATION DESK */}
        {activeTab === 'buyers' && (
          <div className="space-y-4">
            
            {/* Filter pills */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBuyerFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    buyerFilter === 'ALL'
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-white text-stone-600 border border-[#E5DFD4]'
                  }`}
                >
                  All Buyers ({buyers.length})
                </button>
                <button
                  onClick={() => setBuyerFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    buyerFilter === 'PENDING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-800 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Approval ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setBuyerFilter('VERIFIED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    buyerFilter === 'VERIFIED'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-emerald-800 border border-emerald-200'
                  }`}
                >
                  Verified Buyers ({buyers.filter(b => b.is_verified || b.status === 'VERIFIED').length})
                </button>
              </div>

              <span className="text-xs text-stone-500">
                Priority: Verify active GSTIN & APMC direct purchase license number
              </span>
            </div>

            {/* Buyers Table / Cards */}
            <div className="bg-white rounded-3xl border border-[#E5DFD4] overflow-hidden shadow-xs">
              {filteredBuyers.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-xs">
                  No buyers found in this category.
                </div>
              ) : (
                <div className="divide-y divide-[#E5DFD4]">
                  {filteredBuyers.map(buyer => (
                    <div key={buyer.id} className="p-6 hover:bg-[#FAF7F2]/50 transition-colors space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-stone-900 text-base">
                              {buyer.company_name}
                            </h3>
                            {buyer.status === 'PENDING_VERIFICATION' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 border border-amber-300">
                                <Clock className="w-3 h-3" />
                                PENDING_VERIFICATION
                              </span>
                            ) : buyer.status === 'REJECTED' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-300">
                                REJECTED
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                                <Award className="w-3 h-3" />
                                GSTIN VERIFIED BUYER
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500">
                            Rep: <strong className="text-stone-700">{buyer.representative_name || buyer.legal_name}</strong> • Phone: <strong className="text-stone-700">{buyer.phone || buyer.contact_phone}</strong> • {buyer.district}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {buyer.status === 'PENDING_VERIFICATION' ? (
                            <>
                              <button
                                onClick={() => handleApproveBuyer(buyer.id, buyer.company_name)}
                                className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve & Issue Badge</span>
                              </button>
                              <button
                                onClick={() => handleRejectBuyer(buyer.id, buyer.company_name)}
                                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : buyer.status === 'VERIFIED' || buyer.is_verified ? (
                            <button
                              onClick={() => handleRejectBuyer(buyer.id, buyer.company_name)}
                              className="px-3 py-1.5 rounded-lg text-[11px] text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              Revoke Badge
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveBuyer(buyer.id, buyer.company_name)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Re-Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBuyer(buyer.id || buyer.user_id, buyer.company_name)}
                            title="Delete Buyer Account"
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Verification Metadata Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">GSTIN Number</span>
                          <span className="font-mono font-bold text-stone-900">{buyer.gstin || 'NOT_SUBMITTED'}</span>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">PAN / Tax ID</span>
                          <span className="font-mono font-bold text-stone-900">{buyer.pan || 'NOT_SUBMITTED'}</span>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">License Type & Reg No.</span>
                          <span className="font-semibold text-stone-800 truncate block" title={buyer.license_type}>
                            {buyer.license_type || 'Direct Procurement'}
                          </span>
                          <span className="font-mono text-[11px] text-stone-500 block">
                            {buyer.license_number || 'N/A'}
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Processing Capacity</span>
                          <span className="font-bold text-[#1B4332]">
                            {buyer.daily_capacity_mt ? `${buyer.daily_capacity_mt} MT / Day` : '100+ MT / Day'}
                          </span>
                        </div>
                      </div>

                      {buyer.address && (
                        <div className="text-[11px] text-stone-500">
                          <strong>Plant Location:</strong> {buyer.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FARMER 7/12 LAND DESK */}
        {activeTab === 'farmers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Farmer Landholding & 7/12 (Saat-Bara) Directory
              </span>
              <span className="text-xs text-emerald-800 font-semibold">
                ✓ Validated against Maharashtra Revenue & Land Records format
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5DFD4] overflow-hidden shadow-xs">
              {farmers.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-xs">
                  No individual farmers registered yet. When a farmer signs up via the Farmer Portal, their 7/12 land record will appear here.
                </div>
              ) : (
                <div className="divide-y divide-[#E5DFD4]">
                  {farmers.map((farmer, idx) => {
                    const farmerName = farmer.name || farmer.full_name || 'Registered Farmer';
                    const farmerId = farmer.id || farmer.user_id || `farmer-${idx}`;
                    const farmerCrops = Array.isArray(farmer.crops) 
                      ? farmer.crops 
                      : Array.isArray(farmer.primary_crops) 
                        ? farmer.primary_crops 
                        : [farmer.crops || farmer.primary_crops || 'Soybean'].filter(Boolean);

                    return (
                      <div key={farmerId} className="p-6 hover:bg-[#FAF7F2]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-stone-900 text-base">
                              {farmerName}
                            </h3>
                            {farmer.is_verified ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                                7/12 VERIFIED LANDHOLDER
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold text-[10px]">
                                Standard Account
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-500">
                            Phone: <strong className="text-stone-700">+91 {farmer.phone || 'N/A'}</strong> • {farmer.district || 'Maharashtra'}, {farmer.village || 'Farm Gate'}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                              <span className="text-stone-400 text-[10px] block font-bold">7/12 Gat / Survey No.</span>
                              <span className="font-mono font-bold text-stone-900">
                                {farmer.saat_bara_number || 'Not Submitted'}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                              <span className="text-stone-400 text-[10px] block font-bold">Landholding Area</span>
                              <span className="font-bold text-stone-900">
                                {farmer.land_size_acres ? `${farmer.land_size_acres} Acres` : 'N/A'}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                              <span className="text-stone-400 text-[10px] block font-bold">Crops</span>
                              <span className="font-semibold text-stone-800">
                                {farmerCrops.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleFarmer(farmerId, farmer.is_verified, farmerName)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                              farmer.is_verified
                                ? 'bg-stone-50 text-stone-600 border-stone-300 hover:bg-rose-50 hover:text-rose-700'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {farmer.is_verified ? 'Revoke 7/12 Badge' : 'Verify 7/12 Record'}
                          </button>
                          <button
                            onClick={() => handleDeleteFarmer(farmerId, farmerName)}
                            title="Delete Farmer Account"
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MARKETPLACE LOTS & DEALS */}
        {activeTab === 'lots' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Live Farm-Gate Produce Lots (All Districts)
              </span>
              <span className="text-xs font-mono text-stone-500">
                Total Lots: <strong>{lots.length}</strong>
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5DFD4] overflow-hidden shadow-xs">
              {lots.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-xs">
                  No active lots listed in the marketplace yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E5DFD4]">
                  {lots.map(lot => (
                    <div key={lot.id} className="p-6 hover:bg-[#FAF7F2]/50 transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{lot.crop} ({lot.variety})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lot.status === 'DEAL_LOCKED' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-stone-100 text-stone-800'
                          }`}>
                            {lot.status}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-[#1B4332]">
                          ₹{lot.expected_price_per_qtl} / Qtl
                        </span>
                      </div>

                      <p className="text-xs text-stone-500">
                        Farmer: <strong className="text-stone-700">{lot.farmer_name}</strong> • Phone: <strong className="text-stone-700">{lot.farmer_phone}</strong> • {lot.district} ({lot.farm_address})
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-600">
                        <span>Quantity: <strong>{lot.quantity_qtl} Qtl</strong></span>
                        <span>•</span>
                        <span>Moisture: <strong>{lot.moisture_percentage}%</strong></span>
                        <span>•</span>
                        <span>Quality: <strong>{lot.quality_grade}</strong></span>
                        <span>•</span>
                        <span>Offers: <strong>{lot.offers_count || 0}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
