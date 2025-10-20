// app/sales/page.js
'use client';
import SalesForm from '../../components/SalesForm';
import { useApp } from '../../context/AppContext';
import { useState, useMemo } from 'react';

export default function SalesPage() {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayCount, setDisplayCount] = useState(10); // Start with 10 days

  // Get daily sales for selected date
  const dailySales = state.dailySales.filter(sale => sale.date === selectedDate);
  const dailySummary = state.dailySummaries.find(summary => summary.date === selectedDate);

  // Get sorted daily summaries for display
  const sortedSummaries = useMemo(() => 
    state.dailySummaries.sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.dailySummaries]
  );

  // Get summaries to display based on current count
  const displayedSummaries = sortedSummaries.slice(0, displayCount);

  // Calculate totals for displayed summaries
  const displayTotals = useMemo(() => {
    return displayedSummaries.reduce((totals, summary) => ({
      totalRevenue: totals.totalRevenue + (summary.totalRevenue || 0),
      totalMpesa: totals.totalMpesa + (summary.totalMpesa || 0),
      totalExpenses: totals.totalExpenses + (summary.totalExpenses || 0),
      totalCashRemaining: totals.totalCashRemaining + (summary.cashRemaining || 0)
    }), {
      totalRevenue: 0,
      totalMpesa: 0,
      totalExpenses: 0,
      totalCashRemaining: 0
    });
  }, [displayedSummaries]);

  const handleViewMore = () => {
    if (displayCount === 10) {
      setDisplayCount(30); // 10 + 20 = 30
    } else if (displayCount === 30) {
      setDisplayCount(80); // 30 + 50 = 80
    } else {
      setDisplayCount(sortedSummaries.length); // Show all
    }
  };

  const canViewMore = displayCount < sortedSummaries.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SalesForm />
          </div>
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Today's Sales Records */}
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Daily Sales Records</h2>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">View Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Daily Summary */}
                {dailySummary && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-green-600">KSh {dailySummary.totalRevenue?.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Mpesa Total</p>
                      <p className="text-xl font-bold text-blue-600">KSh {dailySummary.totalMpesa?.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">KSh {dailySummary.totalExpenses?.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600">Cash Remaining</p>
                      <p className={`text-xl font-bold ${dailySummary.cashRemaining >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        KSh {dailySummary.cashRemaining?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sales Records Table */}
                {dailySales.length > 0 ? (
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
                            Total Sales
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
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No sales recorded for {selectedDate}</p>
                    <p className="text-gray-400 text-sm">Use the form to record today's sales</p>
                  </div>
                )}
              </div>

              {/* Daily Summaries Table */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                    Daily Sales Summaries ({displayedSummaries.length} of {sortedSummaries.length} days)
                  </h2>
                  {displayCount < sortedSummaries.length && (
                    <div className="text-sm text-gray-500">
                      Showing last {displayCount} days
                    </div>
                  )}
                </div>

                {sortedSummaries.length > 0 ? (
                  <>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Revenue
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mpesa Total
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Expenses
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cash Remaining
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {displayedSummaries.map((summary) => (
                            <tr 
                              key={summary.$id} 
                              className={
                                summary.date === selectedDate 
                                  ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                                  : 'hover:bg-gray-50'
                              }
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                <div className="flex items-center">
                                  {summary.date}
                                  {summary.date === selectedDate && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                                KSh {(summary.totalRevenue || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                                KSh {(summary.totalMpesa || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                                KSh {(summary.totalExpenses || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`font-semibold ${(summary.cashRemaining || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                  KSh {(summary.cashRemaining || 0).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Display Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                        <p className="text-lg font-bold text-green-600">
                          KSh {displayTotals.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium">Total Mpesa</p>
                        <p className="text-lg font-bold text-blue-600">
                          KSh {displayTotals.totalMpesa.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
                        <p className="text-lg font-bold text-red-600">
                          KSh {displayTotals.totalExpenses.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium">Net Cash</p>
                        <p className={`text-lg font-bold ${displayTotals.totalCashRemaining >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          KSh {displayTotals.totalCashRemaining.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* View More Button */}
                    {canViewMore && (
                      <div className="text-center">
                        <button
                          onClick={handleViewMore}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center mx-auto"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {displayCount === 10 ? 'View More (20 days)' : 
                           displayCount === 30 ? 'View More (50 days)' : 
                           'View All Days'}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          {sortedSummaries.length - displayCount} more days available
                        </p>
                      </div>
                    )}

                    {!canViewMore && sortedSummaries.length > 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          📊 Showing all {sortedSummaries.length} days of sales data
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">No sales summaries available</p>
                    <p className="text-gray-400 text-sm">Daily summaries will appear here after recording sales</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}