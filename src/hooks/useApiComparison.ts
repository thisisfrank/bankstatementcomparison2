import { useState, useCallback } from 'react';
import { 
  apiService, 
  parseApiError
} from '../services/api';
import { ComparisonResult } from '../types';
import { createApiError, getUserFriendlyError, type ApiError } from '../types/errors';
import { StatementProcessor } from '../services/statementProcessor';
import { ComparisonEngine } from '../services/comparisonEngine';

interface UseApiComparisonReturn {
  // State
  isLoading: boolean;
  error: ApiError | null;
  result: ComparisonResult | null;
  progress: number;

    // Actions
  compareStatements: (file1: File, file2: File) => Promise<void>;
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

    // Only check if files are the same - individual file validation should be done at upload time
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
    file2: File
  ) => {
    // Reset state
    setError(null);
    setResult(null);
    setProgress(0);

    // Validate files are different
    const validation = validateFiles(file1, file2);
    if (!validation.isValid) {
      setError(createApiError('VALIDATION_ERROR', validation.errors.join('; ')));
      return;
    }

    console.log('🚀 Starting comparison process');
    setIsLoading(true);
    
    try {
      // Step 1: Process statements through API (25% -> 50%)
      setProgress(25);
      console.log('📊 Processing statements through API...');
      const apiResults = await apiService.processTwoStatements(file1, file2);
      console.log('✅ API processing completed');
      
      // Step 2: Convert API responses to internal format (50% -> 75%)
      setProgress(50);
      console.log('🔄 Converting to internal format...');
      const statement1 = StatementProcessor.convertToInternalFormat(apiResults.file1Result, apiResults.file1Name);
      const statement2 = StatementProcessor.convertToInternalFormat(apiResults.file2Result, apiResults.file2Name);
      console.log('✅ Format conversion completed');
      
      // Step 3: Generate comparison (75% -> 100%)
      setProgress(75);
      console.log('🔄 Generating comparison...');
      const comparisonResult = ComparisonEngine.compareStatements(statement1, statement2);
      console.log('✅ Comparison completed');
      
      // Validate result structure
      if (!comparisonResult || !comparisonResult.comparison) {
        throw new Error(JSON.stringify(createApiError('COMPARISON_ERROR', 'Failed to generate comparison data')));
      }

      // Validate parsed statements
      const validation1 = StatementProcessor.validateParsedStatement(comparisonResult.statement1);
      const validation2 = StatementProcessor.validateParsedStatement(comparisonResult.statement2);
      
      if (!validation1.isValid) {
        throw new Error(JSON.stringify(createApiError('VALIDATION_ERROR', `Statement 1: ${validation1.errors.join('; ')}`)));
      }
      
      if (!validation2.isValid) {
        throw new Error(JSON.stringify(createApiError('VALIDATION_ERROR', `Statement 2: ${validation2.errors.join('; ')}`)));
      }

      setProgress(100);
      setResult(comparisonResult);
      
    } catch (err) {
      console.error('Comparison error:', err);
      
      if (err instanceof Error) {
        const apiError = parseApiError(err.message);
        // Apply user-friendly error messages
        const friendlyError = getUserFriendlyError(apiError);
        
        // Special handling for credit exhaustion
        if (apiError.code === 'ANONYMOUS_NOT_ENOUGH_CREDITS') {
          console.log('🔄 API Credits exhausted - Daily limit reached');
        }
        
        setError({
          ...apiError,
          error: friendlyError.title,
          details: friendlyError.details
        });
      } else {
        setError(createApiError('UNKNOWN_ERROR', 'Please try again or contact support'));
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
