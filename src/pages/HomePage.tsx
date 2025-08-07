import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Edit, BarChart3, Download, Eye, TrendingUp, DollarSign, Home, Car, Utensils, ShoppingBag, Gamepad2, Heart, Briefcase, MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FileUpload {
  file: File;
  name: string;
  status: 'uploading' | 'ready' | 'error';
}

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface CategoryComparison {
  category: string;
  icon: React.ReactNode;
  statement1: number;
  statement2: number;
  difference: number;
  percentChange: number;
  transactions1: Transaction[];
  transactions2: Transaction[];
}

const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EBF8FF', '#F0F9FF'];

const mockComparison: CategoryComparison[] = [
  {
    category: 'Housing',
    icon: <Home className="h-5 w-5" />,
    statement1: 2450.00,
    statement2: 2450.00,
    difference: 0.00,
    percentChange: 0,
    transactions1: [
      { date: '2024-01-01', description: 'Rent Payment', amount: 2450.00, category: 'Housing' }
    ],
    transactions2: [
      { date: '2024-02-01', description: 'Rent Payment', amount: 2450.00, category: 'Housing' }
    ]
  },
  {
    category: 'Transportation',
    icon: <Car className="h-5 w-5" />,
    statement1: 340.50,
    statement2: 425.75,
    difference: 85.25,
    percentChange: 25.0,
    transactions1: [
      { date: '2024-01-05', description: 'Gas Station', amount: 65.50, category: 'Transportation' },
      { date: '2024-01-12', description: 'Gas Station', amount: 72.00, category: 'Transportation' },
      { date: '2024-01-20', description: 'Car Insurance', amount: 203.00, category: 'Transportation' }
    ],
    transactions2: [
      { date: '2024-02-03', description: 'Gas Station', amount: 68.25, category: 'Transportation' },
      { date: '2024-02-10', description: 'Gas Station', amount: 74.50, category: 'Transportation' },
      { date: '2024-02-18', description: 'Car Insurance', amount: 203.00, category: 'Transportation' },
      { date: '2024-02-25', description: 'Car Repair', amount: 80.00, category: 'Transportation' }
    ]
  },
  {
    category: 'Food & Dining',
    icon: <Utensils className="h-5 w-5" />,
    statement1: 680.25,
    statement2: 520.40,
    difference: -159.85,
    percentChange: -23.5,
    transactions1: [
      { date: '2024-01-03', description: 'Grocery Store', amount: 125.50, category: 'Food & Dining' },
      { date: '2024-01-08', description: 'Restaurant', amount: 45.75, category: 'Food & Dining' },
      { date: '2024-01-15', description: 'Grocery Store', amount: 98.25, category: 'Food & Dining' },
      { date: '2024-01-22', description: 'Coffee Shop', amount: 28.50, category: 'Food & Dining' },
      { date: '2024-01-28', description: 'Takeout', amount: 35.75, category: 'Food & Dining' }
    ],
    transactions2: [
      { date: '2024-02-02', description: 'Grocery Store', amount: 110.25, category: 'Food & Dining' },
      { date: '2024-02-09', description: 'Restaurant', amount: 52.30, category: 'Food & Dining' },
      { date: '2024-02-16', description: 'Grocery Store', amount: 89.40, category: 'Food & Dining' },
      { date: '2024-02-23', description: 'Coffee Shop', amount: 22.75, category: 'Food & Dining' }
    ]
  }
];

