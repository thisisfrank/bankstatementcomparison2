# Bank Statement Converter API Integration

> **Latest Update**: Enhanced with modular service architecture for better maintainability and extensibility.

This document explains the Bank Statement Converter API integration for the Bank Statement Comparison tool.

## Overview

The application integrates with the Bank Statement Converter API to parse real PDF bank statements. The system follows a clean separation of concerns with dedicated services for different responsibilities.

## Architecture

The application uses a **modular service architecture**:

- **`api.ts`** - Pure API communication (upload, convert, status checking)
- **`statementProcessor.ts`** - Data transformation and validation
- **`categorizer.ts`** - Transaction categorization logic
- **`comparisonEngine.ts`** - Statement comparison and insights generation
- **`useApiComparison.ts`** - React hook orchestrating the complete flow

### Service Responsibilities

#### API Service (`api.ts`)
- PDF file upload to Bank Statement Converter API
- Status checking for processing files
- PDF to JSON conversion
- User credits management
- File validation (size, type, format)
- Pure API communication - no business logic

#### Statement Processor (`statementProcessor.ts`)
- Convert API responses to internal format
- Data validation and error handling
- Summary calculations (deposits, withdrawals, date ranges)
- Bank name and account number extraction
- Transaction grouping by category

#### Categorizer (`categorizer.ts`)
- Robust transaction categorization using keyword matching
- Support for 12+ categories including Income, Housing, Transportation
- Context-aware pattern recognition
- Word boundary matching to prevent false positives
- Extensible category system

#### Comparison Engine (`comparisonEngine.ts`)
- Generate side-by-side statement comparisons
- Calculate percentage changes with proper edge case handling
- Identify trends (biggest increases/decreases, new/disappeared categories)
- Generate actionable insights and recommendations
- Export functionality (CSV, JSON)

#### Integration Hook (`useApiComparison.ts`)
- Orchestrates the complete processing pipeline
- Progress tracking and error handling
- State management for React components
- Validation of results before display

## Processing Pipeline

The application uses a **5-step pipeline** to process bank statements:

### Step 1: File Validation
- Validate PDF format, size (max 10MB), and extension
- Check for duplicate files
- Ensure files are different for comparison

### Step 2: API Processing
The Bank Statement Converter API handles PDF parsing:

#### Upload Statements
```
POST /BankStatement
Content-Type: multipart/form-data
Authorization: Bearer {JWT_TOKEN}

Body: file (PDF)
Response: [{ uuid: string, filename: string, pdfType: "TEXT_BASED"|"IMAGE_BASED", state: "READY"|"PROCESSING" }]
```

#### Check Processing Status (if needed)
```
POST /BankStatement/status
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

Body: ["uuid1", "uuid2"]
Response: [{ uuid: string, state: "READY"|"PROCESSING"|"ERROR" }]
```

#### Convert to JSON
```
POST /BankStatement/convert?format=JSON
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

Body: ["uuid1", "uuid2"]
Response: [{ normalised: [{ date: string, description: string, amount: string }] }]
```

### Step 3: Data Processing
- Convert API responses to internal format
- Validate transaction data (dates, amounts, descriptions)
- Calculate summaries (deposits, withdrawals, date ranges)
- Extract bank information from filenames and patterns

### Step 4: Categorization
- Apply intelligent categorization to all transactions
- Use context-aware keyword matching
- Handle edge cases and conflicts (e.g., "gas bill" vs "gas station")
- Support 12+ categories with extensible pattern system

### Step 5: Comparison & Insights
- Generate category-by-category comparisons
- Calculate percentage changes with proper edge case handling
- Identify spending trends and patterns
- Generate actionable recommendations
- Prepare data for UI display

## Complete Processing Flow

```
PDF Files → API Upload → Status Check → JSON Conversion → 
Data Validation → Transaction Categorization → 
Statement Comparison → Insights Generation → UI Display
```

## Enhanced Transaction Categorization

The new categorization system uses **context-aware pattern matching**:

