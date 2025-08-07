# Bank Statement Converter API Integration

This document explains the Bank Statement Converter API integration for the Bank Statement Comparison tool.

## Overview

The application now integrates with the Bank Statement Converter API to parse real PDF bank statements and provide accurate categorized transaction analysis.

## Setup

### Environment Variables

Create a `.env.local` file in your project root with:

```env
VITE_PDF_PARSER_API_KEY=api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH
VITE_PDF_PARSER_API_URL=https://api2.bankstatementconverter.com/api/v1
VITE_ENVIRONMENT=development
```

Replace the API key with your actual key from Bank Statement Converter.

## Architecture

### Core Files

- **`src/services/api.ts`** - Main API service with all endpoints and types
- **`src/hooks/useApiComparison.ts`** - React hook for managing API state
- **`src/components/LoadingSpinner.tsx`** - Loading UI component
- **`src/components/ErrorAlert.tsx`** - Error handling UI component

### API Service Features

1. **File Validation** - Validates PDF files before upload
2. **Error Handling** - Comprehensive error handling with user-friendly messages
3. **Progress Tracking** - Real-time progress updates during processing
4. **Mock Data Fallback** - Seamless fallback to mock data during development

## Bank Statement Converter API Flow

The application uses a 3-step process to parse bank statements:

### 1. Upload Statements
```
POST /BankStatement
Content-Type: multipart/form-data
Authorization: {API_KEY}

Body: file (PDF)
Response: [{ uuid: string, filename: string, pdfType: "TEXT_BASED"|"IMAGE_BASED", state: "READY"|"PROCESSING" }]
```

### 2. Check Processing Status (if needed)
```
POST /BankStatement/status
Authorization: {API_KEY}
Content-Type: application/json

Body: ["uuid1", "uuid2"]
Response: [{ uuid: string, state: "READY"|"PROCESSING"|"ERROR" }]
```

### 3. Convert to JSON
```
POST /BankStatement/convert?format=JSON
Authorization: {API_KEY}
Content-Type: application/json

Body: ["uuid1", "uuid2"]
Response: [{ normalised: [{ date: string, description: string, amount: string }] }]
```

### Additional Endpoints

#### Get User Credits
```
GET /user
Authorization: {API_KEY}
Response: { user: {...}, credits: { paidCredits: number, freeCredits: number }, ... }
```

#### Set Password (for protected PDFs)
```
POST /BankStatement/setPassword
Authorization: {API_KEY}
Content-Type: application/json

Body: { passwords: [{ uuid: string, password: string }] }
```

## TypeScript Types

### Core Types
```typescript
interface Transaction {
  date: string;           // ISO date format
  description: string;    // Transaction description
  amount: number;         // Transaction amount
  category: string;       // Auto-categorized category
  type: 'debit' | 'credit';
}

interface StatementSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  startDate: string;      // ISO date format
  endDate: string;        // ISO date format
  accountNumber?: string; // Masked account number
  bankName?: string;
}

interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
}

interface ParsedStatement {
  summary: StatementSummary;
  transactions: Transaction[];
  categories: CategoryBreakdown[];
}

interface ComparisonResult {
  statement1: ParsedStatement;
  statement2: ParsedStatement;
  comparison: {
    category: string;
    statement1Total: number;
    statement2Total: number;
    difference: number;
    percentChange: number;
    transactions1: Transaction[];
    transactions2: Transaction[];
  }[];
}
```

## Error Handling

The API should return errors in this format:
```typescript
interface ApiError {
  error: string;    // User-friendly error message
  code: string;     // Error code for programmatic handling
  details?: string; // Technical details (optional)
}
```

### Error Codes
- `VALIDATION_ERROR` - File validation failed
- `PARSE_ERROR` - PDF parsing failed
- `COMPARISON_ERROR` - Comparison processing failed
- `NETWORK_ERROR` - Network/connectivity issues
- `UNKNOWN_ERROR` - Catch-all for unexpected errors

## File Validation

The frontend validates:
- File type: Must be `application/pdf`
- File size: Maximum 10MB
- File extension: Must end with `.pdf`

## Transaction Categorization

The application automatically categorizes transactions based on description keywords:

- **Housing**: rent, mortgage, utilities, electric, water, internet, cable
- **Transportation**: gas, fuel, auto, car, insurance, uber, lyft, parking
- **Food & Dining**: restaurant, grocery, coffee, starbucks, market, dining
- **Shopping**: amazon, target, walmart, retail, store, clothing
- **Entertainment**: movie, netflix, gaming, concert, streaming
- **Healthcare**: medical, doctor, pharmacy, dental, health
- **Business & Professional**: office, legal, consulting, subscription
- **Other**: Default category for unmatched transactions

## Processing Flow

1. **File Upload**: PDFs are uploaded to Bank Statement Converter API
2. **Processing Wait**: For image-based PDFs, wait for OCR processing (polls every 10s, max 5 min)
3. **Data Conversion**: Convert processed statements to JSON format
4. **Categorization**: Apply intelligent categorization to transactions
5. **Comparison**: Generate side-by-side comparison with differences and percentages
6. **UI Display**: Present results with charts, summaries, and detailed breakdowns

## Configuration

Environment variables required:
```bash
VITE_PDF_PARSER_API_KEY=your-api-key-here
VITE_PDF_PARSER_API_URL=https://api2.bankstatementconverter.com/api/v1
```

## Usage in Components

```typescript
import { useApiComparison } from '../hooks/useApiComparison';

function MyComponent() {
  const {
    isLoading,
    error,
    result,
    progress,
    compareStatements,
    clearError,
    useMockData
  } = useApiComparison();

  const handleCompare = async (file1: File, file2: File) => {
    await compareStatements(file1, file2, 'userId123');
  };

  // Rest of component...
}
```

## Development Mode

During development, the app automatically falls back to mock data when the API is unavailable. The mock data structure matches the expected API response format exactly.

## Next Steps

1. **Backend Implementation** - Implement the API endpoints described above
2. **Authentication** - Add user authentication and pass real user IDs
3. **File Storage** - Implement secure temporary file storage for processing
4. **Rate Limiting** - Add rate limiting based on subscription tiers
5. **Monitoring** - Add logging and error monitoring
