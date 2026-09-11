import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Sprout, Building2, Truck, ShieldCheck, Phone, User, MapPin, 
  ArrowRight, CheckCircle2, AlertCircle, FileText, BadgeCheck, Clock
} from 'lucide-react';
import api from '../services/api';
import { translations, DISTRICT_OPTIONS, CROP_OPTIONS, LICENSE_TYPE_OPTIONS, VEHICLE_TYPE_OPTIONS } from '../utils/translations';

export default function AuthPage({ currentLang = 'mr', initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[currentLang] || translations.mr;

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect');
  const roleParam = queryParams.get('role');

  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : initialMode);
  const [role, setRole] = useState(roleParam === 'BUYER' ? 'BUYER' : roleParam === 'TRANSPORTER' ? 'TRANSPORTER' : 'FARMER');

  // Common credentials
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [district, setDistrict] = useState('Latur');

  // Farmer specific registration state
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [landSize, setLandSize] = useState('');
  const [saatBara, setSaatBara] = useState('');
  const [crops, setCrops] = useState(['Soybean']);

  // Buyer specific registration state
  const [companyName, setCompanyName] = useState('');
  const [repName, setRepName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [licenseType, setLicenseType] = useState('Oil Mill Direct Procurement');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState('');
  const [factoryAddress, setFactoryAddress] = useState('');

  // Transporter specific registration state
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Bolero Maxi Truck (1.5 MT)');
  const [capacityMt, setCapacityMt] = useState('1.5');
  const [perKmRate, setPerKmRate] = useState('4.20');
  const [taluka, setTaluka] = useState('');

  // Status & notifications
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [infoNotice, setInfoNotice] = useState(redirectPath ? t.authProtectedNotice : '');
  const [buyerSubmittedModal, setBuyerSubmittedModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const availableCrops = ['Soybean', 'Cotton', 'Pigeon Pea (Tur)', 'Chana', 'Onion', 'Wheat', 'Maize'];

  const toggleCrop = (crop) => {
    if (crops.includes(crop)) {
      if (crops.length > 1) {
        setCrops(crops.filter(c => c !== crop));
      }
    } else {
      setCrops([...crops, crop]);
    }
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setErrorMsg(currentLang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 
                  currentLang === 'hi' ? 'कृपया वैध १०-अंकीय मोबाइल नंबर दर्ज करें।' :
                  'कृपया वैध १०-अंकी मोबाईल क्रमांक प्रविष्ट करा.');
      setErrorCode('INVALID_PHONE');
      return;
    }
    setErrorMsg('');
    setErrorCode('');
    setOtpSent(true);
    setOtp('123456'); // Standard demo testing code
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setErrorCode('');

    try {
      let res;
      if (mode === 'register') {
        if (role === 'FARMER') {
          if (!name.trim()) {
            setErrorMsg(currentLang === 'en' ? 'Full name is required.' : currentLang === 'hi' ? 'पूरा नाम आवश्यक है।' : 'नाव आवश्यक आहे.');
            setLoading(false);
            return;
          }

          res = await api.register({
            phone,
            role: 'FARMER',
            name: name.trim(),
            district,
            village: village.trim(),
            land_size_acres: landSize ? Number(landSize) : null,
            saat_bara_number: saatBara.trim(),
            crops
          });
        } else if (role === 'TRANSPORTER') {
          if (!driverName.trim()) {
            setErrorMsg(currentLang === 'en' ? 'Driver / Owner name is required.' : currentLang === 'hi' ? 'चालक का नाम आवश्यक है।' : 'चालकाचे नाव आवश्यक आहे.');
            setLoading(false);
            return;
          }
          if (!vehicleNumber.trim()) {
            setErrorMsg(currentLang === 'en' ? 'Vehicle number is required.' : currentLang === 'hi' ? 'वाहन क्रमांक आवश्यक है।' : 'वाहन क्रमांक आवश्यक आहे.');
            setLoading(false);
            return;
          }

          res = await api.register({
            phone,
            role: 'TRANSPORTER',
            name: driverName.trim(),
            district,
            taluka: taluka.trim(),
            vehicle_number: vehicleNumber.toUpperCase().trim(),
            vehicle_type: vehicleType,
            capacity_mt: capacityMt,
            per_km_rate: perKmRate
          });
        } else {
          // BUYER validation
          if (!companyName.trim()) {
            setErrorMsg(currentLang === 'en' ? 'Company / Processing Mill name is required.' : currentLang === 'hi' ? 'कंपनी या मिल का नाम आवश्यक है।' : 'कंपनी किंवा कारखान्याचे नाव आवश्यक आहे.');
            setLoading(false);
            return;
          }
          if (!gstin.trim() || gstin.trim().length < 15) {
            setErrorMsg(currentLang === 'en' ? 'Valid 15-character GSTIN is required.' : currentLang === 'hi' ? 'वैध १५-अंकों का GSTIN आवश्यक है।' : 'वैध १५-अंकी GSTIN क्रमांक आवश्यक आहे.');
            setLoading(false);
            return;
          }

          res = await api.register({
            phone,
            role: 'BUYER',
            company_name: companyName.trim(),
            representative_name: repName.trim() || name.trim(),
            name: repName.trim() || companyName.trim(),
            gstin: gstin.toUpperCase().trim(),
            pan: pan ? pan.toUpperCase().trim() : gstin.substring(2, 12).toUpperCase(),
            license_type: licenseType,
            license_number: licenseNumber.trim(),
            daily_capacity_mt: dailyCapacity ? Number(dailyCapacity) : 0,
            address: factoryAddress.trim(),
            district,
            crops
          });
        }

        // Save session
        localStorage.setItem('agri_user', JSON.stringify(res.user));
        localStorage.setItem('agri_token', res.token);

        if (role === 'BUYER') {
          setRegisteredUser(res.user);
          setBuyerSubmittedModal(true);
          setLoading(false);
          return;
        }

        if (role === 'TRANSPORTER') {
          navigate('/transporter');
        } else {
          navigate('/farmer');
        }

      } else {
        // LOGIN
        if (!otp.trim()) {
          setErrorMsg(currentLang === 'en' ? 'OTP is required.' : currentLang === 'hi' ? 'OTP आवश्यक है।' : 'OTP आवश्यक आहे.');
          setLoading(false);
          return;
        }
        res = await api.login({
          phone,
          otp: otp.trim(),
          role
        });

        localStorage.setItem('agri_user', JSON.stringify(res.user));
        localStorage.setItem('agri_token', res.token);

        if (redirectPath) {
          navigate(redirectPath);
        } else if (res.user.role === 'TRANSPORTER') {
          navigate('/transporter');
        } else if (res.user.role === 'BUYER') {
          navigate('/buyer');
        } else {
          navigate('/farmer');
        }
      }
    } catch (err) {
      const code = err.response?.data?.code || '';
      setErrorCode(code);
      setErrorMsg(err.response?.data?.message || err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Buyer Pending Verification Modal */}
      {buyerSubmittedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-[#E5DFD4] shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-heading text-[#1B4332]">
                {t.buyerPendingTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.buyerPendingDesc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">{t.companyLabel}:</span>
                <span className="font-bold text-stone-900">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.gstinLabel}:</span>
                <span className="font-mono font-bold text-stone-900">{gstin.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t.licenseTypeLabel}:</span>
                <span className="font-bold text-stone-900">{licenseType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                  PENDING_VERIFICATION (ASIACore Review)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/buyer')}
              className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{currentLang === 'en' ? 'Proceed to Buyer Portal' : currentLang === 'hi' ? 'खरीदार पोर्टल पर जाएं' : 'खरेदीदार पोर्टलवर पुढे जा'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`w-full ${mode === 'register' && role === 'BUYER' ? 'max-w-2xl' : 'max-w-xl'} bg-white rounded-3xl p-8 border border-[#E5DFD4] shadow-xl relative transition-all duration-300`}>
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <img 
              src="/images/AgriMandi Logo without background.png" 
              alt="AgriMandi" 
              className="h-12 w-auto mx-auto object-contain"
            />
          </Link>
          <h2 className="text-2xl font-bold font-heading text-[#1B4332] mt-2">
            {mode === 'login' ? t.authSignInTitle : t.authRegisterTitle}
          </h2>
          <p className="text-xs text-stone-500">
            {mode === 'login' ? t.authSignInSub : t.authRegisterSub}
          </p>
        </div>

        {/* Protected Route Notice */}
        {infoNotice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{infoNotice}</span>
          </div>
        )}

        {/* Mode Switch (Login vs Register) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5DFD4] mt-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setErrorCode(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login' 
                ? 'bg-[#1B4332] text-white shadow-xs' 
                : 'text-stone-600 hover:text-[#1B4332]'
            }`}
          >
            {t.tabSignIn}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); setErrorCode(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register' 
                ? 'bg-[#1B4332] text-white shadow-xs' 
                : 'text-stone-600 hover:text-[#1B4332]'
            }`}
          >
            {t.tabRegister}
          </button>
        </div>

        {/* Role Switcher (Farmer vs Buyer vs Transporter) */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 text-center">
            {t.selectRole}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setRole('FARMER'); setErrorMsg(''); setErrorCode(''); }}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'FARMER'
                  ? 'border-[#1B4332] bg-[#FAF7F2] text-[#1B4332] shadow-xs'
                  : 'border-[#E5DFD4] bg-white text-stone-500 hover:bg-[#FAF7F2]'
              }`}
            >
              <Sprout className={`w-5 h-5 ${role === 'FARMER' ? 'text-[#C86432]' : 'text-stone-400'}`} />
              <span className="text-xs font-bold">{t.roleFarmer}</span>
              <span className="text-[10px] text-stone-400">{t.roleFarmerSub}</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('BUYER'); setErrorMsg(''); setErrorCode(''); }}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'BUYER'
                  ? 'border-[#1B4332] bg-[#FAF7F2] text-[#1B4332] shadow-xs'
                  : 'border-[#E5DFD4] bg-white text-stone-500 hover:bg-[#FAF7F2]'
              }`}
            >
              <Building2 className={`w-5 h-5 ${role === 'BUYER' ? 'text-[#C86432]' : 'text-stone-400'}`} />
              <span className="text-xs font-bold">{t.roleBuyer}</span>
              <span className="text-[10px] text-stone-400">{t.roleBuyerSub}</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('TRANSPORTER'); setErrorMsg(''); setErrorCode(''); }}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'TRANSPORTER'
                  ? 'border-[#1B4332] bg-[#FAF7F2] text-[#1B4332] shadow-xs'
                  : 'border-[#E5DFD4] bg-white text-stone-500 hover:bg-[#FAF7F2]'
              }`}
            >
              <Truck className={`w-5 h-5 ${role === 'TRANSPORTER' ? 'text-[#C86432]' : 'text-stone-400'}`} />
              <span className="text-xs font-bold">{currentLang === 'en' ? 'Transporter' : currentLang === 'hi' ? 'ट्रांसपोर्टर' : 'वाहतूकदार'}</span>
              <span className="text-[10px] text-stone-400">{currentLang === 'en' ? 'Logistics' : currentLang === 'hi' ? 'माल ढुलाई' : 'माल वाहतूक'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Error Alert with 1-Click Action Buttons */}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-950 text-xs space-y-2.5 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMsg}
              </div>
            </div>

            {/* Smart Action Button: If user entered an unregistered number during Login */}
            {errorCode === 'NOT_REGISTERED' && (
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-amber-800 font-medium">
                  {currentLang === 'en' 
                    ? 'New user? Create your account with this phone number:' 
                    : currentLang === 'hi' 
                      ? 'नया खाता अभी बनाएं:' 
                      : 'नवीन खाते तयार करा:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                    setErrorCode('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>{currentLang === 'en' ? 'Register Now' : currentLang === 'hi' ? 'रजिस्टर करें' : 'नोंदणी करा'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Smart Action Button: If user tries to register an already-registered number */}
            {errorCode === 'ALREADY_REGISTERED' && (
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-amber-800 font-medium">
                  {currentLang === 'en' 
                    ? 'Already have an account? Sign in directly:' 
                    : currentLang === 'hi' 
                      ? 'सीधे साइन इन करें:' 
                      : 'थेट साइन इन करा:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setErrorCode('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>{currentLang === 'en' ? 'Sign In Now' : currentLang === 'hi' ? 'साइन इन करें' : 'साइन इन करा'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Smart Action Button: Role mismatch */}
            {errorCode === 'ROLE_MISMATCH' && (
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-amber-800 font-medium">
                  {currentLang === 'en' 
                    ? 'Switch to the correct role tab:' 
                    : currentLang === 'hi' 
                      ? 'सही विकल्प चुनें:' 
                      : 'योग्य पर्याय निवडा:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRole(role === 'FARMER' ? 'BUYER' : 'FARMER');
                    setErrorMsg('');
                    setErrorCode('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>{role === 'FARMER' ? (currentLang === 'en' ? 'Switch to Buyer Portal' : currentLang === 'hi' ? 'खरीदार पोर्टल चुनें' : 'खरेदीदार निवडा') : (currentLang === 'en' ? 'Switch to Farmer Portal' : currentLang === 'hi' ? 'किसान पोर्टल चुनें' : 'शेतकरी निवडा')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Mobile & OTP Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.phoneLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-11 pr-24 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-sm font-bold font-mono text-stone-900 focus:outline-hidden focus:border-[#1B4332]"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="absolute inset-y-1 right-1 px-3 bg-[#1B4332] text-white text-[11px] font-bold rounded-lg hover:bg-[#2D6A4F] transition-colors"
                >
                  {otpSent ? t.resendOtpBtn : t.getOtpBtn}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.otpLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-center text-sm font-bold font-mono tracking-widest text-[#1B4332]"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
                <span>{t.demoOtpNote}</span>
                {otpSent && <span className="text-emerald-700 font-bold">{t.otpSentSuccess}</span>}
              </div>
            </div>
          </div>

          {/* REGISTRATION DETAILED FIELDS */}
          {mode === 'register' && role === 'FARMER' && (
            <div className="space-y-4 pt-2 border-t border-[#E5DFD4]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                  {t.sectionFarmerLand}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold border border-emerald-200">
                  {t.badgeSaatBaraPriority}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.fullNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.placeholderFullName}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.fieldDistrict} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d[currentLang] || d.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.villageLabel}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={t.placeholderVillage}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.labelLandSize}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    placeholder={t.placeholderLandSize}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>
              </div>

              {/* 7/12 Land Record Input */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-700" />
                    {t.labelSaatBara}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {t.labelSaatBaraBadge}
                  </span>
                </label>
                <input
                  type="text"
                  value={saatBara}
                  onChange={(e) => setSaatBara(e.target.value)}
                  placeholder={t.placeholderSaatBara}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-emerald-600"
                />
                <p className="text-[11px] text-emerald-800">
                  {t.labelSaatBaraNote}
                </p>
              </div>

              {/* Crop Selection Tags */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t.labelCropsGrown}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CROP_OPTIONS.map(crop => (
                    <button
                      type="button"
                      key={crop.id}
                      onClick={() => toggleCrop(crop.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        crops.includes(crop.id)
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#FAF7F2] text-stone-600 border border-[#E5DFD4] hover:border-[#1B4332]'
                      }`}
                    >
                      {crop[currentLang] || crop.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REGISTRATION FIELDS FOR BUYER */}
          {mode === 'register' && role === 'BUYER' && (
            <div className="space-y-4 pt-2 border-t border-[#E5DFD4]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                  {t.sectionBuyerLicense}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold border border-amber-200">
                  {t.badgeSuperAdminApproval}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.companyLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.placeholderCompanyName}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.repNameLabel}
                  </label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder={t.placeholderRepName}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.gstinLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength="15"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AABCU9603R1ZM"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-mono font-bold uppercase tracking-wider"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.panLabel}
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AABCU9603R"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-mono font-bold uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.licenseTypeLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {LICENSE_TYPE_OPTIONS.map((lic) => (
                      <option key={lic.id} value={lic.id}>
                        {lic[currentLang] || lic.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.licenseNoLabel}
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder={t.placeholderLicenseNo}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.dailyCapacityLabel}
                  </label>
                  <input
                    type="number"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    placeholder={t.placeholderDailyCapacity}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.fieldDistrict} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d[currentLang] || d.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.factoryAddressLabel}
                </label>
                <input
                  type="text"
                  value={factoryAddress}
                  onChange={(e) => setFactoryAddress(e.target.value)}
                  placeholder={t.placeholderFactoryAddress}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                />
              </div>

              {/* Crop Procurement Targets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t.labelTargetCommodities}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CROP_OPTIONS.map(crop => (
                    <button
                      type="button"
                      key={crop.id}
                      onClick={() => toggleCrop(crop.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        crops.includes(crop.id)
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#FAF7F2] text-stone-600 border border-[#E5DFD4] hover:border-[#1B4332]'
                      }`}
                    >
                      {crop[currentLang] || crop.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REGISTRATION FIELDS FOR TRANSPORTER */}
          {mode === 'register' && role === 'TRANSPORTER' && (
            <div className="space-y-4 pt-2 border-t border-[#E5DFD4]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                  {currentLang === 'en' ? 'Transporter & Vehicle Details' : currentLang === 'hi' ? 'वाहन एवं चालक विवरण' : 'वाहतूकदार व वाहन तपशील'}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold border border-emerald-200">
                  {currentLang === 'en' ? 'Instant Activation' : currentLang === 'hi' ? 'तत्काल सक्रियता' : 'तात्काळ सक्रिय'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Driver / Owner Name' : currentLang === 'hi' ? 'चालक / मालिक का नाम' : 'चालक / मालकाचे पूर्ण नाव'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="उदा. ज्ञानेश्वर मुंडे (माऊली ट्रान्सपोर्ट)"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Vehicle Number' : currentLang === 'hi' ? 'वाहन नंबर (प्लेट)' : 'गाडीचा नंबर (MH RTO)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="MH-24-AB-1234"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-mono font-bold uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Vehicle Type' : currentLang === 'hi' ? 'वाहन का प्रकार' : 'वाहनाचा प्रकार'}
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => {
                      setVehicleType(e.target.value);
                      if (e.target.value.includes('1.5 MT')) setCapacityMt('1.5');
                      else if (e.target.value.includes('5 MT')) setCapacityMt('5.0');
                      else if (e.target.value.includes('4 MT')) setCapacityMt('4.0');
                      else if (e.target.value.includes('16 MT')) setCapacityMt('16.0');
                      else if (e.target.value.includes('1 MT')) setCapacityMt('1.0');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {VEHICLE_TYPE_OPTIONS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v[currentLang] || v.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Payload Capacity (MT)' : currentLang === 'hi' ? 'भार वहन क्षमता (टन)' : 'वहन क्षमता (टन / MT)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={capacityMt}
                    onChange={(e) => setCapacityMt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Operating Base District' : currentLang === 'hi' ? 'कार्यक्षेत्र (जिला)' : 'मुख्य कार्यक्षेत्र (जिल्हा)'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d[currentLang] || d.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Base Taluka / Village' : currentLang === 'hi' ? 'तहसील / गाँव' : 'तालुका / मुख्य थांबा (गाव)'}
                  </label>
                  <input
                    type="text"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    placeholder="उदा. औसा, बाभळगाव"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {currentLang === 'en' ? 'Default Freight Tariff (₹/km)' : currentLang === 'hi' ? 'डिफ़ॉल्ट मालभाड़ा (₹/किमी)' : 'डिफ़ॉल्ट वाहतूक दर (₹/किमी)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={perKmRate}
                  onChange={(e) => setPerKmRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  {currentLang === 'en' ? 'Government standard rural tariff is ₹4.20/km for 5-Ton, ₹4.80/km for Pickup' :
                   currentLang === 'hi' ? 'मानक ग्रामीण दर: आयशर ₹4.20/किमी, पिकअप ₹4.80/किमी' :
                   'प्रमाणित ग्रामीण दर: आयशर ₹४.२०/किमी, पिकअप ₹४.८०/किमी'}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>{t.btnProcessing}</span>
            ) : mode === 'login' ? (
              <>
                {t.btnSignInAction}
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                {t.btnRegisterAction}
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Safety Note */}
        <div className="mt-6 pt-4 border-t border-[#E5DFD4] flex items-center justify-center text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Encrypted & Safe
          </span>
        </div>

      </div>
    </div>
  );
}