function FileUploadZone({ 
  title, 
  onFileSelect, 
  uploadedFile, 
  isDark 
}: { 
  title: string; 
  onFileSelect: (file: File) => void; 
  uploadedFile?: FileUpload; 
  isDark: boolean; 
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Ready for comparison
        </p>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDark 
          ? 'border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800' 
          : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100'
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
      />
      <label
        htmlFor={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
          isDark 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <FileText className="h-4 w-4" />
        Choose File
      </label>
    </div>
  );
}

export default function HomePage({ isDark }: { isDark: boolean }) {
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'bar-expenses' | 'bar-income' | 'graph-expenses' | 'graph-income'>('bar-expenses');

  const handleFileUpload = (statementKey: 'statement1' | 'statement2', file: File) => {
    const fileUpload: FileUpload = {
      file,
      name: file.name,
      status: 'uploading'
    };

    setUploadedFiles(prev => ({
      ...prev,
      [statementKey]: fileUpload
    }));

    // Simulate processing
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [statementKey]: { ...fileUpload, status: 'ready' }
      }));
    }, 1500);
  };

  const handleGenerateComparison = () => {
    setShowResults(true);
  };

  const handleUseSampleData = () => {
    const statement1Name = location.state?.statement1Name || '053125 WellsFargo (2).pdf';
    const statement2Name = location.state?.statement2Name || '063025 WellsFargo.pdf';
    
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

  // Auto-load sample data if coming from history
  React.useEffect(() => {
    if (location.state?.fromHistory) {
      handleUseSampleData();
    }
  }, [location.state]);

  const chartData = mockComparison.map(item => ({
    category: item.category,
    statement1: item.statement1,
    statement2: item.statement2,
    difference: Math.abs(item.difference)
  }));

  const pieData = mockComparison.map((item, index) => ({
    name: item.category,
    value: item.statement1,
    color: COLORS[index % COLORS.length]
  }));

  const pieDataStatement2 = mockComparison.map((item, index) => ({
    name: item.category,
    value: item.statement2,
    color: COLORS[index % COLORS.length]
  }));

  const pieDataIncome = [
    { name: 'Salary', value: 4250.00, color: COLORS[0] },
    { name: 'Freelance', value: 0, color: COLORS[1] },
    { name: 'Investments', value: 0, color: COLORS[2] },
    { name: 'Other', value: 0, color: COLORS[3] }
  ].filter(item => item.value > 0);

  const pieDataIncomeStatement2 = [
    { name: 'Salary', value: 4250.00, color: COLORS[0] },
    { name: 'Freelance', value: 0, color: COLORS[1] },
    { name: 'Investments', value: 0, color: COLORS[2] },
    { name: 'Other', value: 0, color: COLORS[3] }
  ].filter(item => item.value > 0);

  const getChartTitle = () => {
    switch (chartView) {
      case 'bar-expenses': return 'Expense Comparison by Category';
      case 'bar-income': return 'Income Comparison by Source';
      case 'graph-expenses': return 'Expense Breakdown by Statement';
      case 'graph-income': return 'Income Breakdown by Statement';
      default: return 'Category Comparison';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {!showResults ? (
        <>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-600' : 'bg-blue-600'}`}>
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className={`text-4xl md:text-5xl font-bold ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Bank Statement Comparison
              </h1>
            </div>
            <div className="space-y-2 text-lg">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Upload two bank statements and get instant spending comparisons by category.
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Perfect for co-parents, roommates, and couples splitting expenses.
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Or for keeping tabs of your month to month spending.
              </p>
            </div>
          </div>

          {bothFilesUploaded ? (
            /* Post-Upload Interface */
            <div className="space-y-8">
              {/* Uploaded Files Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {editingLabel === 'statement1' ? (
                      <input
                        type="text"
                        value={statementLabels.statement1}
                        onChange={(e) => handleLabelEdit('statement1', e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
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
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Ready for comparison
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {editingLabel === 'statement2' ? (
                      <input
                        type="text"
                        value={statementLabels.statement2}
                        onChange={(e) => handleLabelEdit('statement2', e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
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
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Ready for comparison
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Comparison Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateComparison}
                  className={`px-8 py-4 rounded-xl text-lg font-semibold transition-colors ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Generate Comparison
                </button>
                <p className={`mt-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This will process all categories and charge based on pages processed
                </p>
              </div>
            </div>
          ) : (
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
                        onChange={(e) => handleLabelEdit('statement1', e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
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
                    onFileSelect={(file) => handleFileUpload('statement1', file)}
                    uploadedFile={uploadedFiles.statement1}
                    isDark={isDark}
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {editingLabel === 'statement2' ? (
                      <input
                        type="text"
                        value={statementLabels.statement2}
                        onChange={(e) => handleLabelEdit('statement2', e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
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
                    onFileSelect={(file) => handleFileUpload('statement2', file)}
                    uploadedFile={uploadedFiles.statement2}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Sample Data Button */}
              <div className="text-center mb-12">
                <button
                  onClick={handleUseSampleData}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Eye className="h-5 w-5" />
                  Preview Results
                </button>
              </div>

              {/* Additional spacing */}
              <div className="mb-16"></div>
            </div>
          )}
        </>
      ) : (
        /* Results Section */
        <div className="space-y-8">
          {/* Results Header */}
          <div className="text-center">
            <h2 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Spending Comparison Results
            </h2>
            <p className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Comparing {statementLabels.statement1} vs {statementLabels.statement2}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-xl p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Statement 1
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Withdrawals
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    $3,470.75
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Deposits
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    $4,250.00
                  </span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Statement 2
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Withdrawals
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    $3,396.15
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Deposits
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    $4,250.00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mb-8">
            <div className={`rounded-xl p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {getChartTitle()}
                </h3>
                <select
                  value={chartView}
                  onChange={(e) => setChartView(e.target.value as any)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="bar-expenses">Bar Expenses</option>
                  <option value="bar-income">Bar Income</option>
                  <option value="graph-expenses">Graph Expenses</option>
                  <option value="graph-income">Graph Income</option>
                </select>
              </div>
              
              <ResponsiveContainer width="100%" height={400}>
                {chartView.startsWith('bar') ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="category" 
                      stroke={isDark ? '#9CA3AF' : '#6B7280'}
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        color: isDark ? '#F3F4F6' : '#1F2937'
                      }}
                    />
                    {chartView === 'bar-expenses' ? (
                      <>
                        <Bar dataKey="statement1" fill="#1E40AF" name="Statement 1" />
                        <Bar dataKey="statement2" fill="#3B82F6" name="Statement 2" />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="statement1" fill="#1E40AF" name="Statement 1 Income" />
                        <Bar dataKey="statement2" fill="#3B82F6" name="Statement 2 Income" />
                      </>
                    )}
                  </BarChart>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className={`text-lg font-medium text-center mb-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Statement 1
                      </h4>
                      <div className="flex justify-center">
                        <PieChart width={350} height={350}>
                        <Pie
                          data={chartView === 'graph-expenses' ? pieData : pieDataIncome}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(chartView === 'graph-expenses' ? pieData : pieDataIncome).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            borderRadius: '8px',
                            color: isDark ? '#F3F4F6' : '#1F2937'
                          }}
                        />
                      </PieChart>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`text-lg font-medium text-center mb-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Statement 2
                      </h4>
                      <div className="flex justify-center">
                        <PieChart width={350} height={350}>
                        <Pie
                          data={chartView === 'graph-expenses' ? pieDataStatement2 : pieDataIncomeStatement2}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(chartView === 'graph-expenses' ? pieDataStatement2 : pieDataIncomeStatement2).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            borderRadius: '8px',
                            color: isDark ? '#F3F4F6' : '#1F2937'
                          }}
                        />
                      </PieChart>
                      </div>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Details */}
          <div className="space-y-4">
            <h3 className={`text-2xl font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Category Breakdown
            </h3>
            
            {mockComparison.map((category, index) => (
              <div
                key={category.category}
                className={`rounded-xl p-6 shadow-lg border transition-all ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.category ? null : category.category
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                    }`}>
                      {category.icon}
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {category.category}
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {category.transactions1.length + category.transactions2.length} transactions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Statement 1
                      </p>
                      <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        ${category.statement1.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Statement 2
                      </p>
                      <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        ${category.statement2.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Difference
                      </p>
                      <p className={`font-semibold ${
                        category.difference > 0 
                          ? 'text-red-500' 
                          : category.difference < 0 
                            ? 'text-green-500' 
                            : isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {category.difference > 0 ? '+' : ''}${category.difference.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {expandedCategory === category.category && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className={`font-medium mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Statement 1 Transactions
                        </h5>
                        <div className="space-y-2">
                          {category.transactions1.map((transaction, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {transaction.date} - {transaction.description}
                              </span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                ${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className={`font-medium mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Statement 2 Transactions
                        </h5>
                        <div className="space-y-2">
                          {category.transactions2.map((transaction, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {transaction.date} - {transaction.description}
                              </span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                ${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Export Options */}
          <div className="flex justify-center gap-4">
            <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}>
              <Download className="h-5 w-5" />
              Export PDF Report
            </button>
            
            <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}>
              <Download className="h-5 w-5" />
              Export CSV Data
            </button>
          </div>
          
          <div className="flex justify-center mt-4">
            <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}>
              <BarChart3 className="h-5 w-5" />
              Generate New Comparison
            </button>
          </div>
        </div>
      )}

      {/* Preview Cards Section */}
      {!showResults && (


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category Breakdown Card */}
            <div className={`group relative rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } shadow-lg hover:shadow-2xl`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <BarChart3 className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Category Breakdown
                </h3>
              </div>
              
              {/* Preview Content */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Food & Dining
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    $680 → $520
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Transportation
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    $340 → $425
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Housing
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    $2450 → $2450
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
                isDark ? 'bg-blue-900/20' : 'bg-blue-50/80'
              }`}>
                <div className="text-center">
                  <BarChart3 className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Interactive Charts
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details Card */}
            <div className={`group relative rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } shadow-lg hover:shadow-2xl`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <FileText className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Transaction Details
                </h3>
              </div>
              
              {/* Preview Content */}
              <div className="space-y-2">
                <div className="text-xs">
                  <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>01/05 - Grocery Store</span>
                    <span>$125.50</span>
                  </div>
                </div>
                <div className="text-xs">
                  <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>01/08 - Restaurant</span>
                    <span>$45.75</span>
                  </div>
                </div>
                <div className="text-xs">
                  <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>01/15 - Gas Station</span>
                    <span>$65.50</span>
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
                isDark ? 'bg-green-900/20' : 'bg-green-50/80'
              }`}>
                <div className="text-center">
                  <FileText className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Detailed Breakdown
                  </p>
                </div>
              </div>
            </div>

            {/* Export Options Card */}
            <div className={`group relative rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } shadow-lg hover:shadow-2xl`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <Download className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Export & Share
                </h3>
              </div>
              
              {/* Preview Content */}
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
                  <span>PDF Report</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-600'}`}></div>
                  <span>CSV Data Export</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
                  <span>Shareable Links</span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
                isDark ? 'bg-purple-900/20' : 'bg-purple-50/80'
              }`}>
                <div className="text-center">
                  <Download className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <p className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    Multiple Formats
                  </p>
                </div>
              </div>
            </div>
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