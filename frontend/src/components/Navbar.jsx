import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, ShoppingBag, Globe, LogIn, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Navbar({ currentLang = 'mr', onLangChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = translations[currentLang] || translations.mr;

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('agri_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_token');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { label: t.navHome, path: '/' },
    { label: t.navFarmer, path: '/farmer', icon: Sprout },
    { label: t.navBuyer, path: '/buyer', icon: ShoppingBag }
  ];

  const languages = [
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'en', name: 'English' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FCFAF6]/95 backdrop-blur-md border-b border-[#E5DFD4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/images/AgriMandi Logo without background.png" 
              alt="AgriMandi Logo" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-heading text-[#1B4332] tracking-tight leading-none">
                {t.brandTitle}
              </span>
              <span className="text-[11px] font-medium text-stone-500 tracking-wider uppercase mt-1">
                {t.brandTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'text-stone-700 hover:text-[#1B4332] hover:bg-[#F3EDE2]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools: Language Toggle & Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5DFD4] bg-white text-stone-700 text-xs font-semibold hover:border-[#1B4332] transition-colors"
                title="Change Platform Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#C86432]" />
                <span>{t.langLabel}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#E5DFD4] py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        if (onLangChange) onLangChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#FAF7F2] ${
                        currentLang === l.code ? 'text-[#1B4332] font-bold bg-[#FAF7F2]' : 'text-stone-600'
                      }`}
                    >
                      {l.name}
                      {currentLang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-[#1B4332]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth State: Logged In vs Logged Out */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DFD4] rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1B4332] leading-tight max-w-[120px] truncate">{user.name}</p>
                    <span className="inline-block text-[10px] font-semibold text-[#C86432] uppercase">
                      {user.role === 'FARMER' ? t.roleFarmer : t.roleBuyer}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#1B4332] hover:bg-[#F3EDE2] rounded-lg transition-colors border border-[#1B4332]/30"
                >
                  {t.signIn}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  {t.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-[#FAF7F2] border border-[#E5DFD4]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5DFD4] space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${
                  location.pathname === link.path
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-[#F3EDE2]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-[#E5DFD4] flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-stone-500">भाषा / Language:</span>
              <div className="flex gap-1.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      if (onLangChange) onLangChange(l.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      currentLang === l.code
                        ? 'bg-[#1B4332] text-white font-bold'
                        : 'bg-white border border-[#E5DFD4] text-stone-700'
                    }`}
                  >
                    {l.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2 bg-[#FAF7F2] rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-[#1B4332]">{user.name}</p>
                    <span className="text-xs font-semibold text-[#C86432] uppercase">{user.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-red-600 px-3 py-1 bg-white border border-red-200 rounded-md"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-bold text-[#1B4332] border border-[#1B4332] rounded-lg"
                  >
                    {t.signIn}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-bold text-white bg-[#1B4332] rounded-lg shadow-sm"
                  >
                    {t.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
