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

// Import shared types
import { createApiError } from '../types/errors';

// API Configuration - Based on API Documentation
const API_KEY = import.meta.env.VITE_PDF_PARSER_API_KEY || 'api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH';
const API_BASE_URL = import.meta.env.VITE_PDF_PARSER_API_URL || 'https://api2.bankstatementconverter.com/api/v1';

// API Service - Implementation following bankstatementconverter.com API Documentation
export class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!API_KEY) {
      throw new Error(JSON.stringify(createApiError('CONFIG_ERROR', 'Please set VITE_PDF_PARSER_API_KEY in your environment')));
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    // Based on API Documentation: Direct API key as Authorization header
    const fullHeaders = {
      'Authorization': API_KEY, // As documented: Authorization: api-AB7psQuu...
      ...options.headers,
    };
    
    // DEBUG: Log the exact authorization header being sent
    console.log('🔑 Authorization header:', {
      authHeaderValue: API_KEY.substring(0, 20) + '...',
      fullHeaderLength: API_KEY.length
    });
    
    // REDUCED LOGGING: Minimal logging to avoid interference
    console.log('🔑 API Request:', {
      url,
      method: options.method || 'GET',
      hasApiKey: !!API_KEY
      // Removed: fullApiKey, detailed body logging, etc.
    });
    
    try {
      const response = await fetch(url, {
        headers: fullHeaders,
        ...options,
      });

      if (!response.ok) {
        // SIMPLIFIED ERROR HANDLING: Match Version 1 approach
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        // Try to parse as JSON, fall back to text
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = createApiError('HTTP_ERROR', `HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      // SIMPLIFIED: Re-throw parsing errors as-is, handle network errors simply
      if (error instanceof Error && error.message.startsWith('{')) {
        throw error; // Re-throw API errors as-is
      }
      
      // Handle network/parsing errors simply
      throw new Error(JSON.stringify(createApiError('NETWORK_ERROR', error instanceof Error ? error.message : 'Unknown error')));
    }
  }

  // Upload PDF files - Based on API Documentation: Multipart Form Data
  async uploadBankStatement(file: File): Promise<BankStatementUploadResponse[]> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Uploading file:', file.name, file.size);
    
    // API Documentation: POST /BankStatement with multipart form data
    return this.makeRequest<BankStatementUploadResponse[]>('/BankStatement', {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - let browser set it with boundary for multipart
    });
  }

  // Check upload status - API Documentation: POST /BankStatement/status with UUID array
  async checkUploadStatus(uuids: string[]): Promise<BankStatementStatusResponse[]> {
    console.log('🔍 Checking status for:', uuids);
    
    // API Documentation: Body is a list of UUID strings in JSON
    return this.makeRequest<BankStatementStatusResponse[]>('/BankStatement/status', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Convert statements - API Documentation: POST /BankStatement/convert?format=JSON
  async convertStatements(uuids: string[]): Promise<BankStatementConvertResponse[]> {
    console.log('🔄 Converting statements:', uuids);
    
    // API Documentation: Body is a list of UUID strings in JSON
    return this.makeRequest<BankStatementConvertResponse[]>('/BankStatement/convert?format=JSON', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
    });
  }



  // Get user credits - API Documentation: GET /user
  async getUserCredits(): Promise<UserCreditsResponse> {
    // API Documentation: GET request with Authorization header
    return this.makeRequest<UserCreditsResponse>('/user', {
      method: 'GET',
    });
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
    
    // Step 1: Upload both files (API Documentation: POST /BankStatement)
    const [uploadResult1, uploadResult2] = await Promise.all([
      this.uploadBankStatement(file1),
      this.uploadBankStatement(file2)
    ]);
    
    const uuid1 = uploadResult1[0].uuid;
    const uuid2 = uploadResult2[0].uuid;
    console.log('✅ Uploaded with UUIDs:', { uuid1, uuid2 });
    
    // Step 2: Handle processing state (API Documentation: Poll every 10 seconds if PROCESSING)
    const uuids = [uuid1, uuid2];
    await this.waitForProcessingComplete(uuids);
    
    // Step 3: Convert statements (API Documentation: POST /BankStatement/convert?format=JSON)
    const [convertResult1, convertResult2] = await Promise.all([
      this.convertStatements([uuid1]),
      this.convertStatements([uuid2])
    ]);
    
    console.log('✅ Conversion completed');
    
    return {
      file1Result: convertResult1[0],
      file2Result: convertResult2[0],
      file1Name: file1.name,
      file2Name: file2.name
    };
  }

  // Wait for processing to complete - API Documentation: Poll status every 10 seconds
  private async waitForProcessingComplete(uuids: string[], maxAttempts: number = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusResults = await this.checkUploadStatus(uuids);
      const allReady = statusResults.every(result => result.state === 'READY');
      
      if (allReady) {
        console.log('✅ All files ready for conversion');
        return;
      }
      
      const hasError = statusResults.some(result => result.state === 'ERROR');
      if (hasError) {
        throw new Error('PDF processing failed');
      }
      
      console.log(`⏳ Files still processing, waiting 10 seconds... (attempt ${attempt + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds as per API docs
    }
    
    throw new Error('PDF processing timed out');
  }

  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Please upload a PDF file' };
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    return { isValid: true };
  }


}

export const apiService = new ApiService();

// Helper function to parse API errors
export function parseApiError(error: string) {
  try {
    return JSON.parse(error);
  } catch {
    return createApiError('UNKNOWN_ERROR', error);
  }
}