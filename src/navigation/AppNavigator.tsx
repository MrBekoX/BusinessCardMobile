/**
 * Main App Navigator.
 * Uygulama içi ekranları ve alt navigasyonları yönetir.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@context/ThemeContext';
import { COLORS } from '@constants/theme';
import { AppStackParamList, AppTabParamList } from '@/types/navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from '@screens/App/HomeScreen';
import CardListScreen from '@screens/App/CardListScreen';
import CardCreateScreen from '@screens/App/CardCreateScreen';
import CardDetailScreen from '@screens/App/CardDetailScreen';
import QRScannerScreen from '@screens/App/QRScannerScreen';
import CollectionsScreen from '@screens/App/CollectionsScreen';
import SettingsScreen from '@screens/App/SettingsScreen';

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// ==================== TAB NAVIGATOR ====================

const TabNavigator: React.FC = () => {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      initialRouteName="Home"
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
        tabBarStyle: {
          backgroundColor: colors.card || COLORS.light.card,
          borderTopColor: colors.border || COLORS.light.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary || COLORS.primary,
        tabBarInactiveTintColor: colors.textSecondary || COLORS.light.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Cards"
        component={CardListScreen}
        options={{
          title: 'Kartvizitlerim',
          tabBarIcon: ({ color, size }) => (
            <Icon name="business" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          title: 'QR Tara',
          tabBarIcon: ({ color, size }) => (
            <Icon name="qr-code-scanner" size={size} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
          },
        }}
      />
      
      <Tab.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          title: 'Koleksiyonlar',
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ==================== MAIN STACK NAVIGATOR ====================

const AppNavigator: React.FC = () => {
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
          name="MainTabs"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="CardCreate"
          component={CardCreateScreen}
          options={{
            title: 'Yeni Kartvizit',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="CardDetail"
          component={CardDetailScreen}
          options={{
            title: 'Kartvizit Detayı',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
