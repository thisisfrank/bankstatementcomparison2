import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export interface ExportData {
  statement1Name: string;
  statement2Name: string;
  comparisonDate: string;
  categories: Array<{
    category: string;
    statement1: number;
    statement2: number;
    difference: number;
    percentChange: number;
    transactions1: Array<{
      date: string;
      description: string;
      amount: number;
      category: string;
      type: 'credit' | 'debit';
    }>;
    transactions2: Array<{
      date: string;
      description: string;
      amount: number;
      category: string;
      type: 'credit' | 'debit';
    }>;
  }>;
  summary: {
    statement1: {
      totalWithdrawals: number;
      totalDeposits: number;
    };
    statement2: {
      totalWithdrawals: number;
      totalDeposits: number;
    };
  };
}

export class ExportService {
  /**
   * Export comparison data as PDF
   */
  static exportToPDF(data: ExportData): void {
    try {
      console.log('📊 ExportService: Exporting PDF with data:', data);
      console.log('📊 ExportService: Summary data:', data.summary);
      
      // Validate data before export
      if (!data.summary || !data.summary.statement1 || !data.summary.statement2) {
        throw new Error('Invalid summary data for PDF export');
      }
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Bank Statement Comparison Report', 20, 20);
      
      // Subtitle
      doc.setFontSize(14);
      doc.text(`${data.statement1Name} vs ${data.statement2Name}`, 20, 35);
      doc.text(`Generated on: ${data.comparisonDate}`, 20, 45);
      
      // Summary section
      doc.setFontSize(16);
      doc.text('Summary', 20, 65);
      
      doc.setFontSize(12);
      doc.text(`${data.statement1Name}:`, 20, 80);
      doc.text(`  Withdrawals: $${data.summary.statement1.totalWithdrawals.toFixed(2)}`, 30, 90);
      doc.text(`  Deposits: $${data.summary.statement1.totalDeposits.toFixed(2)}`, 30, 100);
      
      doc.text(`${data.statement2Name}:`, 20, 115);
      doc.text(`  Withdrawals: $${data.summary.statement2.totalWithdrawals.toFixed(2)}`, 30, 125);
      doc.text(`  Deposits: $${data.summary.statement2.totalDeposits.toFixed(2)}`, 30, 135);
      
      // Category comparison table
      doc.setFontSize(16);
      doc.text('Category Breakdown', 20, 155);
      
      const tableData = data.categories.map(cat => [
        cat.category,
        `$${cat.statement1.toFixed(2)}`,
        `$${cat.statement2.toFixed(2)}`,
        `${cat.difference > 0 ? '+' : ''}$${cat.difference.toFixed(2)}`,
        `${cat.percentChange.toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        head: [['Category', 'Statement 1', 'Statement 2', 'Difference', 'Change %']],
        body: tableData,
        startY: 165,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
        },
      });
      
      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 190, 280, { align: 'right' });
      }
      
      // Save the PDF
      const filename = `comparison_${data.statement1Name}_vs_${data.statement2Name}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('❌ ExportService: Error exporting PDF:', error);
      throw error;
    }
  }
  
  /**
   * Export comparison data as CSV
   */
  static exportToCSV(data: ExportData): void {
    try {
      console.log('📊 ExportService: Exporting CSV with data:', data);
      console.log('📊 ExportService: Summary data:', data.summary);
      
      // Validate data before export
      if (!data.summary || !data.summary.statement1 || !data.summary.statement2) {
        throw new Error('Invalid summary data for CSV export');
      }
      
      // Create CSV data structure
      const csvData = [];
      
      // Header
      csvData.push(['Bank Statement Comparison Report']);
      csvData.push([`${data.statement1Name} vs ${data.statement2Name}`]);
      csvData.push([`Generated on: ${data.comparisonDate}`]);
      csvData.push([]);
      
      // Summary
      csvData.push(['Summary']);
      csvData.push(['Statement', 'Withdrawals', 'Deposits']);
      csvData.push([data.statement1Name, data.summary.statement1.totalWithdrawals.toFixed(2), data.summary.statement1.totalDeposits.toFixed(2)]);
      csvData.push([data.statement2Name, data.summary.statement2.totalWithdrawals.toFixed(2), data.summary.statement2.totalDeposits.toFixed(2)]);
      csvData.push([]);
      
      // Category breakdown
      csvData.push(['Category Breakdown']);
      csvData.push(['Category', 'Statement 1', 'Statement 2', 'Difference', 'Change %']);
      data.categories.forEach(cat => {
        csvData.push([
          cat.category,
          cat.statement1.toFixed(2),
          cat.statement2.toFixed(2),
          cat.difference.toFixed(2),
          cat.percentChange.toFixed(1)
        ]);
      });
      csvData.push([]);
      
      // Detailed transactions
      csvData.push(['Detailed Transactions']);
      csvData.push(['Category', 'Statement', 'Date', 'Description', 'Amount', 'Type']);
      
      data.categories.forEach(cat => {
        // Statement 1 transactions
        if (cat.transactions1 && Array.isArray(cat.transactions1)) {
          cat.transactions1.forEach(trans => {
            csvData.push([
              cat.category,
              data.statement1Name,
              trans.date,
              trans.description,
              trans.amount.toFixed(2),
              trans.type
            ]);
          });
        }
        
        // Statement 2 transactions
        if (cat.transactions2 && Array.isArray(cat.transactions2)) {
          cat.transactions2.forEach(trans => {
            csvData.push([
              cat.category,
              data.statement2Name,
              trans.date,
              trans.description,
              trans.amount.toFixed(2),
              trans.type
            ]);
          });
        }
      });
      
      // Convert to CSV string
      const csv = Papa.unparse(csvData);
      
      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `comparison_${data.statement1Name}_vs_${data.statement2Name}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ ExportService: Error exporting CSV:', error);
      throw error;
    }
  }
  
  /**
   * Prepare export data from comparison results
   */
  static prepareExportData(
    categories: any[],
    statement1Name: string,
    statement2Name: string,
    apiResult?: any
  ): ExportData {
    console.log('🔍 ExportService: prepareExportData called with:', {
      categoriesCount: categories.length,
      statement1Name,
      statement2Name,
      hasApiResult: !!apiResult,
      apiResultKeys: apiResult ? Object.keys(apiResult) : null
    });

    // Calculate summary from categories and transactions
    let statement1Withdrawals = 0;
    let statement1Deposits = 0;
    let statement2Withdrawals = 0;
    let statement2Deposits = 0;

    // Process each category to calculate totals
    categories.forEach(cat => {
      console.log('🔍 ExportService: Processing category:', cat.category, {
        hasTransactions1: !!cat.transactions1,
        transactions1Count: cat.transactions1?.length || 0,
        hasTransactions2: !!cat.transactions2,
        transactions2Count: cat.transactions2?.length || 0
      });

      // Statement 1 transactions
      if (cat.transactions1 && Array.isArray(cat.transactions1)) {
        cat.transactions1.forEach((trans: any) => {
          console.log('🔍 ExportService: Processing statement1 transaction:', {
            type: trans.type,
            amount: trans.amount,
            description: trans.description
          });
          if (trans.type === 'debit' || trans.type === 'withdrawal') {
            statement1Withdrawals += trans.amount;
          } else if (trans.type === 'credit' || trans.type === 'deposit') {
            statement1Deposits += trans.amount;
          }
        });
      }

      // Statement 2 transactions
      if (cat.transactions2 && Array.isArray(cat.transactions2)) {
        cat.transactions2.forEach((trans: any) => {
          console.log('🔍 ExportService: Processing statement2 transaction:', {
            type: trans.type,
            amount: trans.amount,
            description: trans.description
          });
          if (trans.type === 'debit' || trans.type === 'withdrawal') {
            statement2Withdrawals += trans.amount;
          } else if (trans.type === 'credit' || trans.type === 'deposit') {
            statement2Deposits += trans.amount;
          }
        });
      }
    });

    console.log('🔍 ExportService: Calculated totals:', {
      statement1Withdrawals,
      statement1Deposits,
      statement2Withdrawals,
      statement2Deposits
    });

    // Try to get summary from apiResult if available, otherwise use calculated values
    let finalSummary = {
      statement1: {
        totalWithdrawals: apiResult?.statement1?.summary?.totalWithdrawals || statement1Withdrawals,
        totalDeposits: apiResult?.statement1?.summary?.totalDeposits || statement1Deposits,
      },
      statement2: {
        totalWithdrawals: apiResult?.statement2?.summary?.totalWithdrawals || statement2Withdrawals,
        totalDeposits: apiResult?.statement2?.summary?.totalDeposits || statement2Deposits,
      },
    };

    // If we still don't have valid totals, try to estimate from category totals
    if (finalSummary.statement1.totalWithdrawals === 0 && finalSummary.statement1.totalDeposits === 0) {
      console.log('🔍 ExportService: No transaction data, estimating from category totals');
      const totalStatement1 = categories.reduce((sum, cat) => sum + (cat.statement1 || 0), 0);
      const totalStatement2 = categories.reduce((sum, cat) => sum + (cat.statement2 || 0), 0);
      
      // Assume most spending is withdrawals, with some deposits for income categories
      const incomeCategories = categories.filter(cat => 
        cat.category.toLowerCase().includes('income') || 
        cat.category.toLowerCase().includes('salary') ||
        cat.category.toLowerCase().includes('payment')
      );
      
      const incomeTotal = incomeCategories.reduce((sum, cat) => sum + (cat.statement1 || 0), 0);
      
      finalSummary = {
        statement1: {
          totalWithdrawals: totalStatement1 - incomeTotal,
          totalDeposits: incomeTotal,
        },
        statement2: {
          totalWithdrawals: totalStatement2 - incomeTotal,
          totalDeposits: incomeTotal,
        },
      };
    }

    const summary = finalSummary;

    console.log('🔍 ExportService: Final summary:', summary);
    
    const exportCategories = categories.map(cat => ({
      category: cat.category,
      statement1: cat.statement1,
      statement2: cat.statement2,
      difference: cat.difference,
      percentChange: cat.percentChange,
      transactions1: cat.transactions1 || [],
      transactions2: cat.transactions2 || [],
    }));
    
    return {
      statement1Name,
      statement2Name,
      comparisonDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      categories: exportCategories,
      summary,
    };
  }
}
