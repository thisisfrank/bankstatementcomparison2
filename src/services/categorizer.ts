// Transaction Categorization Service
// Handles automatic categorization of transactions based on description patterns
// Based on working parser implementation

export class TransactionCategorizer {
  /**
   * Categorize transaction based on description using working parser logic
   */
  static categorizeTransaction(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    // Special case: Frys always goes to groceries (even if it says recurring)
    if (lowerDesc.includes('frys')) {
      return 'groceries';
    }
    
    // Working parser's category system with exact keywords
    const categoryKeywords = {
      'food-dining': ['starbucks', 'coffee', 'restaurant', 'mcdonald', 'taco bell', 'chipotle', 'subway', 'pizza', 'burger', 'dining'],
      'groceries': ['frys', 'safeway', 'walmart', 'target', 'kroger', 'grocery', 'market', 'food store'],
      'gas-transport': ['circle k', 'shell', 'chevron', 'exxon', 'uber', 'lyft', 'gas', 'fuel', 'transport'],
      'shopping': ['amazon', 'ebay', 'shop', 'store', 'retail', 'purchase', 'misc', 'other', 'unknown', 'unclassified'],
      'subscriptions': ['netflix', 'spotify', 'subscription', 'monthly', 'hulu', 'disney', 'prime', 'recurring', 'verizon'],
      'utilities': ['electric', 'water', 'gas bill', 'utility', 'phone', 'internet', 'cable', 'atm', 'fee', 'charge', 'overdraft', 'penalty', 'applecard'],
      'health': ['gym', 'health', 'medical', 'pharmacy', 'fitness', 'doctor', 'planet fitness', 'fitness center', 'workout'],
      'income': ['salary', 'deposit', 'payment', 'income', 'payroll', 'direct deposit']
    };
    
    // Find matching category based on keywords
    for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return categoryId;
      }
    }
    
    return 'shopping'; // Default category (like working parser)
  }
}