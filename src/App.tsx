import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart3, LogIn, LogOut, DollarSign as PricingIcon, Clock, Settings } from 'lucide-react';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function Header({ isDark, isSignedIn, setIsSignedIn }: { 
  isDark: boolean; 
  isSignedIn: boolean;
  setIsSignedIn: (value: boolean) => void;
}) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-sm ${
      isDark 
        ? 'bg-gray-900/80 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-600'}`}>
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Bank Statement Comparison
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isSignedIn ? (
              <>
                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/history')
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Past Documents
                </Link>
                
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/settings')
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/pricing"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/pricing')
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <PricingIcon className="h-4 w-4" />
                  Pricing
                </Link>
              </>
            )}

            {/* Sign In/Out Button */}
            <button
              onClick={() => setIsSignedIn(!isSignedIn)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                isSignedIn
                  ? isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  : isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSignedIn ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className={`md:hidden p-2 rounded-lg ${
            isDark 
              ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}>
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <Header 
          isDark={isDarkMode} 
          isSignedIn={isSignedIn}
          setIsSignedIn={setIsSignedIn}
        />
        
        <Routes>
          <Route path="/" element={<HomePage isDark={isDarkMode} isSignedIn={isSignedIn} />} />
          <Route path="/pricing" element={<PricingPage isDark={isDarkMode} />} />
          <Route path="/history" element={<HistoryPage isDark={isDarkMode} />} />
          <Route path="/settings" element={<SettingsPage isDark={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;