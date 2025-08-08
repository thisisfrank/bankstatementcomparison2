import React from 'react';
import { BarChart3, FileText, Download } from 'lucide-react';

interface DemoSectionProps {
  isDark: boolean;
}

export default function DemoSection({ isDark }: DemoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Category Breakdown Card */}
      <div className={`group relative rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } shadow-lg hover:shadow-2xl`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <BarChart3 className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Category Breakdown
          </h3>
        </div>
        
        {/* Preview Content */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Food & Dining
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              $680 → $520
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Transportation
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              $340 → $425
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Housing
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              $2450 → $2450
            </span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
          isDark ? 'bg-blue-900/20' : 'bg-blue-50/80'
        }`}>
          <div className="text-center">
            <BarChart3 className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Interactive Charts
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details Card */}
      <div className={`group relative rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } shadow-lg hover:shadow-2xl`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${
            isDark ? 'bg-green-900/30' : 'bg-green-100'
          }`}>
            <FileText className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Transaction Details
          </h3>
        </div>
        
        {/* Preview Content */}
        <div className="space-y-2">
          <div className="text-xs">
            <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>01/05 - Grocery Store</span>
              <span>$125.50</span>
            </div>
          </div>
          <div className="text-xs">
            <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>01/08 - Restaurant</span>
              <span>$45.75</span>
            </div>
          </div>
          <div className="text-xs">
            <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>01/15 - Gas Station</span>
              <span>$65.50</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
          isDark ? 'bg-green-900/20' : 'bg-green-50/80'
        }`}>
          <div className="text-center">
            <FileText className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Detailed Breakdown
            </p>
          </div>
        </div>
      </div>

      {/* Export Options Card */}
      <div className={`group relative rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } shadow-lg hover:shadow-2xl`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${
            isDark ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <Download className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Export & Share
          </h3>
        </div>
        
        {/* Preview Content */}
        <div className="space-y-3">
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
            <span>PDF Report</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-600'}`}></div>
            <span>CSV Data Export</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
            <span>Shareable Links</span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
          isDark ? 'bg-purple-900/20' : 'bg-purple-50/80'
        }`}>
          <div className="text-center">
            <Download className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              Multiple Formats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
