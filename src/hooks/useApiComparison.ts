import { useState, useCallback } from 'react';
import { 
  apiService
} from '../services/api';
import { ComparisonResult } from '../types';
import { StatementProcessor } from '../services/statementProcessor';
import { ComparisonEngine } from '../services/comparisonEngine';

interface UseApiComparisonReturn {
  // State
  isLoading: boolean;
  error: string | null;
  result: ComparisonResult | null;
  progress: number;

    // Actions
  compareStatements: (file1: File, file2: File) => Promise<void>;
  setError: (error: string) => void;
  clearError: () => void;
  clearResult: () => void;
  setResult: (result: ComparisonResult) => void;
  reset: () => void;
  validateFiles: (file1: File, file2: File) => { isValid: boolean; errors: string[] };
}

export function useApiComparison(): UseApiComparisonReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(validation.errors.join('; '));
      return;
    }

    console.log('🚀 Starting comparison process');
    setIsLoading(true);
    
    try {
      // Step 0: Check credits before processing (0% -> 10%)
      setProgress(10);
      console.log('💳 Checking available credits...');
      const creditsCheck = await apiService.checkCreditsBeforeProcessing(2);
      
      // Only block if we're sure we don't have enough credits
      if (!creditsCheck.hasEnoughCredits && creditsCheck.accountType !== 'free_tier') {
        throw new Error(`Insufficient credits: ${creditsCheck.availableCredits} available, ${creditsCheck.requiredCredits} required. Please add more credits or try again tomorrow.`);
      }
      
      if (creditsCheck.accountType === 'free_tier') {
        console.log('⚠️ Free tier account detected - daily page limits may apply');
      }
      
      // Step 0.5: Try to activate paid credits if we have them (10% -> 15%)
      if (creditsCheck.accountType === 'paid' && creditsCheck.paidCredits > 0) {
        setProgress(15);
        console.log('💳 Paid account detected with', creditsCheck.paidCredits, 'credits');
      }
      
      console.log('✅ Credits check passed');
      
      // Step 1: Process statements through API (15% -> 50%)
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
        throw new Error('Failed to generate comparison data');
      }

      // Validate parsed statements
      const validation1 = StatementProcessor.validateParsedStatement(comparisonResult.statement1);
      const validation2 = StatementProcessor.validateParsedStatement(comparisonResult.statement2);
      
      if (!validation1.isValid) {
        throw new Error(`Statement 1: ${validation1.errors.join('; ')}`);
      }
      
      if (!validation2.isValid) {
        throw new Error(`Statement 2: ${validation2.errors.join('; ')}`);
      }

      setProgress(100);
      setResult(comparisonResult);
      
    } catch (err) {
      console.error('Comparison error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [validateFiles]);



  const setErrorCallback = useCallback((error: string) => {
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const setResultCallback = useCallback((result: ComparisonResult) => {
    setResult(result);
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
    setResult: setResultCallback,
    reset,
    
    // Utils
    validateFiles
  };
}
