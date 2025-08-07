// Comparison Engine Service
// Handles comparison logic between two parsed statements and generates insights

import type { ParsedStatement, ComparisonResult, Transaction } from '../types';

export interface ComparisonOptions {
  excludeCategories?: string[];
  includeOnlyCategories?: string[];
  minimumAmount?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ComparisonInsights {
  summary: {
    totalSpendingChange: number;
    totalSpendingChangePercent: number;
    totalIncomeChange: number;
    totalIncomeChangePercent: number;
    netChange: number;
    netChangePercent: number;
  };
  trends: {
    biggestIncrease: { category: string; amount: number; percent: number };
    biggestDecrease: { category: string; amount: number; percent: number };
    newCategories: string[];
    disappearedCategories: string[];
  };
  recommendations: string[];
}

export class ComparisonEngine {
  /**
   * Compare two parsed statements and generate comprehensive comparison result
   */
  static compareStatements(
    statement1: ParsedStatement, 
    statement2: ParsedStatement,
    options: ComparisonOptions = {}
  ): ComparisonResult {
    // Validate input statements
    this.validateStatements(statement1, statement2);

    // Filter transactions if options are provided
    const filteredStatement1 = this.applyFilters(statement1, options);
    const filteredStatement2 = this.applyFilters(statement2, options);

    // Get all unique categories from both statements
    const allCategories = this.getAllUniqueCategories(filteredStatement1, filteredStatement2);

    // Generate category-by-category comparison
    const comparison = allCategories.map(category => {
      const cat1 = filteredStatement1.categories.find(c => c.category === category);
      const cat2 = filteredStatement2.categories.find(c => c.category === category);
      
      const amount1 = cat1?.totalAmount || 0;
      const amount2 = cat2?.totalAmount || 0;
      const difference = amount2 - amount1;
      
      // Enhanced percentage calculation with proper edge case handling
      let percentChange = 0;
      if (amount1 > 0) {
        percentChange = (difference / amount1) * 100;
      } else if (amount1 === 0 && amount2 > 0) {
        percentChange = Infinity; // New category appeared
      } else if (amount1 > 0 && amount2 === 0) {
        percentChange = -100; // Category disappeared completely
      }
      // If both are 0, percentChange remains 0

      return {
        category,
        statement1Total: Math.round(amount1 * 100) / 100,
        statement2Total: Math.round(amount2 * 100) / 100,
        difference: Math.round(difference * 100) / 100,
        percentChange: isFinite(percentChange) ? Math.round(percentChange * 100) / 100 : percentChange,
        transactions1: cat1?.transactions || [],
        transactions2: cat2?.transactions || []
      };
    });

    // Sort comparison by absolute difference (biggest changes first)
    comparison.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

    return {
      statement1: filteredStatement1,
      statement2: filteredStatement2,
      comparison
    };
  }

