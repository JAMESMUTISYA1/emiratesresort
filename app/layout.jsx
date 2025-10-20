// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StockManager - Smart Inventory & Sales Tracking',
  description: 'Manage your daily stock, sales, and expenses efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}