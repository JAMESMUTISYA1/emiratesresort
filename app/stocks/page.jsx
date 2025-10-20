// app/stocks/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import StockForm from '../../components/StockForm';
import { useApp } from '../../context/AppContext';
import { databases, ID, STOCK_COLLECTION_ID, DATABASE_ID } from '../../lib/appwrite';

export default function StocksPage() {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingStock, setAddingStock] = useState(null);
  const [addQuantity, setAddQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  // Debug log to check state
  useEffect(() => {
    console.log('Current state:', state);
  }, [state]);

  const handleAddStock = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleAddQuantity = (stock) => {
    setAddingStock(stock);
    setAddQuantity('');
  };

  const handleCloseAddQuantity = () => {
    setAddingStock(null);
    setAddQuantity('');
  };

  const handleSubmitAddQuantity = async () => {
    if (!addQuantity || parseInt(addQuantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      const newQuantity = addingStock.quantity + parseInt(addQuantity);
      const updatedStock = await databases.updateDocument(
        DATABASE_ID,
        STOCK_COLLECTION_ID,
        addingStock.$id,
        { 
          quantity: newQuantity,
          updatedAt: new Date().toISOString()
        }
      );

      // Update local state
      const updatedStockList = state.stock.map(item => 
        item.$id === addingStock.$id ? updatedStock : item
      );
      dispatch({ type: 'SET_STOCK', payload: updatedStockList });
      
      alert(`Successfully added ${addQuantity} items to ${addingStock.name}`);
      handleCloseAddQuantity();
    } catch (error) {
      alert('Error adding stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (stockId, stockName) => {
    if (!confirm(`Are you sure you want to delete "${stockName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await databases.deleteDocument(DATABASE_ID, STOCK_COLLECTION_ID, stockId);
      
      // Update local state
      dispatch({ type: 'DELETE_STOCK', payload: stockId });
      
      alert('Stock item deleted successfully!');
    } catch (error) {
      alert('Error deleting stock item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Emirates Resort - Stock Report</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: portrait;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
                background: white;
              }
              .print-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #000;
              }
              .print-header h1 {
                font-size: 24px;
                margin: 0 0 5px 0;
                color: #000;
              }
              .print-header .subtitle {
                font-size: 14px;
                margin: 0 0 10px 0;
                color: #666;
              }
              .print-header .print-date {
                font-size: 12px;
                color: #666;
              }
              .stock-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              .stock-table th {
                background-color: #f8f9fa;
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
                font-weight: bold;
              }
              .stock-table td {
                border: 1px solid #000;
                padding: 8px;
              }
              .stock-table tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              .summary-cards {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                page-break-inside: avoid;
              }
              .summary-card {
                border: 1px solid #000;
                padding: 15px;
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .no-print {
                display: none !important;
              }
              .status-badge {
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
              }
              .status-in-stock { background-color: #d1fae5; color: #065f46; }
              .status-low-stock { background-color: #fef3c7; color: #92400e; }
              .status-out-of-stock { background-color: #fee2e2; color: #991b1b; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Calculate profit margin for each item
  const stockWithProfit = state.stock.map(item => ({
    ...item,
    profitMargin: (item.sellingPrice || 0) - (item.buyingPrice || 0),
    profitPercentage: item.buyingPrice ? (((item.sellingPrice || 0) - (item.buyingPrice || 0)) / (item.buyingPrice || 1) * 100).toFixed(1) : '0',
    totalValue: (item.quantity || 0) * (item.buyingPrice || 0)
  }));

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Management</h1>
              <p className="text-gray-600">Manage your inventory and track stock levels</p>
            </div>
            <div className="bg-gray-300 animate-pulse h-12 w-40 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Loading form placeholder */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Loading content placeholder */}
            <div className="lg:col-span-3">
              {/* Loading summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="animate-pulse flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200"></div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b border-gray-200">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Management</h1>
              <p className="text-gray-600">Manage your inventory and track stock levels</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 no-print"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Stock Report
              </button>
              <button
                onClick={handleAddStock}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 no-print"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Stock
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Add Stock Form */}
          <div className="lg:col-span-1 no-print">
            {showAddForm && (
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add New Stock</h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <StockForm onSuccess={handleCloseForm} />
              </div>
            )}
          </div>

          {/* Stock List - Printable Area */}
          <div className="lg:col-span-3" ref={printRef}>
            {/* Print Header - Only shows when printing */}
            <div className="print-header hidden print:block">
              <h1>EMIRATES RESORT</h1>
              <div className="subtitle">Stock Inventory Report</div>
              <div className="print-date">
                Printed at: {new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">📦</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-xl font-bold text-green-600">{state.stock.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-xl font-bold text-yellow-600">
                      KSh {stockWithProfit.reduce((sum, item) => sum + (item.totalValue || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-xl font-bold text-red-600">
                      {state.stock.filter(item => (item.quantity || 0) <= 10 && (item.quantity || 0) > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full stock-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buy Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sell Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockWithProfit.map((item, index) => (
                      <tr key={item.$id} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{item.quantity || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">KSh {(item.buyingPrice || 0).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">KSh {(item.sellingPrice || 0).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium ${
                              (item.profitMargin || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              KSh {(item.profitMargin || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.profitPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge ${
                            (item.quantity || 0) === 0 
                              ? 'status-out-of-stock' 
                              : (item.quantity || 0) <= 10 
                              ? 'status-low-stock'
                              : 'status-in-stock'
                          }`}>
                            {(item.quantity || 0) === 0 
                              ? 'Out of Stock' 
                              : (item.quantity || 0) <= 10 
                              ? 'Low Stock' 
                              : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddQuantity(item)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Add Stock
                            </button>
                            <button
                              onClick={() => handleDeleteStock(item.$id, item.name)}
                              disabled={loading}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-200">
                  {stockWithProfit.map((item) => (
                    <div key={item.$id} className="p-4">
                      {/* First Row: Name, Quantity, Action Button */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-medium text-green-600">
                              Available: {item.quantity || 0}
                            </span>
                            <span className={`status-badge ${
                              (item.quantity || 0) === 0 
                                ? 'status-out-of-stock' 
                                : (item.quantity || 0) <= 10 
                                ? 'status-low-stock'
                                : 'status-in-stock'
                            }`}>
                              {(item.quantity || 0) === 0 
                                ? 'Out of Stock' 
                                : (item.quantity || 0) <= 10 
                                ? 'Low Stock' 
                                : 'In Stock'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4 no-print">
                          <button
                            onClick={() => handleAddQuantity(item)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => handleDeleteStock(item.$id, item.name)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                          >
                            Del
                          </button>
                        </div>
                      </div>

                      {/* Scrollable Details Row */}
                      <div className="overflow-x-auto">
                        <div className="flex space-x-6 min-w-max pb-2">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Buy Price</p>
                            <p className="text-sm font-medium text-gray-900">
                              KSh {(item.buyingPrice || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Sell Price</p>
                            <p className="text-sm font-medium text-gray-900">
                              KSh {(item.sellingPrice || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Profit</p>
                            <p className={`text-sm font-medium ${
                              (item.profitMargin || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              KSh {(item.profitMargin || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.profitPercentage}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Total Value</p>
                            <p className="text-sm font-medium text-yellow-600">
                              KSh {(item.totalValue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty State */}
              {state.stock.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">No stock items available</p>
                  <p className="text-gray-400 text-sm mb-4">Add your first stock item to get started</p>
                  <button
                    onClick={handleAddStock}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 no-print"
                  >
                    Add First Stock Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Stock Quantity Popup */}
        {addingStock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 no-print">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Add Stock Quantity</h3>
                <button
                  onClick={handleCloseAddQuantity}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Item Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{addingStock.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Stock</p>
                      <p className="font-semibold text-green-600">{addingStock.quantity || 0} items</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Buy Price</p>
                      <p className="font-semibold">KSh {(addingStock.buyingPrice || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Add
                  </label>
                  <input
                    type="number"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Calculation Preview */}
                {addQuantity && parseInt(addQuantity) > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600 mb-2">New Stock Calculation:</div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Current:</span>
                      <span className="font-medium">{addingStock.quantity || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Adding:</span>
                      <span className="font-medium text-green-600">+{addQuantity}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-green-200 pt-2 mt-2">
                      <span className="font-semibold text-gray-900">New Total:</span>
                      <span className="font-bold text-green-700 text-lg">
                        {(addingStock.quantity || 0) + parseInt(addQuantity)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCloseAddQuantity}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAddQuantity}
                    disabled={loading || !addQuantity || parseInt(addQuantity) <= 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}