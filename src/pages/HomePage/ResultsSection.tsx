import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, BarChart3, Home, Car, Utensils, ShoppingBag, Gamepad2, Heart, Briefcase, MoreHorizontal } from 'lucide-react';
import { CategoryComparison } from './index';

// Helper function to get category icons
const getCategoryIcon = (category: string): React.ReactNode => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('housing') || categoryLower.includes('rent') || categoryLower.includes('mortgage')) {
    return <Home className="h-5 w-5" />;
  }
  if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('car') || categoryLower.includes('fuel')) {
    return <Car className="h-5 w-5" />;
  }
  if (categoryLower.includes('food') || categoryLower.includes('dining') || categoryLower.includes('restaurant') || categoryLower.includes('grocery')) {
    return <Utensils className="h-5 w-5" />;
  }
  if (categoryLower.includes('shopping') || categoryLower.includes('retail') || categoryLower.includes('store')) {
    return <ShoppingBag className="h-5 w-5" />;
  }
  if (categoryLower.includes('entertainment') || categoryLower.includes('gaming') || categoryLower.includes('movie')) {
    return <Gamepad2 className="h-5 w-5" />;
  }
  if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('pharmacy')) {
    return <Heart className="h-5 w-5" />;
  }
  if (categoryLower.includes('business') || categoryLower.includes('work') || categoryLower.includes('office')) {
    return <Briefcase className="h-5 w-5" />;
  }
  
  // Default icon
  return <MoreHorizontal className="h-5 w-5" />;
};

