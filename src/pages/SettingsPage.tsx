import React, { useState, useEffect } from 'react';
import { Moon, Sun, Trash2, User, Mail, Key, Globe, Palette, CreditCard, RefreshCw, Check, X, MessageCircle } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useSubscription } from '../hooks/useSubscription';
import { useSearchParams } from 'react-router-dom';
import FeedbackForm from '../components/FeedbackForm';

export default function SettingsPage({ 
  isDark, 
  onToggleDarkMode, 
  user 
}: { 
  isDark: boolean; 
  onToggleDarkMode: () => void; 
  user: SupabaseUser | null;
}) {
  console.log('⚙️ SettingsPage: Component rendered with props:', { 
    isDark, 
    hasUser: !!user, 
    userId: user?.id 
  });
  
  const { subscriptionData, isLoading, error, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  
  console.log('⚙️ SettingsPage: useSubscription hook returned:', {
    hasSubscriptionData: !!subscriptionData,
    isLoading,
    error,
    subscriptionData
  });

  // Check for success parameter from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setShowSuccess(true);
      // Refresh subscription data
      refreshSubscription();
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, refreshSubscription]);

  // Debug effect to track changes
  useEffect(() => {
    console.log('⚙️ SettingsPage: useEffect triggered - subscription data changed:', {
      hasSubscriptionData: !!subscriptionData,
      isLoading,
      error,
      subscriptionData
    });
  }, [subscriptionData, isLoading, error]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg">
            <Check className="h-5 w-5" />
            <span>Payment successful! Your subscription is now active.</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Settings
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Customize your StatementCompare experience
        </p>
      </div>

      <div className="space-y-8">
        {/* Subscription */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Subscription
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDark ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading subscription data... (Debug: isLoading={isLoading.toString()})
              </p>
              <div className="mt-2 text-xs opacity-75">
                <p>User: {user?.id || 'None'}</p>
                <p>Subscription Data: {subscriptionData ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
              </div>
            </div>
          ) : error ? (
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-red-900/20 border-red-700/50' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
              <button
                onClick={refreshSubscription}
                className={`mt-2 text-sm underline ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
              >
                Try again
              </button>
            </div>
          ) : subscriptionData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Tier
                  </label>
                  <div className={`px-4 py-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}>
                    <span className="font-semibold">
                      {subscriptionData.tierName}
                    </span>
                    {subscriptionData.monthlyPages > 0 && (
                      <div className="text-xs mt-1 opacity-75">
                    
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Pages Remaining
                  </label>
                  <div className={`px-4 py-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}>
                    <span className="font-semibold">
                      {subscriptionData.pagesRemaining} pages
                    </span>
                    {subscriptionData.pagesUsed > 0 && (
                      <div className="text-xs mt-1 opacity-75">
                       
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end">
                  <a 
                    href={`https://billing.stripe.com/p/login/test_dRmdRbcurfW97JAdhBgUM00?prefilled_email=${user?.email || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full px-4 py-3 rounded-lg transition-colors font-medium text-center ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Manage Subscription
                  </a>
                </div>
              </div>


            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>No subscription data available</p>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <Palette className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Appearance
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Dark Mode
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <User className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Account
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none cursor-not-allowed opacity-75`}
                  />
                </div>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email address cannot be changed
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Language
                </label>
                <div className="relative">
                  <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <select
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors appearance-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>

            <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
              <Key className="h-4 w-4" />
              Change Password
            </button>
          </div>
        </div>


        {/* Feedback */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Feedback & Support
            </h2>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark 
              ? 'bg-blue-900/20 border-blue-700/50' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`font-medium mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Help Us Improve
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Share your thoughts, report issues, or suggest improvements. Your feedback helps us make this tool better.
            </p>
            <FeedbackForm isDark={isDark} context="general" />
          </div>
        </div>

        {/* Delete Account */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Delete Account
            </h2>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark 
              ? 'bg-red-900/20 border-red-700/50' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Permanently Delete Account
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              This action cannot be undone. All your comparison history and account data will be permanently deleted.
            </p>
            <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}>
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className={`px-6 py-3 rounded-lg transition-colors font-medium ${
            isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}