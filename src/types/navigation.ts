import { NavigatorScreenParams } from '@react-navigation/native';

// ==================== AUTH STACK ====================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

// ==================== APP STACK ====================

export type AppTabParamList = {
  Home: undefined;
  Cards: undefined;
  QRScanner: undefined;
  Collections: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
  CardDetail: { cardId: string };
  CardCreate: { editCardId?: string } | undefined;
  CollectionDetail: { collectionId: string };
};

// ==================== ROOT ====================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

// ==================== SCREEN PROPS ====================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
