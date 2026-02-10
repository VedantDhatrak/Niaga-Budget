import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import PersonalizationScreen from './src/screens/PersonalizationScreen';
import CreateBudgetScreen from './src/screens/CreateBudgetScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { Colors } from './src/theme/colors';
import { AuthProvider } from './src/context/AuthContext';

import { ServerStatusProvider } from './src/context/ServerStatusProvider';

const Stack = createNativeStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const isDark = scheme === 'dark';
  const customColors = isDark ? Colors.dark : Colors.light;

  return (
    <ServerStatusProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Personalization" component={PersonalizationScreen} />
              <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
              <Stack.Screen name="MainApp" component={TabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </ServerStatusProvider>
  );
}
