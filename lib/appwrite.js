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

export { ID, Query };