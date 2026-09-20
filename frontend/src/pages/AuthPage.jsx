import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Sprout, Building2, Truck, ShieldCheck, Phone, User, MapPin, 
  ArrowRight, CheckCircle2, AlertCircle, FileText, BadgeCheck, Clock, Users
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
  const [role, setRole] = useState(roleParam === 'BUYER' ? 'BUYER' : roleParam === 'TRANSPORTER' ? 'TRANSPORTER' : roleParam === 'FPO' ? 'FPO' : 'FARMER');

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
  const [bankIfsc, setBankIfsc] = useState('');
  const [crops, setCrops] = useState(['Soybean']);
  const [preferredChannel, setPreferredChannel] = useState('WHATSAPP');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Buyer specific registration state
  const [buyerCategory, setBuyerCategory] = useState('Processor / Mill');
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
    if (import.meta.env.DEV) {
      setOtp('123456'); // Standard demo testing code in development only
    }
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
          if (!consentAccepted) {
            setErrorMsg(currentLang === 'en' 
              ? 'Please accept the data use consent to continue.' 
              : currentLang === 'hi' 
              ? 'आगे बढ़ने के लिए कृपया डेटा उपयोग सहमति स्वीकार करें।' 
              : 'पुढे जाण्यासाठी कृपया माहिती वापर संमती स्वीकारा.');
            setLoading(false);
            return;
          }

          res = await api.register({
            phone,
            role: 'FARMER',
            name: name.trim(),
            district,
            taluka: taluka.trim(),
            village: village.trim(),
            crops,
            preferred_channel: preferredChannel,
            consent_accepted: true,
            land_size_acres: landSize ? Number(landSize) : null,
            saat_bara_number: saatBara ? saatBara.trim() : null,
            bank_ifsc: bankIfsc ? bankIfsc.trim() : null
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
        } else if (role === 'FPO') {
          if (!companyName.trim()) {
            setErrorMsg(currentLang === 'en' ? 'FPO Organization name is required.' : currentLang === 'hi' ? 'FPO संस्था का नाम आवश्यक है।' : 'FPO संस्थेचे नाव आवश्यक आहे.');
            setLoading(false);
            return;
          }
          if (!consentAccepted) {
            setErrorMsg(currentLang === 'en' ? 'Please accept data consent.' : currentLang === 'hi' ? 'कृपया डेटा सहमति स्वीकार करें।' : 'कृपया माहिती संमती स्वीकारा.');
            setLoading(false);
            return;
          }

          res = await api.register({
            phone,
            role: 'FPO',
            name: repName.trim() || companyName.trim(),
            company_name: companyName.trim(),
            fpo_name: companyName.trim(),
            registration_no: licenseNumber.trim() || `MH-FPO-${Date.now().toString().slice(-6)}`,
            representative_name: repName.trim() || name.trim(),
            district,
            taluka: taluka.trim(),
            village: village.trim(),
            members_count: dailyCapacity ? Number(dailyCapacity) : 50,
            address: factoryAddress.trim() || `${taluka || district} FPO Aggregation Center`,
            crops,
            bank_ifsc: bankIfsc.trim(),
            bank_account: saatBara.trim()
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
            buyer_category: buyerCategory,
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
        } else if (role === 'FPO') {
          navigate('/fpo');
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
        } else if (res.user.role === 'FPO') {
          navigate('/fpo');
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              onClick={() => { setRole('FPO'); setErrorMsg(''); setErrorCode(''); }}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'FPO'
                  ? 'border-[#1B4332] bg-[#FAF7F2] text-[#1B4332] shadow-xs'
                  : 'border-[#E5DFD4] bg-white text-stone-500 hover:bg-[#FAF7F2]'
              }`}
            >
              <Users className={`w-5 h-5 ${role === 'FPO' ? 'text-[#C86432]' : 'text-stone-400'}`} />
              <span className="text-xs font-bold">{currentLang === 'en' ? 'FPO / Co-op' : currentLang === 'hi' ? 'FPO / समिति' : 'FPO / संस्था'}</span>
              <span className="text-[10px] text-stone-400">{currentLang === 'en' ? 'Aggregation' : currentLang === 'hi' ? 'एकत्रीकरण' : 'एकत्रीकरण'}</span>
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
                {import.meta.env.DEV ? (
                  <span>{t.demoOtpNote}</span>
                ) : (
                  <span>{currentLang === 'en' ? 'Enter 6-digit OTP received via SMS' : currentLang === 'hi' ? 'SMS द्वारा प्राप्त ६-अंकीय OTP दर्ज करें' : 'SMS द्वारे प्राप्त झालेला ६-अंकी OTP प्रविष्ट करा'}</span>
                )}
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

              {/* Informative Progressive Registration Note */}
              <div className="p-3 rounded-xl bg-stone-50 border border-[#E5DFD4] text-[11px] text-stone-600 flex items-start gap-2">
                <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>{t.authProgressiveNote}</span>
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
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setTaluka('');
                    }}
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
                    {currentLang === 'en' ? 'Taluka (Tehsil)' : currentLang === 'hi' ? 'तालुका / तहसील' : 'तालुका'}
                  </label>
                  <select
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    <option value="">{currentLang === 'en' ? '-- Select Taluka --' : currentLang === 'hi' ? '-- तहसील चुनें --' : '-- तालुका निवडा --'}</option>
                    {(DISTRICT_OPTIONS.find(d => d.id === district)?.talukas || []).map((tItem) => (
                      <option key={tItem.id} value={tItem.id}>
                        {tItem[currentLang] || tItem.en}
                      </option>
                    ))}
                  </select>
                </div>

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

              {/* Preferred Communication Channel */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  {t.preferredContactLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('WHATSAPP')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      preferredChannel === 'WHATSAPP'
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-[#E5DFD4]'
                    }`}
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('SMS')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      preferredChannel === 'SMS'
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-[#E5DFD4]'
                    }`}
                  >
                    <span>SMS</span>
                  </button>
                </div>
              </div>

              {/* Explicit Mandatory Data Consent */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E5DFD4] text-[#1B4332] focus:ring-[#1B4332]"
                    required
                  />
                  <span className="text-xs text-stone-700 leading-snug">
                    {t.authConsentFarmer} <span className="text-red-500">*</span>
                  </span>
                </label>
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

              {/* Organisation Review Notice */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.buyerUnderReviewNotice}</span>
              </div>

              {/* Buyer Category Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.buyerCategoryLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={buyerCategory}
                  onChange={(e) => setBuyerCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                >
                  <option value="Processor / Mill">{currentLang === 'en' ? 'Processor / Mill (Oil / Dal / Sugar)' : currentLang === 'hi' ? 'प्रसंस्करणकर्ता / मिल (तेल, दाल)' : 'प्रक्रियादार / मिल (ऑइल, डाळ, साखर)'}</option>
                  <option value="Trader">{currentLang === 'en' ? 'Licensed APMC Trader / Commission Agent' : currentLang === 'hi' ? 'लाइसेंसधारी APMC व्यापारी' : 'परवानाधारक APMC व्यापारी / आडतदार'}</option>
                  <option value="Institutional Buyer">{currentLang === 'en' ? 'Institutional Buyer / Corporate FMCG' : currentLang === 'hi' ? 'संस्थागत खरीदार / FMCG' : 'संस्थात्मक खरेदीदार / कॉर्पोरेट FMCG'}</option>
                  <option value="FPO / Cooperative">{currentLang === 'en' ? 'FPO / Farmers Cooperative Society' : currentLang === 'hi' ? 'FPO / किसान सहकारी समिति' : 'FPO / शेतकरी उत्पादक सहकारी संस्था'}</option>
                  <option value="Retail / Aggregator">{currentLang === 'en' ? 'Retailer / Bulk Aggregator' : currentLang === 'hi' ? 'थोक एग्रीगेटर / खुदरा व्यापारी' : 'घाऊक संकलक / किरकोळ विक्रेता'}</option>
                </select>
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
                  {t.transporterActivationNotice}
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
                  {t.transporterTariffDisclaimer}
                </p>
              </div>
            </div>
          )}

          {/* REGISTRATION FIELDS FOR FPO (FARMER PRODUCER COMPANY) */}
          {mode === 'register' && role === 'FPO' && (
            <div className="space-y-4 pt-2 border-t border-[#E5DFD4]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                  {currentLang === 'en' ? 'FPO / Farmer Cooperative Registration' : currentLang === 'hi' ? 'FPO / कृषक उत्पादक कंपनी पंजीकरण' : 'शेतकरी उत्पादक संस्था (FPO) नोंदणी'}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold border border-emerald-200">
                  {currentLang === 'en' ? 'Institutional Aggregator' : currentLang === 'hi' ? 'संस्थागत एकत्रीकरण' : 'अधिकृत शेतकरी संघ'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'FPO Legal / Society Name' : currentLang === 'hi' ? 'FPO / समिति का नाम' : 'FPO / संस्थेचे अधिकृत नाव'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="उदा. सह्याद्री शेतकरी उत्पादक कंपनी लि."
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'CIN / Society Reg. Number' : currentLang === 'hi' ? 'पंजीकरण / CIN संख्या' : 'नोंदणी / CIN क्रमांक'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="U01409MH2024PTC392811"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-mono font-bold uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Authorized Director / Manager' : currentLang === 'hi' ? 'अधिकृत संचालक / प्रबंधक' : 'अधिकृत संचालक / व्यवस्थापक'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="उदा. कैलासराव शिंदे"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Active Member Farmers Count' : currentLang === 'hi' ? 'सक्रिय किसान सदस्य संख्या' : 'एकूण सभासद शेतकरी संख्या'}
                  </label>
                  <input
                    type="number"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    placeholder="उदा. 120 सभासद"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.fieldDistrict} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setDistrict(newDist);
                      const opt = DISTRICT_OPTIONS.find(d => d.id === newDist);
                      if (opt && opt.talukas && opt.talukas.length > 0) {
                        setTaluka(opt.talukas[0].en);
                      }
                    }}
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
                    {t.fieldTaluka}
                  </label>
                  <select
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                  >
                    {(() => {
                      const selectedDistObj = DISTRICT_OPTIONS.find(d => d.id === district) || DISTRICT_OPTIONS[0];
                      const talukas = selectedDistObj.talukas || [];
                      return talukas.map((tal) => (
                        <option key={tal.id} value={tal.en}>
                          {tal[currentLang] || tal.en}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {currentLang === 'en' ? 'FPO Aggregation Center / Warehouse Address' : currentLang === 'hi' ? 'FPO संकलन केंद्र / गोदाम का पता' : 'FPO संकलन केंद्र / गोदाम पत्ता'}
                </label>
                <input
                  type="text"
                  value={factoryAddress}
                  onChange={(e) => setFactoryAddress(e.target.value)}
                  placeholder="उदा. प्लॉट नं. १२, ॲग्रो इंडस्ट्रियल पार्क, MIDC औसा"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Bank Settlement IFSC' : currentLang === 'hi' ? 'बैंक IFSC कोड' : 'FPO बँक खाते IFSC कोड'}
                  </label>
                  <input
                    type="text"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="MAHB0000214"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {currentLang === 'en' ? 'Bank Account Number' : currentLang === 'hi' ? 'बैंक खाता संख्या' : 'FPO बँक खाते क्रमांक'}
                  </label>
                  <input
                    type="text"
                    value={saatBara}
                    onChange={(e) => setSaatBara(e.target.value)}
                    placeholder="६०१२९९८३४१२"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DFD4] bg-[#FAF7F2] text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {currentLang === 'en' ? 'Primary Aggregated Commodities' : currentLang === 'hi' ? 'प्रमुख संकलित फसलें' : 'प्रमुख संकलित पिके'}
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

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#1B4332] rounded focus:ring-[#1B4332]"
                  />
                  <span className="text-[11px] text-stone-700 leading-snug">
                    {currentLang === 'en' 
                      ? 'I certify that this FPO is authorized to pool member produce and represent farmers for collective procurement under Maharashtra APMC Rules.' 
                      : currentLang === 'hi' 
                      ? 'मैं प्रमाणित करता हूँ कि यह FPO महाराष्ट्र APMC नियमों के तहत सामूहिक खरीद के लिए किसान उपज एकत्र करने हेतु अधिकृत है।' 
                      : 'मी प्रमाणित करतो की ही FPO संस्था महाराष्ट्र APMC नियमांनुसार सभासद शेतकऱ्यांचा शेतमाल एकत्र करून सामूहिक विक्री करण्यास अधिकृत आहे.'}
                  </span>
                </label>
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
            {t.authSecureVerification}
          </span>
        </div>

      </div>
    </div>
  );
}

