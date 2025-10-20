// app/page.js
'use client';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
    </div>
  );
}