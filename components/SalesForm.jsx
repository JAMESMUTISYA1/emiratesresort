// components/SalesForm.js
'use client';
import { useState, useEffect } from 'react';
import { databases, ID, DATABASE_ID, STOCK_COLLECTION_ID, DAILY_SALES_COLLECTION_ID, DAILY_SUMMARIES_COLLECTION_ID, EXPENSES_COLLECTION_ID, Query } from '../lib/appwrite';
import { useApp } from '../context/AppContext';

export default function SalesForm() {
  const { state, dispatch } = useApp();
  const [dailySales, setDailySales] = useState([]);
  const [mpesaTotal, setMpesaTotal] = useState('');
  const [expenses, setExpenses] = useState([{ description: '', amount: '' }]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [existingSummary, setExistingSummary] = useState(null);

  // Check if summary exists for selected date
  useEffect(() => {
    const checkExistingSummary = async () => {
      try {
        const existing = await databases.listDocuments(
          DATABASE_ID,
          DAILY_SUMMARIES_COLLECTION_ID,
          [Query.equal('date', date)]
        );
        
        if (existing.documents.length > 0) {
          setExistingSummary(existing.documents[0]);
        } else {
          setExistingSummary(null);
        }
      } catch (error) {
        console.error('Error checking existing summary:', error);
        setExistingSummary(null);
      }
    };

    checkExistingSummary();
  }, [date]);

  // Initialize daily sales with current stock items
  useEffect(() => {
    if (state.stock.length > 0 && !existingSummary) {
      const initialSales = state.stock.map(item => ({
        stockItemId: item.$id,
        stockItemName: item.name,
        sellingPrice: item.sellingPrice,
        buyingPrice: item.buyingPrice,
        availableQuantity: item.quantity,
        quantitySold: '',
        totalRevenue: 0,
        totalCost: 0
      }));
      setDailySales(initialSales);
    }
  }, [state.stock, existingSummary]);

  // Handle quantity change with support for fractions
  const handleQuantityChange = (stockItemId, quantity) => {
    const updatedSales = dailySales.map(sale => {
      if (sale.stockItemId === stockItemId) {
        let quantityNum = 0;
        
        // Handle fractional quantities
        if (quantity.includes('/')) {
          const [numerator, denominator] = quantity.split('/').map(Number);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            quantityNum = numerator / denominator;
          }
        } else {
          quantityNum = quantity === '' ? 0 : parseFloat(quantity);
        }

        const revenue = quantityNum * sale.sellingPrice;
        const cost = quantityNum * sale.buyingPrice;
        return {
          ...sale,
          quantitySold: quantity,
          totalRevenue: revenue,
          totalCost: cost
        };
      }
      return sale;
    });
    setDailySales(updatedSales);
  };

  const addExpenseField = () => {
    setExpenses([...expenses, { description: '', amount: '' }]);
  };

  const removeExpenseField = (index) => {
    if (expenses.length > 1) {
      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);
    }
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = expenses.map((expense, i) => 
      i === index ? { ...expense, [field]: value } : expense
    );
    setExpenses(updatedExpenses);
  };

  const calculateTotals = () => {
    const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalCost = dailySales.reduce((sum, sale) => sum + sale.totalCost, 0);
    
    // Calculate total quantity (handle fractions)
    const totalQuantity = dailySales.reduce((sum, sale) => {
      if (sale.quantitySold.includes('/')) {
        const [numerator, denominator] = sale.quantitySold.split('/').map(Number);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return sum + (numerator / denominator);
        }
      }
      return sum + (parseFloat(sale.quantitySold) || 0);
    }, 0);

    const mpesa = parseFloat(mpesaTotal) || 0;
    const expensesTotal = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    // Calculate profit: (Selling Price - Buying Price) - Expenses
    const profit = (totalRevenue - totalCost) - expensesTotal;
    
    // Expenses are paid from cash, so remaining cash = (totalRevenue - mpesa) - expenses
    const remainingCash = (totalRevenue - mpesa) - expensesTotal;

    return {
      totalRevenue,
      totalCost,
      totalQuantity,
      mpesa,
      expensesTotal,
      profit,
      remainingCash
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if summary already exists for this date
    if (existingSummary) {
      alert(`Sales for ${date} have already been recorded. Please select a different date.`);
      return;
    }

    setLoading(true);

    try {
      const { totalRevenue, totalCost, mpesa, expensesTotal, profit, remainingCash } = calculateTotals();

      // 1. Save daily sales records
      const salesWithQuantities = dailySales.filter(sale => 
        sale.quantitySold && (
          sale.quantitySold.includes('/') ? 
          parseFloat(sale.quantitySold.split('/')[0]) > 0 : 
          parseFloat(sale.quantitySold) > 0
        )
      );
      
      const salesPromises = salesWithQuantities.map(sale => {
        let quantityValue;
        
        // Handle fractional quantities for storage
        if (sale.quantitySold.includes('/')) {
          quantityValue = sale.quantitySold; // Store as string like "1/4"
        } else {
          quantityValue = parseFloat(sale.quantitySold);
        }

        return databases.createDocument(
          DATABASE_ID,
          DAILY_SALES_COLLECTION_ID,
          ID.unique(),
          {
            date: date,
            stockItemId: sale.stockItemId,
            stockItemName: sale.stockItemName,
            quantitySold: quantityValue,
            sellingPrice: sale.sellingPrice,
            totalRevenue: sale.totalRevenue
          }
        );
      });

      // 2. Update stock quantities (handle fractions)
      const stockUpdatePromises = salesWithQuantities.map(sale => {
        const stockItem = state.stock.find(item => item.$id === sale.stockItemId);
        if (stockItem) {
          let quantityToDeduct;
          
          if (sale.quantitySold.includes('/')) {
            const [numerator, denominator] = sale.quantitySold.split('/').map(Number);
            quantityToDeduct = numerator / denominator;
          } else {
            quantityToDeduct = parseFloat(sale.quantitySold);
          }

          const updatedQuantity = stockItem.quantity - quantityToDeduct;
          return databases.updateDocument(
            DATABASE_ID,
            STOCK_COLLECTION_ID,
            sale.stockItemId,
            { quantity: updatedQuantity }
          );
        }
      });

      // 3. Save expenses (paid from cash)
      const expensesWithAmounts = expenses.filter(exp => exp.description && exp.amount);
      const expensesPromises = expensesWithAmounts.map(expense =>
        databases.createDocument(
          DATABASE_ID,
          EXPENSES_COLLECTION_ID,
          ID.unique(),
          {
            description: expense.description,
            amount: parseFloat(expense.amount),
            category: 'daily',
            date: date,
            paymentMethod: 'cash' // Expenses always paid from cash
          }
        )
      );

      // 4. Save daily summary with profit calculation
      const summaryPromise = databases.createDocument(
        DATABASE_ID,
        DAILY_SUMMARIES_COLLECTION_ID,
        ID.unique(),
        {
          date: date,
          totalRevenue: totalRevenue,
          totalMpesa: mpesa,
          totalExpenses: expensesTotal,
          profit: profit, // Store calculated profit
          cashRemaining: remainingCash
        }
      );

      // Execute all operations
      await Promise.all([
        ...salesPromises,
        ...stockUpdatePromises.filter(p => p !== undefined),
        ...expensesPromises,
        summaryPromise
      ]);

      // Refresh data
      const [stockRes, dailySalesRes, expensesRes, summariesRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, DAILY_SALES_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, EXPENSES_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, DAILY_SUMMARIES_COLLECTION_ID)
      ]);

      dispatch({ type: 'SET_STOCK', payload: stockRes.documents });
      dispatch({ type: 'SET_DAILY_SALES', payload: dailySalesRes.documents });
      dispatch({ type: 'SET_EXPENSES', payload: expensesRes.documents });
      dispatch({ type: 'SET_DAILY_SUMMARIES', payload: summariesRes.documents });

      // Reset form
      setDailySales(state.stock.map(item => ({
        stockItemId: item.$id,
        stockItemName: item.name,
        sellingPrice: item.sellingPrice,
        buyingPrice: item.buyingPrice,
        availableQuantity: item.quantity,
        quantitySold: '',
        totalRevenue: 0,
        totalCost: 0
      })));
      setMpesaTotal('');
      setExpenses([{ description: '', amount: '' }]);

      alert('Daily sales recorded successfully!');
    } catch (error) {
      alert('Error recording daily sales: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const { totalRevenue, totalCost, totalQuantity, expensesTotal, profit, remainingCash } = calculateTotals();

  // If summary exists for selected date, show the data instead of the form
  if (existingSummary) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Sales Summary</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sales Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-800">Sales Already Recorded</h3>
          </div>
          
          <p className="text-yellow-700 mb-4">
            Sales for <strong>{date}</strong> have already been recorded. Here's the summary:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">KSh {existingSummary.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Mpesa Total</p>
              <p className="text-xl font-bold text-blue-600">KSh {existingSummary.totalMpesa?.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">KSh {existingSummary.totalExpenses?.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">Daily Profit</p>
              <p className={`text-xl font-bold ${existingSummary.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                KSh {existingSummary.profit?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 text-sm text-yellow-600">
            <p>💡 To record sales for this date, please select a different date or edit the existing record.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Daily Sales Summary</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sales Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sales Items Table */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Items Sold Today</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty Sold</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dailySales.map((sale) => (
                  <tr key={sale.stockItemId}>
                    <td className="px-4 py-2 font-medium">{sale.stockItemName}</td>
                    <td className="px-4 py-2">{sale.availableQuantity}</td>
                    <td className="px-4 py-2">KSh {sale.sellingPrice?.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={sale.quantitySold}
                        onChange={(e) => handleQuantityChange(sale.stockItemId, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="0 or 1/4, 1/2, 3/4"
                        title="Enter whole numbers or fractions like 1/4, 1/2, 3/4"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">KSh {sale.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            💡 Tip: You can enter fractions like 1/4, 1/2, 3/4 for partial items
          </div>
        </div>

        {/* Financial Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Mpesa Input */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Mpesa Received</h4>
            <input
              type="number"
              value={mpesaTotal}
              onChange={(e) => setMpesaTotal(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>

          {/* Expenses Input */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Daily Expenses (Paid from Cash)</h4>
              <button
                type="button"
                onClick={addExpenseField}
                className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                + Add Expense
              </button>
            </div>
            <div className="space-y-2">
              {expenses.map((expense, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Amount"
                  />
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpenseField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-3">Daily Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-lg font-bold">{totalQuantity.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-green-600">KSh {totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-lg font-bold text-orange-600">KSh {totalCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-lg font-bold text-red-600">KSh {expensesTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Profit</p>
              <p className={`text-lg font-bold ${profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                KSh {profit.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>💰 <strong>Profit Calculation:</strong> (Revenue - Cost of Goods) - Expenses = (KSh {totalRevenue.toLocaleString()} - KSh {totalCost.toLocaleString()}) - KSh {expensesTotal.toLocaleString()} = KSh {profit.toLocaleString()}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || totalQuantity === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Saving...' : `Save Daily Sales - KSh ${totalRevenue.toLocaleString()}`}
        </button>
      </form>
    </div>
  );
}