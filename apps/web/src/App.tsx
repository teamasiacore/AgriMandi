import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketLiveFeed } from './components/MarketLiveFeed';
import { NetRealisationCalculator } from './components/NetRealisationCalculator';
import { ShieldCheck, ArrowRight, Layers, Award } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'mr' | 'hi' | 'en'>('mr');
  const [activeRole, setActiveRole] = useState<string>('FARMER');
  const [apiStatus, setApiStatus] = useState<'connected' | 'offline'>('connected');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) setApiStatus('connected');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  const heroContent = {
    mr: {
      badge: 'महाराष्ट्र शासन मार्गदर्शक तत्त्वानुसार थेट कृषी जोडणी',
      title: 'शेतकऱ्यांचा खरा नफा, थेट शेतमालाचा सौदा',
      desc: 'मंडीतील दलाली व वाहतूक कपातीपासून मुक्ती. data.gov.in AGMARKNET थेट दर संदर्भ आणि १००% सत्यापित थेट खरेदीदार.',
      btnRegister: 'शेतमाल विक्रीसाठी नोंदवा (Create Lot)',
      btnExplore: 'थेट खरेदीदार शोधा (Direct Buyers)',
      stats: [
        { value: '१००%', label: 'सत्यापित थेट खरेदीदार' },
        { value: '०% सेस', label: 'थेट शेतमाल खरेदीवर सेस सूट' },
        { value: '<५ मिनिट', label: 'पारदर्शक डिजिटल वजन पावती' },
      ],
    },
    hi: {
      badge: 'महाराष्ट्र कृषि विपणन अनुसार पारदर्शी मंच',
      title: 'किसान का सच्चा लाभ, खेत से सीधा सौदा',
      desc: 'मंडी कटौतियों और बिचौलियों से आजादी। data.gov.in AGMARKNET लाइव दर और १००% सत्यापित सीधे खरीदार।',
      btnRegister: 'फसल लॉट दर्ज करें (Create Lot)',
      btnExplore: 'सीधे खरीदार देखें (Direct Buyers)',
      stats: [
        { value: '१००%', label: 'सत्यापित खरीदार' },
        { value: '०% सेस', label: 'खेत खरीद पर सेस छूट' },
        { value: '<५ मिनट', label: 'डिजिटल वजन रसीद' },
      ],
    },
    en: {
      badge: 'Authentic B2B Agricultural Marketplace for Maharashtra',
      title: 'Maximise Net Farm Realization, Eliminate Distress Gluts',
      desc: 'Transparent freight & handling math. Real-time data.gov.in AGMARKNET benchmark prices and 100% verified direct food processors.',
      btnRegister: 'List Produce Lot (Farm-Gate)',
      btnExplore: 'Browse Verified Buyers',
      stats: [
        { value: '100%', label: 'Verified Buyers (GSTIN/APMC)' },
        { value: '0% Cess', label: 'Farm-Gate Exemption' },
        { value: '<5 Min', label: 'Digital Weighment Receipts' },
      ],
    },
  }[lang];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:py-8 space-y-6">
        {/* Hero Section */}
        <section className="bg-white rounded-3xl p-6 md:p-10 border border-agri-sandBorder shadow-xs relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-agri-light text-agri-dark rounded-full text-xs font-bold mb-4 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{heroContent.badge}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-agri-dark tracking-tight leading-tight mb-4">
              {heroContent.title}
            </h1>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium">
              {heroContent.desc}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button className="bg-agri-primary hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer">
                {heroContent.btnRegister}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                {heroContent.btnExplore}
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {heroContent.stats.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="bg-white p-2 rounded-lg text-agri-dark shadow-2xs">
                  <Award className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-900 font-mono">{s.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Reference Mandi Price Feed (AG-008) */}
        <section>
          <MarketLiveFeed lang={lang} />
        </section>

        {/* Net Realization Engine (AG-010) */}
        <section>
          <NetRealisationCalculator lang={lang} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-agri-sandBorder mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AgriMandi (कृषीसेतू) &bull; महाराष्ट्र थेट कृषी बाजार व व्यापार महामार्ग &bull; B2B Agro Trade Network</span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">API Status: {apiStatus === 'connected' ? '24/7 Live' : 'Ready'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
