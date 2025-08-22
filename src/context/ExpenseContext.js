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
    // Enhanced parsing logic for voice input
    const text = voiceText.toLowerCase();
    
    // Extract amount (look for numbers with currency context)
    const amountPatterns = [
      /(\d+(?:\.\d{2})?)\s*(?:rupees?|rs|₹|inr)/i,
      /(\d+(?:\.\d{2})?)\s*(?:dollars?|\$|usd)/i,
      /(\d+(?:\.\d{2})?)\s*(?:euros?|€|eur)/i,
      /(\d+(?:\.\d{2})?)/  // fallback to any number
    ];
    
    let amount = null;
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = parseFloat(match[1]);
        break;
      }
    }
    
    // Extract category based on enhanced keywords
    let category = 'other';
    let description = voiceText;
    
    // Food & Dining
    if (text.includes('food') || text.includes('dinner') || text.includes('lunch') || 
        text.includes('breakfast') || text.includes('restaurant') || text.includes('meal') ||
        text.includes('coffee') || text.includes('snack') || text.includes('pizza') ||
        text.includes('burger') || text.includes('chicken') || text.includes('rice')) {
      category = 'foodDining';
    }
    // Transportation
    else if (text.includes('transport') || text.includes('uber') || text.includes('taxi') || 
             text.includes('fuel') || text.includes('gas') || text.includes('petrol') ||
             text.includes('bus') || text.includes('train') || text.includes('metro') ||
             text.includes('parking') || text.includes('toll')) {
      category = 'transportation';
    }
    // Entertainment
    else if (text.includes('movie') || text.includes('entertainment') || text.includes('game') || 
             text.includes('concert') || text.includes('show') || text.includes('theater') ||
             text.includes('party') || text.includes('outing') || text.includes('fun')) {
      category = 'entertainment';
    }
    // Utilities
    else if (text.includes('bill') || text.includes('electricity') || text.includes('water') || 
             text.includes('internet') || text.includes('phone') || text.includes('mobile') ||
             text.includes('gas bill') || text.includes('maintenance')) {
      category = 'utilities';
    }
    // Shopping
    else if (text.includes('shopping') || text.includes('clothes') || text.includes('book') || 
             text.includes('grocery') || text.includes('store') || text.includes('mall') ||
             text.includes('shirt') || text.includes('pants') || text.includes('shoes')) {
      category = 'shopping';
    }
    // Healthcare
    else if (text.includes('doctor') || text.includes('medicine') || text.includes('health') || 
             text.includes('medical') || text.includes('hospital') || text.includes('pharmacy') ||
             text.includes('medicine') || text.includes('treatment')) {
      category = 'healthcare';
    }
    // Education
    else if (text.includes('course') || text.includes('book') || text.includes('education') || 
             text.includes('training') || text.includes('school') || text.includes('college') ||
             text.includes('university') || text.includes('study')) {
      category = 'education';
    }
    // Travel
    else if (text.includes('travel') || text.includes('flight') || text.includes('hotel') || 
             text.includes('vacation') || text.includes('trip') || text.includes('journey') ||
             text.includes('booking') || text.includes('reservation')) {
      category = 'travel';
    }
    
    // Clean up description (remove amount and common words)
    let cleanDescription = voiceText;
    if (amount) {
      cleanDescription = voiceText.replace(new RegExp(`${amount}\\s*(?:rupees?|rs|₹|inr|dollars?|\\$|usd|euros?|€|eur)?`, 'gi'), '').trim();
    }
    
    // Remove common filler words
    const fillerWords = ['add', 'expense', 'for', 'of', 'the', 'a', 'an', 'and', 'or', 'but'];
    cleanDescription = cleanDescription
      .split(' ')
      .filter(word => !fillerWords.includes(word.toLowerCase()))
      .join(' ')
      .trim();
    
    // If description is empty after cleaning, use original
    if (!cleanDescription) {
      cleanDescription = voiceText;
    }
    
    return {
      amount,
      description: cleanDescription || voiceText,
      category,
      isValid: amount !== null && cleanDescription.length > 0
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
    // Helper functions for UI
    formatExpenseDate: (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return date.toLocaleDateString();
    },
    getCategoryInfo: (categoryId) => {
      return defaultCategories.find(cat => cat.id === categoryId) || {
        name: 'Other',
        icon: 'help-circle',
        color: '#6B46C1'
      };
    }
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
