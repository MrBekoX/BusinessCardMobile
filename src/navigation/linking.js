/**
 * Deep Linking Configuration.
 * Uygulama içi ve harici bağlantıları yönetir.
 */

import Settings from '../config/settings';

const linking = {
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
            path: 'card/:id',
            parse: {
              id: (id) => `${id}`,
            },
          },
        },
      },
      
      // Deep link routes for sharing
      card: {
        path: 'card/:id',
        parse: {
          id: (id) => `${id}`,
        },
      },
      
      // Fallback route
      NotFound: '*',
    },
  },
  
  // Custom getInitialURL implementation
  async getInitialURL() {
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
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);
    
    // Listen to incoming links from deep linking
    const subscription = Linking.addEventListener('url', onReceiveURL);
    
    // Listen to Firebase Dynamic Links (if implemented)
    
    return () => {
      // Clean up the event listeners
      subscription?.remove();
    };
  },
};

// Utility functions for deep linking
export const deepLinkUtils = {
  /**
   * Generate deep link for a card
   * @param {string} cardId - Card ID
   * @returns {string} Deep link URL
   */
  generateCardLink: (cardId) => {
    return `${Settings.deepLinking.scheme}://card/${cardId}`;
  },
  
  /**
   * Generate deep link for sharing
   * @param {string} cardId - Card ID
   * @returns {string} Shareable deep link URL
   */
  generateShareLink: (cardId) => {
    return `https://cardvault.app/card/${cardId}`;
  },
  
  /**
   * Parse deep link to extract route information
   * @param {string} url - Deep link URL
   * @returns {object} Parsed route information
   */
  parseDeepLink: (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Parse card route
      if (path.startsWith('/card/')) {
        const cardId = path.split('/')[2];
        return {
          route: 'CardDetail',
          params: { id: cardId },
        };
      }
      
      // Parse auth routes
      if (path.startsWith('/auth/')) {
        const authRoute = path.split('/')[2];
        return {
          route: authRoute === 'login' ? 'Login' : 
                 authRoute === 'register' ? 'Register' : 
                 authRoute === 'reset-password' ? 'ResetPassword' : null,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Parse deep link error:', error);
      return null;
    }
  },
  
  /**
   * Handle incoming deep link
   * @param {string} url - Deep link URL
   * @param {object} navigation - Navigation object
   */
  handleDeepLink: (url, navigation) => {
    const parsed = deepLinkUtils.parseDeepLink(url);
    
    if (parsed && parsed.route) {
      navigation.navigate(parsed.route, parsed.params);
    }
  },
};

export default linking;