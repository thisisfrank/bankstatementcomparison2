import React, { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, Eye, EyeOff, X } from 'lucide-react'

type AuthState = 'idle' | 'loading' | 'success' | 'error' | 'validation-error'

export default function AuthStateDemo() {
  const [currentState, setCurrentState] = useState<AuthState>('idle')
  const [showPassword, setShowPassword] = useState(false)

  const states: { state: AuthState; label: string; description: string; color: string }[] = [
    { state: 'idle', label: 'Idle State', description: 'Default form state', color: 'gray' },
    { state: 'loading', label: 'Loading State', description: 'Processing authentication', color: 'blue' },
    { state: 'success', label: 'Success State', description: 'Authentication successful', color: 'green' },
    { state: 'error', label: 'Error State', description: 'Authentication failed', color: 'red' },
    { state: 'validation-error', label: 'Validation Error', description: 'Form validation failed', color: 'yellow' }
  ]

  const getStateStyles = (state: AuthState) => {
    switch (state) {
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      case 'validation-error':
        return 'border-yellow-500 bg-yellow-50'
      case 'loading':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  const getStateIcon = (state: AuthState) => {
    switch (state) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case 'validation-error':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
      case 'loading':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  const getStateMessage = (state: AuthState) => {
    switch (state) {
      case 'success':
        return 'Account created successfully!'
      case 'error':
        return 'Invalid email or password. Please try again.'
      case 'validation-error':
        return 'Please fix the validation errors below'
      case 'loading':
        return 'Creating your account...'
      default:
        return ''
    }
  }

  const getInputStyles = (state: AuthState, fieldName: string) => {
    if (state === 'validation-error') {
      return 'border-red-300 focus:ring-red-500'
    }
    return 'border-gray-300 focus:ring-blue-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication States Demo</h1>
          <p className="text-gray-600">Click on different states to see how the form looks and behaves</p>
        </div>

        {/* State Selector */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {states.map(({ state, label, description, color }) => (
            <button
              key={state}
              onClick={() => setCurrentState(state)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                currentState === state
                  ? `border-${color}-500 bg-${color}-100 shadow-lg`
                  : `border-gray-200 bg-white hover:border-${color}-300 hover:bg-${color}-50`
              }`}
            >
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 bg-${color}-500`}></div>
              <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
              <p className="text-xs text-gray-600">{description}</p>
            </button>
          ))}
        </div>

        {/* Form Demo */}
        <div className="bg-white rounded-lg shadow-xl border-2 p-8 max-w-md mx-auto">
          <div className={`rounded-lg p-6 border-2 transition-all duration-300 ${getStateStyles(currentState)}`}>
            {/* Header with State Icon */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {getStateIcon(currentState)}
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* State Message */}
            {currentState !== 'idle' && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                currentState === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : currentState === 'error'
                  ? 'bg-red-100 text-red-800'
                  : currentState === 'validation-error'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {getStateMessage(currentState)}
              </div>
            )}

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${getInputStyles(currentState, 'fullName')}`}
                />
                {currentState === 'validation-error' && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Full name is required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${getInputStyles(currentState, 'email')}`}
                />
                {currentState === 'validation-error' && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid email
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${getInputStyles(currentState, 'password')}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {currentState === 'validation-error' && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={currentState === 'loading'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {currentState === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm transition-colors">
                Already have an account? Sign in
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Free Plan Included</span>
              </div>
              Get 40 free pages per month to start comparing your bank statements
            </div>
          </div>
        </div>

        {/* State Information */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Current State: {currentState.toUpperCase()}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Visual Changes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Border color changes to match state</li>
                  <li>• Background color adapts to state</li>
                  <li>• State icon appears in header</li>
                  <li>• Status message shows below header</li>
                  <li>• Form inputs show validation errors</li>
                  <li>• Button text and loading state changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">User Experience:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Clear visual feedback for all states</li>
                  <li>• Immediate validation feedback</li>
                  <li>• Loading states prevent double-submission</li>
                  <li>• Success celebration with animation</li>
                  <li>• Error messages are specific and helpful</li>
                  <li>• Smooth transitions between states</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
