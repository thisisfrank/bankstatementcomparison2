# Bank Statement Comparison Tool

A micro-SaaS application for comparing bank statements and analyzing spending patterns across different time periods.

## Features

- **PDF Upload & Parsing**: Upload two bank statements and get instant analysis
- **Automatic Categorization**: Smart categorization of transactions using AI
- **Spending Comparison**: Compare spending patterns between two statements
- **Click-to-Edit Transactions**: Edit transaction categories and create custom categories
- **Export Options**: Generate PDF reports and CSV exports
- **User Authentication**: Secure user accounts with Supabase
- **History Tracking**: Save and review past comparisons

## New: Click-to-Edit Transactions with Custom Categories

### How It Works

1. **Click Any Transaction**: Simply click on any transaction row in the comparison results
2. **Edit Category**: Change the category using the dropdown or create a new one
3. **Custom Categories**: Add your own categories that persist across sessions
4. **Real-time Updates**: Changes immediately update the comparison calculations

### Using Custom Categories

- **Add New Category**: Type a new category name and click the + button
- **Remove Custom Category**: Click the trash icon next to any custom category
- **Visual Indicators**: Custom categories are marked with a ★ star icon
- **Persistent Storage**: Your custom categories are saved locally and available for future comparisons

### Benefits

- **Personalized Analysis**: Categorize transactions according to your own spending patterns
- **Better Insights**: More accurate categorization leads to better spending insights
- **Flexibility**: Adapt the tool to your specific financial needs
- **Ease of Use**: Simple click-to-edit interface makes categorization effortless

## Data Integrity

**No Mock Data**: This tool only displays real data from uploaded bank statements. We never show fake or sample data to users.

- **Real Results Only**: All comparisons are based on actual uploaded PDF statements
- **User Privacy**: Your financial data is processed securely and never shared
- **Accurate Analysis**: Get genuine insights from your real spending patterns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication and data storage)
- PDF Parser API key (for statement processing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bankstatementcomparison2-1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and Supabase configuration
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# PDF Parser API
VITE_PDF_PARSER_API_KEY=your_api_key
VITE_PDF_PARSER_API_URL=https://api2.bankstatementconverter.com/api/v1

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Usage

1. **Upload Statements**: Upload two PDF bank statements
2. **Wait for Processing**: The API will parse and categorize transactions
3. **Review Results**: View spending comparisons by category
4. **Edit Categories**: Click any transaction to edit its category or create custom ones
5. **Export Results**: Generate PDF reports or CSV data
6. **Save to History**: Results are automatically saved for future reference

## API Integration

The tool integrates with the Bank Statement Converter API for PDF parsing:

- **Supported Formats**: PDF bank statements (text-based and image-based)
- **Processing**: Automatic transaction extraction and categorization
- **Output**: Normalized transaction data with amounts, dates, and descriptions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.