  /**
   * Generate detailed insights from comparison result
   */
  static generateInsights(comparisonResult: ComparisonResult): ComparisonInsights {
    const { statement1, statement2, comparison } = comparisonResult;

    // Calculate overall spending and income changes
    const spendingCategories = comparison.filter(c => 
      !['Income', 'Transfers & Investments'].includes(c.category)
    );
    
    const incomeCategories = comparison.filter(c => 
      c.category === 'Income'
    );

    const totalSpending1 = spendingCategories.reduce((sum, c) => sum + c.statement1Total, 0);
    const totalSpending2 = spendingCategories.reduce((sum, c) => sum + c.statement2Total, 0);
    const totalSpendingChange = totalSpending2 - totalSpending1;
    const totalSpendingChangePercent = totalSpending1 > 0 
      ? (totalSpendingChange / totalSpending1) * 100 
      : 0;

    const totalIncome1 = incomeCategories.reduce((sum, c) => sum + c.statement1Total, 0);
    const totalIncome2 = incomeCategories.reduce((sum, c) => sum + c.statement2Total, 0);
    const totalIncomeChange = totalIncome2 - totalIncome1;
    const totalIncomeChangePercent = totalIncome1 > 0 
      ? (totalIncomeChange / totalIncome1) * 100 
      : 0;

    const netChange = totalIncomeChange - totalSpendingChange;
    const netChangePercent = (totalIncome1 - totalSpending1) > 0 
      ? (netChange / (totalIncome1 - totalSpending1)) * 100 
      : 0;

    // Find biggest changes
    const validChanges = comparison.filter(c => 
      isFinite(c.percentChange) && c.category !== 'Other'
    );

    const biggestIncrease = validChanges
      .filter(c => c.difference > 0)
      .sort((a, b) => b.difference - a.difference)[0] || 
      { category: 'None', amount: 0, percent: 0 };

    const biggestDecrease = validChanges
      .filter(c => c.difference < 0)
      .sort((a, b) => a.difference - b.difference)[0] || 
      { category: 'None', amount: 0, percent: 0 };

    // Find new and disappeared categories
    const newCategories = comparison
      .filter(c => c.statement1Total === 0 && c.statement2Total > 0)
      .map(c => c.category);

    const disappearedCategories = comparison
      .filter(c => c.statement1Total > 0 && c.statement2Total === 0)
      .map(c => c.category);

    // Generate recommendations
    const recommendations = this.generateRecommendations(comparisonResult);

    return {
      summary: {
        totalSpendingChange: Math.round(totalSpendingChange * 100) / 100,
        totalSpendingChangePercent: Math.round(totalSpendingChangePercent * 100) / 100,
        totalIncomeChange: Math.round(totalIncomeChange * 100) / 100,
        totalIncomeChangePercent: Math.round(totalIncomeChangePercent * 100) / 100,
        netChange: Math.round(netChange * 100) / 100,
        netChangePercent: Math.round(netChangePercent * 100) / 100
      },
      trends: {
        biggestIncrease: {
          category: biggestIncrease.category,
          amount: biggestIncrease.difference,
          percent: biggestIncrease.percentChange
        },
        biggestDecrease: {
          category: biggestDecrease.category,
          amount: biggestDecrease.difference,
          percent: biggestDecrease.percentChange
        },
        newCategories,
        disappearedCategories
      },
      recommendations
    };
  }

