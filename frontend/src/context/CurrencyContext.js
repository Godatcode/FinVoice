import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    const loadCurrencySign = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('currencySign');
        if (savedCurrency) {
          setSelectedCurrencySign(savedCurrency);
        } else {
          setSelectedCurrencySign('$'); 
        }
        setLoading(false);
      } catch (error) {
        console.log('Error loading currency sign from AsyncStorage:', error);
        setLoading(false);
      }
    };

    loadCurrencySign();
  }, []);

  const changeCurrencySign = async (currency) => {
    const sign = currencySigns[currency];
    setSelectedCurrencySign(sign);
    await AsyncStorage.setItem('currencySign', sign); 
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrencySign, changeCurrencySign, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
