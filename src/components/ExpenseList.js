import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';
import { useThemeColor } from '../context/ThemeProvider';
import { useExpenses } from '../context/ExpenseContext';

const ExpenseList = ({ maxItems = 5, onExpensePress }) => {
  const { expenses, defaultCategories, selectedCurrencySign } = useExpenses();
  const { text, background, primary, secondary, card } = useThemeColor();

  // Add error boundary for context
  if (!expenses || !defaultCategories || !selectedCurrencySign) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <Text style={[styles.emptyTitle, { color: text }]}>
              Loading expenses...
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  const getCategoryInfo = (categoryId) => {
    return defaultCategories.find(cat => cat.id === categoryId) || {
      name: 'Other',
      icon: 'help-circle',
      color: secondary
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const recentExpenses = expenses.slice(0, maxItems);

  if (recentExpenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons
              name="microphone-outline"
              size={48}
              color={secondary}
            />
            <Text style={[styles.emptyTitle, { color: text }]}>
              No expenses yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: secondary }]}>
              Use voice input to add your first expense
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>Recent Expenses</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {recentExpenses.map((expense) => {
          const categoryInfo = getCategoryInfo(expense.category);
          
          return (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              onPress={() => onExpensePress && onExpensePress(expense)}
            >
              <View style={styles.expenseHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
                  <MaterialCommunityIcons
                    name={categoryInfo.icon}
                    size={20}
                    color={categoryInfo.color}
                  />
                </View>
                <Text style={[styles.expenseAmount, { color: text }]}>
                  {selectedCurrencySign}{expense.amount}
                </Text>
              </View>
              
              <Text style={[styles.expenseDescription, { color: text }]} numberOfLines={2}>
                {expense.description}
              </Text>
              
              <View style={styles.expenseFooter}>
                <Text style={[styles.categoryName, { color: secondary }]}>
                  {categoryInfo.name}
                </Text>
                <Text style={[styles.expenseDate, { color: secondary }]}>
                  {formatDate(expense.date)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 24,
  },
  expenseCard: {
    width: 160,
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
    flex: 1,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 11,
    opacity: 0.8,
  },
  emptyContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExpenseList;
