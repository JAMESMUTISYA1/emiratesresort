// context/AppContext.js
'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { databases, DATABASE_ID, STOCK_COLLECTION_ID, DAILY_SALES_COLLECTION_ID, DAILY_SUMMARIES_COLLECTION_ID, EXPENSES_COLLECTION_ID, Query } from '../lib/appwrite';

const AppContext = createContext();

const initialState = {
  stock: [],
  dailySales: [],
  dailySummaries: [],
  expenses: [],
  loading: true, // Start with loading true
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_STOCK':
      return { ...state, stock: action.payload, loading: false };
    case 'SET_DAILY_SALES':
      return { ...state, dailySales: action.payload };
    case 'SET_DAILY_SUMMARIES':
      return { ...state, dailySummaries: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
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
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const fetchData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [stockRes, dailySalesRes, dailySummariesRes, expensesRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, DAILY_SALES_COLLECTION_ID, [
          Query.orderDesc('date')
        ]),
        databases.listDocuments(DATABASE_ID, DAILY_SUMMARIES_COLLECTION_ID, [
          Query.orderDesc('date')
        ]),
        databases.listDocuments(DATABASE_ID, EXPENSES_COLLECTION_ID, [
          Query.orderDesc('date')
        ])
      ]);

      console.log('Fetched stock data:', stockRes.documents); // Debug log
      
      dispatch({ type: 'SET_STOCK', payload: stockRes.documents });
      dispatch({ type: 'SET_DAILY_SALES', payload: dailySalesRes.documents });
      dispatch({ type: 'SET_DAILY_SUMMARIES', payload: dailySummariesRes.documents });
      dispatch({ type: 'SET_EXPENSES', payload: expensesRes.documents });
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, fetchData }}>
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