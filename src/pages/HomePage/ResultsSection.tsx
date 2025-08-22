import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, BarChart3, Home, Car, Utensils, ShoppingBag, Gamepad2, Heart, Briefcase, MoreHorizontal, CreditCard, ShoppingCart, X } from 'lucide-react';
import { CategoryComparison } from './index';
import TransactionManager, { Transaction } from '../../components/TransactionManager';
import EditableTransactionRow from '../../components/EditableTransactionRow';
import { ExportService } from '../../services/exportService';
import FeedbackForm from '../../components/FeedbackForm';
import { TransactionCategorizer } from '../../services/categorizer';

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

interface ResultsSectionProps {
  isDark: boolean;
  isSignedIn: boolean;
  statementLabels: { statement1: string; statement2: string };
  apiResult?: any; // API result type would be defined in your API service
  onResetComparison: () => void;
}

export default function ResultsSection({ isDark, isSignedIn, statementLabels, apiResult, onResetComparison }: ResultsSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Initialize custom categories from categorizer
  useEffect(() => {
    TransactionCategorizer.initialize();
    // Load any existing custom categories from localStorage
    try {
      const saved = localStorage.getItem('customCategories');
      if (saved) {
        const loaded = JSON.parse(saved);
        setCustomCategories(loaded);
      }
    } catch (error) {
      console.warn('Failed to load custom categories:', error);
    }
  }, []);

  // Custom category management functions
  const handleAddCustomCategory = (category: string) => {
    TransactionCategorizer.addCustomCategory(category);
    setCustomCategories(prev => [...prev, category]);
  };

  const handleRemoveCustomCategory = (category: string) => {
    TransactionCategorizer.removeCustomCategory(category);
    setCustomCategories(prev => prev.filter(cat => cat !== category));
  };

  const handleTransactionCategoryChange = (transactionId: string, newCategory: string) => {
    // This function will be called when users edit transaction categories
    // In a real implementation, you'd want to update the API result state
    // and potentially save changes to your backend
    console.log('Transaction category changed:', { transactionId, newCategory });
    
    // For now, we'll just log the change since we're working with read-only API results
    // In production, you'd want to:
    // 1. Update the local state
    // 2. Send the change to your backend
    // 3. Update the comparison calculations
  };

  // Debug logging for apiResult structure
  console.log('🔍 ResultsSection: apiResult received:', {
    hasApiResult: !!apiResult,
    apiResultType: typeof apiResult,
    keys: apiResult ? Object.keys(apiResult) : null,
    statement1Keys: apiResult?.statement1 ? Object.keys(apiResult.statement1) : null,
    statement2Keys: apiResult?.statement2 ? Object.keys(apiResult.statement2) : null,
    comparisonType: typeof apiResult?.comparison,
    isComparisonArray: Array.isArray(apiResult?.comparison)
  });

  // Use API data if available, otherwise show empty state
  const displayData = (() => {
    // Check if apiResult exists and has the expected structure
    if (apiResult?.comparison && Array.isArray(apiResult.comparison)) {
      try {
        return apiResult.comparison.map((item: any) => ({
          category: item.category,
          icon: getCategoryIcon(item.category),
          statement1: item.statement1Total,
          statement2: item.statement2Total,
          difference: item.difference,
          percentChange: item.percentChange,
          transactions1: item.transactions1 || [],
          transactions2: item.transactions2 || []
        }));
      } catch (error) {
        console.error('Error processing comparison data:', error);
        return [];
      }
    }
    
    // If apiResult exists but doesn't have the expected structure, log it for debugging
    if (apiResult) {
      console.log('⚠️ apiResult structure:', {
        hasComparison: !!apiResult.comparison,
        comparisonType: typeof apiResult.comparison,
        isArray: Array.isArray(apiResult.comparison),
        keys: Object.keys(apiResult),
        comparisonKeys: apiResult.comparison ? Object.keys(apiResult.comparison) : null
      });
    }
    
    return [];
  })();

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

  const handleExportPDF = () => {
    try {
      const exportData = ExportService.prepareExportData(
        displayData,
        statementLabels.statement1,
        statementLabels.statement2,
        apiResult
      );
      ExportService.exportToPDF(exportData);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      const exportData = ExportService.prepareExportData(
        displayData,
        statementLabels.statement1,
        statementLabels.statement2,
        apiResult
      );
      ExportService.exportToCSV(exportData);
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  };

  // Show empty state if no data
  if (!apiResult || displayData.length === 0) {
    return (
      <>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            No Comparison Data Available
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Upload two bank statements to see your spending comparison
          </p>
        </div>

        {/* Upload Prompt */}
        <div className={`max-w-md mx-auto p-6 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <BarChart3 className={`h-12 w-12 mx-auto mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Ready to Compare?
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Upload your bank statements to get started with spending analysis
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={onResetComparison}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Start New Comparison
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-4 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Spending Comparison Results
        </h2>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {statementLabels.statement1} vs {statementLabels.statement2}
        </p>
        
        {/* Sign Up Prompt for non-signed-in users */}
        {!isSignedIn && (
          <div className={`mt-4 p-4 rounded-lg ${
            isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              💡 Sign up to save your comparison results and access your history
            </p>
            <Link
              to="/pricing"
              className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                ${apiResult?.statement1?.summary?.totalWithdrawals?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Deposits
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${apiResult?.statement1?.summary?.totalDeposits?.toFixed(2) || '0.00'}
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
                ${apiResult?.statement2?.summary?.totalWithdrawals?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Deposits
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${apiResult?.statement2?.summary?.totalDeposits?.toFixed(2) || '0.00'}
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

      {/* Custom Categories Management - Only for signed-in users */}
      {isSignedIn && customCategories.length > 0 && (
        <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Custom Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {customCategories.map(category => (
              <div
                key={category}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                  isDark ? 'bg-purple-900/30 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800 border border-purple-200'
                }`}
              >
                <span>★ {category}</span>
                <button
                  onClick={() => handleRemoveCustomCategory(category)}
                  className="ml-1 hover:text-red-500 transition-colors"
                  title="Remove custom category"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Custom categories are saved locally and will be available for future comparisons.
          </p>
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
                      <div className="space-y-2">
                        {category.transactions1.map((transaction, idx) => (
                          <EditableTransactionRow
                            key={transaction.id || idx}
                            transaction={convertTransactionsWithIds([transaction])[0]}
                            onCategoryChange={handleTransactionCategoryChange}
                            availableCategories={TransactionCategorizer.getAvailableCategories()}
                            customCategories={customCategories}
                            onAddCustomCategory={handleAddCustomCategory}
                            onRemoveCustomCategory={handleRemoveCustomCategory}
                            isDark={isDark}
                          />
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
                          <EditableTransactionRow
                            key={transaction.id || idx}
                            transaction={convertTransactionsWithIds([transaction])[0]}
                            onCategoryChange={handleTransactionCategoryChange}
                            availableCategories={TransactionCategorizer.getAvailableCategories()}
                            customCategories={customCategories}
                            onAddCustomCategory={handleAddCustomCategory}
                            onRemoveCustomCategory={handleRemoveCustomCategory}
                            isDark={isDark}
                          />
                        ))}
                      </div>
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
                          <EditableTransactionRow
                            key={transaction.id || idx}
                            transaction={convertTransactionsWithIds([transaction])[0]}
                            onCategoryChange={handleTransactionCategoryChange}
                            availableCategories={TransactionCategorizer.getAvailableCategories()}
                            customCategories={customCategories}
                            onAddCustomCategory={handleAddCustomCategory}
                            onRemoveCustomCategory={handleRemoveCustomCategory}
                            isDark={isDark}
                          />
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
                          <EditableTransactionRow
                            key={transaction.id || idx}
                            transaction={convertTransactionsWithIds([transaction])[0]}
                            onCategoryChange={handleTransactionCategoryChange}
                            availableCategories={TransactionCategorizer.getAvailableCategories()}
                            customCategories={customCategories}
                            onAddCustomCategory={handleAddCustomCategory}
                            onRemoveCustomCategory={handleRemoveCustomCategory}
                            isDark={isDark}
                          />
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
            onClick={handleExportPDF}
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
            onClick={handleExportCSV}
            disabled={!isSignedIn}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isSignedIn
                ? isDark 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                : isDark
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
        
        {/* Feedback Button */}
        <div className="flex justify-center pt-2">
          <FeedbackForm isDark={isDark} context="comparison" />
        </div>
      </div>
    </>
  );
}