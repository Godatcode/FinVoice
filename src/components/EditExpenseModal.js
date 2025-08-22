import React, { useState, useEffect } from 'react';
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
import ttsService from '../services/TTSService';

const EditExpenseModal = ({ visible, expense, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { text, background, primary, secondary, card, error, success } = useThemeColor();
  const { defaultCategories, selectedCurrencySign } = useExpenses();

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setSelectedCategory(expense.category);
    }
  }, [expense]);

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

    const updatedExpense = {
      ...expense,
      amount: numericAmount,
      description: description.trim(),
      category: selectedCategory,
      updatedAt: new Date().toISOString(),
    };

    // TTS feedback
    await ttsService.speak(`Expense updated successfully. ${description} for ${numericAmount} rupees.`);

    onSave(updatedExpense);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!expense) return null;

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
            <Text style={[styles.modalTitle, { color: text }]}>Edit Expense</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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
                placeholder="Enter description"
                placeholderTextColor={secondary}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: text }]}>Category</Text>
              <View style={styles.categoriesGrid}>
                {defaultCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: selectedCategory === category.id ? category.color + '30' : card,
                        borderColor: selectedCategory === category.id ? category.color : secondary,
                      }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={24}
                      color={selectedCategory === category.id ? category.color : secondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: selectedCategory === category.id ? category.color : text,
                          fontWeight: selectedCategory === category.id ? '600' : '400'
                        }
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { backgroundColor: secondary }]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton, { backgroundColor: success }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 24,
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
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditExpenseModal;
