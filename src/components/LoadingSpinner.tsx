import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number;
  isDark?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  progress, 
  isDark = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin ${
        isDark ? 'text-blue-400' : 'text-blue-600'
      }`} />
      
      {text && (
        <p className={`${textSizeClasses[size]} font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {text}
        </p>
      )}
      
      {typeof progress === 'number' && progress > 0 && (
        <div className="w-full max-w-xs">
          <div className={`w-full bg-gray-200 rounded-full h-2 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          <p className={`text-xs text-center mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
    </div>
  );
}