  /**
   * Generate actionable recommendations based on comparison results
   */
  private static generateRecommendations(comparisonResult: ComparisonResult): string[] {
    const recommendations: string[] = [];
    const { comparison } = comparisonResult;

    // Analyze spending patterns
    const significantIncreases = comparison.filter(c => 
      c.difference > 100 && c.percentChange > 20 && !['Income', 'Transfers & Investments'].includes(c.category)
    );

    const significantDecreases = comparison.filter(c => 
      c.difference < -100 && c.percentChange < -20 && !['Income', 'Transfers & Investments'].includes(c.category)
    );

    // Recommendations for increases
    if (significantIncreases.length > 0) {
      const topIncrease = significantIncreases[0];
      recommendations.push(
        `Consider reviewing your ${topIncrease.category} spending - it increased by $${Math.abs(topIncrease.difference).toFixed(2)} (${topIncrease.percentChange.toFixed(1)}%)`
      );
    }

    // Positive reinforcement for decreases
    if (significantDecreases.length > 0) {
      const topDecrease = significantDecreases[0];
      recommendations.push(
        `Great job reducing ${topDecrease.category} spending by $${Math.abs(topDecrease.difference).toFixed(2)} (${Math.abs(topDecrease.percentChange).toFixed(1)}%)`
      );
    }

    // Check for new expensive categories
    const expensiveNewCategories = comparison.filter(c => 
      c.statement1Total === 0 && c.statement2Total > 200
    );

    if (expensiveNewCategories.length > 0) {
      recommendations.push(
        `New spending area detected: ${expensiveNewCategories[0].category} ($${expensiveNewCategories[0].statement2Total.toFixed(2)})`
      );
    }

    // Overall spending trend
    const totalSpendingChange = comparison
      .filter(c => !['Income', 'Transfers & Investments'].includes(c.category))
      .reduce((sum, c) => sum + c.difference, 0);

    if (totalSpendingChange > 500) {
      recommendations.push(
        `Overall spending increased by $${totalSpendingChange.toFixed(2)} - consider creating a budget plan`
      );
    } else if (totalSpendingChange < -500) {
      recommendations.push(
        `Excellent! You reduced overall spending by $${Math.abs(totalSpendingChange).toFixed(2)}`
      );
    }

    // Income changes
    const incomeChange = comparison
      .filter(c => c.category === 'Income')
      .reduce((sum, c) => sum + c.difference, 0);

    if (incomeChange > 1000) {
      recommendations.push(
        `Income increased by $${incomeChange.toFixed(2)} - consider increasing savings or investments`
      );
    } else if (incomeChange < -1000) {
      recommendations.push(
        `Income decreased by $${Math.abs(incomeChange).toFixed(2)} - review spending priorities`
      );
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Get unique categories from both statements
   */
  private static getAllUniqueCategories(statement1: ParsedStatement, statement2: ParsedStatement): string[] {
    const allCategories = new Set([
      ...statement1.categories.map(c => c.category),
      ...statement2.categories.map(c => c.category)
    ]);

    return Array.from(allCategories);
  }

  /**
   * Apply filters to statement based on options
   */
  private static applyFilters(statement: ParsedStatement, options: ComparisonOptions): ParsedStatement {
    let filteredTransactions = [...statement.transactions];

    // Filter by categories
    if (options.excludeCategories && options.excludeCategories.length > 0) {
      filteredTransactions = filteredTransactions.filter(t => 
        !options.excludeCategories!.includes(t.category)
      );
    }

    if (options.includeOnlyCategories && options.includeOnlyCategories.length > 0) {
      filteredTransactions = filteredTransactions.filter(t => 
        options.includeOnlyCategories!.includes(t.category)
      );
    }

    // Filter by minimum amount
    if (options.minimumAmount !== undefined) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.amount >= options.minimumAmount!
      );
    }

    // Filter by date range
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Recalculate categories and summary with filtered transactions
    const categoryMap = new Map<string, Transaction[]>();
    filteredTransactions.forEach(transaction => {
      if (!categoryMap.has(transaction.category)) {
        categoryMap.set(transaction.category, []);
      }
      categoryMap.get(transaction.category)!.push(transaction);
    });

    const filteredCategories = Array.from(categoryMap.entries()).map(([category, transactions]) => ({
      category,
      totalAmount: Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) * 100) / 100,
      transactionCount: transactions.length,
      transactions
    }));

    // Recalculate summary
    const deposits = filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const filteredSummary = {
      ...statement.summary,
      totalDeposits: Math.round(deposits * 100) / 100,
      totalWithdrawals: Math.round(withdrawals * 100) / 100
    };

    return {
      summary: filteredSummary,
      transactions: filteredTransactions,
      categories: filteredCategories
    };
  }

  /**
   * Validate input statements
   */
  private static validateStatements(statement1: ParsedStatement, statement2: ParsedStatement): void {
    if (!statement1 || !statement2) {
      throw new Error('Both statements are required for comparison');
    }

    if (!statement1.transactions || statement1.transactions.length === 0) {
      throw new Error('Statement 1 has no transactions');
    }

    if (!statement2.transactions || statement2.transactions.length === 0) {
      throw new Error('Statement 2 has no transactions');
    }

    if (!statement1.categories || statement1.categories.length === 0) {
      throw new Error('Statement 1 has no categories');
    }

    if (!statement2.categories || statement2.categories.length === 0) {
      throw new Error('Statement 2 has no categories');
    }
  }

  /**
   * Export comparison data for external analysis
   */
  static exportComparisonData(comparisonResult: ComparisonResult): {
    csv: string;
    json: string;
  } {
    const { comparison } = comparisonResult;

    // Generate CSV
    const csvHeaders = 'Category,Statement1Total,Statement2Total,Difference,PercentChange,TransactionCount1,TransactionCount2\n';
    const csvRows = comparison.map(c => 
      `"${c.category}",${c.statement1Total},${c.statement2Total},${c.difference},${c.percentChange},${c.transactions1.length},${c.transactions2.length}`
    ).join('\n');
    const csv = csvHeaders + csvRows;

    // Generate JSON
    const json = JSON.stringify(comparisonResult, null, 2);

    return { csv, json };
  }
}
