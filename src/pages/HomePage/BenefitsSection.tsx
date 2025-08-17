import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface BenefitsSectionProps {
  isDark: boolean;
}

export default function BenefitsSection({ isDark }: BenefitsSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Get Crystal Clear Comparisons
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Use to track personal spending changes or compare to others
          </p>
        </div>

        {/* Visual Comparison Demo */}
        <div className="flex items-center justify-center mb-16">
          <div className="relative">
            {/* Two Documents */}
            <div className="flex items-center gap-8">
              {/* Document 1 */}
              <div className={`relative transition-all duration-500 ${
                isHovered ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
              }`}>
                <div className={`w-48 h-64 rounded-lg shadow-lg border-2 ${
                  isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  <div className={`p-4 border-b ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className={`font-semibold ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>Statement 1</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className={`h-3 rounded ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 rounded w-3/4 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 rounded w-1/2 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 rounded w-4/5 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
                <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  $2,450
                </div>
              </div>

              {/* Arrow */}
              <div className={`transition-all duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}>
                <ArrowRight className={`h-8 w-8 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>

              {/* Document 2 */}
              <div className={`relative transition-all duration-500 ${
                isHovered ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
              }`}>
                <div className={`w-48 h-64 rounded-lg shadow-lg border-2 ${
                  isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  <div className={`p-4 border-b ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span className={`font-semibold ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>Statement 2</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className={`h-3 rounded ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 rounded w-2/3 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 rounded w-3/4 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 rounded w-1/3 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
                <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  $1,890
                </div>
              </div>
            </div>

            {/* Comparison Chart - Appears on Hover */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`w-96 h-80 rounded-2xl shadow-2xl border-2 ${
                isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
              }`}>
                <div className={`p-6 border-b ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}>Comparison Results</h3>
                  </div>
                </div>
                
                {/* Chart Content */}
                <div className="p-6">
                  {/* Spending Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>Food & Dining</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>$450</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>$320</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}>-29%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>Transportation</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>$180</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>$210</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-green-400' : 'text-green-600'
                        }`}>+17%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>Entertainment</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>$120</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>$85</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}>-29%</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Savings */}
                  <div className={`mt-6 p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>Total Savings:</span>
                      <span className={`text-xl font-bold ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`}>$560</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
