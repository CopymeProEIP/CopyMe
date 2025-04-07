/** @format */

import { useColorScheme as _useColorScheme } from 'react-native';

// This hook will always return 'light' instead of using the system's color scheme
export function useColorScheme(): 'light' | 'dark' {
  // Force light theme regardless of system setting
  return 'light';
}
