import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BUDGET_STORAGE_KEY = 'userBudgetData';

import { useThemeColor } from '../../context/ThemeProvider';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';

export default function BudgetScreen() {
  const { t } = useTranslation();

  const initialBudget = {
    total: '5000.00',
    spent: '3240.50',
    categories: [
      { name: 'foodDining', budgeted: '1200.00', spent: '900.00' },
      { name: 'transportation', budgeted: '600.00', spent: '350.00' },
      { name: 'entertainment', budgeted: '1600.00', spent: '500.00' },
      { name: 'utilities', budgeted: '400.00', spent: '300.00' },
      { name: 'shopping', budgeted: '800.00', spent: '550.00' },
    ],
  };

  const { selectedCurrencySign } = useCurrency();
  const { text, background, primary, warning, error, secondary } = useThemeColor();
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();

  const [budgetData, setBudgetData] = useState(initialBudget);

  const remaining = (parseFloat(budgetData.total) - parseFloat(budgetData.spent)).toFixed(2);

  const chartData = {
    labels: budgetData.categories.map(cat => t(cat.name)),
    datasets: [
      {
        data: budgetData.categories.map(cat => parseFloat(cat.spent)),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: background,
    backgroundGradientFrom: background,
    backgroundGradientTo: background,
    decimalPlaces: 0,
    color: (opacity = 1) => primary,
    labelColor: (opacity = 0.8) => secondary,
    barPercentage: 0.6,
    style: {
      borderRadius: 8,
    },
    propsForLabels: {
      fontSize: 10,
    },
    yAxisSuffix: ` ${selectedCurrencySign}`,
    yAxisInterval: 1000,
  };

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const storedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (storedBudget) {
        setBudgetData(JSON.parse(storedBudget));
      } else {
        setBudgetData(initialBudget);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      setBudgetData(initialBudget);
    }
  };

  const saveBudget = async (data) => {
    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleTotalBudgetChange = (newBudget) => {
    setBudgetData(prev => ({ ...prev, total: newBudget }));
  };

  const handleSpentChange = (newSpent) => {
    setBudgetData(prev => ({ ...prev, spent: newSpent }));
  };

  const handleCategoryBudgetChange = (index, newBudget) => {
    const updatedCategories = [...budgetData.categories];
    updatedCategories[index].budgeted = newBudget;
    setBudgetData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleCategorySpentChange = (index, newSpent) => {
    const updatedCategories = [...budgetData.categories];
    updatedCategories[index].spent = newSpent;
    setBudgetData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleSaveBudget = () => {
    saveBudget(budgetData);
    navigation.navigate('Insights', { budgetData });
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: text }]}>{t('editmonthlybudget')}</Text>
          <Text style={[styles.subtitle, { color: secondary }]}>{t('april')} 2025</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: secondary }]}>{t('budgetLabel')}</Text>
              <TextInput
                style={[styles.summaryInput, { color: text }]}
                value={budgetData.total}
                onChangeText={handleTotalBudgetChange}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: secondary }]}>{t('spentLabel')}</Text>
              <TextInput
                style={[styles.summaryInput, { color: text }]}
                value={budgetData.spent}
                onChangeText={handleSpentChange}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: secondary }]}>{t('remainingLabel')}</Text>
              <Text style={[styles.summaryAmount, { color: primary }]}>{selectedCurrencySign}{remaining}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>{t('spendingbreakdown')}</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={chartData}
              width={screenWidth - 48}
              height={200}
              chartConfig={chartConfig}
              style={{
                marginVertical: 8,
                alignSelf: 'center',
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>{t('categories')}</Text>
          {budgetData.categories.map((category, index) => (
            <View style={styles.categoryCard} key={index}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, { color: text }]}>{t(category.name)}</Text>
                <View style={styles.categoryAmountContainer}>
                  <Text style={[styles.categoryAmountLabel, { color: secondary }]}>{t('budgetLabel')}:</Text>
                  <TextInput
                    style={[styles.categoryBudgetInput, { color: text }]}
                    value={category.budgeted}
                    onChangeText={(newBudget) => handleCategoryBudgetChange(index, newBudget)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      {
                        width: `${(parseFloat(category.budgeted) > 0 ? (parseFloat(category.spent) / parseFloat(category.budgeted)) : 0) * 100}%`,
                        backgroundColor: (parseFloat(category.spent) / parseFloat(category.budgeted) > 0.8 ? error : primary),
                      },
                    ]}
                  />
                </View>
                <View style={styles.spentInputContainer}>
                  <Text style={[styles.categorySpentLabel, { color: secondary }]}>{t('spentLabel')}:</Text>
                  <TextInput
                    style={[styles.categorySpentInput, { color: text }]}
                    value={category.spent}
                    onChangeText={(newSpent) => handleCategorySpentChange(index, newSpent)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: primary }]} onPress={handleSaveBudget}>
        <Icon name="check" size={24} color="white" />
        <Text style={styles.saveButtonText}>{t('saveBudget')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  summaryCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryInput: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    width: 90,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 40,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartCard: {
    borderRadius: 8,
    padding: 12,
  },
  categoryCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#333'},

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmountLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryBudgetInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: 80,
    textAlign: 'center',
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    height: 10,
    borderRadius: 5,
  },
  spentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categorySpentLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  categorySpentInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  
});
