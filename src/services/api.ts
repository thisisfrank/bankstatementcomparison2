// API Service for PDF Parsing and Bank Statement Analysis
// Implementation based on API Documentation (APi doc.md)

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

// File management interface
export interface UploadedFile {
  uuid: string;
  filename: string;
  uploadTime: Date;
  status: 'READY' | 'PROCESSING' | 'ERROR';
}

// API Configuration - Based on API Documentation
const API_KEY = import.meta.env.VITE_PDF_PARSER_API_KEY || 'api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH';
const API_BASE_URL = import.meta.env.VITE_PDF_PARSER_API_URL || 'https://api2.bankstatementconverter.com/api/v1';

// Debug API key configuration
console.log('🔧 API Configuration Debug:', {
  hasEnvVar: !!import.meta.env.VITE_PDF_PARSER_API_KEY,
  envVarLength: import.meta.env.VITE_PDF_PARSER_API_KEY?.length || 0,
  finalApiKeyLength: API_KEY.length,
  finalApiKeyPrefix: API_KEY.substring(0, 10) + '...',
  apiBaseUrl: API_BASE_URL
});

// API Service - Implementation following bankstatementconverter.com API Documentation
export class ApiService {
  // Track uploaded files for cleanup
  private uploadedFiles: Map<string, UploadedFile> = new Map();

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    retryCount: number = 0,
    processStep?: string
  ): Promise<T> {
    // Enhanced API key validation
    if (!API_KEY || API_KEY.trim() === '') {
      throw new Error('API key not configured or empty');
    }

    // Validate API key format
    if (!API_KEY.startsWith('api-')) {
      console.warn('⚠️ API key may not be in correct format. Expected to start with "api-"');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    // Based on API Documentation: Direct API key as Authorization header
    const fullHeaders = {
      'Authorization': API_KEY, // As documented: Authorization: api-AB7psQuu...
      ...options.headers,
    };
    
    // Try alternative Authorization header format if the first one doesn't work
    const alternativeHeaders = {
      'Authorization': `Bearer ${API_KEY}`, // Alternative: Bearer token format
      ...options.headers,
    };
    
    console.log('🔑 API Request:', {
      url,
      method: options.method || 'GET',
      hasApiKey: !!API_KEY,
      apiKeyLength: API_KEY.length,
      apiKeyPrefix: API_KEY.substring(0, 10) + '...',
      retryCount,
      processStep
    });
    
    // Add detailed request debugging
    console.log('🔍 Detailed Request Debug:', {
      fullUrl: url,
      method: options.method || 'GET',
      headers: fullHeaders,
      alternativeHeaders: alternativeHeaders,
      hasBody: !!options.body,
      bodyType: options.body ? (options.body instanceof FormData ? 'FormData' : 'Other') : 'None',
      apiKeyLength: API_KEY ? API_KEY.length : 0,
      apiKeyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : 'None'
    });
    
    try {
      const response = await fetch(url, {
        headers: fullHeaders,
        ...options,
      });

      // Add response debugging
      console.log('📡 API Response Debug:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        redirected: response.redirected,
        type: response.type
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        // Enhanced error handling for authentication issues
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = `Authentication failed (401): Invalid or expired API key. Key length: ${API_KEY.length}, Prefix: ${API_KEY.substring(0, 10)}...`;
        } else if (response.status === 403) {
          errorMessage = `Access denied (403): API key may be invalid or insufficient permissions. Key length: ${API_KEY.length}, Prefix: ${API_KEY.substring(0, 10)}...`;
        } else if (response.status === 400) {
          // Parse the error response to provide better error messages
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.errorType === 'ANONYMOUS_NOT_ENOUGH_CREDITS') {
              errorMessage = `Credits limit exceeded (400): ${errorData.message}. Please upgrade your plan or try again tomorrow.`;
            } else if (errorData.errorType === 'NOT_ENOUGH_CREDITS') {
              errorMessage = `Insufficient credits (400): ${errorData.message}. Please add more credits to your account.`;
            } else {
              errorMessage = `Bad request (400): ${errorData.message || 'Invalid request format or parameters'}`;
            }
          } catch (parseError) {
            // If we can't parse the error response, use the raw text
            errorMessage = `Bad request (400): ${errorText}`;
          }
        }
        
        // Add process step context if available
        if (processStep) {
          errorMessage = `${processStep} failed: ${errorMessage}`;
        }
        
        // Retry logic for intermittent authorization issues
        const isAuthError = response.status === 401 || response.status === 403;
        const maxRetries = 3;
        const shouldRetry = isAuthError && retryCount < maxRetries;
        
        if (shouldRetry) {
          console.log(`🔄 Retrying due to auth error (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return this.makeRequest(endpoint, options, retryCount + 1, processStep);
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Add process step context to existing errors
        if (processStep && !error.message.includes(processStep)) {
          error.message = `${processStep} failed: ${error.message}`;
        }
        throw error;
      }
      throw new Error(processStep ? `${processStep} failed: Unknown error` : 'Unknown error');
    }
  }

  // Upload PDF files - Based on API Documentation: Multipart Form Data
  async uploadBankStatement(file: File): Promise<BankStatementUploadResponse[]> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Uploading file:', file.name, file.size);
    
    // API Documentation: POST /BankStatement with multipart form data
    const result = await this.makeRequest<BankStatementUploadResponse[]>('/BankStatement', {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - let browser set it with boundary for multipart
    }, 0, 'File Upload');

    // Track uploaded files for cleanup
    result.forEach(upload => {
      this.uploadedFiles.set(upload.uuid, {
        uuid: upload.uuid,
        filename: upload.filename,
        uploadTime: new Date(),
        status: upload.state
      });
    });

    console.log('📊 Tracked uploaded files:', this.uploadedFiles.size);
    return result;
  }

  // Check upload status - API Documentation: POST /BankStatement/status with UUID array
  async checkUploadStatus(uuids: string[]): Promise<BankStatementStatusResponse[]> {
    console.log('🔍 Checking status for:', uuids);
    
    // API Documentation: Body is a list of UUID strings in JSON
    const result = await this.makeRequest<BankStatementStatusResponse[]>('/BankStatement/status', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    }, 0, 'Status Check');

    // Update tracked files status
    result.forEach(status => {
      const trackedFile = this.uploadedFiles.get(status.uuid);
      if (trackedFile) {
        trackedFile.status = status.state;
      }
    });

    return result;
  }

  // Convert statements to JSON format
  async convertStatements(uuids: string[]): Promise<any[]> {
    console.log('🔄 Converting statements:', uuids);
    
    try {
      // Try multiple authentication approaches since the API has a bug
      // with the Authorization header on the convert endpoint
      const url = `/BankStatement/convert?format=JSON&apiKey=${encodeURIComponent(API_KEY)}`;
      
      // Try with Bearer token format instead of direct API key
      const response = await this.makeRequest<any[]>(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uuids)
      }, 0, 'Statement Conversion');
      
      console.log('✅ Conversion successful for', uuids.length, 'statements');
      return response;
    } catch (error) {
      console.error('❌ First conversion attempt failed, trying fallback method:', error);
      
      // Fallback: Try with the original direct API key format
      try {
        const fallbackUrl = `/BankStatement/convert?format=JSON`;
        const fallbackResponse = await this.makeRequest<any[]>(fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(uuids)
        }, 0, 'Statement Conversion (Fallback)');
        
        console.log('✅ Fallback conversion successful for', uuids.length, 'statements');
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('❌ Both conversion methods failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  // Add password for protected PDFs - API Documentation: POST /BankStatement/setPassword
  async setPassword(passwords: Array<{ uuid: string; password: string }>): Promise<BankStatementUploadResponse[]> {
    console.log('🔑 Setting passwords for PDFs');
    
    // API Documentation: Body contains passwords array
    return this.makeRequest<BankStatementUploadResponse[]>('/BankStatement/setPassword', {
      method: 'POST',
      body: JSON.stringify({ passwords }),
      headers: {
        'Content-Type': 'application/json',
      },
    }, 0, 'Password Setting');
  }

  // Get user credits - API Documentation: GET /user
  async getUserCredits(): Promise<UserCreditsResponse> {
    // API Documentation: GET request with Authorization header
    return this.makeRequest<UserCreditsResponse>('/user', {
      method: 'GET',
    }, 0, 'Credits Check');
  }

  // File management methods
  getUploadedFiles(): UploadedFile[] {
    return Array.from(this.uploadedFiles.values());
  }

  getUploadedFileCount(): number {
    return this.uploadedFiles.size;
  }

  // Clear specific uploaded file from tracking
  clearUploadedFile(uuid: string): void {
    this.uploadedFiles.delete(uuid);
    console.log('🗑️ Cleared uploaded file:', uuid);
  }

  // Clear all uploaded files from tracking
  clearAllUploadedFiles(): void {
    const count = this.uploadedFiles.size;
    this.uploadedFiles.clear();
    console.log('🗑️ Cleared all uploaded files:', count);
  }

  // Get files older than specified hours
  getOldFiles(hours: number = 24): UploadedFile[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.uploadedFiles.values()).filter(file => 
      file.uploadTime < cutoffTime
    );
  }

  // Auto-cleanup old files (older than 24 hours)
  autoCleanup(): void {
    const oldFiles = this.getOldFiles(24);
    oldFiles.forEach(file => {
      this.uploadedFiles.delete(file.uuid);
    });
    if (oldFiles.length > 0) {
      console.log('🧹 Auto-cleaned up old files:', oldFiles.length);
    }
  }

  // Process two bank statements - Following API Documentation workflow
  async processTwoStatements(
    file1: File,
    file2: File
  ): Promise<{
    file1Result: BankStatementConvertResponse;
    file2Result: BankStatementConvertResponse;
    file1Name: string;
    file2Name: string;
  }> {
    console.log('📤 Processing two statements following API documentation');
    
    // Auto-cleanup before processing
    this.autoCleanup();
    
    try {
      // Step 1: Upload both files (API Documentation: POST /BankStatement)
      console.log('📤 Step 1: Uploading files...');
      const [uploadResult1, uploadResult2] = await Promise.all([
        this.uploadBankStatement(file1),
        this.uploadBankStatement(file2)
      ]);
      
      const uuid1 = uploadResult1[0].uuid;
      const uuid2 = uploadResult2[0].uuid;
      console.log('✅ Step 1 completed: Uploaded with UUIDs:', { uuid1, uuid2 });
      
      // Step 2: Handle processing state (API Documentation: Poll every 10 seconds if PROCESSING)
      console.log('⏳ Step 2: Waiting for processing to complete...');
      const uuids = [uuid1, uuid2];
      await this.waitForProcessingComplete(uuids);
      console.log('✅ Step 2 completed: Processing finished');
      
      // Step 3: Convert statements (API Documentation: POST /BankStatement/convert?format=JSON)
      console.log('🔄 Step 3: Converting statements...');
      const [convertResult1, convertResult2] = await Promise.all([
        this.convertStatements([uuid1]),
        this.convertStatements([uuid2])
      ]);
      
      console.log('✅ Step 3 completed: Conversion finished');
      console.log('✅ All steps completed successfully');
      
      return {
        file1Result: convertResult1[0],
        file2Result: convertResult2[0],
        file1Name: file1.name,
        file2Name: file2.name
      };
    } catch (error) {
      // Enhanced error context
      if (error instanceof Error) {
        // The error message already includes the process step from makeRequest
        throw error;
      } else {
        throw new Error('Unknown error during statement processing');
      }
    }
  }

  // Wait for processing to complete - API Documentation: Poll status every 10 seconds
  private async waitForProcessingComplete(uuids: string[], maxAttempts: number = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const statusResults = await this.checkUploadStatus(uuids);
        const allReady = statusResults.every(result => result.state === 'READY');
        
        if (allReady) {
          console.log('✅ All files ready for conversion');
          return;
        }
        
        const hasError = statusResults.some(result => result.state === 'ERROR');
        if (hasError) {
          const errorFiles = statusResults.filter(result => result.state === 'ERROR');
          throw new Error(`PDF processing failed for files: ${errorFiles.map(f => f.filename).join(', ')}`);
        }
        
        console.log(`⏳ Files still processing, waiting 10 seconds... (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds as per API docs
      } catch (error) {
        // Re-throw with enhanced context
        if (error instanceof Error) {
          throw new Error(`Status Check failed: ${error.message}`);
        } else {
          throw new Error('Status Check failed: Unknown error during status polling');
        }
      }
    }
    
    throw new Error('Status Check failed: PDF processing timed out after 5 minutes');
  }

  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Please upload a PDF file' };
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    if (file.size === 0) {
      return { isValid: false, error: 'File is empty' };
    }
    return { isValid: true };
  }

  // Test API key validity
  async testApiKey(): Promise<{ isValid: boolean; error?: string; credits?: number }> {
    try {
      console.log('🧪 Testing API key validity...');
      const userCredits = await this.getUserCredits();
      console.log('✅ API key is valid, credits available:', userCredits.credits.paidCredits + userCredits.credits.freeCredits);
      return { 
        isValid: true, 
        credits: userCredits.credits.paidCredits + userCredits.credits.freeCredits 
      };
    } catch (error) {
      console.error('❌ API key test failed:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get current API key info (for debugging)
  getApiKeyInfo(): { hasKey: boolean; length: number; prefix: string; isEnvVar: boolean } {
    return {
      hasKey: !!API_KEY,
      length: API_KEY.length,
      prefix: API_KEY.substring(0, 10) + '...',
      isEnvVar: !!import.meta.env.VITE_PDF_PARSER_API_KEY
    };
  }

  // Get detailed account information including credits and user details
  async getAccountInfo(): Promise<{ 
    accountType: string; 
    unlimitedCredits: boolean; 
    paidCredits: number; 
    freeCredits: number; 
    subscriptionCount: number;
    userInfo: { firstName: string; lastName: string; email: string; emailVerified: boolean };
  }> {
    try {
      const accountInfo = await this.makeRequest<UserCreditsResponse>('/user', {}, 0, 'Account Info');
      
      // Determine account type based on credits and subscription
      let accountType = 'anonymous';
      if (accountInfo.unlimitedCredits) {
        accountType = 'unlimited';
      } else if (accountInfo.credits.paidCredits > 0) {
        accountType = 'paid';
      } else if (accountInfo.credits.freeCredits > 0) {
        accountType = 'free_tier';
      }
      
      console.log('🔍 Account Info:', {
        accountType,
        unlimitedCredits: accountInfo.unlimitedCredits,
        paidCredits: accountInfo.credits.paidCredits,
        freeCredits: accountInfo.credits.freeCredits,
        subscriptionCount: accountInfo.subscriptionCount,
        user: accountInfo.user
      });
      
      return {
        accountType,
        unlimitedCredits: accountInfo.unlimitedCredits,
        paidCredits: accountInfo.credits.paidCredits,
        freeCredits: accountInfo.credits.freeCredits,
        subscriptionCount: accountInfo.subscriptionCount,
        userInfo: accountInfo.user
      };
    } catch (error) {
      console.error('❌ Failed to get account info:', error);
      throw error;
    }
  }

  // Check if user has enough credits before processing
  async checkCreditsBeforeProcessing(fileCount: number = 2): Promise<{ 
    hasEnoughCredits: boolean; 
    availableCredits: number; 
    requiredCredits: number; 
    accountType: string; 
    paidCredits: number;
    freeCredits: number;
    error?: string 
  }> {
    try {
      const userCredits = await this.getUserCredits();
      const availableCredits = userCredits.credits.paidCredits + userCredits.credits.freeCredits;
      const requiredCredits = fileCount; // Assuming 1 credit per file
      
      // Determine account type
      let accountType = 'unknown';
      if (userCredits.unlimitedCredits) {
        accountType = 'unlimited';
      } else if (userCredits.credits.paidCredits > 0) {
        accountType = 'paid';
      } else if (userCredits.credits.freeCredits > 0) {
        accountType = 'free_tier';
      } else {
        accountType = 'anonymous';
      }
      
      console.log('💳 Credits check:', {
        available: availableCredits,
        required: requiredCredits,
        hasEnough: availableCredits >= requiredCredits,
        accountType,
        unlimitedCredits: userCredits.unlimitedCredits,
        paidCredits: userCredits.credits.paidCredits,
        freeCredits: userCredits.credits.freeCredits
      });
      
      // For free tier users, we can't reliably check daily limits
      // So we'll let the API handle the limit check
      const hasEnoughCredits = userCredits.unlimitedCredits || availableCredits >= requiredCredits;
      
      return {
        hasEnoughCredits,
        availableCredits,
        requiredCredits,
        accountType,
        paidCredits: userCredits.credits.paidCredits,
        freeCredits: userCredits.credits.freeCredits
      };
    } catch (error) {
      console.error('❌ Failed to check credits:', error);
      return {
        hasEnoughCredits: false,
        availableCredits: 0,
        requiredCredits: fileCount,
        accountType: 'unknown',
        paidCredits: 0,
        freeCredits: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }


}

export const apiService = new ApiService();