// components/ExpensesForm.js
'use client';
import { useState } from 'react';
import { databases, ID, DATABASE_ID, EXPENSES_COLLECTION_ID } from '../lib/appwrite';
import { useApp } from '../context/AppContext';

export default function ExpensesForm({ selectedDate }) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other'
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'transport', label: 'Transport' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'staff', label: 'Staff' },
    { value: 'rent', label: 'Rent' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        category: formData.category,
        date: selectedDate, // Use the selected date from parent
        paymentMethod: 'cash', // Always cash as requested
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        ID.unique(),
        expenseData
      );

      dispatch({ type: 'ADD_EXPENSE', payload: result });
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: 'other'
      });
      
      alert('Expense recorded successfully!');
    } catch (error) {
      alert('Error recording expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
      
      {/* Selected Date Display */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-gray-600">Recording expense for:</p>
        <p className="font-semibold text-yellow-700">{selectedDate}</p>
        <p className="text-xs text-gray-500 mt-1">Payment method: <span className="font-medium text-green-600">Cash</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="e.g., Transport to supplier"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (KSh)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Amounts (KSh)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500, 1000, 2000, 5000].map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Recording...' : 'Record Expense'}
        </button>

        <div className="text-xs text-gray-500 text-center">
          💡 Expense will be recorded for {selectedDate} and paid from cash
        </div>
      </form>
    </div>
  );
}