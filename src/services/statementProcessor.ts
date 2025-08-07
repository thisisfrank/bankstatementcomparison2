// Statement Processing Service
// Handles conversion of API responses to internal format and data validation

import { TransactionCategorizer } from './categorizer';
import type { 
  BankStatementConvertResponse, 
  BankStatementTransaction, 
  Transaction, 
  StatementSummary, 
  CategoryBreakdown, 
  ParsedStatement 
} from '../types';

export class StatementProcessor {
  /**
   * Convert Bank Statement API response to our internal format
   */
  static convertToInternalFormat(
    apiResponse: BankStatementConvertResponse, 
    filename: string
  ): ParsedStatement {
    // Validate API response
    if (!apiResponse || !apiResponse.normalised || !Array.isArray(apiResponse.normalised)) {
      throw new Error('Invalid API response: missing or malformed normalised transactions');
    }

    const transactions: Transaction[] = apiResponse.normalised
      .map((t: BankStatementTransaction) => this.convertApiTransactionToTransaction(t))
      .filter((t: Transaction | null): t is Transaction => t !== null); // Remove any failed conversions

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in statement');
    }

    // Calculate summary
    const summary = this.calculateSummary(transactions, filename);
    
    // Group by category
    const categories = this.groupTransactionsByCategory(transactions);

