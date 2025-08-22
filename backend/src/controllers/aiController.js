const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.warn('⚠️ Gemini AI initialization failed:', error.message);
}

// Get financial insights based on user data
const getFinancialInsights = async (req, res) => {
  try {
    const { budgetData, expenseData, language = 'en' } = req.body;
    const userId = req.userId;

    if (!budgetData || !expenseData) {
      return res.status(400).json({
        error: 'Missing data',
        message: 'Budget data and expense data are required'
      });
    }

    // Create language-specific prompt
    const languagePrompts = {
      'en': 'Analyze this financial data and provide insights in English:',
      'hi': 'इस वित्तीय डेटा का विश्लेषण करें और हिंदी में अंतर्दृष्टि प्रदान करें:',
      'bn': 'এই আর্থিক তথ্য বিশ্লেষণ করুন এবং বাংলায় অন্তর্দৃষ্টি প্রদান করুন:',
      'or': 'ଏହି ଆର୍ଥିକ ତଥ୍ୟ ବିଶ୍ଳେଷଣ କରନ୍ତୁ ଏବଂ ଓଡ଼ିଆରେ ଅନ୍ତର୍ଦୃଷ୍ଟି ପ୍ରଦାਨ କରନ୍ତୁ:',
      'pa': 'ਇਸ ਵਿੱਤੀ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ ਅਤੇ ਪੰਜਾਬੀ ਵਿੱਚ ਅੰਤਰਦ੍ਰਿਸ਼ਟੀ ਪ੍ਰਦਾਨ ਕਰੋ:',
      'kn': 'ಈ ಆರ್ಥಿಕ ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಒಳನೋಟಗಳನ್ನು ನೀಡಿ:',
      'mar': 'या आर्थिक डेटाचे विश्लेषण करा आणि मराठीत अंतर्दृष्टी द्या:'
    };

    // Check if Gemini AI is available
    if (!genAI) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured. Please check your API key configuration.',
        fallback: {
          financialScore: 75,
          spendingAnalysis: {
            foodDining: '25%',
            transportation: '15%',
            entertainment: '20%',
            utilities: '10%',
            shopping: '20%',
            other: '10%'
          },
          recommendations: [
            'Track your daily expenses to identify spending patterns',
            'Set realistic budget limits for each category',
            'Consider using cash for discretionary spending',
            'Review and adjust your budget monthly'
          ]
        }
      });
    }

    const prompt = `${languagePrompts[language] || languagePrompts['en']}

Budget Data:
Total Budget: ₹${budgetData.total}
Total Spent: ₹${budgetData.spent}
Remaining: ₹${parseFloat(budgetData.total) - parseFloat(budgetData.spent)}

Spending Categories:
${budgetData.categories.map(cat => `- ${cat.name}: Budgeted ₹${cat.budgeted}, Spent ₹${cat.spent}`).join('\n')}

Please provide:
1. Financial Health Score (0-100)
2. Spending Analysis with percentages
3. 3-4 actionable recommendations

Format the response as JSON for the first two parts, separated by '***RECOMMENDATIONS***' for the third part.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the response
    const [jsonPart, recommendationsPart] = response.split('***RECOMMENDATIONS***');
    
    let insights;
    try {
      const cleanJson = jsonPart.replace(/```json/g, '').replace(/```/g, '').trim();
      insights = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({
        error: 'AI response parsing failed',
        message: 'Failed to parse AI response'
      });
    }

    res.json({
      success: true,
      data: {
        financialScore: insights.financialScore,
        spendingAnalysis: insights.spendingAnalysis,
        recommendations: recommendationsPart?.trim().split('\n').filter(Boolean) || []
      }
    });

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate financial insights'
    });
  }
};

// Get investment advice based on user profile
const getInvestmentAdvice = async (req, res) => {
  try {
    const { age, futurePlans, income, language = 'en' } = req.body;
    const userId = req.userId;

    if (!age || !futurePlans || !income) {
      return res.status(400).json({
        error: 'Missing data',
        message: 'Age, future plans, and income are required'
      });
    }

    // Create language-specific prompt
    const languagePrompts = {
      'en': 'Based on your details, provide investment advice in English:',
      'hi': 'आपकी जानकारी के आधार पर, हिंदी में निवेश सलाह दें:',
      'bn': 'আপনার বিবরণের উপর ভিত্তি করে, বাংলায় বিনিয়োগের পরামর্শ দিন:',
      'or': 'ଆପଣଙ୍କ ବିବରଣୀ ଆଧାରରେ, ଓଡ଼ିଆରେ ନିବେଶ ପରାମର୍ଶ ଦିଅନ୍ତୁ:',
      'pa': 'ਹੇ ਸਮਾਰਟ ਨਿਵੇਸ਼ਕ! ਤੁਹਾਡੇ ਵੇਰਵਿਆਂ ਦੇ ਆਧਾਰ ਤੇ:',
      'kn': 'ನಿಮ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ, ಕನ್ನಡದಲ್ಲಿ ಹೂಡಿಕೆ ಸಲಹೆ ನೀಡಿ:',
      'mar': 'तुमच्या तपशीलांच्या आधारे, मराठीत गुंतવણूक सल्ला द्या:'
    };

    // Check if Gemini AI is available
    if (!genAI) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured. Please check your API key configuration.',
        fallback: {
          investmentAdvice: [
            '**Mutual Funds**: Start with SIPs in diversified equity funds for long-term wealth building',
            '**Fixed Deposits**: Consider high-yield FDs for stable returns and capital preservation',
            '**Gold ETFs**: Invest in digital gold for portfolio diversification and inflation hedge'
          ],
          rawResponse: 'AI service unavailable - using fallback investment advice'
        }
      });
    }

    let prompt = `${languagePrompts[language] || languagePrompts['en']}

Age: ${age}
Future Goals: ${futurePlans}
Annual Income: ₹${income}

Provide 2-3 exciting and concise investment ideas as bullet points. For each idea, briefly explain why it could be a good fit, and make sure to **bold** the key investment terms. Format it nicely for reading!`;

    if (language === 'pa') {
      prompt = 'ਹੇ ਸਮਾਰਟ ਨਿਵੇਸ਼ਕ! ਤੁਹਾਡੇ ਵੇਰਵਿਆਂ ਦੇ ਆਧਾਰ \'ਤੇ:\n' +
        'ਉਮਰ: ' + age + '\n' +
        'ਭਵਿੱਖ ਦੀਆਂ ਯੋਜਨਾਵਾਂ: ' + futurePlans + '\n' +
        'ਸਾਲਾਨਾ ਆਮਦਨ: ₹' + income + '\n\n' +
        'ਮੈਨੂੰ 2-3 ਸੁਪਰ ਦਿਲਚਸਪ ਅਤੇ ਸੰਖੇਪ ਨਿਵੇਸ਼ ਵਿਚਾਰ ਬੁਲੇਟ ਪੁਆਇੰਟਾਂ ਵਿੱਚ ਦੱਸੋ। ਉਹਨਾਂ ਨੂੰ ਦਿਲਚਸਪ ਅਤੇ ਸਮਝਣ ਵਿੱਚ ਆਸਾਨ ਬਣਾਉ। ਹਰੇਕ ਵਿਚਾਰ ਲਈ, ਸੰਖੇਪ ਵਿੱਚ ਦੱਸੋ ਕਿ ਇਹ ਇੱਕ ਵਧੀਆ ਵਿਕਲਪ ਕਿਉਂ ਹੋ ਸਕਦਾ ਹੈ, ਅਤੇ **ਮੁੱਖ ਨਿਵੇਸ਼ ਸ਼ਬਦਾਂ** ਨੂੰ ਇਸ ਤਰ੍ਹਾਂ ਬੋਲਡ ਕਰਨਾ ਯਕੀਨੀ ਬਣਾਓ। ਇਸਨੂੰ ਪੜ੍ਹਨ ਲਈ ਵਧੀਆ ਢੰਗ ਨਾਲ ਫਾਰਮੈਟ ਕਰੋ!';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract bullet points
    const points = response.split('\n')
      .filter(line => line.trim().startsWith('* '))
      .map(point => point.substring(2).trim());

    res.json({
      success: true,
      data: {
        investmentAdvice: points,
        rawResponse: response
      }
    });

  } catch (error) {
    console.error('Investment advice error:', error);
    res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate investment advice'
    });
  }
};

module.exports = {
  getFinancialInsights,
  getInvestmentAdvice
};
