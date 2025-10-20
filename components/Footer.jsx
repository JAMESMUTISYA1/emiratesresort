// components/Footer.js
'use client';
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-600 to-green-700 text-white mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xl font-bold">StockManager</span>
            </div>
            <p className="text-green-100 text-sm">
              Smart inventory and sales management system for modern businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#dashboard" className="block text-green-100 hover:text-yellow-300 transition-colors">Dashboard</a>
              <a href="#stocks" className="block text-green-100 hover:text-yellow-300 transition-colors">Stock Management</a>
              <a href="#sales" className="block text-green-100 hover:text-yellow-300 transition-colors">Sales Tracking</a>
              <a href="#expenses" className="block text-green-100 hover:text-yellow-300 transition-colors">Expenses</a>
            </div>
          </div>

          {/* Contact/Info */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Built With</h3>
            <div className="space-y-2 text-green-100">
              <p>Next.js 15</p>
              <p>Tailwind CSS</p>
              <p>Appwrite</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-green-500 mt-8 pt-6 text-center">
          <p className="text-green-100 text-sm">
            &copy; 2024 StockManager. All rights reserved. Designed for efficiency and growth.
          </p>
        </div>
      </div>
    </footer>
  );
}