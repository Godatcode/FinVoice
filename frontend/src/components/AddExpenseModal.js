import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from '../context/ThemeProvider';
import { useExpenses } from '../context/ExpenseContext';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import ttsService from '../services/TTSService';

const AddExpenseModal = ({ visible, onClose, onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { text, background, primary, secondary, card, error, success } = useThemeColor();
  const { defaultCategories, selectedCurrencySign, addExpense } = useExpenses();
  const { user, isLocalUser } = useContext(UserContext);

  const handleSave = async () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const newExpense = await addExpense({
        amount: numericAmount,
        description: description.trim(),
        category: selectedCategory,
      });

      // TTS feedback
      await ttsService.speak(`Expense added successfully. ${description} for ${numericAmount} rupees in ${selectedCategory} category.`);

      // Reset form
      setAmount('');
      setDescription('');
      setSelectedCategory('');

      // Notify parent component
      if (onExpenseAdded) {
        onExpenseAdded(newExpense);
      }

      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', error.message || 'Failed to add expense. Please try again.');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    onClose();
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: text }]}>Add New Expense</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Warning for local users */}
            {isLocalUser() && (
              <View style={[styles.warningContainer, { backgroundColor: error + '20', borderColor: error }]}>
                <MaterialCommunityIcons name="wifi-off" size={20} color={error} />
                <Text style={[styles.warningText, { color: error }]}>
                  You are in offline mode. Expenses will be saved locally only.
                </Text>
              </View>
            )}
            
            {/* Amount Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: text }]}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={[styles.currencySymbol, { color: primary }]}>
                  {selectedCurrencySign}
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: text, borderColor: primary }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={secondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: text }]}>Description</Text>
              <TextInput
                style={[styles.textInput, { color: text, borderColor: primary }]}
                value={description}
                onChangeText={setDescription}
                placeholder="What did you spend on?"
                placeholderTextColor={secondary}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: text }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {defaultCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: card },
                      selectedCategory === category.id && { backgroundColor: primary }
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={24}
                      color={selectedCategory === category.id ? 'white' : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: selectedCategory === category.id ? 'white' : text }
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: secondary }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: secondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: 'white' }]}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    padding: 0,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
});

export default AddExpenseModal;
