// lib/appwrite.js
import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection IDs - Make sure these match what you have in Appwrite
export const STOCK_COLLECTION_ID = 'stock';
export const DAILY_SALES_COLLECTION_ID = 'sales';
export const DAILY_SUMMARIES_COLLECTION_ID = 'daily_summaries';
export const EXPENSES_COLLECTION_ID = 'expenses';

// Query helper functions with limits
export const QueryHelpers = {
  // Default query with limit
  default: () => [Query.limit(100)],
  
  // For paginated results
  paginated: (limit = 100, offset = 0) => [
    Query.limit(limit),
    Query.offset(offset)
  ],
  
  // For recent records (e.g., recent sales)
  recent: (limit = 100) => [
    Query.orderDesc('$createdAt'),
    Query.limit(limit)
  ],
  
  // For today's records
  today: () => [
    Query.greaterThan('$createdAt', new Date().toISOString().split('T')[0]),
    Query.limit(100)
  ]
};

// Common database operations with built-in limits
export const DatabaseHelpers = {
  // Get all stock items with limit
  getStock: async () => {
    return await databases.listDocuments(
      DATABASE_ID,
      STOCK_COLLECTION_ID,
      [Query.limit(100)]
    );
  },
  
  // Get recent sales with limit
  getRecentSales: async (limit = 100) => {
    return await databases.listDocuments(
      DATABASE_ID,
      DAILY_SALES_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]
    );
  },
  
  // Get daily summaries with limit
  getDailySummaries: async (limit = 100) => {
    return await databases.listDocuments(
      DATABASE_ID,
      DAILY_SUMMARIES_COLLECTION_ID,
      [
        Query.orderDesc('date'),
        Query.limit(limit)
      ]
    );
  },
  
  // Get expenses with limit
  getExpenses: async (limit = 100) => {
    return await databases.listDocuments(
      DATABASE_ID,
      EXPENSES_COLLECTION_ID,
      [Query.limit(limit)]
    );
  }
};

export { ID, Query };