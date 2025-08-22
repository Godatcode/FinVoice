import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';
import { useThemeColor } from '../context/ThemeProvider';
import { useExpenses } from '../context/ExpenseContext';
import EditExpenseModal from './EditExpenseModal';
import ttsService from '../services/TTSService';

const ExpenseList = ({ maxItems = 5, onExpensePress, onAddExpensePress }) => {
  const { expenses, defaultCategories, selectedCurrencySign, updateExpense, deleteExpense, getCategoryInfo, formatExpenseDate } = useExpenses();
  const { text, background, primary, secondary, card, error, success } = useThemeColor();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

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

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setEditModalVisible(true);
  };

  const handleDeleteExpense = async (expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}" (${selectedCurrencySign}${expense.amount})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(expense.id);
            await ttsService.speak(`Expense deleted successfully. ${expense.description} removed.`);
          }
        }
      ]
    );
  };

  const handleSaveExpense = async (updatedExpense) => {
    await updateExpense(updatedExpense.id, updatedExpense);
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
              Use voice input or tap the button below to add your first expense
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddButton, { backgroundColor: primary }]}
              onPress={() => onAddExpensePress && onAddExpensePress()}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text style={[styles.emptyAddButtonText, { color: 'white' }]}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>Recent Expenses</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primary }]}
            onPress={() => onAddExpensePress && onAddExpensePress()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={[styles.addButtonText, { color: 'white' }]}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
                       {recentExpenses.map((expense) => {
                 const categoryInfo = getCategoryInfo(expense.category);
                 
                 return (
                   <View key={expense.id} style={styles.expenseCard}>
                     <TouchableOpacity
                       style={styles.expenseContent}
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
                           {formatExpenseDate(expense.date)}
                         </Text>
                       </View>
                     </TouchableOpacity>
                     
                     {/* Action Buttons */}
                     <View style={styles.expenseActions}>
                       <TouchableOpacity
                         style={[styles.actionButton, { backgroundColor: primary + '20' }]}
                         onPress={() => handleEditExpense(expense)}
                       >
                         <MaterialCommunityIcons
                           name="pencil"
                           size={16}
                           color={primary}
                         />
                       </TouchableOpacity>
                       
                       <TouchableOpacity
                         style={[styles.actionButton, { backgroundColor: error + '20' }]}
                         onPress={() => handleDeleteExpense(expense)}
                       >
                         <MaterialCommunityIcons
                           name="delete"
                           size={16}
                           color={error}
                         />
                       </TouchableOpacity>
                     </View>
                   </View>
                 );
               })}
      </ScrollView>
      
      {/* Edit Expense Modal */}
      <EditExpenseModal
        visible={editModalVisible}
        expense={selectedExpense}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveExpense}
      />
      
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 24,
  },
  expenseCard: {
    width: 180,
    backgroundColor: '#333',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseContent: {
    padding: 16,
  },
  expenseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  emptyAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExpenseList;
