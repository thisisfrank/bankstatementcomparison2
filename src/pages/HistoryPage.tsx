import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Download, Trash2, Eye, Calendar, Filter, Search, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ExportService } from '../services/exportService';

interface ComparisonHistory {
  id: string;
  date: string;
  statement1Name: string;
  statement2Name: string;
  result?: any; // API result data
  userId?: string;
  pagesConsumed?: number;
  file1Pages?: number;
  file2Pages?: number;
}

export default function HistoryPage({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date'>('date');
  const [history, setHistory] = useState<ComparisonHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load history from enhanced Supabase usage_logs table
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        console.log('🔄 HistoryPage: Starting to load history for user:', user?.id);
        
        if (user?.id) {
          // Load complete comparison history from Supabase usage_logs
          console.log('🔍 HistoryPage: Querying usage_logs table...');
          
          // First, try a simple query to see if the table exists and has any data
          const { data: testData, error: testError } = await supabase
            .from('usage_logs')
            .select('count')
            .eq('user_id', user.id);
          
          console.log('🧪 HistoryPage: Test query result:', { testData, testError });
          
          // Now try the full query
          const { data: usageLogs, error } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          console.log('📊 HistoryPage: Supabase query result:', { usageLogs, error });
          
          if (error) {
            console.error('❌ HistoryPage: Failed to load usage logs from Supabase:', error);
            setHistory([]);
          } else {
            console.log('✅ HistoryPage: Successfully loaded usage logs:', usageLogs);
            
            if (!usageLogs || usageLogs.length === 0) {
              console.log('ℹ️ HistoryPage: No usage logs found for user');
              setHistory([]);
              return;
            }
            
            // Transform Supabase data to ComparisonHistory format
            const transformedHistory: ComparisonHistory[] = usageLogs.map(log => {
              console.log('🔄 HistoryPage: Transforming log:', log);
              return {
                id: log.id,
                date: log.created_at,
                statement1Name: log.statement1_name || 'Unknown',
                statement2Name: log.statement2_name || 'Unknown',
                result: log.comparison_summary, // Store comparison summary as result
                userId: log.user_id,
                pagesConsumed: log.pages_consumed,
                file1Pages: log.file1_pages,
                file2Pages: log.file2_pages
              };
            });
            
            console.log('✅ HistoryPage: Transformed history:', transformedHistory);
            setHistory(transformedHistory);
          }
        } else {
          // Not signed in, show empty history
          console.log('ℹ️ HistoryPage: No user ID, showing empty history');
          setHistory([]);
        }
      } catch (error) {
        console.error('❌ HistoryPage: Unexpected error loading history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
        console.log('🏁 HistoryPage: Finished loading history');
      }
    };

    loadHistory();
  }, [user?.id]);

  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.statement1Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.statement2Name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewComparison = (item: ComparisonHistory) => {
    // Extract full comparison data from the enhanced comparison_summary
    let fullComparisonData = null;
    
    console.log('🔍 HistoryPage: Processing comparison item for view:', item);
    
    if (item.result && typeof item.result === 'object') {
      // If we have the enhanced comparison_summary, extract the full data
      if (item.result.fullComparison) {
        console.log('📊 HistoryPage: Using enhanced comparison_summary format');
        // This is the new enhanced format with full data
        fullComparisonData = {
          statement1: item.result.statement1.fullData,
          statement2: item.result.statement2.fullData,
          comparison: item.result.comparison.fullComparison
        };
      } else if (item.result.comparison && Array.isArray(item.result.comparison)) {
        console.log('📊 HistoryPage: Using direct comparison array format');
        // Direct comparison array format
        fullComparisonData = {
          statement1: item.result.statement1 || {},
          statement2: item.result.statement2 || {},
          comparison: item.result.comparison
        };
      } else {
        console.log('📊 HistoryPage: Using fallback result format');
        // Fallback for old format or direct result data
        fullComparisonData = item.result;
      }
      
      console.log('✅ HistoryPage: Transformed comparison data:', fullComparisonData);
    } else {
      console.warn('⚠️ HistoryPage: No result data found for comparison item');
    }
    
    // Navigate to home page with comparison results
    navigate('/', { 
      state: { 
        showResults: true,
        statement1Name: item.statement1Name,
        statement2Name: item.statement2Name,
        fromHistory: true,
        apiResult: fullComparisonData // Pass the full comparison data
      }
    });
  };

  const handleDeleteComparison = async (itemId: string) => {
    try {
      if (user?.id) {
        // Delete from Supabase
        const { error } = await supabase
          .from('usage_logs')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Failed to delete comparison from Supabase:', error);
          return;
        }
        
        // Update local state
        const updatedHistory = history.filter(item => item.id !== itemId);
        setHistory(updatedHistory);
        console.log('🗑️ Deleted comparison from Supabase');
      }
    } catch (error) {
      console.error('Failed to delete comparison:', error);
    }
  };

  const handleExportPDF = (item: ComparisonHistory) => {
    try {
      if (!item.result) {
        alert('No comparison data available for export.');
        return;
      }

      // Extract comparison data from the stored result
      let comparisonData = null;
      if (item.result.fullComparison) {
        comparisonData = item.result.fullComparison;
      } else if (item.result.comparison && Array.isArray(item.result.comparison)) {
        comparisonData = item.result.comparison;
      } else {
        comparisonData = item.result;
      }

      if (!comparisonData) {
        alert('Comparison data format not supported for export.');
        return;
      }

      // Transform the data to match the export format
      const categories = comparisonData.map((cat: any) => ({
        category: cat.category,
        statement1: cat.statement1Total || 0,
        statement2: cat.statement2Total || 0,
        difference: cat.difference || 0,
        percentChange: cat.percentChange || 0,
        transactions1: cat.transactions1 || [],
        transactions2: cat.transactions2 || []
      }));

      const exportData = ExportService.prepareExportData(
        categories,
        item.statement1Name,
        item.statement2Name,
        item.result
      );

      ExportService.exportToPDF(exportData);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportCSV = (item: ComparisonHistory) => {
    try {
      if (!item.result) {
        alert('No comparison data available for export.');
        return;
      }

      // Extract comparison data from the stored result
      let comparisonData = null;
      if (item.result.fullComparison) {
        comparisonData = item.result.fullComparison;
      } else if (item.result.comparison && Array.isArray(item.result.comparison)) {
        comparisonData = item.result.comparison;
      } else {
        comparisonData = item.result;
      }

      if (!comparisonData) {
        alert('Comparison data format not supported for export.');
        return;
      }

      // Transform the data to match the export format
      const categories = comparisonData.map((cat: any) => ({
        category: cat.category,
        statement1: cat.statement1Total || 0,
        statement2: cat.statement2Total || 0,
        difference: cat.difference || 0,
        percentChange: cat.percentChange || 0,
        transactions1: cat.transactions1 || [],
        transactions2: cat.transactions2 || []
      }));

      const exportData = ExportService.prepareExportData(
        categories,
        item.statement1Name,
        item.statement2Name,
        item.result
      );

      ExportService.exportToCSV(exportData);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Comparison History
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          View and manage your previous bank statement comparisons
        </p>
      </div>

      {/* Filters and Search */}
      <div className={`rounded-xl p-6 mb-8 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search comparisons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Sort By */}
          <div className="relative">
            <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors appearance-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="date">Sort by Date</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredHistory.length} comparison{filteredHistory.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className={`text-center py-12 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <Clock className={`h-16 w-16 mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Loading history...
          </h3>
          <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            Please wait while we fetch your comparison history.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <FileText className={`h-16 w-16 mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {searchTerm ? 'No comparisons found' : 'No comparison history yet'}
          </h3>
          <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start by creating your first comparison. Your comparison history will appear here once you run some comparisons.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Go to Comparison Tool
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-6 shadow-lg border transition-all hover:shadow-xl ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {item.statement1Name} vs {item.statement2Name}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {formatDate(item.date)}
                      </span>
                    </div>
                    
                    {item.pagesConsumed && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {item.pagesConsumed} pages total
                        </span>
                      </div>
                    )}
                    
                    {item.file1Pages && item.file2Pages && (
                      <div className="flex items-center gap-2">
                        <FileText className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {item.file1Pages} + {item.file2Pages} pages
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewComparison(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleExportPDF(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-orange-900/20 text-orange-400 hover:text-orange-300' 
                        : 'hover:bg-orange-50 text-orange-500 hover:text-orange-700'
                    }`}
                    title="Export PDF"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleExportCSV(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-green-900/20 text-green-400 hover:text-green-300' 
                        : 'hover:bg-green-50 text-green-500 hover:text-green-700'
                    }`}
                    title="Export CSV"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteComparison(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-50 text-red-500 hover:text-red-700'
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}