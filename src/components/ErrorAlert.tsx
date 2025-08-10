import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
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
  return (
    <div className={`rounded-lg border-2 p-4 ${
      isDark 
        ? 'bg-red-900/20 border-red-600 text-red-400' 
        : 'bg-red-50 border-red-300 text-red-700'
    } ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Error
          </h3>
          
          <p className="text-xs opacity-80 mb-2">
            {error}
          </p>
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
