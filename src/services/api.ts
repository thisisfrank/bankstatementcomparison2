// API Service for PDF Parsing and Bank Statement Analysis

// Bank Statement Converter API Types
export interface BankStatementUploadResponse {
  uuid: string;
  filename: string;
  pdfType: 'TEXT_BASED' | 'IMAGE_BASED';
  state: 'READY' | 'PROCESSING' | 'ERROR';
  numberOfPages?: number;
}

export interface BankStatementStatusResponse {
  uuid: string;
  filename: string;
  pdfType: 'TEXT_BASED' | 'IMAGE_BASED';
  state: 'READY' | 'PROCESSING' | 'ERROR';
  numberOfPages?: number;
}

export interface BankStatementTransaction {
  date: string;
  description: string;
  amount: string; // API returns string, we'll convert to number
}

export interface BankStatementConvertResponse {
  normalised: BankStatementTransaction[];
}

export interface UserCreditsResponse {
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    referralCode: string;
    apiKey: string;
  };
  credits: {
    paidCredits: number;
    freeCredits: number;
  };
  unlimitedCredits: boolean;
  subscriptionCount: number;
}

// Legacy types for backward compatibility
export interface ParseRequest {
  file: File;
  fileName: string;
  userId?: string;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'debit' | 'credit';
}

export interface StatementSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  startDate: string;
  endDate: string;
  accountNumber?: string;
  bankName?: string;
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface ParsedStatement {
  summary: StatementSummary;
  transactions: Transaction[];
  categories: CategoryBreakdown[];
}

