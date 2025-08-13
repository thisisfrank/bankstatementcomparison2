import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, BarChart3, Home, Car, Utensils, ShoppingBag, Gamepad2, Heart, Briefcase, MoreHorizontal, CreditCard, ShoppingCart } from 'lucide-react';
import { CategoryComparison } from './index';
import TransactionManager, { Transaction } from '../../components/TransactionManager';

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
    category: 'Income',
    icon: <Briefcase className="h-5 w-5" />,
    statement1: 3850.00,
    statement2: 4120.00,
    difference: 270.00,
    percentChange: 7.0,
    transactions1: [
      { id: 'income-1-1', date: '2025-01-15', description: 'Stripe Payment Processing', amount: 1850.00, category: 'Income', type: 'credit' as const },
      { id: 'income-1-2', date: '2025-01-30', description: 'PayPal Transfer', amount: 2000.00, category: 'Income', type: 'credit' as const }
    ],
    transactions2: [
      { id: 'income-2-1', date: '2025-02-03', description: 'Square Payment', amount: 1680.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-2', date: '2025-02-10', description: 'Stripe Payment Processing', amount: 1950.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-3', date: '2025-02-18', description: 'Direct Deposit', amount: 490.00, category: 'Income', type: 'credit' as const }
    ]
  },
  {
    category: 'Food & Dining',
    icon: <Utensils className="h-5 w-5" />,
    statement1: 445.00,
    statement2: 487.00,
    difference: 42.00,
    percentChange: 9.4,
    transactions1: [
      { id: 'food-1-1', date: '2025-01-05', description: 'McDonald\'s', amount: 12.45, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-2', date: '2025-01-12', description: 'Starbucks', amount: 5.89, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-3', date: '2025-01-18', description: 'Chipotle', amount: 18.75, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-4', date: '2025-01-25', description: 'Pizza Hut', amount: 24.99, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-5', date: '2025-01-28', description: 'Subway', amount: 11.50, category: 'Food & Dining', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'food-2-1', date: '2025-02-03', description: 'Burger King', amount: 14.25, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-2', date: '2025-02-05', description: 'Taco Bell', amount: 16.80, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-3', date: '2025-02-07', description: 'KFC', amount: 19.95, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-4', date: '2025-02-10', description: 'Wendy\'s', amount: 13.45, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-5', date: '2025-02-14', description: 'Domino\'s Pizza', amount: 28.50, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-6', date: '2025-02-18', description: 'Arby\'s', amount: 15.75, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-7', date: '2025-02-21', description: 'Popeyes', amount: 17.25, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-8', date: '2025-02-24', description: 'Little Caesars', amount: 22.99, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-2-9', date: '2025-02-27', description: 'Sonic Drive-In', amount: 18.50, category: 'Food & Dining', type: 'debit' as const }
    ]
  },
  {
    category: 'Transportation',
    icon: <Car className="h-5 w-5" />,
    statement1: 287.00,
    statement2: 312.00,
    difference: 25.00,
    percentChange: 8.7,
    transactions1: [
      { id: 'transport-1-1', date: '2025-01-08', description: 'Shell Gas Station', amount: 45.50, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-1-2', date: '2025-01-15', description: 'Uber Ride', amount: 28.75, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-1-3', date: '2025-01-22', description: 'Exxon Gas Station', amount: 52.25, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-1-4', date: '2025-01-29', description: 'BP Gas Station', amount: 48.00, category: 'Transportation', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'transport-2-1', date: '2025-02-03', description: 'Chevron Gas Station', amount: 47.80, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-2', date: '2025-02-05', description: 'Uber Ride', amount: 32.45, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-3', date: '2025-02-07', description: 'Mobil Gas Station', amount: 51.20, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-4', date: '2025-02-10', description: 'Lyft Ride', amount: 29.90, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-5', date: '2025-02-14', description: 'Circle K Gas', amount: 38.75, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-6', date: '2025-02-18', description: '7-Eleven Gas', amount: 42.30, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-7', date: '2025-02-21', description: 'Uber Ride', amount: 25.60, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-8', date: '2025-02-24', description: 'Speedway Gas', amount: 44.15, category: 'Transportation', type: 'debit' as const },
      { id: 'transport-2-9', date: '2025-02-27', description: 'Lyft Ride', amount: 27.85, category: 'Transportation', type: 'debit' as const }
    ]
  },
  {
    category: 'Shopping',
    icon: <ShoppingBag className="h-5 w-5" />,
    statement1: 234.00,
    statement2: 267.00,
    difference: 33.00,
    percentChange: 14.1,
    transactions1: [
      { id: 'shopping-1-1', date: '2025-01-10', description: 'Target', amount: 45.75, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-1-2', date: '2025-01-18', description: 'Walmart', amount: 67.20, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-1-3', date: '2025-01-25', description: 'Amazon.com', amount: 32.45, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-1-4', date: '2025-01-28', description: 'Best Buy', amount: 34.60, category: 'Shopping', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'shopping-2-1', date: '2025-02-03', description: 'Home Depot', amount: 89.95, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-2', date: '2025-02-06', description: 'Costco', amount: 156.80, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-3', date: '2025-02-10', description: 'Target', amount: 38.25, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-4', date: '2025-02-14', description: 'Amazon.com', amount: 27.50, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-5', date: '2025-02-18', description: 'Macy\'s', amount: 89.99, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-6', date: '2025-02-21', description: 'Kohl\'s', amount: 67.45, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-7', date: '2025-02-24', description: 'Old Navy', amount: 45.20, category: 'Shopping', type: 'debit' as const },
      { id: 'shopping-2-8', date: '2025-02-27', description: 'Gap', amount: 78.90, category: 'Shopping', type: 'debit' as const }
    ]
  },
  {
    category: 'Healthcare',
    icon: <Heart className="h-5 w-5" />,
    statement1: 0.00,
    statement2: 387.00,
    difference: 387.00,
    percentChange: 100,
    transactions1: [],
    transactions2: [
      { id: 'health-2-1', date: '2025-02-05', description: 'CVS Pharmacy', amount: 45.75, category: 'Healthcare', type: 'debit' as const },
      { id: 'health-2-2', date: '2025-02-12', description: 'Walgreens', amount: 32.50, category: 'Healthcare', type: 'debit' as const },
      { id: 'health-2-3', date: '2025-02-18', description: 'Optometrist Visit', amount: 125.00, category: 'Healthcare', type: 'debit' as const },
      { id: 'health-2-4', date: '2025-02-25', description: 'Dental Checkup', amount: 184.75, category: 'Healthcare', type: 'debit' as const }
    ]
  },
  {
    category: 'Business & Professional',
    icon: <Briefcase className="h-5 w-5" />,
    statement1: 118.00,
    statement2: 134.00,
    difference: 16.00,
    percentChange: 13.6,
    transactions1: [
      { id: 'business-1-1', date: '2025-01-07', description: 'Adobe Creative Cloud', amount: 52.99, category: 'Business & Professional', type: 'debit' as const },
      { id: 'business-1-2', date: '2025-01-21', description: 'Notion Premium', amount: 8.00, category: 'Business & Professional', type: 'debit' as const },
      { id: 'business-1-3', date: '2025-01-28', description: 'Slack Pro', amount: 34.00, category: 'Business & Professional', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'business-2-1', date: '2025-02-03', description: 'Adobe Creative Cloud', amount: 52.99, category: 'Business & Professional', type: 'debit' as const },
      { id: 'business-2-2', date: '2025-02-07', description: 'Asana Premium', amount: 10.99, category: 'Business & Professional', type: 'debit' as const },
      { id: 'business-2-3', date: '2025-02-14', description: 'Trello Business', amount: 12.50, category: 'Business & Professional', type: 'debit' as const },
      { id: 'business-2-4', date: '2025-02-21', description: 'Notion Premium', amount: 8.00, category: 'Business & Professional', type: 'debit' as const },
      { id: 'business-2-5', date: '2025-02-28', description: 'Slack Pro', amount: 34.00, category: 'Business & Professional', type: 'debit' as const }
    ]
  },
  {
    category: 'Subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    statement1: 89.00,
    statement2: 112.00,
    difference: 23.00,
    percentChange: 25.8,
    transactions1: [
      { id: 'subscription-1-1', date: '2025-01-15', description: 'Netflix Premium', amount: 19.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-1-2', date: '2025-01-30', description: 'Spotify Premium', amount: 9.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-1-3', date: '2025-01-30', description: 'Hulu Ad-Free', amount: 17.99, category: 'Subscriptions', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'subscription-2-1', date: '2025-02-04', description: 'Netflix Premium', amount: 19.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-2-2', date: '2025-02-04', description: 'Spotify Premium', amount: 9.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-2-3', date: '2025-02-04', description: 'Hulu Ad-Free', amount: 17.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-2-4', date: '2025-02-19', description: 'Amazon Prime', amount: 14.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-2-5', date: '2025-02-19', description: 'Disney+ Premium', amount: 13.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-2-6', date: '2025-02-20', description: 'YouTube Premium', amount: 11.99, category: 'Subscriptions', type: 'debit' as const },
      { id: 'subscription-2-7', date: '2025-02-28', description: 'Gym Membership', amount: 24.06, category: 'Subscriptions', type: 'debit' as const }
    ]
  },
  {
    category: 'Groceries',
    icon: <ShoppingCart className="h-5 w-5" />,
    statement1: 267.00,
    statement2: 298.00,
    difference: 31.00,
    percentChange: 11.6,
    transactions1: [
      { id: 'groceries-1-1', date: '2025-01-10', description: 'Kroger', amount: 67.45, category: 'Groceries', type: 'debit' as const },
      { id: 'groceries-1-2', date: '2025-01-25', description: 'Safeway', amount: 89.20, category: 'Groceries', type: 'debit' as const },
      { id: 'groceries-1-3', date: '2025-01-28', description: 'Whole Foods', amount: 63.35, category: 'Groceries', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'groceries-2-1', date: '2025-02-08', description: 'Kroger', amount: 78.90, category: 'Groceries', type: 'debit' as const },
      { id: 'groceries-2-2', date: '2025-02-15', description: 'Safeway', amount: 92.45, category: 'Groceries', type: 'debit' as const },
      { id: 'groceries-2-3', date: '2025-02-22', description: 'Whole Foods', amount: 58.75, category: 'Groceries', type: 'debit' as const },
      { id: 'groceries-2-4', date: '2025-02-28', description: 'Trader Joe\'s', amount: 67.90, category: 'Groceries', type: 'debit' as const }
    ]
  },
  {
    category: 'Other',
    icon: <MoreHorizontal className="h-5 w-5" />,
    statement1: 178.00,
    statement2: 203.00,
    difference: 25.00,
    percentChange: 14.0,
    transactions1: [
      { id: 'other-1-1', date: '2025-01-05', description: 'ATM Withdrawal', amount: 100.00, category: 'Other', type: 'debit' as const },
      { id: 'other-1-2', date: '2025-01-15', description: 'Transfer to Savings', amount: 78.00, category: 'Other', type: 'debit' as const }
    ],
    transactions2: [
      { id: 'other-2-1', date: '2025-02-03', description: 'ATM Withdrawal', amount: 120.00, category: 'Other', type: 'debit' as const },
      { id: 'other-2-2', date: '2025-02-05', description: 'Bank Transfer Fee', amount: 3.00, category: 'Other', type: 'debit' as const },
      { id: 'other-2-3', date: '2025-02-10', description: 'Investment Deposit', amount: 200.00, category: 'Other', type: 'debit' as const },
      { id: 'other-2-4', date: '2025-02-15', description: 'ATM Withdrawal', amount: 80.00, category: 'Other', type: 'debit' as const },
      { id: 'other-2-5', date: '2025-02-20', description: 'Bank Transfer Fee', amount: 3.00, category: 'Other', type: 'debit' as const },
      { id: 'other-2-6', date: '2025-02-25', description: 'Investment Deposit', amount: 150.00, category: 'Other', type: 'debit' as const },
      { id: 'other-2-7', date: '2025-02-28', description: 'ATM Withdrawal', amount: 100.00, category: 'Other', type: 'debit' as const }
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
  onResetComparison: () => void;
}

export default function ResultsSection({ isDark, isSignedIn, statementLabels, apiResult, onResetComparison }: ResultsSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<CategoryComparison[]>(mockComparison);
  const [editMode, setEditMode] = useState(false);

  // Use API data if available, otherwise fall back to editable mock data for preview
  const displayData = apiResult?.comparison.map((item: any) => ({
    category: item.category,
    icon: getCategoryIcon(item.category),
    statement1: item.statement1Total,
    statement2: item.statement2Total,
    difference: item.difference,
    percentChange: item.percentChange,
    transactions1: item.transactions1,
    transactions2: item.transactions2
  })) || editableData;

  // Convert transactions to have IDs for editing
  const convertTransactionsWithIds = (transactions: any[]): Transaction[] => {
    return transactions.map((t, index) => ({
      id: t.id || `${t.category}-${index}-${Date.now()}`,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type
    }));
  };

  const handleTransactionsChange = (category: string, statementKey: 'transactions1' | 'transactions2', newTransactions: Transaction[]) => {
    setEditableData(prev => prev.map(item => {
      if (item.category === category) {
        // Calculate new totals
        const statement1Total = statementKey === 'transactions1' 
          ? newTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)
          : item.transactions1.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
        
        const statement2Total = statementKey === 'transactions2'
          ? newTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)
          : item.transactions2.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
        
        const difference = statement2Total - statement1Total;
        const percentChange = statement1Total !== 0 ? ((difference / Math.abs(statement1Total)) * 100) : 0;
        
        return {
          ...item,
          [statementKey]: newTransactions,
          statement1: Math.abs(statement1Total),
          statement2: Math.abs(statement2Total),
          difference: Math.abs(difference),
          percentChange: Math.round(percentChange * 10) / 10
        };
      }
      return item;
    }));
  };

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
                 ${apiResult?.statement1.summary.totalWithdrawals.toFixed(2) || '1,529.00'}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                 Deposits
               </span>
               <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                 ${apiResult?.statement1.summary.totalDeposits.toFixed(2) || '3,850.00'}
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
                 ${apiResult?.statement2.summary.totalWithdrawals.toFixed(2) || '1,899.00'}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                 Deposits
               </span>
               <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                 ${apiResult?.statement2.summary.totalDeposits.toFixed(2) || '4,120.00'}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Toggle - Only for signed-in users */}
      {isSignedIn && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              editMode
                ? isDark 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                : isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {editMode ? 'Exit Edit Mode' : 'Edit Transactions'}
          </button>
        </div>
      )}

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
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className={`font-medium mb-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Statement 1 Transactions
                      </h5>
                      <TransactionManager
                        isDark={isDark}
                        transactions={convertTransactionsWithIds(category.transactions1)}
                        onTransactionsChange={(newTransactions) => 
                          handleTransactionsChange(category.category, 'transactions1', newTransactions)
                        }
                        category={category.category}
                      />
                    </div>
                    
                    <div>
                      <h5 className={`font-medium mb-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Statement 2 Transactions
                      </h5>
                      <TransactionManager
                        isDark={isDark}
                        transactions={convertTransactionsWithIds(category.transactions2)}
                        onTransactionsChange={(newTransactions) => 
                          handleTransactionsChange(category.category, 'transactions2', newTransactions)
                        }
                        category={category.category}
                      />
                    </div>
                  </div>
                ) : (
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
                )}
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
          onClick={onResetComparison}
          className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            isDark 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}>
          <BarChart3 className="h-5 w-5" />
          Generate New Comparison
        </button>
      </div>
    </>
  );
}
