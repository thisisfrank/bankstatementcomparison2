import { useState, useCallback } from 'react';
import { 
  apiService
} from '../services/api';
import { ComparisonResult } from '../types';
import { StatementProcessor } from '../services/statementProcessor';
import { ComparisonEngine } from '../services/comparisonEngine';
import { supabase } from '../lib/supabase';

// Function to update user's subscription pages after consuming pages
async function updateUserSubscriptionPages(userId: string, pagesConsumed: number): Promise<void> {
  try {
    console.log('💳 Updating user subscription pages for user:', userId, 'consumed:', pagesConsumed);
    
    // First, get the current user subscription
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id, pages_remaining, pages_used')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (fetchError) {
      throw new Error(`Failed to fetch user subscription: ${fetchError.message}`);
    }
    
    if (!currentSubscription) {
      console.warn('No active subscription found for user:', userId);
      return; // User might be on free tier or no subscription
    }
    
    // Calculate new values
    const newPagesRemaining = Math.max(0, currentSubscription.pages_remaining - pagesConsumed);
    const newPagesUsed = currentSubscription.pages_used + pagesConsumed;
    
    console.log('📊 Page calculation:', {
      current: {
        remaining: currentSubscription.pages_remaining,
        used: currentSubscription.pages_used
      },
      consumed: pagesConsumed,
      new: {
        remaining: newPagesRemaining,
        used: newPagesUsed
      }
    });
    
    // Update the subscription
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        pages_remaining: newPagesRemaining,
        pages_used: newPagesUsed
      })
      .eq('id', currentSubscription.id);
    
    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }
    
    console.log('✅ Successfully updated user subscription pages');
    
  } catch (error) {
    console.error('❌ Error updating user subscription pages:', error);
    throw error;
  }
}

// Function to log failed attempts to the database
async function logFailedAttempt(
  userId: string | undefined,
  file1Name: string,
  file2Name: string,
  errorType: 'validation_error' | 'api_error' | 'database_error',
  errorMessage: string,
  file1Pages?: number,
  file2Pages?: number
): Promise<void> {
  if (!userId) {
    console.log('⚠️ No userId provided, skipping failed attempt logging');
    return;
  }

  try {
    const { error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        pages_consumed: 0, // No pages consumed for failed attempts
        created_at: new Date().toISOString(),
        statement1_name: file1Name,
        statement2_name: file2Name,
        file1_pages: file1Pages || 0,
        file2_pages: file2Pages || 0,
        status: errorType,
        error_message: errorMessage
      });

    if (error) {
      console.error('Failed to log failed attempt to Supabase:', error);
    } else {
      console.log('📝 Logged failed attempt to database:', { errorType, errorMessage });
    }
  } catch (error) {
    console.error('Error logging failed attempt:', error);
  }
}

interface UseApiComparisonReturn {
  // State
  isLoading: boolean;
  error: string | null;
  result: ComparisonResult | null;
  progress: number;

  // Actions
  compareStatements: (file1: File, file2: File, userId?: string) => Promise<void>;
  setError: (error: string) => void;
  clearError: () => void;
  clearResult: () => void;
  setResult: (result: ComparisonResult) => void;
  reset: () => void;
  validateFiles: (file1: File, file2: File, userId?: string) => Promise<{ isValid: boolean; errors: string[] }>;
}

