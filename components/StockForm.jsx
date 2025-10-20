// components/StockForm.js
'use client';
import { useState } from 'react';
import { databases, ID, STOCK_COLLECTION_ID, DATABASE_ID } from '../lib/appwrite';
import { useApp } from '../context/AppContext';

export default function StockForm({ onSuccess }) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    buyingPrice: '',
    sellingPrice: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stockData = {
        name: formData.name,
        quantity: parseInt(formData.quantity) || 0,
        buyingPrice: parseFloat(formData.buyingPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        STOCK_COLLECTION_ID,
        ID.unique(),
        stockData
      );

      dispatch({ type: 'ADD_STOCK', payload: result });
      
      // Reset form
      setFormData({
        name: '',
        quantity: '',
        buyingPrice: '',
        sellingPrice: ''
      });
      
      alert('Stock item added successfully!');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      alert('Error adding stock item: ' + error.message);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="e.g., Coca Cola 500ml"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buying Price (KSh)
          </label>
          <input
            type="number"
            name="buyingPrice"
            value={formData.buyingPrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price (KSh)
          </label>
          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Profit Preview */}
      {formData.buyingPrice && formData.sellingPrice && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Profit Preview:</div>
          <div className={`text-lg font-semibold ${
            parseFloat(formData.sellingPrice) > parseFloat(formData.buyingPrice) 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            KSh {(parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)).toFixed(2)}
            <span className="text-sm ml-2">
              ({((parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)) / (parseFloat(formData.buyingPrice) || 1) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
      >
        {loading ? 'Adding...' : 'Add Stock Item'}
      </button>
    </form>
  );
}