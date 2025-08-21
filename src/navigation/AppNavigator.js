import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AIAssistantScreen from '../screens/overviewPage/AIAssistant';
import Invest from '../screens/overviewPage/Invest';
import { LoginScreen,OverviewScreen,PayScreen,BudgetScreen,InsightsScreen,ProfileNavigator } from '../screens';
import { useThemeColor } from '../context/ThemeProvider';
import { useContext} from 'react';
import { AuthContext, AuthProvider } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const OverviewIcon = ({ color, size , focused}) => (
  <MaterialCommunityIcons 
  name={focused ? "view-dashboard" : "view-dashboard-outline"}
  size={size} color={color} />
);

const BudgetIcon = ({ color, size, focused }) => (
  <MaterialCommunityIcons 
  name={focused ? "wallet" : "wallet-outline"}  
  size={size} color={color} />
);

const PayIcon = ({ color, size }) => (
  <MaterialCommunityIcons 
  name="qrcode-scan" 
  size={size} color={color} />
);

const InsightsIcon = ({ color, size }) => (
  <MaterialCommunityIcons 
  name="chart-line" 
  size={size} color={color} />
);

const ProfileIcon = ({ color, size , focused}) => (
  <MaterialCommunityIcons 
  name={focused ? "account" : "account-outline"} 
  size={size} color={color} />
);

function TabNavigator() {
  const { primary } = useThemeColor();

  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(190, 184, 184, 0.75)',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{ tabBarIcon: OverviewIcon }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ tabBarIcon: BudgetIcon }}
      />
      <Tab.Screen
        name="Pay"
        component={PayScreen}
        options={{ tabBarIcon: PayIcon }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ tabBarIcon: InsightsIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ tabBarIcon: ProfileIcon }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn } = useContext(AuthContext);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Main' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Invest" component={Invest} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


