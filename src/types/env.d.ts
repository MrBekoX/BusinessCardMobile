// Environment variables declaration for @env module
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const APP_ENV: string | undefined;
}

// Global React Native declarations
declare const __DEV__: boolean;

// Navigation type re-exports
declare module '@react-navigation/native-stack' {
  import { NativeStackNavigationProp as OriginalNativeStackNavigationProp, createNativeStackNavigator as originalCreateNativeStackNavigator } from '@react-navigation/stack';
  export type NativeStackNavigationProp<ParamList extends Record<string, object | undefined>, RouteName extends keyof ParamList = keyof ParamList> = OriginalNativeStackNavigationProp<ParamList, RouteName>;
  export const createNativeStackNavigator: typeof originalCreateNativeStackNavigator;
}
