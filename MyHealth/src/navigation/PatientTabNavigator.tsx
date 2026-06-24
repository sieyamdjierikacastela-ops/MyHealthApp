// ─────────────────────────────────────────────────────────────
//  MyHealth — Patient Tab Navigator
//  Barre de navigation principale du patient
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Shadows, Typography } from '../theme';
import { BottomTabParamList } from './types';

// Screens
import HomeScreen from '../screens/patient/HomeScreen';
import AppointmentsScreen from '../screens/patient/AppointmentsScreen';
import MedicalScreen from '../screens/patient/MedicalScreen';
import MapScreen from '../screens/patient/MapScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ── Icônes SVG simples (pas de dépendance externe) ───────────
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Appointments: '📅', Medical: '📋', Map: '🗺️', Profile: '👤',
  };
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Text style={styles.iconEmoji}>{icons[name]}</Text>
    </View>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused && styles.labelActive]}>
      {label}
    </Text>
  );
}

export default function PatientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Accueil" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Appointments" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Rendez-vous" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Medical"
        component={MedicalScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Medical" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Dossier" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Map" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Carte" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Profil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...Shadows.md,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryOverlay,
  },
  iconEmoji: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
