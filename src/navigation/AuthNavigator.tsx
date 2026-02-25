/**
 * Authentication Navigator (F-013: NavigationContainer kaldırıldı, root App.js'de)
 * Giriş, kayıt ve şifre sıfırlama ekranlarını yönetir.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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

  return (
    <>
      <StatusBar 
        style={theme.isDark ? 'light' : 'dark'} 
        backgroundColor={colors.background || '#FFFFFF'}
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
    </>
  );
};

export default AuthNavigator;
