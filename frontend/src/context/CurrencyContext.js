import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/api';
import { profileAPI } from '../services/apiService';
import { UserContext } from './UserContext';

const currencySigns = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrencySign, setSelectedCurrencySign] = useState('₹'); 
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const loadCurrencyFromSupabase = async () => {
      try {
        // Load from Supabase profile if user is authenticated
        if (user && user.id) {
          try {
            const profile = await profileAPI.getProfile();
            if (profile && profile.currency) {
              const sign = currencySigns[profile.currency] || '₹';
              setSelectedCurrencySign(sign);
              console.log('✅ Currency loaded from Supabase profile:', profile.currency);
            } else {
              setSelectedCurrencySign('₹');
            }
          } catch (supabaseError) {
            console.warn('Failed to load currency from Supabase profile:', supabaseError);
            setSelectedCurrencySign('₹');
          }
        } else {
          setSelectedCurrencySign('₹');
        }
        
        setLoading(false);
      } catch (error) {
        console.log('Error loading currency sign:', error);
        setSelectedCurrencySign('₹');
        setLoading(false);
      }
    };

    loadCurrencyFromSupabase();
  }, [user]);

  const changeCurrencySign = async (currency) => {
    const sign = currencySigns[currency];
    setSelectedCurrencySign(sign);
    
    try {
      // Update Supabase profile if user is authenticated
      if (user && user.id) {
        try {
          await profileAPI.updateProfile({ currency });
          console.log('✅ Currency updated in Supabase profile:', currency);
        } catch (supabaseError) {
          console.error('Failed to update Supabase profile:', supabaseError);
          throw new Error('Failed to save currency preference. Please try again.');
        }
      } else {
        throw new Error('User not authenticated. Please log in.');
      }
    } catch (error) {
      console.error('Error saving currency:', error);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrencySign, changeCurrencySign, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
