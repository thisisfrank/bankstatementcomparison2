import React, { useState } from 'react';
import { Edit, Trash2, Plus, X, Save, Check } from 'lucide-react';
import { TransactionCategorizer } from '../services/categorizer';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'credit' | 'debit';
}

interface TransactionManagerProps {
  isDark: boolean;
  transactions: Transaction[];
  onTransactionsChange: (transactions: Transaction[]) => void;
  category: string;
}

export default function TransactionManager({ 
  isDark, 
  transactions, 
  onTransactionsChange, 
  category 
}: TransactionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Partial<Transaction>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});

  const availableCategories = TransactionCategorizer.getAvailableCategories();

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditingTransaction({ ...transaction });
  };

  const handleSave = () => {
    if (editingId) {
      const updatedTransactions = transactions.map(t => 
        t.id === editingId ? { ...t, ...editingTransaction } : t
      );
      onTransactionsChange(updatedTransactions);
      setEditingId(null);
      setEditingTransaction({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingTransaction({});
    setShowAddForm(false);
    setNewTransaction({});
  };

  const handleDelete = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    onTransactionsChange(updatedTransactions);
  };

  const handleAdd = () => {
    if (newTransaction.date && newTransaction.description && newTransaction.amount) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        date: newTransaction.date!,
        description: newTransaction.description!,
        amount: newTransaction.amount!,
        category: newTransaction.category || category,
        type: newTransaction.type || 'debit'
      };
      onTransactionsChange([...transactions, transaction]);
      setShowAddForm(false);
      setNewTransaction({});
    }
  };

  const handleCategoryChange = (transactionId: string, newCategory: string) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transactionId ? { ...t, category: newCategory } : t
    );
    onTransactionsChange(updatedTransactions);
  };

  return (
    <div className="space-y-4">
      {/* Add Transaction Button */}
      <div className="flex justify-between items-center">
        <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Transactions ({transactions.length})
        </h4>
        <button
          onClick={() => setShowAddForm(true)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="date"
              value={newTransaction.date || ''}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className={`px-3 py-2 rounded-md border text-sm ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Date"
            />
            <input
              type="text"
              value={newTransaction.description || ''}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className={`px-3 py-2 rounded-md border text-sm ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Description"
            />
            <input
              type="number"
              step="0.01"
              value={newTransaction.amount || ''}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
              className={`px-3 py-2 rounded-md border text-sm ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Amount"
            />
            <select
              value={newTransaction.type || 'debit'}
              onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'credit' | 'debit' })}
              className={`px-3 py-2 rounded-md border text-sm ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isDark 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Check className="h-4 w-4" />
              Add
            </button>
            <button
              onClick={handleCancel}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`p-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {editingId === transaction.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="date"
                    value={editingTransaction.date || ''}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                    className={`px-3 py-2 rounded-md border text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    value={editingTransaction.description || ''}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                    className={`px-3 py-2 rounded-md border text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editingTransaction.amount || ''}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) })}
                    className={`px-3 py-2 rounded-md border text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={editingTransaction.type || 'debit'}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value as 'credit' | 'debit' })}
                    className={`px-3 py-2 rounded-md border text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isDark 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isDark 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {transaction.date}
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.description}
                    </span>
                    <span className={`text-sm font-bold ${
                      transaction.type === 'credit' 
                        ? (isDark ? 'text-green-400' : 'text-green-600')
                        : (isDark ? 'text-red-400' : 'text-red-600')
                    }`}>
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Category Dropdown */}
                  <select
                    value={transaction.category}
                    onChange={(e) => handleCategoryChange(transaction.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  {/* Action Buttons */}
                  <button
                    onClick={() => handleEdit(transaction)}
                    className={`p-1 rounded transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className={`p-1 rounded transition-colors ${
                      isDark 
                        ? 'hover:bg-red-900 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
