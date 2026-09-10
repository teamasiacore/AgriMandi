import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import FarmerPortal from './pages/FarmerPortal';
import BuyerPortal from './pages/BuyerPortal';
import AuthPage from './pages/AuthPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

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
        </main>
      </div>
    </Router>
  );
}
