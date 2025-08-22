import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrencySign, setSelectedCurrencySign] = useState('₹'); // Default to INR
  const { t } = useTranslation();

  console.log('ExpenseProvider initialized with:', { selectedCurrencySign, loading });

  // Default expense categories that match your existing budget categories
  const defaultCategories = [
    { id: 'foodDining', name: 'Food & Dining', icon: 'food', color: '#FF6B6B' },
    { id: 'transportation', name: 'Transportation', icon: 'car', color: '#4ECDC4' },
    { id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#45B7D1' },
    { id: 'utilities', name: 'Utilities', icon: 'lightning-bolt', color: '#96CEB4' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#FFEAA7' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical-bag', color: '#DDA0DD' },
    { id: 'education', name: 'Education', icon: 'school', color: '#98D8C8' },
    { id: 'travel', name: 'Travel', icon: 'airplane', color: '#F7DC6F' },
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  // For now, use static default to avoid circular dependency
  // We can sync with currency context later when needed

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const addExpense = async (expenseData) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
    return newExpense;
  };

  const updateExpense = async (expenseId, updates) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === expenseId ? { ...expense, ...updates, updatedAt: new Date().toISOString() } : expense
    );
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const deleteExpense = async (expenseId) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const getExpensesByCategory = (categoryId) => {
    return expenses.filter(expense => expense.category === categoryId);
  };

  const getExpensesByDateRange = (startDate, endDate) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  const getExpensesByMonth = (month, year) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });
  };

  const getCategoryTotals = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += parseFloat(expense.amount);
      } else {
        categoryTotals[expense.category] = parseFloat(expense.amount);
      }
    });
    return categoryTotals;
  };

  const parseVoiceInput = (voiceText) => {
    // Basic parsing logic - can be enhanced with Gemini AI
    const text = voiceText.toLowerCase();
    
    // Extract amount (look for numbers)
    const amountMatch = text.match(/(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    // Extract category based on keywords
    let category = 'other';
    let description = voiceText;
    
    if (text.includes('food') || text.includes('dinner') || text.includes('lunch') || text.includes('breakfast') || text.includes('restaurant')) {
      category = 'foodDining';
    } else if (text.includes('transport') || text.includes('uber') || text.includes('taxi') || text.includes('fuel') || text.includes('gas')) {
      category = 'transportation';
    } else if (text.includes('movie') || text.includes('entertainment') || text.includes('game') || text.includes('concert')) {
      category = 'entertainment';
    } else if (text.includes('bill') || text.includes('electricity') || text.includes('water') || text.includes('internet')) {
      category = 'utilities';
    } else if (text.includes('shopping') || text.includes('clothes') || text.includes('book') || text.includes('grocery')) {
      category = 'shopping';
    } else if (text.includes('doctor') || text.includes('medicine') || text.includes('health') || text.includes('medical')) {
      category = 'healthcare';
    } else if (text.includes('course') || text.includes('book') || text.includes('education') || text.includes('training')) {
      category = 'education';
    } else if (text.includes('travel') || text.includes('flight') || text.includes('hotel') || text.includes('vacation')) {
      category = 'travel';
    }
    
    return {
      amount,
      description: voiceText,
      category,
      isValid: amount !== null
    };
  };

  const value = {
    expenses,
    loading,
    defaultCategories,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    getExpensesByDateRange,
    getTotalExpenses,
    getExpensesByMonth,
    getCategoryTotals,
    parseVoiceInput,
    selectedCurrencySign,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
