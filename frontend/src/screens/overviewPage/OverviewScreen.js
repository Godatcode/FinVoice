import {useState, useEffect, useContext} from 'react';
import {StyleSheet,View,Text,ScrollView,TouchableOpacity,Platform,Dimensions,TextInput,Alert} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Card} from '../../components/Card';
import {BarChart} from 'react-native-chart-kit';
import { UserContext } from '../../context/UserContext';
import { useThemeColor } from '../../context/ThemeProvider';
import { useCurrency } from '../../context/CurrencyContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import VoiceRecorder from '../../components/VoiceRecorder';
import ExpenseList from '../../components/ExpenseList';
import AddExpenseModal from '../../components/AddExpenseModal';
import ttsService from '../../services/TTSService';
import ExpenseNotification from '../../components/ExpenseNotification';
import { voiceAPI } from '../../services/apiService';
import { useLanguage } from '../../context/LanguageContext';

const OverviewScreen = () => {
  const {user, isLocalUser} = useContext(UserContext);
  const {selectedCurrencySign} = useCurrency();  
  const {text, primary, background, success, warning, warningLight,card} = useThemeColor();
  const {t} = useTranslation();
  const {language} = useLanguage();
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();
  const { addExpense, parseVoiceInput, getTotalExpenses, expenses } = useExpenses();
  const [totalSpent, setTotalSpent] = useState('84,532.00');
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedExpense, setLastAddedExpense] = useState(null);
  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);

  // Add error boundary for context
  if (!addExpense || !parseVoiceInput || !getTotalExpenses) {
    console.error('Expense context not properly initialized');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Generate real-time chart data from expenses
  const generateChartData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get last 4 months of data
    const months = [];
    const data = [];
    
    for (let i = 3; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      });
      
      const total = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      months.push(new Date(year, month).toLocaleDateString('en-US', { month: 'short' }));
      data.push(total);
    }
    
    return {
      labels: months,
      datasets: [{ data }]
    };
  };

  const [data, setData] = useState(generateChartData());

  const chartConfig = {
    backgroundColor: card,
    backgroundGradientFrom: card,
    backgroundGradientTo: card,
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => text,
    fillShadowGradient: '#6200EE',        
    fillShadowGradientOpacity: 1,  
    style: {
      borderRadius: 16,
    },
  };

  const handleAnalyzeInvestmentOptions = () => {
    navigation.navigate('Invest');
  };

  const handleVoiceError = (error) => {
    console.error('Voice input error:', error);
    ttsService.voiceError('general');
    Alert.alert('Voice Error', 'Failed to process voice input. Please try again.');
  };

  const handleVoiceInput = async (voiceText) => {
    try {
      console.log('🎤 Processing voice input:', voiceText);
      
      // Check if this is a manual input request
      if (voiceText === 'MANUAL_INPUT_REQUESTED') {
        console.log('📝 Manual input requested, opening expense modal');
        setAddExpenseModalVisible(true);
        return;
      }
      
      // Try to use backend voice processing first
      let parsedExpense;
      try {
        const backendResult = await voiceAPI.processVoiceInput(voiceText, language);
        if (backendResult.success) {
          parsedExpense = {
            amount: backendResult.data.amount,
            description: backendResult.data.description,
            category: backendResult.data.category,
            isValid: true
          };
        } else {
          throw new Error('Backend processing failed');
        }
      } catch (backendError) {
        console.warn('Backend voice processing failed, using local fallback:', backendError);
        // Fallback to local parsing
        parsedExpense = parseVoiceInput(voiceText);
      }
      
      if (!parsedExpense.isValid) {
        ttsService.voiceError('invalid_input');
        Alert.alert(
          'Invalid Input',
          'Please try again with a clear amount and description. Example: "Add dinner 7300"',
          [{ text: 'OK' }]
        );
        return;
      }

      const newExpense = await addExpense({
        amount: parsedExpense.amount,
        description: parsedExpense.description,
        category: parsedExpense.category,
        voice_input: voiceText
      });

      // Update total spent display
      const newTotal = getTotalExpenses();
      setTotalSpent(newTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));

      // Voice confirmation
      await ttsService.confirmExpense({
        description: parsedExpense.description,
        amount: parsedExpense.amount,
        category: parsedExpense.category
      });

      // Show notification
      setLastAddedExpense(newExpense);
      setShowNotification(true);

      // Show success feedback
      Alert.alert(
        'Expense Added Successfully!',
        `${parsedExpense.description}\n${selectedCurrencySign}${parsedExpense.amount}\nCategory: ${parsedExpense.category}`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Announce new total after alert is dismissed
            setTimeout(() => {
              ttsService.announceTotal(newTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
            }, 500);
          }
        }]
      );

    } catch (error) {
      console.error('Error adding expense:', error);
      ttsService.voiceError('general');
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };



  useEffect(() => {
    // Update total spent when expenses change
    const newTotal = getTotalExpenses();
    setTotalSpent(newTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
    
    // Force chart re-render when expenses change
    setData(generateChartData());
  }, [expenses]);

  return (
    <View style={[styles.container, {backgroundColor: background}]}>
      {/* Real-time notification */}
      <ExpenseNotification
        visible={showNotification}
        expense={lastAddedExpense}
        onClose={() => setShowNotification(false)}
        currencySign={selectedCurrencySign}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, {color: text}]}>{t('welcomeback')},</Text>
          <Text style={[styles.name, {color: text}]}>{user.name}</Text>
          {isLocalUser() && (
            <View style={[styles.offlineIndicator, { backgroundColor: warning + '20', borderColor: warning }]}>
              <MaterialCommunityIcons name="wifi-off" size={12} color={warning} />
              <Text style={[styles.offlineText, { color: warning }]}>Offline Mode</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.aiButton, {backgroundColor: primary}]}
          onPress={() => navigation.navigate('AIAssistant')}>
          <MaterialCommunityIcons name="robot" size={20} color="white" />
          <Text style={styles.aiButtonText}>{t('aiass')}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={[styles.balanceLabel, {color: text}]}>{t('Total Spent')}</Text>
        <Text style={[styles.balanceAmount, {color: text}]}>{selectedCurrencySign}{totalSpent}</Text>



        
        {/* Real-time expense counter */}
        <View style={styles.expenseCounter}>
          <MaterialCommunityIcons
            name="chart-line"
            size={16}
            color={primary}
          />
          <Text style={[styles.expenseCounterText, {color: primary}]}>
            {expenses.length} expenses tracked
          </Text>
        </View>
      </Card>

      <View style={styles.section}>

        <Card>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, marginBottom: 5, fontWeight: 'bold' , color: text }}>{t('monthlyexpenses')}</Text>
            <BarChart
            data={data}
            height={200}
            width={screenWidth}
            chartConfig={chartConfig}
            style={{
              transform: [{scale:0.89}],
              alignSelf: 'center'
             }}
            />
          </View>
        </Card>
        <View
            style={[
              styles.aiAlert,
              {borderColor: warning},
            ]}>
            <TouchableOpacity 
              style={[styles.aiAlertText, {color: warning}]}
              onPress={() => {
                if (isLocalUser()) {
                  Alert.alert(
                    'Offline Mode',
                    'You are currently in offline mode. Expenses will be saved locally only. Would you like to log in again to sync with the server?',
                    [
                      { text: 'Continue Offline', onPress: () => setAddExpenseModalVisible(true) },
                      { text: 'Log In Again', onPress: () => navigation.navigate('Login') }
                    ]
                  );
                } else {
                  setAddExpenseModalVisible(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.aiAlertText, {color: warning}]}>
                📝 Add Expenses...
              </Text>
            </TouchableOpacity>
            <VoiceRecorder
              onVoiceResult={handleVoiceInput}
              onError={handleVoiceError}
              iconSize={20}
              style={styles.cameraButton}
            />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => {
                // TODO: Implement camera functionality for expense scanning
                Alert.alert('Camera Feature', 'Camera functionality coming soon!');
              }}
            >
              <MaterialCommunityIcons
                name="google-lens"
                size={20}
                color={warning}
              />
            </TouchableOpacity>
          </View>
      </View>

      <ExpenseList 
        maxItems={3} 
        onAddExpensePress={() => {
          if (isLocalUser()) {
            Alert.alert(
              'Offline Mode',
              'You are currently in offline mode. Expenses will be saved locally only. Would you like to log in again to sync with the server?',
              [
                { text: 'Continue Offline', onPress: () => setAddExpenseModalVisible(true) },
                { text: 'Log In Again', onPress: () => navigation.navigate('Login') }
              ]
            );
          } else {
            setAddExpenseModalVisible(true);
          }
        }}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: text}]}>
          {t('aiinsights')}
        </Text>

        <Card style={[styles.insightCard, {borderLeftColor: primary}]}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={24}
              color={primary}
            />
            <Text style={[styles.insightTitle, {color: primary}]}>
              {t('invest')}
            </Text>
          </View>
          <Text style={[styles.insightText , {color:text}]}>
            {t('expandinvest')}
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: primary}]}
            onPress={handleAnalyzeInvestmentOptions}> {/* Call the navigation function */}
            <Text style={styles.actionButtonText}>{t('analyseoptions')}</Text>
          </TouchableOpacity>
        </Card>
              </View>
        
        {/* Add Expense Modal */}
        <AddExpenseModal
          visible={addExpenseModalVisible}
          onClose={() => setAddExpenseModalVisible(false)}
          onExpenseAdded={(newExpense) => {
            setLastAddedExpense(newExpense);
            setShowNotification(true);
          }}
        />
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {fontSize: 16, opacity: 0.8},
  name: {fontSize: 24, fontWeight: 'bold', marginTop: 4},
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    gap: 8,
  },
  aiButtonText: {color: 'white', fontWeight: '600'},
  balanceCard: {margin: 24, marginTop: 0},
  balanceLabel: {fontSize: 14, opacity: 0.7, marginBottom: 8},
  balanceAmount: {fontSize: 32, fontWeight: 'bold', marginBottom: 8},
  trend: {fontSize: 14, marginBottom: 12},
  aiInsightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00B89420',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  aiInsightText: {fontSize: 14, fontWeight: '500'},
  expenseCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  expenseCounterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {padding: 24, paddingTop: 0},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {fontSize: 20, fontWeight: 'bold'},
  moreButton: {padding: 8},
  moreButtonText: {fontSize: 14, fontWeight: '600'},
  aiAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  aiAlertText: {
    flex: 1, 
    fontSize: 14, 
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightCard: {marginBottom: 16, borderLeftWidth: 4, paddingLeft: 12},
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {fontSize: 16, fontWeight: 'bold'},
  insightText: {fontSize: 14, lineHeight: 20, opacity: 0.8, marginBottom: 12},
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonText: {color: 'white', fontSize: 14, fontWeight: '600'},
  cameraButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default OverviewScreen;