// Comprehensive API Test - Real PDF Upload Test
// This will test the actual API endpoints with a real file upload

import { apiService } from './api';

// Create a mock PDF file for testing
function createMockPDFFile(): File {
  // Create a more complete PDF with proper resources structure
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
  /Font <<
    /F1 4 0 R
  >>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(MOCK BANK STATEMENT) Tj
0 -20 Td
(Date: 01/01/2024) Tj
0 -20 Td
(Transaction: Sample Transaction) Tj
0 -20 Td
(Amount: $100.00) Tj
0 -20 Td
(Description: Test transaction for API) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000296 00000 n 
0000000377 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
628
%%EOF`;

  // Convert to blob and then to File
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return new File([blob], 'mock-statement.pdf', { type: 'application/pdf' });
}

export async function testApiUploadWithRealFile() {
  console.log('🧪 COMPREHENSIVE API TEST - Starting real file upload test...');
  
  try {
    // Step 1: Create mock PDF file
    console.log('📄 Creating mock PDF file...');
    const mockFile = createMockPDFFile();
    console.log('✅ Mock PDF created:', {
      name: mockFile.name,
      size: mockFile.size,
      type: mockFile.type
    });

    // Step 2: Test API health first
    console.log('🏥 Testing API health...');
    try {
      const healthResult = await apiService.healthCheck();
      console.log('✅ Health check passed:', healthResult);
    } catch (healthError: any) {
      console.log('❌ Health check failed:', healthError.message);
      const parsedHealthError = JSON.parse(healthError.message);
      console.log('📄 Health error details:', parsedHealthError);
      
      if (parsedHealthError.code === 'ANONYMOUS_NOT_ENOUGH_CREDITS') {
        console.log('🚨 CONFIRMED: Daily API limit exhausted - this is why uploads are failing');
        return { success: false, reason: 'API_LIMIT_EXCEEDED', details: parsedHealthError };
      }
    }

    // Step 3: Test file upload
    console.log('📤 Testing file upload...');
    const uploadResult = await apiService.uploadBankStatement(mockFile);
    console.log('✅ Upload successful:', uploadResult);

    if (!uploadResult || uploadResult.length === 0) {
      throw new Error('Upload result is empty');
    }

    const uuid = uploadResult[0].uuid;
    const state = uploadResult[0].state;
    console.log('📊 Upload details:', { uuid, state, fullResult: uploadResult[0] });

    // Step 4: Test status check
    console.log('🔍 Testing status check...');
    const statusResult = await apiService.checkUploadStatus([uuid]);
    console.log('✅ Status check successful:', statusResult);

    // Step 5: Test conversion (this might fail due to credits)
    console.log('🔄 Testing conversion...');
    try {
      const convertResult = await apiService.convertStatements([uuid]);
      console.log('✅ Conversion successful:', convertResult);
      
      return { 
        success: true, 
        results: {
          upload: uploadResult,
          status: statusResult,
          convert: convertResult
        }
      };
    } catch (convertError: any) {
      console.log('❌ Conversion failed:', convertError.message);
      const parsedError = JSON.parse(convertError.message);
      console.log('📄 Convert error details:', parsedError);
      
      if (parsedError.code === 'ANONYMOUS_NOT_ENOUGH_CREDITS') {
        console.log('🚨 CONFIRMED: Conversion failed due to API credit limits');
        return { 
          success: false, 
          reason: 'API_LIMIT_EXCEEDED_AT_CONVERT',
          details: parsedError,
          partialResults: {
            upload: uploadResult,
            status: statusResult
          }
        };
      }
      
      throw convertError;
    }

  } catch (error: any) {
    console.error('❌ API Test failed:', error);
    
    try {
      const parsedError = JSON.parse(error.message);
      console.error('📄 Parsed error details:', parsedError);
      return { success: false, error: parsedError };
    } catch {
      console.error('📄 Raw error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Test different API base URLs
export async function testDifferentApiUrls() {
  console.log('🧪 Testing different API URLs...');
  
  const urlsToTest = [
    'https://api2.bankstatementconverter.com/api/v1',
    'https://api.bankstatementconverter.com/api/v1',
    'https://bankstatementconverter.com/api/v1'
  ];

  for (const baseUrl of urlsToTest) {
    console.log(`🔍 Testing URL: ${baseUrl}`);
    
    try {
      const response = await fetch(`${baseUrl}/user`, {
        headers: {
          'Authorization': import.meta.env.VITE_PDF_PARSER_API_KEY || ''
        }
      });
      
      console.log(`📊 ${baseUrl} response:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${baseUrl} works! Response:`, data);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${baseUrl} failed:`, errorText);
      }
    } catch (error) {
      console.log(`❌ ${baseUrl} connection failed:`, error);
    }
  }
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testApiUploadWithRealFile = testApiUploadWithRealFile;
  (window as any).testDifferentApiUrls = testDifferentApiUrls;
  console.log('🎮 Test functions available in browser console:');
  console.log('- testApiUploadWithRealFile()');
  console.log('- testDifferentApiUrls()');
}
