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

const OverviewScreen = () => {
  const {user} = useContext(UserContext);
  const {selectedCurrencySign} = useCurrency();  
  const {text, primary, background, success, warning, warningLight,card} = useThemeColor();
  const {t} = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();
  const { addExpense, parseVoiceInput, getTotalExpenses, expenses } = useExpenses();
  const [totalSpent, setTotalSpent] = useState('84,532.00');

  // Add error boundary for context
  if (!addExpense || !parseVoiceInput || !getTotalExpenses) {
    console.error('Expense context not properly initialized');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const data = {
    labels: ['Jan' , 'Feb' , 'March', 'Apr'],
    datasets:[
      {data: [20000,45000,28000,80000],}
    ]
  };

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

  const handleVoiceInput = async (voiceText) => {
    try {
      const parsedExpense = parseVoiceInput(voiceText);
      
      if (!parsedExpense.isValid) {
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
        voiceInput: voiceText
      });

      // Update total spent display
      const newTotal = getTotalExpenses();
      setTotalSpent(newTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));

      Alert.alert(
        'Expense Added!',
        `${parsedExpense.description} - ${selectedCurrencySign}${parsedExpense.amount} added to ${parsedExpense.category}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

  const handleVoiceError = (error) => {
    console.error('Voice recognition error:', error);
    Alert.alert('Voice Error', 'Failed to recognize speech. Please try again.');
  };

  useEffect(() => {
    // Update total spent when expenses change
    const newTotal = getTotalExpenses();
    setTotalSpent(newTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
  }, [expenses]);

  return (
    <ScrollView style={[styles.container, {backgroundColor: background}]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, {color: text}]}>{t('welcomeback')},</Text>
          <Text style={[styles.name, {color: text}]}>{user.name}</Text>
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
        <Text style={[styles.trend, {color: success}]}>
          ↑ {t('up')}
        </Text>
        <View style={styles.aiInsightBadge}>
          <MaterialCommunityIcons
            name="trending-up"
            size={16}
            color={success}
          />
          <Text style={[styles.aiInsightText, {color: success}]}>
            {t('positivecashflow')}
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
            <TextInput 
            style={[styles.aiAlertText, {color: warning}]}
            placeholder='Add Expenses...'
            placeholderTextColor={warningLight}
            />
            <VoiceRecorder
              onVoiceResult={handleVoiceInput}
              onError={handleVoiceError}
              iconSize={20}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <MaterialCommunityIcons
                name="google-lens"
                size={20}
                color={warning}
              />
            </TouchableOpacity>
          </View>
      </View>

      <ExpenseList maxItems={3} />

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
    </ScrollView>
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
  aiAlertText: {flex: 1, fontSize: 14, fontWeight: '500'},
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
  },
});

export default OverviewScreen;