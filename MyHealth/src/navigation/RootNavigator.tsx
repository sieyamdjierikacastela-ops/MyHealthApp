// ─────────────────────────────────────────────────────────────
//  MyHealth — Root Navigator
//  Gère l'état auth : redirige vers Auth ou App
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

// Navigators
import AuthNavigator from './AuthNavigator';
import PatientTabNavigator from './PatientTabNavigator';

// Screens supplémentaires (post-login)
import HealthQuestionnaireScreen from '../screens/patient/HealthQuestionnaireScreen';
import SpecialitiesScreen from '../screens/patient/SpecialitiesScreen';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import DoctorProfileScreen from '../screens/patient/DoctorProfileScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import PaymentScreen from '../screens/patient/PaymentScreen';
import MedicalRecordScreen from '../screens/patient/MedicalRecordScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import EmergencyScreen from '../screens/patient/EmergencyScreen';
import RemindersScreen from '../screens/patient/RemindersScreen';
import SettingsScreen from '../screens/patient/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs principales */}
      <Stack.Screen name="MainTabs" component={PatientTabNavigator} />

      {/* Questionnaire santé (obligatoire 1ère connexion) */}
      <Stack.Screen
        name="HealthQuestionnaire"
        component={HealthQuestionnaireScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />

      {/* Consultation */}
      <Stack.Screen name="Specialities" component={SpecialitiesScreen}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Payment" component={PaymentScreen}
        options={{ animation: 'slide_from_bottom' }} />

      {/* Dossier médical */}
      <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen}
        options={{ animation: 'slide_from_right' }} />

      {/* Chat */}
      <Stack.Screen name="ChatList" component={ChatListScreen}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen}
        options={{ animation: 'slide_from_right' }} />

      {/* Urgences */}
      <Stack.Screen name="Emergency" component={EmergencyScreen}
        options={{ animation: 'slide_from_bottom' }} />

      {/* Rappels */}
      <Stack.Screen name="Reminders" component={RemindersScreen}
        options={{ animation: 'slide_from_right' }} />

      {/* Paramètres */}
      <Stack.Screen name="Settings" component={SettingsScreen}
        options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
