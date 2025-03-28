import Keycloak from 'keycloak-js';

// Keycloak initialization options
const initOptions = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080/',
  realm: 'financial-secure-video',
  clientId: 'secure-video-client',
  onLoad: 'check-sso'
};

// Initialize Keycloak instance
const keycloak = new Keycloak(initOptions);

// Authentication service
const authService = {
  keycloak,
  
  // Initialize keycloak and return a promise
  init: () => {
    return keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256'
    });
  },
  
  // Get user profile
  getUserProfile: async () => {
    try {
      return await keycloak.loadUserProfile();
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  },
  
  // Log out
  logout: () => {
    keycloak.logout({ redirectUri: window.location.origin });
  },
  
  // Get authentication token
  getToken: () => {
    return keycloak.token;
  },
  
  // Check if user has specific role
hasRole: (role: string): boolean => {
    return keycloak.hasRealmRole(role);
},
  
  // Update token
  updateToken: (minValidity = 5) => {
    return keycloak.updateToken(minValidity);
  }
};

export default authService;