/**
 * Main App Component.
 * Uygulamanın ana bileşeni - tema, auth ve navigasyon yönetimi.
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// Context Providers
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Navigators
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

// Constants
import { COLORS } from './src/constants/theme';

// Deep Linking
import linking from './src/navigation/linking';

/**
 * Ana uygulama içeriği
 */
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        style={theme.isDark ? 'light' : 'dark'} 
        backgroundColor={theme.colors.background}
      />
      
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </>
  );
};

/**
 * Ana App bileşeni
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});