### Categories (12 total)
- **Income**: salary, payroll, wages, direct deposit, bonuses
- **Housing**: rent, mortgage, utilities, gas bill, electric bill, water bill
- **Transportation**: gas stations, uber, lyft, car payments, auto repair
- **Food & Dining**: restaurants, grocery stores, coffee shops, fast food
- **Shopping**: amazon, target, walmart, retail stores, online purchases
- **Entertainment**: netflix, spotify, movies, gaming, concerts
- **Healthcare**: medical bills, pharmacy, insurance, co-pays
- **Business & Professional**: office supplies, software, legal, consulting
- **Transfers & Investments**: account transfers, investments, brokerage
- **ATM & Cash**: cash withdrawals, ATM transactions
- **Bank Fees**: account fees, overdraft charges, wire fees
- **Other**: unmatched transactions

### Advanced Features
- **Conflict Resolution**: "gas bill" → Housing, "gas station" → Transportation
- **Word Boundaries**: Prevents false matches ("gas" in "Vegas")
- **Phrase Matching**: Handles multi-word patterns
- **Context Awareness**: Checks surrounding words for accuracy
- **Brand Recognition**: 100+ major brands and services
- **Extensible**: Easy to add new patterns and categories

### Comparison Features

- **Smart Percentage Calculations**: Handles edge cases (new categories show ∞, disappeared categories show -100%)
- **Trend Analysis**: Identifies biggest increases/decreases, new/disappeared categories
- **Insights Generation**: Provides actionable recommendations based on spending patterns
- **Export Options**: CSV and JSON export for external analysis
- **Filtering Support**: Compare specific categories, date ranges, or amount thresholds

### Data Validation

- **Transaction Validation**: Checks dates, amounts, descriptions
- **Summary Validation**: Verifies calculation accuracy
- **Statement Validation**: Ensures data integrity
- **Error Reporting**: Detailed validation errors with specific fixes

## New Architecture Benefits

### ✅ **Separation of Concerns**
- Each service has a single, well-defined responsibility
- Easy to test individual components in isolation
- Clear data flow between services

### ✅ **Maintainability**
- Business logic separated from API communication
- Categorization rules can be updated without touching API code
- Comparison logic is reusable for different data sources

### ✅ **Extensibility**
- Easy to add new categories or improve categorization
- Comparison engine supports filtering and custom options
- Can easily swap out API providers

### ✅ **Error Handling**
- Granular error handling at each step
- Detailed validation with specific error messages
- Graceful degradation and recovery

### ✅ **Performance**
- Efficient data processing with validation
- Minimal re-processing of data
- Optimized categorization with caching potential

## Error Codes

### API Errors
- `CONFIG_ERROR` - API key not configured
- `UPLOAD_ERROR` - File upload failed
- `NETWORK_ERROR` - Network/connectivity issues
- `ANONYMOUS_NOT_ENOUGH_CREDITS` - Daily API limit reached

### Processing Errors
- `VALIDATION_ERROR` - File or data validation failed
- `PARSE_ERROR` - PDF parsing failed
- `PROCESSING_ERROR` - Statement processing failed
- `COMPARISON_ERROR` - Comparison generation failed
- `TIMEOUT_ERROR` - Processing took too long
- `UNKNOWN_ERROR` - Catch-all for unexpected errors

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

## Configuration

Environment variables required:
```bash
VITE_BSC_AUTH_TOKEN=your-jwt-token-here
VITE_PDF_PARSER_API_URL=https://api2.bankstatementconverter.com/api/v1
```

**Note:** To get your JWT authentication token:
1. Go to https://bankstatementconverter.com/ in Google Chrome
2. Login to your account
3. Hit F12 to open developer tools
4. Click on the "Application" tab
5. On the left panel click on "Storage" -> "Local Storage" -> "https://bankstatementconverter.com/"
6. Copy the value for the "bsc-authToken" key

## Usage Examples

### Basic Usage in Components

```