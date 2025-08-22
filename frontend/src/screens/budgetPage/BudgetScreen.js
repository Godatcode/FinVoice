import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import ttsService from '../../services/TTSService';
import { useThemeColor } from '../../context/ThemeProvider';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { budgetAPI } from '../../services/apiService';
import { UserContext } from '../../context/UserContext';

const BUDGET_STORAGE_KEY = 'userBudgetData';

export default function BudgetScreen() {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  const initialBudget = {
    total: '',
    spent: '0.00',
    categories: [
      { name: 'foodDining', budgeted: '', spent: '0.00' },
      { name: 'transportation', budgeted: '', spent: '0.00' },
      { name: 'entertainment', budgeted: '', spent: '0.00' },
      { name: 'utilities', budgeted: '', spent: '0.00' },
      { name: 'shopping', budgeted: '', spent: '0.00' },
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
      if (user && user.id && !user.id.startsWith('local_')) {
        // Only load from backend if user has a real Supabase ID
        try {
          const storedBudget = await budgetAPI.getAll();
          if (storedBudget && storedBudget.length > 0) {
            // Get the most recent budget
            const latestBudget = storedBudget[0];
            
            // Convert backend format to frontend format
            const categories = [];
            if (latestBudget.categories && typeof latestBudget.categories === 'object') {
              Object.keys(latestBudget.categories).forEach(catName => {
                const catData = latestBudget.categories[catName];
                categories.push({
                  name: catName,
                  budgeted: catData.budgeted?.toString() || '0.00',
                  spent: catData.spent?.toString() || '0.00'
                });
              });
            }
            
            setBudgetData({
              total: latestBudget.total_amount?.toString() || '5000.00',
              spent: categories.reduce((sum, cat) => sum + parseFloat(cat.spent || 0), 0).toString(),
              categories: categories.length > 0 ? categories : initialBudget.categories
            });
          } else {
            setBudgetData(initialBudget);
          }
        } catch (backendError) {
          console.error('Error loading budget from backend:', backendError);
          setBudgetData(initialBudget);
        }
      } else {
        // For local users, just use initial budget
        console.log('💾 Using local budget data (user has local session)');
        setBudgetData(initialBudget);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      setBudgetData(initialBudget);
    }
  };

  const saveBudget = async (data) => {
    try {
      if (user && user.id && !user.id.startsWith('local_')) {
        // Only save to backend if user has a real Supabase ID
        const currentDate = new Date();
        const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        await budgetAPI.create({
          month_year: monthYear,
          total_amount: parseFloat(data.total) || 0,
          categories: data.categories.reduce((acc, cat) => {
            acc[cat.name] = {
              budgeted: parseFloat(cat.budgeted) || 0,
              spent: parseFloat(cat.spent) || 0
            };
            return acc;
          }, {})
        });
        
        console.log('✅ Budget saved to backend successfully');
      } else {
        // For local users, just show success (data is already in state)
        console.log('💾 Budget saved locally (user has local session)');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      
      // If it's a network/backend error, still continue
      if (error.message.includes('Network') || error.message.includes('HTTP')) {
        console.log('💾 Backend unavailable, budget saved locally');
        return; // Don't throw error for network issues
      }
      
      throw error;
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
    
    // Calculate total spent from all categories
    const totalSpent = updatedCategories.reduce((sum, cat) => sum + parseFloat(cat.spent || 0), 0);
    
    setBudgetData(prev => ({ 
      ...prev, 
      categories: updatedCategories,
      spent: totalSpent.toFixed(2)
    }));
  };

  const handleSaveBudget = async () => {
    try {
      // Validate budget data
      if (!budgetData.total || parseFloat(budgetData.total) <= 0) {
        Alert.alert('Error', 'Please enter a valid total budget amount.');
        return;
      }

      // Check if at least one category has a budget
      const hasCategoryBudget = budgetData.categories.some(cat => 
        cat.budgeted && parseFloat(cat.budgeted) > 0
      );

      if (!hasCategoryBudget) {
        Alert.alert('Error', 'Please set budgets for at least one category.');
        return;
      }

      await saveBudget(budgetData);
      
      // TTS feedback
      await ttsService.speak('Budget saved successfully. Navigating to insights.');
      
      navigation.navigate('Insights', { budgetData });
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    }
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
                style={[styles.summarySpentInput, { color: text }]}
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
                    editable={false}
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
  summarySpentInput: {
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
    backgroundColor: '#333',
  },

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
