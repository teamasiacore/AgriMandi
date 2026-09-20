import React, { useState } from 'react';
import { 
  ShieldCheck, BadgeCheck, MapPin, Phone, Building2, 
  Sprout, Edit3, CheckCircle2, AlertCircle, HelpCircle, 
  Layers, Check, X, PhoneCall, ArrowRight, User, Clock
} from 'lucide-react';
import api from '../../services/api';
import { translations, DISTRICT_OPTIONS, CROP_OPTIONS } from '../../utils/translations';

export default function FarmerProfileDesk({ 
  user, 
  setUser, 
  myLots = [], 
  currentLang = 'mr' 
}) {
  const t = translations[currentLang] || translations.mr;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for Profile Editing
  const [editForm, setEditForm] = useState({
    name: user.name || user.full_name || '',
    district: user.district || 'Latur',
    taluka: user.taluka || '',
    village: user.village || '',
    land_size_acres: user.land_size_acres || '',
    saat_bara_number: user.saat_bara_number || '',
    bank_ifsc: user.bank_ifsc || '',
    crops: user.crops || user.primary_crops || ['Soybean']
  });

  const isVerified = Boolean(user.is_verified);
  const hasSubmittedSaatBara = Boolean(user.saat_bara_number && user.saat_bara_number.trim().length > 0);

  const toggleCrop = (cropId) => {
    if (editForm.crops.includes(cropId)) {
      if (editForm.crops.length > 1) {
        setEditForm(prev => ({ ...prev, crops: prev.crops.filter(c => c !== cropId) }));
      }
    } else {
      setEditForm(prev => ({ ...prev, crops: [...prev.crops, cropId] }));
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: user.name || user.full_name || '',
      district: user.district || 'Latur',
      taluka: user.taluka || '',
      village: user.village || '',
      land_size_acres: user.land_size_acres || '',
      saat_bara_number: user.saat_bara_number || '',
      bank_ifsc: user.bank_ifsc || '',
      crops: user.crops || user.primary_crops || ['Soybean']
    });
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const identifier = user.phone || user.id;
      const res = await api.updateFarmerProfile(identifier, editForm);
      const updatedUser = {
        ...user,
        ...(res.profile || {}),
        name: editForm.name,
        district: editForm.district,
        taluka: editForm.taluka,
        village: editForm.village,
        land_size_acres: editForm.land_size_acres ? Number(editForm.land_size_acres) : null,
        saat_bara_number: editForm.saat_bara_number,
        bank_ifsc: editForm.bank_ifsc,
        crops: editForm.crops,
        primary_crops: editForm.crops,
        is_verified: user.is_verified || false,
        verification_status: editForm.saat_bara_number ? (user.is_verified ? 'VERIFIED' : 'SUBMITTED') : 'NOT_SUBMITTED'
      };

      setUser(updatedUser);
      localStorage.setItem('agri_user', JSON.stringify(updatedUser));
      setSaving(false);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Profile update failed.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {currentLang === 'en' 
                ? 'Farmer profile updated successfully in Supabase Cloud!' 
                : currentLang === 'hi' 
                ? 'किसान प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' 
                : 'शेतकरी प्रोफाईल यशस्वीरीत्या अपडेट झाली!'}
            </span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Identity & Verification Hero */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5DFD4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DFD4]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <User className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
                  {user.name || user.full_name || (currentLang === 'en' ? 'Farmer Member' : currentLang === 'hi' ? 'किसान सदस्य' : 'शेतकरी सदस्य')}
                </h2>
                
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    {currentLang === 'en' ? '7/12 Verified Landholder' : currentLang === 'hi' ? '७/१२ सत्यापित किसान' : '७/१२ पडताळणी पूर्ण शेतकरी'}
                  </span>
                ) : hasSubmittedSaatBara ? (
                  <span 
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200" 
                    title={t.labelLandRecordNoteReview}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {t.labelLandRecordSubmitted}
                  </span>
                ) : (
                  <button 
                    onClick={handleOpenEdit}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 transition-all cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    {t.labelLandRecordOptional}
                  </button>
                )}
              </div>

              <p className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  +91 {user.phone || '—'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {[user.village, user.taluka, user.district].filter(Boolean).join(', ') || (currentLang === 'en' ? 'Maharashtra' : 'महाराष्ट्र')}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="px-4 py-2.5 rounded-xl border border-[#C86432] text-[#C86432] hover:bg-[#C86432] hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            {currentLang === 'en' ? 'Edit Profile' : currentLang === 'hi' ? 'प्रोफ़ाइल बदलें' : 'प्रोफाईल संपादित करा'}
          </button>
        </div>

        {/* 3 Detail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          
          {/* Card 1: 7/12 Land Record */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {currentLang === 'en' ? 'Landholding & 7/12' : currentLang === 'hi' ? 'जमीन व ७/१२ रिकॉर्ड' : 'जमीन धारणा व ७/१२'}
              </span>
              <BadgeCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-lg font-bold font-mono text-[#1B4332]">
              {user.land_size_acres ? `${user.land_size_acres} Acres` : '—'}
            </div>
            <div className="text-xs text-stone-600">
              <span className="font-semibold">{currentLang === 'en' ? 'Survey / Gat Reference:' : currentLang === 'hi' ? 'गट / सर्व्हे संदर्भ:' : 'गट / सर्व्हे संदर्भ:'}</span>{' '}
              <span className="font-mono font-bold text-emerald-800">
                {user.saat_bara_number ? (user.is_verified ? user.saat_bara_number : `${user.saat_bara_number} (${currentLang === 'en' ? 'Under Review' : currentLang === 'hi' ? 'समीक्षाधीन' : 'पुनरावलोकन सुरू'})`) : (currentLang === 'en' ? 'Optional (Not linked)' : currentLang === 'hi' ? 'ऐच्छिक (लिंक नहीं)' : 'ऐच्छिक (नोंदणीकृत नाही)')}
              </span>
            </div>
          </div>

          {/* Card 2: Settlement Details */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {currentLang === 'en' ? 'Settlement Account' : currentLang === 'hi' ? 'सेटलमेंट खाता' : 'पेमेंट सेटलमेंट तपशील'}
              </span>
              <Building2 className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-lg font-bold font-mono text-[#1B4332] uppercase">
              {user.bank_ifsc || (currentLang === 'en' ? 'Not Configured' : currentLang === 'hi' ? 'दर्ज नहीं' : 'नोंदणीकृत नाही')}
            </div>
            <div className="text-[11px] text-stone-600 leading-snug">
              {user.bank_ifsc ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> {currentLang === 'en' ? 'Configured for approved payouts' : currentLang === 'hi' ? 'भुगतान प्रक्रिया हेतु दर्ज' : 'मान्यताप्राप्त व्यवहारासाठी नोंदणीकृत'}
                </span>
              ) : (
                <span className="text-stone-500">
                  {currentLang === 'en' ? 'Add bank IFSC when completing transactions' : currentLang === 'hi' ? 'लेनदेन पूरा करते समय बैंक IFSC जोड़ें' : 'व्यवहार पूर्ण करताना बँक IFSC जोडा'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-400 pt-1 border-t border-[#E5DFD4]/60">
              {t.settlementDisclaimer}
            </p>
          </div>

          {/* Card 3: Activity & Lots */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {currentLang === 'en' ? 'Trading Activity' : currentLang === 'hi' ? 'व्यापार गतिविधि' : 'शेतीमाल व्यवहार'}
              </span>
              <Layers className="w-4 h-4 text-[#C86432]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#1B4332]">
              {myLots.length} {currentLang === 'en' ? 'Lots Listed' : currentLang === 'hi' ? 'लॉट दर्ज' : 'लॉट नोंदवले'}
            </div>
            <div className="text-xs text-stone-600">
              {currentLang === 'en' ? 'Direct trade with verified Maharashtra mills' : currentLang === 'hi' ? 'महाराष्ट्र की सत्यापित मिलों से सीधा व्यापार' : 'महाराष्ट्रातील अधिकृत कारखान्यांशी थेट जोडणी'}
            </div>
          </div>

        </div>

        {/* Crops Grown */}
        <div className="mt-6 pt-5 border-t border-[#E5DFD4]">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
            {currentLang === 'en' ? 'Primary Crops Grown' : currentLang === 'hi' ? 'मुख्य उगाई जाने वाली फसलें' : 'शेतात घेतली जाणारी मुख्य पिके'}:
          </span>
          <div className="flex flex-wrap gap-2">
            {(user.crops || user.primary_crops || ['Soybean']).map((crop, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-lg bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 text-xs font-bold flex items-center gap-1.5"
              >
                <Sprout className="w-3.5 h-3.5 text-[#2D6A4F]" />
                {crop}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Assisted Support & Trust Banner */}
      <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E5DFD4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B4332]">
              {currentLang === 'en' ? 'Need Help Updating 7/12 or Bank Details?' : currentLang === 'hi' ? '७/१२ या बैंक विवरण जोड़ने में सहायता चाहिए?' : '७/१२ किंवा बँक खाते नोंदणीत मदत हवी आहे?'}
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {currentLang === 'en' 
                ? 'Toll-free Kisan Call Centre helpline & Taluka Krishi Sahayak assistance available 7 days a week.' 
                : currentLang === 'hi'
                ? 'निःशुल्क किसान कॉल सेन्टर हेल्पलाइन व तालुका कृषी सहायक मदत ७ दिवस उपलब्ध.'
                : 'टोल-फ्री किसान कॉल सेंटर १८००-१८०-१५५१ व स्थानिक कृषी सहायक मार्गदर्शन उपलब्ध.'}
            </p>
          </div>
        </div>

        <a 
          href="tel:18001801551" 
          className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143225] transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          1800-180-1551
        </a>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#E5DFD4] shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4]">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#1B4332]">
                  {currentLang === 'en' ? 'Edit Farmer Profile' : currentLang === 'hi' ? 'किसान प्रोफ़ाइल संपादित करें' : 'शेतकरी प्रोफाईल माहिती बदला'}
                </h3>
                <p className="text-xs text-stone-500">
                  {currentLang === 'en' ? 'Update your agricultural and bank details for verified trades.' : currentLang === 'hi' ? 'सत्यापित व्यापार हेतु अपनी कृषि व बैंक विवरण अपडेट करें।' : 'सत्यापित व्यवहारांसाठी तुमची शेतजमीन व बँक माहिती अद्ययावत करा.'}
                </p>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Name & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Full Name' : currentLang === 'hi' ? 'पूरा नाम' : 'संपूर्ण नाव'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'District' : currentLang === 'hi' ? 'जिला' : 'जिल्हा'} *
                  </label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold text-stone-900"
                  >
                    {DISTRICT_OPTIONS.map(d => (
                      <option key={d.id} value={d.id}>{d[currentLang] || d.en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Taluka & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Taluka (Tehsil)' : currentLang === 'hi' ? 'तालुका / तहसील' : 'तालुका'}
                  </label>
                  <input
                    type="text"
                    value={editForm.taluka}
                    onChange={(e) => setEditForm({ ...editForm, taluka: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. Ausa, Barshi' : currentLang === 'hi' ? 'उदा. औसा, बार्शी' : 'उदा. औसा, बार्शी'}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Village' : currentLang === 'hi' ? 'गाँव' : 'गाव'}
                  </label>
                  <input
                    type="text"
                    value={editForm.village}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. Kandhar, Kasarsirsi' : currentLang === 'hi' ? 'उदा. कंधार, कासारसिरसी' : 'उदा. कंधार, कासारसिरसी'}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold text-stone-900"
                  />
                </div>
              </div>

              {/* Land Size & 7/12 Gat No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Total Land (Acres)' : currentLang === 'hi' ? 'कुल जमीन (एकड़)' : 'एकूण शेतजमीन (एकर)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.land_size_acres}
                    onChange={(e) => setEditForm({ ...editForm, land_size_acres: e.target.value })}
                    placeholder="e.g. 5.5"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>{currentLang === 'en' ? '7/12 Gat / Survey No. (Optional)' : currentLang === 'hi' ? '७/१२ गट क्र. (वैकल्पिक)' : '७/१२ गट / सर्व्हे क्र. (ऐच्छिक)'}</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {currentLang === 'en' ? 'Review-based' : currentLang === 'hi' ? 'समीक्षाधीन' : 'पुनरावलोकनाधीन'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editForm.saat_bara_number}
                    onChange={(e) => setEditForm({ ...editForm, saat_bara_number: e.target.value })}
                    placeholder={currentLang === 'en' ? 'e.g. Gat / Survey No. 88' : currentLang === 'hi' ? 'उदा. गट क्र. ८८' : 'उदा. गट क्र. ८८'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-[#1B4332]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    {t.labelLandRecordNoteReview}
                  </p>
                </div>
              </div>

              {/* Bank IFSC */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>{currentLang === 'en' ? 'Bank IFSC Code (Optional Settlement)' : currentLang === 'hi' ? 'बैंक IFSC कोड (भुगतान हेतु वैकल्पिक)' : 'बँक IFSC कोड (पेमेंट सेटलमेंटसाठी ऐच्छिक)'}</span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {currentLang === 'en' ? 'For transactions' : currentLang === 'hi' ? 'लेनदेन हेतु' : 'व्यवहारासाठी'}
                  </span>
                </label>
                <input
                  type="text"
                  value={editForm.bank_ifsc}
                  onChange={(e) => setEditForm({ ...editForm, bank_ifsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBIN0001234, MAHB0000567"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold uppercase text-stone-900"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  {t.settlementDisclaimer}
                </p>
              </div>

              {/* Crops Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {currentLang === 'en' ? 'Primary Crops' : currentLang === 'hi' ? 'मुख्य फसलें' : 'शेतात होणारी मुख्य पिके'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CROP_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCrop(c.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        editForm.crops.includes(c.id)
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#FAF7F2] text-stone-600 border border-[#E5DFD4] hover:border-[#1B4332]'
                      }`}
                    >
                      {c[currentLang] || c.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD4]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5DFD4] text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                >
                  {currentLang === 'en' ? 'Cancel' : currentLang === 'hi' ? 'रद्द करें' : 'रद्द करा'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#143225] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving 
                    ? (currentLang === 'en' ? 'Saving...' : currentLang === 'hi' ? 'सहेज रहे हैं...' : 'जतन होत आहे...') 
                    : (currentLang === 'en' ? 'Save Profile' : currentLang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'माहिती जतन करा')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
