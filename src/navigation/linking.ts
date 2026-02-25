/**
 * Deep Linking Configuration.
 * Uygulama içi ve harici bağlantıları yönetir.
 */
import { Linking } from 'react-native';
import { LinkingOptions, PathConfigMap } from '@react-navigation/native';
import Settings from '@config/settings';
import { RootStackParamList } from '@/types/navigation';
import { Logger } from '@lib/logger';

const logger = new Logger('Linking');

// ==================== TYPES ====================

interface ParsedDeepLink {
  route: string;
  params?: Record<string, unknown>;
}

interface DeepLinkConfig {
  screens: PathConfigMap<RootStackParamList>;
}

interface NavigationLike {
  navigate: (route: string, params?: Record<string, unknown>) => void;
}

// ==================== LINKING CONFIG ====================

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: Settings.deepLinking.prefixes,
  
  config: {
    screens: {
      // Auth Navigator
      Auth: {
        screens: {
          Login: 'auth/login',
          Register: 'auth/register',
          ResetPassword: 'auth/reset-password',
        },
      },
      
      // App Navigator
      App: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Cards: 'cards',
              QRScanner: 'qr-scanner',
              Collections: 'collections',
              Settings: 'settings',
            },
          },
          CardCreate: 'card/create',
          CardDetail: {
            path: 'card/:cardId',
            parse: {
              cardId: (cardId: string): string => `${cardId}`,
            },
          },
        },
      },
    },
  } as DeepLinkConfig,
  
  // Custom getInitialURL implementation
  async getInitialURL(): Promise<string | null> {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    
    if (url != null) {
      return url;
    }
    
    // Check if there is a deep link from Firebase Dynamic Links
    // This would be implemented if using Firebase
    
    return null;
  },
  
  // Custom subscribe implementation
  subscribe(listener: (url: string) => void): () => void {
    const onReceiveURL = ({ url }: { url: string }): void => listener(url);
    
    // Listen to incoming links from deep linking
    const subscription = Linking.addEventListener('url', onReceiveURL);
    
    // Listen to Firebase Dynamic Links (if implemented)
    
    return (): void => {
      // Clean up the event listeners
      subscription?.remove();
    };
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validates UUID format
 * Prevents path traversal and malformed UUID attacks
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitizes input to prevent injection attacks
 */
const sanitizeInput = (input: string): string => {
  // Remove any potentially dangerous characters
  return input.replace(/[<>\"'%;()&+]/g, '');
};

export const deepLinkUtils = {
  /**
   * Generate deep link for a card
   */
  generateCardLink: (cardId: string): string => {
    if (!isValidUUID(cardId)) {
      logger.warn('Invalid cardId for link generation', { cardId });
      return `${Settings.deepLinking.scheme}://home`;
    }
    return `${Settings.deepLinking.scheme}://card/${cardId}`;
  },

  /**
   * Generate deep link for sharing
   */
  generateShareLink: (cardId: string): string => {
    if (!isValidUUID(cardId)) {
      logger.warn('Invalid cardId for share link', { cardId });
      return 'https://cardvault.app/home';
    }
    return `https://cardvault.app/card/${cardId}`;
  },

  /**
   * Parse deep link to extract route information
   * Validates all input parameters to prevent injection attacks
   */
  parseDeepLink: (url: string): ParsedDeepLink | null => {
    if (!url) {
      logger.warn('Empty deep link URL');
      return null;
    }

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      // Parse card route with UUID validation
      if (path.startsWith('/card/')) {
        const segments = path.split('/');
        const cardId = segments[2];

        // Validate UUID format before using
        if (!cardId || !isValidUUID(cardId)) {
          logger.warn('Invalid cardId format in deep link', { cardId, path });
          return null;
        }

        return {
          route: 'CardDetail',
          params: { cardId: sanitizeInput(cardId) },
        };
      }

      // Parse auth routes - whitelist validation
      if (path.startsWith('/auth/')) {
        const segments = path.split('/');
        const authRoute = sanitizeInput(segments[2] || '');

        // Whitelist of valid auth routes
        const routeMap: Record<string, string> = {
          'login': 'Login',
          'register': 'Register',
          'reset-password': 'ResetPassword',
        };

        const validRoute = routeMap[authRoute];
        if (!validRoute) {
          logger.warn('Unknown auth route in deep link', { authRoute, path });
          // Default to login instead of returning null for better UX
          return {
            route: 'Login',
          };
        }

        return {
          route: validRoute,
        };
      }

      // Unknown route - log and return null
      logger.warn('Unknown deep link path', { path });
      return null;
    } catch (error) {
      logger.error('Parse deep link error', error);
      return null;
    }
  },
  
  /**
   * Handle incoming deep link
   */
  handleDeepLink: (url: string, navigation: NavigationLike): void => {
    const parsed = deepLinkUtils.parseDeepLink(url);
    
    if (parsed && parsed.route) {
      navigation.navigate(parsed.route, parsed.params);
    }
  },
};

export default linking;
