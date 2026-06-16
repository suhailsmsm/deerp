/**
 * Theme Provider Component
 */

import React from 'react';
import { NavigationContainer, Theme } from '@react-navigation/native';

interface ThemeProviderProps {
  value: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ value, children }: ThemeProviderProps) {
  return <NavigationContainer theme={value}>{children}</NavigationContainer>;
}
