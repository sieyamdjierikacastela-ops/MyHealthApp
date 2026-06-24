// ─────────────────────────────────────────────────────────────
//  MyHealth — App.tsx
//  Point d'entrée principal de l'application
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import PatientTabNavigator from './src/navigation/PatientTabNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from './src/theme';

// ── Composant interne qui lit l'état auth ─────────────────────
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <PatientTabNavigator /> : <AuthNavigator />;
}

// ── App racine ────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
