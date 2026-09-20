import { Sprout, Globe } from 'lucide-react';

interface NavbarProps {
  lang: 'mr' | 'hi' | 'en';
  onLanguageChange: (lang: 'mr' | 'hi' | 'en') => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export function Navbar({ lang, onLanguageChange, activeRole, onRoleChange }: NavbarProps) {
  const roles = [
    { id: 'FARMER', labelMr: 'शेतकरी', labelHi: 'किसान', labelEn: 'Farmer' },
    { id: 'BUYER', labelMr: 'खरेदीदार', labelHi: 'खरीदार', labelEn: 'Buyer' },
    { id: 'FPO', labelMr: 'FPO गट', labelHi: 'FPO समूह', labelEn: 'FPO Desk' },
    { id: 'ADMIN', labelMr: 'प्रशासन', labelHi: 'प्रशासन', labelEn: 'SuperAdmin' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-agri-sandBorder sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="bg-agri-dark text-white p-2.5 rounded-xl shadow-xs">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-agri-dark tracking-tight">AgriMandi</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-agri-light text-agri-dark rounded-md border border-emerald-200">
                महाराष्ट्र
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              कृषीसेतू डिजिटल बाजार जोडणी
            </p>
          </div>
        </div>

        {/* Role Navigation Pills */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {roles.map((r) => {
            const label = lang === 'mr' ? r.labelMr : lang === 'hi' ? r.labelHi : r.labelEn;
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-agri-dark text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {(['mr', 'hi', 'en'] as const).map((code) => (
            <button
              key={code}
              onClick={() => onLanguageChange(code)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === code
                  ? 'bg-agri-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {code === 'mr' ? 'मराठी' : code === 'hi' ? 'हिंदी' : 'EN'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
