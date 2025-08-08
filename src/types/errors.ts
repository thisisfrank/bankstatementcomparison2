// Centralized error code definitions and types
// This file serves as the single source of truth for all error codes

export type ErrorCode = 
  // API Layer Errors (technical)
  | 'CONFIG_ERROR'           // API configuration issues
  | 'NETWORK_ERROR'          // Network connectivity issues
  | 'HTTP_ERROR'             // HTTP status errors
  | 'TIMEOUT_ERROR'          // Request timeout
  | 'ANONYMOUS_NOT_ENOUGH_CREDITS' // API rate limiting
  
  // File Processing Errors (technical)
  | 'UPLOAD_ERROR'           // File upload failed
  | 'PARSE_ERROR'            // PDF parsing failed
  | 'PROCESSING_ERROR'       // Statement processing failed
  
  // Business Logic Errors (application)
  | 'VALIDATION_ERROR'       // File/data validation failed
  | 'COMPARISON_ERROR'       // Comparison generation failed
  | 'FILES_NOT_READY'        // Files not ready for processing
  
  // Fallback
  | 'UNKNOWN_ERROR';         // Catch-all for unexpected errors

export interface ApiError {
  error: string;
  code: ErrorCode;
  details?: string;
}

// User-friendly error messages for each code
export const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string; actionable?: string }> = {
  // Technical errors - user-friendly translations
  CONFIG_ERROR: {
    title: 'Service configuration error',
    description: 'The PDF processing service is not properly configured.',
    actionable: 'Please contact the site administrator.'
  },
  NETWORK_ERROR: {
    title: 'Connection problem',
    description: 'Unable to connect to processing server.',
    actionable: 'Please check your internet connection and try again.'
  },
  HTTP_ERROR: {
    title: 'Server error',
    description: 'The server returned an unexpected response.',
    actionable: 'Please try again or contact support if the problem persists.'
  },
  TIMEOUT_ERROR: {
    title: 'Request timeout',
    description: 'The request took too long to complete.',
    actionable: 'Please try again with a smaller file or better internet connection.'
  },
  ANONYMOUS_NOT_ENOUGH_CREDITS: {
    title: 'Daily limit reached',
    description: 'The PDF processing service has reached its daily free usage limit.',
    actionable: 'You can:\n• Wait until tomorrow when limits reset\n• Use "Sample Data" button for development\n• Upgrade to a paid API plan for unlimited access'
  },
  
  // File processing errors
  UPLOAD_ERROR: {
    title: 'Upload failed',
    description: 'Failed to upload the file to the processing server.',
    actionable: 'Please check your internet connection and try again.'
  },
  PARSE_ERROR: {
    title: 'Cannot read PDF',
    description: 'Unable to parse the bank statement PDF.',
    actionable: 'Please ensure the PDF is not password protected and contains readable text.'
  },
  PROCESSING_ERROR: {
    title: 'Processing failed',
    description: 'Error occurred during statement processing.',
    actionable: 'The PDF may be corrupted or in an unsupported format.'
  },
  
  // Business logic errors
  VALIDATION_ERROR: {
    title: 'Validation failed',
    description: 'File or data validation failed.',
    actionable: 'Please ensure you are uploading valid PDF bank statements.'
  },
  COMPARISON_ERROR: {
    title: 'Comparison failed',
    description: 'Error occurred during comparison.',
    actionable: 'Please try again with different files.'
  },
  FILES_NOT_READY: {
    title: 'Files not ready',
    description: 'Files are still processing.',
    actionable: 'Please wait for file processing to complete.'
  },
  
  // Fallback
  UNKNOWN_ERROR: {
    title: 'Unexpected error',
    description: 'An unexpected error occurred.',
    actionable: 'Please try again or contact support if the problem persists.'
  }
};

// Helper function to create standardized error objects
export function createApiError(code: ErrorCode, details?: string): ApiError {
  const message = ERROR_MESSAGES[code];
  return {
    error: message.title,
    code,
    details: details || message.actionable
  };
}

// Helper function to get user-friendly error message
export function getUserFriendlyError(error: ApiError): { title: string; message: string; details?: string } {
  const template = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  return {
    title: template.title,
    message: template.description,
    details: error.details || template.actionable
  };
}

