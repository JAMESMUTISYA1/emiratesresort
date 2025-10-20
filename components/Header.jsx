// components/Header.js
'use client';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useApp();

  // Calculate quick stats for the header
  const totalStockItems = state.stock.length;
  const totalStockValue = state.stock.reduce((sum, item) => sum + (item.quantity * item.buyingPrice), 0);
  const lowStockItems = state.stock.filter(item => item.quantity <= 10 && item.quantity > 0).length;

 // components/Header.js (Update navigation array)
const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Stocks', path: '/stocks', icon: '📦' },
  { name: 'Sales', path: '/sales', icon: '💰' },
  { name: 'Reports', path: '/reports', icon: '📋' }, // Add this line
  { name: 'Analysis', path: '/analysis', icon: '📈' },
];

  const isActivePath = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navigateTo = (path) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-yellow-400">
      {/* Top Stats Bar */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
                <span>Items: {totalStockItems}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"/>
                </svg>
                <span>Low Stock: {lowStockItems}</span>
              </div>
            </div>
            <div className="text-sm font-medium">
              Stock Value: KSh {totalStockValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Stock<span className="text-yellow-500">Manager</span>
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">Smart Inventory & Sales Tracking</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  isActivePath(item.path)
                    ? 'bg-yellow-400 text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-yellow-400 text-gray-900 p-2 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`flex items-center w-full text-left px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}