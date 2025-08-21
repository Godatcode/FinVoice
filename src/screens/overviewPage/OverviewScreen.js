import {useState, useEffect, useContext} from 'react';
import {StyleSheet,View,Text,ScrollView,TouchableOpacity,Platform,Dimensions} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Card} from '../../components/Card';
import {BarChart} from 'react-native-chart-kit';
import { UserContext } from '../../context/UserContext';
import { useThemeColor } from '../../context/ThemeProvider';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

const OverviewScreen = () => {
  const {user} = useContext(UserContext);
  const {selectedCurrencySign} = useCurrency();  
  const {text, primary, background, success, warning, error,card} = useThemeColor();
  const {t} = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();

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
        <Text style={[styles.balanceLabel, {color: text}]}>{t('Total Balance')}</Text>
        <Text style={[styles.balanceAmount, {color: text}]}>{selectedCurrencySign}84,532.00</Text>
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: text}]}>
            {t('cashflow')}
          </Text>
        </View>

        <Card>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: 'bold' , color: text }}>{t('monthlyexpenses')}</Text>
            <BarChart
            data={data}
            height={220}
            width={screenWidth}
            chartConfig={chartConfig}
            style={{
              transform: [{scale:0.89}],
              alignSelf: 'center'
             }}
            />
          </View>
          <View
            style={[
              styles.aiAlert,
              {backgroundColor: warning + '20', borderColor: warning},
            ]}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color={warning}
            />
            <Text style={[styles.aiAlertText, {color: warning}]}>
              {t('cashflowdip')}
            </Text>
          </View>
        </Card>
      </View>

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
});

export default OverviewScreen;