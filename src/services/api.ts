// API Service for PDF Parsing and Bank Statement Analysis
// 
// - Bank Statement Converter API: Handles PDF parsing only (upload, convert to JSON)
// - Frontend: Handles all comparison logic locally (categorization, calculations, analysis)

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

// Import shared types
import { ApiError } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_PDF_PARSER_API_URL || 'https://api2.bankstatementconverter.com/api/v1';
const API_KEY = import.meta.env.VITE_PDF_PARSER_API_KEY;

export class ApiService {
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
    
    const fullHeaders = {
      'Authorization': API_KEY,
      ...options.headers,
    };
    
    console.log('🔑 API: Making request', {
      url,
      method: options.method || 'GET',
      hasApiKey: !!API_KEY,
      apiKeyLength: API_KEY?.length,
      apiKeyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'MISSING',
      fullApiKey: API_KEY, // Show full API key for debugging
      allHeaders: fullHeaders,
      bodyType: options.body ? (typeof options.body === 'string' ? 'JSON' : options.body instanceof FormData ? 'FormData' : 'Other') : 'No body',
      bodyPreview: options.body ? (typeof options.body === 'string' ? options.body.substring(0, 200) : 'FormData/Binary') : 'No body',
      parsedBody: options.body && typeof options.body === 'string' ? (() => {
        try { return JSON.parse(options.body); } catch { return 'Invalid JSON'; }
      })() : 'Not JSON'
    });
    
