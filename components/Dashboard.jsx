// app/page.js
'use client';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Update greeting based on time of day
  useEffect(() => {
    const hour = currentDate.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [currentDate]);

  // Calculate dashboard stats
  const totalStockItems = state.stock?.length || 0;
  const totalStockValue = state.stock?.reduce((sum, item) => sum + (item.quantity * item.buyingPrice), 0) || 0;
  const lowStockItems = state.stock?.filter(item => item.quantity <= 10 && item.quantity > 0).length || 0;
  const outOfStockItems = state.stock?.filter(item => item.quantity === 0).length || 0;
  
  const todaySummary = state.dailySummaries?.find(summary => 
    summary.date === currentDate.toISOString().split('T')[0]
  );
  
  const totalRevenue = state.dailySummaries?.reduce((sum, day) => sum + (day.totalRevenue || 0), 0) || 0;
  const totalProfit = state.dailySummaries?.reduce((sum, day) => sum + (day.profit || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold">ER</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Emirates Resort</h1>
                <p className="text-gray-600">Business Management Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {greeting}! <span className="text-emerald-600">Welcome Back</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your inventory, track sales, and monitor expenses in one beautiful dashboard
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stock Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock Items</p>
                <p className="text-3xl font-bold text-emerald-600">{totalStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-4 text-xs">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">Out: {outOfStockItems}</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Low: {lowStockItems}</span>
            </div>
          </div>

          {/* Stock Value */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                <p className="text-3xl font-bold text-amber-600">KSh {totalStockValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Current inventory worth</div>
          </div>

          {/* Today's Performance */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-blue-600">
                  KSh {(todaySummary?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {todaySummary ? 'Updated today' : 'No sales today'}
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  KSh {totalProfit.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">All time business profit</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Section - Now spans full width */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/stocks" className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl text-center transition-colors duration-200 transform hover:scale-105">
                  <div className="text-2xl mb-2">📦</div>
                  <p className="font-semibold">Manage Stock</p>
                </a>
                <a href="/sales" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl text-center transition-colors duration-200 transform hover:scale-105">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="font-semibold">Record Sales</p>
                </a>
                <a href="/expenses" className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl text-center transition-colors duration-200 transform hover:scale-105">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="font-semibold">Add Expenses</p>
                </a>
                <a href="/analysis" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl text-center transition-colors duration-200 transform hover:scale-105">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="font-semibold">View Reports</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Business Insights */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:w-2/3 mb-6 lg:mb-0">
              <h3 className="text-2xl font-bold mb-4">Business Insights</h3>
              <p className="text-emerald-100 mb-4">
                Track your business performance with real-time analytics and comprehensive reports. 
                Make informed decisions to grow your resort business.
              </p>
              <div className="flex space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{state.dailySummaries?.length || 0}</p>
                  <p className="text-sm text-emerald-100">Business Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{state.dailySales?.length || 0}</p>
                  <p className="text-sm text-emerald-100">Sales Records</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{state.expenses?.length || 0}</p>
                  <p className="text-sm text-emerald-100">Expense Records</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 text-center lg:text-right">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <p className="text-sm mb-2">Ready to optimize?</p>
                <a 
                  href="/analysis" 
                  className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 inline-block"
                >
                  View Full Analysis
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Emirates Resort Management System • Built for Excellence
          </p>
        </div>
      </div>
    </div>
  );
}