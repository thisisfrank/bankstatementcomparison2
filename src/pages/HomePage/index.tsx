import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApiComparison } from '../../hooks/useApiComparison';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import FileManager from '../../components/FileManager';
import { apiService } from '../../services/api';
import { Transaction } from '../../types';
import HeroSection from './HeroSection';
import UploadSection from './UploadSection';
import ResultsSection from './ResultsSection';


export interface FileUpload {
  file: File;
  name: string;
  status: 'uploading' | 'ready' | 'error';
}

export interface CategoryComparison {
  category: string;
  icon: React.ReactNode;
  statement1: number;
  statement2: number;
  difference: number;
  percentChange: number;
  transactions1: Transaction[];
  transactions2: Transaction[];
}

export default function HomePage({ isDark, isSignedIn }: { isDark: boolean; isSignedIn: boolean }) {
  const location = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<{
    statement1?: FileUpload;
    statement2?: FileUpload;
  }>({});
  const [statementLabels, setStatementLabels] = useState({
    statement1: 'Statement 1',
    statement2: 'Statement 2'
  });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(location.state?.showResults || false);
  const [previewButtonGlowing, setPreviewButtonGlowing] = useState(false);

  // API integration
  const {
    isLoading: apiLoading,
    error: apiError,
    result: apiResult,
    progress: apiProgress,
    compareStatements,
    setError,
    clearError,
    setResult: setApiResult,
    reset: resetApiComparison
  } = useApiComparison();

  // Handle API result changes
  useEffect(() => {
    if (apiError) {
      console.error('❌ Comparison failed with API error:', apiError);
      // Error is displayed via ErrorAlert component, don't show results
    } else if (apiResult && !apiLoading) {
      console.log('✅ API comparison completed successfully');
      setShowResults(true);
    }
  }, [apiResult, apiError, apiLoading]);

  // Handle navigation from history with apiResult
  useEffect(() => {
    if (location.state?.apiResult && location.state?.fromHistory) {
      console.log('📋 Loading comparison from history');
      // Set the API result directly from history
      setApiResult(location.state.apiResult);
      setStatementLabels({
        statement1: location.state.statement1Name || 'Statement 1',
        statement2: location.state.statement2Name || 'Statement 2'
      });
      setShowResults(true);
    }
  }, [location.state, setApiResult]);

  // Reset function to clear all state and start fresh
  const handleResetComparison = () => {
    console.log('🔄 Resetting comparison state...');
    
    // Save current comparison to history if we have results and user is signed in
    if (apiResult && isSignedIn) {
      try {
        const historyItem = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          statement1Name: statementLabels.statement1,
          statement2Name: statementLabels.statement2,
          result: apiResult
        };
        
        // Get existing history from localStorage
        const existingHistory = JSON.parse(localStorage.getItem('comparisonHistory') || '[]');
        existingHistory.unshift(historyItem); // Add to beginning
        
        // Keep only last 50 items
        const trimmedHistory = existingHistory.slice(0, 50);
        
        localStorage.setItem('comparisonHistory', JSON.stringify(trimmedHistory));
        console.log('💾 Saved comparison to history');
      } catch (error) {
        console.error('Failed to save comparison to history:', error);
      }
    }
    
    // Clear API service uploaded files
    apiService.clearAllUploadedFiles();
    
    // Reset API comparison state
    resetApiComparison();
    
    // Clear uploaded files state
    setUploadedFiles({});
    
    // Reset statement labels
    setStatementLabels({
      statement1: 'Statement 1',
      statement2: 'Statement 2'
    });
    
    // Clear editing state
    setEditingLabel(null);
    
    // Hide results and show upload section
    setShowResults(false);
    
    // Clear preview button glow
    setPreviewButtonGlowing(false);
    
    console.log('✅ Comparison state reset complete');
  };

  const handleFileUpload = (statementKey: 'statement1' | 'statement2', file: File) => {
    // If user is not signed in OR this is an empty file for preview trigger, just set preview glow
    if (!isSignedIn || file.size === 0 || file.name === '') {
      setPreviewButtonGlowing(true);
      return;
    }

    // Clear any previous errors
    clearError();

    // Validate real file uploads
    const validation = apiService.validatePdfFile(file);
    if (!validation.isValid) {
      // Set a temporary error state for this file
      setUploadedFiles(prev => ({
        ...prev,
        [statementKey]: {
          file,
          name: file.name,
          status: 'error'
        }
      }));
      return;
    }

    const fileUpload: FileUpload = {
      file,
      name: file.name,
      status: 'ready' // Mark as ready immediately - real processing happens during API call
    };

    setUploadedFiles(prev => ({
      ...prev,
      [statementKey]: fileUpload
    }));
  };

  const handleGenerateComparison = async () => {
    // Prevent double-clicks and ensure files are ready
    if (apiLoading) {
      console.log('⚠️ Button clicked while API is loading - ignoring');
      return;
    }

    // Clear any previous errors
    clearError();
    
    // Validate files are properly loaded
        if (!isSignedIn) {
      // For signed out users, show preview with sign-in prompt
      handleUseSampleData();
      setShowResults(true);
      return;
    }

    // Check if user has uploaded any files at all
    const hasStatement1 = uploadedFiles.statement1?.file && uploadedFiles.statement1.file.size > 0;
    const hasStatement2 = uploadedFiles.statement2?.file && uploadedFiles.statement2.file.size > 0;
    
    if (!hasStatement1 || !hasStatement2) {
      const missingFiles = [];
      if (!hasStatement1) missingFiles.push('Statement 1');
      if (!hasStatement2) missingFiles.push('Statement 2');
      
      setError(`Please upload ${missingFiles.join(' and ')} to begin comparison.`);
      return;
    }

    // Check file upload status (ready vs uploading vs error)
    const file1Ready = uploadedFiles.statement1?.status === 'ready';
    const file2Ready = uploadedFiles.statement2?.status === 'ready';
    
    if (!file1Ready || !file2Ready) {
      const processingFiles = [];
      if (!file1Ready) processingFiles.push('Statement 1');
      if (!file2Ready) processingFiles.push('Statement 2');
      
      setError(`Please wait for file processing to complete: ${processingFiles.join(' and ')}`);
      return;
    }

    // For signed in users with ready files, use API
    console.log('🚀 Starting API comparison with files:', {
      file1: { name: uploadedFiles.statement1!.file.name, size: uploadedFiles.statement1!.file.size, status: uploadedFiles.statement1!.status },
      file2: { name: uploadedFiles.statement2!.file.name, size: uploadedFiles.statement2!.file.size, status: uploadedFiles.statement2!.status }
    });

    try {
      await compareStatements(
        uploadedFiles.statement1!.file, 
        uploadedFiles.statement2!.file
      );
    } catch (error) {
      // If API fails, offer sample data as fallback
      console.log('🔄 API failed, offering sample data fallback');
      setError('API processing failed. Please try again with different files or use sample data.');
    }
    
    // Note: Result handling is now done via useEffect watching apiResult/apiError
  };

  const handleUseSampleData = () => {
    // Only allow sample data for signed out users
    if (isSignedIn) {
      console.log('Sample data not available for signed-in users');
      return;
    }

    // Use actual filenames from history, or simple labels for preview
    const statement1Name = location.state?.statement1Name || 'Statement 1';
    const statement2Name = location.state?.statement2Name || 'Statement 2';
    
    setStatementLabels({
      statement1: statement1Name,
      statement2: statement2Name
    });
    
    const sampleFile1: FileUpload = {
      file: new File([], statement1Name),
      name: statement1Name,
      status: 'ready'
    };
    const sampleFile2: FileUpload = {
      file: new File([], statement2Name),
      name: statement2Name,
      status: 'ready'
    };

    setUploadedFiles({
      statement1: sampleFile1,
      statement2: sampleFile2
    });
    
    // If coming from history, automatically show results
    if (location.state?.fromHistory) {
      setShowResults(true);
    }
  };



  const handleLabelEdit = (statementKey: 'statement1' | 'statement2', newLabel: string) => {
    setStatementLabels(prev => ({
      ...prev,
      [statementKey]: newLabel
    }));
  };

  const handleLabelSave = () => {
    setEditingLabel(null);
  };




  const bothFilesUploaded = uploadedFiles.statement1?.status === 'ready' && uploadedFiles.statement2?.status === 'ready';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {!showResults ? (
        <>
          <HeroSection isDark={isDark} />
          


          <UploadSection
            isDark={isDark}
            isSignedIn={isSignedIn}
            uploadedFiles={uploadedFiles}
            statementLabels={statementLabels}
            editingLabel={editingLabel}
            bothFilesUploaded={bothFilesUploaded}
            previewButtonGlowing={previewButtonGlowing}
            apiLoading={apiLoading}
            onFileUpload={handleFileUpload}
            onLabelEdit={handleLabelEdit}
                        onLabelSave={handleLabelSave}
            onGenerateComparison={handleGenerateComparison}
            onUseSampleData={handleUseSampleData}
            setEditingLabel={setEditingLabel}
          />

          {/* File Manager - Only show for signed in users */}
          {isSignedIn && <FileManager isDark={isDark} />}
        </>
      ) : (
        <div className="space-y-8">
          {/* Loading State */}
          {apiLoading && (
            <div className={`rounded-xl p-8 text-center ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <LoadingSpinner 
                size="lg" 
                text="Processing your bank statements..." 
                progress={apiProgress}
                isDark={isDark}
              />
            </div>
          )}

          {/* Error State */}
          {apiError && (
            <ErrorAlert 
              error={apiError}
              onDismiss={clearError}
              onRetry={() => {
                if (uploadedFiles.statement1?.file && uploadedFiles.statement2?.file) {
                  handleGenerateComparison();
                }
              }}
              isDark={isDark}
              className="mb-6"
            />
          )}

          <ResultsSection
            isDark={isDark}
            isSignedIn={isSignedIn}
            statementLabels={statementLabels}
            apiResult={apiResult}
            onResetComparison={handleResetComparison}
          />
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-pulse-slow ${
          isDark ? 'bg-blue-600' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute top-3/4 right-1/4 w-48 h-48 rounded-full opacity-15 animate-pulse-slow ${
          isDark ? 'bg-purple-600' : 'bg-purple-400'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full opacity-25 animate-pulse-slow ${
          isDark ? 'bg-green-600' : 'bg-green-400'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 right-1/3 w-40 h-40 rounded-full opacity-10 animate-pulse-slow ${
          isDark ? 'bg-indigo-600' : 'bg-indigo-400'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
}

