/**
 * Main App Component.
 * Uygulamanın ana bileşeni - tema, auth ve navigasyon yönetimi.
 * F-013 Fix: Root NavigationContainer ile deep linking aktif
 */
import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Context Providers
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Navigators (F-013: NavigationContainer kaldırıldı, sadece Navigator'lar)
import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";

// Constants
import { COLORS } from "./src/constants/theme";

// Deep Linking (F-013: Artık root NavigationContainer'da aktif)
import linking from "./src/navigation/linking";

const RootStack = createStackNavigator();

/**
 * Ana uygulama içeriği (F-013: Root NavigationContainer ile deep linking)
 */
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: theme.isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
      }}
    >
      <StatusBar
        style={theme.isDark ? "light" : "dark"}
        backgroundColor={theme.colors.background}
      />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Ana App bileşeni
 */
const App: React.FC = () => {
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

interface Styles {
  loadingContainer: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