    return {
      summary,
      transactions,
      categories
    };
  }

  /**
   * Convert API transaction to internal transaction format
   */
  private static convertApiTransactionToTransaction(
    apiTransaction: BankStatementTransaction
  ): Transaction | null {
    try {
      // Validate required fields
      if (!apiTransaction.description || apiTransaction.amount === undefined) {
        console.warn('Skipping transaction with missing required fields:', apiTransaction);
        return null;
      }

      // Parse and validate amount
      const amount = parseFloat(apiTransaction.amount);
      if (isNaN(amount)) {
        console.warn('Skipping transaction with invalid amount:', apiTransaction);
        return null;
      }

      // Validate date
      const date = new Date(apiTransaction.date);
      if (isNaN(date.getTime())) {
        console.warn('Skipping transaction with invalid date:', apiTransaction);
        return null;
      }

      const isWithdrawal = amount < 0;
      
      // Working parser logic: ALL positive transactions go to income category
      let category = 'income';
      if (isWithdrawal) {
        // Only categorize negative transactions (withdrawals)
        category = TransactionCategorizer.categorizeTransaction(apiTransaction.description);
        // Safety check: negative transactions should never be income
        if (category === 'income') {
          category = 'shopping'; // Default to shopping for unrecognized negative transactions
        }
      }

      return {
        date: apiTransaction.date,
        description: apiTransaction.description.trim(),
        amount: Math.abs(amount), // Store as positive, use type to indicate debit/credit
        category: category,
        type: amount < 0 ? 'debit' : 'credit'
      };
    } catch (error) {
      console.warn('Error converting transaction:', error, apiTransaction);
      return null;
    }
  }

  /**
   * Calculate statement summary from transactions
   */
  private static calculateSummary(transactions: Transaction[], filename: string): StatementSummary {
    const deposits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get date range with proper validation
    const validDates = transactions
      .map(t => new Date(t.date))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    const startDate = validDates.length > 0 
      ? validDates[0].toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];
    
    const endDate = validDates.length > 0 
      ? validDates[validDates.length - 1].toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    return {
      totalDeposits: Math.round(deposits * 100) / 100, // Round to 2 decimal places
      totalWithdrawals: Math.round(withdrawals * 100) / 100,
      startDate,
      endDate,
      bankName: this.extractBankName(filename),
      accountNumber: this.extractAccountNumber(transactions)
    };
  }

  /**
   * Group transactions by category and calculate totals
   */
  private static groupTransactionsByCategory(transactions: Transaction[]): CategoryBreakdown[] {
    const categoryMap = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      if (!categoryMap.has(transaction.category)) {
        categoryMap.set(transaction.category, []);
      }
      categoryMap.get(transaction.category)!.push(transaction);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryTransactions]) => ({
      category,
      totalAmount: Math.round(categoryTransactions.reduce((sum, t) => sum + t.amount, 0) * 100) / 100,
      transactionCount: categoryTransactions.length,
      transactions: categoryTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })).sort((a, b) => b.totalAmount - a.totalAmount); // Sort by amount descending
  }

  /**
   * Extract bank name from filename or transaction patterns
   */
  private static extractBankName(filename: string): string {
    const name = filename.toLowerCase();
    
    // Common bank patterns in filenames
    const bankPatterns: Record<string, string> = {
      'chase': 'Chase Bank',
      'wellsfargo': 'Wells Fargo',
      'bofa': 'Bank of America',
      'bankofamerica': 'Bank of America',
      'citi': 'Citibank',
      'usbank': 'US Bank',
      'pnc': 'PNC Bank',
      'regions': 'Regions Bank',
      'suntrust': 'SunTrust Bank',
      'ally': 'Ally Bank',
      'schwab': 'Charles Schwab',
      'fidelity': 'Fidelity',
      'amex': 'American Express'
    };

    for (const [pattern, bankName] of Object.entries(bankPatterns)) {
      if (name.includes(pattern)) {
        return bankName;
      }
    }

    return 'Unknown Bank';
  }

  /**
   * Extract account number from transaction patterns (masked)
   */
  private static extractAccountNumber(transactions: Transaction[]): string {
    // Look for common patterns in transaction descriptions that might contain account info
    // This is a simplified implementation - real bank statements vary widely
    
    for (const transaction of transactions.slice(0, 5)) { // Check first few transactions
      const desc = transaction.description.toLowerCase();
      
      // Look for patterns like "account ending in 1234"
      const accountMatch = desc.match(/(?:ending|ending in|acct|account).*?(\d{4})/);
      if (accountMatch) {
        return `****${accountMatch[1]}`;
      }
    }

    return 'Unknown';
  }

  /**
   * Validate parsed statement data
   */
  static validateParsedStatement(statement: ParsedStatement): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!statement.summary) {
      errors.push('Missing statement summary');
    }

    if (!statement.transactions || statement.transactions.length === 0) {
      errors.push('No transactions found');
    }

    if (!statement.categories || statement.categories.length === 0) {
      errors.push('No categories generated');
    }

    // Validate summary calculations
    if (statement.summary && statement.transactions) {
      const calculatedDeposits = statement.transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const calculatedWithdrawals = statement.transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      const depositsDiff = Math.abs(calculatedDeposits - statement.summary.totalDeposits);
      const withdrawalsDiff = Math.abs(calculatedWithdrawals - statement.summary.totalWithdrawals);

      if (depositsDiff > 0.01) { // Allow for rounding differences
        errors.push(`Deposit calculation mismatch: expected ${calculatedDeposits}, got ${statement.summary.totalDeposits}`);
      }

      if (withdrawalsDiff > 0.01) {
        errors.push(`Withdrawal calculation mismatch: expected ${calculatedWithdrawals}, got ${statement.summary.totalWithdrawals}`);
      }
    }

    // Validate date format
    if (statement.summary) {
      const startDate = new Date(statement.summary.startDate);
      const endDate = new Date(statement.summary.endDate);

      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date format');
      }

      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date format');
      }

      if (startDate.getTime() > endDate.getTime()) {
        errors.push('Start date is after end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get processing statistics for debugging
   */
  static getProcessingStats(statement: ParsedStatement): {
    totalTransactions: number;
    dateRange: string;
    topCategories: { category: string; amount: number; count: number }[];
    averageTransactionAmount: number;
  } {
    const topCategories = statement.categories
      .slice(0, 5)
      .map(cat => ({
        category: cat.category,
        amount: cat.totalAmount,
        count: cat.transactionCount
      }));

    const totalAmount = statement.transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionAmount = statement.transactions.length > 0 
      ? Math.round((totalAmount / statement.transactions.length) * 100) / 100
      : 0;

    return {
      totalTransactions: statement.transactions.length,
      dateRange: `${statement.summary.startDate} to ${statement.summary.endDate}`,
      topCategories,
      averageTransactionAmount
    };
  }
}
