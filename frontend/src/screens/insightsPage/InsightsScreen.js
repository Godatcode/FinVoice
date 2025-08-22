import { GEMINI_API_KEY } from '@env';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from '../../components/Card';
import { useThemeColor } from '../../context/ThemeProvider';
import { useRoute } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export default function InsightsScreen() {
  const { t } = useTranslation();
  const { text, background, primary, success, warning, error, secondary } = useThemeColor();
  const route = useRoute();
  const { budgetData } = route.params || { budgetData: null };
  const { language } = useLanguage();

  const [financialScore, setFinancialScore] = useState(null);
  const [spendingAnalysis, setSpendingAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (budgetData) {
      processBudgetWithGemini(budgetData);
    } else {
      setErrorMsg(t('noBudgetError'));
    }
  }, [budgetData]);

  const processBudgetWithGemini = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setFinancialScore(null);
    setSpendingAnalysis(null);
    setRecommendations([]);

    const prompt = `Critically analyze the following budget data and provide your response in two parts, separated by '***RECOMMENDATIONS*** ':

Part 1: Financial Score and Spending Analysis as a JSON object with the following keys:
{
  "financialScore": An integer from 0-100,
  "spendingAnalysis": [
    { "category": "Food", "budgeted": 2000, "spent": 2500, "percentage": 125 },
    ...
  ]
}

***RECOMMENDATIONS***

Part 2: Actionable recommendations as a plain text list. Wrap important words or actions with double asterisks (e.g., **Reduce spending**) Just give 3 to 4 interesting, precise and actionable recommendations give the response in ${language}.

Budget Data:
Total Budget: ₹${data.total}
Total Spent: ₹${data.spent}
Remaining: ₹${parseFloat(data.total) - parseFloat(data.spent)}

Spending Categories:
${data.categories.map(cat => `- ${cat.name}: Budgeted ₹${cat.budgeted}, Spent ₹${cat.spent}`).join('\n')}
`;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        setErrorMsg(`Gemini error: ${response.status}`);
        return;
      }

      const responseData = await response.json();
      const outputText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!outputText) {
        setErrorMsg(t('invalidResponse'));
        return;
      }

      const [jsonPartRaw, recommendationsPart] = outputText.split('***RECOMMENDATIONS***');

      if (!jsonPartRaw || !recommendationsPart) {
        setErrorMsg(t('invalidResponseFormat'));
        return;
      }

      let jsonPart = jsonPartRaw.trim().replace(/^```json/, '').replace(/```$/, '').trim();

      try {
        const parsed = JSON.parse(jsonPart);
        setFinancialScore(parsed.financialScore);

        const analysisMap = parsed.spendingAnalysis.reduce((acc, item) => {
          acc[item.category] = {
            budgeted: item.budgeted,
            spent: item.spent,
            percentage: item.percentage,
          };
          return acc;
        }, {});
        setSpendingAnalysis(analysisMap);

        const recList = recommendationsPart
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
        setRecommendations(recList);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        setErrorMsg(t('parseError'));
      }
    } catch (err) {
      console.error('API Request Failed:', err);
      setErrorMsg(t('apiError'));
    } finally {
      setLoading(false);
    }
  };

  const getColorForCategory = (label) => {
    const name = label?.replace(/\*\*/g, '').trim().toLowerCase();
    if (name.includes('food')) return primary;
    if (name.includes('transportation')) return secondary;
    if (name.includes('entertainment')) return warning;
    if (name.includes('utilities')) return secondary;
    if (name.includes('shopping')) return error;
    return '#888';
  };

  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {part.slice(2, -2)}
          </Text>
        );
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>{t('aiInsights')}</Text>
        <Text style={[styles.subtitle, { color: text }]}>{t('financialHealthReport')}</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, { color: text }]}>{t('fetchingInsights')}</Text>
        </View>
      )}

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {!loading && financialScore !== null && spendingAnalysis && recommendations.length > 0 ? (
        <>
          <Card style={styles.scoreCard}>
            <Text style={[styles.scoreLabel, { color: text }]}>{t('financialHealthScore')}</Text>
            <Text
              style={[
                styles.scoreValue,
                {
                  color:
                    financialScore > 70 ? success : financialScore > 50 ? warning : error,
                },
              ]}
            >
              {financialScore}
            </Text>
            <Text style={[styles.scoreTrend, { color: text }]}>{t('basedonaiAnalysis')}</Text>
          </Card>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: text }]}>{t('spendingAnalysis')}</Text>
            <Card style={styles.chartCard}>
              {Object.entries(spendingAnalysis).map(([label, value]) => (
                <View key={label} style={styles.spendingItem}>
                  <View style={styles.spendingHeader}>
                    <Text style={[styles.spendingLabel, { color: text }]}>
                      {t(label.replace(/\*\*/g, '').trim())}
                    </Text>
                    <Text style={[styles.spendingValue, { color: getColorForCategory(label) }]}>
                      {value.percentage}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${parseFloat(value.percentage) || 0}%`,
                          backgroundColor: getColorForCategory(label),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: text }]}>{t('aiRecommendations')}</Text>
            {recommendations.map((rec, idx) => (
              <Card key={idx} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={[styles.recommendationTitle, { color: primary }]}>
                    💡 {t('recommendation')} {idx + 1}
                  </Text>
                </View>
                <Text style={[styles.recommendationText, { color: text }]}>
                  {renderFormattedText(rec)}
                </Text>
              </Card>
            ))}
          </View>
        </>
      ) : !loading && !errorMsg ? (
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>{t('noInsights')}</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, opacity: 0.7, marginTop: 4 },
  loadingIndicator: { marginTop: 40 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 40, fontSize: 16 },
  scoreCard: { margin: 24, marginTop: 0, alignItems: 'center' },
  scoreLabel: { fontSize: 16, opacity: 0.7, marginBottom: 8 },
  scoreValue: { fontSize: 48, fontWeight: 'bold' },
  scoreTrend: { fontSize: 14, marginTop: 8 },
  section: { padding: 24, paddingTop: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  chartCard: { padding: 16 },
  spendingItem: { marginBottom: 16 },
  spendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spendingLabel: { fontSize: 16, fontWeight: '500' },
  spendingValue: { fontSize: 16, fontWeight: 'bold' },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  recommendationCard: { marginBottom: 16, padding: 16 },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: { fontSize: 16, fontWeight: 'bold' },
  recommendationText: { fontSize: 15, lineHeight: 22 },
  infoCard: { margin: 24, padding: 16 },
  infoText: { fontSize: 16, textAlign: 'center' },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
