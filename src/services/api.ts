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
  numberOfPages?: number; // Add page count information
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
const BSC_AUTH_TOKEN = import.meta.env.VITE_BSC_AUTH_TOKEN || '';
const API_BASE_URL = import.meta.env.VITE_PDF_PARSER_API_URL || 'https://api2.bankstatementconverter.com/api/v1';

// Debug API configuration
console.log('🔧 API Configuration Debug:', {
  hasApiKey: !!import.meta.env.VITE_PDF_PARSER_API_KEY,
  apiKeyLength: import.meta.env.VITE_PDF_PARSER_API_KEY?.length || 0,
  apiKeyPrefix: import.meta.env.VITE_PDF_PARSER_API_KEY ? import.meta.env.VITE_PDF_PARSER_API_KEY.substring(0, 20) + '...' : 'None',
  hasAuthToken: !!BSC_AUTH_TOKEN,
  authTokenLength: BSC_AUTH_TOKEN?.length || 0,
  authTokenPrefix: BSC_AUTH_TOKEN ? BSC_AUTH_TOKEN.substring(0, 20) + '...' : 'None',
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
    // Check if we have either API key or JWT token
    const hasApiKey = import.meta.env.VITE_PDF_PARSER_API_KEY && import.meta.env.VITE_PDF_PARSER_API_KEY.trim() !== '';
    const hasJwtToken = BSC_AUTH_TOKEN && BSC_AUTH_TOKEN.trim() !== '';
    
    if (!hasApiKey && !hasJwtToken) {
      throw new Error('Neither API key nor JWT authentication token configured');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    // Define all possible authentication patterns to try
    const authPatterns = [];
    
    if (hasApiKey) {
      const apiKey = import.meta.env.VITE_PDF_PARSER_API_KEY;
      authPatterns.push(
        { name: 'Direct API Key', headers: { 'Authorization': apiKey } },
        { name: 'Bearer + API Key', headers: { 'Authorization': `Bearer ${apiKey}` } },
        { name: 'X-API-Key Header', headers: { 'X-API-Key': apiKey } },
        { name: 'apiKey Query Param', headers: {}, queryParam: `?apiKey=${encodeURIComponent(apiKey)}` },
        { name: 'Custom API Key Header', headers: { 'X-Auth-Key': apiKey } },
        { name: 'API Key in Body', headers: {}, bodyOverride: { apiKey } }
      );
    }
    
    if (hasJwtToken) {
      authPatterns.push(
        { name: 'Bearer JWT', headers: { 'Authorization': `Bearer ${BSC_AUTH_TOKEN}` } },
        { name: 'Direct JWT', headers: { 'Authorization': BSC_AUTH_TOKEN } },
        { name: 'X-Auth-Token Header', headers: { 'X-Auth-Token': BSC_AUTH_TOKEN } },
        { name: 'JWT Query Param', headers: {}, queryParam: `?token=${encodeURIComponent(BSC_AUTH_TOKEN)}` },
        { name: 'Custom JWT Header', headers: { 'X-JWT-Token': BSC_AUTH_TOKEN } }
      );
    }
    
    console.log('🔑 API Request:', {
      url,
      method: options.method || 'GET',
      hasApiKey,
      hasJwtToken,
      apiKeyLength: import.meta.env.VITE_PDF_PARSER_API_KEY?.length || 0,
      jwtTokenLength: BSC_AUTH_TOKEN?.length || 0,
      authPatternsCount: authPatterns.length,
      retryCount,
      processStep
    });
    
    // Try each authentication pattern
    for (let i = 0; i < authPatterns.length; i++) {
      const pattern = authPatterns[i];
      const patternUrl = pattern.queryParam ? `${url}${pattern.queryParam}` : url;
      
      console.log(`🔑 Trying authentication pattern ${i + 1}/${authPatterns.length}: ${pattern.name}`);
      
      try {
        const requestOptions: RequestInit = { ...options };
        
        // Merge headers
        requestOptions.headers = {
          ...(pattern.headers as Record<string, string>),
          ...(options.headers as Record<string, string> || {})
        };
        
        // Handle body override if needed
        if (pattern.bodyOverride) {
          if (options.body) {
            // If there's already a body, merge the apiKey into it
            if (options.body instanceof FormData) {
              requestOptions.body = options.body;
              (requestOptions.body as FormData).append('apiKey', pattern.bodyOverride.apiKey);
            } else if (typeof options.body === 'string') {
              try {
                const bodyObj = JSON.parse(options.body);
                bodyObj.apiKey = pattern.bodyOverride.apiKey;
                requestOptions.body = JSON.stringify(bodyObj);
              } catch {
                // If we can't parse as JSON, append to string
                requestOptions.body = `${options.body}&apiKey=${pattern.bodyOverride.apiKey}`;
              }
            }
          } else {
            requestOptions.body = JSON.stringify(pattern.bodyOverride);
            if (requestOptions.headers) {
              (requestOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
            }
          }
        }
        
        console.log('🔍 Pattern Debug:', {
          pattern: pattern.name,
          url: patternUrl,
          headers: requestOptions.headers,
          hasBody: !!requestOptions.body,
          bodyType: requestOptions.body ? (requestOptions.body instanceof FormData ? 'FormData' : 'Other') : 'None'
        });
        
        const response = await fetch(patternUrl, requestOptions);
        
        // Log response details
        console.log('📡 Pattern Response:', {
          pattern: pattern.name,
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        if (response.ok) {
          console.log(`✅ Authentication pattern "${pattern.name}" SUCCESSFUL!`);
          return await response.json();
        }
        
        // If not successful, log the error but continue to next pattern
        const errorText = await response.text();
        console.log(`⚠️ Pattern "${pattern.name}" failed with status ${response.status}: ${errorText}`);
        
        // If this is a 401/403, it's an auth issue, but if it's 400, it might be a different problem
        if (response.status === 401 || response.status === 403) {
          console.log(`🔒 Pattern "${pattern.name}" failed due to authentication (${response.status})`);
        } else if (response.status === 400) {
          console.log(`📝 Pattern "${pattern.name}" failed due to request format (${response.status})`);
        }
        
      } catch (error) {
        console.log(`❌ Pattern "${pattern.name}" failed with error:`, error);
      }
    }
    
    // If we get here, all patterns failed
    const errorMessage = `All ${authPatterns.length} authentication patterns failed. This suggests either:\n` +
      `1. All authentication methods are invalid\n` +
      `2. There's a server-side bug (most likely)\n` +
      `3. The API expects a different format not covered here`;
    
    console.error('💥 All authentication patterns exhausted:', errorMessage);
    throw new Error(errorMessage);
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
      // Use JWT authentication for the convert endpoint
      const response = await this.makeRequest<any[]>(`/BankStatement/convert?format=JSON`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uuids)
      }, 0, 'Statement Conversion');
      
      console.log('✅ Conversion successful for', uuids.length, 'statements');
      return response;
    } catch (error) {
      console.error('❌ Statement conversion failed:', error);
      throw error;
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
    file1Pages: number;
    file2Pages: number;
    totalPages: number;
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
      const statusResults = await this.waitForProcessingComplete(uuids);
      console.log('✅ Step 2 completed: Processing finished');
      
      // Step 3: Convert statements (API Documentation: POST /BankStatement/convert?format=JSON)
      console.log('🔄 Step 3: Converting statements...');
      const [convertResult1, convertResult2] = await Promise.all([
        this.convertStatements([uuid1]),
        this.convertStatements([uuid2])
      ]);
      
      // Extract page counts from status results
      const file1Status = statusResults.find(status => status.uuid === uuid1);
      const file2Status = statusResults.find(status => status.uuid === uuid2);
      
      const file1Pages = file1Status?.numberOfPages || 1; // Default to 1 if not available
      const file2Pages = file2Status?.numberOfPages || 1; // Default to 1 if not available
      const totalPages = file1Pages + file2Pages;
      
      console.log('📊 Page counts:', { file1Pages, file2Pages, totalPages });
      console.log('✅ Step 3 completed: Conversion finished');
      console.log('✅ All steps completed successfully');
      
      return {
        file1Result: convertResult1[0],
        file2Result: convertResult2[0],
        file1Name: file1.name,
        file2Name: file2.name,
        file1Pages,
        file2Pages,
        totalPages
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
  private async waitForProcessingComplete(uuids: string[], maxAttempts: number = 30): Promise<BankStatementStatusResponse[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const statusResults = await this.checkUploadStatus(uuids);
        const allReady = statusResults.every(result => result.state === 'READY');
        
        if (allReady) {
          console.log('✅ All files ready for conversion');
          return statusResults; // Return status results for page count extraction
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

  // Get authentication information for debugging
  getAuthInfo(): { 
    hasApiKey: boolean; 
    apiKeyLength: number; 
    apiKeyPrefix: string; 
    hasJwtToken: boolean;
    jwtTokenLength: number; 
    jwtTokenPrefix: string; 
    isApiKeyEnvVar: boolean;
    isJwtEnvVar: boolean;
  } {
    return {
      hasApiKey: !!import.meta.env.VITE_PDF_PARSER_API_KEY,
      apiKeyLength: import.meta.env.VITE_PDF_PARSER_API_KEY?.length || 0,
      apiKeyPrefix: import.meta.env.VITE_PDF_PARSER_API_KEY ? import.meta.env.VITE_PDF_PARSER_API_KEY.substring(0, 20) + '...' : 'None',
      hasJwtToken: !!BSC_AUTH_TOKEN,
      jwtTokenLength: BSC_AUTH_TOKEN?.length || 0,
      jwtTokenPrefix: BSC_AUTH_TOKEN ? BSC_AUTH_TOKEN.substring(0, 20) + '...' : 'None',
      isApiKeyEnvVar: !!import.meta.env.VITE_PDF_PARSER_API_KEY,
      isJwtEnvVar: !!import.meta.env.VITE_BSC_AUTH_TOKEN
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

  // Deduct credits after successful processing
  async deductCreditsAfterProcessing(fileCount: number = 2): Promise<void> {
    try {
      console.log('💳 Deducting credits after successful processing...');
      
      // Call API to deduct credits - this would typically be a POST to a deduction endpoint
      // For now, we'll log the deduction since the exact API endpoint isn't specified
      console.log(`📊 Deducting ${fileCount} credits for ${fileCount} processed files`);
      
      // TODO: Replace with actual API call when endpoint is available
      // Example: await this.makeRequest('/credits/deduct', {
      //   method: 'POST',
      //   body: JSON.stringify({ filesProcessed: fileCount }),
      //   headers: { 'Content-Type': 'application/json' }
      // }, 0, 'Credit Deduction');
      
      // For now, just log the deduction
      console.log('✅ Credit deduction logged (API endpoint to be implemented)');
      
    } catch (error) {
      console.error('❌ Failed to deduct credits:', error);
      throw error;
    }
  }

}

export const apiService = new ApiService();