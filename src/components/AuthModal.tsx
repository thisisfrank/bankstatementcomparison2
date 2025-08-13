import React, { useState } from 'react'
import { X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>
  loading: boolean
}

type AuthState = 'idle' | 'loading' | 'success' | 'error' | 'validation-error'

export default function AuthModal({ isOpen, onClose, onSignIn, onSignUp, loading }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [authState, setAuthState] = useState<AuthState>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  if (!isOpen) return null

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (isSignUp && !fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})
    
    if (!validateForm()) {
      setAuthState('validation-error')
      return
    }

    setAuthState('loading')

    try {
      if (isSignUp) {
        await onSignUp(email, password, fullName)
      } else {
        await onSignIn(email, password)
      }
      setAuthState('success')
      setTimeout(() => {
        onClose()
        setAuthState('idle')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setAuthState('error')
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setError('')
    setAuthState('idle')
    setValidationErrors({})
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  const getStateStyles = () => {
    switch (authState) {
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      case 'validation-error':
        return 'border-yellow-500 bg-yellow-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  const getStateIcon = () => {
    switch (authState) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case 'validation-error':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
      default:
        return null
    }
  }

  const getStateMessage = () => {
    switch (authState) {
      case 'success':
        return isSignUp ? 'Account created successfully!' : 'Signed in successfully!'
      case 'error':
        return error
      case 'validation-error':
        return 'Please fix the validation errors below'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md mx-4 border-2 transition-all duration-300 ${getStateStyles()}`}>
        {/* Header with State Icon */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {getStateIcon()}
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* State Message */}
        {authState !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            authState === 'success' 
              ? 'bg-green-100 text-green-800' 
              : authState === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {getStateMessage()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  validationErrors.fullName 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.fullName && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.fullName}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.email && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.email}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  validationErrors.password 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={authState === 'loading'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {authState === 'loading' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        {isSignUp && (
          <div className="mt-4 text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Free Plan Included</span>
            </div>
            Get 40 free pages per month to start comparing your bank statements
          </div>
        )}
      </div>
    </div>
  )
}
