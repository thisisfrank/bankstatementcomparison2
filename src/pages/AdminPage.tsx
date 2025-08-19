import React, { useState, useEffect } from 'react';
import { Shield, LogIn, Lock, Eye, EyeOff, CheckCircle, XCircle, Calendar, User, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UsageLog } from '../lib/supabase';

interface AdminPageProps {
  isDark: boolean;
}

interface AdminCredentials {
  username: string;
  password: string;
}

interface AttemptRecord {
  id: string;
  userId: string;
  userEmail: string;
  statement1Name: string;
  statement2Name: string;
  file1Pages: number;
  file2Pages: number;
  totalPages: number;
  status: 'completed' | 'failed' | 'validation_error' | 'api_error' | 'database_error';
  errorMessage?: string;
  timestamp: string;
  processingTime?: number;
}

export default function AdminPage({ isDark }: AdminPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data state
  const [successfulAttempts, setSuccessfulAttempts] = useState<AttemptRecord[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<AttemptRecord[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchAdminData = async () => {
    setIsDataLoading(true);
    try {
      // Fetch all usage logs with user profiles
      const { data: usageLogs, error } = await supabase
        .from('usage_logs')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching usage logs:', error);
        return;
      }

      // Transform the data
      const attempts: AttemptRecord[] = (usageLogs || []).map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        userEmail: log.profiles?.email || 'Unknown User',
        statement1Name: log.statement1_name || 'Unknown',
        statement2Name: log.statement2_name || 'Unknown',
        file1Pages: log.file1_pages || 0,
        file2Pages: log.file2_pages || 0,
        totalPages: (log.file1_pages || 0) + (log.file2_pages || 0),
        status: log.status || 'completed',
        errorMessage: log.error_message,
        timestamp: log.created_at,
        processingTime: log.processing_time
      }));

      // Separate successful and failed attempts
      const successful = attempts.filter(attempt => attempt.status === 'completed');
      const failed = attempts.filter(attempt => attempt.status !== 'completed');

      setSuccessfulAttempts(successful);
      setFailedAttempts(failed);

      // Get unique user count
      const uniqueUsers = new Set(attempts.map(attempt => attempt.userId));
      setTotalUsers(uniqueUsers.size);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simple admin credentials check
    // In a real app, this would be server-side validation
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsLoggedIn(true);
      // Fetch data after successful login
      await fetchAdminData();
    } else {
      setError('Invalid admin credentials');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ username: '', password: '' });
    setError(null);
    setSuccessfulAttempts([]);
    setFailedAttempts([]);
    setTotalUsers(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'validation_error':
        return 'text-yellow-600';
      case 'api_error':
        return 'text-red-600';
      case 'database_error':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Success';
      case 'validation_error':
        return 'Validation Error';
      case 'api_error':
        return 'API Error';
      case 'database_error':
        return 'Database Error';
      default:
        return status;
    }
  };

  if (isLoggedIn) {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Admin Header */}
        <div className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-600' : 'bg-red-600'}`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Admin Zone</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchAdminData}
                  disabled={isDataLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    isDataLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    isDark
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Content */}
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className={`max-w-7xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            <h1 className="text-3xl font-bold mb-6 text-center">Admin Zone</h1>
            <p className="text-center text-lg mb-8">
              Welcome to the admin dashboard. This is where you can manage all user data and view system analytics.
            </p>
            
            {/* Overview Statistics */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8`}>
              <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                <p className="text-sm text-gray-500">Registered users</p>
              </div>
              
              <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className="text-lg font-semibold mb-2">Successful Comparisons</h3>
                <p className="text-2xl font-bold text-green-600">{successfulAttempts.length}</p>
                <p className="text-sm text-gray-500">Completed comparisons</p>
              </div>
              
              <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className="text-lg font-semibold mb-2">Failed Attempts</h3>
                <p className="text-2xl font-bold text-red-600">{failedAttempts.length}</p>
                <p className="text-sm text-gray-500">Failed comparisons</p>
              </div>
              
              <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className="text-lg font-semibold mb-2">Pages Processed</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {successfulAttempts.reduce((sum, attempt) => sum + attempt.totalPages, 0)}
                </p>
                <p className="text-sm text-gray-500">Total pages analyzed</p>
              </div>
            </div>

            {/* Successful Attempts Table */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">Successful Attempts</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                  {successfulAttempts.length} records
                </span>
              </div>
              
              {isDataLoading ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading data...
                </div>
              ) : successfulAttempts.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No successful attempts found
                </div>
              ) : (
                <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          User
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Files
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Pages
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Processing Time
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {successfulAttempts.map((attempt) => (
                        <tr key={attempt.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{attempt.userEmail}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium">{attempt.statement1Name}</div>
                              <div className="text-gray-500">{attempt.statement2Name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{attempt.totalPages} pages</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{attempt.processingTime ? `${attempt.processingTime}s` : 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(attempt.timestamp)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Failed Attempts Table */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-xl font-semibold">Failed Attempts</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'}`}>
                  {failedAttempts.length} records
                </span>
              </div>
              
              {isDataLoading ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading data...
                </div>
              ) : failedAttempts.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No failed attempts found
                </div>
              ) : (
                <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          User
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Files
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Pages
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Error Type
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Error
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {failedAttempts.map((attempt) => (
                        <tr key={attempt.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{attempt.userEmail}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium">{attempt.statement1Name}</div>
                              <div className="text-gray-500">{attempt.statement2Name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{attempt.totalPages} pages</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${getStatusColor(attempt.status)}`}>
                              {getStatusLabel(attempt.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-600 max-w-xs truncate" title={attempt.errorMessage}>
                                {attempt.errorMessage || 'Unknown error'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(attempt.timestamp)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
        {/* Admin Login Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex p-3 rounded-lg ${isDark ? 'bg-red-600' : 'bg-red-600'} mb-4`}>
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Enter your admin credentials to access the dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter admin username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Logging in...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Login to Admin
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Demo Credentials:</strong><br />
            Username: <code className="bg-gray-200 px-1 rounded">admin</code><br />
            Password: <code className="bg-gray-200 px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