export function useApiComparison(): UseApiComparisonReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [progress, setProgress] = useState(0);

  const validateFiles = useCallback(async (file1: File, file2: File, userId?: string) => {
    const errors: string[] = [];

    // Check if files are the same
    if (file1.name === file2.name && file1.size === file2.size) {
      errors.push('Please select two different files for comparison');
    }

    // Check file types
    if (!file1.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File 1 must be a PDF file');
    }
    if (!file2.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File 2 must be a PDF file');
    }

    // Check file sizes (max 50MB each)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file1.size > maxSize) {
      errors.push('File 1 is too large (max 50MB)');
    }
    if (file2.size > maxSize) {
      errors.push('File 2 is too large (max 50MB)');
    }

    const isValid = errors.length === 0;

    // Log validation failures
    if (!isValid && userId) {
      await logFailedAttempt(
        userId,
        file1.name,
        file2.name,
        'validation_error',
        errors.join('; '),
        0,
        0
      );
    }

    return {
      isValid,
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

    // Validate files are different
    const validation = await validateFiles(file1, file2, userId);
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
      
      // Step 0.6: Check user's Supabase subscription pages (15% -> 20%)
      if (userId) {
        setProgress(20);
        console.log('💳 Checking user subscription pages...');
        
        try {
          const { data: userSubscription, error: subError } = await supabase
            .from('user_subscriptions')
            .select('pages_remaining, tier_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();
          
          if (subError) {
            console.warn('Failed to check user subscription pages:', subError);
          } else if (userSubscription) {
            // Estimate pages needed (we'll know exact count after processing)
            const estimatedPagesNeeded = 2; // Minimum 2 pages for 2 files
            
            if (userSubscription.pages_remaining < estimatedPagesNeeded) {
              throw new Error(`Insufficient pages remaining: ${userSubscription.pages_remaining} available, need at least ${estimatedPagesNeeded} for comparison. Please upgrade your subscription or wait for next month's allocation.`);
            }
            
            console.log('✅ User subscription check passed:', {
              pagesRemaining: userSubscription.pages_remaining,
              tierId: userSubscription.tier_id
            });
          } else {
            console.log('⚠️ No active subscription found, proceeding with external credit check');
          }
        } catch (subCheckError) {
          if (subCheckError instanceof Error) {
            throw subCheckError; // Re-throw subscription errors
          }
          console.warn('Subscription check failed, proceeding with external credit check');
        }
      }
      
      // Step 1: Process statements through API (20% -> 55%)
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
      
      // Fix 1: Automatically save comparison to Supabase usage_logs
      if (userId) {
        try {
          // Use actual page counts from API response instead of hardcoded values
          const pagesConsumed = apiResults.totalPages;
          
          console.log('📊 Using actual page counts:', {
            file1Pages: apiResults.file1Pages,
            file2Pages: apiResults.file2Pages,
            totalPages: apiResults.totalPages,
            pagesConsumed
          });
          
          // Create comparison summary for JSONB storage
          const comparisonSummary = {
            statement1: {
              name: apiResults.file1Name,
              pages: apiResults.file1Pages,
              transactions: comparisonResult.statement1.transactions.length,
              fullData: comparisonResult.statement1 // Store complete statement data
            },
            statement2: {
              name: apiResults.file2Name,
              pages: apiResults.file2Pages,
              transactions: comparisonResult.statement2.transactions.length,
              fullData: comparisonResult.statement2 // Store complete statement data
            },
            comparison: {
              totalCategories: comparisonResult.comparison.length,
              totalTransactions: comparisonResult.statement1.transactions.length + comparisonResult.statement2.transactions.length,
              fullComparison: comparisonResult.comparison // Store complete comparison data
            }
          };
          
          // Save complete comparison data to usage_logs table
          const { error: usageError } = await supabase
            .from('usage_logs')
            .insert({
              user_id: userId,
              pages_consumed: pagesConsumed,
              created_at: new Date().toISOString(),
              statement1_name: apiResults.file1Name,
              statement2_name: apiResults.file2Name,
              file1_pages: apiResults.file1Pages,
              file2_pages: apiResults.file2Pages,
              comparison_summary: comparisonSummary,
              status: 'completed'
            });
          
          if (usageError) {
            console.error('Failed to save usage log to Supabase:', usageError);
          } else {
            console.log('💾 Saved complete comparison data to Supabase usage_logs');
            
            // Update user's subscription to deduct consumed pages
            try {
              await updateUserSubscriptionPages(userId, pagesConsumed);
              console.log('💳 Updated user subscription: deducted', pagesConsumed, 'pages');
            } catch (updateError) {
              console.error('Failed to update user subscription pages:', updateError);
              // Don't fail the comparison if subscription update fails
            }
          }
          
        } catch (error) {
          console.error('Failed to save comparison data to Supabase:', error);
        }
      } else {
        console.log('⚠️ No userId provided, skipping Supabase save');
      }
      
      // Fix 2: Deduct credits after successful processing
      try {
        console.log('💳 Deducting credits after successful comparison...');
        // Use actual pages consumed from API response
        const actualPagesConsumed = apiResults.totalPages;
        await apiService.deductCreditsAfterProcessing(actualPagesConsumed);
        console.log(`✅ Credits deducted successfully: ${actualPagesConsumed} credits for ${actualPagesConsumed} pages`);
      } catch (error) {
        console.error('Failed to deduct credits:', error);
        // Don't fail the comparison if credit deduction fails
      }
      
    } catch (err) {
      console.error('Comparison error:', err);
      
      // Log API errors to database
      if (userId) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        await logFailedAttempt(
          userId,
          file1.name,
          file2.name,
          'api_error',
          errorMessage,
          0,
          0
        );
      }
      
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
