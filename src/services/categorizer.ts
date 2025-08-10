// Transaction Categorization Service
// Handles automatic categorization of transactions based on description patterns
// Based on real Wells Fargo bank statement data

export class TransactionCategorizer {
  /**
   * Categorize transaction based on description using real-world patterns
   */
  static categorizeTransaction(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    // Income patterns
    if (lowerDesc.includes('upwork') || lowerDesc.includes('stripe') || 
        lowerDesc.includes('paypal transfer') || lowerDesc.includes('atm cash deposit')) {
      return 'Income';
    }
    
    // Food & Dining patterns
    if (lowerDesc.includes('starbucks') || lowerDesc.includes('coffee') || 
        lowerDesc.includes('mcdonald') || lowerDesc.includes('restaurant') ||
        lowerDesc.includes('shake shack') || lowerDesc.includes('tacos el gordo') ||
        lowerDesc.includes('salad and go') || lowerDesc.includes('wingstop') ||
        lowerDesc.includes('chick-fil-a') || lowerDesc.includes('raising canes') ||
        lowerDesc.includes('papa chevos') || lowerDesc.includes('panda express') ||
        lowerDesc.includes('buffalo wild') || lowerDesc.includes('popeyes') ||
        lowerDesc.includes('filibertos') || lowerDesc.includes('kfc') ||
        lowerDesc.includes('new asian fusion') || lowerDesc.includes('az pho grill')) {
      return 'Food & Dining';
    }
    
    // Transportation patterns
    if (lowerDesc.includes('shell') || lowerDesc.includes('arco') || 
        lowerDesc.includes('circle k') || lowerDesc.includes('uber') ||
        lowerDesc.includes('lyft') || lowerDesc.includes('autozone') ||
        lowerDesc.includes('los perez tire') || lowerDesc.includes('clean freak') ||
        lowerDesc.includes('ls bikemasters') || lowerDesc.includes('ace parking')) {
      return 'Transportation';
    }
    
    // Shopping patterns
    if (lowerDesc.includes('walmart') || lowerDesc.includes('target') || 
        lowerDesc.includes('barnes and noble') || lowerDesc.includes('dollartree') ||
        lowerDesc.includes('dollar tr') || lowerDesc.includes('amazon') ||
        lowerDesc.includes('gravitate smoke') || lowerDesc.includes('misc')) {
      return 'Shopping';
    }
    
    // Healthcare patterns
    if (lowerDesc.includes('dr.') || lowerDesc.includes('doctor') || 
        lowerDesc.includes('medical') || lowerDesc.includes('health')) {
      return 'Healthcare';
    }
    
    // Business & Professional patterns
    if (lowerDesc.includes('adobe') || lowerDesc.includes('anthropic') || 
        lowerDesc.includes('dropbox') || lowerDesc.includes('x corp')) {
      return 'Business & Professional';
    }
    
    // Subscriptions patterns
    if (lowerDesc.includes('amazon prime') || lowerDesc.includes('apple.com') || 
        lowerDesc.includes('netflix') || lowerDesc.includes('spotify') ||
        lowerDesc.includes('verizon') || lowerDesc.includes('centurylink') ||
        lowerDesc.includes('progressive') || lowerDesc.includes('eos fitness')) {
      return 'Subscriptions';
    }
    
    // Groceries patterns (Frys Food)
    if (lowerDesc.includes('frys food')) {
      return 'Groceries';
    }
    
    // Default category
    return 'Other';
  }

  /**
   * Get all available categories
   */
  static getAvailableCategories(): string[] {
    return [
      'Income',
      'Food & Dining', 
      'Transportation',
      'Shopping',
      'Healthcare',
      'Business & Professional',
      'Subscriptions',
      'Groceries',
      'Other'
    ];
  }
}