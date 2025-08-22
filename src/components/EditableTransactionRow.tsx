import React, { useState } from 'react';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface EditableTransactionRowProps {
  transaction: Transaction;
  onCategoryChange: (transactionId: string, newCategory: string) => void;
  availableCategories: string[];
  customCategories: string[];
  onAddCustomCategory: (category: string) => void;
  onRemoveCustomCategory: (category: string) => void;
  isDark: boolean;
}

export default function EditableTransactionRow({
  transaction,
  onCategoryChange,
  availableCategories,
  customCategories,
  onAddCustomCategory,
  onRemoveCustomCategory,
  isDark
}: EditableTransactionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const allCategories = [...availableCategories, ...customCategories];

  const handleSave = () => {
    if (selectedCategory !== transaction.category) {
      onCategoryChange(transaction.id!, selectedCategory);
    }
    setIsEditing(false);
  };

  const handleAddCustomCategory = () => {
    if (newCategoryInput.trim() && !allCategories.includes(newCategoryInput.trim())) {
      onAddCustomCategory(newCategoryInput.trim());
      setSelectedCategory(newCategoryInput.trim());
      setNewCategoryInput('');
    }
  };

  const handleRemoveCustomCategory = (category: string) => {
    if (customCategories.includes(category)) {
      onRemoveCustomCategory(category);
      // If the removed category was selected, switch to a default one
      if (selectedCategory === category) {
        setSelectedCategory('Other');
      }
    }
  };

  if (isEditing) {
    return (
      <div className={`p-4 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</span>
            <span className="text-sm text-gray-500 ml-2">${transaction.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className={`p-1.5 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'text-gray-500'}`}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 rounded hover:bg-green-100 text-green-600"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Category Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Add Custom Category */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Type new category name..."
                className={`flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                onClick={handleAddCustomCategory}
                disabled={!newCategoryInput.trim()}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  newCategoryInput.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Custom Categories Management */}
          {customCategories.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Custom Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {customCategories.map(cat => (
                  <div
                    key={cat}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => handleRemoveCustomCategory(cat)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isDark 
          ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500' 
          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</span>
          <span className="text-sm text-gray-500 ml-2">${transaction.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            isDark 
              ? customCategories.includes(transaction.category) 
                ? 'bg-purple-900 text-purple-300 border border-purple-600' 
                : 'bg-blue-900 text-blue-300'
              : customCategories.includes(transaction.category)
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-blue-100 text-blue-800'
          }`}>
            {transaction.category}
            {customCategories.includes(transaction.category) && (
              <span className="ml-1 text-xs">★</span>
            )}
          </span>
          <Edit className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
