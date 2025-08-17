import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Shield, Download, BarChart3, X, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { redirectToPaymentLink, StripeTier } from '../services/stripe';
import { useSearchParams } from 'react-router-dom';

interface PricingPageProps {
  isDark: boolean;
  onShowAuthModal?: () => void;
}

export default function PricingPage({ isDark, onShowAuthModal }: PricingPageProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState<number[]>([]);
  const { isSignedIn, user } = useAuth();
  const [searchParams] = useSearchParams();

  // Check URL parameters for success/error feedback
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    
    if (canceled === 'true') {
      setShowError(true);
      setErrorMessage('Payment was canceled. You can try again anytime.');
      setTimeout(() => setShowError(false), 5000);
    }
  }, [searchParams]);

  const handleFreeSignUp = () => {
    if (onShowAuthModal) {
      onShowAuthModal();
    }
  };

  const handlePaidSubscription = async (tier: StripeTier) => {
    if (!isSignedIn || !user) {
      // If not signed in, show auth modal first
      if (onShowAuthModal) {
        onShowAuthModal();
      }
      return;
    }

    // Direct redirect to payment link
    redirectToPaymentLink(tier);
  };

  const getButtonText = (tier: string) => {
    if (tier === 'free') {
      return 'Sign Up';
    }
    return 'Subscribe Now';
  };

  const getButtonDisabled = (tier: string) => {
    return false; // No loading states needed for direct links
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg">
            <Check className="h-5 w-5" />
            <span>Payment successful! Your subscription is now active.</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-4 text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
            <button
              onClick={() => setShowError(false)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Simple Pricing
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Choose the plan that fits your needs
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Sign Up - Free */}
        <div className={`rounded-xl p-6 border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Sign Up
            </h3>
            <div className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Free
            </div>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              40 pages per month
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Give it a try
            </p>
          </div>

          <button 
            onClick={handleFreeSignUp}
            className={`w-full py-3 rounded-lg transition-colors font-medium ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {getButtonText('free')}
          </button>
        </div>

        {/* Starter */}
        <div className={`rounded-xl p-6 border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Starter
            </h3>
            <div className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              $29<span className="text-lg">/month</span>
            </div>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              150 pages per month
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Perfect for individuals
            </p>
          </div>

          <button 
            onClick={() => handlePaidSubscription('STARTER')}
            disabled={getButtonDisabled('STARTER')}
            className={`w-full py-3 rounded-lg transition-colors font-medium ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getButtonText('STARTER')}
          </button>
        </div>

        {/* Pro - Most Popular */}
        <div className={`rounded-xl p-6 border-2 relative ${
          isDark 
            ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-600' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500'
        }`}>
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              isDark 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              <Star className="h-4 w-4" />
              Most Popular
            </div>
          </div>

          <div className="text-center mb-6 mt-4">
            <h3 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Pro
            </h3>
            <div className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              $69<span className="text-lg">/month</span>
            </div>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              400 pages per month
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Great for small teams
            </p>
          </div>

          <button 
            onClick={() => handlePaidSubscription('PRO')}
            disabled={getButtonDisabled('PRO')}
            className={`w-full py-3 rounded-lg transition-colors font-medium ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getButtonText('PRO')}
          </button>
        </div>

        {/* Business */}
        <div className={`rounded-xl p-6 border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center mb-6">
            <h3 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Business
            </h3>
            <div className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              $149<span className="text-lg">/month</span>
            </div>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              1,000 pages per month
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Enterprise solution
            </p>
          </div>

          <button 
            onClick={() => handlePaidSubscription('BUSINESS')}
            disabled={getButtonDisabled('BUSINESS')}
            className={`w-full py-3 rounded-lg transition-colors font-medium ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getButtonText('BUSINESS')}
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <Zap className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Lightning Fast
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Get results in seconds, not hours of manual spreadsheet work
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <Shield className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            No PDFs Stored
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            We only keep your spending summaries - never 
            your original bank statements or account details
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <BarChart3 className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Smart Analysis
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              AI-powered categorization for crystal clear comparisons
            </p>
          </div>
        </div>
      </div>

             {/* FAQ */}
       <div className={`rounded-xl p-8 ${
         isDark ? 'bg-transparent' : 'bg-gray-50'
       }`}>
        <h2 className={`text-2xl font-bold text-center mb-8 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {[
            {
              question: "Who is this tool for?",
              answer: "Perfect for co-parents tracking shared expenses, roommates splitting costs, couples managing joint finances, or anyone wanting to compare their spending patterns month-to-month."
            },
            {
              question: "Is there a file size limit?",
              answer: "Yes, we recommend keeping bank statement files under 10MB for optimal processing speed. Most monthly bank statements are well under this limit."
            },
            {
              question: "Which banks are supported?",
              answer: "We support PDF statements from Wells Fargo, Chase, Bank of America, Citi, and most major banks. If your bank isn't supported, contact us!"
            },
            {
              question: "Is my financial data safe?",
              answer: "Yes, we use industry-standard security practices. Your PDF files are processed securely and we only store the categorized spending summaries (not your raw transaction details or account numbers). All data is encrypted and stored securely in our database."
            },
            {
              question: "Do you store my bank statements?",
              answer: "We do not store your original PDF files. After processing, we only keep the categorized spending totals and comparison results associated with your account so you can access your analysis history."
            },
            {
              question: "Can I get a refund?",
              answer: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
            }
          ].map((faq, index) => (
            <div key={index} className={`border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full px-6 py-4 text-left flex items-center justify-between transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {faq.question}
                </h3>
                {expandedFAQs.includes(index) ? (
                  <ChevronDown className={`h-5 w-5 transition-transform ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronRight className={`h-5 w-5 transition-transform ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
              {expandedFAQs.includes(index) && (
                <div className={`px-6 pb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}