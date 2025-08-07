import { useState, useCallback } from 'react';
import { 
  apiService, 
  ApiError, 
  parseApiError
} from '../services/api';
import { ComparisonResult } from '../types';
import { StatementProcessor } from '../services/statementProcessor';
import { ComparisonEngine } from '../services/comparisonEngine';

interface UseApiComparisonReturn {
  // State
  isLoading: boolean;
  error: ApiError | null;
  result: ComparisonResult | null;
  progress: number;

    // Actions
  compareStatements: (file1: File, file2: File, userId?: string) => Promise<void>;
  setError: (error: ApiError) => void;
  clearError: () => void;
  clearResult: () => void;
  reset: () => void;
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

    console.log('🔍 API Hook: Starting comparison process');
    setIsLoading(true);
    
    try {
      // Simulate progress for UX
      setProgress(10);
      
      // Check API health first
      console.log('🔍 API Hook: Checking API health...');
      setProgress(20);
      await apiService.healthCheck();
      console.log('✅ API Hook: Health check passed');
      
      setProgress(40);
      
      // Process statements through API
      console.log('📊 API Hook: Starting statement processing...');
      const apiResults = await apiService.processTwoStatements(file1, file2);
      console.log('✅ API Hook: API processing completed');
      
      setProgress(60);
      
      // Convert API responses to internal format
      console.log('🔄 Processing: Converting API responses to internal format...');
      const statement1 = StatementProcessor.convertToInternalFormat(apiResults.file1Result, apiResults.file1Name);
      const statement2 = StatementProcessor.convertToInternalFormat(apiResults.file2Result, apiResults.file2Name);
      console.log('✅ Processing: Conversion completed');
      
      setProgress(80);
      
      // Generate comparison
      console.log('🔄 Comparison: Generating comparison result...');
      const comparisonResult = ComparisonEngine.compareStatements(statement1, statement2);
      console.log('✅ Comparison: Comparison completed', { hasComparison: !!comparisonResult?.comparison });
      
      setProgress(90);
      
      // Validate result structure
      if (!comparisonResult || !comparisonResult.comparison) {
        throw new Error(JSON.stringify({
          error: 'Invalid comparison result',
          code: 'COMPARISON_ERROR',
          details: 'Failed to generate comparison data'
        }));
      }

      // Validate parsed statements
      const validation1 = StatementProcessor.validateParsedStatement(comparisonResult.statement1);
      const validation2 = StatementProcessor.validateParsedStatement(comparisonResult.statement2);
      
      if (!validation1.isValid) {
        throw new Error(JSON.stringify({
          error: 'Statement 1 validation failed',
          code: 'VALIDATION_ERROR',
          details: validation1.errors.join('; ')
        }));
      }
      
      if (!validation2.isValid) {
        throw new Error(JSON.stringify({
          error: 'Statement 2 validation failed',
          code: 'VALIDATION_ERROR',
          details: validation2.errors.join('; ')
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
          case 'PROCESSING_ERROR':
            apiError.error = 'Error occurred during statement processing. The PDF may be corrupted or in an unsupported format.';
            break;
          case 'COMPARISON_ERROR':
            apiError.error = 'Error occurred during comparison. Please try again with different files.';
            break;
          case 'ANONYMOUS_NOT_ENOUGH_CREDITS':
            console.log('🔄 API Credits exhausted - Daily limit reached');
            apiError.error = 'Daily API limit reached';
            apiError.details = 'The PDF processing service has reached its daily free usage limit. You can:\n• Wait until tomorrow when limits reset\n• Use "Sample Data" button for development\n• Upgrade to a paid API plan for unlimited access';
            break;
          case 'CONFIG_ERROR':
            apiError.error = 'Service configuration error';
            apiError.details = 'The PDF processing service is not properly configured. Please contact the site administrator.';
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



  const setErrorCallback = useCallback((error: ApiError) => {
    setError(error);
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
    setError: setErrorCallback,
    clearError,
    clearResult,
    reset,
    
    // Utils
    validateFiles
  };
}
