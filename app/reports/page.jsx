// app/reports/page.js
'use client';
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export default function ReportsPage() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('sales'); // 'sales' or 'expenses'
  const [expandedDays, setExpandedDays] = useState(new Set());

  // Function to format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid date
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Function to parse yyyy-mm-dd to Date object for sorting
  const parseDate = (dateString) => {
    if (!dateString) return new Date(0);
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      return new Date(0);
    }
  };

  // Get unique dates from both sales and expenses, sorted by date (newest first)
  const allDates = useMemo(() => {
    const salesDates = state.dailySummaries.map(summary => summary.date);
    const expensesDates = state.expenses.map(expense => expense.date);
    const uniqueDates = [...new Set([...salesDates, ...expensesDates])];
    
    return uniqueDates.sort((a, b) => parseDate(b) - parseDate(a));
  }, [state.dailySummaries, state.expenses]);

  // Pagination calculations
  const totalPages = Math.ceil(allDates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDates = allDates.slice(startIndex, endIndex);

  // Toggle day expansion
  const toggleDayExpansion = (date) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  // Get sales data for a specific date
  const getSalesForDate = (date) => {
    return state.dailySales.filter(sale => sale.date === date);
  };

  // Get expenses for a specific date
  const getExpensesForDate = (date) => {
    return state.expenses.filter(expense => expense.date === date);
  };

  // Get summary for a specific date
  const getSummaryForDate = (date) => {
    return state.dailySummaries.find(summary => summary.date === date);
  };

  // Calculate totals for current page
  const pageTotals = useMemo(() => {
    return currentDates.reduce((totals, date) => {
      const summary = getSummaryForDate(date);
      const expenses = getExpensesForDate(date);
      
      return {
        totalRevenue: totals.totalRevenue + (summary?.totalRevenue || 0),
        totalMpesa: totals.totalMpesa + (summary?.totalMpesa || 0),
        totalExpenses: totals.totalExpenses + expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        totalCashRemaining: totals.totalCashRemaining + (summary?.cashRemaining || 0)
      };
    }, {
      totalRevenue: 0,
      totalMpesa: 0,
      totalExpenses: 0,
      totalCashRemaining: 0
    });
  }, [currentDates]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedDays(new Set()); // Collapse all when changing pages
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setExpandedDays(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Reports</h1>
          <p className="text-gray-600">Comprehensive view of all daily sales and expenses</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('sales')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'sales'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sales Records
                </button>
                <button
                  onClick={() => setViewMode('expenses')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'expenses'
                      ? 'bg-yellow-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Expenses
                </button>
              </div>
            </div>

            {/* Items Per Page Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="5">5 days</option>
                <option value="10">10 days</option>
                <option value="20">20 days</option>
                <option value="50">50 days</option>
              </select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, allDates.length)} of {allDates.length} days
            </div>
          </div>
        </div>

        {/* Page Totals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-green-600">KSh {pageTotals.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Total Mpesa</p>
            <p className="text-xl font-bold text-blue-600">KSh {pageTotals.totalMpesa.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">KSh {pageTotals.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600">Net Cash</p>
            <p className={`text-xl font-bold ${pageTotals.totalCashRemaining >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              KSh {pageTotals.totalCashRemaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Daily Reports */}
        <div className="space-y-4">
          {currentDates.map((date) => {
            const formattedDate = formatDate(date);
            const summary = getSummaryForDate(date);
            const sales = getSalesForDate(date);
            const expenses = getExpensesForDate(date);
            const isExpanded = expandedDays.has(date);

            return (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Day Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleDayExpansion(date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">{formattedDate}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {summary && (
                          <>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {sales.length} sales
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              KSh {(summary.totalRevenue || 0).toLocaleString()}
                            </span>
                          </>
                        )}
                        {expenses.length > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            {expenses.length} expenses
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Summary Badges */}
                      {summary && (
                        <div className="hidden sm:flex items-center space-x-3 text-sm">
                          <span className="text-green-600 font-medium">
                            Revenue: KSh {(summary.totalRevenue || 0).toLocaleString()}
                          </span>
                          <span className="text-red-600 font-medium">
                            Expenses: KSh {(summary.totalExpenses || 0).toLocaleString()}
                          </span>
                          <span className={`font-medium ${(summary.cashRemaining || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                            Cash: KSh {(summary.cashRemaining || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {/* View Mode Toggle for this day */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewMode('sales')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'sales'
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Sales Records ({sales.length})
                        </button>
                        <button
                          onClick={() => setViewMode('expenses')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'expenses'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Expenses ({expenses.length})
                        </button>
                      </div>
                    </div>

                    {/* Content based on view mode */}
                    <div className="p-6">
                      {viewMode === 'sales' ? (
                        sales.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity Sold
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
                                {sales.map((sale) => (
                                  <tr key={sale.$id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {sale.stockItemName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                      {sale.quantitySold}
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
                        )
                      ) : (
                        expenses.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
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
                                {expenses.map((expense) => (
                                  <tr key={expense.$id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {expense.description}
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
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {allDates.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {allDates.length} total days
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allDates.length === 0 && (
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