    try {
      const response = await fetch(url, {
        headers: fullHeaders,
        ...options,
      });

      if (!response.ok) {
        console.log('❌ API: Response not OK', { 
          status: response.status, 
          statusText: response.statusText,
          url: url 
        });
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Network error',
          code: 'NETWORK_ERROR',
          details: `HTTP ${response.status}: ${response.statusText}`
        }));
        console.log('❌ API: Error data received', errorData);
        
        // Pass through API errors with original error type for proper handling in hook
        if (errorData && typeof errorData === 'object' && 'errorType' in errorData) {
          const apiErrorData = errorData as any;
          console.log('⚠️ API: Detected specific error type', apiErrorData.errorType);
          // Convert API error format to our standard format while preserving error type
          throw new Error(JSON.stringify({
            error: apiErrorData.message || 'API error',
            code: apiErrorData.errorType, // Use original error type
            details: `API Error: ${apiErrorData.errorType}`
          }));
        }
        
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



  /**
   * Upload PDF to Bank Statement Converter API
   */
  async uploadBankStatement(file: File): Promise<BankStatementUploadResponse[]> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<BankStatementUploadResponse[]>('/BankStatement', {
      method: 'POST',
      body: formData,
    });
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
    console.log('🔍 API: convertStatements called with UUIDs:', uuids);
    console.log('🔍 API: Request body for convert (raw array):', uuids);
    
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
   * Process two bank statements through the API pipeline
   * Returns raw API responses for external processing
   */
  async processTwoStatements(
    file1: File,
    file2: File
  ): Promise<{
    file1Result: BankStatementConvertResponse;
    file2Result: BankStatementConvertResponse;
    file1Name: string;
    file2Name: string;
  }> {
    console.log('📤 API: Starting bank statement processing', { file1: file1.name, file2: file2.name });
    
    // Step 1: Upload both files to Bank Statement Converter API
    console.log('📤 API: Uploading files...');
    const [uploadResult1, uploadResult2] = await Promise.all([
      this.uploadBankStatement(file1),
      this.uploadBankStatement(file2)
    ]);
    
    // Validate upload results before accessing
    if (!uploadResult1 || uploadResult1.length === 0 || !uploadResult1[0].uuid) {
      throw new Error(JSON.stringify({
        error: 'File 1 upload failed',
        code: 'UPLOAD_ERROR',
        details: 'Upload response was empty or missing UUID'
      }));
    }
    
    if (!uploadResult2 || uploadResult2.length === 0 || !uploadResult2[0].uuid) {
      throw new Error(JSON.stringify({
        error: 'File 2 upload failed', 
        code: 'UPLOAD_ERROR',
        details: 'Upload response was empty or missing UUID'
      }));
    }
    
    const uuid1 = uploadResult1[0].uuid;
    const uuid2 = uploadResult2[0].uuid;
    console.log('✅ API: Upload completed', { uuid1, uuid2 });
    
    // Step 2: Convert PDFs to structured JSON data
    console.log('🔄 API: Converting PDFs to JSON...');
    const [convertResult1, convertResult2] = await Promise.all([
      this.convertStatements([uuid1]),
      this.convertStatements([uuid2])
    ]);
    console.log('✅ API: PDF conversion completed');
    
    return {
      file1Result: convertResult1[0],
      file2Result: convertResult2[0],
      file1Name: file1.name,
      file2Name: file2.name
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

// Debug function to test authentication
export async function testAuthInParallel() {
  console.log('🧪 Testing getUserCredits() 5x in parallel...');
  
  try {
    // Run getUserCredits 5 times in parallel
    const [result1, result2, result3, result4, result5] = await Promise.all([
      apiService.getUserCredits(),
      apiService.getUserCredits(),
      apiService.getUserCredits(),
      apiService.getUserCredits(),
      apiService.getUserCredits()
    ]);
    
    console.log('✅ All 5 Tests Success!');
    console.log('📊 Test 1:', {
      user: result1.user.email,
      paidCredits: result1.credits.paidCredits,
      freeCredits: result1.credits.freeCredits,
      unlimitedCredits: result1.unlimitedCredits
    });
    
    console.log('📊 Test 2:', {
      paidCredits: result2.credits.paidCredits,
      freeCredits: result2.credits.freeCredits,
      unlimitedCredits: result2.unlimitedCredits
    });
    
    console.log('📊 Test 3:', {
      paidCredits: result3.credits.paidCredits,
      freeCredits: result3.credits.freeCredits,
      unlimitedCredits: result3.unlimitedCredits
    });
    
    console.log('📊 Test 4:', {
      paidCredits: result4.credits.paidCredits,
      freeCredits: result4.credits.freeCredits,
      unlimitedCredits: result4.unlimitedCredits
    });
    
    console.log('📊 Test 5:', {
      paidCredits: result5.credits.paidCredits,
      freeCredits: result5.credits.freeCredits,
      unlimitedCredits: result5.unlimitedCredits
    });
    
    console.log('🎯 Summary: All calls authenticated successfully - no rate limiting on user endpoint');
    
    return { success: true, results: [result1, result2, result3, result4, result5] };
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    
    // Try to parse the error
    try {
      const parsed = JSON.parse(error.message);
      console.error('📄 Parsed error:', parsed);
      return { success: false, error: parsed };
    } catch {
      console.error('📄 Raw error message:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Test function to try different auth header formats
export async function testDifferentAuthFormats() {
  console.log('🧪 Testing different authentication header formats...');
  
  const formats = [
    { name: 'Bearer', header: `Bearer ${import.meta.env.VITE_PDF_PARSER_API_KEY}` },
    { name: 'Api-Key', header: `Api-Key ${import.meta.env.VITE_PDF_PARSER_API_KEY}` },
    { name: 'Direct', header: import.meta.env.VITE_PDF_PARSER_API_KEY }
  ];
  
  for (const format of formats) {
    console.log(`🔑 Testing ${format.name} format...`);
    try {
      const response = await fetch('https://api2.bankstatementconverter.com/api/v1/user', {
        headers: { 'Authorization': format.header }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${format.name} format works!`, { 
          email: data.user?.email, 
          credits: data.credits 
        });
        return { success: true, format: format.name, data };
      } else {
        console.log(`❌ ${format.name} format failed:`, response.status);
      }
    } catch (error) {
      console.log(`❌ ${format.name} format error:`, error);
    }
  }
  
  return { success: false, message: 'All formats failed' };
}

// Test function to check upload-convert flow with real file
export async function testUploadConvertFlow() {
  console.log('🧪 Testing full upload→convert flow...');
  
  // Create a minimal test PDF (just for testing)
  const testPdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n174\n%%EOF';
  const blob = new Blob([testPdfContent], { type: 'application/pdf' });
  const testFile = new File([blob], 'test.pdf', { type: 'application/pdf' });
  
  try {
    console.log('📤 Step 1: Uploading test file...');
    const uploadResult = await apiService.uploadBankStatement(testFile);
    const uuid = uploadResult[0].uuid;
    console.log('✅ Upload success, UUID:', uuid);
    
    console.log('🔄 Step 2: Converting immediately...');
    const convertResult = await apiService.convertStatements([uuid]);
    console.log('✅ Convert success:', convertResult);
    
    return { success: true, upload: uploadResult, convert: convertResult };
  } catch (error) {
    console.error('❌ Upload-Convert test failed:', error);
    
    try {
      const parsed = JSON.parse(error.message);
      console.error('📄 Parsed error:', parsed);
      return { success: false, error: parsed };
    } catch {
      console.error('📄 Raw error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Test function to debug the convert endpoint specifically
export async function testConvertEndpoint() {
  console.log('🧪 Testing convert endpoint with dummy UUID...');
  
  try {
    // Try to convert with a fake UUID to see the error response
    const result = await apiService.convertStatements(['test-uuid-12345']);
    console.log('✅ Convert test success:', result);
    return { success: true, result };
  } catch (error) {
    console.error('❌ Convert test failed:', error);
    
    // Try to parse the error
    try {
      const parsed = JSON.parse(error.message);
      console.error('📄 Parsed convert error:', parsed);
      return { success: false, error: parsed };
    } catch {
      console.error('📄 Raw convert error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Make test functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testAuthInParallel = testAuthInParallel;
  (window as any).testConvertEndpoint = testConvertEndpoint;
  (window as any).testUploadConvertFlow = testUploadConvertFlow;
  (window as any).testDifferentAuthFormats = testDifferentAuthFormats;
}

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
