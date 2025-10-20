// components/StockList.js
'use client';
import { useApp } from '../context/AppContext';

export default function StockList() {
  const { state } = useApp();

  // Calculate profit margin for each item
  const stockWithProfit = state.stock.map(item => ({
    ...item,
    profitMargin: item.sellingPrice - item.buyingPrice,
    profitPercentage: ((item.sellingPrice - item.buyingPrice) / item.buyingPrice * 100).toFixed(1)
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Current Stock</h2>
        <span className="text-sm text-gray-500">
          Total Items: {state.stock.length}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buy Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sell Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Margin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stockWithProfit.map((item, index) => (
              <tr 
                key={item.$id} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">{item.quantity}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">KSh {item.buyingPrice?.toLocaleString()}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">KSh {item.sellingPrice?.toLocaleString()}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      item.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      KSh {item.profitMargin?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.profitPercentage}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.quantity === 0 
                      ? 'bg-red-100 text-red-800' 
                      : item.quantity <= 10 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.quantity === 0 
                      ? 'Out of Stock' 
                      : item.quantity <= 10 
                      ? 'Low Stock' 
                      : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {state.stock.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No stock items available</p>
            <p className="text-gray-400 text-sm mt-1">Add your first stock item using the form</p>
          </div>
        )}
      </div>

      {/* Stock Summary */}
      {state.stock.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-900">Total Items</div>
            <div className="text-2xl font-bold text-blue-600">{state.stock.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Total Quantity</div>
            <div className="text-2xl font-bold text-green-600">
              {state.stock.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-medium text-purple-900">Low Stock Items</div>
            <div className="text-2xl font-bold text-purple-600">
              {state.stock.filter(item => item.quantity <= 10 && item.quantity > 0).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}