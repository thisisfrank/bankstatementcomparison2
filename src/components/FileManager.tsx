import React, { useState, useEffect } from 'react';
import { Trash2, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService, UploadedFile } from '../services/api';

interface FileManagerProps {
  isDark: boolean;
}

export default function FileManager({ isDark }: FileManagerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUploadedFiles = () => {
    const files = apiService.getUploadedFiles();
    setUploadedFiles(files);
  };

  const clearAllFiles = () => {
    apiService.clearAllUploadedFiles();
    loadUploadedFiles();
  };

  const clearOldFiles = () => {
    const oldFiles = apiService.getOldFiles(24);
    oldFiles.forEach(file => {
      apiService.clearUploadedFile(file.uuid);
    });
    loadUploadedFiles();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return 'Ready';
      case 'PROCESSING':
        return 'Processing';
      case 'ERROR':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    loadUploadedFiles();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUploadedFiles, 30000);
    return () => clearInterval(interval);
  }, []);

  if (uploadedFiles.length === 0) {
    return null; // Don't show if no files
  }

  return (
    <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          Uploaded Files ({uploadedFiles.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={clearOldFiles}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isDark 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Clear Old
          </button>
          <button
            onClick={clearAllFiles}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {uploadedFiles.map((file) => (
          <div
            key={file.uuid}
            className={`flex items-center justify-between p-3 rounded-md ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(file.status)}
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {file.filename}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getStatusText(file.status)} • {formatTime(file.uploadTime)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                apiService.clearUploadedFile(file.uuid);
                loadUploadedFiles();
              }}
              className={`p-1 rounded-md transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
              }`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        💡 Files are automatically cleaned up after 24 hours. You can manually clear them to free up API storage.
      </div>
    </div>
  );
}
