// Shared application types

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'debit' | 'credit';
}

export interface StatementSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  startDate: string;
  endDate: string;
  accountNumber?: string;
  bankName?: string;
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface ParsedStatement {
  summary: StatementSummary;
  transactions: Transaction[];
  categories: CategoryBreakdown[];
}

export interface ComparisonResult {
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

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

// Bank Statement API Types
export interface BankStatementTransaction {
  date: string;
  description: string;
  amount: string; // API returns string, we'll convert to number
}

export interface BankStatementConvertResponse {
  normalised: BankStatementTransaction[];
}

// Legacy types for backward compatibility
export interface ParseRequest {
  file: File;
  fileName: string;
  userId?: string;
}