export interface ComparisonResult {
  statement1: ParsedStatement;
  statement2: ParsedStatement;
  comparison: {
    category: string;
    statement1Total: number;
    statement2Total: number;
    difference: number;
    percentChange: number;
    transactions1: Transaction[];
    transactions2: Transaction[];
  }[];
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_PDF_PARSER_API_URL || 'https://api2.bankstatementconverter.com/api/v1';
const API_KEY = import.meta.env.VITE_PDF_PARSER_API_KEY;

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!API_KEY) {
      throw new Error(JSON.stringify({
        error: 'API key not configured',
        code: 'CONFIG_ERROR',
        details: 'Please set VITE_PDF_PARSER_API_KEY in your environment'
      }));
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': API_KEY,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Network error',
          code: 'NETWORK_ERROR',
          details: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('{')) {
        throw error; // Re-throw API errors as-is
      }
      
      // Handle network/parsing errors
      const networkError: ApiError = {
        error: 'Network or parsing error',
        code: 'NETWORK_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
      throw new Error(JSON.stringify(networkError));
    }
  }

  private async uploadFile(file: File): Promise<FormData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());
    return formData;
  }

  /**
   * Upload PDF to Bank Statement Converter API
   */
  async uploadBankStatement(file: File): Promise<BankStatementUploadResponse[]> {
    if (!API_KEY) {
      throw new Error(JSON.stringify({
        error: 'API key not configured',
        code: 'CONFIG_ERROR',
        details: 'Please set VITE_PDF_PARSER_API_KEY in your environment'
      }));
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/BankStatement`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Failed to upload bank statement',
        code: 'UPLOAD_ERROR',
        details: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
  }

  /**
   * Check upload status for processing files
   */
  async checkUploadStatus(uuids: string[]): Promise<BankStatementStatusResponse[]> {
    return this.makeRequest<BankStatementStatusResponse[]>('/BankStatement/status', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Convert uploaded statements to JSON
   */
  async convertStatements(uuids: string[]): Promise<BankStatementConvertResponse[]> {
    return this.makeRequest<BankStatementConvertResponse[]>('/BankStatement/convert?format=JSON', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set password for password-protected PDFs
   */
  async setPassword(passwords: { uuid: string; password: string }[]): Promise<BankStatementUploadResponse[]> {
    return this.makeRequest<BankStatementUploadResponse[]>('/BankStatement/setPassword', {
      method: 'POST',
      body: JSON.stringify({ passwords }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get user credits and information
   */
  async getUserCredits(): Promise<UserCreditsResponse> {
    return this.makeRequest<UserCreditsResponse>('/user', {
      method: 'GET',
    });
  }

  /**
   * Categorize transaction based on description
   */
  private categorizeTransaction(description: string): string {
    const desc = description.toLowerCase();
    
    // Housing
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('property') || 
        desc.includes('hoa') || desc.includes('utilities') || desc.includes('electric') ||
        desc.includes('gas bill') || desc.includes('water') || desc.includes('internet') ||
        desc.includes('cable') || desc.includes('homeowners')) {
      return 'Housing';
    }
    
    // Transportation
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('shell') || 
        desc.includes('exxon') || desc.includes('bp ') || desc.includes('chevron') ||
        desc.includes('auto') || desc.includes('car') || desc.includes('insurance') ||
        desc.includes('uber') || desc.includes('lyft') || desc.includes('taxi') ||
        desc.includes('parking') || desc.includes('toll') || desc.includes('dmv') ||
        desc.includes('registration')) {
      return 'Transportation';
    }
    
    // Food & Dining
    if (desc.includes('restaurant') || desc.includes('food') || desc.includes('grocery') ||
        desc.includes('market') || desc.includes('cafe') || desc.includes('coffee') ||
        desc.includes('starbucks') || desc.includes('mcdonalds') || desc.includes('subway') ||
        desc.includes('pizza') || desc.includes('deli') || desc.includes('bakery') ||
        desc.includes('dining') || desc.includes('lunch') || desc.includes('dinner') ||
        desc.includes('breakfast') || desc.includes('safeway') || desc.includes('kroger') ||
        desc.includes('whole foods') || desc.includes('trader joe')) {
      return 'Food & Dining';
    }
    
    // Shopping
    if (desc.includes('amazon') || desc.includes('target') || desc.includes('walmart') ||
        desc.includes('costco') || desc.includes('mall') || desc.includes('shopping') ||
        desc.includes('retail') || desc.includes('store') || desc.includes('purchase') ||
        desc.includes('ebay') || desc.includes('clothing') || desc.includes('apparel')) {
      return 'Shopping';
    }
    
    // Entertainment
    if (desc.includes('movie') || desc.includes('theater') || desc.includes('netflix') ||
        desc.includes('spotify') || desc.includes('gaming') || desc.includes('entertainment') ||
        desc.includes('concert') || desc.includes('show') || desc.includes('ticket') ||
        desc.includes('streaming') || desc.includes('hulu') || desc.includes('disney')) {
      return 'Entertainment';
    }
    
    // Healthcare
    if (desc.includes('medical') || desc.includes('doctor') || desc.includes('hospital') ||
        desc.includes('pharmacy') || desc.includes('dental') || desc.includes('health') ||
        desc.includes('cvs') || desc.includes('walgreens') || desc.includes('clinic')) {
      return 'Healthcare';
    }
    
    // Business/Professional
    if (desc.includes('office') || desc.includes('business') || desc.includes('professional') ||
        desc.includes('service') || desc.includes('legal') || desc.includes('consulting') ||
        desc.includes('fee') || desc.includes('subscription') || desc.includes('software')) {
      return 'Business & Professional';
    }
    
    // Default category
    return 'Other';
  }

  /**
   * Convert Bank Statement API response to our internal format
   */
  private convertApiTransactionToTransaction(apiTransaction: BankStatementTransaction): Transaction {
    const amount = parseFloat(apiTransaction.amount);
    return {
      date: apiTransaction.date,
      description: apiTransaction.description,
      amount: Math.abs(amount), // Store as positive, use type to indicate debit/credit
      category: this.categorizeTransaction(apiTransaction.description),
      type: amount < 0 ? 'debit' : 'credit'
    };
  }

  /**
   * Parse a single PDF bank statement
   */
  async parseStatement(request: ParseRequest): Promise<ParsedStatement> {
    const formData = await this.uploadFile(request.file);
    
    if (request.userId) {
      formData.append('userId', request.userId);
    }

    const response = await fetch(`${API_BASE_URL}/parse-statement`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Failed to parse statement',
        code: 'PARSE_ERROR',
        details: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
  }

  /**
   * Compare two parsed statements
   */
  async compareStatements(
    statement1: ParsedStatement, 
    statement2: ParsedStatement
  ): Promise<ComparisonResult> {
    return this.makeRequest<ComparisonResult>('/compare-statements', {
      method: 'POST',
      body: JSON.stringify({
        statement1,
        statement2,
      }),
    });
  }

  /**
   * Parse and compare two statements using Bank Statement Converter API
   */
  async parseAndCompare(
    file1: File,
    file2: File,
    _userId?: string
  ): Promise<ComparisonResult> {
    try {
      // Step 1: Upload both files
      const [uploadResult1, uploadResult2] = await Promise.all([
        this.uploadBankStatement(file1),
        this.uploadBankStatement(file2)
      ]);

      if (!uploadResult1.length || !uploadResult2.length) {
        throw new Error(JSON.stringify({
          error: 'Failed to upload bank statements',
          code: 'UPLOAD_ERROR',
          details: 'No upload results returned from API'
        }));
      }

      const uuid1 = uploadResult1[0].uuid;
      const uuid2 = uploadResult2[0].uuid;

      // Step 2: Wait for processing if needed
      await this.waitForProcessing([uuid1, uuid2]);

      // Step 3: Convert to JSON
      const [convertResult1, convertResult2] = await Promise.all([
        this.convertStatements([uuid1]),
        this.convertStatements([uuid2])
      ]);

      if (!convertResult1.length || !convertResult2.length) {
        throw new Error(JSON.stringify({
          error: 'Failed to convert bank statements',
          code: 'CONVERSION_ERROR',
          details: 'No conversion results returned from API'
        }));
      }

      // Step 4: Convert to our internal format and create comparison
      const statement1 = this.convertToInternalFormat(convertResult1[0], file1.name);
      const statement2 = this.convertToInternalFormat(convertResult2[0], file2.name);

      return this.createComparison(statement1, statement2);

    } catch (error) {
      if (error instanceof Error && error.message.startsWith('{')) {
        throw error; // Re-throw API errors
      }
      
      throw new Error(JSON.stringify({
        error: 'Failed to process bank statements',
        code: 'PROCESSING_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  /**
   * Wait for processing to complete for image-based PDFs
   */
  private async waitForProcessing(uuids: string[]): Promise<void> {
    const maxAttempts = 30; // 5 minutes max (10 seconds * 30)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResults = await this.checkUploadStatus(uuids);
      
      const allReady = statusResults.every(result => result.state === 'READY');
      const hasError = statusResults.some(result => result.state === 'ERROR');

      if (hasError) {
        throw new Error(JSON.stringify({
          error: 'Processing failed for one or more statements',
          code: 'PROCESSING_ERROR',
          details: 'Bank statement processing failed on server'
        }));
      }

      if (allReady) {
        return; // All files are ready
      }

      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error(JSON.stringify({
      error: 'Processing timeout',
      code: 'TIMEOUT_ERROR',
      details: 'Bank statement processing took too long'
    }));
  }

  /**
   * Convert Bank Statement API response to our internal format
   */
  private convertToInternalFormat(apiResponse: BankStatementConvertResponse, _filename: string): ParsedStatement {
    const transactions: Transaction[] = apiResponse.normalised.map(t => 
      this.convertApiTransactionToTransaction(t)
    );

    // Calculate summary
    const deposits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get date range
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates.length > 0 ? dates[0].toISOString().split('T')[0] : '';
    const endDate = dates.length > 0 ? dates[dates.length - 1].toISOString().split('T')[0] : '';

    // Group by category
    const categoryMap = new Map<string, Transaction[]>();
    transactions.forEach(transaction => {
      if (!categoryMap.has(transaction.category)) {
        categoryMap.set(transaction.category, []);
      }
      categoryMap.get(transaction.category)!.push(transaction);
    });

    const categories: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(([category, categoryTransactions]) => ({
      category,
      totalAmount: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: categoryTransactions.length,
      transactions: categoryTransactions
    }));

    return {
      summary: {
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        startDate,
        endDate,
        bankName: 'Unknown', // API doesn't provide bank name
        accountNumber: 'Unknown' // API doesn't provide account number
      },
      transactions,
      categories
    };
  }

  /**
   * Create comparison result from two parsed statements
   */
  private createComparison(statement1: ParsedStatement, statement2: ParsedStatement): ComparisonResult {
    // Get all unique categories
    const allCategories = new Set([
      ...statement1.categories.map(c => c.category),
      ...statement2.categories.map(c => c.category)
    ]);

    const comparison = Array.from(allCategories).map(category => {
      const cat1 = statement1.categories.find(c => c.category === category);
      const cat2 = statement2.categories.find(c => c.category === category);
      
      const amount1 = cat1?.totalAmount || 0;
      const amount2 = cat2?.totalAmount || 0;
      const difference = amount2 - amount1;
      const percentChange = amount1 > 0 ? (difference / amount1) * 100 : 0;

      return {
        category,
        statement1Total: amount1,
        statement2Total: amount2,
        difference,
        percentChange,
        transactions1: cat1?.transactions || [],
        transactions2: cat2?.transactions || []
      };
    });

    return {
      statement1,
      statement2,
      comparison
    };
  }

  /**
   * Validate PDF file before processing
   */
  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'Please upload a PDF file'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    // Check file name
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return {
        isValid: false,
        error: 'File must have a .pdf extension'
      };
    }

    return { isValid: true };
  }

  /**
   * Get processing status for a file
   */
  async getProcessingStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress?: number;
    result?: ParsedStatement;
    error?: string;
  }> {
    return this.makeRequest(`/processing-status/${jobId}`);
  }

  /**
   * Health check for API availability (using user credits endpoint)
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.getUserCredits();
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(JSON.stringify({
        error: 'API health check failed',
        code: 'HEALTH_CHECK_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Utility function to parse API errors
export function parseApiError(error: Error): ApiError {
  try {
    return JSON.parse(error.message);
  } catch {
    return {
      error: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      details: error.message
    };
  }
}

// Mock data for development/fallback (existing mock structure)
export const mockComparisonResult: ComparisonResult = {
  statement1: {
    summary: {
      totalDeposits: 4250.00,
      totalWithdrawals: 3470.75,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      bankName: 'Wells Fargo',
      accountNumber: '****1234'
    },
    transactions: [],
    categories: []
  },
  statement2: {
    summary: {
      totalDeposits: 4250.00,
      totalWithdrawals: 3396.15,
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      bankName: 'Wells Fargo',
      accountNumber: '****1234'
    },
    transactions: [],
    categories: []
  },
  comparison: [
    {
      category: 'Housing',
      statement1Total: 2450.00,
      statement2Total: 2450.00,
      difference: 0.00,
      percentChange: 0,
      transactions1: [
        { date: '2024-01-01', description: 'Rent Payment', amount: 2450.00, category: 'Housing', type: 'debit' }
      ],
      transactions2: [
        { date: '2024-02-01', description: 'Rent Payment', amount: 2450.00, category: 'Housing', type: 'debit' }
      ]
    },
    {
      category: 'Transportation',
      statement1Total: 340.50,
      statement2Total: 425.75,
      difference: 85.25,
      percentChange: 25.0,
      transactions1: [
        { date: '2024-01-05', description: 'Gas Station', amount: 65.50, category: 'Transportation', type: 'debit' },
        { date: '2024-01-12', description: 'Gas Station', amount: 72.00, category: 'Transportation', type: 'debit' },
        { date: '2024-01-20', description: 'Car Insurance', amount: 203.00, category: 'Transportation', type: 'debit' }
      ],
      transactions2: [
        { date: '2024-02-03', description: 'Gas Station', amount: 68.25, category: 'Transportation', type: 'debit' },
        { date: '2024-02-10', description: 'Gas Station', amount: 74.50, category: 'Transportation', type: 'debit' },
        { date: '2024-02-18', description: 'Car Insurance', amount: 203.00, category: 'Transportation', type: 'debit' },
        { date: '2024-02-25', description: 'Car Repair', amount: 80.00, category: 'Transportation', type: 'debit' }
      ]
    },
    {
      category: 'Food & Dining',
      statement1Total: 680.25,
      statement2Total: 520.40,
      difference: -159.85,
      percentChange: -23.5,
      transactions1: [
        { date: '2024-01-03', description: 'Grocery Store', amount: 125.50, category: 'Food & Dining', type: 'debit' },
        { date: '2024-01-08', description: 'Restaurant', amount: 45.75, category: 'Food & Dining', type: 'debit' },
        { date: '2024-01-15', description: 'Grocery Store', amount: 98.25, category: 'Food & Dining', type: 'debit' },
        { date: '2024-01-22', description: 'Coffee Shop', amount: 28.50, category: 'Food & Dining', type: 'debit' },
        { date: '2024-01-28', description: 'Takeout', amount: 35.75, category: 'Food & Dining', type: 'debit' }
      ],
      transactions2: [
        { date: '2024-02-02', description: 'Grocery Store', amount: 110.25, category: 'Food & Dining', type: 'debit' },
        { date: '2024-02-09', description: 'Restaurant', amount: 52.30, category: 'Food & Dining', type: 'debit' },
        { date: '2024-02-16', description: 'Grocery Store', amount: 89.40, category: 'Food & Dining', type: 'debit' },
        { date: '2024-02-23', description: 'Coffee Shop', amount: 22.75, category: 'Food & Dining', type: 'debit' }
      ]
    }
  ]
};
