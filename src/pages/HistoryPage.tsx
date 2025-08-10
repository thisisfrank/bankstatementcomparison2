import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Download, Trash2, Eye, Calendar, Filter, Search, BarChart3, FileText } from 'lucide-react';

interface ComparisonHistory {
  id: string;
  date: string;
  statement1Name: string;
  statement2Name: string;
  result?: any; // API result data
}

export default function HistoryPage({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date'>('date');
  const [history, setHistory] = useState<ComparisonHistory[]>([]);
  const navigate = useNavigate();

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('comparisonHistory') || '[]');
      setHistory(savedHistory);
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
      setHistory([]);
    }
  }, []);

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
    // Navigate to home page with comparison results
    navigate('/', { 
      state: { 
        showResults: true,
        statement1Name: item.statement1Name,
        statement2Name: item.statement2Name,
        fromHistory: true,
        apiResult: item.result // Pass the actual result data
      }
    });
  };

  const handleDeleteComparison = (itemId: string) => {
    try {
      const updatedHistory = history.filter(item => item.id !== itemId);
      setHistory(updatedHistory);
      localStorage.setItem('comparisonHistory', JSON.stringify(updatedHistory));
      console.log('🗑️ Deleted comparison from history');
    } catch (error) {
      console.error('Failed to delete comparison from history:', error);
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
      {filteredHistory.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <Clock className={`h-16 w-16 mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No comparisons found
          </h3>
          <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start by creating your first comparison'
            }
          </p>
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
                    
                    <div></div>
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

      {/* Empty State for New Users */}
      {history.length === 0 && (
        <div className={`text-center py-16 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <Clock className={isDark ? 'h-20 w-20 mx-auto mb-6 text-gray-600' : 'h-20 w-20 mx-auto mb-6 text-gray-400'} />
          <h3 className={isDark ? 'text-2xl font-semibold mb-4 text-gray-300' : 'text-2xl font-semibold mb-4 text-gray-700'}>
            No comparison history yet
          </h3>
          <p className={isDark ? 'mb-6 text-gray-500' : 'mb-6 text-gray-500'}>
            Your completed comparisons will appear here for easy access and management
          </p>
          <button className={isDark ? 'inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white' : 'inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white'}>
            <BarChart3 className="h-5 w-5" />
            Create Your First Comparison
          </button>
        </div>
      )}
    </div>
  );
}