// app/analysis/page.js
'use client';
import { useApp } from '../../context/AppContext';
import { useMemo } from 'react';

export default function AnalysisPage() {
  const { state } = useApp();

  // Calculate overall analysis data
  const totalRevenue = state.dailySummaries.reduce((sum, day) => sum + (day.totalRevenue || 0), 0);
  const totalExpenses = state.dailySummaries.reduce((sum, day) => sum + (day.totalExpenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalItemsSold = state.dailySales.reduce((sum, sale) => sum + (parseFloat(sale.quantitySold) || 0), 0);

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const months = {};
    
    state.dailySummaries.forEach(summary => {
      const date = new Date(summary.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!months[monthKey]) {
        months[monthKey] = {
          key: monthKey,
          name: monthName,
          revenue: 0,
          expenses: 0,
          profit: 0,
          days: 0,
          mpesa: 0,
          cashRemaining: 0
        };
      }
      
      months[monthKey].revenue += summary.totalRevenue || 0;
      months[monthKey].expenses += summary.totalExpenses || 0;
      months[monthKey].profit += (summary.totalRevenue || 0) - (summary.totalExpenses || 0);
      months[monthKey].mpesa += summary.totalMpesa || 0;
      months[monthKey].cashRemaining += summary.cashRemaining || 0;
      months[monthKey].days += 1;
    });

    // Sort months by key (newest first)
    return Object.values(months)
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 3); // Get last 3 months
  }, [state.dailySummaries]);

  // Get current month and previous months
  const currentMonth = monthlyData[0] || {};
  const previousMonth1 = monthlyData[1] || {};
  const previousMonth2 = monthlyData[2] || {};

  // Calculate growth percentages
  const revenueGrowth1 = previousMonth1.revenue ? 
    ((currentMonth.revenue - previousMonth1.revenue) / previousMonth1.revenue * 100) : 0;
  
  const revenueGrowth2 = previousMonth2.revenue ? 
    ((currentMonth.revenue - previousMonth2.revenue) / previousMonth2.revenue * 100) : 0;
  
  const profitGrowth1 = previousMonth1.profit ? 
    ((currentMonth.profit - previousMonth1.profit) / previousMonth1.profit * 100) : 0;
  
  const profitGrowth2 = previousMonth2.profit ? 
    ((currentMonth.profit - previousMonth2.profit) / previousMonth2.profit * 100) : 0;

  // Calculate profit margins
  const currentMargin = currentMonth.revenue ? (currentMonth.profit / currentMonth.revenue * 100) : 0;
  const previousMargin1 = previousMonth1.revenue ? (previousMonth1.profit / previousMonth1.revenue * 100) : 0;
  const previousMargin2 = previousMonth2.revenue ? (previousMonth2.profit / previousMonth2.revenue * 100) : 0;

  // Calculate average daily metrics
  const currentDailyRevenue = currentMonth.days ? (currentMonth.revenue / currentMonth.days) : 0;
  const currentDailyProfit = currentMonth.days ? (currentMonth.profit / currentMonth.days) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Analysis</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">KSh {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  KSh {totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-blue-600">{totalItemsSold.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💸</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">KSh {totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Profit Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Profit Analysis</h2>
          
          {/* Current Month Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Current Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-700">Revenue:</span>
                  <span className="font-bold text-green-800">KSh {currentMonth.revenue?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Expenses:</span>
                  <span className="font-bold text-red-600">KSh {currentMonth.expenses?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span className="text-purple-700 font-semibold">Profit:</span>
                  <span className={`font-bold text-lg ${currentMonth.profit >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                    KSh {currentMonth.profit?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className={`font-bold ${currentMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Days Recorded:</span>
                  <span>{currentMonth.days || 0} days</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Last Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-700">Revenue:</span>
                  <span className="font-bold text-blue-800">KSh {previousMonth1.revenue?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Expenses:</span>
                  <span className="font-bold text-red-600">KSh {previousMonth1.expenses?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-purple-700 font-semibold">Profit:</span>
                  <span className={`font-bold text-lg ${previousMonth1.profit >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                    KSh {previousMonth1.profit?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className={`font-bold ${previousMargin1 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {previousMargin1.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Growth vs Current:</span>
                  <span className={`font-medium ${revenueGrowth1 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth1 >= 0 ? '+' : ''}{revenueGrowth1.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">2 Months Ago</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Revenue:</span>
                  <span className="font-bold text-gray-800">KSh {previousMonth2.revenue?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Expenses:</span>
                  <span className="font-bold text-red-600">KSh {previousMonth2.expenses?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-purple-700 font-semibold">Profit:</span>
                  <span className={`font-bold text-lg ${previousMonth2.profit >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                    KSh {previousMonth2.profit?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className={`font-bold ${previousMargin2 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {previousMargin2.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Growth vs Current:</span>
                  <span className={`font-medium ${revenueGrowth2 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth2 >= 0 ? '+' : ''}{revenueGrowth2.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-sm text-gray-600 mb-1">Avg Daily Revenue</p>
              <p className="text-xl font-bold text-green-600">KSh {currentDailyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-sm text-gray-600 mb-1">Avg Daily Profit</p>
              <p className={`text-xl font-bold ${currentDailyProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                KSh {currentDailyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-sm text-gray-600 mb-1">Monthly M-Pesa</p>
              <p className="text-xl font-bold text-blue-600">KSh {currentMonth.mpesa?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-sm text-gray-600 mb-1">Cash Position</p>
              <p className={`text-xl font-bold ${currentMonth.cashRemaining >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                KSh {currentMonth.cashRemaining?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Revenue Trend</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current vs Last Month:</span>
                  <span className={`font-medium ${revenueGrowth1 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth1 >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth1).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current vs 2 Months Ago:</span>
                  <span className={`font-medium ${revenueGrowth2 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth2 >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth2).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">Profit Trend</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current vs Last Month:</span>
                  <span className={`font-medium ${profitGrowth1 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitGrowth1 >= 0 ? '↑' : '↓'} {Math.abs(profitGrowth1).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current vs 2 Months Ago:</span>
                  <span className={`font-medium ${profitGrowth2 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitGrowth2 >= 0 ? '↑' : '↓'} {Math.abs(profitGrowth2).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analysis Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
            <div className="space-y-3">
              {state.dailySales
                .reduce((acc, sale) => {
                  const existing = acc.find(item => item.name === sale.stockItemName);
                  if (existing) {
                    existing.quantity += parseFloat(sale.quantitySold) || 0;
                    existing.revenue += sale.totalRevenue || 0;
                  } else {
                    acc.push({
                      name: sale.stockItemName,
                      quantity: parseFloat(sale.quantitySold) || 0,
                      revenue: sale.totalRevenue || 0
                    });
                  }
                  return acc;
                }, [])
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-sm text-gray-500">KSh {item.revenue.toLocaleString()}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {item.quantity.toFixed(1)} sold
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {state.dailySummaries.slice(0, 5).map((summary) => (
                <div key={summary.$id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="text-sm text-gray-600">{summary.date}</span>
                    <p className="text-xs text-gray-500">
                      Profit: KSh {((summary.totalRevenue || 0) - (summary.totalExpenses || 0)).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-medium text-green-600">KSh {summary.totalRevenue?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}