const mockComparison: CategoryComparison[] = [
  {
    category: 'Housing',
    icon: <Home className="h-5 w-5" />,
    statement1: 2450.00,
    statement2: 2450.00,
    difference: 0.00,
    percentChange: 0,
    transactions1: [
      { date: '2024-01-01', description: 'Rent Payment', amount: 2450.00, category: 'Housing', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2024-02-01', description: 'Rent Payment', amount: 2450.00, category: 'Housing', type: 'debit' as const }
    ]
  },
  {
    category: 'Transportation',
    icon: <Car className="h-5 w-5" />,
    statement1: 340.50,
    statement2: 425.75,
    difference: 85.25,
    percentChange: 25.0,
    transactions1: [
      { date: '2024-01-05', description: 'Gas Station', amount: 65.50, category: 'Transportation', type: 'debit' as const },
      { date: '2024-01-12', description: 'Gas Station', amount: 72.00, category: 'Transportation', type: 'debit' as const },
      { date: '2024-01-20', description: 'Car Insurance', amount: 203.00, category: 'Transportation', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2024-02-03', description: 'Gas Station', amount: 68.25, category: 'Transportation', type: 'debit' as const },
      { date: '2024-02-10', description: 'Gas Station', amount: 74.50, category: 'Transportation', type: 'debit' as const },
      { date: '2024-02-18', description: 'Car Insurance', amount: 203.00, category: 'Transportation', type: 'debit' as const },
      { date: '2024-02-25', description: 'Car Repair', amount: 80.00, category: 'Transportation', type: 'debit' as const }
    ]
  },
  {
    category: 'Food & Dining',
    icon: <Utensils className="h-5 w-5" />,
    statement1: 680.25,
    statement2: 520.40,
    difference: -159.85,
    percentChange: -23.5,
    transactions1: [
      { date: '2024-01-03', description: 'Grocery Store', amount: 125.50, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-01-08', description: 'Restaurant', amount: 45.75, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-01-15', description: 'Grocery Store', amount: 98.25, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-01-22', description: 'Coffee Shop', amount: 28.50, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-01-28', description: 'Takeout', amount: 35.75, category: 'Food & Dining', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2024-02-02', description: 'Grocery Store', amount: 110.25, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-02-09', description: 'Restaurant', amount: 52.30, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-02-16', description: 'Grocery Store', amount: 89.40, category: 'Food & Dining', type: 'debit' as const },
      { date: '2024-02-23', description: 'Coffee Shop', amount: 22.75, category: 'Food & Dining', type: 'debit' as const }
    ]
  }
];

interface ResultsSectionProps {
  isDark: boolean;
  isSignedIn: boolean;
  statementLabels: {
    statement1: string;
    statement2: string;
  };
  apiResult?: any; // API result type would be defined in your API service
}

export default function ResultsSection({ isDark, isSignedIn, statementLabels, apiResult }: ResultsSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Use API data if available, otherwise fall back to mock data
  const displayData = apiResult?.comparison.map((item: any) => ({
    category: item.category,
    icon: getCategoryIcon(item.category),
    statement1: item.statement1Total,
    statement2: item.statement2Total,
    difference: item.difference,
    percentChange: item.percentChange,
    transactions1: item.transactions1,
    transactions2: item.transactions2
  })) || mockComparison;

  return (
    <>
      {/* Results Header */}
      <div className="text-center">
        <h2 className={`text-3xl font-bold mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Spending Comparison Results
        </h2>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Comparing {statementLabels.statement1} vs {statementLabels.statement2}
        </p>
        
        {/* Sign-in Overlay for Signed Out Users */}
        {!isSignedIn && (
          <div className={`mt-6 p-6 rounded-xl border-2 border-dashed ${
            isDark 
              ? 'bg-blue-900/20 border-blue-600' 
              : 'bg-blue-50 border-blue-500'
          }`}>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Sign in for your free comparison
            </h3>
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              This is a preview with sample data. Sign up to analyze your real bank statements.
            </p>
            <Link 
              to="/pricing"
              className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Sign Up - Free Tier Available
            </Link>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Statement 1
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Withdrawals
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                ${apiResult?.statement1.summary.totalWithdrawals.toFixed(2) || '3,470.75'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Deposits
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${apiResult?.statement1.summary.totalDeposits.toFixed(2) || '4,250.00'}
              </span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Statement 2
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Withdrawals
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                ${apiResult?.statement2.summary.totalWithdrawals.toFixed(2) || '3,396.15'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Deposits
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${apiResult?.statement2.summary.totalDeposits.toFixed(2) || '4,250.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="space-y-4">
        <h3 className={`text-2xl font-semibold ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Category Breakdown
        </h3>
        
        {displayData.map((category: CategoryComparison) => (
          <div
            key={category.category}
            className={`rounded-xl p-6 shadow-lg border transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedCategory(
                expandedCategory === category.category ? null : category.category
              )}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  {category.icon}
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {category.category}
                  </h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {category.transactions1.length + category.transactions2.length} transactions
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Statement 1
                  </p>
                  <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    ${category.statement1.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Statement 2
                  </p>
                  <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    ${category.statement2.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Difference
                  </p>
                  <p className={`font-semibold ${
                    category.difference > 0 
                      ? 'text-red-500' 
                      : category.difference < 0 
                        ? 'text-green-500' 
                        : isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {category.difference > 0 ? '+' : ''}${category.difference.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {expandedCategory === category.category && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className={`font-medium mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Statement 1 Transactions
                    </h5>
                    <div className="space-y-2">
                      {category.transactions1.map((transaction, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {transaction.date} - {transaction.description}
                          </span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className={`font-medium mb-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Statement 2 Transactions
                    </h5>
                    <div className="space-y-2">
                      {category.transactions2.map((transaction, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {transaction.date} - {transaction.description}
                          </span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Options - Disabled for preview users */}
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="flex gap-4 w-full">
          <button 
            disabled={!isSignedIn}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isSignedIn
                ? isDark 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                : isDark
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}>
            <Download className="h-5 w-5" />
            Export PDF Report
          </button>
          
          <button 
            disabled={!isSignedIn}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isSignedIn
                ? isDark 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                : isDark
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}>
            <Download className="h-5 w-5" />
            Export CSV Data
          </button>
        </div>
        
        <button 
          disabled={!isSignedIn}
          className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            isSignedIn
              ? isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              : isDark
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          <BarChart3 className="h-5 w-5" />
          Generate New Comparison
        </button>
      </div>
    </>
  );
}
