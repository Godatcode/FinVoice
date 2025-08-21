import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCurrency } from '../../context/CurrencyContext';
import { useThemeColor } from "../../context/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Card } from "../../components/Card";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  const { background, text, card } = useThemeColor();
  const { changeCurrencySign, selectedCurrencySign } = useCurrency();
  const { t } = useTranslation();

  const currencyOptions = [
    { code: 'USD', symbol: '$', labelKey: 'changeToUSD', icon: 'currency-usd' },
    { code: 'EUR', symbol: '€', labelKey: 'changeToEUR', icon: 'currency-eur' },
    { code: 'INR', symbol: '₹', labelKey: 'changeToINR', icon: 'currency-inr' },
    { code: 'GBP', symbol: '£', labelKey: 'changeToGBP', icon: 'currency-gbp' },
    { code: 'JPY', symbol: '¥', labelKey: 'changeToJPY', icon: 'currency-jpy' },
  ];

  const handleCurrencyChange = (currency) => {
    changeCurrencySign(currency);
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.headerText, { color: text }]}>
        {t('selectedCurrencySign')} <Text style={styles.bold}>{selectedCurrencySign}</Text>
      </Text>

      <View style={styles.currencyList}>
        {currencyOptions.map((currency) => (
          <Card key={currency.code} style={styles.currencyCard}>
            <TouchableOpacity
              style={styles.currencyButton}
              onPress={() => handleCurrencyChange(currency.code)}
            >
              <MaterialCommunityIcons name={currency.icon} size={24} color={text} style={styles.currencyIcon} />
              <Text style={[styles.currencyText, { color: text, flex: 1 }]}>
                {t(currency.labelKey)} ({currency.symbol})
              </Text>
              {selectedCurrencySign === currency.code && (
                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  currencyList: {
    width: '100%',
  },
  currencyCard: {
    marginVertical: 8,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  currencyIcon: {
    marginRight: 15,
  },
  currencyText: {
    fontSize: 18,
    color: '#333',
  },
});
