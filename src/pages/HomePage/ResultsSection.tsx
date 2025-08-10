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
    statement1: 2400.00,
    statement2: 5713.21,
    difference: 3313.21,
    percentChange: 138.1,
    transactions1: [
      { id: 'income-1-1', date: '2025-01-15', description: 'Upwork Escrow Payment', amount: 1200.00, category: 'Income', type: 'credit' as const },
      { id: 'income-1-2', date: '2025-01-30', description: 'Stripe Transfer', amount: 1200.00, category: 'Income', type: 'credit' as const }
    ],
    transactions2: [
      { id: 'income-2-1', date: '2025-02-03', description: 'Paypal Transfer', amount: 964.61, category: 'Income', type: 'credit' as const },
      { id: 'income-2-2', date: '2025-02-03', description: 'Online Transfer', amount: 400.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-3', date: '2025-02-06', description: 'Upwork Escrow Payment', amount: 810.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-4', date: '2025-02-10', description: 'Stripe Transfer', amount: 193.90, category: 'Income', type: 'credit' as const },
      { id: 'income-2-5', date: '2025-02-13', description: 'Upwork Escrow Payment', amount: 630.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-6', date: '2025-02-18', description: 'ATM Cash Deposit', amount: 295.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-7', date: '2025-02-20', description: 'Upwork Escrow Payment', amount: 810.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-8', date: '2025-02-27', description: 'Upwork Escrow Payment', amount: 630.00, category: 'Income', type: 'credit' as const },
      { id: 'income-2-9', date: '2025-02-28', description: 'Stripe Transfer', amount: 970.70, category: 'Income', type: 'credit' as const }
    ]
  },
  {
    category: 'Food & Dining',
    icon: <Utensils className="h-5 w-5" />,
    statement1: 450.00,
    statement2: 680.00,
    difference: 230.00,
    percentChange: 51.1,
    transactions1: [
      { id: 'food-1-1', date: '2025-01-05', description: 'Starbucks', amount: 4.59, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-2', date: '2025-01-12', description: 'McDonald\'s', amount: 12.25, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-3', date: '2025-01-18', description: 'Salad and Go', amount: 13.36, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-4', date: '2025-01-25', description: 'Panda Express', amount: 11.15, category: 'Food & Dining', type: 'debit' as const },
      { id: 'food-1-5', date: '2025-01-28', description: 'Wingstop', amount: 16.02, category: 'Food & Dining', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-03', description: 'McDonald\'s', amount: 12.25, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-03', description: 'Tacos El Gordo', amount: 16.98, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-03', description: 'Shake Shack', amount: 21.64, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-04', description: 'Starbucks', amount: 4.59, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-04', description: 'Salad and Go', amount: 13.36, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-05', description: 'Salad and Go', amount: 8.95, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-05', description: 'NEW Asian Fusion', amount: 15.73, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-07', description: 'Raising Canes', amount: 11.23, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-07', description: 'Papa Chevos Taco', amount: 16.86, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-10', description: 'Panda Express', amount: 11.15, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-10', description: 'AZ Pho Grill', amount: 40.35, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-11', description: 'Wingstop', amount: 16.02, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-14', description: 'Chick-Fil-A', amount: 11.77, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-18', description: 'McDonald\'s', amount: 11.44, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-18', description: 'McDonald\'s', amount: 5.40, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-18', description: 'NEW Asian Fusion', amount: 16.27, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-18', description: 'Salad and Go', amount: 9.49, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-20', description: 'McDonald\'s', amount: 11.76, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-21', description: 'Salad and Go', amount: 9.06, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-24', description: 'Buffalo Wild Wings', amount: 38.72, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-24', description: 'Popeyes', amount: 12.85, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-27', description: 'Filibertos Mexican', amount: 17.34, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-27', description: 'Salad and Go', amount: 7.34, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-27', description: 'KFC', amount: 14.22, category: 'Food & Dining', type: 'debit' as const },
      { date: '2025-02-28', description: 'Filibertos Mexican', amount: 13.77, category: 'Food & Dining', type: 'debit' as const }
    ]
  },
  {
    category: 'Transportation',
    icon: <Car className="h-5 w-5" />,
    statement1: 180.00,
    statement2: 420.00,
    difference: 240.00,
    percentChange: 133.3,
    transactions1: [
      { date: '2025-01-08', description: 'Shell Gas Station', amount: 45.50, category: 'Transportation', type: 'debit' as const },
      { date: '2025-01-15', description: 'Uber Trip', amount: 40.38, category: 'Transportation', type: 'debit' as const },
      { date: '2025-01-22', description: 'Uber Trip', amount: 17.95, category: 'Transportation', type: 'debit' as const },
      { date: '2025-01-29', description: 'Arco Gas Station', amount: 51.78, category: 'Transportation', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-03', description: 'Uber Trip', amount: 40.38, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-03', description: 'Uber Trip', amount: 17.95, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-03', description: 'Shell Gas Station', amount: 31.41, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-04', description: 'Uber Trip', amount: 10.93, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-05', description: 'Los Perez Tire Shop', amount: 62.40, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-05', description: 'Autozone', amount: 15.08, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-05', description: 'Circle K Gas', amount: 35.04, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-10', description: 'Ls Bikemasters', amount: 31.24, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-10', description: 'Ace Parking', amount: 10.00, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-10', description: 'Circle K Gas', amount: 35.02, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-11', description: 'Circle K Gas', amount: 7.79, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-14', description: 'Circle K Gas', amount: 12.74, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-14', description: 'Autozone', amount: 65.51, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-18', description: 'Clean Freak Car Wash', amount: 14.00, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-18', description: 'Arco Gas Station', amount: 51.78, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-24', description: 'Circle K Gas', amount: 3.24, category: 'Transportation', type: 'debit' as const },
      { date: '2025-02-24', description: 'Circle K Gas', amount: 35.05, category: 'Transportation', type: 'debit' as const }
    ]
  },
  {
    category: 'Shopping',
    icon: <ShoppingBag className="h-5 w-5" />,
    statement1: 120.00,
    statement2: 280.00,
    difference: 160.00,
    percentChange: 133.3,
    transactions1: [
      { date: '2025-01-10', description: 'Target', amount: 27.81, category: 'Shopping', type: 'debit' as const },
      { date: '2025-01-18', description: 'Barnes and Noble', amount: 9.75, category: 'Shopping', type: 'debit' as const },
      { date: '2025-01-25', description: 'Barnes and Noble', amount: 2.98, category: 'Shopping', type: 'debit' as const },
      { date: '2025-01-28', description: 'Dollar Tree', amount: 2.54, category: 'Shopping', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-03', description: 'Gravitate Smoke Shop', amount: 12.68, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-06', description: 'Wal-Mart Super Center', amount: 48.48, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-06', description: 'Dollar Tree', amount: 2.54, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-07', description: 'Barnes and Noble', amount: 9.75, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-10', description: 'Gravitate Smoke Shop', amount: 7.81, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-10', description: 'Target', amount: 27.81, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-10', description: 'Barnes and Noble', amount: 2.98, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-18', description: 'Barnes and Noble', amount: 2.98, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-18', description: 'Barnes and Noble', amount: 2.97, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-21', description: 'Frys Food', amount: 42.64, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-24', description: 'Barnes and Noble', amount: 4.27, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-25', description: 'Frys Food', amount: 16.22, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-25', description: 'Dollar Tree', amount: 6.09, category: 'Shopping', type: 'debit' as const },
      { date: '2025-02-27', description: 'Frys Food', amount: 50.04, category: 'Shopping', type: 'debit' as const }
    ]
  },
  {
    category: 'Healthcare',
    icon: <Heart className="h-5 w-5" />,
    statement1: 0.00,
    statement2: 820.00,
    difference: 820.00,
    percentChange: 100,
    transactions1: [],
    transactions2: [
      { date: '2025-02-18', description: 'Dr. Kerry Zang', amount: 820.00, category: 'Healthcare', type: 'debit' as const }
    ]
  },
  {
    category: 'Business & Professional',
    icon: <Briefcase className="h-5 w-5" />,
    statement1: 85.00,
    statement2: 120.00,
    difference: 35.00,
    percentChange: 41.2,
    transactions1: [
      { date: '2025-01-07', description: 'Adobe Subscription', amount: 64.97, category: 'Business & Professional', type: 'debit' as const },
      { date: '2025-01-21', description: 'Anthropic Subscription', amount: 16.17, category: 'Business & Professional', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-03', description: 'X Corp Payment', amount: 8.62, category: 'Business & Professional', type: 'debit' as const },
      { date: '2025-02-07', description: 'Adobe Subscription', amount: 64.97, category: 'Business & Professional', type: 'debit' as const },
      { date: '2025-02-10', description: 'Adobe Subscription', amount: 64.97, category: 'Business & Professional', type: 'debit' as const },
      { date: '2025-02-21', description: 'Anthropic Subscription', amount: 16.17, category: 'Business & Professional', type: 'debit' as const },
      { date: '2025-02-18', description: 'Dropbox Payment', amount: 12.93, category: 'Business & Professional', type: 'debit' as const }
    ]
  },
  {
    category: 'Subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    statement1: 200.00,
    statement2: 350.00,
    difference: 150.00,
    percentChange: 75.0,
    transactions1: [
      { date: '2025-01-15', description: 'Netflix Subscription', amount: 15.99, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-01-30', description: 'Spotify Premium', amount: 9.99, category: 'Subscriptions', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-04', description: 'Centurylink Payment', amount: 55.78, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-02-19', description: 'Amazon Prime', amount: 16.16, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-02-19', description: 'Verizon Wireless', amount: 110.26, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-02-20', description: 'Apple.Com Bill', amount: 1.07, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-02-28', description: 'Progressive Insurance', amount: 136.00, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-02-18', description: 'Eos Fitness', amount: 10.14, category: 'Subscriptions', type: 'debit' as const },
      { date: '2025-02-28', description: 'Eos Fitness', amount: 5.00, category: 'Subscriptions', type: 'debit' as const }
    ]
  },
  {
    category: 'Groceries',
    icon: <ShoppingCart className="h-5 w-5" />,
    statement1: 150.00,
    statement2: 200.00,
    difference: 50.00,
    percentChange: 33.3,
    transactions1: [
      { date: '2025-01-10', description: 'Frys Food', amount: 45.50, category: 'Groceries', type: 'debit' as const },
      { date: '2025-01-25', description: 'Frys Food', amount: 38.25, category: 'Groceries', type: 'debit' as const },
      { date: '2025-01-28', description: 'Frys Food', amount: 66.25, category: 'Groceries', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-18', description: 'Frys Food', amount: 32.44, category: 'Groceries', type: 'debit' as const },
      { date: '2025-02-25', description: 'Frys Food', amount: 16.22, category: 'Groceries', type: 'debit' as const },
      { date: '2025-02-27', description: 'Frys Food', amount: 50.04, category: 'Groceries', type: 'debit' as const }
    ]
  },
  {
    category: 'Other',
    icon: <MoreHorizontal className="h-5 w-5" />,
    statement1: 300.00,
    statement2: 800.00,
    difference: 500.00,
    percentChange: 166.7,
    transactions1: [
      { date: '2025-01-05', description: 'ATM Withdrawal', amount: 100.00, category: 'Other', type: 'debit' as const },
      { date: '2025-01-15', description: 'Transfer to Savings', amount: 200.00, category: 'Other', type: 'debit' as const }
    ],
    transactions2: [
      { date: '2025-02-03', description: 'ATM Withdrawal', amount: 211.99, category: 'Other', type: 'debit' as const },
      { date: '2025-02-03', description: 'ATM Fee', amount: 3.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-04', description: 'Robinhood Debit', amount: 10.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-05', description: 'Flamingo Hotel', amount: 524.08, category: 'Other', type: 'debit' as const },
      { date: '2025-02-07', description: 'JPMorgan Chase Transfer', amount: 200.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-11', description: 'Robinhood Debit', amount: 10.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-18', description: 'ATM Withdrawal', amount: 103.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-18', description: 'ATM Fee', amount: 3.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-18', description: 'Student Loan Payment', amount: 135.19, category: 'Other', type: 'debit' as const },
      { date: '2025-02-19', description: 'Robinhood Debit', amount: 10.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-19', description: 'Student Loan Payment', amount: 58.30, category: 'Other', type: 'debit' as const },
      { date: '2025-02-24', description: 'ATM Withdrawal', amount: 200.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-25', description: 'Robinhood Debit', amount: 10.00, category: 'Other', type: 'debit' as const },
      { date: '2025-02-28', description: 'ATM Withdrawal', amount: 203.95, category: 'Other', type: 'debit' as const },
      { date: '2025-02-28', description: 'ATM Fee', amount: 3.00, category: 'Other', type: 'debit' as const }
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
                ${apiResult?.statement1.summary.totalWithdrawals.toFixed(2) || '2,835.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Deposits
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${apiResult?.statement1.summary.totalDeposits.toFixed(2) || '2,400.00'}
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
                ${apiResult?.statement2.summary.totalWithdrawals.toFixed(2) || '3,796.79'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Deposits
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${apiResult?.statement2.summary.totalDeposits.toFixed(2) || '5,713.21'}
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
