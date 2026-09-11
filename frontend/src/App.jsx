import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import FarmerPortal from './pages/FarmerPortal';
import BuyerPortal from './pages/BuyerPortal';
import TransporterPortal from './pages/TransporterPortal';
import AuthPage from './pages/AuthPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AgriMandi ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center bg-[#FAF7F2]">
          <div className="max-w-md p-8 bg-white rounded-3xl border border-[#E5DFD4] shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-[#1B4332]">View Update Required</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              A temporary interface state occurred. Click below to refresh your dashboard cleanly.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] cursor-pointer"
            >
              Refresh View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('agri_lang') || 'mr';
  });

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('agri_lang', lang);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800 font-sans selection:bg-[#1B4332] selection:text-white">
        <Navbar 
          currentLang={currentLang} 
          onLangChange={handleLangChange} 
        />
        
        <main className="grow">
          <ErrorBoundary>
            <Routes>
            <Route 
              path="/" 
              element={<LandingPage currentLang={currentLang} />} 
            />
            
            {/* Protected Farmer Portal: Requires login as FARMER */}
            <Route 
              path="/farmer" 
              element={
                <ProtectedRoute requiredRole="FARMER">
                  <FarmerPortal currentLang={currentLang} />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Buyer Portal: Requires login as BUYER */}
            <Route 
              path="/buyer" 
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerPortal currentLang={currentLang} />
                </ProtectedRoute>
              } 
            />

            {/* Protected Transporter Portal: Requires login as TRANSPORTER */}
            <Route 
              path="/transporter" 
              element={
                <ProtectedRoute requiredRole="TRANSPORTER">
                  <TransporterPortal currentLang={currentLang} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/login" 
              element={<AuthPage currentLang={currentLang} initialMode="login" />} 
            />
            <Route 
              path="/register" 
              element={<AuthPage currentLang={currentLang} initialMode="register" />} 
            />

            {/* SuperAdmin Dashboard (ASIACore / Satya123) */}
            <Route 
              path="/admin" 
              element={<SuperAdminDashboard currentLang={currentLang} />} 
            />
            
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}
