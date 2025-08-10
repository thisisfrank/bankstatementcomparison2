import React from 'react';
import { Upload, FileText, CheckCircle, Edit, Eye } from 'lucide-react';
import { FileUpload } from './index';

interface FileUploadZoneProps {
  title: string;
  onFileSelect: (file: File) => void;
  uploadedFile?: FileUpload;
  isDark: boolean;
  isSignedIn: boolean;
}

function FileUploadZone({ 
  title, 
  onFileSelect, 
  uploadedFile, 
  isDark,
  isSignedIn 
}: FileUploadZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      onFileSelect(new File([], '')); // Trigger preview button glow
      return;
    }
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      onFileSelect(new File([], '')); // Trigger preview button glow
      return;
    }
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  if (uploadedFile) {
    return (
      <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
      }`}>
        <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${
          isDark ? 'text-green-400' : 'text-green-600'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {uploadedFile.name}
        </h3>
        <p className={`text-sm mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Ready for comparison
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          id={`file-${title.replace(/\s+/g, '-').toLowerCase()}-uploaded`}
          disabled={!isSignedIn}
        />
        <label
          htmlFor={isSignedIn ? `file-${title.replace(/\s+/g, '-').toLowerCase()}-uploaded` : undefined}
          onClick={!isSignedIn ? () => onFileSelect(new File([], '')) : undefined}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            isSignedIn 
              ? `cursor-pointer ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
              : `cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-400 hover:bg-gray-500 text-gray-600'}`
          }`}
        >
          <FileText className="h-4 w-4" />
          Change File
        </label>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={!isSignedIn ? () => onFileSelect(new File([], '')) : undefined}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isSignedIn 
          ? (isDark 
              ? 'border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100')
          : (isDark 
              ? 'border-gray-700 hover:border-gray-600 bg-gray-800/30 opacity-60' 
              : 'border-gray-200 hover:border-gray-300 bg-gray-25 opacity-60')
      }`}
    >
      <Upload className={`h-12 w-12 mx-auto mb-4 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`} />
      <h3 className={`text-lg font-semibold mb-2 ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mb-4 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Drag and drop your PDF bank statement here
      </p>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
        id={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
        disabled={!isSignedIn}
      />
      <label
        htmlFor={isSignedIn ? `file-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
        onClick={!isSignedIn ? () => onFileSelect(new File([], '')) : undefined}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
          isSignedIn 
            ? `cursor-pointer ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
            : `cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-400 hover:bg-gray-500 text-gray-600'}`
        }`}
      >
        <FileText className="h-4 w-4" />
        Choose File
      </label>
    </div>
  );
}

interface UploadSectionProps {
  isDark: boolean;
  isSignedIn: boolean;
  uploadedFiles: {
    statement1?: FileUpload;
    statement2?: FileUpload;
  };
  statementLabels: {
    statement1: string;
    statement2: string;
  };
  editingLabel: string | null;
  bothFilesUploaded: boolean;
  previewButtonGlowing: boolean;
  apiLoading: boolean;
  onFileUpload: (statementKey: 'statement1' | 'statement2', file: File) => void;
  onLabelEdit: (statementKey: 'statement1' | 'statement2', newLabel: string) => void;
    onLabelSave: () => void;
  onGenerateComparison: () => void;
  onUseSampleData: () => void;
  setEditingLabel: (label: string | null) => void;
}

export default function UploadSection({
  isDark,
  isSignedIn,
  uploadedFiles,
  statementLabels,
  editingLabel,
  bothFilesUploaded,
  previewButtonGlowing,
  apiLoading,
  onFileUpload,
  onLabelEdit,
    onLabelSave,
  onGenerateComparison,
  onUseSampleData,
  setEditingLabel
}: UploadSectionProps) {
  if (bothFilesUploaded) {
    return (
      /* Post-Upload Interface */
      <div className="space-y-8">
        {/* Uploaded Files Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {editingLabel === 'statement1' ? (
                <input
                  type="text"
                  value={statementLabels.statement1}
                  onChange={(e) => onLabelEdit('statement1', e.target.value)}
                  onBlur={onLabelSave}
                  onKeyDown={(e) => e.key === 'Enter' && onLabelSave()}
                  className={`text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}
                  autoFocus
                />
              ) : (
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {statementLabels.statement1}
                </h3>
              )}
              <Edit 
                className={`h-4 w-4 cursor-pointer transition-colors ${
                  isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'
                }`}
                onClick={() => setEditingLabel('statement1')}
              />
            </div>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center ${
              isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
            }`}>
              <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <h4 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {uploadedFiles.statement1?.name}
              </h4>
              <p className={`text-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Ready for comparison
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    onFileUpload('statement1', files[0]);
                  }
                }}
                className="hidden"
                id="file-statement1-uploaded-post"
                disabled={!isSignedIn}
              />
              <label
                htmlFor={isSignedIn ? "file-statement1-uploaded-post" : undefined}
                onClick={!isSignedIn ? () => onFileUpload('statement1', new File([], '')) : undefined}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isSignedIn 
                    ? `cursor-pointer ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
                    : `cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-400 hover:bg-gray-500 text-gray-600'}`
                }`}
              >
                <FileText className="h-4 w-4" />
                Change File
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              {editingLabel === 'statement2' ? (
                <input
                  type="text"
                  value={statementLabels.statement2}
                  onChange={(e) => onLabelEdit('statement2', e.target.value)}
                  onBlur={onLabelSave}
                  onKeyDown={(e) => e.key === 'Enter' && onLabelSave()}
                  className={`text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}
                  autoFocus
                />
              ) : (
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {statementLabels.statement2}
                </h3>
              )}
              <Edit 
                className={`h-4 w-4 cursor-pointer transition-colors ${
                  isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'
                }`}
                onClick={() => setEditingLabel('statement2')}
              />
            </div>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center ${
              isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
            }`}>
              <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <h4 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {uploadedFiles.statement2?.name}
              </h4>
              <p className={`text-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Ready for comparison
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    onFileUpload('statement2', files[0]);
                  }
                }}
                className="hidden"
                id="file-statement2-uploaded-post"
                disabled={!isSignedIn}
              />
              <label
                htmlFor={isSignedIn ? "file-statement2-uploaded-post" : undefined}
                onClick={!isSignedIn ? () => onFileUpload('statement2', new File([], '')) : undefined}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isSignedIn 
                    ? `cursor-pointer ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
                    : `cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-400 hover:bg-gray-500 text-gray-600'}`
                }`}
              >
                <FileText className="h-4 w-4" />
                Change File
              </label>
            </div>
          </div>
        </div>

        {/* Generate Comparison Button */}
        <div className="text-center mb-12">
          <button
            onClick={onGenerateComparison}
            disabled={apiLoading || (isSignedIn && !bothFilesUploaded)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              apiLoading || (isSignedIn && !bothFilesUploaded)
                ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${previewButtonGlowing && !isSignedIn ? 'animate-pulse ring-4 ring-blue-300' : ''}`}
          >
            <Eye className="h-5 w-5" />
            {apiLoading 
              ? 'Processing...' 
              : (isSignedIn && !bothFilesUploaded)
                ? 'Waiting for files...'
                : isSignedIn ? 'Generate Results' : 'Preview Results'}
          </button>
          {isSignedIn && (
            <p className={`mt-3 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {!bothFilesUploaded 
                ? 'Upload both bank statement files above to begin your comparison'
                : 'This will process all categories and charge based on pages processed'
              }
            </p>
          )}
        </div>

        {/* Additional spacing */}
        <div className="mb-16"></div>
      </div>
    );
  }

  return (
    /* File Upload Interface */
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {editingLabel === 'statement1' ? (
              <input
                type="text"
                value={statementLabels.statement1}
                onChange={(e) => onLabelEdit('statement1', e.target.value)}
                onBlur={onLabelSave}
                onKeyDown={(e) => e.key === 'Enter' && onLabelSave()}
                className={`text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
                autoFocus
              />
            ) : (
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {statementLabels.statement1}
              </h3>
            )}
            <Edit 
              className={`h-4 w-4 cursor-pointer transition-colors ${
                isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'
              }`}
              onClick={() => setEditingLabel('statement1')}
            />
          </div>
          <FileUploadZone
            title={statementLabels.statement1}
            onFileSelect={(file) => onFileUpload('statement1', file)}
            uploadedFile={uploadedFiles.statement1}
            isDark={isDark}
            isSignedIn={isSignedIn}
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            {editingLabel === 'statement2' ? (
              <input
                type="text"
                value={statementLabels.statement2}
                onChange={(e) => onLabelEdit('statement2', e.target.value)}
                onBlur={onLabelSave}
                onKeyDown={(e) => e.key === 'Enter' && onLabelSave()}
                className={`text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
                autoFocus
              />
            ) : (
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {statementLabels.statement2}
              </h3>
            )}
            <Edit 
              className={`h-4 w-4 cursor-pointer transition-colors ${
                isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'
              }`}
              onClick={() => setEditingLabel('statement2')}
            />
          </div>
          <FileUploadZone
            title={statementLabels.statement2}
            onFileSelect={(file) => onFileUpload('statement2', file)}
            uploadedFile={uploadedFiles.statement2}
            isDark={isDark}
            isSignedIn={isSignedIn}
          />
        </div>
      </div>



      {/* Sample Data Button - Only for signed out users */}
      {!isSignedIn && (
        <div className="text-center mb-12">
          <button
            onClick={onUseSampleData}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${previewButtonGlowing ? 'animate-pulse ring-4 ring-blue-300' : ''}`}
          >
            <Eye className="h-5 w-5" />
            {apiLoading ? 'Processing...' : 'Preview Results'}
          </button>
        </div>
      )}

      {/* Additional spacing */}
      <div className="mb-16"></div>
    </div>
  );
}
