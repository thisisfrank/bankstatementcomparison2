import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import test functions for browser console access
import { testApiUploadWithRealFile, testDifferentApiUrls } from './services/test-api-upload';
import { apiService } from './services/api';

// Make test functions globally available for console testing
if (typeof window !== 'undefined') {
  (window as any).testApiUploadWithRealFile = testApiUploadWithRealFile;
  (window as any).testDifferentApiUrls = testDifferentApiUrls;
  
  // Quick manual test function using simplified API
  (window as any).quickApiTest = async () => {
    console.log('🧪 Testing Simplified API Service:');
    const result = await apiService.testConnection();
    console.log('Connection test result:', result);
    return result;
  };
  
  // Test with real file upload (simplified)
  (window as any).quickUploadTest = async () => {
    console.log('🧪 Testing Simplified Upload:');
    
    // Create simple test file
    const testContent = 'Test PDF content';
    const blob = new Blob([testContent], { type: 'application/pdf' });
    const testFile = new File([blob], 'test.pdf', { type: 'application/pdf' });
    
    try {
      const uploadResult = await apiService.uploadBankStatement(testFile);
      console.log('✅ Upload successful:', uploadResult);
      return { success: true, result: uploadResult };
    } catch (error) {
      console.log('❌ Upload failed:', error);
      return { success: false, error };
    }
  };
  
  console.log('🎮 API Test functions loaded:');
  console.log('- testApiUploadWithRealFile()');
  console.log('- testDifferentApiUrls()');
  console.log('- quickApiTest() - Test simplified API');
  console.log('- quickUploadTest() - Test simplified upload');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
