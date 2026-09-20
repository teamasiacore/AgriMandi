import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, Clock, QrCode, Phone, ArrowRight, RefreshCw, AlertCircle, DollarSign, ShieldCheck, FileText } from 'lucide-react';
import api from '../services/api';
import DriverHeader from '../components/transporter/DriverHeader';
import TripCard from '../components/transporter/TripCard';
import WaybillModal from '../components/transporter/WaybillModal';

export default function TransporterPortal({ currentLang = 'mr' }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [transporter, setTransporter] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my-trips'
  const [availableTrips, setAvailableTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWaybillTrip, setSelectedWaybillTrip] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch transporter profile if exists
      if (user?.phone) {
        try {
          const tpData = await api.getTransporterById(user.id || user.phone);
          if (tpData?.transporter) {
            setTransporter(tpData.transporter);
          } else {
            setTransporter({
              ...user,
              driver_name: user.name || 'Agri Driver',
              vehicle_number: user.vehicle_number || 'MH-24-VEHICLE',
              vehicle_type: user.vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
              per_km_rate: user.per_km_rate || 4.20,
              base_district: user.district || 'Latur',
              is_available: true,
              rating: 5.0,
              trips_completed: 12
            });
          }
        } catch (e) {
          setTransporter(user);
        }
      }

      // 2. Fetch available trip requests across region (locked deals needing pickup)
      const tripsRes = await api.getAvailableTrips({ district: 'all' });
      setAvailableTrips(tripsRes.trips || []);

      // 3. Fetch trips assigned to this transporter (using resolved transporter ID, user ID or phone)
      const tpLookupId = user?.id || user?.phone || 'tp-1';
      const myTripsRes = await api.getTransporterTrips(tpLookupId);
      const fetchedMyTrips = myTripsRes.trips || [];
      setMyTrips(fetchedMyTrips);

      // Auto-switch to my-trips if there are assigned trips and no unassigned available trips
      if (fetchedMyTrips.length > 0 && (tripsRes.trips || []).length === 0) {
        setActiveTab('my-trips');
      }

    } catch (err) {
      console.warn('Transporter data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateTransporterStatus(transporter?.id || user?.id, newStatus);
      setTransporter(prev => ({ ...prev, is_available: newStatus }));
      setActionNotice(newStatus 
        ? (currentLang === 'en' ? '🟢 You are now ON-DUTY. New trips will appear.' : currentLang === 'hi' ? '🟢 आप ऑन-ड्यूटी हैं। नई ट्रिप्स दिखेंगी।' : '🟢 आपण ऑन-ड्युटी आला आहात. नवीन ट्रिप्स दिसतील.')
        : (currentLang === 'en' ? '🔴 You are now OFF-DUTY.' : currentLang === 'hi' ? '🔴 आप ऑफ-ड्यूटी हैं।' : '🔴 आपण ऑफ-ड्युटी झाला आहात.')
      );
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      alert('Status update error: ' + err.message);
    }
  };

  const handleAcceptTrip = async (trip, agreedFreight) => {
    const confirmMsg = currentLang === 'en' 
      ? `Accept farm-gate pickup for ${trip.crop} (${agreedFreight ? '₹' + agreedFreight : ''})?` 
      : currentLang === 'hi'
      ? `क्या आप यह पिकअप व परिवहन ट्रिप स्वीकार करना चाहते हैं? (भाड़ा: ₹${agreedFreight?.toLocaleString() || '9,000'})`
      : `या शेतीमालाची उचल व वाहतूक ट्रिप स्वीकारायची आहे का? (भाडे: ₹${agreedFreight?.toLocaleString() || '9,000'})`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.acceptTrip({
        deal_id: trip.deal_id || trip.id,
        transporter_id: transporter?.id || user?.id || `tp-${user?.phone}`,
        driver_name: transporter?.driver_name || user?.name || 'Verified Driver',
        driver_phone: user?.phone || transporter?.phone || '',
        vehicle_number: transporter?.vehicle_number || user?.vehicle_number || 'MH-24-VEHICLE',
        agreed_freight: agreedFreight
      });

      // Show Waybill Modal immediately
      setSelectedWaybillTrip(res.deal || trip);
      setActiveTab('my-trips');
      loadData();
    } catch (err) {
      alert('Error accepting trip: ' + err.message);
    }
  };

  const handleUpdateMilestone = async (dealId, nextMilestone) => {
    try {
      await api.updateTripMilestone(dealId, { milestone: nextMilestone });
      const statusLabels = {
        AT_FARM_GATE: currentLang === 'en' ? '📍 Driver arrived at Farm Gate. Loading in progress.' : currentLang === 'hi' ? '📍 चालक खेत पर पहुँच गए हैं। लोडिंग जारी।' : '📍 गाडी शेतावर पोहोचली आहे. लोडिंग सुरू.',
        IN_TRANSIT: currentLang === 'en' ? '🚚 Produce loaded. In transit to destination mill.' : currentLang === 'hi' ? '🚚 माल लोड हो गया है। मिल की ओर रवाना।' : '🚚 माल लोड झाला. मिलकडे रवाना.',
        DELIVERED: currentLang === 'en' ? '✅ Produce delivered at Mill Gate. Payout milestone unlocked.' : currentLang === 'hi' ? '✅ माल मिल में पहुँच गया। भुगतान चरण शुरू।' : '✅ माल मिलवर पोहोचला. सेटलमेंट सुरू.'
      };
      setActionNotice(statusLabels[nextMilestone] || 'Status updated');
      setTimeout(() => setActionNotice(''), 4000);
      loadData();
    } catch (err) {
      alert('Milestone update error: ' + err.message);
    }
  };

  // Metrics Calculations
  const completedTripsCount = myTrips.filter(t => t.delivery_status === 'DELIVERED' || t.delivery_status === 'COMPLETED').length + (transporter?.trips_completed || 0);
  const activeTrip = myTrips.find(t => ['DISPATCHED', 'AT_FARM_GATE', 'IN_TRANSIT'].includes(t.delivery_status));
  const totalEarnings = myTrips.reduce((acc, t) => acc + (Number(t.freight_amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Notice Toast */}
        {actionNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 1. Driver & Vehicle Header */}
        <DriverHeader 
          transporter={transporter} 
          onStatusChange={handleStatusChange} 
          currentLang={currentLang} 
        />

        {/* 2. Metrics Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              {currentLang === 'en' ? 'Completed Trips' : currentLang === 'hi' ? 'पूर्ण ट्रिप्स' : 'यशस्वी ट्रिप्स'}
            </span>
            <p className="text-2xl font-bold font-mono text-[#1B4332] mt-1">{completedTripsCount}</p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% On-Time Delivery
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              {currentLang === 'en' ? 'Active Transit' : currentLang === 'hi' ? 'चालू ट्रिप' : 'चालू ट्रिप'}
            </span>
            <p className="text-2xl font-bold font-mono text-[#C86432] mt-1">{activeTrip ? '1' : '0'}</p>
            <span className="text-[11px] text-stone-500 font-medium mt-0.5">
              {activeTrip 
                ? activeTrip.delivery_status === 'AT_FARM_GATE'
                  ? (currentLang === 'en' ? '📍 At Farm (Loading)' : currentLang === 'hi' ? '📍 खेत पर (लोडिंग जारी)' : '📍 शेतावर (लोडिंग)')
                  : activeTrip.delivery_status === 'DISPATCHED'
                  ? (currentLang === 'en' ? '🚚 Dispatched to Farm' : currentLang === 'hi' ? '🚚 खेत की ओर रवाना' : '🚚 शेताकडे रवाना')
                  : (currentLang === 'en' ? '🚚 In Transit to Mill' : currentLang === 'hi' ? '🚚 मिल की ओर रवाना' : '🚚 शेतातून मिलकडे रवाना') 
                : (currentLang === 'en' ? 'No active trip currently' : currentLang === 'hi' ? 'फिलहाल कोई चालू ट्रिप नहीं' : 'सध्या कोणतीही ट्रिप चालू नाही')}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              {currentLang === 'en' ? 'Freight Revenue' : currentLang === 'hi' ? 'कुल भाड़ा आय' : 'एकूण वाहतूक कमाई'}
            </span>
            <p className="text-2xl font-bold font-mono text-stone-900 mt-1">₹{totalEarnings.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {currentLang === 'en' ? 'Direct Bank Settlement' : currentLang === 'hi' ? 'सीधे बैंक खाते में जमा' : 'थेट बँक खात्यात जमा'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD4] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              {currentLang === 'en' ? 'Transporter Rating' : currentLang === 'hi' ? 'चालक रेटिंग' : 'विश्वसनीयता रेटिंग'}
            </span>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-1">⭐ 5.0 / 5.0</p>
            <span className="text-[11px] text-stone-500 font-medium mt-0.5">
              {currentLang === 'en' ? 'Farmer & Mill Trust Score' : currentLang === 'hi' ? 'किसान व मिलर्स भरोसा' : 'शेतकरी व मिलर्स पसंती'}
            </span>
          </div>
        </div>

        {/* 3. Tab Switcher (Available Trips vs My Trips) */}
        <div className="flex items-center justify-between border-b border-[#E5DFD4] pt-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'available'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>
                {currentLang === 'en' ? 'Available Farm-Gate Pickups' : currentLang === 'hi' ? 'उपलब्ध ट्रिप्स' : 'उपलब्ध शेतीमाल वाहतूक मागण्या'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FAF7F2] border border-[#E5DFD4] text-stone-700 font-mono">
                {availableTrips.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('my-trips')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'my-trips'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>
                {currentLang === 'en' ? 'My Trips & E-Waybills' : currentLang === 'hi' ? 'मेरी ट्रिप्स व ई-वेबिल' : 'माझे ट्रिप्स व डिजिटल ई-वेबिल'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FAF7F2] border border-[#E5DFD4] text-stone-700 font-mono">
                {myTrips.length}
              </span>
            </button>
          </div>

          <button
            onClick={loadData}
            title="Refresh"
            className="p-2 text-stone-500 hover:text-[#1B4332] hover:bg-white rounded-xl border border-transparent hover:border-[#E5DFD4] transition-all cursor-pointer mb-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 4. Tab Contents */}
        {activeTab === 'available' ? (
          <div>
            {loading ? (
              <div className="py-16 text-center text-stone-500 bg-white rounded-3xl border border-[#E5DFD4]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1B4332]" />
                <p className="text-xs font-semibold">
                  {currentLang === 'en' ? 'Searching nearby farm-gate pickup demands...' : currentLang === 'hi' ? 'आसपास की पिकअप मांगों की खोज जारी है...' : 'जवळपासच्या ट्रिप मागण्या शोधत आहे...'}
                </p>
              </div>
            ) : availableTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {availableTrips.map((trip, idx) => (
                  <TripCard
                    key={trip.id || idx}
                    trip={trip}
                    onAccept={handleAcceptTrip}
                    onViewWaybill={setSelectedWaybillTrip}
                    isAvailable={transporter?.is_available !== false}
                    currentLang={currentLang}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 text-center bg-white rounded-3xl border border-[#E5DFD4] space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-stone-400">
                  <Truck className="w-7 h-7 text-stone-400" />
                </div>
                <h3 className="text-base font-bold text-stone-800 font-heading">
                  {currentLang === 'en' ? 'No new pickup demands available in your jurisdiction' : currentLang === 'hi' ? 'वर्तमान में आपके क्षेत्र में कोई नई पिकअप मांग उपलब्ध नहीं है' : 'सध्या तुमच्या कार्यक्षेत्रात नवीन पिकअप मागणी उपलब्ध नाही'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  {currentLang === 'en' 
                    ? 'As soon as a deal is locked between farmer and buyer mill, direct farm-gate transit demands will appear here immediately.' 
                    : currentLang === 'hi'
                    ? 'जैसे ही किसान और खरीदार मिल के बीच सौदा तय होगा (DEAL LOCKED), खेत से सीधी ढुलाई की मांग यहाँ तुरंत दिखाई देगी।'
                    : 'शेतकरी आणि खरेदीदार मिल यांच्यात सौदा पक्का होताच (DEAL LOCKED), शेतातून थेट वाहतुकीची मागणी येथे तात्काळ दिसेल.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {myTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myTrips.map((trip, idx) => (
                  <TripCard
                    key={trip.id || idx}
                    trip={trip}
                    onAccept={handleAcceptTrip}
                    onViewWaybill={setSelectedWaybillTrip}
                    onUpdateMilestone={handleUpdateMilestone}
                    isAvailable={transporter?.is_available !== false}
                    currentLang={currentLang}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 text-center bg-white rounded-3xl border border-[#E5DFD4] space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD4] flex items-center justify-center mx-auto text-stone-400">
                  <FileText className="w-7 h-7 text-stone-400" />
                </div>
                <h3 className="text-base font-bold text-stone-800 font-heading">
                  {currentLang === 'en' ? 'No trips accepted yet' : currentLang === 'hi' ? 'अभी तक कोई ट्रिप स्वीकार नहीं की गई है' : 'कोणतीही ट्रिप अद्याप स्वीकारलेली नाही'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  {currentLang === 'en' 
                    ? 'Accept new farm produce pickups from the Available Trips tab to generate official digital e-Waybills for your vehicle.' 
                    : currentLang === 'hi'
                    ? 'उपलब्ध ट्रिप्स टैब से नई फसल पिकअप स्वीकार करें और वाहन के लिए आधिकारिक डिजिटल ई-वेबिल प्राप्त करें।'
                    : 'उपलब्ध ट्रिप्स टॅबमधून नवीन शेतीमाल पिकअप स्वीकारा आणि गाडीसाठी अधिकृत डिजिटल ई-वेबिल प्राप्त करा.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. E-Waybill & QR Pass Modal */}
        {selectedWaybillTrip && (
          <WaybillModal
            trip={selectedWaybillTrip}
            transporter={transporter}
            onClose={() => setSelectedWaybillTrip(null)}
            currentLang={currentLang}
          />
        )}

      </div>
    </div>
  );
}
