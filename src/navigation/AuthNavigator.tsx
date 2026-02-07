/**
 * Authentication Navigator.
 * Giriş, kayıt ve şifre sıfırlama ekranlarını yönetir.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@context/ThemeContext';
import { COLORS } from '@constants/theme';
import { AuthStackParamList } from '@/types/navigation';

// Import screens
import LoginScreen from '@screens/Auth/LoginScreen';
import RegisterScreen from '@screens/Auth/RegisterScreen';
import ResetPasswordScreen from '@screens/Auth/ResetPasswordScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const theme = useTheme();
  const colors = theme.colors;

  const navigationTheme: Theme = {
    colors: {
      primary: colors.primary || COLORS.primary,
      background: colors.background || COLORS.light.background,
      card: colors.card || COLORS.light.card,
      text: colors.text || COLORS.light.text,
      border: colors.border || COLORS.light.border,
      notification: colors.error || COLORS.light.error,
    },
    dark: theme.isDark,
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar 
        style={theme.isDark ? 'light' : 'dark'} 
        backgroundColor={colors.background || COLORS.light.background}
      />
      
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background || COLORS.light.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.text || COLORS.light.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          cardStyle: {
            backgroundColor: colors.background || COLORS.light.background,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Hesap Oluştur',
            headerShown: true,
          }}
        />
        
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            title: 'Şifre Sıfırlama',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;
