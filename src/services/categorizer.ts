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
        lowerDesc.includes('paypal transfer') || lowerDesc.includes('atm cash deposit') ||
        lowerDesc.includes('direct deposit')) {
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
        lowerDesc.includes('shakeshack') || lowerDesc.includes('new asian fusion') || 
        lowerDesc.includes('az pho grill')) {
      return 'Food & Dining';
    }
    
    // Transportation patterns
    if (lowerDesc.includes('shell') || lowerDesc.includes('arco') || 
        lowerDesc.includes('circle k') || lowerDesc.includes('uber') ||
        lowerDesc.includes('lyft') || lowerDesc.includes('autozone') ||
        lowerDesc.includes('los perez tire') || lowerDesc.includes('clean freak') ||
        lowerDesc.includes('ls bikemasters') || lowerDesc.includes('ace parking') ||
        lowerDesc.includes('parking') || lowerDesc.includes('car wash') ||
        lowerDesc.includes('auto parts') || lowerDesc.includes('oreilly') ||
        lowerDesc.includes('advance auto') || lowerDesc.includes('napa auto')) {
      return 'Transportation';
    }
    
    // Shopping patterns
    if (lowerDesc.includes('walmart') || lowerDesc.includes('target') || 
        lowerDesc.includes('barnes and noble') || lowerDesc.includes('dollartree') ||
        lowerDesc.includes('dollar tr') || lowerDesc.includes('amazon') ||
        lowerDesc.includes('gravitate smoke') || lowerDesc.includes('misc') ||
        lowerDesc.includes('costco') || lowerDesc.includes('home depot') ||
        lowerDesc.includes('lowes') || lowerDesc.includes('best buy') ||
        lowerDesc.includes('macy') || lowerDesc.includes('kohl') ||
        lowerDesc.includes('tj maxx') || lowerDesc.includes('marshalls')) {
      return 'Shopping';
    }
    
    // Subscriptions patterns (including business software tools)
    if (lowerDesc.includes('amazon prime') || lowerDesc.includes('apple.com') || 
        lowerDesc.includes('netflix') || lowerDesc.includes('spotify') ||
        lowerDesc.includes('verizon') || lowerDesc.includes('centurylink') ||
        lowerDesc.includes('progressive') || lowerDesc.includes('eos fitness') ||
        lowerDesc.includes('hulu') || lowerDesc.includes('disney') ||
        lowerDesc.includes('youtube') || lowerDesc.includes('peacock') ||
        lowerDesc.includes('adobe') || lowerDesc.includes('anthropic') || 
        lowerDesc.includes('dropbox') || lowerDesc.includes('x corp') ||
        lowerDesc.includes('office') || lowerDesc.includes('zoom') ||
        lowerDesc.includes('slack') || lowerDesc.includes('notion')) {
      return 'Subscriptions';
    }
    
    // Groceries patterns (Frys Food)
    if (lowerDesc.includes('frys food') || lowerDesc.includes('safeway') ||
        lowerDesc.includes('albertsons') || lowerDesc.includes('kroger') ||
        lowerDesc.includes('whole foods') || lowerDesc.includes('trader joe') ||
        lowerDesc.includes('sprouts') || lowerDesc.includes('winco')) {
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
      'Subscriptions',
      'Groceries',
      'Other'
    ];
  }
}