import { useState, useCallback } from 'react';
import { 
  apiService, 
  ComparisonResult, 
  ApiError, 
  parseApiError,
  mockComparisonResult 
} from '../services/api';

interface UseApiComparisonReturn {
  // State
  isLoading: boolean;
  error: ApiError | null;
  result: ComparisonResult | null;
  progress: number;

  // Actions
  compareStatements: (file1: File, file2: File, userId?: string) => Promise<void>;
  clearError: () => void;
  clearResult: () => void;
  reset: () => void;

  // Utils
  useMockData: () => void;
  validateFiles: (file1: File, file2: File) => { isValid: boolean; errors: string[] };
}

export function useApiComparison(): UseApiComparisonReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [progress, setProgress] = useState(0);

  const validateFiles = useCallback((file1: File, file2: File) => {
    const errors: string[] = [];
    
    const validation1 = apiService.validatePdfFile(file1);
    const validation2 = apiService.validatePdfFile(file2);
    
    if (!validation1.isValid && validation1.error) {
      errors.push(`Statement 1: ${validation1.error}`);
    }
    
    if (!validation2.isValid && validation2.error) {
      errors.push(`Statement 2: ${validation2.error}`);
    }

    // Check if files are the same
    if (file1.name === file2.name && file1.size === file2.size) {
      errors.push('Please select two different files for comparison');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const compareStatements = useCallback(async (
    file1: File, 
    file2: File, 
    userId?: string
  ) => {
    // Reset state
    setError(null);
    setResult(null);
    setProgress(0);

    // Validate files first
    const validation = validateFiles(file1, file2);
    if (!validation.isValid) {
      setError({
        error: 'File validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors.join('; ')
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate progress for UX
      setProgress(10);
      
      // Check API health first
      setProgress(20);
      await apiService.healthCheck();
      
      setProgress(40);
      
      // Parse and compare statements
      const comparisonResult = await apiService.parseAndCompare(file1, file2, userId);
      
      setProgress(90);
      
      // Validate result structure
      if (!comparisonResult || !comparisonResult.comparison) {
        throw new Error(JSON.stringify({
          error: 'Invalid response from server',
          code: 'INVALID_RESPONSE',
          details: 'Missing comparison data'
        }));
      }

      setProgress(100);
      setResult(comparisonResult);
      
    } catch (err) {
      console.error('Comparison error:', err);
      
      if (err instanceof Error) {
        const apiError = parseApiError(err);
        
        // Add user-friendly messages based on error codes
        switch (apiError.code) {
          case 'NETWORK_ERROR':
            apiError.error = 'Unable to connect to processing server. Please check your internet connection and try again.';
            break;
          case 'VALIDATION_ERROR':
            apiError.error = 'File validation failed. Please ensure you are uploading valid PDF bank statements.';
            break;
          case 'PARSE_ERROR':
            apiError.error = 'Unable to parse the bank statement. Please ensure the PDF is not password protected and contains readable text.';
            break;
          case 'COMPARISON_ERROR':
            apiError.error = 'Error occurred during comparison. Please try again with different files.';
            break;
          default:
            if (!apiError.error || apiError.error === 'Unknown error occurred') {
              apiError.error = 'An unexpected error occurred. Please try again or contact support if the problem persists.';
            }
        }
        
        setError(apiError);
      } else {
        setError({
          error: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
          details: 'Please try again or contact support'
        });
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [validateFiles]);

  const useMockData = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setProgress(0);
    setResult(mockComparisonResult);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setProgress(0);
  }, []);

  return {
    // State
    isLoading,
    error,
    result,
    progress,
    
    // Actions
    compareStatements,
    clearError,
    clearResult,
    reset,
    
    // Utils
    useMockData,
    validateFiles
  };
}
