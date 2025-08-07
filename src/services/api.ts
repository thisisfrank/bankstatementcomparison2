// API Service for PDF Parsing and Bank Statement Analysis
// Simplified to match Version 1's working approach

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
import { ApiError, ParsedStatement } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_PDF_PARSER_API_URL || 'https://api2.bankstatementconverter.com/api/v1';
const API_KEY = import.meta.env.VITE_PDF_PARSER_API_KEY;

// Fixed API Service - Simplified to match Version 1's working approach
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
    
    // SIMPLIFIED: Use same approach as Version 1
    const fullHeaders = {
      'Authorization': API_KEY, // Direct API key, no Bearer prefix
      ...options.headers,
    };
    
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
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            code: 'HTTP_ERROR',
            details: errorText
          };
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
      throw new Error(JSON.stringify({
        error: 'Network or connection error',
        code: 'NETWORK_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  // SIMPLIFIED: Remove complex processing logic, focus on basic API calls
  async uploadBankStatement(file: File): Promise<BankStatementUploadResponse[]> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Uploading file:', file.name, file.size);
    
    return this.makeRequest<BankStatementUploadResponse[]>('/BankStatement', {
      method: 'POST',
      body: formData,
    });
  }

  async checkUploadStatus(uuids: string[]): Promise<BankStatementStatusResponse[]> {
    console.log('🔍 Checking status for:', uuids);
    
    return this.makeRequest<BankStatementStatusResponse[]>('/BankStatement/status', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async convertStatements(uuids: string[]): Promise<BankStatementConvertResponse[]> {
    console.log('🔄 Converting statements:', uuids);
    
    return this.makeRequest<BankStatementConvertResponse[]>('/BankStatement/convert?format=JSON', {
      method: 'POST',
      body: JSON.stringify(uuids),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // QUICK TEST: Simple method to test API connectivity
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getUserCredits();
      return { success: true };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      try {
        const parsed = JSON.parse(errorMsg);
        return { success: false, error: parsed.error || parsed.details || 'API test failed' };
      } catch {
        return { success: false, error: errorMsg };
      }
    }
  }

  async getUserCredits(): Promise<UserCreditsResponse> {
    return this.makeRequest<UserCreditsResponse>('/user', {
      method: 'GET',
    });
  }

  // SIMPLIFIED: Basic version that mimics Version 1's success pattern
  async processTwoStatements(
    file1: File,
    file2: File
  ): Promise<{
    file1Result: BankStatementConvertResponse;
    file2Result: BankStatementConvertResponse;
    file1Name: string;
    file2Name: string;
  }> {
    console.log('📤 Processing two statements (simplified approach)');
    
    // Step 1: Upload both files
    const [uploadResult1, uploadResult2] = await Promise.all([
      this.uploadBankStatement(file1),
      this.uploadBankStatement(file2)
    ]);
    
    const uuid1 = uploadResult1[0].uuid;
    const uuid2 = uploadResult2[0].uuid;
    console.log('✅ Uploaded with UUIDs:', { uuid1, uuid2 });
    
    // Step 2: Wait a bit if processing needed (simplified)
    const needsProcessing = uploadResult1[0].state === 'PROCESSING' || uploadResult2[0].state === 'PROCESSING';
    if (needsProcessing) {
      console.log('⏳ Files processing, waiting 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    // Step 3: Convert directly (like Version 1)
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

  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Please upload a PDF file' };
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    return { isValid: true };
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.getUserCredits();
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error(JSON.stringify({
        error: 'API health check failed',
        code: 'HEALTH_CHECK_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }
}

export const apiService = new ApiService();

// Helper function to parse API errors
export function parseApiError(error: string): ApiError {
  try {
    return JSON.parse(error);
  } catch {
    return {
      error: 'Unknown error',
      code: 'PARSE_ERROR',
      details: error
    };
  }
}