/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';

export const authService = {
  // Store JWT token
  setToken: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  // Get JWT token
  getToken: async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  // Remove JWT token
  removeToken: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  // Check if user is logged in
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Add auth header to requests
  authHeader: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },
};
