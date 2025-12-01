// context/AppContext.js
'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { databases, DATABASE_ID, STOCK_COLLECTION_ID, DAILY_SALES_COLLECTION_ID, DAILY_SUMMARIES_COLLECTION_ID, EXPENSES_COLLECTION_ID, Query, DatabaseHelpers } from '../lib/appwrite';

const AppContext = createContext();

const initialState = {
  stock: [],
  dailySales: [],
  dailySummaries: [],
  expenses: [],
  loading: true,
  error: null,
  hasMoreData: {
    stock: true,
    dailySales: true,
    dailySummaries: true,
    expenses: true
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_STOCK':
      return { 
        ...state, 
        stock: action.payload.documents || action.payload, 
        hasMoreData: { ...state.hasMoreData, stock: action.payload.total > (action.payload.documents?.length || action.payload.length) },
        loading: false 
      };
    case 'SET_DAILY_SALES':
      return { 
        ...state, 
        dailySales: action.payload.documents || action.payload,
        hasMoreData: { ...state.hasMoreData, dailySales: action.payload.total > (action.payload.documents?.length || action.payload.length) }
      };
    case 'SET_DAILY_SUMMARIES':
      return { 
        ...state, 
        dailySummaries: action.payload.documents || action.payload,
        hasMoreData: { ...state.hasMoreData, dailySummaries: action.payload.total > (action.payload.documents?.length || action.payload.length) }
      };
    case 'SET_EXPENSES':
      return { 
        ...state, 
        expenses: action.payload.documents || action.payload,
        hasMoreData: { ...state.hasMoreData, expenses: action.payload.total > (action.payload.documents?.length || action.payload.length) }
      };
    case 'ADD_STOCK':
      return { ...state, stock: [...state.stock, action.payload] };
    case 'UPDATE_STOCK':
      return {
        ...state,
        stock: state.stock.map(item => 
          item.$id === action.payload.$id ? action.payload : item
        )
      };
    case 'DELETE_STOCK':
      return {
        ...state,
        stock: state.stock.filter(item => item.$id !== action.payload)
      };
    case 'ADD_MORE_STOCK':
      return {
        ...state,
        stock: [...state.stock, ...action.payload.documents],
        hasMoreData: { ...state.hasMoreData, stock: action.payload.total > (state.stock.length + action.payload.documents.length) }
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const QUERY_LIMIT = 50; // Adjust based on your needs

  const fetchData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [stockRes, dailySalesRes, dailySummariesRes, expensesRes] = await Promise.all([
        // Using Query.limit for all queries
        databases.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID, [
          Query.limit(QUERY_LIMIT)
        ]),
        databases.listDocuments(DATABASE_ID, DAILY_SALES_COLLECTION_ID, [
          Query.orderDesc('date'),
          Query.limit(QUERY_LIMIT)
        ]),
        databases.listDocuments(DATABASE_ID, DAILY_SUMMARIES_COLLECTION_ID, [
          Query.orderDesc('date'),
          Query.limit(QUERY_LIMIT)
        ]),
        databases.listDocuments(DATABASE_ID, EXPENSES_COLLECTION_ID, [
          Query.orderDesc('date'),
          Query.limit(QUERY_LIMIT)
        ])
      ]);

      console.log(`Fetched ${stockRes.documents.length} stock items`); // Debug log
      
      dispatch({ type: 'SET_STOCK', payload: stockRes });
      dispatch({ type: 'SET_DAILY_SALES', payload: dailySalesRes });
      dispatch({ type: 'SET_DAILY_SUMMARIES', payload: dailySummariesRes });
      dispatch({ type: 'SET_EXPENSES', payload: expensesRes });
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Function to load more data for pagination
  const loadMoreData = async (collectionType) => {
    try {
      let query = [Query.limit(QUERY_LIMIT)];
      
      // Add offset based on current data length
      const currentLength = {
        stock: state.stock.length,
        dailySales: state.dailySales.length,
        dailySummaries: state.dailySummaries.length,
        expenses: state.expenses.length
      }[collectionType];
      
      query.push(Query.offset(currentLength));
      
      // Add ordering for specific collections
      if (collectionType !== 'stock') {
        query.push(Query.orderDesc('date'));
      }

      const collectionId = {
        stock: STOCK_COLLECTION_ID,
        dailySales: DAILY_SALES_COLLECTION_ID,
        dailySummaries: DAILY_SUMMARIES_COLLECTION_ID,
        expenses: EXPENSES_COLLECTION_ID
      }[collectionType];

      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        query
      );

      dispatch({ 
        type: collectionType === 'stock' ? 'ADD_MORE_STOCK' : `SET_${collectionType.toUpperCase()}`,
        payload: response
      });
      
      return response;
    } catch (error) {
      console.error(`Error loading more ${collectionType}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      fetchData,
      loadMoreData,
      QUERY_LIMIT 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}