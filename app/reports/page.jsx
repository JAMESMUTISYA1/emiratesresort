// app/reports/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function ReportsPage() {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableDates, setAvailableDates] = useState([]);
  const printRef = useRef();

  // Get all available dates from summaries and expenses
  useEffect(() => {
    const salesDates = state.dailySummaries.map(summary => summary.date);
    const expensesDates = state.expenses.map(expense => expense.date);
    const uniqueDates = [...new Set([...salesDates, ...expensesDates])];
    
    // Sort dates in descending order (newest first)
    const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));
    setAvailableDates(sortedDates);
  }, [state.dailySummaries, state.expenses]);

  // Get data for selected date
  const dailySummary = state.dailySummaries.find(summary => summary.date === selectedDate);
  const dailySales = state.dailySales.filter(sale => sale.date === selectedDate);
  const dailyExpenses = state.expenses.filter(expense => expense.date === selectedDate);

  // Calculate remaining stock for sold items
  const getRemainingStock = (sale) => {
    const stockItem = state.stock.find(item => item.$id === sale.stockItemId);
    return stockItem ? stockItem.quantity : 'N/A';
  };

  // Handle print functionality
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Emirates Resort - Daily Report</title>
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
              .report-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              .report-table th {
                background-color: #f8f9fa;
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
                font-weight: bold;
              }
              .report-table td {
                border: 1px solid #000;
                padding: 8px;
              }
              .report-table tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              .section-header {
                background-color: #e9ecef !important;
                font-weight: bold;
                font-size: 14px;
              }
              .summary-section {
                margin: 20px 0;
                page-break-inside: avoid;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 10px 0;
              }
              .summary-item {
                padding: 8px;
                border: 1px solid #000;
              }
              .no-print {
                display: none !important;
              }
              .positive { color: #065f46; }
              .negative { color: #991b1b; }
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

  // Navigate to previous/next day
  const navigateDate = (direction) => {
    const currentIndex = availableDates.findIndex(date => date === selectedDate);
    if (direction === 'prev' && currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Reports</h1>
          <p className="text-gray-600">View detailed daily sales and expenses reports</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 no-print">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Date Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate('prev')}
                disabled={!availableDates.find(date => date === selectedDate) || 
                         availableDates.findIndex(date => date === selectedDate) >= availableDates.length - 1}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-w-40"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => navigateDate('next')}
                disabled={!availableDates.find(date => date === selectedDate) || 
                         availableDates.findIndex(date => date === selectedDate) === 0}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        {/* Report Content - Printable Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" ref={printRef}>
          {/* Print Header */}
          <div className="print-header hidden print:block p-6">
            <h1>EMIRATES RESORT</h1>
            <div className="subtitle">Daily Sales and Expenses Report</div>
            <div className="print-date">
              Report Date: {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
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

          {/* Daily Summary */}
          {dailySummary && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Daily Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">KSh {dailySummary.totalRevenue?.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Mpesa Total</p>
                  <p className="text-2xl font-bold text-blue-600">KSh {dailySummary.totalMpesa?.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">KSh {dailySummary.totalExpenses?.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Daily Profit</p>
                  <p className={`text-2xl font-bold ${dailySummary.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    KSh {dailySummary.profit?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sales Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Sales Records</h2>
            {dailySales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full report-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailySales.map((sale) => (
                      <tr key={sale.$id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.stockItemName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {sale.quantitySold}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {getRemainingStock(sale)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          KSh {sale.sellingPrice?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                          KSh {sale.totalRevenue?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sales recorded for this day
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Expenses</h2>
            {dailyExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full report-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyExpenses.map((expense) => (
                      <tr key={expense.$id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {expense.category}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600">
                          KSh {(expense.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {expense.paymentMethod || 'cash'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No expenses recorded for this day
              </div>
            )}
          </div>

          {/* Financial Summary */}
          {dailySummary && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Income Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold text-green-600">KSh {dailySummary.totalRevenue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mpesa Payments:</span>
                      <span className="font-semibold text-blue-600">KSh {dailySummary.totalMpesa?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash Payments:</span>
                      <span className="font-semibold text-yellow-600">
                        KSh {(dailySummary.totalRevenue - dailySummary.totalMpesa)?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Expenses & Profit</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Expenses:</span>
                      <span className="font-semibold text-red-600">KSh {dailySummary.totalExpenses?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-medium">Daily Profit:</span>
                      <span className={`font-bold ${dailySummary.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        KSh {dailySummary.profit?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash Remaining:</span>
                      <span className={`font-semibold ${dailySummary.cashRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        KSh {dailySummary.cashRemaining?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {availableDates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">No reports available</p>
            <p className="text-gray-400 text-sm">Start recording sales and expenses to see reports here</p>
          </div>
        )}
      </div>
    </div>
  );
}