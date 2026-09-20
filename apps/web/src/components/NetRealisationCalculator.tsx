import { useState, useMemo } from 'react';
import { Calculator, ShieldAlert, Sparkles } from 'lucide-react';

interface CalculatorProps {
  lang: 'mr' | 'hi' | 'en';
}

export function NetRealisationCalculator({ lang }: CalculatorProps) {
  const [quantity, setQuantity] = useState<number>(50);
  const [grossPrice, setGrossPrice] = useState<number>(4850);
  const [distanceKm, setDistanceKm] = useState<number>(35);

  const transportCostPerKm = 4.2; // Eicher Truck standard tariff
  const holdingDays = 0;
  const weightLossPercent = 1.5;

  const quantityPills = [25, 50, 100, 200];

  const math = useMemo(() => {
    const grossTotal = quantity * grossPrice;
    const transportTotal = transportCostPerKm * distanceKm * 2; // to and fro or per trip tariff
    const storageTotal = holdingDays * 0.5 * quantity; // ₹0.50/qtl/day holding tariff
    const handlingTotal = quantity * 15; // ₹15/qtl unloading & bagging
    const apmcCess = grossTotal * 0.0105; // 1.05% APMC market fee
    const weightLossDeduction = grossTotal * (weightLossPercent / 100);

    const totalDeductionsApmc = transportTotal + storageTotal + handlingTotal + apmcCess + weightLossDeduction;
    const netReturnApmc = Math.max(0, grossTotal - totalDeductionsApmc);

    // Direct Farm-Gate Procurement Route (0 APMC cess, direct mill pickup, lower loss)
    const directHandling = quantity * 5;
    const totalDeductionsDirect = directHandling;
    const netReturnDirect = grossTotal - totalDeductionsDirect;
    const extraProfit = Math.max(0, netReturnDirect - netReturnApmc);

    return {
      grossTotal,
      transportTotal: Math.round(transportTotal),
      storageTotal: Math.round(storageTotal),
      handlingTotal: Math.round(handlingTotal),
      apmcCess: Math.round(apmcCess),
      weightLossDeduction: Math.round(weightLossDeduction),
      totalDeductionsApmc: Math.round(totalDeductionsApmc),
      netReturnApmc: Math.round(netReturnApmc),
      netReturnDirect: Math.round(netReturnDirect),
      extraProfit: Math.round(extraProfit),
      netPerQtlApmc: Math.round(netReturnApmc / quantity),
      netPerQtlDirect: Math.round(netReturnDirect / quantity),
    };
  }, [quantity, grossPrice, transportCostPerKm, distanceKm, holdingDays, weightLossPercent]);

  const t = {
    mr: {
      heading: 'खरा नफा मोजा (Net Realization Engine)',
      subtitle: 'मंडीतील छुपा खर्च (हमाली, तोलाई, भाडे) वजा करून प्रत्यक्ष हातात येणारा नफा',
      quantityLabel: 'शेतमाल प्रमाण (क्विंटल):',
      grossPriceLabel: 'अपेक्षित प्रति क्विंटल दर (₹):',
      distanceLabel: 'मंडीचे अंतर (किमी):',
      directBenefit: 'थेट खरेदीदारास विक्री केल्यास संभाव्य अतिरिक्त नफा:',
      apmcRoute: 'पारंपरिक APMC मंडी मार्ग',
      directRoute: 'AgriMandi थेट खरेदीदार मार्ग',
      inHandReturn: 'हात-मे-आने-वाला नफा',
      disclaimer: 'अंदाजित गणित: प्रत्यक्ष वजन आणि गुणवत्तेनुसार अंतिम आकडा बदलू शकतो.',
    },
    hi: {
      heading: 'वास्तविक लाभ कैलकुलेटर (Net Realization)',
      subtitle: 'मंडी की छिपी कटौतियां (हमाली, तुलाई, भाड़ा) घटाकर सीधा हाथ में आने वाला रिटर्न',
      quantityLabel: 'उपज मात्रा (क्विंटल):',
      grossPriceLabel: 'अपेक्षित प्रति क्विंटल भाव (₹):',
      distanceLabel: 'मंडी की दूरी (किमी):',
      directBenefit: 'सत्यापित सीधे खरीदार को बेचने पर अतिरिक्त बचत:',
      apmcRoute: 'पारंपरिक APMC मंडी मार्ग',
      directRoute: 'AgriMandi सीधा खरीदार मार्ग',
      inHandReturn: 'हाथ में आने वाला शुद्ध लाभ',
      disclaimer: 'अनुमानित गणना: वास्तविक तौल और गुणवत्ता के आधार पर अंतिम राशि तय होगी।',
    },
    en: {
      heading: 'Net Realization Engine (खरा नफा)',
      subtitle: 'Transparent freight, cess, and handling deduction calculator',
      quantityLabel: 'Produce Quantity (Quintals):',
      grossPriceLabel: 'Expected Price per Quintal (₹):',
      distanceLabel: 'Distance to Mandi (km):',
      directBenefit: 'Potential Extra Gain via Verified Direct Mill Route:',
      apmcRoute: 'Traditional APMC Route',
      directRoute: 'AgriMandi Direct Farm-Gate Route',
      inHandReturn: 'Net In-Hand Realization',
      disclaimer: 'Indicative estimate: Terminal weighment and physical inspection govern final settlement.',
    },
  }[lang];

  return (
    <div className="bg-white rounded-2xl border border-agri-sandBorder p-5 md:p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-5 h-5 text-agri-primary" />
        <h2 className="text-lg font-extrabold text-agri-dark tracking-tight">{t.heading}</h2>
      </div>
      <p className="text-xs text-slate-500 font-medium mb-6">{t.subtitle}</p>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Quantity Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            {t.quantityLabel}
          </label>
          <div className="flex gap-2">
            {quantityPills.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  quantity === q
                    ? 'bg-agri-dark text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {q} qtl
              </button>
            ))}
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            {t.grossPriceLabel}
          </label>
          <input
            type="number"
            value={grossPrice}
            onChange={(e) => setGrossPrice(Number(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-primary"
          />
        </div>

        {/* Distance Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            {t.distanceLabel}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-primary"
            />
            <span className="text-xs font-medium text-slate-400">km</span>
          </div>
        </div>
      </div>

      {/* Hero Comparison Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* APMC Route Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-3">
            <span>{t.apmcRoute}</span>
            <span className="text-slate-400 font-mono">₹{math.grossTotal.toLocaleString('en-IN')} Gross</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-200">
            <div className="flex justify-between">
              <span>वाहतूक खर्च (Freight):</span>
              <span className="font-mono text-red-600">-₹{math.transportTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>हमाली व तोलाई (Handling):</span>
              <span className="font-mono text-red-600">-₹{math.handlingTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>मंडी सेस / फी (1.05%):</span>
              <span className="font-mono text-red-600">-₹{math.apmcCess.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>घट / वाळ (Loss {weightLossPercent}%):</span>
              <span className="font-mono text-red-600">-₹{math.weightLossDeduction.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-600">{t.inHandReturn}:</span>
            <span className="text-xl font-black text-slate-800 font-mono">
              ₹{math.netReturnApmc.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> (₹{math.netPerQtlApmc}/qtl)</span>
            </span>
          </div>
        </div>

        {/* Direct AgriMandi Route Card */}
        <div className="bg-emerald-50/60 rounded-xl border-2 border-emerald-500/40 p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            शिफारस
          </div>

          <div className="text-xs font-bold text-emerald-900 mb-3">
            {t.directRoute}
          </div>

          <div className="space-y-1.5 text-xs text-emerald-800/80 mb-4 pb-3 border-b border-emerald-200">
            <div className="flex justify-between">
              <span>वाहतूक (खरेदीदार थेट पिकअप):</span>
              <span className="font-mono font-semibold text-emerald-700">₹0 (Zero)</span>
            </div>
            <div className="flex justify-between">
              <span>मंडी सेस सूट (0% Cess):</span>
              <span className="font-mono font-semibold text-emerald-700">₹0 (Zero)</span>
            </div>
            <div className="flex justify-between">
              <span>वजन पावती हमी:</span>
              <span className="font-mono font-semibold text-emerald-700">100% डिजिटल</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-emerald-900">{t.inHandReturn}:</span>
            <span className="text-xl font-black text-emerald-800 font-mono">
              ₹{math.netReturnDirect.toLocaleString('en-IN')}
              <span className="text-xs text-emerald-600 font-normal"> (₹{math.netPerQtlDirect}/qtl)</span>
            </span>
          </div>

          <div className="mt-3 pt-2.5 bg-emerald-100/70 -mx-4 -mb-4 px-4 py-2 flex items-center justify-between text-xs font-extrabold text-emerald-900">
            <span>{t.directBenefit}</span>
            <span className="text-emerald-700 font-mono text-sm">+₹{math.extraProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{t.disclaimer}</span>
      </div>
    </div>
  );
}
