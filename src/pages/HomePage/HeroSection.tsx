import React from 'react';
import { BarChart3 } from 'lucide-react';

interface HeroSectionProps {
  isDark: boolean;
}

export default function HeroSection({ isDark }: HeroSectionProps) {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-600' : 'bg-blue-600'}`}>
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h1 className={`text-4xl md:text-5xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Bank Statement Comparison
        </h1>
      </div>
      <div className="space-y-2 text-lg">
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Upload two bank statements and get instant spending comparisons by category.
        </p>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Perfect for co-parents, roommates, and couples splitting expenses.
        </p>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Or for keeping tabs of your month to month spending.
        </p>
      </div>
    </div>
  );
}

