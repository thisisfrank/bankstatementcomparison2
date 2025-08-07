import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { ApiError } from '../services/api';

interface ErrorAlertProps {
  error: ApiError;
  onDismiss?: () => void;
  onRetry?: () => void;
  isDark?: boolean;
  className?: string;
}

export function ErrorAlert({ 
  error, 
  onDismiss, 
  onRetry, 
  isDark = false,
  className = ''
}: ErrorAlertProps) {
  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
      case 'VALIDATION_ERROR':
      case 'PARSE_ERROR':
      case 'COMPARISON_ERROR':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getErrorColor = (code: string) => {
    switch (code) {
      case 'VALIDATION_ERROR':
        return isDark 
          ? 'bg-yellow-900/20 border-yellow-600 text-yellow-400' 
          : 'bg-yellow-50 border-yellow-300 text-yellow-700';
      case 'NETWORK_ERROR':
        return isDark 
          ? 'bg-blue-900/20 border-blue-600 text-blue-400' 
          : 'bg-blue-50 border-blue-300 text-blue-700';
      default:
        return isDark 
          ? 'bg-red-900/20 border-red-600 text-red-400' 
          : 'bg-red-50 border-red-300 text-red-700';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getErrorColor(error.code)} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getErrorIcon(error.code)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            {error.error}
          </h3>
          
          {error.details && (
            <p className="text-xs opacity-80 mb-2">
              {error.details}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs">
            <span className="opacity-60">
              Error Code: {error.code}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`p-1 rounded transition-colors ${
                isDark 
                  ? 'hover:bg-white/10 text-current' 
                  : 'hover:bg-black/10 text-current'
              }`}
              title="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`p-1 rounded transition-colors ${
                isDark 
                  ? 'hover:bg-white/10 text-current' 
                  : 'hover:bg-black/10 text-current'
              }`}
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
